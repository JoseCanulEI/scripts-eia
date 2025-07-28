import './Extends.mjs'
async function start() {
  const api = (await import('./api.mjs')).api
  const Enums = (await import('./ErbessdSavingData.mjs')).ErbessdSavingData
  let EdgeProcessing = (await import('./EdgeProcessing.mjs')).EdgeProcessing
  let readFile = (await import('./readANL.mjs')).readANL
  let machinesDef = [] // code machines to get, if empty get all machines
  let pointsDef = [] // points to get, if empty get all points
  let clearTable = false // clear table before start
  let rangeDates = ['2024-02-11 00:00:00', '2025-02-12 23:59:59'] // range dates to get files

  const Erbessd = Enums
  const trendUnitsDef = Erbessd.MachineLearning.getTrendUnitsDefault()
  const requiredTrendUnits = Erbessd.MachineLearning.getRequiredTrendUnits()
  
  // Check and create table
  let success = await api.checkAndCreateTable()
  if (success) {
    console.log('-- Table is ready --')
  } else {
    console.log('⚠**** Table not created. Check logs ****⚠' )
    return
  }
  // Clear table if required
  if (clearTable) {
    console.log('Clearing table...')
    let success = await api.truncateTable('measuresvalues')
    if (success) {
      await api.truncateTable('measures')
      console.log('-- Table cleared --')
    } else {
      console.log('⚠**** Table not cleared. Check logs ****⚠' )
      return
    }
  }

  let machines = await api.getMachines(machinesDef) // get all machines
  const hourStart = new Date().toLocaleString()
  console.log('Total Machines: ', machines != null ? machines.length : 0, 'Hour: ', hourStart)
  for (let m = 0; m < machines.length; m++) {
    console.log('\nGenerating data for machine: ' + machines[m].Code + ' - ' + machines[m].Name + ' \n')
    
    let points = await api.getPoints(machines[m].Code, pointsDef) // get all points for machine
    console.log('Points: ', points != null ? points.length : 0)

    for (let p = 0; p < points.length; p++) {
      let idsFiles = await api.getMachineFiles(machines[m].Code, points[p].pointIndex) // verify if there are files for the point
      if (idsFiles.length > 0) {
        await processingData(idsFiles, 50, machines[m], points[p])
      } else {
        console.log('No files for pointIndex: ', points[p].pointIndex + ' - ' + points[p].name)
      }
      console.log('\n')
    }
  }

  async function processingData(datos, batch, machine, point) { // process files by batch
    // arreglo de ids sin repetir
    let ids = datos.reduce((acc, item) => {
      if (!acc.includes(item.fileID)) {
        acc.push(item.fileID)
      }
      return acc
    }, [])
    const total = Math.ceil(ids.length / batch) // total de lotes
    const machineCode = machine.Code
    console.log('Processing pointIndex: ', point.pointIndex + ' - ' + point.name, ' with ', ids.length, ' files \n')

    for (let i = 0; i < total; i++) {
      const start = i * batch
      const end = start + batch
      const data = ids.slice(start, end)
      try {
        console.log(`\n** Processing data ${i + 1} of ${total} batch with ${data.length} files **\n`)
        const files = await api.getMultipleFiles(data, machineCode) // get anl files
        if (files.length > 0) {
          await processMeasure(files, machine, point, datos)
        }
      } catch (error) {
        console.log(`Error processing data ${i + 1}: `, error)
      }
    }
  }

  async function processMeasure(files, machine, point, measures) { // process files in edge processing
    for (let f = 0; f < files.length; f++) {
      let startProcess = Date.now()
      let file = await readFile.readBase64File(files[f].ThisFile)
      // console.log('Processing file: ', file)
      if (file != null && file.data != null) {
        const {sampleRate, calibration, sensitivity, sensorType} = file
        let axis = files[f].Axis
        let reason = Erbessd.reasonTypes.Requested
        const measure = measures.find(m => m.fileID === files[f].ID)
        if (measure != null) {
          reason = measure.reason
          if (axis == null) {
            axis = measure.axis
          }
        }
        if (axis == null) {
          console.log('Axis not found for fileID: ', files[f].ID)
          continue
        }
        let options = {
          sampleRate: sampleRate,
          calibration: calibration,
          sensorSensitivity: sensitivity,
          sensorType: sensorType,
          data: file.data[0],
          machineCode: machine.Code,
          pointIndex: point.pointIndex,
          axis: axis,
          skipWebService: true
        }

        let results = await EdgeProcessing.processSignal(options, point, requiredTrendUnits, trendUnitsDef)
        // console.log('Results preprocess: ', results)
        console.log('- Edge processing finished with FileID -> ', files[f].ID)
        
        if (results != null && results.mergedValues != null) {
          let success = await saveMeasure(results, machine, point, axis, files[f].ID, files[f].Date_Time, reason)
          console.log('Saving measure: ', success, ' -> Time: ', Date.now() - startProcess)
        } else {
          console.log('Error processing signal, results is null')
        }
      }
    }
  }

  async function saveMeasure(results, machine, point, axis, fileID, dateTime, reason) { // save measures in database
    try {
      let measures = []
      for (const modifier in results.mergedValues) {
        let value = results.mergedValues[modifier]
        if (!Array.isArray(value.v)) {
          let measure = {
            machineCode: machine.Code,
            pointIndex: point.pointIndex,
            axis: axis,
            unit: modifier,
            value: value.v,
            fileID: fileID,
            dateTime: dateTime,
            reason: reason
          }
          measures.push(measure)
        }
      }
      const success = await api.insertMeasures(measures)
      return success
    } catch (error) {
      console.log('Error saveMeasure: ', error)
      return false
    }
  }

  console.log('Finished!', 'Start: ' + hourStart, ' - End: ' + new Date().toLocaleString())
  process.exit()
}

start()
