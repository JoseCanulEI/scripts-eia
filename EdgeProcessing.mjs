// import { Erbessd, Enums } from '@/utils/Erbessd/Erbessd'
import { EICalc } from './EICalc.mjs'
import { EIFFT, FFTEnums } from './EIFFT.mjs'

// import { WebService } from '@/utils/WebService'
// import { get } from 'lodash'

// New imports
import { ErbessdSavingData } from './ErbessdSavingData.mjs'
import { api } from './api.mjs'
import { DataHandler, MachineLearning } from './machinelearning/MachineLearning.mjs'
const WebService = api
// End new imports

const Enums = ErbessdSavingData
const Erbessd = ErbessdSavingData

const isGateway = false
const calculateRPMOnFile = false
const MySQLDateFormat = 'YYYY-MM-DD HH:mm:ss'
const SQLDateFormat = 'YYYY-MM-DD HH:mm:ss'
export const EdgeProcessing = {
  dbSettings: {
    settings: null,
    lastUpdateDate: null,
    validityDays: 2,
    async getSettings(){
      //checking validity of last Update Date
      if(this.lastUpdateDate != null){
        let lastUpdateDate = new Date(this.lastUpdateDate)
        let currentDate = new Date()
        let diff = Math.abs(currentDate - lastUpdateDate)
        let diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
        //console.log('diffDays', diffDays)
        if(diffDays <= this.validityDays){
          return this.settings
        }else{
          this.settings = null
        }
      }
  
      if(this.settings == null){
        this.settings = await new Promise((resolve) => { 
          // console.log('WebService - Getting DB Settings')
          WebService.getDBSettings((data) => {
            this.lastUpdateDate = new Date()
            resolve(data)
          }, (error) => {
            this.lastUpdateDate = null
            // console.log('Could not get DB Settings', error)
            resolve(null)
          })
        })
      }
      return this.settings
    },
    async getRequiredTrendUnits_Test(){
      let tu = []
      let modifiers = Enums.UnitsModifiers.getOptions([0, 10015]).values

      //let unitsToAdd = [0,2,4,6]
      let unitsToAdd = [2]
      let output = []
      for(var u = 0; u < unitsToAdd.length; u++){
        let unit = unitsToAdd[u]
        for(var i = 0; i < modifiers.length; i++){
          let ru = {u: unit, m: modifiers[i], trend: true}
          output.push(new Erbessd.machinery.TrendUnit(ru))
        }
      }
      
      return output
    },
    async getRequiredTrendUnits(){
      let settings = await this.getSettings()

      let output = []
      if(settings != null){
        if (settings.OARequiredUnits != null && settings.OARequiredUnits.units != null) {
          let ru = settings.OARequiredUnits.units
          for(var i = 0; i < ru.length; i++){
            let item = ru[i]
            item.trend = true
            output.push(new Erbessd.machinery.TrendUnit(item))
          }
        }
      }
      // console.log('settings - output', output)
      return output
    }
  },
  machinery:{
    machines:{},
    lastUpdateDates: {},
    validityDays: 2,
    async getMachine(code){
      let lastUpdateDateObject = this.lastUpdateDates[code]
      if(lastUpdateDateObject != null){
        let lastUpdateDate = new Date(lastUpdateDateObject)
        let currentDate = new Date()
        let diff = Math.abs(currentDate - lastUpdateDate)
        let diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
        // console.log('diffDays', diffDays)
        if(diffDays <= this.validityDays){
          return this.machines[code]
        }else{
          this.machines[code] = null
        }
      }

      if(this.machines[code] != null){
        return this.machines[code]
      }else{
        this.machines[code] = await new Promise((resolve) => {
          WebService.getMachine(code, (machine) => {
            if (machine instanceof Erbessd.machinery.Machine === false) {
              machine = Erbessd.machinery.Machine.model(machine)
            }
            resolve(machine)
          }, (error) => {
            this.lastUpdateDates[code] = null
            // console.log('Could not get the machine', error)
            resolve(null)
          })
        })
      }

      return this.machines[code]
    },
    async getPoint(machineCode, pointIndex){
      let output = null
      let machine = await this.getMachine(machineCode)
      if(machine != null){
        for(var i = 0; i < machine.Points.length; i++){
          if(machine.Points[i].Index == pointIndex){
            output = machine.Points[i]
            break
          }
        }
      }
      return output
    },
    async getAxis(machineCode, pointIndex, axis){
      let output = null
      let point = await this.getPoint(machineCode, pointIndex)
      if(point == null){
        // console.log('Error, point does not exist')
        return null
      }
      let axisName = null
      if(typeof axis === 'string'){
        axisName = axis
      }else if(typeof axis === 'number'){
        axisName = axis.toAxisChar()
      }
      axisName = axisName.toLowerCase()

      output = point.axes[axisName]
      return output
    }
  },
  phantom:{
    phantoms: {},
    lastUpdateDates: {},
    validityDays: 5,
    async updatePhantomConfig(code){
      let deviceCondition = `devices.Code = '` + code + `'`
      if(Array.isArray(code)){
        deviceCondition = `devices.Code IN ('` + code.join(`', '`) + `')`
      }
      let query = `SELECT devices.Code AS C, devices.Type AS T, evconfig.DeviceChannel AS ch, evconfig.MachineCode AS M, evconfig.PointIndex AS P, evconfig.Axis AS A
      FROM devices
      INNER JOIN evconfig ON devices.ID = evconfig.DeviceID
      WHERE ` + deviceCondition + `
      ORDER BY devices.Code, evconfig.DeviceChannel, evconfig.MachineCode, evconfig.PointIndex, evconfig.Axis`
      let data = await new Promise((resolve) => {
        console.log('WebService - Getting Phantom config')
        WebService.getCustomData(query, (data) => {
          if(data[0].columns == null || data[0].columns.length == 0){
            console.log('Error getting phantom config', data[0].errorMessage)
            resolve(null)
          }else{
            resolve(data[0].data)
          }
          
        }, error => {
          console.log('Error getting phantom config', error)
          resolve(null)
        })
      })

      let output = {}
      for(var i = 0; i < data.length; i++){
        let phantom = data[i][0]
        let type = data[i][1]
        let channel = data[i][2]
        let machineCode = data[i][3]
        let pointIndex = data[i][4]
        let axis = data[i][5]
        if(output[phantom] == null){
          output[phantom] = {
            type: type,
            channels: {}
          }
        }
        output[phantom].channels[channel] = {machineCode: machineCode, pointIndex: pointIndex, axis: axis}
      }
      for(var key in output){
        this.phantoms[key] = output[key]
        this.lastUpdateDates[key] = new Date()
      }
      return output
    },
    async getPhantomConfig(code){
      let lastUpdateDateObject = this.lastUpdateDates[code]
      if(lastUpdateDateObject != null){
        let lastUpdateDate = new Date(lastUpdateDateObject)
        let currentDate = new Date()
        let diff = Math.abs(currentDate - lastUpdateDate)
        let diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
        // console.log('diffDays', diffDays)
        if(diffDays <= this.validityDays){
          return this.phantoms[code]
        }else{
          this.phantoms[code] = null
        }
      }

      if(this.phantoms[code] == null){
        await this.updatePhantomConfig(code)
      }
      return this.phantoms[code]
    }
  },
  processing:{
    addIfNotContained(val, output) {
      if(typeof val === 'number'){
        if (!output.includes(val)) {
          output.push(val)
        }
      }else{
        let encontrado = false
        for(var i = 0; i < output.length; i++){
          if(output[i].unit == val.unit && output[i].modifier == val.modifier){
            encontrado = true
            break
          }
        }
        if(!encontrado){
          output.push(val)
        }
      }
      
    },
    addOctaveIfNotContained(octaves) {
      if (!this.Octave_Bands) this.Octave_Bands = []
      for (const ob of this.Octave_Bands) {
        if (ob.Units === octaves.Units) {
          return
        }
      }
      this.Octave_Bands.push(octaves)
    },
    getTrendsToCalculatePerModifier(modifier, severityAxis, requiredTrendUnits) {
      const anyUnits = [Enums.UnitsModifiers.slope, Enums.UnitsModifiers.cle, Enums.UnitsModifiers.mtf].includes(modifier)
      const standAloneUnits = [Enums.Units.sensorSaturation, Enums.Units.sampleRate, Enums.Units.sensorCalibration, Enums.Units.linesOfResolution]
      const output = []

      //Required by the database
      if(requiredTrendUnits != null){
        for (const item of requiredTrendUnits) {
          if (item.modifier === modifier && (item.unit <= Enums.Units.gE || anyUnits)) {
            this.addIfNotContained(item, output)
          }
          if(standAloneUnits.includes(item.unit)){
            this.addIfNotContained(item, output)
          }
        }
      }

      //Required by the axis
      if(severityAxis != null) {
        if(severityAxis.trendUnits != null){
          for (var i = 0; i < severityAxis.trendUnits.length; i++) {
            let item = new Erbessd.machinery.TrendUnit(severityAxis.trendUnits[i])
            item.trend = true
            if (item.modifier === modifier && (item.unit <= Enums.Units.gE || anyUnits)) {
              this.addIfNotContained(item, output)
            }
          }
        }
        let sevs = severityAxis.selectedSeverities
        if(sevs != null){
          for(var i = 0; i < sevs.length; i++){
            let sev = sevs[i]
            let splitedUnit = Enums.Units.splitUnit(sev.unit)
            let item = new Erbessd.machinery.TrendUnit({u: splitedUnit.unit, m: splitedUnit.modifier, trend: true})
            if (item.modifier === modifier && (item.unit <= Enums.Units.gE || anyUnits)) {
              this.addIfNotContained(item, output)
            }
          }
        }
      }

      //Octave bands
      if(modifier == Enums.UnitsModifiers.octaveBands && severityAxis != null && severityAxis.trendOctaves != null){
        for (var i = 0; i < severityAxis.trendOctaves.length; i++) {
          let u = severityAxis.trendOctaves[i]
          if(u <= Enums.Units.gE){
            let item = new Erbessd.machinery.TrendUnit({u: u, m: Enums.UnitsModifiers.octaveBands, trend: true})
            this.addIfNotContained(item, output)
          }
        }
        if(severityAxis != null && severityAxis.selectedOctaveBandSeverities != null){
          let octaveSevs = severityAxis.selectedOctaveBandSeverities
          for(var i = 0; i < octaveSevs.length; i++){
            let octaveSev = octaveSevs[i]
            let splitedUnit = Enums.Units.splitUnit(octaveSev.u)
            let item = new Erbessd.machinery.TrendUnit({u: splitedUnit.unit, m: Enums.UnitsModifiers.octaveBands, trend: true})
            
            this.addIfNotContained(item, output)
          }
        }
      }
      
      
      // if (this.taskConfigs) {
      //   for (const tc of this.taskConfigs) {
      //     const u = tc.unit
      //     if (tc.tasks) {
      //       if (u <= Enums.Units.gE || anyUnits) {
      //         for (const task of tc.tasks) {
      //           if (task.unitModifier === modifier) {
      //             this.addIfNotContained(new TrendUnit(u), output)
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
      //console.log('getTrendsToCalculatePerModifier', modifier, output)
      return output
    },
    signalsToCalculate(severityAxis, requiredTrendUnits) {
    //   get derivedPeak() {return this.fullUnits.derivedPeak.value},
    // get truePeak() {return this.fullUnits.truePeak.value},
    // get highFrequency() {return this.fullUnits.highFrequency.value},
      const modifiersThatRequireTWF = [
        Enums.UnitsModifiers.rms, 
        Enums.UnitsModifiers.octaveBands, 
        Enums.UnitsModifiers.cf, 
        Enums.UnitsModifiers.minFFT, 
        Enums.UnitsModifiers.maxFFT, 
        Enums.UnitsModifiers.peakToPeak,
        Enums.UnitsModifiers.derivedPeak,
        Enums.UnitsModifiers.truePeak,
        Enums.UnitsModifiers.lowFrequency,
        Enums.UnitsModifiers.mediumFrequency,
        Enums.UnitsModifiers.highFrequency,
        Enums.UnitsModifiers.octaveBands,
        Enums.UnitsModifiers.kurtosis,
        Enums.UnitsModifiers.skewness,
        Enums.UnitsModifiers.eRPM,
        Enums.UnitsModifiers.hilbertEnvelope
      ]
      const output = []

      for (const modifier of modifiersThatRequireTWF) {
        for (const item of this.getTrendsToCalculatePerModifier(modifier, severityAxis, requiredTrendUnits)) {
          if (!output.includes(item.unit) && item.unit <= Enums.Units.gE) {
            output.push(item.unit)
          }
        }
      }
      return output
    },
    fftsToCalculate(severityAxis, requiredTrendUnits){
      const modifiersThatRequireFFT = [
        Enums.UnitsModifiers.rms, 
        Enums.UnitsModifiers.octaveBands, 
        Enums.UnitsModifiers.minFFT, 
        Enums.UnitsModifiers.maxFFT,
        Enums.UnitsModifiers.lowFrequency,
        Enums.UnitsModifiers.mediumFrequency,
        Enums.UnitsModifiers.highFrequency
      ] //Modifiers that require FFT

      const output = []
      for (var i = 0; i < modifiersThatRequireFFT.length; i++) {
        let modifier = modifiersThatRequireFFT[i]
        let items = this.getTrendsToCalculatePerModifier(modifier, severityAxis, requiredTrendUnits)
        for (var l = 0; l < items.length; l++) {
          let item = items[l]
          if (!output.includes(item.unit) && item.unit <= Enums.Units.gE) {
            output.push(item.unit)
          }
        }
      }

      if(severityAxis != null && severityAxis.trendOctaves != null){
        for (var i = 0; i < severityAxis.trendOctaves.length; i++) {
          let u = severityAxis.trendOctaves[i]
          if (!output.includes(u) && u <= Enums.Units.gE) {
            output.push(u)
          }
        }
      }
      
      return output
    }
    
  },
  trendData:{
    data: {},
    
    async updateTrendData(machineCode, pointIndex, axis, unit, days = 30){
      let fromDate = (new Date()).addDays(-days).toString(MySQLDateFormat)
      let toDate = (new Date()).addDays(1).toString(MySQLDateFormat)
      console.log('fromDate', fromDate)
      let query = `SELECT Date_Time AS D, RealValue AS V FROM M__` + machineCode + ` 
      WHERE PointIndex = ` + pointIndex + ` AND Axis = ` + axis + ` AND Units = ` + unit + ` AND Date_Time > '` + fromDate + `' AND Date_Time < '` + toDate + `' 
      ORDER BY Date_Time DESC LIMIT 2000`
      console.log('query', query)
      let data = await new Promise((resolve) => {
        console.log('WebService - Getting trend data')
        WebService.getCustomData(query, (data) => {
          console.log('data', data)
          if(data[0].columns == null || data[0].columns.length == 0){
            console.log('Error getting trend data', data[0].errorMessage)
            resolve([])
          }else{
            resolve(data[0].data)
          }
          
        }, error => {
          console.log('Error getting trend data', error)
          resolve(null)
        })
      })

      console.log('data', data)
      
      
    },
    async getTrendData(machineCode, pointIndex, axis, unit){
      let name = EdgeProcessing.getSignalName(pointIndex, axis, unit)
      if(this.data[machineCode] == null || this.data[machineCode][name] == null){
        await this.updateTrendData(machineCode, pointIndex, axis, unit)
      }
      if(this.data[machineCode] == null != null && this.data[machineCode][name] != null){
        return this.data[machineCode][name]
      }
    }
  },
  testData:{
    machineCode: 1317332805
  },
  machineLearning: {
    machines: {},
    lastUpdateDates: {},
    validityDays: 2,
    async getConfigModels(machineCode, pointIndex, axis) {
      const node = `${machineCode}-${pointIndex}-${axis}`
      let lastUpdateDateObject = this.lastUpdateDates[node]
      if (lastUpdateDateObject != null) {
        let lastUpdateDate = new Date(lastUpdateDateObject)
        let currentDate = new Date()
        let diff = Math.abs(currentDate - lastUpdateDate)
        let diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
        if (diffDays <= this.validityDays) {
          return this.machines[node]
        } else {
          this.machines[node] = null
        }
      }
      if (this.machines[node] != null) {
        return this.machines[node]
      }
      let configs = await new Promise((resolve) => {
        let queries = [{
          query: `SELECT config, id, unit FROM ml_clusters_config
          WHERE machinecode=${machineCode} AND pointindex=${pointIndex} AND axis=${axis}`
        }]
        WebService.getCustomData(queries, (data) => {
          if (data[0].columns == null || data[0].columns.length == 0) {
            resolve(null)
          } else {
            resolve(data[0].data)
          }
        }, (error) => {
          resolve(null)
        })
      })
      let output = []
      if (configs != null && configs.length > 0) {
        for (var i = 0; i < configs.length; i++) {
          const config = JSON.parse(configs[i][0])
          if (config != null) {
            config.id = configs[i][1]
            config.unit = configs[i][2]
            if (config.dataSplitter != null) {
              config.dataSplitter.id = configs[i][1]
            }
            output.push(config)
          }
        }
        this.machines[node] = output
        this.lastUpdateDates[node] = new Date()
      }
      return output
    },
    async checkIfNeededMl(opts, values, requiredTrendUnits) {
      let configs = await this.getConfigModels(opts.machineCode, opts.pointIndex, opts.axis)
      if (configs != null && configs.length > 0) {
        let trend = {columns: ['Date', 'U', 'V'], data: []}
        let datetime = new Date().toString(MySQLDateFormat) // la fecha no importa, solo para el formato
        for (let i = 0; i < requiredTrendUnits.length; i++) {
          let trendUnit = requiredTrendUnits[i]
          if (values[trendUnit.modifier] != null && values[trendUnit.modifier][trendUnit.unit] != null) {
            let mergedUnit = Enums.Units.mergeModifier(trendUnit.unit, trendUnit.modifier)
            trend.data.push([datetime, mergedUnit, values[trendUnit.modifier][trendUnit.unit].v])
          }
        }
        // console.log('checkIfNeededMl - trend', trend)
        await this.processClusterize(trend, configs, values)
      }
    },
    async processClusterize(trend, configs, values) {
      const dataHandler = new DataHandler(trend, MachineLearning.database.scatterTransforms, null)
      for (const clusterize of configs) {
        if (clusterize.unit == null) {
          continue;
        }
        const result = await new Promise((resolve) => {
          dataHandler.cluster(clusterize, resolve, null, true)
        })
        if (result != null && result.data != null && result.data.length > 0) {
          // console.log('processClusterize - result', result)
          const {modifier, unit} = Enums.Units.splitUnit(clusterize.unit)
          const models = dataHandler.models.deepClone()
          let value = {v: -1, models: []}
          values[modifier] = {}
          const algo = clusterize.dataSplitter != null ? clusterize.dataSplitter.algo : clusterize.algo
          value.models.push({i: 0, m: models[algo][0]})
          for (const data of result.data) {
            value.v = data.clusterIndex
            if (clusterize.dataSplitter != null) {
              value.models.push({
                i: data.parentClusterIndex,
                m: models[clusterize.algo][data.parentClusterIndex]
              })
            }
          }
          values[modifier][unit] = value
        }
        dataHandler.models = {} // reset models to free memory
      }
      dataHandler.destroy()
    }
  },
  preprocessedValues: class { // Preprocessed values for send to the saving data
    constructor(modifier, unit, real, severity) {
      this.modifier = modifier
      this.unit = unit
      this.real = real
      this.severity = severity
    }
  },
  getSignalName(pointIndex, axis, unit){
    return `${pointIndex}-${axis}-${unit}`
  },
  getValuesName(pointIndex, axis){
    return `${pointIndex}-${axis}`
  },
  getSeverity(unit, modifier, severityAxis){
    console.log('getSeverity', unit, modifier, severityAxis)

  },
  async getProcessedVibration_Point(options, requiredTrendUnits){
    if((options.machineCode == null || options.machineCode == -1) && options.skipWebService != null && !options.skipWebService){
      let config = await this.phantom.getPhantomConfig(options.phantomCode)
      // console.log('config', config)
      if(config != null){
        let axes = []
        let channelsToCheck = [1,2,3]
        for(var i = 0; i < channelsToCheck.length; i++){
          let ch = channelsToCheck[i]
          let channel = config.channels[ch]
          if(channel != null){
            options.machineCode = channel.machineCode
            options.pointIndex = channel.pointIndex
            axes.push(channel.axis)
          }
        }
        options.axis = axes
      }
    }
    if(options.machineCode == null || options.machineCode == -1 || options.pointIndex == null || options.pointIndex == -1 || options.axis == null || options.axis == -1){
      console.log('Error, machineCode pointIndex or axis not found', options.machineCode, options.pointIndex, options.axis)
      return
    }

    // let requiredTrendUnits = await this.dbSettings.getRequiredTrendUnits()
    if (requiredTrendUnits == null) {
      requiredTrendUnits = await this.dbSettings.getRequiredTrendUnits()
    }
    // let settings = await this.dbSettings.getSettings()
    // let envelopeAccelerationSettings = false
    // if (settings != null) {
    //   if (settings.OARequiredUnits != null) {
    //     envelopeAccelerationSettings = settings.OARequiredUnits.envelopeAccelerationSettings != null ? settings.OARequiredUnits.envelopeAccelerationSettings : false
    //   }
    // }
    let point = null
    if (options.skipWebService != null && options.skipWebService && options.point != null) {
      point = Erbessd.machinery.MachinePoint.model(options.point)
    } else {
      point = await this.machinery.getPoint(options.machineCode, options.pointIndex)
    }
    if(point == null){
      // console.log('Error, point not found')
      return 
    }
    
    let axes = []
    
    if(Array.isArray(options.axis)){
      axes = options.axis
    }else{
      axes.push(options.axis)
    }

    let results = {
      values: {},
      signals: {},
      ffts: {},
      historyValues: []
    }
    for(var i = 0; i < axes.length; i++){
      let axis = axes[i]
      let data = options.data[i]
      
      if(data == null){
        break
      }
      if(!Array.isArray(data)){ //doy la opcion para que data solo traiga un array de datos
        data = options.data
      }
      
      let opts = {
        sampleRate: options.sampleRate,
        calibration: options.calibration,
        sensorSensitivity: options.sensorSensitivity,
        sensorType: options.sensorType,

        machineCode: options.machineCode,
        pointIndex: options.pointIndex,
        axis: axis,
        data: data,
        // envelopeAccelerationSettings: envelopeAccelerationSettings
      }
      opts.axis = axis
      let axisSev = null
      if (options.skipWebService != null && options.skipWebService) {
        let axisName = axis.toAxisChar().toLowerCase()
        axisSev = point.axes[axisName]
      }
      let res = await this.getProcessedVibration_SingleAxis(opts, point, requiredTrendUnits, axisSev)

      for(var key in res.ffts){
        results.ffts[key] = res.ffts[key]
      }
      for(var key in res.signals){
        results.signals[key] = res.signals[key]
      }
      let name = this.getValuesName(options.pointIndex, axis)
      results.values[name] = res.values
    }

    if (results.values) {
      for (const axis in results.values) {
        let Octave_Bands = []
        let preprocessedValues = []
        for (const modifier in results.values[axis]) {
          for (const unit in results.values[axis][modifier]) {
            const val = results.values[axis][modifier][unit]
            if (parseInt(modifier) === Enums.UnitsModifiers.octaveBands) {
              Octave_Bands.push({ Units: parseInt(unit), Values: val.v })
              preprocessedValues.push(new this.preprocessedValues(parseInt(modifier), parseInt(unit), -1, -1))
            } else {
              preprocessedValues.push(new this.preprocessedValues(parseInt(modifier), parseInt(unit), val.v, val.s))
            }
          }
        }
        results.historyValues.push({
          axis: parseInt(axis.split('-')[1]),
          pointIndex: options.pointIndex,
          Octave_Bands: Octave_Bands,
          preprocessedValues: preprocessedValues
        })
      }
    }
    
    return results
  },
  async getProcessedVibration_SingleAxis(options, point, requiredTrendUnits, axisSev = null){
    if(axisSev == null){
      axisSev = await this.machinery.getAxis(options.machineCode, options.pointIndex, options.axis)
    } else {
      axisSev = Erbessd.machinery.SeverityAxis.model(axisSev)
    }
    let vel_rms_reqTrendU = requiredTrendUnits.find(tu => tu.unit === Enums.Units.mms && tu.modifier === Enums.UnitsModifiers.rms)
    if (vel_rms_reqTrendU != null && point != null) {
      vel_rms_reqTrendU.minHz = point.MinHzRMS
      vel_rms_reqTrendU.maxHz = point.MaxHzRMS
    }
    if(axisSev != null && axisSev.trendUnits != null){
      let vel_rms_sevTrendU = axisSev.trendUnits.find(tu => tu.unit === Enums.Units.mms && tu.modifier === Enums.UnitsModifiers.rms)
      if (vel_rms_sevTrendU != null && point != null) {
        vel_rms_sevTrendU.minHz = point.MinHzRMS
        vel_rms_sevTrendU.maxHz = point.MaxHzRMS
      }
    }
    
    
    let signalsToCalculate = this.processing.signalsToCalculate(axisSev, requiredTrendUnits)
    
    const data = options.data
    const sr = options.sampleRate
    const cal = options.calibration
    const sens = options.sensorSensitivity
    const window = FFTEnums.WindowType.Hann

    let signalTypeIn = Enums.SignalTypeIn.Acceleration
    switch(options.sensorType){
      case Enums.SensorType.Velocimeter:
        signalTypeIn = Enums.SignalTypeIn.Velocity
        break
      case Enums.SensorType.Displacement:
        signalTypeIn = Enums.SignalTypeIn.Displacement
        break
    }
    //console.log('sr', sr, 'cal', cal, 'sens', sens, 'window', window, 'signalTypeIn', signalTypeIn)

    let RPM = (point.MaxRPM + point.MinRPM) / 2


    let signals = {}
    let ffts = {}

    let calculateSignal = (u) =>{
      let name = this.getSignalName(options.pointIndex, options.axis, u)
      if(signals[name] == null){
        let signal = EICalc.convertSignal(data, signalTypeIn, u, RPM, sr, cal, sens)
        signals[name] = signal
      }
      return signals[name]
    }
    let calculateFFT = (u) =>{
      let name = this.getSignalName(options.pointIndex, options.axis, u)
      if(ffts[name] == null){
        let signal = signals[name]
        if(signal == null){
          signal = calculateSignal(u)
        }
        let fft = EIFFT.getFFT(signal, window, sr, true, 600, FFTEnums.FFTOutputType.RMS)
        ffts[name] = fft
      }
      return ffts[name]
    }

    if(calculateRPMOnFile && signalsToCalculate.includes(Enums.Units.gE)){
      let fftVel = calculateFFT(Enums.Units.mms)
      RPM = fftVel.getRPM(point.MinRPM, point.MaxRPM)
    }

    for(var i = 0; i < signalsToCalculate.length; i++){
      let unit = signalsToCalculate[i]
      calculateSignal(unit)
    }

    let fftsToProcess = this.processing.fftsToCalculate(axisSev, requiredTrendUnits)
    //console.log('fftsToProcess', fftsToProcess)
    for(var i = 0; i < fftsToProcess.length; i++){
      let unit = fftsToProcess[i]
      calculateFFT(unit)
    }

    
    // calculando valores
    let values = {}

    let modifiers = Enums.UnitsModifiers.getOptions().values
    for(var i = 0; i < modifiers.length; i++){
      let modifier = modifiers[i]

      let trendUnitsToCalculate = this.processing.getTrendsToCalculatePerModifier(modifier, axisSev, requiredTrendUnits)
      // if(trendUnitsToCalculate.length > 0){
      //   console.log('trendUnitsToCalculate', modifier, trendUnitsToCalculate)
      // }
      
      let groupValues = {}
      for(var l = 0; l < trendUnitsToCalculate.length; l++){
        let item = trendUnitsToCalculate[l]
        let name = this.getSignalName(options.pointIndex, options.axis, item.unit)
        let fft = ffts[name]
        let signal = signals[name]

        const optionsCalculate = {
          minHz: item.minHz,
          maxHz: item.maxHz,
          minRPM: point != null ? point.MinRPM : 500,
          maxRPM: point != null ? point.MaxRPM : 7000,
          sampleRate: sr,
          data: options,
        }
        

        let val = null
        // if (modifier === Enums.UnitsModifiers.rms && options.envelopeAccelerationSettings && item.unit === Enums.Units.gE) {
        //   // console.log('Calculate RMS by PeakToPeak on envelope acceleration')
        //   val = EICalc.calculateModifier(Enums.UnitsModifiers.peakToPeak, signal, fft, optionsCalculate)
        // } else {

        //   get sampleRate() { return this.fullUnits.sampleRate.value },
        // get sensorCalibration() { return this.fullUnits.sensorCalibration.value },
        // get linesOfResolution() { return this.fullUnits.linesOfResolution.value },
      
        switch(item.unit){
          case Enums.Units.sensorSaturation:
            val = EICalc.calculateSensorSaturation(options.data)
            break
          case Enums.Units.sampleRate:
            val = options.sampleRate
            break
          case Enums.Units.sensorCalibration:
            val = options.calibration
            break
          case Enums.Units.linesOfResolution:
            val = EICalc.calculateLinesOfResolution(options.data.length)
            break
          default:
            val = EICalc.calculateModifier(modifier, signal, fft, optionsCalculate)
            break
        }
        

        if(val != null){
          let s = Array.isArray(val) ? [] : -1
          groupValues[item.unit] = {v: val, s: s, t: item.trend}
        }
      }

      //console.log('groupValues', Object.keys(groupValues).length, groupValues)
      if(Object.keys(groupValues).length > 0){
        values[modifier] = groupValues
      }
      
    }
    

    //Calculando severidades
    let sevs = axisSev.selectedSeverities
    
    if(axisSev != null && sevs != null){
      for(var i = 0; i < sevs.length; i++){
        let sev = sevs[i]
        let splitedUnit = Enums.Units.splitUnit(sev.unit)
        
        let value = null
        let amplitude = null
        if(values[splitedUnit.modifier] != null){
          value = values[splitedUnit.modifier][splitedUnit.unit]
          amplitude = value.v
          // console.log('Calculando Octave Bands', sev)
          // value.t = sev.trend
        }
        if(amplitude != null){
          if(Array.isArray(amplitude)){
            console.log('Octave Bands no se pueden calcular en severidades')
          }else{
            let severity = null
            if(amplitude != null){
              severity = Enums.Severity.calculateSeverity(amplitude, sev.y, sev.o, sev.r)
            }
            if(severity != null){
              value.s = severity
            }
          }
        }
      }
    }


    //Calculando severidades de Octave Bands
    let octaveSevs = axisSev.selectedOctaveBandSeverities
    if(axisSev != null && octaveSevs != null){
      for(var i = 0; i < octaveSevs.length; i++){
        let octaveSev = octaveSevs[i]
        let splitedUnit = Enums.Units.splitUnit(octaveSev.u)
        
        let value = null
        let amplitude = null
        if(values[Enums.UnitsModifiers.octaveBands] != null){
          value = values[Enums.UnitsModifiers.octaveBands][splitedUnit.unit]
          if(value != null){
            amplitude = value.v
          }
        }
        //console.log('amplitude - value', amplitude, value)
        if(amplitude != null){
          if(Array.isArray(amplitude)){
            let severities = []
            for(var l = 0; l < amplitude.length; l++){
              let a = amplitude[l]
              let alarms = octaveSev.bands[l]
              
              if(a != null && a > -1 && alarms.e){
                let severity = Enums.Severity.calculateSeverity(a, alarms.y, alarms.o, alarms.r)
                severities.push(severity)
              }else{
                severities.push(-1)
              }
              
            }
            value.s = severities
          }else{
            console.log('Severidades normales no se pueden calcular octave bands')
          }
        }
        
      }
    }

    //await this.machineLearning.checkIfNeededMl(options, values, requiredTrendUnits)
    // console.log('values', values)

    //this.trendData.updateTrendData(options.machineCode, options.pointIndex, options.axis, 2)
    return {
      values: values,
      signals: signals,
      ffts: ffts
    }
  },
  async processSignal(options, point, requiredTrendUnits, axisSev = null){
    let opts = Object.assign({
      sampleRate: 0,
      calibration: 1,
      sensorSensitivity: 1,
      sensorType: 1,

      // point: null, //si se usa el point, ya no tiene que cargar la maquina
      // machineCode: 0,
      // pointIndex: 1,
      // axis: 1,
      data: null,
    }, options)

    let results = await EdgeProcessing.getProcessedVibration_SingleAxis(opts, point, requiredTrendUnits, axisSev)
    //merging modifiers with units
    let unifiedValues = {}
    for(var modifier in results.values){
      let modifierValues = results.values[modifier]
      for(var unit in modifierValues){
        let mergedUnit = Enums.Units.mergeModifier(unit, modifier)
        unifiedValues[mergedUnit] = modifierValues[unit]
      }
    }
    results.mergedValues = unifiedValues
    return results
  }
}