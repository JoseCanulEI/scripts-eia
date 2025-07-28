// import Vue from 'vue'
// import Store from '@/store'
import {FFTJS} from './fft.mjs'
//import * as FFTW from 'fftw-js'
import * as FFTW from 'fftw-js';
import {EICalc} from './EICalc.mjs'
// import { sample } from 'lodash'
// import database from '../../store/modules/database'

let fftProcessors = {}

export const EIFFT = {
    fftProcessor: null,
    fftProcessSize: 0,
    useFFTW: true,
   
    newFFTOutput(size, realImx, phase){
        if(realImx == null){realImx = false}
        if(phase == null){phase = false}
        if(size){
            return new EIFFT.FFTOutput({
                mag: new Float32Array(size),
                real: realImx ? new Float32Array(size) : [],
                imag: realImx ? new Float32Array(size) : [],
                phase: phase ? new Float32Array(size) : []
            })
        }else{
            return new EIFFT.FFTOutput({
                mag: [],
                real: [],
                imag: [],
                phase: []
            })
        }
    },
    NearestPow2Length(length){
        if (length === 0){
            return 0
        }
        let EXP = Math.floor((Math.log(length) / Math.log(2)))
        return Math.floor(Math.pow(2, EXP)) 
    },
    getResolution(time, sampleRate){
        let samples = time * sampleRate
        let FFTlength = EIFFT.NearestPow2Length(samples / 2)
        return (sampleRate / 2) / FFTlength
    },
    ceilPow2Length(length){
        if (length === 0){
            return 0
        }
        let EXP = Math.ceil((Math.log(length) / Math.log(2)))
        return Math.ceil(Math.pow(2, EXP)) 
    },
    getFFT(data, window, sampleRate, atenuarBajas, frecuenciaAtenuacion, FFTOutput, averages, overlap, peakHold, getRealImx, getPhase, refData = null, returnReferenceData = false){
        if(atenuarBajas == null){atenuarBajas = true}
        if(frecuenciaAtenuacion == null){frecuenciaAtenuacion = 600}
        if(averages == null){averages = 1}
        if(overlap == null){overlap = 50}
        if(peakHold == null){peakHold = false}
        
        if(averages === 1){
            return this.fft(data, window, sampleRate, atenuarBajas, frecuenciaAtenuacion, FFTOutput, getRealImx, getPhase, refData, true, returnReferenceData)
        }else{
            let averageStepLength = Math.round(this.getAveragesStepLength(data.length, averages, overlap)) //Int
            let averageStep = Math.round(averageStepLength - (averageStepLength * (1 - (overlap / 100)))) //Int
            //console.log('averages: ', averageStepLength, averageStep)

            let signal = Array(averageStepLength)
            // var tempPoints = []
            var currentPosition = 0
            var sumaFFT = null
            var salidaFFT = null
            for(var i = 0; i < averages; i++){
                let averageEnd = currentPosition + averageStepLength - 1
                while (averageEnd >= data.length){
                    averageEnd -= 1
                    currentPosition -= 1
                }
                for(var l = 0; l <= averageEnd; l++){
                    signal[l - currentPosition] = data[l]
                } 
                
                salidaFFT = this.fft(signal, window, sampleRate, atenuarBajas, frecuenciaAtenuacion, FFTOutput, getRealImx, getPhase)
                if (sumaFFT === null){
                    sumaFFT = salidaFFT
                    //tempPoints = Array(salidaFFT.mag.length)
                }

                if(peakHold){
                    for(var l = 0; l < salidaFFT.mag.length; l++){
                        if(sumaFFT.mag[l] < salidaFFT.mag[l]){
                            sumaFFT.mag[l] = salidaFFT.mag[l]
                            // If Process_Phase Then
                            //     sumaFFT.Phase(l) = salidaFFT.Phase(l)
                            // End If
                        }
                    } 
                }else{
                    for(var l = 0; l < salidaFFT.mag.length; l++) {
                        sumaFFT.mag[l] += salidaFFT.mag[l]
                    }
                }
                // if (getPhase){
                //     for (var l = 0; l < salidaFFT.mag.length; l++){
                //         let temp = calcular_Punto_Vector_Rad(1, salidaFFT.phase[l])
                //         tempPoints(l).x += temp.x
                //         tempPoints(l).y += temp.y
                //     }
                // }
                 
                currentPosition += averageStep

            }

            if(peakHold === false){
                for(var i = 0; i < salidaFFT.mag.length; i++){
                    salidaFFT.mag[i] = sumaFFT.mag[i] / averages
                }
            }else{
                salidaFFT.mag = sumaFFT.mag
            }

            // if (getPhase){
            //     if (!peakHold){
            //         for (var i = 0; i < salidaFFT.mag.length; i++){
            //             salidaFFT.phase[i] = calcular_Vector_de_XY_Rad(tempPoints[i].x, tempPoints[i].y).angle
            //         }
            //     }else{
            //         salidaFFT.phase = salidaFFT.phase
            //     }
            // }
            

            return salidaFFT
                
            
        }
        
    },
    fft(data, window, sampleRate, atenuarBajas, frecuenciaAtenuacion, FFTOutput, getRealImx, getPhase, refData = null, removeDC = true, returnReferenceData = false){
      let refFFT = null
      
        if(atenuarBajas == null){atenuarBajas = true}
        if(frecuenciaAtenuacion == null){frecuenciaAtenuacion = 600}
        if(getRealImx == null){getRealImx = false}
        if(getPhase == null){getPhase = false}

        // var t0 = performance.now()
        if(FFTOutput == null){
            FFTOutput = FFTEnums.FFTOutputType.RMS
        }
        if(window == null){
            throw new TypeError("WindowType cannot be null", 'EIFFT')
        }

        

        let dataCount = this.NearestPow2Length(data.length)
        //console.log('length: ', data.length,'data count: ', dataCount)
        const output = this.newFFTOutput(dataCount/2, getRealImx, getPhase)

        let Factor_Correccion_RMS = EICalc.windowCorrectionFactor(window)
        let temp_signal = new Float32Array(data.length)
        for (var i = 0; i < data.length; i++) {
          temp_signal[i] = data[i] * Factor_Correccion_RMS * 0.975
        }
        // let temp_signal = data
        
        var processData = [] //= data
        switch (window) {
            case FFTEnums.WindowType.Rect:
                processData = this.Rect(temp_signal, dataCount)
                break;
            case FFTEnums.WindowType.Hann:
              processData = this.Hann(temp_signal, dataCount)
                break;
            case FFTEnums.WindowType.Hamming:
                processData = this.Hamming(temp_signal, dataCount)
                break;
            case FFTEnums.WindowType.Blackman:
                processData = this.Blackman(temp_signal, dataCount)
                break;
            case FFTEnums.WindowType.FlatTop:
                processData = this.FlatTop(temp_signal, dataCount)
                break;
            default:
                processData = this.Rect(temp_signal, dataCount)
                break;
        }


        //const t0 = performance.now()

        if (!this.fftProcessor ||
            this.fftProcessSize != dataCount) {

                if (this.useFFTW) {
                    if (fftProcessors[dataCount]) {
                      this.fftProcessor = fftProcessors[dataCount]
                    } else {
                      this.fftProcessor = new FFTW.FFT(dataCount)
                      fftProcessors[dataCount] = this.fftProcessor
                    }
                }
                else
                    this.fftProcessor = new FFTJS(dataCount)
            }

        let out = null
        if (this.useFFTW) {
            out = this.fftProcessor.forward(processData)
        } else {
            out = this.fftProcessor.createComplexArray()
            this.fftProcessor.realTransform(out, processData)
        }
        

        // const t1 = performance.now()
        // console.log("-------------> took", t1 - t0, "ms")

        //console.log('dataLength:', dataCount,'fft out:', out.length)


        // let inverse = this.ifft(out)
        // output.mag = inverse
        // return output

        let Factor_Norm = dataCount / 4
        if(FFTOutput === FFTEnums.FFTOutputType.P0){
            Factor_Norm = Factor_Norm / 0.707
        }else if(FFTOutput === FFTEnums.FFTOutputType.PP){
            Factor_Norm = Factor_Norm / 2
        }
        //console.log
        // for (var i = 0; i < dataCount/2; i++) {
        //     let real = out[(i * 2) + 0]
        //     let imag = out[(i * 2) + 1]
        //     output.mag[i] = Math.sqrt((real * real) + (imag * imag)) / Factor_Norm
        //     //output.mag[i] = Math.sqrt(Math.pow(out[(i * 2)],2) + Math.pow(out[(i * 2) + 1],2))
        // }
        // if(getRealImx){
        //     for (var i = 0; i < dataCount/2; i++) {
        //         let real = out[(i * 2) + 0]
        //         let imag = out[(i * 2) + 1]
        //         output.mag[i] = Math.sqrt((real * real) + (imag * imag)) / Factor_Norm
        //         output.real[i] = real
        //         output.imag[i] = imag
        //     }
        // }else{
            for (var i = 0; i < dataCount/2; i++) {
                let real = out[(i * 2) + 0]
                let imag = out[(i * 2) + 1]
                output.mag[i] = Math.sqrt((real * real) + (imag * imag)) / Factor_Norm
                if(getRealImx){
                    output.real[i] = real
                    output.imag[i] = imag
                }
                if(getPhase){
                    output.phase[i] = Math.atan2(imag, real)
                }
            }
        // }
        // var t1 = performance.now()
        // console.log("FFT Took: " + (t1 - t0) + " milliseconds for: " + dataCount + " samples")
        if(atenuarBajas){
            this.atenuarBajasFrecuencias(output.mag, frecuenciaAtenuacion, sampleRate)
        }

        if (removeDC) {
          let frecuencia = 30
          let sumador = (sampleRate * 30) / output.mag.length
          let indice = Math.floor(frecuencia / sumador)
          if (indice < 0) { indice = 0 }
          if (indice >= output.mag.length) { indice = output.mag.length - 1 }
          for (var i = indice; i >= 0; i--) {
            output.mag[i] = 0
          }
        }

        // Prueba de corrección de RMS
        // let Factor_Correccion_RMS = EICalc.windowCorrectionFactor(window)
        // for(var i = 0; i < output.mag.length; i++){
        //   output.mag[i] = output.mag[i] * Factor_Correccion_RMS * 0.975
        // }

        output.window = window
        output.sampleRate = sampleRate
        output.referenced = false
        if(refData != null && output.phase != null && output.phase.length > 0){
          let refFFT = this.fft(refData, window, sampleRate, atenuarBajas, frecuenciaAtenuacion, FFTOutput, getRealImx, getPhase)
          if(refFFT.phase.length != output.phase.length){
            console.log('Error: Reference phase length is different from output phase length', 'EIFFT')
          }
          output.originalPhase = output.phase.deepClone()
          if(refFFT != null){
            for(let i = 0; i < output.phase.length; i++){
              output.phase[i] = output.phase[i] - refFFT.phase[i]
            }
          }
          output.referenced = true
          if(returnReferenceData){
            output.refFFT = refFFT
          }else{
            output.refFFT = null
          }
          
        }
        return output
    },
    fftProcessorFFTJS: {},

    fftComplex(data){
        let out
        let dataCount = this.NearestPow2Length(data.length)
        //const output = this.newFFTOutput(dataCount/2, getRealImx)

        if (this.useFFTW && false) {
          let fftProcessor

          if (fftProcessors[dataCount]) {
            fftProcessor = fftProcessors[dataCount]
          } else {
            fftProcessor = new FFTW.FFT(dataCount)
            fftProcessors[dataCount] = fftProcessor
          }

          out = fftProcessor.forward(data)

        } else {

          let fftProcessor
          if (this.fftProcessorFFTJS[dataCount]) {
            fftProcessor = this.fftProcessorFFTJS[dataCount]
          } else {
            fftProcessor = new FFTJS(dataCount);
            this.fftProcessorFFTJS[dataCount] = fftProcessor
          }

          out = fftProcessor.createComplexArray();
          fftProcessor.realTransform(out, data);  
        }

        return out
    },
    ifft(data){
        let output

        if (this.useFFTW && false) {
          let fftProcessor

          if (fftProcessors[data.length]) {
            fftProcessor = fftProcessors[data.length]
          } else {
            fftProcessor = new FFTW.FFT(data.length)
            fftProcessors[data.length] = fftProcessor
          }

          output = fftProcessor.inverse(data)

        } else {
          let dataCount = data.length / 2

          let fftProcessor
          if (this.fftProcessorFFTJS[dataCount]) {
            fftProcessor = this.fftProcessorFFTJS[dataCount]
          } else {
            fftProcessor = new FFTJS(dataCount);
            this.fftProcessorFFTJS[dataCount] = fftProcessor
          }

          let complex = new Float32Array(data.length)
          fftProcessor.completeSpectrum(data)
          fftProcessor.inverseTransform(complex, data)
        
          output = new Float32Array(data.length / 2)
          fftProcessor.fromComplexArray(complex, output)
        }
        return output
    },

    Rect(data, dataCount){
        let FactCorr = 0.5
        //let FactCorr = 1
        // console.log('correc: ', FactCorr)
        var Salida = new Float32Array(dataCount)
        for(var n = 0; n < dataCount; n++) {
            Salida[n] = data[n] * FactCorr
        }
        return Salida
    },
    Hann(data, dataCount){
        let pi = 3.141592
        let NM1 = dataCount - 1
        let a0 = 0.5
        let a1 = 0.5
        var Salida = new Float32Array(dataCount)
        for(var n = 0; n < dataCount; n++) {
            Salida[n] = data[n] * (a0 - a1 * Math.cos((2 * pi * n) / NM1))
        }
        return Salida
    },
    Hamming(data, dataCount){
        let pi = 3.141592
        let NM1 = dataCount - 1
        let a0 = 0.53836
        let a1 = 0.46164
        var Salida = new Float32Array(dataCount)
        for(var n = 0; n < dataCount; n++) {
            Salida[n] = data[n] * (a0 - a1 * Math.cos((2 * pi * n) / NM1))
        }
        return Salida
    },
    Blackman(data, dataCount){
        let pi = 3.141592
        let NM1 = dataCount - 1
        let a0 = 0.42
        let a1 = 0.5
        let a2 = 0.08
        var Salida = new Float32Array(dataCount)
        for(var n = 0; n < dataCount; n++) {
            let F1 = a1 * Math.cos((2 * pi * n) / NM1)
            let F2 = a2 * Math.cos((4 * pi * n) / NM1)
            Salida[n] = data[n] * (a0 - F1 + F2)
        }
        return Salida
    },
    FlatTop(data, dataCount){
        let FactCorr = 0.5
        let pi = 3.141592
        let NM1 = dataCount - 1
        let a0 = 1
        let a1 = 1.93
        let a2 = 1.29
        let a3 = 0.388
        let a4 = 0.032
        var Salida = new Float32Array(dataCount)
        for(var n = 0; n < dataCount; n++) {
            let F1 = a1 * Math.cos((2 * pi * n) / NM1)
            let F2 = a2 * Math.cos((4 * pi * n) / NM1)
            let F3 = a3 * Math.cos((6 * pi * n) / NM1)
            let F4 = a4 * Math.cos((8 * pi * n) / NM1)
            Salida[n] = data[n] * (a0 - F1 + F2 - F3 + F4) * FactCorr
        }
        return Salida
    },
    atenuarBajasFrecuencias(data, Freq, sampleRate){
        
        let indFreq = (data.length / (sampleRate * 30)) * Freq
        // let indFreq = Math.round((data.length / (sampleRate * 30)) * Freq)
        let pasoFactorAtenuar = 1 / indFreq
        var factorActual = 1
        // var i = indFreq
        // while (i >= 0){
        while (indFreq >= 0){
            var i = Math.round(indFreq)
            data[i] = data[i] * factorActual
            if(data[i] < 0){
                data[i] = 0
            }
            factorActual = factorActual - pasoFactorAtenuar

            // i -= 1
            indFreq -= 1
        }
        
    },
    getAveragesStepLength(dataLength, averages, overlap){
        return dataLength / (averages * (1 - (overlap / 100)) + (overlap / 100))
    },
    calcular_Punto_Vector_Rad(amplitud, angulo){
        return {
            x: amplitud * (Math.cos(angulo)),
            y: amplitud * (Math.sin(angulo))
        }
    },
    calcular_Vector_de_XY_Rad(x, y){
        let angulo = Math.atan(y / x)
        if (x < 0) {
            angulo = angulo + 3.141592
        }else if (x = 0 && y < 0) {
            //angulo = angulo + 180
        }
        return {
            angle: CorregirAnguloRad(angulo),
            amplitude: Math.sqrt(x * x + y * y)
        }
    },
    phase(Real, Imag, Unit){
        if(Unit == null){Unit = 'deg'}
        if (Real === 0) {
            if (Imag > 0){
                return 270
            }else if (Imag < 0){
                return 90
            }
            return 0
        }
        var Angle = 0
        var halfRot = 0
        if (Unit == 'deg'){
            Angle = Math.atan(Imag / Real) * 57.2957
            halfRot = 180
        }else{
            Angle = Math.atan(Imag / Real)
            halfRot = 3.141592
        }
        
        if (Real < 0){
            Angle += halfRot
        }
        return this.correctAngle(Angle, Unit)
    },
    correctAngle(Angle, Unit, useNegativeValues){
        if(Unit == null){Unit = 'deg'}
        if(useNegativeValues == null){useNegativeValues = false}
        var ThisAngle = Angle
        var oneRot = 0
        var max = 360
        var min = 0
        if (Unit == 'deg'){
            oneRot = 360
            if(useNegativeValues){
                max = 180
                min = -180
            }
        }else{
            oneRot = 6.283184
            if(useNegativeValues){
                max = 3.141592
                min = -3.141592
            }
        }
        
        while  (ThisAngle < min) {
            ThisAngle += oneRot
        }
        while (ThisAngle >= max) {
            ThisAngle -= oneRot
        }
        if (ThisAngle === max && !useNegativeValues){
            ThisAngle = min
        }
        return ThisAngle
    },
    convertToDecibels(data, units) {
      let base;
      switch (units) {
        case 0: // g
          base = 1e-6 * 9.81; // 1 micro-g in m/s^2
          break;
        case 1: // mm/s^2
          base = 1e-6; // 1 micro-mm/s^2
          break;
        case 2: // mm/s
          base = 1e-6; // 1 micro-mm/s
          break;
        case 3: // inch/s
          base = 1e-6 * 25.4; // 1 micro-inch/s
          break;
        case 4: // micrometers
          base = 1; // 1 micrometer
          break;
        case 5: // mils
          base = 1e-3 * 25.4; // 1 mil = 1 thousandth of an inch
          break;
        default:
          // Finding minimum positive value in data
          const minPositive = data.reduce((min, val) => (val > 0 && val < min) ? val : min, Number.MAX_VALUE);
          base = (minPositive !== Number.MAX_VALUE) ? minPositive : 1;
          break;
      }
  
      return data.map(val => val > 0 ? 20 * Math.log10(val / base) : val);
    },
    hilbertTransform(data) {
      let dataCount = this.NearestPow2Length(data.length)
      //copy the dataCount to a new array
      let input = new Float32Array(dataCount)
      for (let i = 0; i < dataCount; i++) {
        input[i] = data[i]
      }

      // Ensure the input length is a power of two
      var N = input.length;
      if ((N & (N - 1)) !== 0) {
        throw new Error("Input length must be a power of two");
      }
    
      // Create an FFT object
      var fft = new FFTJS(N);
    
      // Convert the real input signal to a complex array
      var inputComplex = fft.toComplexArray(input);
    
      // Create an array to hold the FFT result
      var fftComplex = fft.createComplexArray();
    
      // Compute the forward FFT
      //fft.transform(inputComplex, fftComplex);
      fft.transform(fftComplex, inputComplex)
    
      // Apply the Hilbert transform filter in the frequency domain
      for (var n = 0; n < N; n++) {
        var h;
        if (n === 0) {
          h = 1;
        } else if (n < N / 2) {
          h = 2;
        } else if (n === N / 2 && N % 2 === 0) {
          h = 1;
        } else {
          h = 0;
        }
        fftComplex[2 * n] *= h;
        fftComplex[2 * n + 1] *= h;
      }
    
      // Create an array to hold the inverse FFT result
      var invFFTComplex = fft.createComplexArray();
    
      // Compute the inverse FFT
      fft.inverseTransform(invFFTComplex, fftComplex);
    
      // Extract the imaginary part (Hilbert transform) from the inverse FFT result
      var hilbert = new Array(N);
      for (var n = 0; n < N; n++) {
        hilbert[n] = invFFTComplex[2 * n + 1];
      }
    
      return hilbert;
    },
    hilbertEnvelope(signal, hilbertSignal = null) {
      // Compute the Hilbert transform
      if(hilbertSignal == null){
        hilbertSignal = this.hilbertTransform(signal)
      }
      
      let length = Math.min(signal.length, hilbertSignal.length)
      // Compute the envelope (instantaneous amplitude)
      var envelope = new Array(length)
      for (var n = 0; n < length; n++) {
        envelope[n] = Math.sqrt(signal[n] * signal[n] + hilbertSignal[n] * hilbertSignal[n])
      }
    
      return envelope
    },


    FFTOutput: class{
      constructor(data){
        Object.assign(this, data)
      }

      rms(min, max, MinMaxAreIndices = false){ //Hz
        if(this.mag == null || this.mag.length == 0){return 0}
        let minInd = 0
        let maxInd = this.mag.length - 1

        if(MinMaxAreIndices){
          if(min != null){
            minInd = min
          }
          if(max != null){
            maxInd = max
          }
        }else{
          if(min != null && max != null){
            let freqMin = min
            let freqMax = max
            minInd = this.getIndex(freqMin)//EICalc.getIndexFromFrequency(freqMin, this.sampleRate, this.mag.length)
            maxInd = this.getIndex(freqMax)//EICalc.getIndexFromFrequency(freqMax, this.sampleRate, this.mag.length)
          }
        }
        return EICalc.RMSFFT(this.mag, this.window, minInd, maxInd)
      }

      min(min, max, MinMaxAreIndices = false){
        if(this.mag == null || this.mag.length == 0){return 0}
        let minInd = 0
        let maxInd = this.mag.length - 1

        if(MinMaxAreIndices){
          if(min != null){
            minInd = min
          }
          if(max != null){
            maxInd = max
          }
        }else{
          if(min != null && max != null){
            let freqMin = min
            let freqMax = max
            minInd = this.getIndex(freqMin)//EICalc.getIndexFromFrequency(freqMin, this.sampleRate, this.mag.length)
            maxInd = this.getIndex(freqMax)//EICalc.getIndexFromFrequency(freqMax, this.sampleRate, this.mag.length)
          }
        }
        if(maxInd <= 0){
            maxInd = this.mag.length - 1
        }
        return this.mag.min(null, minInd, maxInd)

      }
      max(min, max, MinMaxAreIndices = false, roundIndices = true){
        if(this.mag == null || this.mag.length == 0){return 0}
        let minInd = 0
        let maxInd = this.mag.length - 1

        if(MinMaxAreIndices){
          if(min != null){
            minInd = min
          }
          if(max != null){
            maxInd = max
          }
        }else{
          if(min != null && max != null){
            let freqMin = min
            let freqMax = max
            minInd = this.getIndex(freqMin, roundIndices, 'ceil')//EICalc.getIndexFromFrequency(freqMin, this.sampleRate, this.mag.length)
            maxInd = this.getIndex(freqMax, roundIndices, 'floor')//EICalc.getIndexFromFrequency(freqMax, this.sampleRate, this.mag.length)
          }
        }
        if(maxInd <= 0){
          maxInd = this.mag.length - 1
        }
        return Erbessd_max(this.mag, null, minInd, maxInd)

      }
      maxIndex(min, max, MinMaxAreIndices = false, roundIndices = true){
        if(this.mag == null || this.mag.length == 0){return 0}
        let minInd = 0
        let maxInd = this.mag.length - 1

        if(MinMaxAreIndices){
          if(min != null){
            minInd = min
          }
          if(max != null){
            maxInd = max
          }
        }else{
          if(min != null && max != null){
            let freqMin = min
            let freqMax = max
            minInd = this.getIndex(freqMin, roundIndices, 'ceil')//EICalc.getIndexFromFrequency(freqMin, this.sampleRate, this.mag.length)
            maxInd = this.getIndex(freqMax, roundIndices, 'floor')//EICalc.getIndexFromFrequency(freqMax, this.sampleRate, this.mag.length)
          }
        }
        if(maxInd <= 0){
          maxInd = this.mag.length - 1
        }
        return Erbessd_maxIndex(this.mag, minInd, maxInd)

      }

      getRPM(min, max, MinMaxAreIndices = false){
        if(this.mag == null || this.mag.length == 0){return 0}
        let minInd = 0
        let maxInd = this.mag.length - 1

        if(MinMaxAreIndices){
          if(min != null){
            minInd = min
          }
          if(max != null){
            maxInd = max
          }
        }else{
          if(min != null && max != null){
            let freqMin = min / 60
            let freqMax = max / 60
            minInd = EICalc.getIndexFromFrequency(freqMin, this.sampleRate, this.mag.length)
            maxInd = EICalc.getIndexFromFrequency(freqMax, this.sampleRate, this.mag.length)
          }
        }
        let maxIndex = Erbessd_maxIndex(this.mag, minInd, maxInd)
        let locate = true
        if(this.window < 2){
          locate = false
        }
        
        if(locate){
          maxIndex = EICalc.Locate(maxIndex, this.mag)
        }
        
        return ((this.sampleRate / 2) / this.mag.length) * maxIndex * 60
      }

      getIndex(frequencyHz, round = true, mode){
        if(round == false && mode != null){
            let indexDouble = EICalc.getIndexFromFrequency(frequencyHz, this.sampleRate, this.mag.length, false)
            let output
            if(mode == 'floor'){
                output = Math.floor(indexDouble)
            }else if(mode == 'ceil'){
                output = Math.ceil(indexDouble)
            }else{
                output = Math.round(indexDouble)
            }
            return output
            
        }else{
            return EICalc.getIndexFromFrequency(frequencyHz, this.sampleRate, this.mag.length, round)
        }
        
        
      }
      getValueAt(indexFloat, tolerance){ // Tolerance is in Index
        let minIndex = Math.round(indexFloat - tolerance)
        let maxIndex = Math.round(indexFloat + tolerance)
        return Erbessd_max(this.mag, null, minIndex, maxIndex)
      }
      getFrequencyAt(indexFloat){
        if(Array.isArray(indexFloat)){
          let output = []
          for(let i = 0; i < indexFloat.length; i++){
            output.push(this.getFrequencyAt(indexFloat[i]))
          }
          return output
        }else{
          return EICalc.getFrequencyFromIndex(indexFloat, this.sampleRate, this.mag.length)
        }
        
      }
      getPhaseAt(indexFloat, rad = false){
        let ind = Math.round(indexFloat)
        let radianValue = this.phase[ind]
        radianValue = EIFFT.correctAngle(radianValue, 'rad')
        
        if(rad){
          return radianValue
        }else{
          return radianValue * 57.2957
        }
      }
      static model(){
        return {
          mag: null,
          phase: null,
          real: null,
          imag: null,
          sampleRate: null,
          window: FFTEnums.WindowType.Hann,
        }
      }
      getDecibels(units){
        return EIFFT.convertToDecibels(this.mag, units)
      }
      getFRF(indexFloat, tolerance){
        let mag1 = this.getValueAt(indexFloat, tolerance)
        if(this.refFFT != null){
          let magRef = this.refFFT.getValueAt(indexFloat, tolerance)
          return mag1 / magRef
        }else{
          return mag1
        }
      }
      getCoherence(indexFloat){
        if(this.refFFT != null){
          if(this.coherence == null){
            this.coherence = EICalc.advanced.coherence_FFT(this, this.refFFT)
          }
          let ind = Math.round(indexFloat)
          return this.coherence[ind]
        }else{
          return 1
        }
        
      }
    },
    FFTComplex: class{
      constructor(options){
        if(Array.isArray(options)){
          options = {
            data: options,
            sampleRate: 48000
          }
        }
        let opts = Object.assign({
          data: [],
          sampleRate: 48000,
          isComplexArray: false,
        }, options)
        
        this.sampleRate = opts.sampleRate

        const {data, isComplexArray} = opts
        if(isComplexArray){
          this.complexArray = data
        }else{
          this.complexArray = EIFFT.fftComplex(data)
        }
        
      }
      // get mag
      get mag(){
        console.log('get mag')
        let output = []
        for(var i = 0; i < this.complexArray.length / 2; i += 2){
          const real = this.complexArray[i]
          const imag = this.complexArray[i + 1]
          output.push(Math.sqrt((real * real) + (imag * imag)))
        }
        return output
      }
      getIfft(complexData){
        if(complexData == null){
          complexData = this.complexArray
        }
        let output = EIFFT.ifft(complexData)
        return output
      }
      get ifft(){
        return this.getIfft()
      }
      get cepstrum(){
        //recalculate the mag with the entire array
        // console.log('get cepstrum original length:', this.complexArray.length)
        const output = new Array(this.complexArray.length).fill(0)
        for(var i = 0; i < this.complexArray.length; i += 2){
          const real = this.complexArray[i]
          const imag = this.complexArray[i + 1]
          const mag = Math.sqrt((real * real) + (imag * imag))
          output[i] = Math.log(mag + Number.EPSILON)
        }
        // console.log('get cepstrum  length before ifft:', output.length)
        const ifft = this.getIfft(output)
        // for(var i = 0; i < 10; i++){
        //   ifft[i] = 0
        //   ifft[ifft.length - 1 - i] = 0
        // }
        // console.log('get cepstrum  length after ifft:', ifft.length)
        return ifft
      }
      getFundamental(minExpectedFrequency = 1, maxExpectedFrequency = 1000){
        let cepstrum = this.cepstrum
        let quefrency = Array.from({ length: cepstrum.length }, (_, i) => i / this.sampleRate)
        let minQuefrency = 1 / maxExpectedFrequency
        let maxQuefrency = 1 / minExpectedFrequency
        let maxIndex = 0
        let maxValue = -Infinity
          for (let i = 0; i < quefrency.length / 2; i++) {
            if (quefrency[i] >= minQuefrency && quefrency[i] <= maxQuefrency) {
              if (cepstrum[i] > maxValue) {
                maxValue = cepstrum[i];
                maxIndex = i;
              }
            } else if(quefrency[i] >= minQuefrency && quefrency[i] >= maxQuefrency){
              if (cepstrum[i-1] > maxValue) {
                maxValue = cepstrum[i-1];
                maxIndex = i-1;
              }
              break
            } else {
              maxValue = cepstrum[i];
              maxIndex = i;
            }
            
          }

        let fundamentalPeriod = quefrency[maxIndex];
        let fundamentalFrequency = 1 / fundamentalPeriod
        
        return fundamentalFrequency
      }
    }
}

function Erbessd_max(array, compareFunction, minIndex, maxIndex) {
  if (array == null) {
    return null
  }
  if (minIndex == null || isNaN(minIndex)) {
    minIndex = 0
  }
  if (maxIndex == null || isNaN(maxIndex)) {
    maxIndex = array.length - 1
  }
  if (array.length === 0) {
    return null
  }
  if (compareFunction == null) {
    let max = array[minIndex]
    if (max == null) {
      return null
    }
    for (let i = minIndex; i <= maxIndex; i++) {
      max = array[i] > max ? array[i] : max
    }
    return max
  } else {
    let output = array[0]
    for (let i = minIndex; i <= maxIndex; i++) {
      if (compareFunction(array[i], output) > 0) {
        output = array[i]
      }
    }
    return output
  }  
}

function Erbessd_maxIndex(array, minIndex, maxIndex) {
  if (minIndex == null || maxIndex == null) {
    let max = Erbessd_max(array)
    return array.indexOf(max)
  } else {
    let val = array[minIndex]
    let ind = minIndex
    for (var i = minIndex; i <= maxIndex; i++) {
      if (array[i] > val) {
        val = array[i]
        ind = i
      }
    }
    return ind
  }  
}



export const FFTEnums = {
    WindowType: {
        Rect: 0,
        Blackman: 2,
        Hamming: 3,
        Hann: 4,
        FlatTop: 7,
        options(){
            return [{
                value: this.Rect,
                text: 'Rect'
            },{
                value: this.Blackman,
                text: 'Blackman'
            },{
                value: this.Hamming,
                text: 'Hamming'
            },{
                value: this.Hann,
                text: 'Hann'
            },{
                value: this.FlatTop,
                text: 'FlatTop'
            }]
        },
        getOptions(excludeValues) {
            if (excludeValues == null) {excludeValues = []}
            let output = {
              options: [],
              values:[]
            }
            let excludeKeys = ['options', 'getOptions', 'name', 'ENBW']
            for(var key in this) {
              if (!excludeKeys.includes(key) && !excludeValues.includes(this[key])) {
                let option = key.replace(/([a-z])([A-Z])/g, '$1 $2')//replace(/([A-Z])/g, ' $1')
                .replace(/^./, function(str) { return str.toUpperCase(); })
                output.options.push(option)
                output.values.push(this[key])
              }
            }
            return output
        },
        name(window){
            switch(window){
                case this.Rect: return 'Rect'
                case this.Blackman: return 'Blackman'
                case this.Hamming: return 'Hamming'
                case this.Hann: return 'Hann'
                case this.FlatTop: return 'FlatTop'
                default: return ''
            }
        },
        ENBW(window){
            switch(window){
                case this.Rect: return 1
                case this.Blackman: return 1.73
                case this.Hamming: return 1.37
                case this.Hann: return 1.5
                case this.FlatTop: return 3.78
                default: return 1
            }
        }
    },
    FFTOutputType: {
        RMS: 0,
        P0: 1,
        PP: 2,
        toString(value){
            switch (value) {
                case this.RMS: return 'RMS'
                case this.P0: return '0-P'
                case this.PP: return 'P-P'
                default: return ''
            }
        }
    },
    
}
