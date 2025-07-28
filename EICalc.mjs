//import Vue from 'vue'
// import Store from '@/store'
// import { min } from 'lodash'
import { EIFFT, FFTEnums } from './EIFFT.mjs'
// import { Erbessd, Enums } from './Erbessd'
import { ErbessdSavingData } from './ErbessdSavingData.mjs'
const Erbessd = ErbessdSavingData
const Enums = ErbessdSavingData
export const EICalc = {
  constants:{
    values:{
      lowFrequency:{
        minHz: 0,
        maxHz: 500
      },
      mediumFrequency:{
        minHz: 500,
        maxHz: 5000
      },
      highFrequency:{
        minHz: 5000,
        maxHz: 15000
      },
      inactivityValues:{
        gE: 0.03,
        g: 0.04,
        mm_s: 0.5,
        velFreqMin: 15,
        velFreqMax: 10000
      },
      sensorSaturation:{
        limit: 0.95
      }
    },
    valuesPerSensor:{
      g3:{
        inactivityValues:{
          gE: 0.05,
          g: 0.07,
          mm_s: 1.5,
          velFreqMin: 15,
          velFreqMax: 10000
        }
      },
    },
    getValue(section, parameter, sensor = '') {
      let output = null;
      if (sensor !== '') {
        if (this.valuesPerSensor[sensor] != null && this.valuesPerSensor[sensor][section] != null && this.valuesPerSensor[sensor][section][parameter] != null) {
          output = this.valuesPerSensor[sensor][section][parameter];
        }
      }
      if (output == null) {
        if (this.values[section] != null && this.values[section][parameter] != null) {
          output = this.values[section][parameter];
        }
      }
      if (output == null) {
        console.error('Could not find the specified value');
      }
      return output;
    },
    getInactivityValues(calibration, sensor){
      //check if calibration is near to 2 / 32768, or 4 / 32768 or 8 / 32768 or 16 / 32768 or 32 / 32768
      let output = null
      if(sensor != 'g3'){
        return this.values.inactivityValues.deepClone()
      }else{
        output = this.valuesPerSensor.g3.inactivityValues.deepClone()
      }
      let factor = 1
      // if(calibration >= 4 / 32768){
      //   factor = 1
      // }
      // if(calibration >= 8 / 32768){
      //   factor = 8
      // }
      if(calibration >= 16 / 32770){
        factor = 1.5
      }
      if(calibration >= 32 / 32770){
        factor = 2
      }
      if(calibration >= 64 / 32770){
        factor = 2.5
      }
      output.gE = output.gE * factor
      output.g = output.g * factor
      output.mm_s = output.mm_s * factor
      return output
    }
    

  },
  RMS(data) {
    if (data.length === 0) {
      return 0
    }
    var total = 0
    for (var i = 0; i < data.length; i++) {
      total += Math.pow(data[i], 2)
    }
    // data.forEach(value => {
    //     total += Math.pow(value, 2)
    // })

    total = total / data.length
    return Math.sqrt(total)
  },
  RMSVelocity(accelData, cal, sens, sampleRate, outputUnits) {
    if (outputUnits == null) {
      outputUnits = Enums.Units.mm_s
    }
    let vel = this.convertSignal(accelData, Enums.SignalTypeIn.Acceleration, outputUnits, 0, sampleRate, cal, sens)
    return this.RMS(vel)
  },
  RMSFFT(FFTData, window, indMin, indMax) {
    if (!indMin || indMin < 0) {
      indMin = 0
    }
    if (indMax == null || indMax <= 0 || indMax > FFTData.length - 1) {
      indMax = FFTData.length - 1
    }
    var Total = 0
    for (var i = indMin; i <= indMax; i++) {
      Total += FFTData[i] * FFTData[i]
    }
    return Math.sqrt(Total) * this.windowCorrectionFactor(window)
  },
  RMSFFT_Freq(FFTData, window, sampleRate, frecMinHz, frecMaxHz) {
    var indMin = Math.round(this.Obtener_Posicion_Frecuencia(frecMinHz * 60, sampleRate, FFTData.length))
    var indMax = Math.round(this.Obtener_Posicion_Frecuencia(frecMaxHz * 60, sampleRate, FFTData.length))
    if (indMin < 0) {
      indMin = 0
    }
    if (indMax > FFTData.length - 1) {
      indMax = FFTData.length - 1
    }
    return this.RMSFFT(FFTData, window, indMin, indMax)
  },
  getCrestFactor(data) {
    const timeRMS = this.RMS(data)
    const max = data.max()
    const min = data.min()
    const crestFactor = this.crestFactor(timeRMS, max, min)
    return crestFactor
  },
  crestFactor(RMS, max, min) {
    if (min != null && Math.abs(min) > max) {
      max = Math.abs(min)
    }
    return max / RMS
  },
  windowCorrectionFactor(window) {
    switch (window) {
      case FFTEnums.WindowType.Rect:
        return 0.8764
      case FFTEnums.WindowType.Blackman:
        return 0.8003
      case FFTEnums.WindowType.Hamming:
        return 0.7952
      case FFTEnums.WindowType.Hann:
        return 0.76895
      case FFTEnums.WindowType.FlatTop:
        return 0.51405
    }
  },
  Remove_DC(data) {
    if (data.length > 0) {
      var NewData = Array(data.length).fill(0)
      let av = this.Average(data)

      for (var i = 0; i < data.length; i++) {
        NewData[i] = data[i] - av
      }
      return NewData
    }
    return []
    //return
  },
  Average(data) {
    let total = 0
    if(!data){
      return 0
    }
    for (var i = 0; i < data.length; i++) {
      total += data[i]
    }
    return total / data.length
  },
  Remove_DC_Ref(data) {
    if (data.length > 0) {
      let total = 0
      for (var i = 0; i < data.length; i++) {
        total += data[i]
      }

      let av = total / data.length
      for (var i = 0; i < data.length; i++) {
        data[i] = data[i] - av
      }
    }
  },
  Obtener_Posicion_Frecuencia(Frecuencia_CPM, SampleRate, dataLength) {
    //console.log(Frecuencia_CPM)
    let Frec_Max_Spec = SampleRate * 30
    let Frec_Por_Valor = Frec_Max_Spec / dataLength
    let output = Math.round(Frecuencia_CPM / Frec_Por_Valor)
    if (output < 0) {
      output = 0
    }
    if (output >= dataLength) {
      output = dataLength - 1
    }
    return output
  },
  getIndexFromFrequency(frequencyHz, sampleRate, dataLength, round = true) {
    let maxFreq = sampleRate / 2
    let freqPerValue = maxFreq / dataLength
    if (round) {
      return Math.round(frequencyHz / freqPerValue)
    } else {
      return frequencyHz / freqPerValue
    }
  },

  Obtener_Posicion_Tiempo(tiempo_S, SampleRate) {
    let Tiempo_Por_Valor = 1 / SampleRate
    return Math.round(tiempo_S / Tiempo_Por_Valor)
  },
  getFrequencyFromIndex(Index, SampleRate, dataLength) {
    let Frec_Max_Spec = SampleRate * 30
    let Frec_Por_Valor = Frec_Max_Spec / dataLength
    return Frec_Por_Valor * Index
  },
  convertSignal(data, SignalTypeIn, Units, Frecuencia_RPM, SampleRate, Calibration, Sensitivity, Analogic_Filter) {
    if (Analogic_Filter == null) {
      Analogic_Filter = true
    }

    var mult = Calibration / Sensitivity

    switch (SignalTypeIn) {
      case Enums.SignalTypeIn.Acceleration:
        switch (Units) {
          case Enums.Units.m_s2:
            mult = mult * 9.81
            break
          case Enums.Units.mm_s:
            mult = mult * 9810
            break
          case Enums.Units.inch_s:
            mult = mult * 386.22 //este valor sale de 9810 / 25.4
            break
          case Enums.Units.um:
          case Enums.Units.mils:
            mult = mult * 9810 // * 1000
            break
          // case Enums.Units.mils:
          //   mult = mult * 9810 * 39.37 //este valor sale de 1000 / 25.4
          //   break
          case Enums.Units.g:
          case Enums.Units.gE:
            break
          default:
            throw new TypeError('Units Error', 'EICalc')
            break
        }
        break
      case Enums.SignalTypeIn.Displacement:
        switch (Units) {
          case Enums.Units.g:
            mult = mult / 25.4 / 9810
            break
          case Enums.Units.m_s2:
            mult = mult / 25.4
            break
          case Enums.Units.mm_s:
            mult = mult / 25.4
            break
          case Enums.Units.inch_s:
            mult = mult / 1000
            break
          case Enums.Units.um:
            mult = mult * 25.4
            break
          case Enums.Units.gE:
            break
          default:
            throw new TypeError('Units Error', 'EICalc')
            break
        }
        break
      default:
        break
    }

    //For removing DC
    if (!data) {
      return []
    }
    let average = this.Average(data)

    switch (SignalTypeIn) {
      case Enums.SignalTypeIn.Acceleration:
        switch (Units) {
          case Enums.Units.g:
          case Enums.Units.m_s2: {
            let Data_g = new Float32Array(data.length)
            for (let i = 0; i < Data_g.length; i++) {
              Data_g[i] = (data[i] - average) * mult
            }
            return Data_g
            break
          }
          case Enums.Units.mm_s:
          case Enums.Units.inch_s: {
            return this.Integrar_Extended(data, SampleRate, average, mult, Analogic_Filter)
            break
          }
          case Enums.Units.um:
          case Enums.Units.mils: {
            //var Data_g = Array(data.length).fill(0)
            let Data_g = this.Integrar_Extended(data, SampleRate, average, mult, Analogic_Filter)
            this.Remove_DC_Ref(Data_g)
            Data_g = this.Integrar(Data_g, SampleRate, false)
            let mult2 = Units === Enums.Units.um ? 1000 : 39.37 // 39.37 sale de 1000 / 25.4
            for (let i = 0; i < Data_g.length; i++) {
              Data_g[i] = Data_g[i] * mult2
            }
            // this.Remove_DC_Ref(Data_g)
            return Data_g
            break
          }
          case Enums.Units.gE: {
            // if (canCalculateGE === false){
            //     return Array(data.length).fill(0)
            // }
            //var output = Envolvente_Aceleracion(data: Data_g, Frecuencia1: 0, Frecuencia2: Frecuencia_RPM * 10.0, SampleRate: SampleRate)
            let output = this.Envolvente_Aceleracion(data, 0, Frecuencia_RPM * 10.0, SampleRate, average, mult)
            //this.Remove_DC_Ref(output)
            return output
            break
          }
          default: {
            throw new TypeError('Units Error', 'EICalc')
            let Data_g = Array(data.length).fill(0)
            for (let i = 0; i < Data_g.length; i++) {
              Data_g[i] = (data[i] - average) * mult
            }
            return Data_g
            break
          }
        }
        break
      case Enums.SignalTypeIn.Displacement:
        switch (Units) {
          case Enums.Units.g:
          case Enums.Units.m_s2: {
            let temp = new Float32Array(data.length)
            for (let i = 0; i < temp.length; i++) {
              temp[i] = data[i] * mult // 25.4
            }
            //temp = this.Remove_DC(temp)
            this.Remove_DC_Ref(temp)
            let output = this.Derivar_Function(this.Derivar_Function(temp, SampleRate), SampleRate)
            return output
            break
          }
          case Enums.Units.mm_s:
          case Enums.Units.inch_s: {
            let temp = new Float32Array(data.length)
            for (let i = 0; i < temp.length; i++) {
              temp[i] = data[i] * mult
            }
            //temp = this.Remove_DC(temp)
            this.Remove_DC_Ref(temp)
            let output = this.Derivar_Function(temp, SampleRate)
            output[0] = 0
            output[output.length - 1] = 0
            return output
            break
          }
          case Enums.Units.um:
          case Enums.Units.mils: {
            let output = this.Remove_DC(data)
            for (let i = 0; i < output.length; i++) {
              output[i] = output[i] * mult
            }
            output[0] = 0
            output[output.length - 1] = 0
            return output
            break
          }
          case Enums.Units.gE: {
            let temp = new Float32Array(data.length)
            for (let i = 0; i < temp.length; i++) {
              temp[i] = data[i] / 25.4
            }
            //temp = this.Remove_DC(temp)
            this.Remove_DC_Ref(temp)
            let output = this.Derivar_Function(this.Derivar_Function(temp, SampleRate), SampleRate)
            for (let i = 0; i < output.length; i++) {
              output[i] = output[i] / 9810
            }

            output = this.Envolvente_Aceleracion(output, 0, Frecuencia_RPM * 10.0, SampleRate, average, mult)
            //this.Remove_DC_Ref(output)
            return output
            break
          }
          default:
            throw new TypeError('Units Error', 'EICalc')
            return data
        }
        break
      default:
        throw new TypeError('SignalTypeIn Error', 'EICalc')
        let Data_g = new Float32Array(data.length)
        for (let i = 0; i < Data_g.length; i++) {
          Data_g[i] = (data[i] - average) * mult
        }
        return Data_g
        break
    }
  },
  Integrar(data, SampleRate, ApplyAnalogFilter) {
    if (ApplyAnalogFilter == null) {
      ApplyAnalogFilter = true
    }

    let tiempo = 1.0 / SampleRate
    var Salida = Array(data.length).fill(0)
    if (data.length < 1) {
      return Salida
    }
    for (var i = 1; i < data.length; i++) {
      Salida[i] = ((data[i] + data[i - 1]) / 2) * tiempo + Salida[i - 1]
    }

    if (ApplyAnalogFilter) {
      return this.AnalogFilter(Salida, SampleRate)
    } else {
      return Salida
    }
  },
  Integrar_Extended(data, SampleRate, average, mult, ApplyAnalogFilter) {
    if (ApplyAnalogFilter == null) {
      ApplyAnalogFilter = true
    }

    let tiempo = 1.0 / SampleRate
    var Salida = Array(data.length).fill(0)
    if (data.length < 1) {
      return Salida
    }

    //console.log('Integrar_Extended Data min', data.min(), 'max', data.max(), 'mult', mult)

    let mult2 = mult * tiempo
    for (var i = 1; i < data.length; i++) {
      Salida[i] = ((data[i] + data[i - 1]) / 2 - average) * mult2 + Salida[i - 1]
    }

    if (ApplyAnalogFilter) {
      return this.AnalogFilter(Salida, SampleRate)
    } else {
      return Salida
    }
  },
  Derivar_Function(data, sampleRate) {
    let tiempo = 1 / sampleRate

    let Data2 = this.Remove_DC(data)

    var salida = Array(Data2.length).fill(0)
    for (var i = 1; i < Data2.length; i++) {
      salida[i] = (Data2[i] - Data2[i - 1]) / tiempo
    }
    return salida
  },
  AnalogFilter(data, SampleRate) {
    var Sombra = Array(data.length).fill(0)
    let Multiplicador = SampleRate / 12000
    let Paso = Math.round(50 * Multiplicador)
    let Ancho2 = Math.round((1024 * Multiplicador) / 2)
    //let Ancho = Ancho2 * 2

    //var Contador = 0

    var Principio = 0
    var Final = Ancho2
    var count = Final

    var total = this.ArraySum(data, Principio, count)
    var media = total / count
    Sombra[0] = media
    var valorInicial = media
    var sumador = 0
    var i = Paso

    while (i < data.length) {
      var newPrincipio = i - Ancho2
      if (newPrincipio < 0) {
        newPrincipio = 0
      }

      var newFinal = i + Ancho2
      if (newFinal > data.length - 1) {
        newFinal = data.length - 1
      }

      for (var l = Principio; l < newPrincipio; l++) {
        total -= data[l]
      }
      for (var l = Final; l < newFinal; l++) {
        total += data[l]
      }

      count = newFinal - newPrincipio
      media = total / count
      sumador = (media - valorInicial) / Paso

      var l = i - Paso + 1
      while (l < i + 1) {
        valorInicial += sumador
        Sombra[l] = valorInicial
        l += 1
      }
      //Contador += 1
      i += Paso

      Principio = newPrincipio
      Final = newFinal
    }

    var lastShadow = Sombra[0]
    var Salida = Array(data.length).fill(0)
    for (var m = 0; m < data.length; m++) {
      if (Sombra[m] != 0) {
        lastShadow = Sombra[m]
      }
      Salida[m] = data[m] - lastShadow
    }

    return Salida
  },
  ArraySum(SourceArray, SourceIndex, length) {
    var count = length
    if (SourceArray.length < SourceIndex + length) {
      count = SourceArray.length - SourceIndex
    }
    var sumando = 0
    for (var i = SourceIndex; i < SourceIndex + count; i++) {
      sumando += Math.round(SourceArray[i]) //SourceArray[i]
    }
    return sumando
  },

  //Codigo de Digivibe
  AnalogFilter_Digivibe(data, sampleRate) {
    let sombra = new Array(data.length).fill(0)
    let multiplicador = sampleRate / 11025
    let paso = 50 * multiplicador
    let ancho = 1024 * multiplicador
    let ancho2 = ancho / 2

    let principio = 0
    let final = ancho2

    let media = this.arrayAverage(data, principio, final - principio)
    sombra[0] = media
    let valorInicial = media
    let sumador = 0

    for (let i = paso; i < data.length; i += paso) {
      principio = i - ancho2
      if (principio < 0) principio = 0

      final = i + ancho2
      if (final > data.length - 1) final = data.length - 1

      media = this.arrayAverage(data, principio, final - principio)
      sumador = (media - valorInicial) / paso

      for (let l = i - paso + 1; l <= i; l++) {
        valorInicial += sumador
        sombra[l] = valorInicial
      }
      valorInicial = media
    }

    let lastShadow = sombra[0]
    for (let i = 0; i < data.length; i++) {
      if (sombra[i] !== 0) {
        lastShadow = sombra[i]
      }
      data[i] = data[i] - lastShadow
    }
    return data
  },
  arrayAverage(sourceArray, sourceIndex, length) {
    let sum = 0
    if (sourceIndex + length > sourceArray.length - 1) {
      length = sourceArray.length - sourceIndex
    }
    if (length > 0) {
      for (let i = sourceIndex; i < sourceIndex + length; i++) {
        sum += sourceArray[i]
      }
      return sum / length
    } else {
      return 0
    }
  },

  repairTachSignalPrev(data, Calibration, sensibilidad_mV) {
    var data_mV = Array(data.length).fill(0)
    for (var i = 0; i < data.length; i++) {
      data_mV[i] = data[i] * Calibration
    }
    return this.repairTachSignalNoCalibration(data_mV, sensibilidad_mV)
  },
  repairTachSignalNoCalibration(data_mV, sensibilidad_mV) {
    var Maximo = -10000
    var Minimo = 10000
    let minCount = Math.round(data_mV.length / 4)
    for (var i = minCount; i < data_mV.length; i++) {
      if (data_mV[i] > Maximo) {
        Maximo = data_mV[i]
      }
      if (data_mV[i] < Minimo) {
        Minimo = data_mV[i]
      }
    }
    Maximo = Math.abs(Maximo)
    Minimo = Math.abs(Minimo)

    if (Minimo > Maximo) {
      Maximo = Minimo
    }

    let Parametro = Maximo * 0.75
    var Puede_Agregar = true
    var Salida = Array(data_mV.length).fill(0)

    if (Maximo >= sensibilidad_mV / 2) {
      for (var i = 0; i < data_mV.length; i++) {
        if (Math.abs(data_mV[i]) >= Parametro) {
          if (Puede_Agregar) {
            Salida[i] = Maximo
          } else {
            Salida[i] = 0
          }
          Puede_Agregar = false
        } else {
          Salida[i] = 0
          Puede_Agregar = true
        }
      }
    }
    return this.Remove_DC(Salida)
  },
  Envolvente_Aceleracion(data, Frecuencia1, Frecuencia2, SampleRate, average, mult) {
    var Senal_Salida = []
    if (Frecuencia1 == null || Frecuencia2 == null) {
      let maxFreq = 1000 //this.getMaxFrequency(data, SampleRate, minRPM, maxRPM)
      Frecuencia1 = 0
      Frecuencia2 = maxFreq * 10
      //Senal_Salida = this.Filtrar_Senal(data, [0], [Freq2], SampleRate)
    }
    for (var i = 0; i < data.length; i++) {
      Senal_Salida[i] = (data[i] - average) * mult
    }
    Senal_Salida = this.Filtrar_Senal(Senal_Salida, [Frecuencia1], [Frecuencia2], SampleRate)

    for (var i = 0; i < Senal_Salida.length; i++) {
      Senal_Salida[i] = Math.abs(Senal_Salida[i])
    }

    Senal_Salida = this.Envolver(Senal_Salida)
    //Senal_Salida = Eliminar_Offset(Senal_Salida)

    if (Erbessd.calculations.envelopping.removeDCAfterEnvelopping) {
      this.Remove_DC_Ref(Senal_Salida)
    }

    return Senal_Salida
    //return data
  },
  Envolver(datos) {
    var lista_puntos = []
    var Salida = Array(datos.length) //[Float](repeating: 0.0, count: datos.length)
    for (var i = 0; i < datos.length; i++) {
      Salida[i] = datos[i]
    }

    for (var i = 0; i < datos.length; i++) {
      if (datos.length < 50) {
        return Salida
      }
      if (i === 0) {
        Salida[i] = 0
      } else if (i === datos.length - 1) {
        Salida[i] = 0
      } else {
        if (datos[i] < datos[i - 1] || datos[i] < datos[i + 1]) {
          Salida[i] = 0
        } else {
          if (datos[i] > 0) {
            lista_puntos.push(i)
          } else {
            Salida[i] = 0
          }
        }
      }
    }

    for (var i = 1; i < lista_puntos.length; i++) {
      let dif_abajo = lista_puntos[i] - lista_puntos[i - 1]
      let Sumador_Abajo = (Salida[lista_puntos[i]] - Salida[lista_puntos[i - 1]]) / dif_abajo
      for (var n = 1; n < dif_abajo; n++) {
        Salida[lista_puntos[i - 1] + n] = Salida[lista_puntos[i - 1]] + Sumador_Abajo * n
      }
    }
    return Salida
  },
  removeLowFrequencyGE(Data, SampleRate, isBandPass) {
    var FFT_Temp = EIFFT.fftComplex(Data) //FFT_(Data, False, False, False, True)
    //FFT_Temp = Filtro(FFT_Temp, SampleRate, Frec_Min, Frec_Max, False)
    FFT_Temp = this.Filtro(FFT_Temp, SampleRate, [0], MaxFreqs, isBandPass)
    //return FFT_Inv(FFT_Temp.real, FFT_Temp.imag)

    return EIFFT.ifft(FFT_Temp)
  },
  Filtrar_Senal(Data, MinFreqs, MaxFreqs, SampleRate, filterType) {
    var FFT_Temp = EIFFT.fftComplex(Data) //FFT_(Data, False, False, False, True)
    //FFT_Temp = Filtro(FFT_Temp, SampleRate, Frec_Min, Frec_Max, False)
    let fType = filterType
    if (fType === true) {
      fType = 'bandPass'
    } //Esto lo hace compatible con la versión anterior que tenia el bool isBandPass
    if (filterType === 'pulseVue') {
      fType = 'bandPass'
    }
    switch (fType) {
      case 'bandPass':
        FFT_Temp = this.Filtro(FFT_Temp, SampleRate, MinFreqs, MaxFreqs, true)
        break
      default:
        FFT_Temp = this.Filtro(FFT_Temp, SampleRate, MinFreqs, MaxFreqs, false)
        break
    }

    //return FFT_Inv(FFT_Temp.real, FFT_Temp.imag)
    let output = EIFFT.ifft(FFT_Temp)
    if (filterType === 'pulseVue') {
      for (var i = 0; i < output.length; i++) {
        output[i] = Math.abs(output[i])
      }
    }
    return output
  },

  Filtro(Datos, SampleRate, minFrequencies, maxFrequencies, isBandPass) {
    //if(Potencia == null){Potencia = true}
    if (isBandPass == null) {
      isBandPass = false
    }
    //var Datos = Datos_Originales
    let MinFreqs = []
    let MaxFreqs = []
    if (isBandPass === false) {
      if (!Array.isArray(minFrequencies)) {
        MinFreqs = [0, minFrequencies]
      } else {
        MinFreqs = minFrequencies
      }
      if (!Array.isArray(maxFrequencies)) {
        MaxFreqs = [maxFrequencies]
      } else {
        MaxFreqs = maxFrequencies
      }
    } else {
      let headRoom = (SampleRate / 2) * 60
      if (!Array.isArray(minFrequencies)) {
        MinFreqs = [0, maxFrequencies]
        MaxFreqs = [minFrequencies, headRoom]
      } else {
        MinFreqs.push(0)
        for (var i = 0; i < minFrequencies.length; i++) {
          MinFreqs.push(maxFrequencies[i])
          MaxFreqs.push(minFrequencies[i])
        }
        MaxFreqs.push(headRoom)
      }
    }

    var Indices_Minimos = []
    var Indices_Maximos = []

    for (var i = 0; i < MinFreqs.length; i++) {
      var Ind_Min = 0
      var Ind_Max = 0

      let IM = this.Obtener_Posicion_Frecuencia(MinFreqs[i], SampleRate, Datos.length / 4)
      Ind_Min = Math.floor(IM) * 2
      let IMax = this.Obtener_Posicion_Frecuencia(MaxFreqs[i], SampleRate, Datos.length / 4)
      Ind_Max = Math.ceil(IMax) * 2

      if (Ind_Min < 0) {
        Ind_Min = 0
      }

      if (Ind_Max > Datos.length - 1) {
        Ind_Max = Datos.length - 1
      }
      Indices_Minimos.push(Ind_Min)
      Indices_Maximos.push(Ind_Max)
    }

    for (var i = 0; i < Indices_Minimos.length; i++) {
      for (var j = Indices_Minimos[i]; j < Indices_Maximos[i]; j++) {
        // Datos.real[j] = 0
        // Datos.imag[j] = 0
        Datos[j] = 0
      }
      // let min = Datos.imag.length - 1 - Indices_Maximos[i]
      // let max = Datos.imag.length - Indices_Minimos[i]
      // for (var j = min; j < max; j++){
      //     Datos.real[j] = 0
      //     Datos.imag[j] = 0
      // }
    }

    return Datos
  },
  Averaging:{
    syncAveraging(data, sampleRate, freqHz, averages, overlap) {
      // Step 1: Calculate the block start indices and block lengths
      const blockParams = this.calculateBlockStartIndices(data.length, sampleRate, freqHz, averages, overlap);
  
      const { blockLength, indices, maxLengths } = blockParams;
  
      // Initialize an array to store the averaged signal
      const averagedSignal = new Array(blockLength).fill(0);
  
      let count = 0
      // Step 2: Loop over each block and accumulate the values
      for (let i = 0; i < indices.length; i++) {
          const blockStart = indices[i];
          //const blockLength = maxLengths[i];
  
          // Extract the block from the data
          if(blockLength >= maxLengths[i]){
            const block = data.slice(blockStart, blockStart + blockLength);
    
            // Accumulate the block values into the averagedSignal
            for (let j = 0; j < block.length; j++) {
              averagedSignal[j] += block[j];
            }

            count++
          }
          
          
      }
  
      // Step 3: Average the accumulated signal
      for (let i = 0; i < averagedSignal.length; i++) {
        averagedSignal[i] /=  count //indices.length;  // Divide by the number of blocks (averages)
      }
  
      return averagedSignal;
    },
    calculateBlockStartIndices(dataLength, sampleRate, frequency, averages, overlap, secondRound = false) {
      averages = averages + 1

      let periodInSamplesFloat = sampleRate / frequency
      let numberOfPeriods = dataLength / periodInSamplesFloat
      //console.log('periodInSamplesFloat', periodInSamplesFloat, 'numberOfPeriods', numberOfPeriods)
      // Use the floor of periodInSamples for block alignment
      //const periodInSamplesInt = periodInSamples
  
      //const stepSize = this.getAveragesStepLength(numberOfPeriods, averages, overlap)//periodInSamplesFloat * (1 - (overlap / 100));
      let averageStepLength = this.getAveragesStepLength(numberOfPeriods, averages, overlap)
      //let averageStep = averageStepLength - (averageStepLength * (1 - (overlap / 100)))
      let averageStep = averageStepLength * (1 - (overlap / 100)) 

      //console.log('averageStepLength', averageStepLength, 'averageStep', averageStep)

      // Initialize an array to store the starting indices of each block
      const blockStartIndices = [];
      const blockStartPeriods = []

      // Start at the first block (index 0) and calculate the next ones
      let blockStartPeriod = 0;

      //while (blockStartPeriod + periodInSamplesFloat <= dataLength && blockStartIndices.length < averages) {
      while (blockStartIndices.length < averages) {
          // Add the current block start to the indices array
          blockStartIndices.push(Math.round(blockStartPeriod * periodInSamplesFloat))

          blockStartPeriods.push(blockStartPeriod)

          // Move to the next block based on the step size
          blockStartPeriod += averageStep
          blockStartPeriod = Math.ceil(blockStartPeriod)
      }
      //remove last item
      blockStartIndices.pop()
      blockStartPeriods.pop()


      let maxLengths = []
      for (let i = 0; i < blockStartIndices.length - 1; i++) {
        
        let maxLength = Math.min(Math.round(averageStepLength * periodInSamplesFloat), dataLength - blockStartIndices[i])
        maxLengths.push(maxLength)
      }
      maxLengths.push(dataLength - blockStartIndices.last())
      
      let output = {
        // periodInSamples: periodInSamplesFloat, 
        // numberOfPeriods: numberOfPeriods, 
        // averageStep: averageStep,
        // averageStepLength: averageStepLength,
        blockLength: Math.round(averageStepLength * periodInSamplesFloat),
        periods: blockStartPeriods, 
        indices: blockStartIndices, 
        maxLengths: maxLengths
      }
      //console.log('output', output)
      return output
      
    },
    // syncAveraging(data, sampleRate, freqHz, averages, overlap) {
    //   console.log('syncAveraging', data.length, sampleRate, freqHz, averages, overlap)
    //   // Step 1: Calculate the period in samples
    //   const periodInSamples = sampleRate / freqHz;  // Frequency in Hz, sampleRate in samples/second
  
    //   // Step 2: Calculate the block length, using the calculateBlockLength function
    //   const dataLength = data.length;
    //   const blockLength = this.calculateBlockLength(dataLength, periodInSamples, averages, overlap);
  
    //   // Initialize an array to store the averaged result
    //   const averagedSignal = new Array(blockLength).fill(0);
  
    //   // Initialize variables to keep track of block starts and how many valid blocks we've processed
    //   let blockStart = 0;
    //   let blockCount = 0;
  
    //   //return averagedSignal
    //   // Step 3: Loop through the data, extract blocks, and accumulate the sum of samples for each point
    //   while (blockStart + blockLength <= dataLength) {
    //       // Extract a block of data
    //     const block = data.slice(blockStart, blockStart + blockLength);
  
    //     // Add the values of this block to the averaged signal (element-wise summation)
    //     for (let i = 0; i < blockLength; i++) {
    //       averagedSignal[i] += block[i];
    //     }
  
    //     // Move the blockStart by the step size calculated based on overlap
    //     const stepSize = this.getAveragesStepLength(dataLength, averages, overlap);
    //     blockStart += Math.floor(stepSize);  // Ensure integer step
  
    //     blockCount++;
    //   }
    //   console.log('blockCount', blockCount, periodInSamples)
  
    //   // Step 4: Calculate the average by dividing the accumulated sum by the number of blocks processed
    //   for (let i = 0; i < blockLength; i++) {
    //     averagedSignal[i] /= blockCount;  // Divide each point by the number of blocks
    //   }
  
    //   // Return the averaged signal
    //   return averagedSignal;
    // },
    // calculateBlockLength(dataLength, periodInSamples, averages, overlap) {
    //   // Use the floor of periodInSamples for block alignment
    //   const periodInSamplesInt = Math.floor(periodInSamples);
  
    //   // Calculate the step length, similar to your asynchronous approach
    //   let blockLength = this.getAveragesStepLength(dataLength, averages, overlap)
  
    //   // Adjust blockLength to ensure it is a multiple of periodInSamplesInt
    //   blockLength = Math.floor(blockLength / periodInSamplesInt) * periodInSamplesInt;
  
    //   return blockLength;
    // },
    getAveragesStepLength(dataLength, averages, overlap){
      let ovl = overlap / 100
      return dataLength / (averages * (1 - ovl) + ovl)
    },
  },
  Cascade:{
    // calculate(data, options){
    //   let opts = Object.assign({
    //     step: 10,
    //     intervalLength: 1024,
    //     dataLength: 48000,
    //     sampleRate: 48000,
    //   }, options)

    // },
    results: class{
      constructor(){
        this.channels = []
        this.tachIndices = []
        this.tachFreqs = []
        this.tachPhases = []
      }
      reset(){
        this.tachIndices = []
        this.tachFreqs = []
        this.tachPhases = []
        this.channels = []
      }

      ampIndex(channelIndex){
        let output = []
        const ch = this.channels[channelIndex]
        for (var i = 0; i < this.tachFreqs.length; i++) {
          output.push([i, ch.amps[i]])
        }
        return output
      }
      ampFreq(channelIndex){
        let output = []
        const ch = this.channels[channelIndex]
        
        for (var i = 0; i < this.tachFreqs.length; i++) {
          let freq = Math.round(this.tachFreqs[i])
          output.push([freq, ch.amps[i]])
        }
        return output
      }
      phaseFreq(channelIndex){
        let output = []
        const ch = this.channels[channelIndex]
        for (var i = 0; i < this.tachFreqs.length; i++) {
          let freq = Math.round(this.tachFreqs[i])
          output.push([freq, ch.phaseShifts[i]])
        }
        return output
      }
      phaseAmp(channelIndex){
        let output = []
        const ch = this.channels[channelIndex]
        for (var i = 0; i < this.tachFreqs.length; i++) {
          let freq = Math.round(this.tachFreqs[i])
          output.push([ch.amps[i], ch.phaseShifts[i], freq])
        }
        return output
      }
    },

    async calculateData(data, options, onDone) {
      let opts = Object.assign({
        step: 16384,
        intervalLength: 1024,
        sampleRate: 48000,
        singleChannel: false
      }, options)

      if(data.length > 0 && !Array.isArray(data[0])){
        data = [data]
      }
      

      //this.results.reset()
      let results = null
      if(opts.singleChannel){
        results = []
      }else{
        results = new this.results()
      }
      options.results = results

      const channelCount = data.length
      const step = opts.step
      const length = opts.intervalLength
      const dataLength = data[0].length



      const iterations = Math.floor(dataLength / step)

      //let tachoFFT = null

      //console.log('calculateDataAsync - iterations', iterations)
      let pos = 0
      for (var l = 0; l < iterations; l++) {
        //Copiando la señal
        let signals = []
        let canProcess = true
        for (let dataInd = 0; dataInd < channelCount; dataInd++) {
          const d = data[dataInd]

          let signal = Array(length).fill(0)
          for (var m = 0; m < length; m++) {
            let indCopy = pos + m
            if (indCopy > dataLength) {
              canProcess = false
              break
            }
            signal[m] = d[indCopy]
          }
          if (!canProcess) { break }

          signals.push(signal)
        }
        

        if (canProcess) {
          options.xAxis = pos / opts.sampleRate
          
          //await this.calculateIteration(signals, options)
          if(opts.singleChannel){
            await this.calculateIterationSingleChannel(signals, options)
          }else{
            await this.calculateIteration(signals, options)
          }
          
        } else {
          break
        }

        pos += step

      }


      if (onDone != null) {
        onDone(results)
      }else{
        return results
      }
      //console.log('results', results)
    },
    
    
    async calculateIteration(signals, options, onDone = null) {
      let opts = Object.assign({
        convertSignals: false,
        units: Enums.Units.mm_s,
        sampleRate: 48000,
        calibration: 1,
        sensitivity: 100,
        sensorType: 1,
        tachoSensitivity: 0.1,
        channels: [0, 1, 2],
        tachoChannel: 3,
        window: FFTEnums.WindowType.Hann,
        tachoWindow: FFTEnums.WindowType.Hann,
        FFTOutputType: FFTEnums.FFTOutputType.RMS,
        repairTachSignal: false,
        locate: true,

        minFilter: 0,
        maxFilter: 0,
        atenuarBajas: false,
        frequenciaAtenuacion: 600,

        RPMCepstrum: false,

        saveFFTs: false,
        startTime: new Date(),
        
        results: null
      }, options)

      // while(signals.length > opts.channels.length){
      //   opts.channels.pop()
      //   console.log('Cascade - opts.channels', opts.channels)
      // }

      //const window = opts.window
      const sr = opts.sampleRate
      const output = opts.FFTOutputType
      const cal = opts.calibration
      const sens = opts.sensitivity
      const sensorType = opts.sensorType
      const ts = opts.tachoSensitivity
      const minFilter = opts.minFilter
      const maxFilter = opts.maxFilter

      const units = opts.units


      const results = opts.results != null ? opts.results : new this.results()

      let promise = new Promise((resolve, reject) => {
        let tachIndex = 0
        let tachPhase = 0

        for (var i = -1; i < opts.channels.length; i++) {

          let isTacho = i === -1
          let ch = isTacho ? opts.tachoChannel : opts.channels[i]
          if(ch > signals.length - 1){
            continue
          }
          if (!isTacho && results.channels.length <= i) {
            results.channels.push({
              index: ch,
              amps: [],
              phases: [],
              phaseShifts: [],
              fftsBuffer: []
            })
          }

          let signal = null
          if (isTacho) {
            if (signals[ch] == null || signals[ch].length < 10) {
              // setTimeout(() => { //Le agregue el timeout porque de lo contrario se queda con el dialogo semiabierto
              //   this.dialogVisible = false
              //   Erbessd.alert(this, 'Could not find a tachomoter signal. Please check your reference settings.')
              // }, 1000);
              // return
              continue
            }
            if(opts.repairTachSignal){
              signal = EICalc.repairTachSignal(signals[ch], cal, ts)
            }else{
              signal = signals[ch]
            }
            if(opts.RPMCepstrum){
              signal = EICalc.convertSignal(signals[ch], sensorType, 3, 0, sr, cal, sens, false)
            }
            
          } else {
            if(opts.convertSignals) {
              signal = EICalc.convertSignal(signals[ch], sensorType, units, 0, sr, cal, sens, false)
            } else {
              signal = signals[ch]
            }

          }
          const window = isTacho ? opts.tachoWindow : opts.window

          let fft = EIFFT.fft(signal, window, sr, opts.atenuarBajas, opts.frequenciaAtenuacion, output, false, true)
          if (isTacho) {
            let tachFrequency = 0
            //tachoFFT = fft
            if(!opts.RPMCepstrum){
              console.log('Cascade - locateTachIndex')
              tachIndex = EICalc.locateTachIndex(fft.mag, sr, ts, minFilter, maxFilter)
              tachFrequency = EICalc.getFrequencyFromIndex(tachIndex, sr, fft.mag.length)
              if (opts.locate) {
                let ind = EICalc.Locate(tachIndex, fft.mag)
                let fftStep = (sr / 2 / fft.mag.length) * 60
                tachFrequency = fftStep * ind
              }
              
            }else{
              //calculateRPM(data, sampleRate, minRPM, maxRPM, verifyInFFT = true, locate = true)
              let res = EICalc.calculateRPM(signal, {sampleRate: sr})
              tachFrequency = res.RPM
              tachIndex = Math.round(res.index)
            }

            tachPhase = EIFFT.correctAngle(fft.phase[tachIndex] * 57.2958)
            

            results.tachIndices.push(tachIndex)
            results.tachFreqs.push(tachFrequency)
            results.tachPhases.push(tachPhase)
          } else {
            // let tachIndex = results.tachIndices.last()
            // let tachPhase = results.tachPhases.last()

            results.channels[i].amps.push(fft.mag[tachIndex])

            if(opts.saveFFTs){
              let xAxis = null
              if(opts.xAxis == null){
                if(opts.startTime != null){
                  let start = opts.startTime
                  let now = new Date()
                  xAxis = (now - start) / 1000
                }else{
                  console.log('xAxis is null')
                }
              }else{
                xAxis = opts.xAxis//(now - start) / 1000
              }
              
              
              results.channels[i].fftsBuffer.push({
                xAxis: xAxis,
                data: fft.mag
              })
            }
            

            let phase = EIFFT.correctAngle(fft.phase[tachIndex] * 57.2958)
            results.channels[i].phases.push(phase)
            let phaseShift = tachPhase - phase
            results.channels[i].phaseShifts.push(EIFFT.correctAngle(phaseShift))
          }
        }
        resolve()
      })
      await promise
      if (onDone != null) {
        onDone(results)
      }
    },
    async calculateIterationSingleChannel(signals, options){
      let opts = Object.assign({
        convertSignals: false,
        units: Enums.Units.mm_s,
        sampleRate: 48000,
        calibration: 1,
        sensitivity: 100,
        sensorType: 1,
        tachoSensitivity: 0.1,

        minFilter: 0,
        maxFilter: 0,

        window: FFTEnums.WindowType.Hann,
        FFTOutputType: FFTEnums.FFTOutputType.RMS,

        startTime: new Date(),
      }, options)


      const sr = opts.sampleRate
      const outputType = opts.FFTOutputType
      const cal = opts.calibration
      const sens = opts.sensitivity
      const sensorType = opts.sensorType
      const minFilter = opts.minFilter
      const maxFilter = opts.maxFilter
      const units = opts.units
      const window = opts.window

      const results = opts.results != null ? opts.results : []

      let promise = new Promise((resolve, reject) => {
      //let series = []
      //for(var i = 0; i < signals.length; i++){
        let signal = null
        if(opts.convertSignals) {
          signal = EICalc.convertSignal(signals[0], sensorType, units, 0, sr, cal, sens, false)
        }else{
          signal = signals[0]
        }

        let fft = EIFFT.fft(signal, window, sr, opts.atenuarBajas, opts.frequenciaAtenuacion, outputType, false, false)

        let xAxis = null
        if(opts.xAxis == null){
          if(opts.startTime != null){
            let start = opts.startTime
            let now = new Date()
            xAxis = (now - start) / 1000
          }else{
            console.log('xAxis is null')
          }
        }else{
          xAxis = opts.xAxis//(now - start) / 1000
        }
        // series.push({
        //   xAxis: xAxis,
        //   data: fft.mag
        // })
      //}
      
        results.push({
          xAxis: xAxis,
          data: fft.mag,
        })
        resolve()

      })
      await promise

      return results
      // results.push({
      //   data: series
      // })
    }
    
  },
  

  Locate(Index, FFT, SampleRate) {
    if (Index < 2) {
      return 0
    } else if (Index > FFT.length - 2) {
      return Index //Obtener_Frecuencia_de_Posicion(Index, SampleRate, FFT.length)
    }
    var Puntos = []
    if (FFT[Index - 1] > FFT[Index + 1]) {
      for (var i = 0; i < 4; i++) {
        let IndiceNuevo = Index - 2 + i
        Puntos.push({ x: IndiceNuevo, y: FFT[IndiceNuevo] })
      }
    } else {
      for (var i = 0; i < 4; i++) {
        let IndiceNuevo = Index - 1 + i
        Puntos.push({ x: IndiceNuevo, y: FFT[IndiceNuevo] })
      }
    }

    var A1, B1, A2, B2, P1, P2
    //var X1, X2, Y1, Y2: CGFloat
    //var X12, X22, Y12, Y22: CGFloat
    var X1, Y1
    var X12, Y12

    X1 = Puntos[0].x
    Y1 = Puntos[0].y

    //X2 = Puntos[1].x
    //Y2 = Puntos[1].y

    X12 = Puntos[2].x
    Y12 = Puntos[2].y

    //X22 = Puntos[3].x
    //Y22 = Puntos[3].y

    P1 = Puntos[1].y - Puntos[0].y
    P2 = Puntos[3].y - Puntos[2].y

    A1 = P1
    A2 = P2

    B1 = -X1 * A1 + Y1
    B2 = -X12 * A2 + Y12

    let indexOut = (B1 - B2) / (A2 - A1)

    if (indexOut < 0) {
      return Index //this.Obtener_Frecuencia_de_Posicion(Index, SampleRate, FFT.length)
    }

    if (Math.abs(indexOut - Index) > 1) {
      return Index //this.Obtener_Frecuencia_de_Posicion(Index, SampleRate, FFT.length)
    }
    return indexOut //this.Frecuencia_Indice_Float(indexOut, SampleRate, FFT.length)
  },
  Frecuencia_Indice_Float(Index, SampleRate, dataLength) {
    let Frec_Max_Spec = SampleRate * 30
    let Frec_Por_Valor = Frec_Max_Spec / dataLength
    return Frec_Por_Valor * Index
  },
  getMinMaxValuesOverFFT(data, sampleRate, window, startIndex, endIndex) {
    let FFTRMS = this.RMSFFT(data, window, startIndex, endIndex)
    let maxFFT = data.max()
    let maxInd = data.indexOf(maxFFT)
    let maxFreq = this.getFrequencyFromIndex(maxInd, sampleRate, data.length)
    return {
      FFTRMS,
      maxFFT,
      maxInd,
      maxFreq
    }
  },
  getMinMaxValuesOverTWF(data) {
    let timeRMS = this.RMS(data)
    let max = data.max()
    let min = data.min()
    let crestFactor = this.crestFactor(timeRMS, max, min)
    let peakToPeak = max - min
    return {
      timeRMS,
      max,
      min,
      crestFactor,
      peakToPeak
    }
  },
  getMaxFrequency(FFTData, sampleRate, minCPM, maxCPM) {
    let index = 0
    if (minCPM != null && maxCPM != null) {
      let minInd = this.Obtener_Posicion_Frecuencia(minCPM, sampleRate, FFTData.length)
      let maxInd = this.Obtener_Posicion_Frecuencia(maxCPM, sampleRate, FFTData.length)
      // console.log(minInd, maxInd, ' -----> minInd, maxInd')

      let value = FFTData[minInd]
      index = minInd
      for (var i = minInd; i < maxInd + 1; i++) {
        if (FFTData[i] > value) {
          value = FFTData[i]
          index = i
        }
      }
    } else {
      let maxFFT = FFTData.max()
      index = data.indexOf(maxFFT)
    }

    return this.getFrequencyFromIndex(index, sampleRate, FFTData.length)
  },
  correctAngle(Angle, Unit, useNegativeValues) {
    return EIFFT.correctAngle(Angle, Unit, useNegativeValues)
  },
  getMaxPosition(data, xMin, xMax, xStep, locate) {
    let dataLength = data.length

    if (dataLength > 10) {
      let minInd = 0
      let maxInd = dataLength - 1
      // if(units === 'index'){
      //   minInd = xMin
      //   maxInd = xMax
      // }else{
      minInd = Math.round(xMin / xStep)
      maxInd = Math.round(xMax / xStep)
      // }

      let output = data.maxIndex(minInd, maxInd) * xStep
      if (locate) {
        let index = output / xStep
        let roundIndex = Math.round(index)
        output = xStep * this.Locate(roundIndex, data)
      }

      return output
    } else {
      return 0
    }
  },

  repairTachSignal(data, Calibration, sensibilidad_mV) {
    var data_mV = Array(data.length).fill(0) //[Float](repeating: 0.0, count: data.length)
    for (var i = 0; i < data.length; i++) {
      data_mV[i] = data[i] * Calibration
    }
    return this.repairTachSignal_mV(data_mV, sensibilidad_mV)
  },
  repairTachSignal_mV(data_mV, sensibilidad_mV) {
    var Maximo = -Infinity
    var Minimo = Infinity
    let minCount = Math.floor(data_mV.length / 4)
    for (var i = minCount; i < data_mV.length; i++) {
      if (data_mV[i] > Maximo) {
        Maximo = data_mV[i]
      }
      if (data_mV[i] < Minimo) {
        Minimo = data_mV[i]
      }
    }
    Maximo = Math.abs(Maximo)
    Minimo = Math.abs(Minimo)

    if (Minimo > Maximo) {
      Maximo = Minimo
    }

    let Parametro = Maximo * 0.75
    var Puede_Agregar = true
    var Salida = Array(data_mV.length).fill(0) //[Float](repeating: 0.0, count: data_mV.length)

    if (Maximo >= sensibilidad_mV / 2) {
      for (var i = 0; i < data_mV.length; i++) {
        if (Math.abs(data_mV[i]) >= Parametro) {
          if (Puede_Agregar) {
            Salida[i] = Maximo
          } else {
            Salida[i] = 0
          }
          Puede_Agregar = false
        } else {
          Salida[i] = 0
          Puede_Agregar = true
        }
      }
    }
    return this.Remove_DC(Salida)
  },
  ArrayCopy(SourceArray, SourceIndex, length) {
    var counter = 0
    var i = SourceIndex
    var DestinationArray = Array(length).fill(0) //[Float](repeating: 0.0, count: length)

    while (counter < length) {
      //DestinationArray.append(SourceArray[i])
      DestinationArray[counter] = SourceArray[i]
      i += 1
      counter += 1
    }
    return DestinationArray
  },
  locateTachIndex(data, SampleRate, Sens, MinFilt, MaxFilt, Digital) {
    Sens = Sens / 10 //Agrego esta deivision porque en el FFT la amplitud puede salir muy disminuida, sobre todo si la velocidad esta cambiando
    //console.log('locateTachIndex', data.length, SampleRate, Sens, MinFilt, MaxFilt, Digital)

    if (MinFilt == null) {
      MinFilt = 0
    }
    if (MaxFilt == null) {
      MaxFilt = 0
    }
    if (Digital == null) {
      Digital = true
    }
    if (data.length < 5) {
      return 0
    }
    if (MinFilt != 0 || MaxFilt != 0) {
      var Filtro1 = this.Obtener_Posicion_Frecuencia(MinFilt, SampleRate, data.length)
      if (Filtro1 < 0) {
        Filtro1 = 0
      }
      var Filtro2 = this.Obtener_Posicion_Frecuencia(MaxFilt, SampleRate, data.length)
      if (Filtro2 > data.length - 1) {
        Filtro2 = data.length - 1
      }
      let Largo = Math.floor(Filtro2 - Filtro1)
      if (Largo < 1) {
        Largo = 1
      }
      let FFT_Y_Temp = this.ArrayCopy(data, Filtro1, Largo)
      if (FFT_Y_Temp.length === 1) {
        return Filtro1
      }
      let Max = FFT_Y_Temp.max()

      // var MaxIndex = FFT_Y_Temp.index(of: Max)!
      let MaxIndex = FFT_Y_Temp.maxIndex()
      if (MaxIndex === FFT_Y_Temp.length - 1) {
        return MaxIndex
      }
      for (var i = 0; i <= MaxIndex; i++) {
        if (FFT_Y_Temp[i] > Max / 2) {
          if (FFT_Y_Temp[i] > FFT_Y_Temp[i + 1]) {
            MaxIndex = i
          } else {
            MaxIndex = i + 1
          }
          break
        }
        //break found
      }

      return MaxIndex + Filtro1
    } else {
      let Max = data.max()
      if (Digital) {
        if (Max < Sens) {
          return 0
        }
      }

      var MaxIndex = data.indexOf(Max)
      let MaxIndSearch = Math.floor(MaxIndex * 0.66)
      for (var i = 0; i <= MaxIndSearch; i++) {
        if (data[i] > Max / 2) {
          if (data[i] > data[i + 1]) {
            MaxIndex = i
          } else {
            MaxIndex = i + 1
          }
          break
        }
      }
      return MaxIndex
    }
  },
  angleDifference(angle1, angle2) {
    let diff = Math.abs(angle2 - angle1) % 360
    return diff > 180 ? 360 - diff : diff
  },
  isAngleBetween(target, angle1, angle2) {
    // Normalize angles to be within 0 and 360
    target = (360 + (target % 360)) % 360
    angle1 = (3600000 + angle1) % 360
    angle2 = (3600000 + angle2) % 360

    if (angle1 < angle2) return target >= angle1 && target <= angle2
    if (angle1 > angle2) return target >= angle1 || target <= angle2
    return true
  },
  calculateSensorSaturation(data){
    let max1 = Math.abs(data.min())
    let max2 = data.max()
    let max = Math.max(max1, max2)
    return max / 32768
  },
  getOffset(data, calibration = 1, sensorSensitivity = 1){
    let offset = data.average()
    return (offset * calibration) / sensorSensitivity
  },
  calculateModifier(modifier, signal, fft, options) {
    let opts = Object.assign({
      minHz: 0, 
      maxHz: 0,
      minRPM: 0,
      maxRPM: 0,
      sampleRate: 25600
    }, options)
    const {minHz, maxHz} = opts
    switch (modifier) {
      case Enums.UnitsModifiers.rms:
        return fft.rms(minHz, maxHz)
      case Enums.UnitsModifiers.cf:
        return EICalc.getCrestFactor(signal)
      case Enums.UnitsModifiers.max:
        return signal.max()
      case Enums.UnitsModifiers.min:
        return signal.min(minHz, maxHz)
      case Enums.UnitsModifiers.maxFFT:
        return fft.max(minHz, maxHz)
      case Enums.UnitsModifiers.minFFT:
        return fft.min(minHz, maxHz)
      case Enums.UnitsModifiers.peakToPeak:
        return signal.max() - signal.min()
      case Enums.UnitsModifiers.derivedPeak:
        return fft.rms(minHz, maxHz) * 1.414213562
      case Enums.UnitsModifiers.truePeak:
        return [Math.abs(signal.max()), Math.abs(signal.min())].max()
      case Enums.UnitsModifiers.lowFrequency:
        let minHzLF = EICalc.constants.getValue('lowFrequency', 'minHz')
        let maxHzLF = EICalc.constants.getValue('lowFrequency', 'maxHz')
        return fft.rms(minHzLF, maxHzLF)
      case Enums.UnitsModifiers.mediumFrequency:
        let minHzMF = EICalc.constants.getValue('mediumFrequency', 'minHz')
        let maxHzMF = EICalc.constants.getValue('mediumFrequency', 'maxHz')
        return fft.rms(minHzMF, maxHzMF)
      case Enums.UnitsModifiers.highFrequency:
        let minHzHF = EICalc.constants.getValue('highFrequency', 'minHz')
        let maxHzHF = EICalc.constants.getValue('highFrequency', 'maxHz')
        return fft.rms(minHzHF, maxHzHF)
      case Enums.UnitsModifiers.octaveBands:
        return Erbessd.octaveBands.getOctaveBandsFromFFT(fft)
      case Enums.UnitsModifiers.average:
        return signal.average()
      case Enums.UnitsModifiers.kurtosis:
        return EICalc.statistics.kurtosis(signal)
        //return EICalc.statistics.impulseFactor(signal)
      case Enums.UnitsModifiers.skewness:
        return EICalc.statistics.skewness(signal)
        //return EICalc.statistics.shapeFactor(signal)
      case Enums.UnitsModifiers.eRPM:
        const {minRPM, maxRPM, sampleRate} = opts
        return EICalc.calculateRPM(signal, { sampleRate, minRPM, maxRPM }).RPM
      case Enums.UnitsModifiers.hilbertEnvelope:
        return EICalc.advanced.hilbertEnvelopeRMS(signal)
      case Enums.UnitsModifiers.offset:
        let offset = this.getOffset(options.data.data, options.data.calibration, options.data.sensorSensitivity)
        return offset
    }
    return null
  },
  calculateRPM(data, options){
    let opts = Object.assign({
      sampleRate: 4800,
      convertSignal: true,
      unitForCepstrum: Enums.Units.mm_s,
      minRPM: 0, 
      maxRPM: 0, 
      verifyInFFT: true, 
      locate: true,

      verify0WithAE: true,
      minGe: EICalc.constants.getValue('inactivityValues', 'gE', 'g3'),
      minG: EICalc.constants.getValue('inactivityValues', 'g', 'g3'),

      verify0WithVel: true,
      velocityVerification:{
        min: EICalc.constants.getValue('inactivityValues', 'mm_s', 'g3'),
        minFreq:  EICalc.constants.getValue('inactivityValues', 'velFreqMin', 'g3'), 
        maxFreq: EICalc.constants.getValue('inactivityValues', 'velFreqMax', 'g3')
      },
      

      calibration: 1,
      sensitivity: 1,
      sensorType: 1,

      aTWF: null,
      aeTWF: null,
      velTWF: null,
      velFFT: null

      //signalTypeIn: Enums.SignalTypeIn.Acceleration
    }, options)

    const {sampleRate, minRPM, maxRPM, verifyInFFT, locate, verify0WithAE, verify0WithVel, convertSignal, unitForCepstrum} = opts
    const {minG, minGe, calibration, sensitivity, sensorType} = opts

    let configuredRPM = 1000
    if(minRPM != 0 && maxRPM != 0){
      configuredRPM = (minRPM + maxRPM) / 2
    }

    let RPMis0 = false
    if(verify0WithAE){
      
      //EICalc.convertSignal(vdata, this.SignalTypeIn, Enums.Units.mm_s, 1000, this.sampleRate, this.channels[channelIndex].calibration, this.channels[channelIndex].sensitivity, this.analogFilter)
      let ASignal = opts.aTWF
      if(ASignal == null){
        ASignal = EICalc.convertSignal(data, sensorType, Enums.Units.g, configuredRPM, sampleRate, calibration, sensitivity, true)
      }
      let AESignal = opts.aeTWF
      if(AESignal == null){
        AESignal = EICalc.convertSignal(data, sensorType, Enums.Units.gE, configuredRPM, sampleRate, calibration, sensitivity, true)
      }
      
      let GeRMS = EICalc.RMS(AESignal)
      let gRMS = EICalc.RMS(ASignal)
      //let peakToPeak = AESignal.max() - AESignal.min()
      //console.log('Ge RMS:', RMS, 'PP', peakToPeak)
      //RPMis0 = RMS > minGe
      //console.log('RMS Accel', gRMS, GeRMS)
      if(GeRMS < minGe && gRMS < minG){
        RPMis0 = true
      }else{
        RPMis0 = false
      }
    }
    let vdata = opts.velTWF
    let velFFT = opts.velFFT
    if(RPMis0 && verify0WithVel){
      const velocityVerification = opts.velocityVerification
      if(vdata == null){
        vdata = EICalc.convertSignal(data, sensorType, Enums.Units.mm_s, configuredRPM, sampleRate, calibration, sensitivity, true)
      }

      if(velFFT == null){
        velFFT = EIFFT.getFFT(vdata, 4, sampleRate, true, 600, true, 1, 1, false, false, false)
      }
      
      //RMSFFT_Freq(FFTData, window, sampleRate, frecMinHz, frecMaxHz) {
      let RMSVel = EICalc.RMSFFT_Freq(velFFT.mag, 4, sampleRate, velocityVerification.minFreq, velocityVerification.maxFreq)
      //console.log('FFT vel RMS', RMSVel)
      if(RMSVel < velocityVerification.min){
        RPMis0 = true
      }else{
        RPMis0 = false
      }
    }

    if(RPMis0){
      return {RPM: 0, index: -1}
    }

    //vdata = EICalc.convertSignal(velocityData, this.SignalTypeIn, Enums.Units.mm_s, 1000, this.sampleRate, this.channels[channelIndex].calibration, this.channels[channelIndex].sensitivity, this.analogFilter)
    let signalForCepstrum = null
    
    if(convertSignal){
      if(unitForCepstrum == Enums.Units.mm_s && vdata != null){
        signalForCepstrum = vdata
      }else{
        signalForCepstrum = EICalc.convertSignal(data, sensorType, unitForCepstrum, 1000, sampleRate, calibration, sensitivity, true)
      }
      //console.log('RMS Velocity', EICalc.RMS(signalForCepstrum)) 
    }else{
      signalForCepstrum = data
    }

    let fftComplex = new EIFFT.FFTComplex({data: signalForCepstrum, sampleRate: sampleRate})
    let minFreq = 1
    let maxFreq = 120
    
    if ((minRPM == maxRPM || minRPM > maxRPM) && (minRPM != 0 && maxRPM != 0)) {
      return {RPM: minRPM, index: 0}
    } 

    if(minRPM > 0 || maxRPM > 0){
      minFreq = minRPM / 60
      maxFreq = maxRPM / 60
    }
    
    let freq = fftComplex.getFundamental(minFreq, maxFreq)
    if(verifyInFFT && freq != null){
      //getFFT(data, window, sampleRate, atenuarBajas, frecuenciaAtenuacion, FFTOutput, averages, overlap, peakHold, getRealImx, getPhase
      let fft = null
      if(velFFT != null && unitForCepstrum == Enums.Units.mm_s && convertSignal){
        fft = velFFT
      }else{
        fft = EIFFT.getFFT(data, 4, sampleRate, false)
      }
      
      let minF = freq - 0.5
      let maxF = freq + 0.5
      let maxIndex = fft.maxIndex(minF, maxF)
      if(locate){
        maxIndex = EICalc.Locate(maxIndex, fft.mag, sampleRate)
      }
      const correctedFreq = fft.getFrequencyAt(maxIndex) / 60
      //console.log('calculateRPM - original:', freq * 60, 'correctedFreq:', correctedFreq * 60)
      freq = correctedFreq
    }
    
    let fftLength = EIFFT.NearestPow2Length(data.length) / 2
    let index = EICalc.getIndexFromFrequency(freq, sampleRate, fftLength, false)
    let output = {RPM: freq * 60, index: index}
    //console.log('calculateRPM', output)
    return output
  },

  advanced: {
    average(arr) {
      return EICalc.Average(arr)
    },
    Promediar(Datos, MasMenos) {
      let Salida = Datos.slice() // Copy of Datos array

      for (let i = 0; i < Datos.length; i++) {
        if (i < MasMenos) {
          let Temp = Datos.slice(0, i + MasMenos)
          Salida[i] = this.average(Temp)
        } else if (i > Datos.length - MasMenos - 1) {
          let Temp = Datos.slice(i - MasMenos, Datos.length)
          Salida[i] = this.average(Temp)
        } else {
          let Temp = Datos.slice(i - MasMenos, i + MasMenos)
          Salida[i] = this.average(Temp)
        }
      }

      return Salida
    },
    Cross_Power(Principal, Señal_Comparar, sampleRate) {
      // getFFT(data, window, sampleRate, atenuarBajas, frecuenciaAtenuacion, FFTOutput, averages, overlap, peakHold, getRealImx, getPhase, refData = null)

      let FFT_Principal = EIFFT.getFFT(Principal, 4, sampleRate, false, 0, true, 1, 1, false, true, false)
      let FFT_Comparar = EIFFT.getFFT(Señal_Comparar, 4, sampleRate, false, 0, true, 1, 1, false, true, false)
      let FFT_Cruzada = this.CrossFFT(FFT_Principal, FFT_Comparar)
      return FFT_Cruzada
    },

    CrossFFT(X_Datos, Y_Datos) {
      let Real_Salida = []
      let Imag_Salida = []

      // X_Datos.real = this.Dividir_Señal(X_Datos.real)
      // X_Datos.imag = this.Dividir_Señal(X_Datos.imag)
      // Y_Datos.real = this.Dividir_Señal(Y_Datos.real)
      // Y_Datos.imag = this.Dividir_Señal(Y_Datos.imag)

      for (let i = 0; i < X_Datos.real.length; i++) {
        let X = { A: X_Datos.real[i], B: X_Datos.imag[i] }
        let Y = { A: Y_Datos.real[i], B: Y_Datos.imag[i] }
        let Resultado = this.Cruzar_Numeros_Complejos(X, Y)
        Real_Salida.push(Resultado.A)
        Imag_Salida.push(Resultado.B)
      }

      let Salida = {
        real: Real_Salida,
        imag: Imag_Salida,
        mag: new Array(Real_Salida.length).fill(0),
        phase: new Array(Real_Salida.length).fill(0)
      }

      for (let i = 0; i < Salida.real.length; i++) {
        Salida.mag[i] = Math.sqrt(Math.pow(Salida.real[i], 2) + Math.pow(Salida.imag[i], 2))
        Salida.phase[i] = EIFFT.correctAngle((EIFFT.phase(Salida.real[i], Salida.imag[i]), null, true))
      }

      return Salida
    },

    Cruzar_Numeros_Complejos(X, Y) {
      return this.MultiplyComplex(X, this.Combine_Complex_Number(Y))
    },

    Dividir_Señal(Data) {
      let Largo = Math.floor(Data.length / 2)
      return Data.slice(0, Largo)
    },

    Combine_Complex_Number(X) {
      return { A: X.A, B: -X.B }
    },

    MultiplyComplex(X, Y) {
      return {
        A: X.A * Y.A - X.B * Y.B,
        B: X.A * Y.B + X.B * Y.A
      }
    },

    Divide_Complex_by_Real_Number(Numerador, Denominador) {
      return {
        A: Numerador.A / Denominador,
        B: Numerador.B / Denominador
      }
    },

    Auto_Power_Spectrum(Datos) {
      Datos.APS = new Array(Datos.real.length).fill(0)
      for (let i = 0; i < Datos.real.length; i++) {
        Datos.APS[i] = Math.pow(Datos.real[i], 2) + Math.pow(Datos.imag[i], 2)
      }
      return Datos
    },

    coherence_FFT(X_Datos, Y_Datos) {
      let Cruce = this.CrossFFT(X_Datos, Y_Datos)

      // X_Datos.real = this.Dividir_Señal(X_Datos.real)
      // X_Datos.imag = this.Dividir_Señal(X_Datos.imag)
      // Y_Datos.real = this.Dividir_Señal(Y_Datos.real)
      // Y_Datos.imag = this.Dividir_Señal(Y_Datos.imag)

      X_Datos = this.Auto_Power_Spectrum(X_Datos)
      Y_Datos = this.Auto_Power_Spectrum(Y_Datos)

      let X_AP_Prom = this.Promediar(X_Datos.APS, 20)
      let Y_AP_Prom = this.Promediar(Y_Datos.APS, 20)
      let Real_Prom = this.Promediar(Cruce.real, 20)
      let Imag_Prom = this.Promediar(Cruce.imag, 20)

      let Coherencia = new Array(X_Datos.real.length).fill(0)

      for (let i = 0; i < X_Datos.real.length; i++) {
        let Numerador = Math.pow(Real_Prom[i], 2) + Math.pow(Imag_Prom[i], 2)
        let Denominador = X_AP_Prom[i] * Y_AP_Prom[i]
        Coherencia[i] = Numerador / Denominador
      }

      return Coherencia
    },

    hilbertEnvelopeRMS(data){
      let hEnvelope = EIFFT.hilbertEnvelope(data)
      return EICalc.RMS(hEnvelope)
    }
    
  },
  // kurtosis(signal) {
  //   const n = signal.length
  
  //   // Step 1: Calculate the mean of the signal
  //   const mean = signal.reduce((sum, value) => sum + value, 0) / n
  
  //   // Step 2: Calculate the fourth and second central moments
  //   let sum4 = 0
  //   let sum2 = 0

  //   let sum3 = 0
  //   for (let i = 0; i < n; i++) {
  //     const deviation = signal[i] - mean
  //     sum4 += Math.pow(deviation, 4)
  //     sum2 += Math.pow(deviation, 2)

  //     sum3 += Math.pow(deviation, 3)
  //   }
  
  //   // Step 3: Calculate kurtosis
  //   const kurtosis = (n * sum4) / (Math.pow(sum2, 2)) //- 3
  //   const skewness = (n * sum3) / ((Math.pow(sum2 / n, 1.5) * n))
  
  //   return {kurtosis, skewness}
  // },
  statistics:{
    // Function to calculate mean
    calculateMean(data) {
      const sum = data.reduce((acc, value) => acc + value, 0)
      return sum / data.length
    },

    // Function to calculate standard deviation
    calculateStandardDeviation(data) {
      const mean = this.calculateMean(data)
      const variance = data.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / data.length
      return Math.sqrt(variance)
    },

    // Function to calculate skewness
    skewness(data) {
      // console.log('skewness')
      const mean = this.calculateMean(data)
      const stdDev = this.calculateStandardDeviation(data)
      const skewness = data.reduce((acc, value) => acc + Math.pow((value - mean) / stdDev, 3), 0) / data.length
      return skewness;
    },

    // Function to calculate kurtosis
    kurtosis(data) {
      // console.log('kurtosis')
      const mean = this.calculateMean(data);
      const stdDev = this.calculateStandardDeviation(data);
      const kurtosis = data.reduce((acc, value) => acc + Math.pow((value - mean) / stdDev, 4), 0) / data.length
      return kurtosis
    },
    // Function to calculate the absolute mean
    calculateAbsoluteMean(data) {
      const absSum = data.reduce((acc, value) => acc + Math.abs(value), 0);
      return absSum / data.length;
    },

    // Function to calculate RMS (Root Mean Square)
    calculateRMS(data) {
      const squareSum = data.reduce((acc, value) => acc + Math.pow(value, 2), 0);
      return Math.sqrt(squareSum / data.length);
    },

    // Function to calculate the Impulse Factor
    impulseFactor(data) {
      const maxAbsValue = Math.max(...data.map(value => Math.abs(value))); // Max of absolute values
      const absMean = this.calculateAbsoluteMean(data); // Absolute mean
      return maxAbsValue / absMean;
    },

    // Function to calculate the Shape Factor
    shapeFactor(data) {
      const rms = this.calculateRMS(data); // Root Mean Square
      const absMean = this.calculateAbsoluteMean(data); // Absolute mean
      return rms / absMean;
    }
  },
  calculateLinesOfResolution(twfDataLength){
    const length = EIFFT.NearestPow2Length(twfDataLength)
    return length / 2.56
    //get nearest power of 2

  },
  isSensorInactive(g, gE, v, sensorType, calibration){
   
    //check if cal is near to 2 / 32768, or 4 / 32768 or 8 / 32768 or 16 / 32768 or 32 / 32768
    let inactiveValues = EICalc.constants.getInactivityValues(calibration, sensorType)
    let calIsOff = g < inactiveValues.g && gE < inactiveValues.gE && v < inactiveValues.mm_s
    //console.log('isSensorInactive', g, gE, v, sensorType, calibration, inactiveValues, calIsOff)
    return calIsOff

  }
}

// export const EICalcEnums = {
//     SignalTypeIn: {
//         Acceleration: 1,
//         Velocity: 2,
//         Displacement: 3,
//         Optical: 4
//     }

// }
