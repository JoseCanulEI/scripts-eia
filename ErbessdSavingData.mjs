// No llamar a Store o a cualquier libreria que necesite usar el navegador
// import { ErbessdModifiersHandle } from './ErbessdModifiersHandle'
// import moment from './plugins/moment.js'
export const ErbessdSavingData = {
    UnitsModifiers: {
        get none() {return this.fullUnits.none.value},
        get rms() {return this.fullUnits.rms.value},
        // modifiers
        get min() {return this.fullUnits.min.value},
        get max() {return this.fullUnits.max.value},
        get cf() {return this.fullUnits.cf.value},
        get peakToPeak() {return this.fullUnits.peakToPeak.value},
        get derivedPeak() {return this.fullUnits.derivedPeak.value},
        get truePeak() {return this.fullUnits.truePeak.value},
        get highFrequency() {return this.fullUnits.highFrequency.value},
        get minFFT() {return this.fullUnits.minFFT.value},
        get maxFFT() {return this.fullUnits.maxFFT.value},
        get average() {return this.fullUnits.average.value},
        get getValue() {return this.fullUnits.getValue.value},
    
        get octaveBands() {return this.fullUnits.octaveBands.value},
        get slope() {return this.fullUnits.slope.value},
        get mtf() {return this.fullUnits.mtf.value},
        get cle() {return this.fullUnits.cle.value},

        get kurtosis() {return this.fullUnits.kurtosis.value},
        get skewness() {return this.fullUnits.skewness.value},
        get eRPM() {return this.fullUnits.eRPM.value},
        get hilbertEnvelope() {return this.fullUnits.hilbertEnvelope.value},

        get mediumFrequency() {return this.fullUnits.mediumFrequency.value},
        get lowFrequency() {return this.fullUnits.lowFrequency.value},
        get offset() {return this.fullUnits.offset.value},

        get cluster1() {return this.fullUnits.cluster1.value},
        get cluster2() {return this.fullUnits.cluster2.value},
        get cluster3() {return this.fullUnits.cluster3.value},
        get cluster4() {return this.fullUnits.cluster4.value},
        get cluster5() {return this.fullUnits.cluster5.value},

        // get minFFT() {return this.fullUnits.minFFT.value},
        // get maxFFT() {return this.fullUnits.maxFFT.value},
    
        fullUnits: {
            none: {value: 0, label: '', description: '', parameter: '', modifier: false},
            rms: {value: 10010, label: 'RMS', description: 'Root mean square', parameter: 'RMS', modifier: false} ,
            max: {value: 10011, label: 'Max', description: 'Maximum value', parameter: 'Max', modifier: true}, // twf
            min: {value: 10012, label: 'Min', description: 'Minimum value', parameter: 'Min', modifier: true}, // twf
            average: {value: 10013, label: 'AVG', description: 'Average value', parameter: 'Avg', modifier: true},
            cf: {value: 10014, label: 'CF', description: 'Crest factor', parameter: 'CF', modifier: true},
            octaveBands: {value: 10015, label: 'OB', description: 'Octave bands', parameter: 'OB', modifier: true},
            minFFT: {value: 10016, label: 'Min FFT', description: 'Minimum value in FFT', parameter: 'Min FFT', modifier: true}, //fft
            maxFFT: {value: 10017, label: 'Max FFT', description: 'Maximum value in FFT', parameter: 'Max FFT', modifier: true}, //fft
            peakToPeak: {value: 10018, label: 'P-P', description: 'Peak to peak', parameter: 'P-P', modifier: true},
            getValue: {value: 10019, label: 'Val', description: 'Get value', parameter: 'Val', modifier: true}, //cdst valor para tasks
            derivedPeak: {value: 10020, label: 'D-P', description: 'Derived peak', parameter: 'D-P', modifier: true}, //Se puede calcular como rms * raiz(2)
            truePeak: {value: 10021, label: 'T-P', description: 'True peak', parameter: 'T-P', modifier: true}, //Se calcula como max(max, abs(min))
            highFrequency: {value: 10022, label: 'HV', description: 'High frequency', parameter: 'HV', modifier: true},
            kurtosis: {value: 10023, label: 'K', description: 'Kurtosis', parameter: 'Kurt', modifier: true, center: 3},
            skewness: {value: 10024, label: 'Sk', description: 'Skewness', parameter: 'Skew', modifier: true},
            eRPM: {value: 10025, label: 'eRPM', description: 'Estimated RPM', parameter: 'eRPM', modifier: true},
            hilbertEnvelope: {value: 10026, label: 'HE', description: 'Hilbert envelope', parameter: 'HE', modifier: true},
            mediumFrequency: {value: 10027, label: 'MF', description: 'Medium frequency', parameter: 'MF', modifier: true},
            lowFrequency: {value: 10028, label: 'LF', description: 'Low frequency', parameter: 'LF', modifier: true},
            offset: {value: 10029, label: 'Offset', description: 'Offset', parameter: 'Offset', modifier: true},

            // Clusters
            cluster1: {value: 10040, label: 'Cluster 1', description: 'Cluster Model 1', parameter: 'Cluster1'},
            cluster2: {value: 10041, label: 'Cluster 2', description: 'Cluster Model 2', parameter: 'Cluster2'},
            cluster3: {value: 10042, label: 'Cluster 3', description: 'Cluster Model 3', parameter: 'Cluster3'},
            cluster4: {value: 10043, label: 'Cluster 4', description: 'Cluster Model 4', parameter: 'Cluster4'},
            cluster5: {value: 10044, label: 'Cluster 5', description: 'Cluster Model 5', parameter: 'Cluster5'},
    
            get slope() {
                return ErbessdSavingData.Units.fullUnits.slope
            },
            get mtf() {
                return ErbessdSavingData.Units.fullUnits.mtf
            },
            get cle() {
                return ErbessdSavingData.Units.fullUnits.cle
            }
        },
        getFullUnit(value) {
            for (var key in this.fullUnits) {
              if (this.fullUnits[key].value === value) {
                return Object.assign({get id(){return this.value}}, this.fullUnits[key])
              }
            }
            return {value: -1, label: '', description: '', parameter: ''}
        },
        getOptions(excludeValues, includeOnlyValues) {
            if (excludeValues == null) {
                excludeValues = []
            }
            if (includeOnlyValues == null) {
                includeOnlyValues = []
            }
            let output = {
                options: [],
                values: []
            }
            for (var key in this.fullUnits) {
                if (!excludeValues.includes(this.fullUnits[key].value) && (includeOnlyValues.length == 0 || includeOnlyValues.includes(this.fullUnits[key].value))) {
                    output.options.push(this.fullUnits[key].description)
                    output.values.push(this.fullUnits[key].value)
                }
            }
            return output
        }
    },
    Units: {
        get all() {return [this.fullUnits.g,this.fullUnits.m_s2,this.fullUnits.mm_s, this.fullUnits.inch_s, this.fullUnits.um, this.fullUnits.mils, this.fullUnits.gE, this.fullUnits.bit, this.fullUnits.Temperature, this.fullUnits.Amperage,this.fullUnits.RPM, this.fullUnits.Phase, this.fullUnits.GPIO, this.fullUnits.Volts, this.fullUnits.BatteryStatus, this.fullUnits.internalTemperature, this.fullUnits.RSSI, this.fullUnits.OB_Acc, this.fullUnits.OB_Vel, this.fullUnits.OB_Disp, this.fullUnits.OB_Env, this.fullUnits.averageTemp, this.fullUnits.minTemp, this.fullUnits.maxTemp, this.fullUnits.AmpsMin, this.fullUnits.AmpsMax, this.fullUnits.AmpsAverage, this.fullUnits.AmpsHour]},
        get g() {return this.fullUnits.g.value},
        get m_s2() {return this.fullUnits.m_s2.value},
        get mm_s() {return this.fullUnits.mm_s.value},
        get mms() {return this.fullUnits.mm_s.value},
        get inch_s() {return this.fullUnits.inch_s.value},
        get um() {return this.fullUnits.um.value},
        get mils() {return this.fullUnits.mils.value},
        get gE() {return this.fullUnits.gE.value},
        get bit() {return this.fullUnits.bit.value},
        get Temperature() {return this.fullUnits.Temperature.value},
        get Amperage() {return this.fullUnits.Amperage.value},
        get money() {return this.fullUnits.money.value},
        get RPM() {return this.fullUnits.RPM.value},
        get Phase() {return this.fullUnits.Phase.value},
        get GPIO() {return this.fullUnits.GPIO.value},
        get Volts() {return this.fullUnits.Volts.value},
        get BatteryStatus() {return this.fullUnits.BatteryStatus.value},
        get internalTemperature() {return this.fullUnits.internalTemperature.value},
        get RSSI() {return this.fullUnits.RSSI.value},
    
        //#region modifier dependant
        get cfAcceleration() {return this.fullUnits.cfAcceleration.value},
        get cfVelocity() {return this.fullUnits.cfVelocity.value},
        get cfDisplacement() {return this.fullUnits.cfDisplacement.value},
        get cfAccelEnvelope() {return this.fullUnits.cfAccelEnvelope.value},
    
        get slope() {return this.fullUnits.slope.value},
        get mtf() {return this.fullUnits.mtf.value},
        get cle() {return this.fullUnits.cle.value},
    
        //Minimum value for TWF
        get minAcc() {return this.fullUnits.minAcc.value},
        get minVel() {return this.fullUnits.minVel.value},
        get minDisp() {return this.fullUnits.minDisp.value},
        get minAE() {return this.fullUnits.minAE.value},
    
        //Maximum value for TWF
        get maxAcc() {return this.fullUnits.maxAcc.value},
        get maxVel() {return this.fullUnits.maxVel.value},
        get maxDisp() {return this.fullUnits.maxDisp.value},
        get maxAE() {return this.fullUnits.maxAE.value},
    
        get derivedPeakAcc() {return this.fullUnits.derivedPeakAcc.value},
        get derivedPeakVel() {return this.fullUnits.derivedPeakVel.value},
        get derivedPeakDisp() {return this.fullUnits.derivedPeakDisp.value},
        get derivedPeakAE() {return this.fullUnits.derivedPeakAE.value},
    
        get truePeakAcc() {return this.fullUnits.truePeakAcc.value},
        get truePeakVel() {return this.fullUnits.truePeakVel.value},
        get truePeakDisp() {return this.fullUnits.truePeakDisp.value},
        get truePeakAE() {return this.fullUnits.truePeakAE.value},
    
        get peakToPeakAcc() {return this.fullUnits.peakToPeakAcc.value},
        get peakToPeakVel() {return this.fullUnits.peakToPeakVel.value},
        get peakToPeakDisp() {return this.fullUnits.peakToPeakDisp.value},
        get peakToPeakAE() {return this.fullUnits.peakToPeakAE.value},
    
        get highFrequencyAcc() {return this.fullUnits.highFrequencyAcc.value},
        get highFrequencyVel() {return this.fullUnits.highFrequencyVel.value},
        get highFrequencyDisp() {return this.fullUnits.highFrequencyDisp.value},
        get highFrequencyAE() {return this.fullUnits.highFrequencyAE.value},

        // backup
        get minFFTAcc() {return this.fullUnits.minFFTAcc.value},
        get minFFTVel() {return this.fullUnits.minFFTVel.value},
        get minFFTDisp() {return this.fullUnits.minFFTDisp.value},
        get minFFTAE() {return this.fullUnits.minFFTAE.value},
        
        // backup
        get maxFFTAcc() {return this.fullUnits.maxFFTAcc.value},
        get maxFFTVel() {return this.fullUnits.maxFFTVel.value},
        get maxFFTDisp() {return this.fullUnits.maxFFTDisp.value},
        get maxFFTAE() {return this.fullUnits.maxFFTAE.value},
    
        get avgAcc() {return this.fullUnits.avgAcc.value},
        get avgVel() {return this.fullUnits.avgVel.value},
        get avgDisp() {return this.fullUnits.avgDisp.value},
        get avgAE() {return this.fullUnits.avgAE.value},
        
        //#endregion
        get averageTemp() {return this.fullUnits.averageTemp.value},
        get minTemp() {return this.fullUnits.minTemp.value},
        get maxTemp() {return this.fullUnits.maxTemp.value},
        get AmpsMin() {return this.fullUnits.AmpsMin.value},
        get AmpsMax() {return this.fullUnits.AmpsMax.value},
        get AmpsAverage() {return this.fullUnits.AmpsAverage.value},
        get AmpsHour() {return this.fullUnits.AmpsHour.value},
    
        get Zanalog_mms() {return this.fullUnits.Zanalog_mms.value},
        get Zanalog_GE() {return this.fullUnits.Zanalog_GE.value},
        get Zanalog_Temp() {return this.fullUnits.Zanalog_Temp.value},
        get Zanalog_EV1() {return this.fullUnits.Zanalog_EV1.value},
        get Zanalog_EV2() {return this.fullUnits.Zanalog_EV2.value},
        get Zanalog_EV3() {return this.fullUnits.Zanalog_EV3.value},
        get avgAcc() {return this.fullUnits.avgAcc.value},
        get avgVel() {return this.fullUnits.avgVel.value},
        get avgDisp() {return this.fullUnits.avgDisp.value},
        get avgAE() {return this.fullUnits.avgAE.value},

        // backup
    
        get minTWFAcc() { return this.fullUnits.minAcc.value },
        get minTWFVel() { return this.fullUnits.minVel.value },
        get minTWFDisp() { return this.fullUnits.minDisp.value },
        get minTWFAE() { return this.fullUnits.minAE.value },
        get maxTWFAcc() { return this.fullUnits.maxAcc.value },
        get maxTWFVel() { return this.fullUnits.maxVel.value },
        get maxTWFDisp() { return this.fullUnits.maxDisp.value },
        get maxTWFAE() { return this.fullUnits.maxAE.value },

        get sensorSaturation() { return this.fullUnits.sensorSaturation.value },
        get sampleRate() { return this.fullUnits.sampleRate.value },
        get sensorCalibration() { return this.fullUnits.sensorCalibration.value },
        get linesOfResolution() { return this.fullUnits.linesOfResolution.value },
        get sensorSensitivity() { return this.fullUnits.sensorSensitivity.value },

        get cluster() { return this.fullUnits.cluster.value },

        // get eRPM_Acc() { return this.fullUnits.eRPM_Acc.value }, // New
        // get eRPM_Vel() { return this.fullUnits.eRPM_Vel.value }, // New

        // get kurtosis_Acc() { return this.fullUnits.kurtosis_Acc.value }, // New
        // get kurtosis_Vel() { return this.fullUnits.kurtosis_Vel.value }, // New
        // get kurtosis_Disp() { return this.fullUnits.kurtosis_Disp.value }, // New
        // get kurtosis_AE() { return this.fullUnits.kurtosis_AE.value }, // New

        // get skewness_Acc() { return this.fullUnits.skewness_Acc.value }, // New
        // get skewness_Vel() { return this.fullUnits.skewness_Vel.value }, // New
        // get skewness_Disp() { return this.fullUnits.skewness_Disp.value }, // New
        // get skewness_AE() { return this.fullUnits.skewness_AE.value }, // New
        // get avgAcc() { return this.fullUnits.avgAcc.value }, // New
        // get avgVel() { return this.fullUnits.avgVel.value }, // New
        // get avgDisp() { return this.fullUnits.avgDisp.value }, // New
        // get avgAE() {return this.fullUnits.avgAE.value}, // New
        fullUnits: {
            All:{value:-1, label:'All', description:'All Units', parameter:'All'},
            g: {value: 0, label: 'g', description: 'Acceleration', parameter: 'Accel', groupType: 'Vibration RMS', default: true},
            m_s2: {value: 1, label: 'm/s²', description: 'Acceleration', parameter: 'Accel', groupType: 'Vibration RMS', default: false},
            mm_s: {value: 2, label: 'mm/s', description: 'Velocity', parameter: 'Vel', groupType: 'Vibration RMS', metricUnit: 'metric', convertible: true},
            inch_s: {value: 3, label: 'inch/s', description: 'Velocity', parameter: 'Vel', groupType: 'Vibration RMS', metricUnit: 'imperial', mainUnit: 2},
            um: {value: 4, label: 'µm', description: 'Displacement', parameter: 'Disp', groupType: 'Vibration RMS', metricUnit: 'metric',  convertible: true},
            mils: {value: 5, label: 'mils', description: 'Displacement', parameter: 'Disp', groupType: 'Vibration RMS', metricUnit: 'imperial', mainUnit: 4},
            gE: {value: 6, label: 'gE', description: 'Acceleration Envelope', parameter: 'Acc Env', groupType: 'Vibration RMS', default: true},
            bit: {value: 7, label: 'On/Off', description: 'On / Off', parameter: 'Dry Contact', rules: ['bool']}, //Dry contact
            //Temperature: {value: 20, label: (Store.getters.userConfig.settings.units === 'metric' ? 'ºC' : 'ºF'), description: 'Temperature', parameter: 'Temp', groupType: 'Temperature', rules: ['neg']}, //Celsius
            Temperature: {value: 20, label: 'ºC', description: 'Temperature', parameter: 'Temp', groupType: 'Temperature', rules: ['neg']}, //Celsius
            Amperage: {value: 21, label: 'Amps', description: 'Amperage', parameter: 'Amp', groupType: 'Current'},
            RPM: {value: 22, label: 'RPM', description: 'RPM', parameter: 'RPM', groupType: 'Speed'},
            Phase: {value: 23, label: 'º', description: 'Phase', parameter: 'Phase', groupType: 'Current'},
            GPIO: {value: 24, label: 'GPIO', description: 'GPIO', parameter: 'GPIO'},
            Volts: {value: 25, label: 'V', description: 'Voltage', parameter: 'Volts', groupType: 'Current'},
            // BatteryStatus: {value: 26, label: '%', description: 'Percentage of battery', parameter: 'Bat Status'},
            BatteryStatus: {value: 26, label: '%', description: 'Battery Level', parameter: 'Bat Status', groupType: 'Internal sensor'},
            // updated by JCCD -- 17-11-2022 -- se invierten para estar en sintonia con BD y Erbessd
            //internalTemperature: {value: 27, label: (Store.getters.userConfig.settings.units === 'metric' ? 'ºC' : 'ºF'), description: 'Internal Temperature', parameter: 'Int Temp', groupType: 'Internal sensor'},
            internalTemperature: {value: 27, label: 'ºC', description: 'Internal Temperature', parameter: 'Int Temp', groupType: 'Internal sensor'},
            RSSI: {value: 28, label: 'dB', description: 'Signal Strength', parameter: 'RSSI', groupType: 'Internal sensor'},
    
            OB_Acc: {value: 30, label: 'OB Acc', description: 'Octave bands Acceleration', parameter: 'OB Acc', groupType: 'Octave Band'},
            OB_Vel: {value: 31, label: 'OB Vel', description: 'Octave bands Velocity', parameter: 'OB Vel', groupType: 'Octave Band', convertible: true, mainUnit: 2},
            OB_Disp: {value: 32, label: 'OB Disp', description: 'Octave bands Displacement', parameter: 'OB Disp', groupType: 'Octave Band', convertible: true, mainUnit: 4},
            OB_Env: {value: 33, label: 'OB AE', description: 'Octave bands Acc Env', parameter: 'OB AE', groupType: 'Octave Band'},

            // Clustering
            cluster: { value: 50, label: 'Cluster', description: 'Cluster', parameter: 'Cluster' },
            
            //#region Modifiers
            cfAcceleration: {value: 9010, label: 'cfa', description: 'Crest Factor Acceleration', parameter: 'CF Acc', groupType: 'Vibration modifiers', mainGroup: 'Crest Factor', modifier: 10014, mainUnit: 0},
            cfVelocity: {value: 9011, label: 'cfv', description: 'Crest Factor Velocity', parameter: 'CF Vel', groupType: 'Vibration modifiers', mainGroup: 'Crest Factor', modifier: 10014, mainUnit: 2},
            cfDisplacement: {value: 9012, label: 'cfd', description: 'Crest Factor Displacement', parameter: 'CF Disp', groupType: 'Vibration modifiers', mainGroup: 'Crest Factor', modifier: 10014, mainUnit: 4},
            cfAccelEnvelope: {value: 9013, label: 'cfae', description: 'Crest Factor Acceleration Envelope', parameter: 'CF Acc Env', groupType: 'Vibration modifiers', mainGroup: 'Crest Factor', modifier: 10014, mainUnit: 6},
    
            slope: {value: 9020, label: 'slp', description: 'Slope', parameter: 'Slope'},
            mtf: {value: 9021, label: 'days', description: 'Mean time to failure', parameter: 'MTF'},
            cle: {value: 9022, label: 'days', description: 'Calculated life expextancy', parameter: 'CLE'},
    
            //Minimum value for TWF
            minAcc: {value: 9030, label: 'mina', description: 'Min Acceleration', parameter: 'Min Acc', groupType: 'Vibration modifiers', mainGroup: 'Min', modifier: 10012, mainUnit: 0},
            minVel: {value: 9031, label: 'minv', description: 'Min Velocity', parameter: 'Min Vel', groupType: 'Vibration modifiers', convertible: true, mainUnit: 2, mainGroup: 'Min', modifier: 10012, mainUnit: 2},
            minDisp: {value: 9032, label: 'mind', description: 'Min Displacement', parameter: 'Min Disp', groupType: 'Vibration modifiers', convertible: true, mainUnit: 4, mainGroup: 'Min', modifier: 10012, mainUnit: 4},
            minAE: {value: 9033, label: 'minae', description: 'Min Acceleration Envelope', parameter: 'Min Acc Env', groupType: 'Vibration modifiers', mainGroup: 'Min', modifier: 10012, mainUnit: 6},
    
            //Maximum value for TWF
            maxAcc: {value: 9034, label: 'maxa', description: 'Max Acceleration', parameter: 'Max Acc', groupType: 'Vibration modifiers', mainGroup: 'Max', modifier: 10011, mainUnit: 0},
            maxVel: {value: 9035, label: 'maxv', description: 'Max Velocity', parameter: 'Max Vel', groupType: 'Vibration modifiers', convertible: true, mainUnit: 2, mainGroup: 'Max', modifier: 10011, mainUnit: 2},
            maxDisp: {value: 9036, label: 'maxd', description: 'Max Displacement', parameter: 'Max Disp', groupType: 'Vibration modifiers', convertible: true, mainUnit: 4, mainGroup: 'Max', modifier: 10011, mainUnit: 4},
            maxAE: {value: 9037, label: 'maxae', description: 'Max Acceleration Envelope', parameter: 'Max Acc Env', groupType: 'Vibration modifiers', mainGroup: 'Max', modifier: 10011, mainUnit: 6},
    
            derivedPeakAcc: {value: 9038, label: 'dpa', description: 'Derived Peak Acceleration', parameter: 'DP Acc', groupType: 'Vibration modifiers', mainGroup: 'Derived Peak', modifier: 10020, mainUnit: 0},
            derivedPeakVel: {value: 9039, label: 'dpv', description: 'Derived Peak Velocity', parameter: 'DP Vel', groupType: 'Vibration modifiers', convertible: true, mainUnit: 2, mainGroup: 'Derived Peak', modifier: 10020, mainUnit: 2},
            derivedPeakDisp: {value: 9040, label: 'dpd', description: 'Derived Peak Displacement', parameter: 'DP Disp', groupType: 'Vibration modifiers', convertible:true, mainUnit: 4, mainGroup: 'Derived Peak', modifier: 10020, mainUnit: 4},
            derivedPeakAE: {value: 9041, label: 'dpae', description: 'Derived Peak Acceleration Envelope', parameter: 'DP Acc Env', groupType: 'Vibration modifiers', mainGroup: 'Derived Peak', modifier: 10020, mainUnit: 6},
    
            truePeakAcc: {value: 9042, label: 'tpa', description: 'True Peak Acceleration', parameter: 'TP Acc', groupType: 'Vibration modifiers', mainGroup: 'True Peak', modifier: 10021, mainUnit: 0},
            truePeakVel: {value: 9043, label: 'tpv', description: 'True Peak Velocity', parameter: 'TP Vel', groupType: 'Vibration modifiers', convertible: true, mainUnit: 2, mainGroup: 'True Peak', modifier: 10021, mainUnit: 2},
            truePeakDisp: {value: 9044, label: 'tpd', description: 'True Peak Displacement', parameter: 'TP Disp', groupType: 'Vibration modifiers', convertible: true, mainUnit: 4, mainGroup: 'True Peak', modifier: 10021, mainUnit: 4},
            truePeakAE: {value: 9045, label: 'tpae', description: 'True Peak Acceleration Envelope', parameter: 'TP Acc Env', groupType: 'Vibration modifiers', mainGroup: 'True Peak', modifier: 10021, mainUnit: 6},
    
            peakToPeakAcc: {value: 9046, label: 'ppa', description: 'Peak to Peak Acceleration', parameter: 'PP Acc', groupType: 'Vibration modifiers', mainGroup: 'Peak to Peak', modifier: 10018, mainUnit: 0},
            peakToPeakVel: {value: 9047, label: 'ppv', description: 'Peak to Peak Velocity', parameter: 'PP Vel', groupType: 'Vibration modifiers', convertible: true, mainUnit: 2, mainGroup: 'Peak to Peak', modifier: 10018, mainUnit: 2},
            peakToPeakDisp: {value: 9048, label: 'ppd', description: 'Peak to Peak Displacement', parameter: 'PP Disp', groupType: 'Vibration modifiers', convertible: true, mainUnit: 4, mainGroup: 'Peak to Peak', modifier: 10018, mainUnit: 4},
            peakToPeakAE: {value: 9049, label: 'ppae', description: 'Peak to Peak Acceleration Envelope', parameter: 'PP Acc Env', groupType: 'Vibration modifiers', mainGroup: 'Peak to Peak', modifier: 10018, mainUnit: 6},
    
            highFrequencyAcc: {value: 9050, label: 'hfa', description: 'High Frequency Acceleration', parameter: 'HF Acc', groupType: 'Vibration modifiers', mainGroup: 'High Frequency', modifier: 10022, mainUnit: 0},
            highFrequencyVel: {value: 9051, label: 'hfv', description: 'High Frequency Velocity', parameter: 'HF Vel', groupType: 'Vibration modifiers', convertible: true, mainUnit: 2, mainGroup: 'High Frequency', modifier: 10022, mainUnit: 2},
            highFrequencyDisp: {value: 9052, label: 'hfd', description: 'High Frequency Displacement', parameter: 'HF Disp', groupType: 'Vibration modifiers', convertible: true, mainUnit: 4, mainGroup: 'High Frequency', modifier: 10022, mainUnit: 4},
            highFrequencyAE: {value: 9053, label: 'hfae', description: 'High Frequency Acceleration Envelope', parameter: 'HF Acc Env', groupType: 'Vibration modifiers', mainGroup: 'High Frequency', modifier: 10022, mainUnit: 6},
            
            //No es un modificador de vibración pero no se muevo para mantener un orden en los indices
            money: {value:9054, label: 'money', description: 'Cost per consumption', parameter: 'Money'},
            
            // backup
            minFFTAcc: {value: 9055, label: 'minffta', description: 'Min Acceleration FFT', parameter: 'Min Acc FFT', groupType: 'Vibration modifiers', mainGroup: 'MinFFT', mainUnit: 0, modifier: 10016},
            minFFTVel: {value: 9056, label: 'minfftv', description: 'Min Velocity FFT', parameter: 'Min Vel FFT', groupType: 'Vibration modifiers', convertible: true, mainUnit: 2, mainGroup: 'MinFFT', modifier: 10016},
            minFFTDisp: {value: 9057, label: 'minfftd', description: 'Min Displacement FFT', parameter: 'Min Disp FFT', groupType: 'Vibration modifiers', convertible: true, mainUnit: 4, mainGroup: 'MinFFT', modifier: 10016},
            minFFTAE: {value: 9058, label: 'minfftae', description: 'Min Acceleration Envelope FFT', parameter: 'Min Acc Env FFT', groupType: 'Vibration modifiers', mainGroup: 'MinFFT', mainUnit: 6, modifier: 10016},

            // backup
            maxFFTAcc: {value: 9059, label: 'maxffta', description: 'Max Acceleration FFT', parameter: 'Max Acc FFT', groupType: 'Vibration modifiers', mainGroup: 'MaxFFT', mainUnit: 0, modifier: 10017},
            maxFFTVel: {value: 9060, label: 'maxfftv', description: 'Max Velocity FFT', parameter: 'Max Vel FFT', groupType: 'Vibration modifiers', convertible: true, mainUnit: 2, mainGroup: 'MaxFFT', modifier: 10017},
            maxFFTDisp: {value: 9061, label: 'maxfftd', description: 'Max Displacement FFT', parameter: 'Max Disp FFT', groupType: 'Vibration modifiers', convertible: true, mainUnit: 4, mainGroup: 'MaxFFT', modifier: 10017},
            maxFFTAE: {value: 9062, label: 'maxfftae', description: 'Max Acceleration Envelope FFT', parameter: 'Max Acc Env FFT', groupType: 'Vibration modifiers', mainGroup: 'MaxFFT', mainUnit: 6, modifier: 10017},
            
            avgAcc: {value: 9063, label: 'avga', description: 'Avg Acceleration', parameter: 'Avg Acc', groupType: 'Vibration modifiers', mainGroup: 'Average', modifier: 10013, mainUnit: 0},
            avgVel: {value: 9064, label: 'avgv', description: 'Avg Velocity', parameter: 'Avg Vel', groupType: 'Vibration modifiers', convertible: true, mainUnit: 2, mainGroup: 'Average', modifier: 10013, mainUnit: 2},
            avgDisp: {value: 9065, label: 'avgd', description: 'Avg Displacement', parameter: 'Avg Disp', groupType: 'Vibration modifiers', convertible: true, mainUnit: 4, mainGroup: 'Average', modifier: 10013, mainUnit: 4},
            avgAE: {value: 9066, label: 'avgae', description: 'Avg Acceleration Envelope', parameter: 'Avg Acc Env', groupType: 'Vibration modifiers', mainGroup: 'Average', modifier: 10013, mainUnit: 6},

            averageTemp: {value: 9997, label: 'Avg ºC', description: 'Avg Temperature', parameter: 'Avg Temp', groupType: 'Temperature', rules: ['neg']},
            minTemp: {value: 9998, label: 'Min ºC', description: 'Min Temperature', parameter: 'Min Temp', groupType: 'Temperature', rules: ['neg']},
            maxTemp: {value: 9999, label: 'Max ºC', description: 'Max Temperature', parameter: 'Max Temp', groupType: 'Temperature', rules: ['neg']},
            
            //#endregion
    
            AmpsMin: {value: 10000, label: 'Amp min', description: 'Min Amperage', parameter: 'MinAmp', groupType: 'Amperage', subGroupType: 'Current', mainUnit: 21},
            AmpsMax: {value: 10001, label: 'Amp max', description: 'Max Amperage', parameter: 'MaxAmp', groupType: 'Amperage', subGroupType: 'Current', mainUnit: 21},
            AmpsAverage: {value: 10002, label: 'Amp avg', description: 'Avg Amperage', parameter: 'AvgAmp', groupType: 'Amperage', subGroupType: 'Current', mainUnit: 21},
            AmpsHour: {value: 10003, label: 'Amp/h', description: 'Ampers hour', parameter: 'Amp/h', groupType: 'Amperage', subGroupType: 'Current', mainUnit: 21},
    
    
            //General
            // rms: {value: 10010, label: 'RMS', description: 'Root Mean Square', parameter: 'RMS'},
            // max: {value: 10011, label: 'Max', description: 'Maximum value', parameter: 'Max'},
            // min: {value: 10012, label: 'Min', description: 'Minimum value', parameter: 'Min'},
            // average: {value: 10013, label: 'avg', description: 'Average value', parameter: 'Avg'},
            // cf: {value: 10014, label: 'CF', description: 'Crest factor', parameter: 'CF'},
            // octaveBands: {value: 10015, label: 'OB', description: 'Octave bands', parameter: 'OB'},
            // minFFT: {value: 10016, label: 'Min FFT', description: 'Minimum value in FFT', parameter: 'Min FFT'},
            // maxFFT: {value: 10016, label: 'Max FFT', description: 'Maximum value in FFT', parameter: 'Max FFT'},
            // peakToPeak: {value: 10016, label: 'P-P', description: 'Peak to Peak', parameter: 'P-P'}
            Zanalog_mms: { value: 8, label: 'Zanalog mms', description: 'Analog mms', parameter: 'Analog mms' },
            Zanalog_GE: { value: 9, label: 'Zanalog GE', description: 'Analog GE', parameter: 'Analog GE' },
            Zanalog_Temp: { value: 10, label: 'Zanalog Temp', description: 'Analog Temperature', parameter: 'Analog Temp' },
            Zanalog_EV1: { value: 11, label: 'Zanalog EV1', description: 'Analog EV1', parameter: 'Analog EV1' },
            Zanalog_EV2: { value: 12, label: 'Zanalog EV2', description: 'Analog EV2', parameter: 'Analog EV2' },
            Zanalog_EV3: { value: 13, label: 'Zanalog EV3', description: 'Analog EV3', parameter: 'Analog EV3' },
    
            Envelope_Alarms_Acc: { value: 30, label: 'Envelope Alarms Acc', description: 'Envelope Alarms Acceleration', parameter: 'AccelEnvelope', groupType: 'Env Alarms' },
            Envelope_Alarms_Vel: { value: 31, label: 'Envelope Alarms Vel', description: 'Envelope Alarms Velocity', parameter: 'VelEnvelope', groupType: 'Env Alarms' },
            Envelope_Alarms_Disp: { value: 32, label: 'Envelope Alarms Disp', description: 'Envelope Alarms Displacement', parameter: 'DispEnvelope', groupType: 'Env Alarms' },
            Envelope_Alarms_Env: { value: 33, label: 'Envelope Alarms Env', description: 'Envelope Alarms Envelope', parameter: 'EnvEnvelope', groupType: 'Env Alarms' },
            minTWFAcc: { value: 9055, label: 'minTWFAcc', description: 'Minimum Acceleration TWF', parameter: 'TWFAccel', groupType: 'TWF' },
            minTWFVel: { value: 9056, label: 'minTWFVel', description: 'Minimum Velocity TWF', parameter: 'TWFVel', groupType: 'TWF' },
            minTWFDisp: { value: 9057, label: 'minTWFDisp', description: 'Minimum Displacement TWF', parameter: 'TWFDisp', groupType: 'TWF' },
            minTWFAE: { value: 9058, label: 'minTWFAE', description: 'Minimum Acceleration Envelope TWF', parameter: 'TWFAE', groupType: 'TWF' },
            maxTWFAcc: { value: 9059, label: 'maxTWFAcc', description: 'Maximum Acceleration TWF', parameter: 'TWFAccel', groupType: 'TWF' },
            maxTWFVel: { value: 9060, label: 'maxTWFVel', description: 'Maximum Velocity TWF', parameter: 'TWFVel', groupType: 'TWF' },
            maxTWFDisp: { value: 9061, label: 'maxTWFDisp', description: 'Maximum Displacement TWF', parameter: 'TWFDisp', groupType: 'TWF' },
            maxTWFAE: { value: 9062, label: 'maxTWFAE', description: 'Maximum Acceleration Envelope TWF', parameter: 'TWFAE', groupType: 'TWF' },

            sensorSaturation: { value: 9067, label: 'Sensor Saturation', description: 'Sensor Saturation', parameter: 'Sensor Saturation', groupType: 'Internal sensor' },
            sampleRate: { value: 9068, label: 'Sample Rate', description: 'Sample Rate', parameter: 'Sample Rate', groupType: 'Internal sensor' },
            sensorCalibration: { value: 9069, label: 'Sensor Calibration', description: 'Sensor Calibration', parameter: 'Sensor Calibration', groupType: 'Internal sensor' },
            linesOfResolution: { value: 9070, label: 'Lines of Resolution', description: 'Lines of Resolution', parameter: 'Lines of Resolution', groupType: 'Internal sensor' },
            sensorSensitivity: { value: 9071, label: 'Sensor Sensitivity', description: 'Sensor Sensitivity', parameter: 'Sensor Sensitivity', groupType: 'Internal sensor' },
            // !!!!! IMPORTANTE !!!!! Arriba de 20,000 esta reservado para los modificador de vibración
        },
        getFullUnit(value) {
            value = Number(value)
            if(value >= 20000){
              return this.getCreatedMergedModifierUnitFullUnit(value)
            }
            for (var key in this.fullUnits) {
              if (this.fullUnits[key].value === value) {
                return Object.assign({get id(){return this.value}}, this.fullUnits[key])
              }
            }
            return {value: -1, label: '', description: '', parameter: ''}
        },
        getCreatedMergedModifierUnitFullUnit(value){
            //convert unit to short int and modifier to short int to create one integer that we can latter split
            let {modifier, unit} = this.unpackIntModifierUnit(value)
    
            let modifierFull = ErbessdSavingData.UnitsModifiers.getFullUnit(modifier)
            let unitFull = this.getFullUnit(unit)
            //g: {value: 0, label: 'g', description: 'Acceleration', parameter: 'Accel', groupType: 'Vibration RMS', default: true},
            let output = {value, label: modifierFull.label + ' ' + unitFull.label, description: modifierFull.description + ' ' + unitFull.description, parameter: modifierFull.parameter + ' ' + unitFull.parameter}
            //console.log('createMergedModifierUnit', output)
            return output
        },
        get unitsMappedByModifier(){
            return {
                [ErbessdSavingData.UnitsModifiers.rms]: {
                    [this.g]: this.g,
                    [this.m_s2]: this.m_s2,
                    [this.mm_s]: this.mm_s,
                    [this.inch_s]: this.inch_s,
                    [this.um]: this.um,
                    [this.mils]: this.mils,
                    [this.gE]: this.gE
                },
                [ErbessdSavingData.UnitsModifiers.cf]: {
                    [this.g]: this.cfAcceleration,
                    [this.m_s2]: this.cfAcceleration,
                    [this.mm_s]: this.cfVelocity,
                    [this.inch_s]: this.cfVelocity,
                    [this.um]: this.cfDisplacement,
                    [this.mils]: this.cfDisplacement,
                    [this.gE]: this.cfAccelEnvelope
                },
                [ErbessdSavingData.UnitsModifiers.octaveBands]: {
                    [this.g]: this.Envelope_Alarms_Acc,
                    [this.m_s2]: this.Envelope_Alarms_Acc,
                    [this.mm_s]: this.Envelope_Alarms_Vel,
                    [this.inch_s]: this.Envelope_Alarms_Vel,
                    [this.um]: this.Envelope_Alarms_Disp,
                    [this.mils]: this.Envelope_Alarms_Disp,
                    [this.gE]: this.Envelope_Alarms_Env
                },
                [ErbessdSavingData.UnitsModifiers.min]: {
                    [this.g]: this.minAcc,
                    [this.m_s2]: this.minAcc,
                    [this.mm_s]: this.minVel,
                    [this.inch_s]: this.minVel,
                    [this.um]: this.minDisp,
                    [this.mils]: this.minDisp,
                    [this.gE]: this.minAE
                },
                [ErbessdSavingData.UnitsModifiers.max]: {
                    [this.g]: this.maxAcc,
                    [this.m_s2]: this.maxAcc,
                    [this.mm_s]: this.maxVel,
                    [this.inch_s]: this.maxVel,
                    [this.um]: this.maxDisp,
                    [this.mils]: this.maxDisp,
                    [this.gE]: this.maxAE
                },
                [ErbessdSavingData.UnitsModifiers.derivedPeak]: {
                    [this.g]: this.derivedPeakAcc,
                    [this.m_s2]: this.derivedPeakAcc,
                    [this.mm_s]: this.derivedPeakVel,
                    [this.inch_s]: this.derivedPeakVel,
                    [this.um]: this.derivedPeakDisp,
                    [this.mils]: this.derivedPeakDisp,
                    [this.gE]: this.derivedPeakAE
                },
                [ErbessdSavingData.UnitsModifiers.peakToPeak]: {
                    [this.g]: this.peakToPeakAcc,
                    [this.m_s2]: this.peakToPeakAcc,
                    [this.mm_s]: this.peakToPeakVel,
                    [this.inch_s]: this.peakToPeakVel,
                    [this.um]: this.peakToPeakDisp,
                    [this.mils]: this.peakToPeakDisp,
                    [this.gE]: this.peakToPeakAE
                },
                [ErbessdSavingData.UnitsModifiers.truePeak]: {
                    [this.g]: this.truePeakAcc,
                    [this.m_s2]: this.truePeakAcc,
                    [this.mm_s]: this.truePeakVel,
                    [this.inch_s]: this.truePeakVel,
                    [this.um]: this.truePeakDisp,
                    [this.mils]: this.truePeakDisp,
                    [this.gE]: this.truePeakAE
                },
                [ErbessdSavingData.UnitsModifiers.highFrequency]: {
                    [this.g]: this.highFrequencyAcc,
                    [this.m_s2]: this.highFrequencyAcc,
                    [this.mm_s]: this.highFrequencyVel,
                    [this.inch_s]: this.highFrequencyVel,
                    [this.um]: this.highFrequencyDisp,
                    [this.mils]: this.highFrequencyDisp,
                    [this.gE]: this.highFrequencyAE
                },
                [ErbessdSavingData.UnitsModifiers.average]: {
                    [this.g]: this.avgAcc,
                    [this.m_s2]: this.avgAcc,
                    [this.mm_s]: this.avgVel,
                    [this.inch_s]: this.avgVel,
                    [this.um]: this.avgDisp,
                    [this.mils]: this.avgDisp,
                    [this.gE]: this.avgAE
                },
                [ErbessdSavingData.UnitsModifiers.minFFT]: {
                    [this.g]: this.minFFTAcc,
                    [this.m_s2]: this.minFFTAcc,
                    [this.mm_s]: this.minFFTVel,
                    [this.inch_s]: this.minFFTVel,
                    [this.um]: this.minFFTDisp,
                    [this.mils]: this.minFFTDisp,
                    [this.gE]: this.minFFTAE
                },
                [ErbessdSavingData.UnitsModifiers.maxFFT]: {
                    [this.g]: this.maxFFTAcc,
                    [this.m_s2]: this.maxFFTAcc,
                    [this.mm_s]: this.maxFFTVel,
                    [this.inch_s]: this.maxFFTVel,
                    [this.um]: this.maxFFTDisp,
                    [this.mils]: this.maxFFTDisp,
                    [this.gE]: this.maxFFTAE
                }
                // [ErbessdSavingData.UnitsModifiers.kurtosis]: {
                //     [this.g]: this.kurtosis_Acc,
                //     [this.m_s2]: this.kurtosis_Acc,
                //     [this.mm_s]: this.kurtosis_Vel,
                //     [this.inch_s]: this.kurtosis_Vel,
                //     [this.um]: this.kurtosis_Disp,
                //     [this.mils]: this.kurtosis_Disp,
                //     [this.gE]: this.kurtosis_AE
                // },
                // [ErbessdSavingData.UnitsModifiers.skewness]: {
                //     [this.g]: this.skewness_Acc,
                //     [this.m_s2]: this.skewness_Acc,
                //     [this.mm_s]: this.skewness_Vel,
                //     [this.inch_s]: this.skewness_Vel,
                //     [this.um]: this.skewness_Disp,
                //     [this.mils]: this.skewness_Disp,
                //     [this.gE]: this.skewness_AE
                // },
                // [ErbessdSavingData.UnitsModifiers.eRPM]: {
                //     [this.g]: this.eRPM_Acc,
                //     [this.m_s2]: this.eRPM_Acc,
                //     [this.mm_s]: this.eRPM_Vel,
                //     [this.inch_s]: this.eRPM_Vel,
                // }

            }
        },
        mergeModifier(unit, modifier) {
            if(unit == null || unit < 0){
                return null
            }
            if(modifier == 10010){//RMS
                return unit
            }
            if (unit > this.gE && unit != this.cluster) {
                return unit;
            }
        
            let mappings = this.unitsMappedByModifier
        
            if (mappings[modifier] != null) {
                if (mappings[modifier][unit] != null) {
                    return mappings[modifier][unit]
                }
            }

            return this.packModifierUnit(modifier, unit)//this.createMergedModifierUnit(modifier, unit)
        
            //return unit;
        },
        splitUnit(unit){
            if(unit == null || unit < 0){
                return null
            }
            if(unit >= 20000){
                return this.unpackIntModifierUnit(unit)
            }
            let mappings = this.unitsMappedByModifier
            for (const [modifier, units] of Object.entries(mappings)) {
                if (Object.values(units).includes(unit)) {
                    //return the key as unit
                    let key = Number(Object.keys(units).find(key => units[key] === unit))
                    return { unit: key, modifier: Number(modifier) }
                }
            }
            
            return { unit, modifier: ErbessdSavingData.UnitsModifiers.rms }
        },
        packModifierUnit(m, u) {
            //make sure m and u are numbers
            m = Number(m)
            u = Number(u)

            // Ensure m and u are within their respective ranges
            if (m < 10010) {
                throw new RangeError('m must be between 10010 and 10099.');
            }
            if (u < 0 || u > 100) {
                throw new RangeError('u must be between 0 and 100.');
            }
            
            // Normalize m and u to zero-based indices
            const mIndex = m - 10010; // 0 to 89
            const uIndex = u;         // 0 to 100
            
            // Calculate combination index
            const combinationIndex = mIndex * 101 + uIndex; // 0 to 9089
            
            // Shift into valid int16 storage range
            const storedValue = 20000 + combinationIndex; // 20000 to 29089
            
            // Ensure storedValue fits in int16
            // if (storedValue > 32767) {
            //     throw new RangeError('Stored value exceeds int16 maximum.');
            // }
            return storedValue;
        },
        
        unpackIntModifierUnit(n) {
            n = Number(n)

            if(n < 20000){
                return { modifier: ErbessdSavingData.UnitsModifiers.rms, unit: n }
            }
            // Ensure n is within the valid stored value range
            if (n < 20000 || n > 32767) {
                throw new RangeError('Stored value must be between 20000 and 32767.');
            }
            
            // Calculate combination index
            const combinationIndex = n - 20000; // 0 to 12767
            
            // Recover mIndex and uIndex
            const mIndex = Math.floor(combinationIndex / 101); // 0 to 89
            const uIndex = combinationIndex % 101;             // 0 to 100
            
            // Convert indices back to original values
            const m = mIndex + 10010;
            const u = uIndex;
            
            return { modifier: m, unit: u };
        }
    },
    FrequencyUnits: {
        Hz: 0,
        CPM: 1,
        Orders: 2,
        toString(value) {
            switch (value) {
                case this.Hz:
                    return 'Hz'
                case this.CPM:
                    return 'CPM'
                case this.Orders:
                    return 'Orders'

                default:
                    return ''
                break;
            }
        }
    },
    machinery: {
        // Es necesario??
        generatedCodes: new Set(),
        Machine: class {
            constructor(options){
                if(options != null && typeof options === 'object'){
                    let obj = ErbessdSavingData.machinery.Machine.model(options)
                    Object.assign(this, obj)
                }
                this.ID = -1
                this.Name = ''
                this.Points = []
                this.MachineCode = -1
                this.Coupling = 0
                this.SlopeInterval = 90
            }
            static model(item) {
                if(item != null && item.Points != null && item.Points.length > 0) {
                    for(var i = 0; i < item.Points.length; i++) {
                        item.Points[i] = ErbessdSavingData.machinery.MachinePoint.model(item.Points[i])
                    }
                }
                return Object.assign(new ErbessdSavingData.machinery.Machine(), item)
            }
            static getRandomCode() {
                let code
                do {
                    code = Math.floor(Math.random() * (2147483646 - 10000)) + 10000
                } while (ErbessdSavingData.machinery.generatedCodes.has(code))
                ErbessdSavingData.machinery.generatedCodes.add(code)
                return code
            }
        },
        MachinePoint: class{
            constructor(name, RPMType, applyAlarmToAxes, destroyGeneralAlarmPointAxes, minDef, maxDef, axesDef, severityDefaults, showPoint, learningModel = 'default', bearing, pointIndex = -1, machineCode = -1, gearBoxId, minHz = 10, maxHz = 1000) {
                if(name != null && typeof name == 'object'){
                    let obj = ErbessdSavingData.machinery.MachinePoint.model(name)
                    Object.assign(this, obj)
                    return
                }
        
                if(RPMType == null) {RPMType = '1'}
                if(applyAlarmToAxes == null) { applyAlarmToAxes = false }
                if(destroyGeneralAlarmPointAxes == null) { destroyGeneralAlarmPointAxes = true }
                if (name == null) {name = 'Point'}
                if (minDef == null) {minDef = 500}
                if (maxDef == null) {maxDef = 5000}
        
                if (minHz == null) {minHz = 10}
                if (maxHz == null) {maxHz = 1000}
        
                if (axesDef == null) {
                    axesDef = new ErbessdSavingData.machinery.Axes(true) //this.axesMode(severityDefaults)
                }else{
                    axesDef = new ErbessdSavingData.machinery.Axes(axesDef)
                }
                if (severityDefaults == null) {
                    severityDefaults = new ErbessdSavingData.machinery.SeverityObject()
                }else{
                    severityDefaults = new ErbessdSavingData.machinery.SeverityObject(severityDefaults)
                }
                
                if (bearing == null){
                    bearing = null
                }else{
                    bearing = new ErbessdSavingData.machinery.Bearing(bearing)
                }
        
                if (showPoint == null) { showPoint = true }
                // if(learningModel === 'default') {
                //     const currentDate = moment()
                //     const futureMonth = moment(currentDate).add(1, 'M')
        
                //     learningModel = ErbessdSavingData.machineLearning.configuration.model()
                //     learningModel.name = 'Default'
                //     learningModel.group = 'Default'
                //     learningModel.dueDate = futureMonth.format('YYYY-MM-DD')
                //     learningModel.description = 'This is a model learning default. Edit this model if required'
                // }
        
                let output = {
                    ID: -1,
                    MachineCode: machineCode,
                    Index: pointIndex,
                    Name: name,
                    RPMType: RPMType,
                    applyAlarmToAxes: applyAlarmToAxes,
                    destroyGeneralAlarmPointAxes: destroyGeneralAlarmPointAxes,
                    MinRPM: minDef,
                    MaxRPM: maxDef,
                    axes: axesDef,
                    severitiesObject: severityDefaults,
                    showPoint: true,
                    showDetails: false,
                    Bearing: bearing,
                    machineLearningModel: learningModel,
                    GearBoxID:gearBoxId,
                    //RMS range Hz
                    MaxHzRMS: maxHz,
                    MinHzRMS: minHz,
                }
                for(var key in output) {
                    this[key] = output[key]
                }
                this.verify()
            }
            static model(item) {
                if(item != null) {
                    if(item.axes != null) {
                        item.axes = ErbessdSavingData.machinery.Axes.model(item.axes)
                    }
                    if(item.bearing != null) {
                        item.bearing = ErbessdSavingData.machinery.Bearing.model(item.bearing)
                    }
                    if(item.severities != null) {
                        if(Array.isArray(item)){
                            //Viejo formato
                            item.severitiesObject = new ErbessdSavingData.machinery.SeverityObject(false, item.severities)
                        }else{
                            item.severitiesObject = ErbessdSavingData.machinery.SeverityObject.model(item.severities)
                        }
                    }
                }
                
                return Object.assign(new ErbessdSavingData.machinery.MachinePoint(), item)
            }
            verify() {
                if(this.axes != null){
                    this.axes.verify()
                }
            }
        },
        Axes: class{
            constructor(options) {
                if(options != null && typeof options == 'object'){
                    let obj = ErbessdSavingData.machinery.Axes.model(options)
                    Object.assign(this, obj)
                }else{
                    this.h = new ErbessdSavingData.machinery.SeverityAxis(options)
                    this.v = new ErbessdSavingData.machinery.SeverityAxis(options)
                    this.a = new ErbessdSavingData.machinery.SeverityAxis(options)
                }
            }
            verify() {
                for(var key in this) {
                    if(this[key] != null && this[key].verify != null){
                        this[key].verify()
                    }
                }
            }
            static model(item) {
                if(typeof item == 'string'){
                    item = JSON.parse(item)
                }
                if(item != null) {
                    if(item.h != null) {
                        item.h = ErbessdSavingData.machinery.SeverityAxis.model(item.h)
                    }
                    if(item.v != null) {
                        item.v = ErbessdSavingData.machinery.SeverityAxis.model(item.v)
                    }
                    if(item.a != null) {
                        item.a = ErbessdSavingData.machinery.SeverityAxis.model(item.a)
                    }
                }
                return Object.assign(new ErbessdSavingData.machinery.Axes(), item)
            }
        },
        SeverityAxis: class {
            constructor(useDefaults = false) {
                this.enabled = true;
                this.severitiesObject = new ErbessdSavingData.machinery.SeverityObject(useDefaults);
                this.trendUnits = [];
                this.trendOctaves = []
                
                if (useDefaults === true) {
                    this.trendUnits.push(new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g))
                    this.trendUnits.push(new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.mm_s, ErbessdSavingData.UnitsModifiers.rms, 10, 1000))
                    this.trendUnits.push(new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.gE))
        
                    // this.trendOctaves = [ErbessdSavingData.Units.g, ErbessdSavingData.Units.mms, ErbessdSavingData.Units.gE]
                }
            }
        
            get selectedSeverities() {
                if (this.severitiesObject != null) {
                    return this.severitiesObject.selectedSeverities
                } else {
                    return null
                }
            }
        
            get selectedOctaveBandSeverities() {
                if (this.severitiesObject != null) {
                    return this.severitiesObject.selectedOctaveBandSeverities
                } else {
                    return null
                }
            }
        
            set mlOctaveBandSeverities(value) {
                if (this.severitiesObject == null) {
                    this.severitiesObject = new ErbessdSavingData.machinery.SeverityObject()
                }
                this.severitiesObject.mlOctaveBandSeverities = value
            }
        
            get mlOctaveBandSeverities() {
                if (this.severitiesObject != null) {
                    return this.severitiesObject.mlOctaveBandSeverities
                } else {
                    return null;
                }
            }
        
            set mlSeverities(value) {
                if (this.severitiesObject == null) {
                    this.severitiesObject = new ErbessdSavingData.machinery.SeverityObject();
                }
                this.severitiesObject.mlSeverities = value
            }
        
            get mlSeverities() {
                if (this.severitiesObject != null) {
                    return this.severitiesObject.mlSeverities
                } else {
                    return null;
                }
            }
        
            set old_mlSeverities(value) {
                if (this.severitiesObject == null) {
                    this.severitiesObject = new ErbessdSavingData.machinery.SeverityObject();
                }
                this.severitiesObject.old_mlSeverities = value
            }
        
            get old_mlSeverities() {
                if (this.severitiesObject != null) {
                    return this.severitiesObject.old_mlSeverities
                } else {
                    return null;
                }
            }
    
            verify() {
                if(this.severities != null){
                    if(Array.isArray(this.severities)){
                        this.severities = new ErbessdSavingData.machinery.SeverityObject(false, this.severities, this.octaveBandSeverities, this.mlSeverities, this.mlOctaveBandSeverities, this.old_mlSeverities)
                    }
                }
            }
    
            static deserialize(json) {
                return this.model(JSON.parse(json))
            }
    
            static model(item) {
                if(typeof item == 'string'){
                    item = JSON.parse(item)
                }
                if(item != null) {
                    if(item.hasOwnProperty('severitiesObject')){
                        if (!Array.isArray(item.severitiesObject)) {
                            item.severitiesObject = ErbessdSavingData.machinery.SeverityObject.model(item.severitiesObject)
                        } else {
                            item.severitiesObject = new ErbessdSavingData.machinery.SeverityObject()
                        }
                    }else{
                        item.severitiesObject = new ErbessdSavingData.machinery.SeverityObject(false, item.severities, item.octaveBandSeverities, item.mlSeverities, item.mlOctaveBandSeverities, item.old_mlSeverities)
                        delete item.octaveBandSeverities
                        delete item.mlSeverities
                        delete item.mlOctaveBandSeverities
                        delete item.old_mlSeverities
                    }
                    
                    if(item.trendUnits != null) {
                        item.trendUnits = item.trendUnits.map((trendUnit) => {
                            return ErbessdSavingData.machinery.TrendUnit.model(trendUnit)
                        })
                    }
                }
                
                return Object.assign(new ErbessdSavingData.machinery.SeverityAxis(true), item)
            }
        },
        SeverityObject: class{
            constructor(useDefaults = false, severities = [], octaveBandSeverities = [], mlSeverities = [], mlOctaveBandSeverities = [], old_mlSeverities = [], severityTypes = ErbessdSavingData.severityTypes.anyDefaultUser) {
                if(useDefaults != null && typeof useDefaults == 'object'){
                    let obj = ErbessdSavingData.machinery.SeverityObject.model(useDefaults)
                    Object.assign(this, obj)
                    return
                }
                if(useDefaults && severities.length == 0){
                    severities = ErbessdSavingData.machinery.severity.defaults()
                    octaveBandSeverities = []
                    mlSeverities = []
                    mlOctaveBandSeverities = []
                    old_mlSeverities = []
                }
                if(severities == null) severities = []
                if(octaveBandSeverities == null) octaveBandSeverities = []
                if(mlSeverities == null) mlSeverities = []
                if(mlOctaveBandSeverities == null) mlOctaveBandSeverities = []
                if(old_mlSeverities == null) old_mlSeverities = []
        
                this.severities = severities
                this.octaveBandSeverities = octaveBandSeverities
                
                this.old_mlSeverities = old_mlSeverities
                this.mlSeverities = mlSeverities
                this.mlOctaveBandSeverities = mlOctaveBandSeverities
                
                this.severityType = severityTypes
                this.verify()
            }
            get selectedSeverities() {
                if (this.severityType === ErbessdSavingData.severityTypes.user) {
                    return this.severities;
                } else if (this.severityType === ErbessdSavingData.severityTypes.machineLearning) {
                    return this.mlSeverities;
                } else if (this.severityType === ErbessdSavingData.severityTypes.anyDefaultUser) {
                    if (this.severities != null && this.severities.length > 0) {
                        return this.severities;
                    } else {
                        return this.mlSeverities;
                    }
                } else if (this.severityType === ErbessdSavingData.severityTypes.anyDefaultML) {
                    if (this.mlSeverities != null && this.mlSeverities.length > 0) {
                        return this.mlSeverities;
                    } else {
                        return this.severities;
                    }
                } else {
                    return null;
                }
            }
            get selectedOctaveBandSeverities() {
                if (this.severityType === ErbessdSavingData.severityTypes.user) {
                    return this.octaveBandSeverities;
                } else if (this.severityType === ErbessdSavingData.severityTypes.machineLearning) {
                    return this.mlOctaveBandSeverities;
                } else if (this.severityType === ErbessdSavingData.severityTypes.anyDefaultUser) {
                    if (this.octaveBandSeverities != null && this.octaveBandSeverities.length > 0) {
                        return this.octaveBandSeverities;
                    } else {
                        return this.mlOctaveBandSeverities;
                    }
                } else if (this.severityType === ErbessdSavingData.severityTypes.anyDefaultML) {
                    if (this.mlOctaveBandSeverities != null && this.mlOctaveBandSeverities.length > 0) {
                        return this.mlOctaveBandSeverities;
                    } else {
                        return this.octaveBandSeverities;
                    }
                } else {
                    return null;
                }
            }
            verify(){
                if(this.octaveBandSeverities == null){
                    this.octaveBandSeverities = []
                }
                if(this.mlOctaveBandSeverities == null){
                    this.mlOctaveBandSeverities = []
                }
            }
            static model(item, ifEmptyReturnNull = false) {
                if(typeof item == 'string'){
                    item = JSON.parse(item)
                }
                if(item != null && Array.isArray(item)){
                    if(item.length === 0){
                        if(ifEmptyReturnNull){
                            return null
                        }else{
                            return new ErbessdSavingData.machinery.SeverityObject(false)
                        }
                    }else{
                        return new ErbessdSavingData.machinery.SeverityObject(false, item)
                    }
                }else{
                    const output = Object.assign(new ErbessdSavingData.machinery.SeverityObject(), item)
                    output.verify()
                    return output
                }
            }
            sort(){
                if(this.severities != null){
                    this.severities = this.severities.sort((a, b) => {
                        return a.unit - b.unit
                    })
                }
                if(this.octaveBandSeverities != null){
                    this.octaveBandSeverities = this.octaveBandSeverities.sort((a, b) => {
                        return a.unit - b.unit
                    })
                }
            }
        },
        severity: class{
            constructor(unit = -1, y = -1, o = -1, r = -1, id = -1) {
                // Added new properties for the new way to save the Severity configurations
                this.o = o;
                this.r = r;
                this.y = y;
                //this.notification = null;
                this.id = id;
                this.unit = unit;
            }
    
            static model(item) {
                return Object.assign(new ErbessdSavingData.machinery.severity(), item)
            }
    
            static defaults() {
                let sevVelocity = new ErbessdSavingData.machinery.severity(2, 1.12, 2.8, 7.1, 2)
                let sevAE = new ErbessdSavingData.machinery.severity(6, 0.6, 1.2, 1.8, 6)
                return [sevVelocity, sevAE]
            }
    
            static notification = {
                types: {
                    greaterThan: 0,
                    lessThan: 1,
                    equalTo: 2,
                    notEqualTo: 3,
                    between: 4,
                    toString(value) {
                        switch (value) {
                            case this.greaterThan: return 'greater than'
                            case this.lessThan: return 'less than'
                            case this.equalTo: return 'equal to'
                            case this.notEqualTo: return 'not equal to'
                            case this.between: return 'between'
                            default: return ''
                        }
                    },
                    shortLabel(value) {
                        switch (value) {
                            case this.greaterThan: return '>'
                            case this.lessThan: return '<'
                            case this.equalTo: return '='
                            case this.notEqualTo: return '!='
                            case this.between: return 'between'
                            default: return ''
                        }
                    },
                    options() {
                        let output = []
                        for (var i = 0; i < 5; i++) {
                            output.push({
                            type: i,
                            label: this.toString(i),
                            shortLabel: this.shortLabel(i)
                            })
                        }
                        return output
                    },
                    stringOptions() {
                        let output = []
                        for(var i = 0; i < 5; i++) {
                            output.push(this.shortLabel(i))
                        }
                        return output
                    },
                    values() {
                        return [0,1,2,3,4]
                    }
                },
                model() {
                    return {
                        enabled: false,
                        type: this.types.greaterThan,
                        value1: 0,
                        value2: 0,
                        mtf: 90,
                        cle: 0,
                        temporaryDisabled: false,
                        text: '',
                        enableAfterDate: '2010/01/01 12:00:01'//Date()
                    }
                }
            }
        },
        // Necesario para la configuracion de la maquina
        TrendUnit: class {
            constructor(unit, modifier = ErbessdSavingData.UnitsModifiers.rms, minHz = -1, maxHz = -1, trend = true) {
                if (typeof unit == 'object' && unit != null) {
                    let tu = unit
                    if (tu.unit != null) {
                        this.unit = tu.unit
                    }
                    if (tu.u != null) {
                        this.unit = tu.u
                    }
                    if (tu.modifier != null) {
                        this.modifier = tu.modifier
                    }
                    if (tu.m != null) {
                        this.modifier = tu.m
                    }
                    if (tu.trend != null) {
                        this.trend = tu.trend
                    }
                } else {
                    this.unit = unit
                    this.modifier = modifier
                    this.trend = trend
                }

                if (minHz == -1) {
                    if (this.unit == ErbessdSavingData.Units.mms && this.modifier == ErbessdSavingData.UnitsModifiers.rms) {
                        minHz = 10
                    } else {
                        minHz = 0
                    }
                }
                if (maxHz == -1) {
                    if (this.unit == ErbessdSavingData.Units.mms && this.modifier == ErbessdSavingData.UnitsModifiers.rms) {
                        maxHz = 1000
                    } else {
                        maxHz = 0
                    }
                }

                this.minHz = minHz
                this.maxHz = maxHz
            }
            static model(item) {
                return Object.assign(new ErbessdSavingData.machinery.TrendUnit(), item)
            }
        }
    },
    // Se borra si se van clases de machinery innecesarios
    severityTypes: {
        get user() {return this.fullTypes.user.value},
        get machineLearning() {return this.fullTypes.machineLearning.value},
        get anyDefaultUser() {return this.fullTypes.anyDefaultUser.value},
        get anyDefaultML() {return this.fullTypes.anyDefaultML.value},
        fullTypes:{
            user: { label: 'Only User Settings', value: 0, disabled: false },
            machineLearning: { label: 'Only Machine Learning Settings', value: 1, disabled: false },
            anyDefaultUser: { label: 'Default User Settings', value: 2, disabled: false },
            anyDefaultML: { label: 'Default Machine Learning Settings', value: 3, disabled: false },
        },
        getOptions() {
            const types = { value:[], label: [] }
            const object = this.fullTypes
            for (const key in object) {
                if (Object.hasOwnProperty.call(object, key)) {
                    const element = object[key];
                    if(!element.disabled) {
                        types.value.push(element.value)
                        types.label.push(element.label)
                    }
                }
            }
            return types
        }
    },
    SignalTypeIn: {
        Acceleration: 1,
        Velocity: 2,
        Displacement: 3,
        Optical: 4,
        toChar(type) {
            switch (type) {
            case this.Acceleration: return 'A'
            case this.Velocity: return 'V'
            case this.Displacement: return 'D'
            case this.Optical: return 'O'
            default:
                break;
            }
        }
    },
    SensorType: {
        All: -1,
        None: 0,
        StandardAccelerometer: 1,
        Velocimeter: 2,
        Displacement: 3,
        Optical: 4,
        Temperature: 5,
        Phantom122: 10,
        Phantom222: 11,
        PhantomBiAxial: 12,
        PhantomAllInOneLR: 13,
        PhantomAllInOneHR: 14,
        PhantomATXLR: 15,
        PhantomATXHR: 16,
        PhantomVG2LR: 17,
        PhantomVG2HR: 18,
        PhantomTempNC: 20,
        PhantomTempTP: 21,
        PhantomAccelTemp: 22,
        PhantomGPTemp: 23,
        PhantomTempNC_v2: 24,
        PhantomTempTP_v2: 25,
        PhantomTempTP_v3: 26,
        PhantomAmp: 30,
        PhantomAmp_v2: 31,
        PhantomRPM: 40,
        PhantomRPM_Trigger: 41,
        PhantomGW_1: 50,
        PhantomGW_2: 51,
        PhantomGPIO: 60,
        PhantomGPIO_4_20: 61,
        PhantomGPIO_Digital: 62,
        PhantomGPIO_Voltimeter: 63,
        PhantomGPIO_4_20_v2: 64,
        PhantomThermoCameraSmall: 70
    },
    Severity: {
        calculateSeverity(value, Yellow, Orange, Red) {
            if (value == 0 || isNaN(value)) {
                return 0
            }
            if (Yellow <= 0 && Orange <= 0 && Red <= 0) {
                return -1
            }
    
            if (value < Yellow) {
                if (Yellow != 0) {
                    let out = value / Yellow
                    if (out < 0) {
                        out = 0
                    }
                    return out + 1
                } else {
                    return 0.5
                }
            } else if (value >= Yellow && value < Orange) {
                let Dif = Orange - Yellow
                let Excedente = value - Yellow
    
                if (Dif != 0) {
                    return (Excedente / Dif) + 2
                } else {
                    return 2.5
                }
            } else if (value >= Orange && value < Red) {
                let Dif = Red - Orange
                let Excedente = value - Orange
    
                if (Dif != 0) {
                    return (Excedente / Dif) + 3
                } else {
                    return 3.5
                }
            } else {
                let Dif = Red
                let Excedente = value - Red
    
                if (Dif != 0) {
                    return (Excedente / Dif) + 4
                } else {
                    return 4.5
                }
            }
        }
    },
    calculations: {
        defaultRPM: 1000,
        envelopping: {
            removeDCAfterEnvelopping: true
        }
    },
    octaveBands: {
        ranges: null,
        octaveBandModel(min, center, max) {
            return {
                min: min,
                center: center,
                max: max
            }
        },
        getLimits(cpm, thirdOctaveBands) {
            if (thirdOctaveBands == null) {
                thirdOctaveBands = true
            }
            if (cpm == null) {
                cpm = false
            }
            let output = []

            if (thirdOctaveBands) {
                output.push(this.octaveBandModel(14.1, 16, 17.8))
                output.push(this.octaveBandModel(17.8, 20, 22.4))
                output.push(this.octaveBandModel(22.4, 25, 28.2))
                output.push(this.octaveBandModel(28.2, 31.5, 35.5))
                output.push(this.octaveBandModel(35.5, 40, 44.7))
                output.push(this.octaveBandModel(44.7, 50, 56.2))
                output.push(this.octaveBandModel(56.2, 63, 70.8))
                output.push(this.octaveBandModel(70.8, 80, 89.1))
                output.push(this.octaveBandModel(89.1, 100, 112))
                output.push(this.octaveBandModel(112, 125, 141))
                output.push(this.octaveBandModel(141, 160, 178))
                output.push(this.octaveBandModel(178, 200, 224))
                output.push(this.octaveBandModel(224, 250, 282))
                output.push(this.octaveBandModel(282, 315, 355))
                output.push(this.octaveBandModel(355, 400, 447))
                output.push(this.octaveBandModel(447, 500, 562))
                output.push(this.octaveBandModel(562, 630, 708))
                output.push(this.octaveBandModel(708, 800, 891))
                output.push(this.octaveBandModel(891, 1000, 1122))
                output.push(this.octaveBandModel(1122, 1250, 1413))
                output.push(this.octaveBandModel(1413, 1600, 1778))
                output.push(this.octaveBandModel(1778, 2000, 2239))
                output.push(this.octaveBandModel(2239, 2500, 2818))
                output.push(this.octaveBandModel(2818, 3150, 3548))
                output.push(this.octaveBandModel(3548, 4000, 4467))
                output.push(this.octaveBandModel(4467, 5000, 5623))
                output.push(this.octaveBandModel(5623, 6300, 7079))
                output.push(this.octaveBandModel(7079, 8000, 8913))
                output.push(this.octaveBandModel(8913, 10000, 11220))
                output.push(this.octaveBandModel(11220, 12500, 14130))
                output.push(this.octaveBandModel(14130, 16000, 17780))
                output.push(this.octaveBandModel(17780, 20000, 22390))
            } else {
                output.push(this.octaveBandModel(11, 16, 22))
                output.push(this.octaveBandModel(22, 31.5, 44))
                output.push(this.octaveBandModel(44, 63, 88))
                output.push(this.octaveBandModel(88, 125, 177))
                output.push(this.octaveBandModel(177, 250, 355))
                output.push(this.octaveBandModel(355, 500, 710))
                output.push(this.octaveBandModel(710, 1000, 1420))
                output.push(this.octaveBandModel(1420, 2000, 2840))
                output.push(this.octaveBandModel(2840, 4000, 5680))
                output.push(this.octaveBandModel(5680, 8000, 11360))
                output.push(this.octaveBandModel(11360, 16000, 22720))
            }
            if (cpm) {
                for (var i = 0; i < output.length; i++) {
                    output[i].min = output[i].min * 60
                    output[i].center = output[i].center * 60
                    output[i].max = output[i].max * 60
                }
            }

            return output
        },
        limits(index, freqUnits) {
            if (this.ranges == null) {
                this.ranges = this.getLimits()
            }
            let range = this.ranges[index]
            if (range == null) {
                return null
            }
            let output = Object.assign({}, range)
            if (freqUnits === ErbessdSavingData.FrequencyUnits.CPM) {
                output.min = output.min * 60
                output.center = output.center * 60
                output.max = output.max * 60
            }
            return output
        },
        thirdOctaves: null,
        getLimitsForFrequency(freqHz) {
            let ind = this.getOctaveBandIndex(freqHz)
            return this.limits(ind)
        },
        getOctaveBandIndex(freqHz) {
            if (this.thirdOctaves == null) {
                this.thirdOctaves = this.getLimits()
            }
            if (freqHz < this.thirdOctaves[0].min) {
                return -1
            }
            for (var i = 0; i < this.thirdOctaves.length; i++) {
                if (freqHz > this.thirdOctaves[i].min && freqHz <= this.thirdOctaves[i].max) {
                    return i
                }
            }
            return -1
        },
        getOctaveBandColumnName(freqHz) {
            let ind = this.getOctaveBandIndex(freqHz)
            if (ind == -1) {
                return ''
            }
            ind = ind + 1
            return 'tO' + ind.toString()
        },
        getOctaveBandsFromFFT(fft) {
            let limits = this.getLimits()
            let output = []
            for (var i = 0; i < limits.length; i++) {
                const band = limits[i]
                const min = band.min
                const max = band.max
                const val = fft.max(min, max, false, false) || 0
                output.push(val)
            }
            return output
        }
    },
    sql: {
        transform:{
            sort(data, transform) {
             
              let transf = Object.assign({
                columnIndex: 0,
                order: 'asc',
                columnType: 'number'
              }, transform)
              let columnIndex = transf.columnIndex
              let order = transf.order
              if(columnIndex > -1){
                data.data.sort((a, b) => {
                  let ad = a[columnIndex]
                  let bd = b[columnIndex]
                  if(transf.columnType === 'date'){ 
                    ad = new Date(ad)
                    bd = new Date(bd)
                  }
                  if(order === 'asc'){
                    return ad - bd
                  }else{
                    return bd - ad
                  }
                })
              }
              transform.executed = true
            },
            group(data, transform) {
                let transf = Object.assign(
                    {
                        groupIndex: 0,
                        referenceIndex: 1,
                        valueIndex: 2,
                        defaultValue: 0,
                        ensureAlignedReferences: false, // New parameter
                    },
                    transform
                );
                const { groupIndex: gIndex, referenceIndex: refIndex, valueIndex: valueIndex, defaultValue } = transf;
                const oldData = data.data;
                const willAddProps = data.propData != null;

                const groups = new Set();
                const references = new Set();

                // Maps para almacenar datos por grupo y referencia
                const groupToRefToValue = new Map();
                const groupToRefs = new Map();

                // Procesamiento inicial de oldData
                for (const oldRow of oldData) {
                    const group = oldRow[gIndex];
                    const reference = oldRow[refIndex];
                    const value = oldRow[valueIndex];

                    if (!groupToRefToValue.has(group)) {
                        groups.add(group);
                        groupToRefToValue.set(group, new Map());
                        groupToRefs.set(group, new Set());
                    }

                    references.add(reference);
                    groupToRefToValue.get(group).set(reference, value);
                    groupToRefs.get(group).add(reference);
                }

                // Convertir Set a Array para ordenación y acceso
                const groupList = Array.from(groups);
                let referenceList = Array.from(references);

                // Asegurar referencias alineadas si es necesario
                if (transf.ensureAlignedReferences) {
                    referenceList = referenceList.filter(ref =>
                        groupList.every(group => groupToRefs.get(group).has(ref))
                    );
                }

                // Ordenar referencias para consistencia
                referenceList.sort();

                // Construcción de la nueva matriz de datos
                const newColumns = [data.columns[refIndex], ...groupList];
                const ndata = referenceList.map(reference => [
                    reference,
                    ...groupList.map(group => groupToRefToValue.get(group).get(reference) ?? defaultValue)
                ]);

                // console.log(newColumns);
                // console.log(ndata);

                data.columns = newColumns;
                data.data = ndata;

                transform.executed = true;
            },
            group2(data, transform) {
              let transf = Object.assign(
                {
                  groupIndex: 0,
                  referenceIndex: 1,
                  valueIndex: 2,
                  defaultValue: 0,
                  ensureAlignedReferences: false, // New parameter
                },
                transform
              );
              
              let gIndex = transf.groupIndex;
              let refIndex = transf.referenceIndex;
              let valueIndex = transf.valueIndex;
            
              let defaultValue = transf.defaultValue;
            
              const oldData = data.data;
              const willAddProps = data.propData != null;
            
              if (transform.defaultValue != null) {
                defaultValue = transform.defaultValue;
              }
            
              let groups = [];
              let references = [];
            
              // Maps to hold group-wise data
              let groupToRefToValue = new Map();
              let groupToRefs = new Map();
            
              // Process oldData to build maps and sets
              for (let i = 0; i < oldData.length; i++) {
                const oldRow = oldData[i];
                const group = oldRow[gIndex];
                const reference = oldRow[refIndex];
                const value = oldRow[valueIndex];
            
                if (!groups.includes(group)) {
                  groups.push(group);
                  groupToRefToValue.set(group, new Map());
                  groupToRefs.set(group, new Set());
                }
            
                if (!references.includes(reference)) {
                  references.push(reference);
                }
            
                // Map of references to values for each group
                const refToValueMap = groupToRefToValue.get(group);
                if (!refToValueMap.has(reference)) {
                  refToValueMap.set(reference, value);
                } else {
                  // Duplicate reference for the same group; keep the last occurrence
                  refToValueMap.set(reference, value);
                }
            
                // Set of references for each group
                groupToRefs.get(group).add(reference);
              }
            
              if (transf.ensureAlignedReferences) {
                // Find common references across all groups
                let commonReferences = null;
                for (let [group, refSet] of groupToRefs.entries()) {
                  if (commonReferences == null) {
                    commonReferences = new Set(refSet);
                  } else {
                    commonReferences = new Set([...commonReferences].filter((x) => refSet.has(x)));
                  }
                }
                references = Array.from(commonReferences);
              }
            
              // Sort references for consistent ordering
              references.sort();
            
              // Update columns
              let newColumns = [];
              newColumns.push(data.columns[refIndex]);
              if (groups.length > 0) {
                newColumns.push(...groups);
              }
            
              // Dimensioning the new data
              let ndata = [];
              for (let i = 0; i < references.length; i++) {
                let newRow = [];
                let reference = references[i];
                newRow.push(reference);
                for (let l = 0; l < groups.length; l++) {
                  newRow.push(defaultValue);
                }
                ndata.push(newRow);
              }
            
              // Filling in the data
              let newRefIndex = 0; // Reference index in ndata rows
              for (let i = 0; i < ndata.length; i++) {
                let reference = ndata[i][newRefIndex];
                for (let l = 0; l < groups.length; l++) {
                  let group = groups[l];
                  let refToValueMap = groupToRefToValue.get(group);
                  if (refToValueMap.has(reference)) {
                    ndata[i][l + 1] = refToValueMap.get(reference);
                  }
                }
              }
            
              data.columns = newColumns;
              data.data = ndata;
            
              // Processing propData if present
              if (willAddProps) {
                const oldPropData = data.propData;
                let groupToRefToPropValue = new Map();
            
                // Build group to reference to propValue map
                for (let i = 0; i < oldPropData.length; i++) {
                  const oldPropRow = oldPropData[i];
                  const oldRow = oldData[i];
                  const group = oldRow[gIndex];
                  const reference = oldRow[refIndex];
                  const propValue = oldPropRow[valueIndex];
            
                  if (!groupToRefToPropValue.has(group)) {
                    groupToRefToPropValue.set(group, new Map());
                  }
            
                  const refToPropValueMap = groupToRefToPropValue.get(group);
                  if (!refToPropValueMap.has(reference)) {
                    refToPropValueMap.set(reference, propValue);
                  } else {
                    // Duplicate reference for the same group; keep the last occurrence
                    refToPropValueMap.set(reference, propValue);
                  }
                }
            
                let nPropData = [];
                for (let i = 0; i < references.length; i++) {
                  let newRow = [];
                  let reference = references[i];
                  newRow.push(reference);
                  for (let l = 0; l < groups.length; l++) {
                    newRow.push('');
                  }
                  nPropData.push(newRow);
                }
            
                // Filling in propData
                for (let i = 0; i < nPropData.length; i++) {
                  let reference = nPropData[i][newRefIndex];
                  for (let l = 0; l < groups.length; l++) {
                    let group = groups[l];
                    let refToPropValueMap = groupToRefToPropValue.get(group);
                    if (refToPropValueMap && refToPropValueMap.has(reference)) {
                      nPropData[i][l + 1] = refToPropValueMap.get(reference);
                    }
                  }
                }
            
                data.propData = nPropData;
              }
            
              transform.executed = true;
            },
            convert(data, transform, info){
              transform.executed = true
              if(transform != null && transform.convert != null){
                transform.convert = ErbessdSavingData.convertions.convertModel(transform.convert)
              }
             
              transform = Object.assign(
                {
                  columnIndex: null,
                  columnIndexParam: null,
                  rowIndex: -1,
                  column: null,
                  //convert: null
                }, transform)
              let colInd = transform.columnIndex
              let paramInd = transform.columnIndexParam
              let convert = transform.convert
              if (colInd > -1) {
                for(var i = 0; i < data.data.length; i++){
                  let param = null
                  if(paramInd != null) {
                    param = data.data[i][paramInd]
                  }
                  data.data[i][colInd] = ErbessdSavingData.convertions.convertValue(data.data[i][colInd], convert, transform.column, info, param)
                }
              }
            }
        },
    },
    convertions: {
        convertModel(convert) {
            if (typeof convert === 'string') {
                convert = { type: convert }
            }
            return Object.assign({
                type: '', //--'severityColor' , 'unitsParameter', 'imperial/metric'
                specialValues: [],
                convert: null
            }, convert)
        },
        convertValue(value, convert, column = null, info, param) {        
            if (!convert || convert === '' ) {
                return value
            }
            if (typeof convert === 'string') {
                return this[convert](value, convert, column, info, param)
            } else {
                if(convert.type && this[convert.type] != null) {
                    return this[convert.type](value, convert, column, info, param)
                } else {
                    return value
                }
            }
        },
        formatter(value, convert, c, info) {
            if(convert.handleNull === 'hidden' && (value === 0 || value === null)) {
                return null
            } 
            if(convert.outputFormat == ''){
                convert.outputFormat = null
            }
            if(convert.text == ''){
                convert.text = null
            }
            let special = this.checkSpecialValues(value, convert)
            if (special != null) {
                return special
            }
            let output = null
            let f
            if (convert.dataType != null) {
                switch (convert.dataType) {
                    case 'number':
                        output = Number(value)
                        let decimals = -1
                        if(convert.decimalPlaces != null){
                            decimals = convert.decimalPlaces
                        }else if(convert.autoDecimals == true){
                            decimals = output.getRecommendedDecimalsCount()
                        }
                        if(decimals > -1){
                            output = Number(output.toFixed(decimals))
                        }
                        
                        break
                    case 'int':
                        output = parseInt(value)
                        break
                    case 'date':
                        //output = Date.parse(value)
                        f = convert.incommingFormat
                        if (f == null) { f = 'YYYY-MM-DD HH:mm:ss' }
                        // output = moment(value, f).toDate()
                        break
                    case 'time':
                        f = convert.incommingFormat
                        if (f == null) { f = 'YYYY-MM-DD HH:mm:ss' }
                        output =new Date(value).fromString(f).toDate().getTime() //moment(value, f).toDate().getTime()
                        break
                    case 'dateString':
                        let incommingFormat = convert.incommingFormat
                        if (incommingFormat == null) { incommingFormat = 'YYYY-MM-DD HH:mm:ss' }
                        let outputFormat = convert.outputFormat != null ? convert.outputFormat : 'YYYY-MM-DD HH:mm:ss'

                        if(convert.intervalTimeSensitive === true) {
                            let intervalValue = 0
                            if(info != null && info.intervalValue != null){intervalValue = info.intervalValue}
                            if(convert.intervalValue != null){intervalValue = convert.intervalValue}
                            switch (intervalValue) {
                                // all time
                                case 0: // all time
                                    outputFormat = 'YYYY-MM-DD HH:mm:ss'
                                break
                                case 1: // HOUR 
                                    outputFormat = 'HH:mm'
                                break

                                case 2: // day
                                case 3: // week
                                    outputFormat = 'YYYY-MM-DD'
                                break;
                                
                                case 4: // month
                                    outputFormat = 'YYYY-MM'
                                break;
                                
                                case 5: // YEAR
                                    format = 'YYYY'
                                break;
                                
                                default:
                                    outputFormat = 'YYYY-MM-DD HH:mm:ss'
                                break
                                
                            }
                        }
                        // let date = moment(value, incommingFormat).toDate()
                        // date = moment(date, incommingFormat).format(outputFormat)
                        output = date.toString()
                        break
                    case 'string':
                        let format = convert.format
                        if(format == null){
                            format = convert.outputFormat
                        }
                        if (format != null && format != '') {
                            output = value.toString(format)
                        } else {
                            output = value.toString()
                        }

                    break
                    default:
                        break;
                }
            }
            if (convert.text != null) {
                output = convert.text
                output = output.replace('%V', value)
                if(output.includes('%level')) {
                    let level = info.level
                    if(output.includes('%levelChild')) {
                        const childList = {d:'c', c: 'a', a: 'm', m: 'p', p: 'x'}
                        level = childList[level]
                    }
                    const levelList = {d:'Dashboard', c: 'Company', a: 'Area', m: 'Machine', p: 'Point', x: 'Axis'}
                    output = output.replace('%level', levelList[level])
                }
            }
            
            return output

        },
        checkSpecialValues(value, convert) {
            if (convert.specialValues != null) {
                for (var i = 0; i < convert.specialValues.length; i++) {
                    if (convert.specialValues[i][0] == value) {
                        return convert.specialValues[i][1]
                    }
                }
            }
            return null
        }
    },
    reasonTypes:{
        Undefined: -1,
        NoReason: 0,
        Requested: 1,
        Scheduled: 2,
        Alarm: 3,
        Route: 4,
        ManualData: 5,
        SoftReset: 6,
        internalRMS: 7,
        SensorAlarm: 8,
        OffRoute: 9,
        SmallThermalImage: 10,
        Trigger: 11
    },
    
    MachineLearning: { // units config for machine learning processing
        getRequiredTrendUnits() {
            return [
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.mm_s),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.gE),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g, ErbessdSavingData.UnitsModifiers.lowFrequency),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g, ErbessdSavingData.UnitsModifiers.mediumFrequency),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g, ErbessdSavingData.UnitsModifiers.highFrequency),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g, ErbessdSavingData.UnitsModifiers.eRPM),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g, ErbessdSavingData.UnitsModifiers.kurtosis),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g, ErbessdSavingData.UnitsModifiers.skewness),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.mm_s, ErbessdSavingData.UnitsModifiers.hilbertEnvelope),
                
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.sensorSaturation),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.sensorCalibration),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.linesOfResolution),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.sampleRate),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g, ErbessdSavingData.UnitsModifiers.offset),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.cluster, ErbessdSavingData.UnitsModifiers.cluster1),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.cluster, ErbessdSavingData.UnitsModifiers.cluster2)
            ]
        },
        getTrendUnitsDefault() {
            return [
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.g),
                new ErbessdSavingData.machinery.TrendUnit(ErbessdSavingData.Units.mm_s, ErbessdSavingData.UnitsModifiers.rms, 10, 1000)
            ]
        }
    },

    DataSet: class{
        constructor(result){
            if(result == null){
                return
            }
            for(var key in result){
                this[key] = result[key]
            }
        }
        transform(transforms, preserveOriginalData = false){
            if(preserveOriginalData){
                this.originalDataSet = this.clone()
            }
            let data = this.data
            if(data == null || data.length == 0){
                return
            }
            let dataSet = this
            if(transforms != null){
                for(var i = 0; i < transforms.length; i++){
                    let transform = transforms[i]
                    let type = transform.type
                    if(transform != null){
                        ErbessdSavingData.sql.transform[type](dataSet, transform)
                    }
                }
            }
        }
        clone(){
            let clone = this.deepClone()
            return new ErbessdSavingData.DataSet(clone)
        }
    },
}
