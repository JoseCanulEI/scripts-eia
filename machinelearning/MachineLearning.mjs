import axios from 'axios'
import { ErbessdSavingData } from '../ErbessdSavingData.mjs'
import { EICalc } from '../EICalc.mjs'
import { EdgeProcessing } from '../EdgeProcessing.mjs'
// import { WebService } from '@/utils/WebService'
import { api } from '../api.mjs'
const WebService = api
const Erbessd = ErbessdSavingData
const Enums = ErbessdSavingData
// import speficic modules to be used in this file

const MySQLDateFormat = 'YYYY-MM-DD HH:mm:ss'
const SQLDateFormat = 'YYYY-MM-DD HH:mm:ss'
const clusterizeAddress = 'http://198.71.48.189:7676/'
// const clusterizeAddress = 'http://127.0.0.1:7676/'
const colorBlindModeDefault = false
export const MachineLearning = {
  get algorithmOptions(){
    return [
      {
        value: 'meanshift',
        label: 'Mean Shift',
        params: [
          {
            name: 'quantile',
            type: 'float',
            default: 0.3,
            min: 0,
            max: 1,
            step: 0.01,
            precision: 2
          }
        ]
      },
      {
        value: 'spectralclustering',
        label: 'Spectral Clustering',
        params: [
          {
            name: 'n_clusters',
            type: 'int',
            default: 6,
            min: 2,
            max: 50,
            step: 1,
            precision: 0
          },
          {
            name: 'n_neighbors',
            type: 'int',
            default: 10,
            min: 1,
            max: 50,
            step: 1,
            precision: 0
          },
          {
            name: 'random_state',
            type: 'int',
            default: 42,
            min: 0,
            max: 9999,
            step: 1,
            precision: 0
          }
        ]
      },
      {
        value: 'agglomerative',
        label: 'Agglomerative',
        params: [
          {
            name: 'n_clusters',
            type: 'int',
            default: 6,
            min: 2,
            max: 50,
            step: 1,
            precision: 0
          }
        ]
      },
      {
        value: 'dbscan',
        label: 'DBSCAN',
        params: [
          {
            name: 'eps',
            type: 'float',
            default: 0.3,
            min: 0,
            max: 10,
            step: 0.01,
            precision: 3
          }
        ]
      },
      {
        value: 'hdbscan',
        label: 'HDBSCAN',
        params: [
          {
            name: 'hdbscan_min_samples',
            type: 'int',
            default: 3,
            min: 1,
            max: 100,
            step: 1,
            precision: 0
          },
          {
            name: 'hdbscan_min_cluster_size',
            type: 'int',
            default: 15,
            min: 2,
            max: 100,
            step: 1,
            precision: 0
          },
          {
            name: 'allow_single_cluster',
            type: 'bool',
            default: true
          }
        ]
      },
      {
        value: 'optics',
        label: 'OPTICS',
        params: [
          {
            name: 'min_samples',
            type: 'int',
            default: 7,
            min: 1,
            max: 100,
            step: 1,
            precision: 0
          },
          {
            name: 'xi',
            type: 'float',
            default: 0.05,
            min: 0,
            max: 1,
            step: 0.01,
            precision: 2
          },
          {
            name: 'min_cluster_size',
            type: 'float',
            default: 0.1,
            min: 0,
            max: 1,
            step: 0.01,
            precision: 2
          }
        ]
      },
      {
        value: 'affinitypropagation',
        label: 'Affinity Propagation',
        params: [
          {
            name: 'damping',
            type: 'float',
            default: 0.9,
            min: 0,
            max: 1,
            step: 0.01,
            precision: 2
          },
          {
            name: 'preference',
            type: 'float',
            default: -200,
            min: -1000,
            max: 1000,
            step: 1,
            precision: 0
          },
          {
            name: 'random_state',
            type: 'int',
            default: 42,
            min: 0,
            max: 9999,
            step: 1,
            precision: 0
          }
        ]
      },
      {
        value: 'birch',
        label: 'BIRCH',
        params: [
          {
            name: 'n_clusters',
            type: 'int',
            default: null,
            allowNull: true,
            min: 2,
            max: 100,
            step: 1,
            precision: 0
          },
          {
            name: 'threshold',
            type: 'float',
            default: 0.5,
            min: 0,
            max: 5,
            step: 0.1,
            precision: 2
          },
          {
            name: 'branching_factor',
            type: 'int',
            default: 50,
            min: 1,
            max: 200,
            step: 1,
            precision: 0
          }
        ]
      },
      {
        value: 'gaussianmixture',
        label: 'Gaussian Mixture Model',
        params: [
          {
            name: 'n_clusters',
            type: 'int',
            default: 6,
            min: 1,
            max: 100,
            step: 1,
            precision: 0
          },
          {
            name: 'covariance_type',
            type: 'string',
            default: 'full'
          },
          {
            name: 'random_state',
            type: 'int',
            default: 42,
            min: 0,
            max: 9999,
            step: 1,
            precision: 0
          }
        ]
      },
      {
        value: 'kmeans',
        label: 'K-Means',
        params: [
          {
            name: 'n_clusters',
            type: 'int',
            default: 6,
            min: 2,
            max: 100,
            step: 1,
            precision: 0
          },
          {
            name: 'random_state',
            type: 'int',
            default: 42,
            min: 0,
            max: 9999,
            step: 1,
            precision: 0
          }
        ]
      },
      {
        value: 'minibatchkmeans',
        label: 'Mini Batch K-Means',
        params: [
          {
            name: 'n_clusters',
            type: 'int',
            default: 6,
            min: 2,
            max: 100,
            step: 1,
            precision: 0
          },
          {
            name: 'random_state',
            type: 'int',
            default: 42,
            min: 0,
            max: 9999,
            step: 1,
            precision: 0
          }
        ]
      },
      {
        value: 'preclusterize',
        label: 'Pre-clusterize',
        params: []
      }
    ]
  },
  
  palettes: {
    getPalette(colorBlindMode){
      if(colorBlindMode == null){
        colorBlindMode = colorBlindModeDefault
      }
      return colorBlindMode ? this.colorBlindPalette : this.normalPalette
    },
    getColor(index, colorBlindMode) {
      // Reserved colors
      const reservedColors = {
        //[0]: 'transparent',
        [-1]: '#5470C6',
        [-2]: '#A9A9A9',
        [-3]: '#D2D2D2'
      }
    
      // Check for reserved indices first
      if (index in reservedColors) {
        return reservedColors[index]
      }
    
      const palette = this.getPalette(colorBlindMode)
      const length = palette.length
    
      // Wrap any other index
      const wrappedIndex = ((index % length) + length) % length
      return palette[wrappedIndex]
    },
    // normalPalette: [
    //   '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC',
    //   '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570',
    //   '#c4ccd3', '#f05b72', '#ef5b9c', '#f47920', '#905a3d', '#fab27b', '#2a5caa', '#444693', '#726930',
    //   '#b2d235', '#6d8346', '#ac6767', '#1d953f', '#6950a1'
    // ], // '#A9A9A9', '#5470C6', '#D2D2D2', 
    // colorBlindPalette: [
    //   '#ff7f00', '#f781bf', '#a65628', '#984ea3', '#999999', '#e41a1c', '#dede00',
    //   '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666', '#1b9e77', '#d95f02', '#7570b3', '#e7298a',
    //   '#66a61e', '#e6ab02', '#a6761d', '#666666', '#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e',
    //   '#e6ab02', '#a6761d', '#666666'
    // ], //Color blind friendly palette // '#A9A9A9', '#377eb8', '#4daf4a'
    // normalPalette: [
    //   '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#2f4554',
    //   '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074','#546570',
    //   '#c4ccd3', '#f05b72', '#ef5b9c', '#f47920', '#905a3d', '#fab27b', '#2a5caa', '#444693',
    //   '#726930', '#b2d235', '#6d8346', '#ac6767', '#1d953f', '#6950a1', '#ffb980', '#c23531', 
    //   '#2ec7c9', '#b6a2de', '#5ab1ef', '#ff69b4', '#8b8b8b', '#cd853f', '#20b2aa', '#dda0dd', 
    //   '#87cefa', '#ffa07a', '#7fffd4', '#ba55d3', '#ff6347', '#00ced1', '#da70d6'
      
    // ],
    // colorBlindPalette: [
    //   '#ff7f00', '#f781bf', '#a65628', '#984ea3', '#999999', '#e41a1c', '#dede00',
    //   '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666', '#1b9e77', '#d95f02', '#7570b3',
    //   '#117733', '#88CCEE', '#DDCC77', '#CC6677', '#AA4499', '#44AA99', '#999933', '#882255',
    //   '#661100', '#6699CC', '#888888', '#FFDD44', '#7F3C8D', '#11A579', '#3969AC', '#F2B701',
    //   '#E73F74', '#80BA5A', '#E68310', '#008695', '#CF1C90', '#f97b72', '#24796C', '#B07AA1',
    //   '#F9A45C', '#3D3D3D', '#C85200', '#855C75', '#D9AF6B', '#5B9AA0', '#8CD17D', '#AF7AA1'
    // ]
    normalPalette: [
      '#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#FF8C42', '#A66DD4', '#FF5D9E', '#2C3E50',
      '#1ABC9C', '#F39C12', '#8E44AD', '#3498DB', '#E74C3C', '#27AE60', '#F1C40F', '#E67E22',
      '#9B59B6', '#16A085', '#2980B9', '#D35400', '#C0392B', '#D98880', '#58D68D', '#5DADE2',
      '#F4D03F', '#AF7AC5', '#48C9B0', '#F5B041', '#EC7063', '#45B39D', '#7FB3D5', '#F1948A',
      '#82E0AA', '#BB8FCE', '#F7DC6F', '#5499C7', '#E59866', '#E74C3C', '#5D6D7E', '#45B39D',
      '#D5DBDB', '#2ECC71', '#FAD02C', '#E67E22', '#2980B9', '#E84393', '#1F618D'
    ],
    colorBlindPalette: [
      '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7', '#999999',
      '#E41A1C', '#377EB8', '#4DAF4A', '#984EA3', '#FF7F00', '#A65628', '#F781BF', '#999999',
      '#66C2A5', '#FC8D62', '#8DA0CB', '#E78AC3', '#A6D854', '#FFD92F', '#E5C494', '#B3B3B3',
      '#1B9E77', '#D95F02', '#7570B3', '#E7298A', '#66A61E', '#E6AB02', '#A6761D', '#666666',
      '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', '#955251', '#B565A7', '#009B77',
      '#DD4124', '#45B8AC', '#EFC050', '#5B5EA6', '#9B2335', '#DFCFBE', '#BC243C'
    ]
  },
  
  getModelName(algo){
    let modelName = ''
    this.algorithmOptions.forEach(option => {
      if(option.value == algo){
        modelName = option.label
      }
    })
    return modelName
  },
  loadModelFromDatabase(opts, algo, clusterIndex, onDone, onError){
    // Esta funciton es de prueba, necesita los argumentos correctos para rescatar el modelo
    // console.log('Este es un codigo de prueba, hay que completarlo ---- Loading model from database...')
    let output = null
    let query = `SELECT ModelData, Cluster FROM ml_clusters_models WHERE ConfigID = ${opts.id} AND Cluster = ${clusterIndex}`
    WebService.getCustomData(query, results => {
      if(results == null || results.length == 0 || results[0].data == null || results[0].data.length == 0) {
        if(onDone != null) {
          onDone(output)
        }
        return
      }
      output = results[0].data[0][0] || null
      if(onDone != null) {
        onDone(output)
      }
    }, errorData => {
      if(onError != null) {
        onError(output)
      }
    })
  },
  saveModelToDatabase(machineCode, algo, clusterIndex, model, onDone, onError){
  },

  getPredefinedSeries(){
    let list = ['outliers', 'off', 'saturation']
    let output = []
    for(var i = 0; i < list.length; i++){
      let item = this.preClusterizeOptions[list[i]]
      if(item != null && item.serie != null){
        output.push({serie: item.serie})
      }
    }
    return output
  },
  preClusterizeOptions:{
    get outliers(){
      return {
        serie:{
          clusterIndex: -1, 
          name: 'Outliers', 
          color: '#5470C6'
        },
      }
    },
    get off(){
      return {
        requiredUnits: [0,2,6,9069], //9069 calibration
        checkCondition(row, columns){
          let calIndex = columns.indexOf(9069)
          let aIndex = columns.indexOf(0)
          let vIndex = columns.indexOf(2)
          let aeIndex = columns.indexOf(6)
          //console.log('Check condition --- off --- ', row, columns)
          if(aIndex < 0 || vIndex < 0 || aeIndex < 0){
            console.log('Error in preClusterizeOptions.off.checkCondition: required columns not found')
            return false
          }
          const cal = calIndex > -1 ? row[calIndex] : 0
          const a = row[aIndex]
          const v = row[vIndex]
          const ae = row[aeIndex]
          return EICalc.isSensorInactive(a, ae, v, 'g3', cal)
        },
        serie:{
          clusterIndex: -3,
          name: 'Off',
          color: '#D2D2D2'
        },
      }
    },
    get saturation(){
      return {
        get requiredUnits(){
          return [Enums.Units.sensorSaturation]
        }, //9069 calibration
        serie:{
          clusterIndex: -2,
          name: 'Sat',
          color: '#A9A9A9'
        },
        get conditions(){
          return [{unit: Enums.Units.sensorSaturation, condition: '>', threshold: EICalc.constants.getValue('sensorSaturation', 'limit')}]
        }
      }
      
    },
    workspace(workspace){
      if(workspace == null){
        return null
      }
      if(workspace.startDate == null || workspace.endDate == null){
        return null
      }
      // convert to ms
      let start = new Date(workspace.startDate).getTime()
      let end = new Date(workspace.endDate).getTime()
  
      let output = {
        requiredUnits: 'Date', //9069 calibration
        serie:{
          clusterIndex: 0,
          name: 'Empty workspace',
          color: 'blue'
        },
        get conditions(){
          return [
            {
              unit: 'Date', 
              condition: '<', 
              threshold: start
            },
            {
              unit: 'Date', 
              condition: '>', 
              threshold: end
            }
          ]
        },
        logicalOperator: 'or',
      }
      // console.log('getWorkspace:', output)
      return output
    },
    addRequiredUnits(preCluster, unitsToProcess){
      if(preCluster != null && preCluster.enabled == false){
        return
      }
      // check if clusterIndex exists
      if(preCluster.preClusterType != null){
        let units = this[preCluster.preClusterType].requiredUnits
        for(var i = 0; i < units.length; i++){
          if(!unitsToProcess.includes(units[i])){
            unitsToProcess.push(units[i])
          }
        }
        return 
      }else{
        let conditions = Array.isArray(preCluster.conditions) ? preCluster.conditions : [preCluster.conditions]
        for(var l = 0; l < conditions.length; l++){
          let condition = conditions[l]
          if(!unitsToProcess.includes(condition.unit)){
            unitsToProcess.push(condition.unit)
          }
        }
      }
      
    },
    getPreClusterObject(preCluster, columns){
      let output = null
      if(preCluster.preClusterType != null){
        output = this[preCluster.preClusterType]
        output.clusterIndex = preCluster.clusterIndex
        output.preClusterType = preCluster.preClusterType
      }else{
        output = preCluster
      }
      
      if(output.checkCondition == null){
        // Ensure conditions is always an array
        const conditions = Array.isArray(output.conditions) ? output.conditions : [output.conditions]
        
        // Check all columns specified by conditions exist
        if(columns != null){
          for (let c of conditions) {
            if (!columns.includes(c.unit)) {
              console.log('Error in getPreClusterObject: unit not found in columns:', c.unit)
              return null
            }
          }
        }
        

        const evaluateCondition = (row, cols, unit, cond, thr) => {
          const colIndex = cols.indexOf(unit);
          const val = row[colIndex];
          switch (cond) {
            case '>': return val > thr;
            case '>=': return val >= thr;
            case '<': return val < thr;
            case '<=': return val <= thr;
            case '==':
            case '=': return val == thr;
            case '!=': return val != thr;
            default: throw new Error("Unsupported condition: " + cond);
          }
        }
        const op = (preCluster.logicalOperator || 'or').toLowerCase();
        
        output.checkCondition = (row, cols) => {
          const results = conditions.map(c => evaluateCondition(row, cols, c.unit, c.condition, c.threshold));
          if (op == 'and') {
            return results.every(Boolean);
          } else {
            // default to 'or'
            return results.some(Boolean);
          }
        }
      }
      
      //console.log('PreCluster Object:', output)
      return output
    },
    getSerie(preCluster){
      let output = null
      if(preCluster.preClusterType != null){
        output = this[preCluster.preClusterType].serie.deepClone()
      }else{
        output = preCluster.serie
      }
      let defaults = MachineLearning.getPredefinedSeries()
      for(var i = 0; i < defaults.length; i++){
        if(defaults[i].serie.name == output.name){
          output = defaults[i].serie
          break
        }
      }
      return output
    },
    getClusterIndex(preCluster, index){
      if(preCluster.serie.clusterIndex != null){
        return preCluster.serie.clusterIndex
      }else{
        let defaults = MachineLearning.getPredefinedSeries()
        for(var i = 0; i < defaults.length; i++){
          if(defaults[i].serie.name == preCluster.serie.name){
            return defaults[i].serie.clusterIndex
          }
        }
      }
      return (index + 2) * -1
      //let defaults = MachineLearning.getPredefinedSeries()

    },
    getSeries(preClusterOptions){
      if(!Array.isArray(preClusterOptions)){
        preClusterOptions = [preClusterOptions]
      }
      let output = [this.outliers.serie]
      for(var i = 0; i < preClusterOptions.length; i++){
        let serie = this.getSerie(preClusterOptions[i])
        if(serie != null){
          output.push(serie)
        }
      }
      return output
    },
    check(preClusterizeOption, i){
      if(Array.isArray(preClusterizeOption)){
        for(var l = 0; l < preClusterizeOption.length; l++){
          this.check(preClusterizeOption[l], l)
        }
      }else{
        if(preClusterizeOption.serie == null){
          preClusterizeOption.serie = this.getSerie(preClusterizeOption)
        }
        if(preClusterizeOption.clusterIndex == null){
          preClusterizeOption.clusterIndex = this.getClusterIndex(preClusterizeOption, i)
        }
      }
      
    }
  },
  configs:{
    // meaningfulValues:[
    //   {unit: Enums.Units.g, value: 0.3},
    //   {unit: Enums.Units.mm_s, value: 1.5},
    //   {unit: Enums.Units.gE, value: 0.2},
    //   {modifier: Enums.UnitsModifiers.lowFrequency, unit: Enums.Units.g, value: 0.2},
    //   {modifier: Enums.UnitsModifiers.mediumFrequency, unit: Enums.Units.g, value: 0.2},
    //   {modifier: Enums.UnitsModifiers.highFrequency, unit: Enums.Units.g, value: 0.2},
    //   {modifier: Enums.UnitsModifiers.kurtosis, unit: Enums.Units.g, value: 1},
    //   {modifier: Enums.UnitsModifiers.skewness, unit: Enums.Units.g, value: 0.5},
    //   {modifier: Enums.UnitsModifiers.hilbertEnvelope, unit: Enums.Units.mm_s, value: 3},
    // ],
    getMeaningfulValue(unit, meaningfulValues) { //Value where the ouput scaling should be -1 to 1
      //mergeModifier(unit, modifier)
      const unitValues = meaningfulValues
      for(var i = 0; i < unitValues.length; i++){
        const uv = unitValues[i]
        if(uv.enabled === true || uv.enabled == null){
          let u = uv.unit
          if(uv.modifier != null){
            u = Enums.Units.mergeModifier(u, uv.modifier)
          }
          if(u == unit){
            return uv.value
          }
        }
        
      }
      return null
      // '0': 0.1, //rms accel
      // '2': 0.5, //rms vel
      // '6': 0.2, //rms disp
      // '21313': 0.9, //kurtosis accel
      // '21414': 0.5, //skewness accel
    },
    getWeight(data, index, unit, meaningfullValues){
      let weight = 1
      let value = this.getMeaningfulValue(unit, meaningfullValues)
      if(value != null){
        let stdDev = MachineLearning.statistics.standardDeviation(data, index)
        weight = (1 / value) * stdDev
        //console.log('getWeight:', 'unit:', Enums.Units.splitUnit(unit), 'Weight', weight, 'stdDev:', stdDev, 'value:', value)
      }
      if(weight > 1){
        weight = 1
      }
      return weight
    }
  },
  statistics:{
    getMaxMinValue(data, index){//Gets the max and min value of a index in an array of arrays
      let max = -Infinity
      let min = Infinity
      for(var i = 0; i < data.length; i++){
        if(data[i][index] > max){
          max = data[i][index]
        }
        if(data[i][index] < min){
          min = data[i][index]
        }
      }
      return [min, max]
    },
    standardDeviation(data, index) {
      let values = null
      if(index == null){
        values = data
      }else{
        values = data.map(row => row[index])
      }
    
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
      const variance = values.reduce((sum, val) => {
        const diff = val - mean;
        return sum + diff * diff;
      }, 0) / (values.length - 1)
    
      return Math.sqrt(variance)
    },
  },
  events:{
    eventTypes:{
      get learningStart(){
        return this.fullEvents.learningStart.value
      },
      get learningEnd(){
        return this.fullEvents.learningEnd.value
      },
      get newCluster(){
        return this.fullEvents.newCluster.value
      },
      get userDefined(){
        return this.fullEvents.userDefined.value
      },
      fullEvents:{
        learningStart: {value: 1, label: 'Learning Start'},
        learningEnd: {value: 2, label: 'Learning End'},
        newCluster: {value: 3, label: 'New Mode'},
        userDefined: {value: 4, label: 'User Defined'},
        yellowLimitExceeded: {value: 5, label: 'Yellow Limit Exceeded'},
        orangeLimitExceeded: {value: 6, label: 'Orange Limit Exceeded'},
        redLimitExceeded: {value: 7, label: 'Red Limit Exceeded'},
      }
    },
    getEvents(){

    },
    getNewClustersEvents(data, columns, clusters, existingClusters, startIndex){
      let dateIndex = columns.indexOf('Date')
      if(dateIndex < 0){
        console.log('Error in getNewClustersEvents: Date column not found')
        return []
      }

      let newClusterEvents = []
      let exClusters = existingClusters.deepClone()
      for(var i = startIndex; i < clusters.length; i++){
        if(!exClusters.includes(clusters[i])){
          let clusterIndex = clusters[i]
          let d = data[i][dateIndex]
          exClusters.push(clusterIndex)
          let event = {
            type: MachineLearning.events.eventTypes.newCluster,
            clusterIndex: clusterIndex,
            date: d,
            index: i
          }
          newClusterEvents.push(event)
        }
        //data[i][dateIndex] = new Date(data[i][dateIndex])
      }

      let output = {
        events: newClusterEvents,
        existingClusters: exClusters
      }
      //console.log('new Cluster Events', output)
      return output
    }
  },
  
  MLOutput: class{
    constructor(algo, clustering, data, model){
      this.algo = algo
      this.clustering = clustering
      //this.data = data
      this.returnedModel = model
    }
    getClusteredData(dataPoints, range){
      if(dataPoints == null){
        dataPoints = this.data
      }
      range = MachineLearning.getIndicesFromRange(range, dataPoints.length)

      const indices = this.clustering.clusters
      
      if(indices.length != range.length){
        console.log('Error in getClusteredData: indices length is different from dataPoints length')
      }
      let output = [] // noise cluster
      
      for(var i = 0; i < indices.length; i++){
        let clusterIndex = indices[i]
        let cluster = null
        for(var l = 0; l < output.length; l++){
          if(output[l].clusterIndex == clusterIndex){
            cluster = output[l]
            break
          }
        }
        let dataIndex = i + range.startIndex
        if(cluster == null){
          cluster = {clusterIndex: clusterIndex, data: [], firstAppearanceIndex: i, lastAppearanceIndex: dataIndex}
          output.push(cluster)
        }
        cluster.data.push(dataPoints[dataIndex])
        cluster.lastAppearanceIndex = dataIndex
      }
      return output
    }
    getEvents(data, columns){
      //get start and end of clusters
      let events = []
      

      let dateIndex = columns.indexOf('Date')
      if(dateIndex < 0){
        console.log('Error in getEvents: Date column not found')
        return events
      }
      let workflow = this.clustering.workflow
      
      if(workflow == null){
        return
      }


      function getDateIndex(date){
        if(dateIndex < 0){
          return -1
        }
        //date = new Date(date)
          
        for(var i = 0; i < data.length; i++){
          let d = data[i][dateIndex]//new Date(data[i][dateIndex])
          if(d == date){
            return i
          }
        }
        return -1
      }

      let startEvent = null
      let endEvent = null

      if(workflow.learning.startDate != null){
        startEvent = {
          type: MachineLearning.events.eventTypes.learningStart,
          date: workflow.learning.startDate,
          index: getDateIndex(workflow.learning.startDate)
        }
        events.push(startEvent)
      }
      if(workflow.learning.endDate != null){
        endEvent = {
          type: MachineLearning.events.eventTypes.learningEnd,
          date: workflow.learning.endDate,
          index: getDateIndex(workflow.learning.endDate)
        }
        events.push(endEvent)
      }

      //checking new clusters since endDate
      let clusters = this.clustering.clusters
      let existingClusters = []

      let startIndex = 0
      if(startEvent != null){
        startIndex = startEvent.index
        
      }
      let endIndex = 0
      if(endEvent != null){
        endIndex = endEvent.index
        for(var i = startIndex; i <= endIndex; i++){
          if(!existingClusters.includes(clusters[i])){
            existingClusters.push(clusters[i])
          }
        }
      }

      //console.log('getEvents', {data, columns, clusters, existingClusters, startIndex})
      let newClusterEvents = MachineLearning.events.getNewClustersEvents(data, columns, clusters, existingClusters, startIndex)
      
      events.push(...newClusterEvents.events)
      console.log('Events ---- ', events)

    }
    
  },
  getIndicesFromRange(range, dataLength){
    let startIndex = 0
    let endIndex = dataLength - 1
    function getIndex(value){
      if(typeof value == 'string' && range.includes('%')){
        let percentage = parseFloat(value.replace('%', '')) / 100
        return Math.floor(dataLength * percentage)
      }else{
        return value
      }
    }
    if(range == null){
      endIndex = dataLength - 1
    }else{
      if(typeof range == 'object'){
        if(range.startIndex != null){
          startIndex = range.startIndex
        }else{
          if(range.start != null){
            startIndex = getIndex(range.start)
          }
        }
        if(range.endIndex != null){
          endIndex = range.endIndex
        }else{
          if(range.end != null){
            endIndex = getIndex(range.end)
          }
        }
      }else{
        endIndex = getIndex(range)
      }
    }
    if(endIndex > dataLength - 1){
      endIndex = dataLength - 1
    }
    if(startIndex < 0){
      startIndex = 0
    }
    let length = endIndex - startIndex + 1
    return {startIndex, endIndex, length}
  },
  getDefaultMeaningfulValues(){
    return [
      {unit: Enums.Units.g, value: 0.3},
      {unit: Enums.Units.mm_s, value: 1.5},
      {unit: Enums.Units.gE, value: 0.2},
      {modifier: Enums.UnitsModifiers.lowFrequency, unit: Enums.Units.g, value: 0.2},
      {modifier: Enums.UnitsModifiers.mediumFrequency, unit: Enums.Units.g, value: 0.2},
      {modifier: Enums.UnitsModifiers.highFrequency, unit: Enums.Units.g, value: 0.2},
      {modifier: Enums.UnitsModifiers.kurtosis, unit: Enums.Units.g, value: 1},
      {modifier: Enums.UnitsModifiers.skewness, unit: Enums.Units.g, value: 0.5},
      {modifier: Enums.UnitsModifiers.hilbertEnvelope, unit: Enums.Units.mm_s, value: 3},
    ]
  },
  getScalingParams(data, columns, units, meaningfullValues){
    let output = []
    for(var i = 0; i < units.length; i++){
      let index = columns.indexOf(units[i])
      let weight = 1
      if(index < 0){
        console.log('Error in getScalingParams: unit not found in columns:', units[i])
      }else{
        weight = this.configs.getWeight(data, index, units[i], meaningfullValues)
      }
      if(weight != null){
        let scale = {
          index: i,
          unit: units[i],
          type: 'standard',
          weight: weight
        }
        output.push(scale)
      }
    }
    return {scaling: output}
  },
  preClusterize(data, columns, preclusterizeOptions){
    MachineLearning.preClusterizeOptions.check(preclusterizeOptions)
    let output = this.clusterize(data, columns, null, 'preclusterize', {preClusterizeOptions: preclusterizeOptions})
  },
  filterPreClusterizedData(data, columns, preclusterizeOptions, workflow){
    let dataToCluster = data.deepClone()
    let preClusterArray = []
    if(workflow != null && workflow.workspace != null){
      let workspacePrecluster = this.preClusterizeOptions.workspace(workflow.workspace)
      if(workspacePrecluster != null){
        preClusterArray.push(workspacePrecluster)
      }
    }
    if (preclusterizeOptions != null && preclusterizeOptions.length > 0) {
      // Ensure it's an array
      preclusterizeOptions = Array.isArray(preclusterizeOptions) ? preclusterizeOptions : [preclusterizeOptions]
      for(var i = 0; i < preclusterizeOptions.length; i++){
        let pco = preclusterizeOptions[i]
        if(pco != null && pco.enabled !== false){
          preClusterArray.push(pco)
        }
      }
    }
    for(var i = 0; i < preClusterArray.length; i++){
      let pco = preClusterArray[i]
      let preClusterStep = this.preClusterizeSingle(dataToCluster, columns, pco)
      dataToCluster = preClusterStep.filteredData
    }
    return dataToCluster
  },
  preClusterizeSingle(data, columns, options) {
    let opts = Object.assign({
      preClusterType: null,
      conditions: null, 
      // conditions: [{unit: 'someUnit', condition: '>', threshold: 0.5}, {unit: 'otherUnit', condition: '<', threshold: 1.5}],
      // logicalOperator: 'and' // or 'or', default 'or'
    }, options)
    
    if (opts.preClusterType == null && opts.conditions == null) {
      return null
    }
    
    let preClustedObject = MachineLearning.preClusterizeOptions.getPreClusterObject(opts, columns)
    if(preClustedObject == null || preClustedObject.enabled == false){
      return null
    }
    
    const preClusterAssignments = new Array(data.length).fill(null);
    const filteredData = [];
    const filteredIndices = [];
  
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (preClustedObject.checkCondition(row, columns)) {
        // meets the pre-cluster condition
        //console.log('Pre-clustered:', row)
        preClusterAssignments[i] = preClustedObject.clusterIndex;
      } else {
        filteredData.push([...row]); // keep this row for further clustering
        filteredIndices.push(i);
      }
    }
  
    return {
      filteredData,
      preClusterAssignments,
      filteredIndices,
    }
  },
  rejoinClusterAssignments(preClusterAssignments, filteredIndices, clusterResults) {
    const finalAssignments = preClusterAssignments.slice();
  
    for (let i = 0; i < filteredIndices.length; i++) {
      const originalIndex = filteredIndices[i];
      finalAssignments[originalIndex] = clusterResults[i];
    }
  
    return finalAssignments;
  },
  
  clusterize(data, columns, features, algo, params, workflow, existingModel, onDone, onError){
    let self = this
    let preRes = null
    let dataToCluster = data

    let workSpacePrecluster = null
    
    if(workflow != null && workflow.workspace != null){
      workSpacePrecluster = this.preClusterizeOptions.workspace(workflow.workspace)
    }
    // console.log('workSpacePrecluster', workSpacePrecluster)
    
    let preClusterizeArray = []
    if(workSpacePrecluster != null){
      preClusterizeArray.push(workSpacePrecluster)
    }
    if (params != null && params.preClusterizeOptions != null) {
      // Ensure it's an array
      let preClusterizeOpts = Array.isArray(params.preClusterizeOptions) ? params.preClusterizeOptions : [params.preClusterizeOptions]
      for(var i = 0; i < preClusterizeOpts.length; i++){
        let pco = preClusterizeOpts[i]
        if(pco != null && pco.enabled !== false){
          preClusterizeArray.push(pco)
        }
      }
    }
    // If we have preClusterizeOptions, run that first
    if (preClusterizeArray != null && preClusterizeArray.length > 0) {
      // We'll store the steps of preClustering results
      let preClusterSteps = [];
      
      for (let pco of preClusterizeArray) {
        let preResStep = this.preClusterizeSingle(dataToCluster, columns, pco)
        if(preResStep != null){
          dataToCluster = preResStep.filteredData
          preClusterSteps.push(preResStep)
        }
      }

      preRes = preClusterSteps // now preRes is an array of steps
    }

    function finishClustering(result, workflow){
      let finalAssignments = result.clusters
      let miliseconds = result.miliseconds

      // Rejoin assignments in reverse order
      if (preRes != null && preRes.length > 0) {
        for (let i = preRes.length - 1; i >= 0; i--) {
          finalAssignments = self.rejoinClusterAssignments(preRes[i].preClusterAssignments, preRes[i].filteredIndices, finalAssignments);
        }
      }
      
      let output = new MachineLearning.MLOutput(algo, {clusters: finalAssignments, miliseconds: miliseconds, workflow: workflow}, data, result.model)
      
      // console.log('Clustering finished', output)
      if(onDone != null){
        onDone(output)
      }
      return output
    }

    if(algo === 'preclusterize'){
      let clusters = new Array(dataToCluster.length).fill(0)
      return finishClustering({clusters: clusters, miliseconds: 0}, null)
    }
    
    if(dataToCluster == null || dataToCluster.length == 0){
      return finishClustering({clusters: [], miliseconds: 0})
    }
    // Get scaling parameters from the (possibly filtered) data
    
    let indexedWorkflow = this.getWorkflow(dataToCluster, columns, workflow)

    let meaningfullValues = params.meaningfullValues
    
    let pythonParams = {}
    if(meaningfullValues != null){
      pythonParams = this.getScalingParams(dataToCluster, columns, features, meaningfullValues)
    }
    
    // assign params.algoParams into scalingParams
    if(params != null && params.algoParams != null){
      pythonParams = Object.assign(pythonParams, params.algoParams)
    }

    //console.log('Python Params - ', algo, pythonParams)
    let options = {
      algo: algo,
      params: pythonParams,
      workflow: indexedWorkflow,
    }
    

    
    
    
    //remove all the columns that are not in features
    if(features != null && features.length > 0){
      let columnsToRemove = []
      for(var i = 0; i < columns.length; i++){
        if(!features.includes(columns[i])){
          columnsToRemove.push(i)
        }
      }
      if(columnsToRemove.length > 0){
        let dataToClusterFiltered = []
        for(var i = 0; i < dataToCluster.length; i++){
          let row = dataToCluster[i]
          let newRow = []
          for(var l = 0; l < row.length; l++){
            if(!columnsToRemove.includes(l)){
              newRow.push(row[l])
            }
          }
          dataToClusterFiltered.push(newRow)
        }
        dataToCluster = dataToClusterFiltered
      }
    }

    

    function sendPostRequest(){
      // console.log('Sending post request to clusterize with options:', options)
      MachineLearning.sendPostRequest(dataToCluster, options, result => {
        finishClustering(result, options.workflow)
      }, onError)
    }

    if(typeof existingModel === 'function'){
      existingModel(model => {
        options.model = model
        sendPostRequest()
      })
    }else{
      options.model = existingModel
      sendPostRequest()
    }

    // //Aqui deberiamos llamar al existingModel
    // if(existingModel != null){
    //   if(typeof existingModel === 'object'){
    //     existingModel = existingModel.model
    //   }else if(typeof existingModel === 'function'){
    //     existingModel = await existingModel()
    //   }
    //   options.model = existingModel
    // }

    // this.sendPostRequest(dataToCluster, options, result => {
    //   finishClustering(result, options.workflow)
    // }, onError)
    
    
  },

  sendPostRequest(dataArray, options, onDone, onError, endPoint = 'clusterize', method = 'POST') {
    // console.log('sendPostRequest', options)
    let params = {
      'quantile': 0.3,
      'eps': 0.3,
      'damping': 0.9,
      'preference': -200,
      'n_neighbors': 3,
      'n_clusters': 5,
      'min_samples': 7,
      'xi': 0.05,
      'min_cluster_size': 0.1,
      'allow_single_cluster': true,
      'hdbscan_min_cluster_size': 15,
      'hdbscan_min_samples': 3,
      'random_state': 42,
      'threshold': 0.5,
      'branching_factor': 50,
      'return_n_data': false //return normalized data, retorna los datos tal como los uso para clusterizar
    }

    if(options != null && options.params != null){
      params = Object.assign(params, options.params)
    }
    
    let opts = Object.assign({
      algo: 'meanshift',
    }, options)

    opts.params = params

    let data = {
      data: dataArray,
      algo: opts.algo,
      params: opts.params,
      workflow: opts.workflow,
    }

    if (opts.model) {
      data.model = opts.model
    }

    const request = {
      method: method,
      json: true,
      headers: {
        'Content-Type': 'application/json'
      },
      url: clusterizeAddress + endPoint,
      data: data
    }

    let start = new Date().getTime()

    axios(request).then(response => {
      if(response == null || response.data == null){
        // console.log('Error in endpoint: ' + endPoint, ' with message:', 'No data returned')
        if(onError != null){
          onError('No data returned')
        }
        return
      }
      //console.log('Response from endpoint:', endPoint, response)
      
      if(onDone != null){
        let output = {
          clusters: response.data.clusters,
          model: response.data.model,
          miliseconds: new Date().getTime() - start
        }
        //output.miliseconds = new Date().getTime() - start
        onDone(output)
      }
    }).catch(function (error) {
      // console.log('Error in endpoint: ' + endPoint, ' with message:', error.message)
      if(onError != null){
        onError(error)
      }
    })
  },

  getWorkflow(data, columns, workflow) {
    if (!workflow || !workflow.enabled || !workflow.learning || !workflow.learning.startDate || !workflow.learning.endDate) {
      return null
    }
  
    const startDate = new Date(workflow.learning.startDate)
    const endDate = new Date(workflow.learning.endDate)
    const minCount = workflow.learning.minCount || 30
  
    const dateIndex = columns.indexOf('Date')
    if (dateIndex === -1) return null
  
    let startIndex = null
    let endIndex = null
  
    let startExactDate = null
    let endExactDate = null
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const date = new Date(row[dateIndex])
  
      if (startIndex === null && date >= startDate) {
        startIndex = i
        startExactDate = row[dateIndex]
      }
  
      if (date <= endDate) {
        endIndex = i
        endExactDate = row[dateIndex]
      }
  
      if (date > endDate) {
        break
      }
    }

    let hasError = false
    let errorMessage = null
    let learningCount = endIndex - startIndex
    

    let output = {
      learning: {
        startIndex,
        endIndex,
        startDate: startExactDate,
        endDate: endExactDate,
        minCount,
        count: learningCount,
        error: hasError,
        errorMessage: errorMessage
      },
      postLearning: Object.assign({
        direction: 'asc',
        batch: 1
      }, workflow.postLearning)
    }

    // Validate that we found both indices and the range makes sense
    // if (startIndex === null || endIndex === null || startIndex > endIndex) {
    //   return null
    // }
  
    
    if(minCount != null && learningCount < minCount){
      hasError = true
      errorMessage = 'Not enough data points for learning'
      console.log('Error in getWorkflow: not enough data points for learning, Count:', learningCount, output)
    }
    return output
  },
  
  getDefaultClusteringOptions(){
    return {
      //miliseconds: 0,
      
      algorithms: ['birch', 'minibatchkmeans'],
      params: [
        {
          // id: 1,
          algo: 'birch',
          algoParams:{
            n_clusters: null,
            threshold: 0.5,
            branching_factor: 50
          },
          features: [2, 6, 9050, 21313, 21618, 21717], //vel, env, HF g, Kurt, Skew, HE mms, MF g 

          dataSplitter: {
            algo: 'meanshift',
            // algoParams:{
            //   //n_clusters: 5
            // },
            features: [21515], //eRPM accel

            preClusterizeOptions: [
              {
                preClusterType: 'saturation',
              },
              {
                preClusterType: 'off',
              },

            ]
          },
          preClusterizeOptions: [
            // {
            //   clusterIndex: 0,
            //   serie:{
            //     name: 'Empt',
            //     color: '#A9A9A9'
            //   },
            //   conditions: {unit: Enums.Units.mm_s, condition: '<', threshold: 1.5},
            // },
            {
              serie:{
                name: 'Sat',
                color: '#A9A9A9'
              },
              conditions: {unit: Enums.Units.sensorSaturation, condition: '>', threshold: EICalc.constants.getValue('sensorSaturation', 'limit')},
            },
            {
              preClusterType: 'off',
            },
            
          ],
          charting:{
            charts:[
              {
                features: [2, 6, 9050],
                //features: [6, 9050],
              },
              {
                features: [21515, 2],
              }
            ],

            featuresOptions: [],
            columnNames: [],
            
          },
        },
        {
          // id: 2,
          algo: 'birch',
          algoParams:{
            n_clusters: 10,
          },
          features: [2, 6, 9050, 21313, 21414, 21618, 21717], //vel, env, HF g, Kurt, Skew, HE mms, MF g 

          preClusterizeOptions: [
            {
              serie:{
                name: 'Sat',
                color: '#A9A9A9'
              },
              conditions: {unit: Enums.Units.sensorSaturation, condition: '>', threshold: EICalc.constants.getValue('sensorSaturation', 'limit')},
            },
            {
              preClusterType: 'off',
            }
          ],
          meaningfullValues: [
            {unit: Enums.Units.g, value: 0.3},
            {unit: Enums.Units.mm_s, value: 1.5},
            {unit: Enums.Units.gE, value: 0.2},
            {modifier: Enums.UnitsModifiers.lowFrequency, unit: Enums.Units.g, value: 0.2},
            {modifier: Enums.UnitsModifiers.mediumFrequency, unit: Enums.Units.g, value: 0.2},
            {modifier: Enums.UnitsModifiers.highFrequency, unit: Enums.Units.g, value: 0.2},
            {modifier: Enums.UnitsModifiers.kurtosis, unit: Enums.Units.g, value: 1},
            {modifier: Enums.UnitsModifiers.skewness, unit: Enums.Units.g, value: 0.5},
            {modifier: Enums.UnitsModifiers.hilbertEnvelope, unit: Enums.Units.mm_s, value: 3},
          ]
        },
      ]
      // params: [{
      //   id: 1,
      //   algo: 'birch',
      //   algoParams:{
      //     n_clusters: 10
      //   },
      //   features: [2, 6, 9050, 21313, 21414, 21618, 21717], //vel, env, HF g, Kurt, Skew, HE mms, MF g 

      //   preClusterizeOptions: [
      //     {
      //       serie:{
      //         name: 'Sat',
      //         color: '#A9A9A9'
      //       },
      //       conditions: {unit: Enums.Units.sensorSaturation, condition: '>', threshold: EICalc.constants.getValue('sensorSaturation', 'limit')},
      //     },
      //     {
      //       preClusterType: 'off',
      //     }
      //   ],
      // },
      // {
      //   id: 1,
      //   algo: 'birch',
      //   algoParams:{
      //     n_clusters: 10
      //   },
      //   features: [2, 6, 9050, 21313, 21414, 21618, 21717], //vel, env, HF g, Kurt, Skew, HE mms, MF g 

      //   preClusterizeOptions: [
      //     {
      //       serie:{
      //         name: 'Sat',
      //         color: '#A9A9A9'
      //       },
      //       conditions: {unit: Enums.Units.sensorSaturation, condition: '>', threshold: EICalc.constants.getValue('sensorSaturation', 'limit')},
      //     },
      //     {
      //       preClusterType: 'off',
      //     }
      //   ],
      //   meaningfullValues: [
      //     {unit: Enums.Units.g, value: 0.3},
      //     {unit: Enums.Units.mm_s, value: 1.5},
      //     {unit: Enums.Units.gE, value: 0.2},
      //     {modifier: Enums.UnitsModifiers.lowFrequency, unit: Enums.Units.g, value: 0.2},
      //     {modifier: Enums.UnitsModifiers.mediumFrequency, unit: Enums.Units.g, value: 0.2},
      //     {modifier: Enums.UnitsModifiers.highFrequency, unit: Enums.Units.g, value: 0.2},
      //     {modifier: Enums.UnitsModifiers.kurtosis, unit: Enums.Units.g, value: 1},
      //     {modifier: Enums.UnitsModifiers.skewness, unit: Enums.Units.g, value: 0.5},
      //     {modifier: Enums.UnitsModifiers.hilbertEnvelope, unit: Enums.Units.mm_s, value: 3},
      //   ]
      // },
      // {
      //   id: 2,
      //   algo: 'meanshift',
      //   algoParams:{
      //     n_clusters: 10
      //   },
      //   features: [2, 6, 9050, 21313, 21414, 21618, 21717], //vel, env, HF g, Kurt, Skew, HE mms, MF g 

      //   preClusterizeOptions: [
      //     {
      //       serie:{
      //         name: 'Sat',
      //         color: '#A9A9A9'
      //       },
      //       conditions: {unit: Enums.Units.sensorSaturation, condition: '>', threshold: EICalc.constants.getValue('sensorSaturation', 'limit')},
      //     },
      //     {
      //       preClusterType: 'off',
      //     }
      //   ],
      // },
      // {
      //   id: 2,
      //   algo: 'meanshift',
      //   algoParams:{
      //     n_clusters: 10
      //   },
      //   features: [2, 6, 9050, 21313, 21414, 21618, 21717], //vel, env, HF g, Kurt, Skew, HE mms, MF g 

      //   preClusterizeOptions: [
      //     {
      //       serie:{
      //         name: 'Sat',
      //         color: '#A9A9A9'
      //       },
      //       conditions: {unit: Enums.Units.sensorSaturation, condition: '>', threshold: EICalc.constants.getValue('sensorSaturation', 'limit')},
      //     },
      //     {
      //       preClusterType: 'off',
      //     }
      //   ],
      //   meaningfullValues: [
      //     {unit: Enums.Units.g, value: 0.3},
      //     {unit: Enums.Units.mm_s, value: 1.5},
      //     {unit: Enums.Units.gE, value: 0.2},
      //     {modifier: Enums.UnitsModifiers.lowFrequency, unit: Enums.Units.g, value: 0.2},
      //     {modifier: Enums.UnitsModifiers.mediumFrequency, unit: Enums.Units.g, value: 0.2},
      //     {modifier: Enums.UnitsModifiers.highFrequency, unit: Enums.Units.g, value: 0.2},
      //     {modifier: Enums.UnitsModifiers.kurtosis, unit: Enums.Units.g, value: 1},
      //     {modifier: Enums.UnitsModifiers.skewness, unit: Enums.Units.g, value: 0.5},
      //     {modifier: Enums.UnitsModifiers.hilbertEnvelope, unit: Enums.Units.mm_s, value: 3},
      //   ]
      // }]
      // dataTransforms:[
      //   {
      //     type: 'group',
      //     groupIndex: 1,
      //     referenceIndex: 0,
      //     ensureAlignedReferences: true, // New parameter
      //   },
      //   {
      //     type: 'convert',
      //     columnIndex: 0,
      //     convert: {
      //       type: 'formatter',
      //       dataType: 'date'
      //     }
      //   },
      //   {
      //     type: 'sort',
      //     columnIndex: 0,
      //     order: 'asc'
      //   },
      // ],
      
      
      //features: [6, 9050],
      
      // params: {
      //   algo: 'birch',
      //   algoParams: {//Estos parametros son los parametros del algoritmo que se envían a python
      //     n_clusters: 5
      //   },
      //   features: [2, 6, 9050, 21313, 21414, 21618, 21717], //vel, env, HF g, Kurt, Skew, HE mms, MF g 

      //   preClusterizeOptions: [
      //     {
      //       serie:{
      //         name: 'Sat',
      //         color: '#A9A9A9'
      //       },
      //       conditions: {unit: Enums.Units.sensorSaturation, condition: '>', threshold: EICalc.constants.getValue('sensorSaturation', 'limit')},
      //     },
      //     {
      //       preClusterType: 'off',
      //       // serie:{
      //       //   name: 'Off',
      //       //   color: '#91CC75'
      //       // },
      //       // conditions: [
      //       //   {unit: Enums.Units.gE, condition: '<=', threshold: EICalc.constants.getValue('inactivityValues', 'gE', 'g3')}, 
      //       //   {unit: Enums.Units.g, condition: '<=', threshold: EICalc.constants.getValue('inactivityValues', 'g', 'g3')},
      //       //   {unit: Enums.Units.mm_s, condition: '<=', threshold: 1.5}
      //       // ],
      //       // logicalOperator: 'and',
      //     }
      //   ],
      //   //range: '30%' --- Este parametro se puede usar para limitar el rango de datos a procesar
        
      // },
    }
  },

  newDataSplitter(){
    return {
      algo: 'meanshift',
      algoParams:{
        //n_clusters: 5
      },
      features: [21515], //eRPM accel

      preClusterizeOptions: [
        {
          preClusterType: 'saturation',
          // serie:{
          //   name: 'Sat',
          //   color: '#A9A9A9'
          // },
          // conditions: {unit: Enums.Units.sensorSaturation, condition: '>', threshold: EICalc.constants.getValue('sensorSaturation', 'limit')},
        },
        {
          preClusterType: 'off',
          // serie:{
          //   name: 'Off',
          //   color: '#91CC75'
          // },
        },

      ]
      
    }
  },

  sortClusterNegativeValuesOnly(clusteredData) {
    const negativeItems = [];
    const positiveItems = [];

    for (const item of clusteredData) {
      if (item.clusterIndex < 0) {
        negativeItems.push(item);
      } else {
        positiveItems.push(item);
      }
    }

    negativeItems.sort((a, b) => a.clusterIndex - b.clusterIndex);

    return negativeItems.concat(positiveItems);
  },
  getColumnNames(columns){
    if(columns == null || columns.length == 0){
      return []
    }
    let columnNames = []
    for(var i = 0; i < columns.length; i++){
      if(typeof columns[i] == 'string'){
        columnNames.push(columns[i])
      }else{
        let name = Enums.Units.getFullUnit(columns[i]).parameter
        columnNames.push(name)
      }
    }
    return columnNames
  },
  getFeaturesOptions(columns, columnNames){
    let output = []
    for(var i = 0; i < columns.length; i++){
      const column = columns[i]
      const columnName = columnNames[i]
      output.push({
        label: columnName,
        value: column,
      })
    }
    return output
  },
  database:{
    get trendTransforms(){
      return [
        {
          type: 'convert',
          columnIndex: 0,
          convert: {
            type: 'formatter',
            dataType: 'time'
          }
        },
        {
          type: 'sort',
          columnIndex: 0,
          order: 'asc'
        },
        {
          type: 'serialize',
          columnIndex: 1,
          // xAxisIndex: 0,
          // valueIndex: 2,
          convertName: 'unitsParameter',
          colorizeUnits: false,
          ensureAlignedReferences: true
        },
      ]
    },
    get clusterTransforms(){
      return [
        {
          type: 'convert',
          columnIndex: 1,
          convert: {
            type: 'formatter',
            dataType: 'time'
          }
        },
        {
          type: 'sort',
          columnIndex: 1,
          order: 'asc'
        }
      ]
    },
    get scatterTransforms(){
      return [
        {
          type: 'group',
          groupIndex: 1,
          referenceIndex: 0,
          ensureAlignedReferences: true, // New parameter
        },
        // {
        //   type: 'convert',
        //   columnIndex: 0,
        //   convert: {
        //     type: 'formatter',
        //     dataType: 'date'
        //   }
        // },
        {
          type: 'convert',
          columnIndex: 0,
          convert: {
            type: 'formatter',
            dataType: 'time'
          }
        },
        {
          type: 'sort',
          columnIndex: 0,
          order: 'asc'
        }
      ]
    },
    groupByCluster(data){
      const map = {}
    
      data.forEach(([clusterIndex, ...rest]) => {
        if(!map[clusterIndex]){
          map[clusterIndex] = []
        }
        map[clusterIndex].push(rest)
      })
    
      return Object.keys(map).map(key => ({
        modelID: parseInt(key),
        clustersIndices: map[key]
      }))
    },
    alignClustersWithDataByDate(data, clusters) {
      
      const clusterMap = new Map(clusters.map(c => [c[0], c[1]]))
    
      const alignedClusters = data.map(d => {
        const date = d[0]
        return clusterMap.get(date) || 0
      })
    
      return alignedClusters
    },
    alignArrays(mainArray, mainIndex, arrayToAlign, index2) {
      const arrayToAlignMap = new Map(arrayToAlign.map(item => [item[index2], item]))
    
      const alignedArray = mainArray.map(d => {
        const compareValue = d[mainIndex]
        return arrayToAlignMap.get(compareValue) || null
      })
    
      return alignedArray
    },
    async getTrend(options, onDone){ // Nueva
      let opts = Object.assign({
        machineCode: 0,
        pointIndex: 1,
        axis: 1,
        startDate: new Date().addMonths(-6),
        endDate: new Date(),
      }, options)
  
  
      let {machineCode, pointIndex, axis, startDate, endDate} = opts
      startDate = startDate.toString(MySQLDateFormat)
      endDate = endDate.toString(MySQLDateFormat)
  
      let queries = []
      queries.push({
        id: 'trendData',
      //   query: `SELECT m.date_time AS Date, ml.unit AS U, ml.value AS V FROM ml_historic_values AS ml 
      // INNER JOIN M__${machineCode}_f AS m ON ml.FileID=m.ID WHERE ml.machinecode=${machineCode} AND ml.pointindex=${pointIndex} 
      // AND ml.axis=${axis} AND m.date_time BETWEEN '${startDate}' AND '${endDate}';`
        query: `SELECT m.date_time AS Date, mv.unit AS U, mv.value AS V, mv.measureid FROM measuresvalues mv INNER JOIN measures m ON mv.measureid=m.id 
        WHERE m.machinecode=${machineCode} AND m.pointindex=${pointIndex} 
        AND m.channel=${axis} AND m.date_time BETWEEN '${startDate}' AND '${endDate}';`
      })
  
      // if(opts.pointIndex != null && opts.pointIndex != 0 && opts.axis != null && opts.axis != 0){
      //   queries.push({
      //     id: 'clusters',
      //     query: `SELECT ModelID as ID, ci.date_time as D, cluster as C FROM ml_clusters_indices ci 
      //     INNER JOIN ml_clusters_config hc ON ci.ModelID=hc.ID 
      //     WHERE hc.machineCode = ${opts.machineCode} AND hc.pointIndex = ${opts.pointIndex} AND hc.Axis = ${opts.axis} AND 
      //     ci.date_time BETWEEN '${startDate}' AND '${endDate}' ORDER BY ci.Date_Time DESC`
      //   })
      // }
      
      //console.log('Query', [query, query2])
      let output = await new Promise((resolve, reject) => {
        WebService.getCustomData(queries, results => {
          if(results == null || results.length == 0){// || results[0].data == null || results[0].data.length == 0){
            console.log('No results')
            resolve(null)
          }else{
            let trend = results.find(r => r.id == 'trendData')
            let scatterDataSet = null
            let clusters = results.find(r => r.id == 'clusters')
            if(clusters != null && clusters.data != null && clusters.data.length > 0){
              clusters.transform(this.clusterTransforms)
              clusters = this.groupByCluster(clusters.data)
            }

            if(trend == null || trend.data == null || trend.data.length == 0){
              console.log('No data returned')
              resolve(null)
            }else{
              scatterDataSet = trend.clone()
              scatterDataSet.transform(this.scatterTransforms)
              // trend.transform(this.trendTransforms)


              let organizedData = this.organizeData(trend, clusters, scatterDataSet)
              resolve(organizedData)
            }
          }
          
        }, errorData =>{
          console.log('Get Trend Error', errorData, ' -- Query: ', queries)
          if(onDone != null){
            resolve(null)
          }
        })
      })
      if(output == null){
        if(onDone != null){
          onDone(null)
        }
        return
      }
  
      if(output.clusters != null && output.clusters.length > 0 && !output.configsAdded){
        let modelIds = []
        for(var i = 0; i < output.clusters.length; i++){
          modelIds.push(output.clusters[i].modelID)
        }
        let configs = await new Promise((resolve, reject) => {
          let query3 = `SELECT ID, config FROM ml_clusters_config WHERE ID IN (${modelIds.join(',')})`
  
          WebService.getCustomData(query3, results => {
            if(results == null || results.length == 0 || results[0].data == null || results[0].data.length == 0){
              console.log('No data returned')
              resolve([])
            }else{
              let configs = []
              for(var i = 0; i < results[0].data.length; i++){
                let ID = results[0].data[i][0]
                let config = JSON.parse(results[0].data[i][1])
                config.id = ID
                configs.push(config)
              }
              resolve(configs)
            }
          }, errorData =>{
            console.log('Get Trend Error', errorData, ' -- Query: ', query)
            if(onDone != null){
              resolve(null)
            }
          })
        })
        if(configs != null && configs.length > 0){
          for(var i = 0; i < output.clusters.length; i++){
            for(var l = 0; l < configs.length; l++){
              const config = configs[l]
              
              if(output.clusters[i].modelID == config.id){
                output.clusters[i].config = config
  
                // const clustersIndices = output.clusters[i].clustersIndices
                // output.clusters[i].emptySeries = this.getClusterSeries(config, clustersIndices)
                // output.clusters[i].seriesData = this.getClusterSeries(config, clustersIndices, output.scatterDataSet.data)
                break
              }
            }
            this.updateClusterSeries(output.clusters[i], output.scatterDataSet.data, output.scatterDataSet.columns)
          }
        }
        
      }
      //output.trend.transform(transforms)
  
      //console.log('Trend data output', output)
      if(onDone != null){
        onDone(output)
      }
      return output
      
    },
    organizeData(trend, clusters, scatterDataSet, configs = null){
      let configsAdded = false
      if(clusters != null && clusters.length > 0){
        
        if(trend.data.length > 0 && trend.data[0].data != null && trend.data[0].data.length > 0){
          const firstData = trend.data[0].data
          for(var i = 0; i < clusters.length; i++){
            clusters[i].clustersIndices = this.alignClustersWithDataByDate(firstData, clusters[i].clustersIndices)
            
          }
          scatterDataSet.data = this.alignArrays(firstData, 0, scatterDataSet.data, 0)
        }
        if(configs != null){
          for(var i = 0; i < clusters.length; i++){
            for(var l = 0; l < configs.length; l++){
              const config = configs[l]
              
              if(clusters[i].modelID == config.id){
                clusters[i].config = config
                break
              }
            }
          }
          configsAdded = true
        }
      }else{
        clusters = []
      }
      
      
      const columnNames = MachineLearning.getColumnNames(scatterDataSet.columns)
      const featuresOptions = MachineLearning.getFeaturesOptions(scatterDataSet.columns, columnNames)
      let output = {
        trendDataSet: trend,
        scatterDataSet: scatterDataSet,
        clusters: clusters,
        columnNames: columnNames,
        featuresOptions: featuresOptions,
        configsAdded: configsAdded
      }
      return new MachineLearning.database.MLTrendOutput(output) 
      //return output
    },
    updateClustersSeries(clusters, scatterData){

      if(clusters != null && clusters.length > 0){
        for(var i = 0; i < clusters.length; i++){
          this.updateClusterSeries(clusters[i], scatterData)
        }
      }
    },
    updateClusterSeries(cluster, scatterData, columns){
      if(cluster != null && cluster.clustersIndices != null && cluster.clustersIndices.length > 0){
        cluster.emptySeries = []
        cluster.seriesData = []
        cluster.rangeSections = []

        const config = cluster.config
        if(config == null){
          return
        }
        const clustersIndices = cluster.clustersIndices
        cluster.emptySeries = this.getClusterSeries(config, clustersIndices)
        cluster.seriesData = this.getClusterSeries(config, clustersIndices, scatterData)
        cluster.rangeSections = this.getRangeSections(config, cluster.seriesData, columns)
        cluster.hasDataSplitter = clustersIndices.max() > 500
      }
    },
    MLTrendOutput: class{
      constructor(obj){
        for(var key in obj){
          this[key] = obj[key]
        }
        if(this.clusters != null && this.clusters.length > 0){
          for(var i = 0; i < this.clusters.length; i++){
            this.clusters[i] = new MachineLearning.database.Cluster(this.clusters[i])
          }
        }
      }
      // getSplitterSeries(clusterIndex){
      //   const cluster = this.clusters[clusterIndex]
      //   const series = cluster.seriesData
      //   if(!cluster.hasDataSplitter){
      //     return series
      //   }
      //   let seriesData = []
      //   //Identify how many sections there are and create new series apending the data on each serie.data that has the same serie.section
      // }
      
      
    },
    Cluster: class{
      constructor(obj){
        for(var key in obj){
          this[key] = obj[key]
        }
      }
      toggleSplitterView(splitterViewMode){
        if(this.hasDataSplitter != true){
          return
        }
        if(this.splitterViewMode == null){
          this.splitterViewMode = false
        }
        if(this.splitterViewMode == splitterViewMode){
          return
        }else{
          splitterViewMode = !this.splitterViewMode
        }
        
        if(!this.splitterViewMode){
          //save a copy of the original data
          this.originalSeriesData = this.seriesData
          this.originalEmptySeries = this.emptySeries
          this.originalClustersIndices = this.clustersIndices
          this.originalRangeSections = this.rangeSections

          this.seriesData = this.getSplitterSeries(this.seriesData)
          this.emptySeries = this.getSplitterSeries(this.emptySeries)
          this.clustersIndices = this.getSectionClusterIndices()
          this.rangeSections = []
        }else{
          //restore the original data
          this.seriesData = this.originalSeriesData
          this.emptySeries = this.originalEmptySeries
          this.clustersIndices = this.originalClustersIndices
          this.rangeSections = this.originalRangeSections
        }
        this.splitterViewMode = splitterViewMode

        //checking data lengths
        let clusterLength = this.clustersIndices.length
        let seriesLength = 0
        for(var i = 0; i < this.seriesData.length; i++){
          if(this.seriesData[i].data != null){
            seriesLength += this.seriesData[i].data.length
          }
        }

      }
      getSplitterSeries(series) {
        const cluster = this
        //const series = cluster.seriesData
        if(series == null){
          series = cluster.seriesData
        }
      
        if (!cluster.hasDataSplitter) {
          return series
        }
      
        let sectionsMap = new Map()
        let output = []
        for (let i = 0; i < series.length; i++) {
          const s = series[i]
          const section = s.section
          let clusterIndex = s.clusterIndex
          if(clusterIndex < 500){
            //sectionsMap.set(clusterIndex, s)
            output.push(s)
          }else{
            if (!sectionsMap.has(section)) {
              let color = MachineLearning.palettes.getColor(section)
              sectionsMap.set(section, {
                name: `S${section}`,
                section: section,
                data: [],
                clusterIndex: section,
                color: color // optional: use the color from first series in that section
              })
            }

            // Append current data to the correct section
            const target = sectionsMap.get(section)
            if (Array.isArray(s.data)) {
              target.data.push(...s.data)
            }
          }
      
          
      
          
        }
      
        // Convert the map to an array of series
        const sectionedSeries = Array.from(sectionsMap.values())
        for(var i = 0; i < sectionedSeries.length; i++){
          output.push(sectionedSeries[i])
        }
        return output
      }
      // getSectionClusterIndices(){
      //   const clusterIndices = this.clustersIndices
      //   let output = []
      //   for(var i = 0; i < clusterIndices.length; i++){
      //     let ind = clusterIndices[i]
      //     while (ind > 500) {
      //       ind -= 1000
      //     }
      //     output.push(ind)
      //   }
      //   return output
      // }
      getSectionClusterIndices(){
        const clusterIndices = this.clustersIndices
        let output = []
        for(var i = 0; i < clusterIndices.length; i++){
          let ind = clusterIndices[i]
          
          if(ind > 500){
            let thousandsCount = 0
            while (ind > 500) {
              ind -= 1000
              thousandsCount += 1
            }
            output.push(thousandsCount)
          }else{
            output.push(ind)
          }  
        }
        return output
      }
      setClusterIndices(newClusterIndices, data, columns, temporary = true){
        if(temporary && this.oldClustersIndices == null){
          this.oldClustersIndices = this.clustersIndices
        }
        this.clustersIndices = newClusterIndices
        MachineLearning.database.updateClusterSeries(this, data, columns)
        this.canUndo = true
      }
      undoTemporaryClustersIndices(data, columns){
        if(this.oldClustersIndices != null){
          this.clustersIndices = this.oldClustersIndices
          this.oldClustersIndices = null

          MachineLearning.database.updateClusterSeries(this, data, columns) 
        }
        this.canUndo = false
      }
    },
    getClusterSeries(options, clusterIndices, data) {
      let name = options.name != null ? options.name : options.algo
      let algo = options.algo
      if (name == null) {
        name = 'No name'
      }
    
      
      let uniqueClusterIndices = []
      for (let i = 0; i < clusterIndices.length; i++) {
        if (!uniqueClusterIndices.includes(clusterIndices[i])) {
          uniqueClusterIndices.push(clusterIndices[i])
        }
      }
    
      let clustersSeries = MachineLearning.preClusterizeOptions.getSeries(options.preClusterizeOptions)
      let series = []
      
      for (let i = 0; i < uniqueClusterIndices.length; i++) {
        const clusterIndex = uniqueClusterIndices[i]
        let color = MachineLearning.palettes.getColor(clusterIndex)
        let serie = clustersSeries.find(s => s.clusterIndex === clusterIndex)
    
        const split = this.splitClusterIndex(clusterIndex)
    
        if (!serie) {
          // Create a new series if it doesn't exist
          serie = {
            name: this.getSerieName(split),
            data: [],
            section: split.section,
            clusterIndex: clusterIndex,
            color: color
          }
        } else {
          // Ensure name, color, etc., are set
          if (serie.name == null) {
            serie.name = this.getSerieName(split)
          }
          if (serie.color == null) {
            serie.color = color
          }
          if (data != null && !Array.isArray(serie.data)) {
            serie.data = []
          }
          serie.section = split.section
        }
    
        series.push(serie)
      }
    
      // Add data to the correct series
      if(data != null){
        for (let i = 0; i < clusterIndices.length; i++) {
          const clusterIndex = clusterIndices[i]
          const value = data[i]
          const serie = series.find(s => s.clusterIndex === clusterIndex)
          if (serie) {
            serie.data.push(value)
          }
        }
      }
      
    
      series = MachineLearning.sortClusterNegativeValuesOnly(series)
      return series
    },
    getRangeSections(config, seriesData, columns){
      const sections = []
      if (seriesData == null || columns == null || config.dataSplitter == null) {
        return sections
      }
      const units = []
      for (let c = 0; c < config.dataSplitter.features.length; c++) {
        let column = columns.indexOf(config.dataSplitter.features[c])
        if (column >= 0) {
          units.push({ unit: columns[column], index: column })
        }
      }
      const sectionsMap = new Map();

      seriesData.forEach(item => {
        if (item.section > 0) {
          if (!sectionsMap.has(item.section)) {
            sectionsMap.set(item.section, [])
          }

          const sectionData = sectionsMap.get(item.section);
          units.forEach(({ unit, index }) => {
            let objUnit = sectionData.find(u => u.unit === unit);
            if (!objUnit) {
              objUnit = {
                unit,
                name: Enums.Units.getFullUnit(unit).parameter,
                values: []
              };
              sectionData.push(objUnit);
            }
            item.data.forEach(row => {
              const value = row[index];
              if (value != null) {
                objUnit.values.push(value);
              }
            })
          })
        }
      })
      return Array.from(sectionsMap.entries()).map(([sectionId, dataUnits]) => {
        const range = dataUnits
          .filter(d => d.values.length > 0)
          .map(d => ({
            unit: d.unit,
            name: d.name,
            min: Math.min(...d.values),
            max: Math.max(...d.values)
          }));

        return { section: sectionId, range };
      })
    },
    
    getSerieName(obj) {
      let {section, cluster} = obj
      if (section === 0) {
        return 'M' + cluster
      } else {
        return `S${section}-M${cluster}`
      }
    },
    splitClusterIndex(clusterIndex){
      const sectionSize = 1000
      const section = Math.round(clusterIndex / sectionSize)
      let cluster = 0
      if (section === 0) {
        cluster = clusterIndex
      } else {
        cluster = clusterIndex - section * sectionSize
      }
      return {section, cluster}
      
    },
    
  },

  prepareIndicesForDatabase(results, clustering, models) {
    let modelData = []
    let indices = []
    let copyData = results.data.deepClone() // deep copy of data
    let modelName = clustering.algo
    if (clustering.dataSplitter != null) {
      if (models[clustering.dataSplitter.algo] != null && models[clustering.dataSplitter.algo][0] != null) {
        modelData.push({
          clusterIndex: 0,
          model: models[clustering.dataSplitter.algo][0]
        })
      }
      for(var c = 0; c < results.sections.length; c++) {
        let clusterIndex = results.sections[c].clusterIndex
        if (models[modelName] != null && models[modelName][clusterIndex] != null) {
          modelData.push({
            clusterIndex: clusterIndex,
            model: models[modelName][clusterIndex]
          })
        }
      }
    } else {
      if (models[modelName] != null && models[modelName][0] != null) {
        modelData.push({
          clusterIndex: 0,
          model: models[modelName][0]
        })
      }
    }
    // console.log('Model Data !!!', modelData)
    const measureIDIndex = results.trend.columns.indexOf('measureid')
    const clusterMap = new Map(copyData.map(c => [c.clusterIndex, c]))
    const measureIDMap = new Map(results.trend.data.map(c => [c[0], c[measureIDIndex]]))

    for (const index of results.clustersIndices) {
      const cluster = clusterMap.get(index)
      if (cluster != null) {
        const data = cluster.data.shift()
        if (data != null) {
          const dateTime = typeof data[0] === 'string' ? data[0] : new Date(data[0]).toString('YYYY-MM-DD HH:mm:ss')
          const measureId = measureIDMap.get(dateTime)
          // console.log('DateTime !!!', dateTime, 'Cluster Index', index)
          if (dateTime != null && measureId != null) {
            indices.push({
                dateTime,
                cluster: index,
                measureId
            })
          }
        }
      }
    }

    return {indices, modelData}
  }
  
}

export class DataProcessor{ //Procesador de datos, descarga los archivos y calcula los valores basado en la lista de datos originales
  constructor(options, processUpdatesCallBack = null){
    let opts = Object.assign({
      machineCode: null,
      pointIndex: 1,
      axis: 1,
    }, options)

    this.RPMGetter = {
      maxFilesAtATime: 20,
      timer: null,
      timerInterval: 50,
      processedFilesCount: 0,
      isRunning: false,
      processingRecording: false,
      i: -1,
      maxLength: -1,
      processedFileIds: [],
      fileIDRow: -1, 
    }
    this.queryConfig = {
      trendUnits: [
        Enums.Units.g,
        Enums.Units.mm_s,
        //Enums.Units.gE,
        //Enums.Units.cfAcceleration
      ],
    }

    let trendUnits = opts.trendUnits
    if(trendUnits == null || trendUnits.length == 0){
      trendUnits = this.getDefaultUnitsToProcess()
    }

    this.calculations = {
      trendUnits: trendUnits
    }
    this.processUpdatesCallBack = processUpdatesCallBack

    this.updates = []

    this.trend = null
    this.estimatedFileCount = 0


    let {machineCode, pointIndex, axis} = opts
    this._machine = null
    this.machineCode = machineCode
    this._point = null
    this.pointIndex = pointIndex
    this.axis = axis


  }
  get isRunning(){
    return this.RPMGetter.isRunning
  }
  set isRunning(value){
    this.RPMGetter.isRunning = value
    let description = value ? 'Started' : 'Stopped'
    this.updateProcessCallBack(description)
  }
  get machine(){
    return this._machine
  }
  set machine(value){
    this._machine = value
    this.updateProcessCallBack('Got machine')
  }
  get point(){
    return this._point
  }
  set point(value){
    this._point = value
    this.updateProcessCallBack('Got point')
  }
  updateProcessCallBack(processDescription){
    console.log('Process Description', processDescription)
    if(processDescription != null){
      this.updates.push(processDescription)
    }
    if(this.processUpdatesCallBack != null){
      const progress = this.estimatedFileCount > 0 ? (this.RPMGetter.processedFilesCount / this.estimatedFileCount) * 100 : 0
      let args = {
        isRunning: this.RPMGetter.isRunning,
        machine: this.machine,
        point: this.point,
        updates: this.updates,
        estimatedFileCount: this.estimatedFileCount,
        processedFilesCount: this.RPMGetter.processedFilesCount,
        progress: progress
      }
      console.log('Progress', Math.round(progress))
      this.processUpdatesCallBack(args)
    }
    
  }
  getDefaultUnitsToProcess(){
    let trendUnits = []
    
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.g, Enums.UnitsModifiers.offset))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.gE))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.g, Enums.UnitsModifiers.lowFrequency))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.g, Enums.UnitsModifiers.mediumFrequency))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.g, Enums.UnitsModifiers.highFrequency))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.g, Enums.UnitsModifiers.eRPM))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.g, Enums.UnitsModifiers.kurtosis))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.g, Enums.UnitsModifiers.skewness))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.mm_s, Enums.UnitsModifiers.hilbertEnvelope))
    
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.sensorSaturation))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.sensorCalibration))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.linesOfResolution))
    trendUnits.push(new Erbessd.machinery.TrendUnit(Enums.Units.sampleRate))
    return trendUnits
  }
  getMachine(onDone){
    if(this.machine != null){
      if(onDone != null){
        onDone(this.machine)
      }
      return
    }
    WebService.getMachine(this.machineCode, machine => {
      this.machine = machine
      //this.pointIndex = this.machine.Points[0].Index
      this.point = this.getPoint()
      if(onDone != null){
        onDone(machine)
      }
      //console.log('Machine', machine, this.point)
    }, errorData =>{
      console.log('Error', errorData)
      if(onDone != null){
        onDone(null)
      }
    })
  }
  getPoint(pointIndex){
    if(pointIndex == null){
      pointIndex = this.pointIndex
    }
    for(var i = 0; i < this.machine.Points.length; i++){
      if(this.machine.Points[i].Index == pointIndex){
        return this.machine.Points[i]
      }
    }
    return null
  }
  async getTrend(startDate, endDate, onDone){
    //this.resetCharts()
    this.estimatedFileCount = 0
    this.RPMGetter.processedFilesCount = 0

    // let machine = await new Promise((resolve, reject) => {
    //   this.getMachine(machine => {
    //     resolve(machine)
    //   })
    // })
    // if(machine == null){
    //   if(onDone != null){
    //     onDone(null)
    //   }
    //   return
    // }

    this.clearData()

    // let query = 'SELECT date_time AS Date, units AS U, realValue AS V, fileID AS fileID FROM M__' + this.machineCode + ' WHERE pointindex = ' + this.pointIndex + 
    // ' AND axis = ' + this.axis + 
    // (this.queryConfig.trendUnits != null && this.queryConfig.trendUnits.length > 0 ? (' AND units IN (' + this.queryConfig.trendUnits.join(',') + ')') : '') +
    // ' AND FileID > -1' +
    // " AND date_time BETWEEN '" + startDate.toString(MySQLDateFormat) + "' AND '" + endDate.toString(MySQLDateFormat) + "'"

    //console.log('Query', query)
    // ml.PointIndex, ml.Axis
    let query = `SELECT m.date_time AS Date, mv.unit AS U, mv.value AS V FROM measuresvalues mv INNER JOIN measures m ON mv.measureid=m.id 
    WHERE m.machinecode=${this.machineCode} AND m.pointindex=${this.pointIndex} 
    AND m.channel=${this.axis} AND m.date_time BETWEEN '${startDate.toString(MySQLDateFormat)}' AND '${endDate.toString(MySQLDateFormat)}';`
    // console.log('Query', query)
    WebService.getCustomData(query, results => {
      if(results == null || results.length == 0 || results[0].data == null || results[0].data.length == 0){
        console.log('No results')
        this.trend = []
        if(onDone != null){
          onDone(this.trend)
        }
        return
      }
      let data = results[0]
      this.trend = data
      // this.trend.transform(MachineLearning.trendTransforms)

      //this.update3DData()
      // this.RPMGetter.fileIDRow = data.columns.indexOf('fileID')
      // this.RPMGetter.maxLength = data.data.length
      //console.log('Trend', data, this.RPMGetter.fileIDRow)
      // this.setRPMGetterParameters()
      // this.calculateEtimatedFileCount()
      if(onDone != null){
        onDone(this.trend)
      }
    }, errorData =>{
      console.log('Get Trend Error', errorData, ' -- Query: ', query)
      if(onDone != null){
        onDone(null)
      }
    })
  }
  calculateEtimatedFileCount(){
    let fileIDs = []
    for(var i = 0; i < this.trend.data.length; i++){
      let fileID = this.trend.data[i][this.RPMGetter.fileIDRow]
      if(!fileIDs.includes(fileID)){
        fileIDs.push(fileID)
      }
    }
    this.estimatedFileCount = fileIDs.length
    //console.log('Estimated File Count', this.estimatedFileCount)
  }
  setRPMGetterParameters(){
    this.RPMGetter.fileIDRow = this.trend.columns.indexOf('fileID')
    this.RPMGetter.maxLength = this.trend.data.length
  }
  
  
  async startRPMGetter(finishedCallBack){
    this.finishedCallBack = finishedCallBack
    if (!this.trend || !this.trend.data || this.trend.data.length === 0) {
      this.stopRPMGetter()
      return
    }
    this.isRunning = true
  
    // Make the setInterval callback an async function
    this.RPMGetter.timer = setInterval(async () => {
      // Prevent overlapping calls
      if (this.RPMGetter.processingRecording) return
  
      let batch = this.getBatchOfFileIDs()
      if (batch.fileIDs.length === 0) {
        //console.log('Batch Empty', batch)
        this.stopRPMGetter()
        return
      }
      
      this.RPMGetter.processingRecording = true
      
  
      // Prepare params
      const cFilesParams = {
        machineCode: this.machineCode,
        fileIDs: batch.fileIDs
      }
  
      try {
        // 1) Await the Promise-based getFiles
        const data = await this.getFiles(cFilesParams)
  
        // 2) If we have data, loop through
        if (data && data.data && data.data.length > 0) {
          for (let i = 0; i < data.data.length; i++) {
            const file = data.data[i]
            const fileID = data.fileIDs[i]
  
            // find the matching index
            let index = -1
            for (let j = 0; j < batch.indices.length; j++) {
              if (batch.fileIDs[j] === fileID) {
                index = batch.indices[j]
                break
              }
            }
  
            // 3) Await processing for each file if needed
            if (file && file.data) {
              await this.processFileAsync({ file, fileID, index })
            }
            this.RPMGetter.processedFilesCount++
          }
        }
  
        this.updateProcessCallBack(
          `Process ${this.RPMGetter.processedFilesCount} - files count: ${batch.fileIDs.length}`
        )
        
        this.RPMGetter.processingRecording = false
  
      } catch (errorData) {
        // Handle error from getFiles
        console.log('Get Files - Error', errorData)
        
        this.RPMGetter.processingRecording = false
      }
  
    }, this.RPMGetter.timerInterval)
  }
  
  stopRPMGetter(){
    clearInterval(this.RPMGetter.timer)
    this.RPMGetter.processingRecording = false
    this.isRunning = false
    if(this.finishedCallBack != null){
      this.finishedCallBack()
    }
  }
  async getFiles(params) {
    return new Promise((resolve, reject) => {
      WebService.getMultipleFiles(params, (data) => {
          resolve(data)
        },
        (errorData) => {
          console.log('Error', errorData)
          reject(errorData)
          //resolve(null)
        }
      )
    })
  }
  clearData(){
    this.RPMGetter.processedFileIds = []
    this.RPMGetter.i = -1
    this.RPMGetter.maxLength = -1
  }
  getBatchOfFileIDs(){
    let max = this.RPMGetter.maxFilesAtATime
    let fileIDs = []
    let indices = []
    
    for(var i = 0; i < max; i++){
      let next = this.getNextFileID()
      if(next == null || next.fileID == -1){
        return {fileIDs, indices}
      }
      if(next.index > -1){
        fileIDs.push(next.fileID)
        indices.push(next.index)
      }
    }
    //console.log('Batch', fileIDs, indices)
    return {fileIDs, indices}
  }
  getNextFileID(){
    this.RPMGetter.i++

    if(this.RPMGetter.i >= this.RPMGetter.maxLength){
      //this.stopRPMGetter()
      return null//{fileID: -1, index: -1}
    }

    let fileID = this.trend.data[this.RPMGetter.i][this.RPMGetter.fileIDRow]
    while(this.RPMGetter.processedFileIds.includes(fileID) && this.RPMGetter.i < this.RPMGetter.maxLength){
      this.RPMGetter.i++
      
      if(this.RPMGetter.i >= this.RPMGetter.maxLength){
        //this.stopRPMGetter()
        return null
      }else{
        fileID = this.trend.data[this.RPMGetter.i][this.RPMGetter.fileIDRow]
      }
    }
    //let fileID = this.trend.data[this.RPMGetter.i].fileID
    
    this.RPMGetter.processedFileIds.push(fileID)
    return {fileID, index: this.RPMGetter.i}
  }
  async processFileAsync(data){
    const {file, fileID, index} = data

    const {sampleRate, calibration, sensitivity, sensorType} = file
    let options = {
      sampleRate: sampleRate,
      calibration: calibration,
      sensorSensitivity: sensitivity,
      sensorType: sensorType,

      data: file.data[0],
    }
    let results = await EdgeProcessing.processSignal(options, this.point, this.calculations.trendUnits, {})
    //console.log('Edge Processing Results', results.mergedValues, results)
    for(var key in results.mergedValues){
      let unit = Number(key)
      let value = results.mergedValues[key].v
      
      let date = this.trend.data[index][0]
      this.trend.data.push([date, unit, value, fileID])
    }
  }

  destroy(){
    this.stopRPMGetter()
    this.trend = null
  }
}

export class DataHandler { //Maneja los datos, los transforma y procesa los clusters
  constructor(dataSet, dataTransforms, clusterParams = null){
    if(clusterParams == null){
      clusterParams = {}
    }
    this.dataSet = dataSet
    this.dataTransforms = dataTransforms
    this.columns = null
    this.columnNames = null
    // Add a dictionary to store models by algorithm
    this.models = {}
    this.clusterParams = clusterParams
    this.lastRange = {}
    this.lastFeatures = {}
    this.processData()
  }

  processData(dataSet, dataTransforms){
    if(dataSet == null){
      dataSet = this.dataSet
    }
    if(dataTransforms == null){
      dataTransforms = this.dataTransforms
    }

    let dataSetProcessed = this.transformData(dataSet, dataTransforms)
    this.data = dataSetProcessed.data
    this.columns = dataSetProcessed.columns

    const columns = this.columns

    // let columnNames = []
    // for(var i = 0; i < columns.length; i++){
    //   if(typeof columns[i] == 'string'){
    //     columnNames.push(columns[i])
    //   }else{
    //     let name = Enums.Units.getFullUnit(columns[i]).parameter
    //     columnNames.push(name)
    //   }
    // }
    // this.columnNames = columnNames
    this.columnNames = MachineLearning.getColumnNames(columns)
  }

  transformData(data, transforms){
    if(data == null || data.data == null || data.data.length == 0){
      return
    }
    let dataSet = data.deepClone()
    if(transforms != null){
      for(var i = 0; i < transforms.length; i++){
        let transform = transforms[i]
        let type = transform.type
        if(transform != null){
          Erbessd.sql.transform[type](dataSet, transform)
        }
      }
    }
    return dataSet
  }

  getIndicesFromRange(range, dataLength){
    return MachineLearning.getIndicesFromRange(range, dataLength)
  }
  getMultidimensionalData(features, range, data = null){
    if(data == null){
      data = this.data
    }
    
    const columns = this.columns
    //console.log('getMultidimensionalData', {columns: columns, main: this})
    let featureIndices = []
    let outputColumns = []
    for(var i = 0; i < features.length; i++){
      let index = columns.indexOf(features[i])
      if(index > -1){
        outputColumns.push(columns[index])
        featureIndices.push(index)
      }
    }

    let normRange = this.getIndicesFromRange(range, data.length)
    let {startIndex, endIndex} = normRange
    let output = []
    for(var i = startIndex; i <= endIndex; i++){
      let row = []
      for(var f = 0; f < featureIndices.length; f++){
        const featureIndex = featureIndices[f]
        const value = data[i][featureIndex]
        row.push(value)
      }
      output.push(row)
    }
    return {data: output, columns: outputColumns, range: normRange}
  }

  getFeaturesOptions(){
    let options = []
    for(var i = 0; i < this.columns.length; i++){
      let value = this.columns[i]
      let label = this.columnNames[i]
      
      options.push({label, value})
    }
    return options
  }

  saveModel(model, algo, clusterIndex){
    if(this.models[algo] == null){
      this.models[algo] = {}
    }
    this.models[algo][clusterIndex] = model
  }
  async getModel(algo, clusterIndex, savedModels, opts = null, onDone = null){
    
    if(savedModels == null){
      savedModels = this.models
    }

    let output = null
    if(savedModels[algo] == null || savedModels[algo][clusterIndex] == null){
      output = null
    }else{
      output = savedModels[algo][clusterIndex]
    }

    let machineCode = 0 //Necesitamos agregaar los datos necesarios para obtener el modelo
    if (output == null && opts != null) {
      output = await new Promise((resolve, reject) => {
        MachineLearning.loadModelFromDatabase(opts, algo, clusterIndex, model => {
          resolve(model)
        }, errorData =>{
          console.log('Error', errorData)
          reject(null)
        })
      })
    }
    if(onDone != null){
      onDone(output)
    }
    
    return output
  }
  
  preparePreClusterizeOptions(features, params, previousClusterSeries) {
    let unitsToProcess = [...features]
    const clustersSeries = [{serie: {clusterIndex: -1, name: 'Outliers', color: '#5470C6'}}]
    // ... pre-cluster logic remains the same (if any)

    if(params != null && params.preClusterizeOptions != null){
      const preClusterizeOptionsArray = Array.isArray(params.preClusterizeOptions) ? params.preClusterizeOptions : [params.preClusterizeOptions]
      for(var i = 0; i < preClusterizeOptionsArray.length; i++){
        let preClusterizeOption = preClusterizeOptionsArray[i]
        // // check if clusterIndex exists
        // if(preClusterizeOption.serie == null){
        //   preClusterizeOption.serie = MachineLearning.preClusterizeOptions.getSerie(preClusterizeOption)
        // }
        // if(preClusterizeOption.clusterIndex == null){
        //   preClusterizeOption.clusterIndex = MachineLearning.preClusterizeOptions.getClusterIndex(preClusterizeOption, i)
        //   //preClusterizeOption.clusterIndex = (i + 2) * -1
        // }
        MachineLearning.preClusterizeOptions.check(preClusterizeOption, i)

        
        MachineLearning.preClusterizeOptions.addRequiredUnits(preClusterizeOption, unitsToProcess)

        let serie = preClusterizeOption.serie.deepClone()
        serie.clusterIndex = preClusterizeOption.clusterIndex

        clustersSeries.push({serie: serie})
        //clustersSeries.push({index: preClusterizeOptions.clusterIndex, name: preClusterizeOption.clusterName, color: preClusterizeOption.color})
      }
    }

    let originalRange = null
    if(params != null && params.range != null){
      originalRange = params.range
    }

    if(previousClusterSeries != null){
      console.log('Previous cluster series:', previousClusterSeries)
      for(var i = 0; i < previousClusterSeries.length; i++){
        let found = false
        for(var l = 0; l < clustersSeries.length; l++){
          if(clustersSeries[l].serie.clusterIndex == previousClusterSeries[i].clusterIndex){
            found = true
            break
          }
        }
        if(!found){
          clustersSeries.push({serie: previousClusterSeries[i]})
        }
      }
    }
    return {unitsToProcess, clustersSeries, originalRange}

  }
  clusterNext(algo, onDone, count = 1){
    console.log('clusterNext')
    if(count == null){
      count = 1
    }
    const features = this.lastFeatures[algo]
    if(features == null){
      console.log('Error in clusterNext: lastFeatures is null')
      return
    }
    let lastRange = this.lastRange[algo]
    let range = {start: lastRange.endIndex + 1, end: lastRange.endIndex + count}
    this.cluster(algo, features, {range: range}, onDone, null, true)
  }
  async cluster(options, onDone, previousClusterSeries = null, reusePreviousModel = false){
    //console.log('Cluster', options)
    const dataSplitter = options.dataSplitter

    if(dataSplitter != null){
      if(dataSplitter.columns == null){
        dataSplitter.columns = options.columns
      }
      const startTime = Date.now()

      this.clusterProcess(dataSplitter, async result => {
        //console.log('Data splitter result', result)
        if(result == null){
          onDone(null, 'Data splitter had an error')
          console.log('Error in data splitter')
          return
        }
        let output = {
          modelName: result.modelName,
          algo: options.algo,
          data: [],
          clustersTimestamps: [result.miliseconds],
        }

        let newClusterIndices = result.clustersIndices
        let sections = []
        
        for(var c = 0; c < result.data.length; c++){
          const cluster = result.data[c]
          const clusterIndex = cluster.clusterIndex

          let section = {
            parentClusterIndex: clusterIndex,
            features: options.features,
            name: 'S' + cluster.clusterIndex,
          }
          
          if(clusterIndex > 0){
            const splittedData = cluster.data
            
            let subResult = await new Promise((resolve, reject) => {
              this.clusterProcess(options, res =>{
                resolve(res)
              }, previousClusterSeries, reusePreviousModel, splittedData, clusterIndex)
            })
            //console.log('Cluster Process Result', subResult)
            if(subResult != null){
              output.clustersTimestamps.push(subResult.miliseconds)
              for(var i = 0; i < subResult.clustersIndices.length; i++){
                subResult.clustersIndices[i] += (clusterIndex * 1000)
              }
              for(var i = 0; i < subResult.data.length; i++){
                //subResult.data[i].name = 'M' + clusterIndex + '-' + (subResult.data[i].clusterIndex + 1)
                subResult.data[i].name = section.name + '-' + subResult.data[i].name
                subResult.data[i].parentClusterIndex = clusterIndex

                subResult.data[i].clusterIndex += (clusterIndex * 1000)
                subResult.data[i].color = MachineLearning.palettes.getColor(subResult.data[i].clusterIndex)

                output.data.push(subResult.data[i])
                const originalCI = clusterIndex
                let m = 0
                for(var l = 0; l < newClusterIndices.length; l++){
                  if(m > subResult.clustersIndices.length - 1){
                    break
                  }
                  if(newClusterIndices[l] == originalCI){
                    newClusterIndices[l] = subResult.clustersIndices[m]
                    m++
                  }
                }
              }

            }else{
              // console.log('Error in clusterProcess')
              cluster.name = section.name + '-' + cluster.name
              output.data.push(cluster)
            }
            
          }else{
            
            output.data.push(cluster)
          }

          sections.push(section)
        }

        output.clustersIndices = newClusterIndices
        output.clusters = output.data.length
        const elapsedTime = Date.now() - startTime
        output.miliseconds = elapsedTime
        output.sections = sections

        onDone(output)
      }, previousClusterSeries, reusePreviousModel)
    }else{ 
      this.clusterProcess(options, onDone, previousClusterSeries, reusePreviousModel)
    }
  }

  

  async clusterProcess(options, onDone, previousClusterSeries = null, reusePreviousModel = false, splittedData = null, clusterIndex = 0){
    const algo = options.algo
    const features = options.features.deepClone()
    const dataToCluster = splittedData != null ? splittedData : this.data


    this.lastFeatures[algo] = features
   
    //params = Object.assign(this.clusterParams, params)
    let params = null
    if(options != null){
      params = options.deepClone()
    }else{
      params = {}
    }
    if(this.clusterParams != null){
      params = Object.assign(params, this.clusterParams)
    }

    //console.log('cluster params', params)
    let {unitsToProcess, clustersSeries, originalRange} = this.preparePreClusterizeOptions(features, params, previousClusterSeries)
    if(options.workflow != null && options.workflow.enabled != false){
      unitsToProcess.insert(0, 'Date')
    }
    //console.log('Units to process', unitsToProcess)

    let {data, columns, range} = this.getMultidimensionalData(unitsToProcess, originalRange, dataToCluster)
    this.lastRange[algo] = range

    //console.log('cluser', data, columns, range)

    let modelName = MachineLearning.getModelName(algo)
    // Use the existing model if we have one stored
    let existingModel = null

    if(reusePreviousModel){
      // existingModel = await this.getModel(algo, 0, this.models)
      const self = this
      existingModel = async function(onDone){
        return await self.getModel(algo, clusterIndex, self.models, {id: options.id}, onDone)
      }
    }else{
      //this.models[algo] = null
    }

    let workflow = options.workflow
    //console.log('Workflow', workflow, 'data', {data: this.data, columns: columns, main: this})
    
    // Perform clustering using MachineLearning utility
    MachineLearning.clusterize(data, columns, features, algo, params, workflow, existingModel, result => {

      let clusteredData = result.getClusteredData(dataToCluster, range)
      if(clusteredData == null){
        return
      }

      // Sorting and series assignment logic remains as is
      clusteredData = this.sortNegativeValuesOnly(clusteredData)

      let series = []
      let count = 0
      for(var i = 0; i < clusteredData.length; i++){
        const clusterIndex = clusteredData[i].clusterIndex
        let serie = {}
        for(var l = 0; l < clustersSeries.length; l++){
          if(clustersSeries[l].serie.clusterIndex == clusterIndex){
            serie = clustersSeries[l].serie
            break
          }
        }
        if(serie.name == null){
          serie.name = 'M' + clusterIndex//(count + 1)
          count++
        }
        if(serie.color == null){
          serie.color = MachineLearning.palettes.getColor(clusterIndex)
        }

        serie.clusterIndex = clusterIndex
        serie.clusterInfo = {
          firstAppearanceIndex: clusteredData[i].firstAppearanceIndex,
          lastAppearanceIndex: clusteredData[i].lastAppearanceIndex,
          count: clusteredData[i].data.length
        }
        serie.data = clusteredData[i].data
        series.push(serie)
      }

      // Store the returned model if any
      if (result.returnedModel) {
        console.log('Storing model for - ', algo, ' - ms: ', result.clustering.miliseconds)
        //this.models[algo] = result.returnedModel
        this.saveModel(result.returnedModel, algo, clusterIndex)
      }

      let output = {
        modelName: modelName,
        algo: algo,
        data: series,
        miliseconds: result.clustering.miliseconds,
        clusters: clusteredData.length,
        clustersIndices: result.clustering.clusters
      }

      //console.log('Datahandler', this)
      result.getEvents(this.data, this.columns)
      if(onDone != null){
        onDone(output)
      }

    }, error => {
      if (onDone != null) {
        onDone(null)
      }
    })

    return {
      algo: algo,
      modelName: modelName,
      data: null,
      miliseconds: 0,
      clusters: 0,
      clustersIndices: []
    }
  }
  sortNegativeValuesOnly(clusteredData){
    return MachineLearning.sortClusterNegativeValuesOnly(clusteredData)
  }
  destroy(){
    this.dataSet = null
    this.data = null
    this.columns = null
    this.clusterParams = null
    this.models = {}
    this.lastRange = {}
    this.lastFeatures = {}
  }


  

  
}

export class MachineLearningProcessor{
  constructor(options){
    let opts = Object.assign({
      machineCode: null,
      pointIndex: 1,
      axis: 1,

      startDate: null,
      endDate: null,
      clustering: {},
      dataTransforms: [
        {
          type: 'group',
          groupIndex: 1,
          referenceIndex: 0,
          ensureAlignedReferences: true, // New parameter
        },
        {
          type: 'convert',
          columnIndex: 0,
          convert: {
            type: 'formatter',
            dataType: 'date'
          }
        },
        {
          type: 'sort',
          columnIndex: 0,
          order: 'asc'
        },
        // {
        //   type: 'correctSensorSaturation',
        //   threshold: 0.2
        // }
      ],
    }, options)

    this.dataProcessor = null//= new DataProcessor(opts, this.processUpdates)

    this.options = opts
    
    this.trend = null

    this.clustering = MachineLearning.getDefaultClusteringOptions()
    this.clustering.deepAssign(opts.clustering)
    
    console.log('Clustering', this.clustering)
  }
  processUpdates(RPMGetter){
    //console.log('Process Updates', RPMGetter)
  }
  async start(){
    await this.process()
  }
  async process(){
    console.log('Starting Process')

    //Getting initial trend
    await this.getTrend()
    console.log('got Trend', this.trend)

    // Processing files
    if(this.dataProcessor == null){
      this.dataProcessor = new DataProcessor(this.options, this.processUpdates)
      return
    }
    // await new Promise((resolve, reject) => {
    //   this.dataProcessor.startRPMGetter(() => {
    //     resolve()
    //   })
    // })
    console.log('Finished Processing files', this.trend)


    //Clustering

    let result = await new Promise((resolve, reject) => {
      this.clusterDataProcess(result => {
        if (result == null) {
          console.log('Clustering result is null')
        }
        resolve(result)
      })
    })
    // let result = await this.clusterDataProcess(result => {
    //   console.log('Finished Clustering', result)
    // })

    console.log('Finished Clustering', result)
    

  }
  resetData(){
    this.trend = null
    // this.clustering.indices = []
    // this.clustering.seriesData = []
  }
  async getTrend(){
      
    this.resetData()
    this.dataProcessor = new DataProcessor(this.options, this.processUpdates)
    
    let {startDate, endDate} = this.options
    if(startDate == null || endDate == null){
      console.log('Error in getTrend: startDate or endDate is null')
      return
    }
    //Create first Trend
    await new Promise((resolve, reject) => {
      this.dataProcessor.getTrend(startDate, endDate, trend => {
        this.trend = trend
        resolve()
      })
    })
    return this.trend
  }
  async clusterDataProcess(onDone){
    // let features = this.clustering.params.features.deepClone()
    // if(features.length < 1){
    //   return
    // }

    const dataSet = this.trend

    this.dataHandler = new DataHandler(dataSet, this.options.dataTransforms, null)

    

    this.chartData = []
    //this.newData = []

    let timerUpdated = false

    let algorithms = this.clustering.algorithms
    
    for(var i = 0; i < this.clustering.params.length; i++){
      let cluster = this.clustering.params[i]
      let index = i
      let algo = cluster.algo
      let features = cluster.features.deepClone()
      if(features.length < 1){
        return
      }
      let result = await new Promise((resolve, reject) => {
        this.dataHandler.cluster(cluster, result => {
          if (result == null) {
            // return reject('Clustering result is null')
          }
          resolve(result)
        });
      });
      console.log('Result', result, index)
      
      this.chartData[index] = result
      //console.log('clusteredData', clusteredData)
    }
    if(onDone != null){
      onDone(this.chartData)
    }
    // setTimeout(() => {
    //   this.chartData = this.newData
    //   timerUpdated = true
    //   //console.log('this.chartData', this.chartData)
    // }, 200);

    
  }
}



