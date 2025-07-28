import './Extends.mjs'
async function start() {
    const api = (await import('./api.mjs')).api
    const EdgeProcessing = (await import('./EdgeProcessing.mjs')).EdgeProcessing
    const readFile = (await import('./readANL.mjs')).readANL
    const Erbessd = (await import('./ErbessdSavingData.mjs')).ErbessdSavingData
    const { MachineLearning, DataHandler } = await import('./machinelearning/MachineLearning.mjs')
    const isWiser = false

    const sensores = await api.getAll(300, 'ASC', isWiser)
    const requiredTrendUnits = Erbessd.MachineLearning.getRequiredTrendUnits()
    const trendUnits = Erbessd.MachineLearning.getTrendUnitsDefault()

    if (sensores == null || sensores.length == 0) {
        console.log('No se encontraron sensores')
        process.exit() // no hay sensores para procesar
    }
    const nSensores = sensores.length
    const processIds = []
    sensores.forEach(sensor => {
        processIds.push(sensor.id)
    })
    await api.updateDataState(processIds, 101) // actualiza estado de sensores a 101

    console.log(' ** Sensores a procesar: ', nSensores, ' || hora: ', new Date().toLocaleString(), ' **')
    const salida = {NAIds: [], errorIds: [], Oks: [], savedWithErrors: []}
    for (let i = 0; i < sensores.length; i++) {
        try {
            const sensor = sensores[i]
            const startTime = Date.now()
            const isRoute = sensor.sn_device != null && sensor.sn_device === -1
            let others = sensor.others
            if (others != null && typeof sensor.others === 'string') {
                others = JSON.parse(sensor.others) || {}
            }

            await api.generateDBConnection(sensor.configs, sensor.sn_device, others.DBId) // genera la conexión a la base de datos
            if (api.userDBConnection == null) {
                console.log('Sensor Not assigned to database: - Id: ', sensor.id, ' - SN: ', sensor.sn_device)
                salida.NAIds.push({ id: sensor.id, message: 'Sensor Not assigned to database' })
                continue
            }
            let deviceInfo = null
            if (!isRoute) {
                deviceInfo = await api.getDeviceInfo(sensor.sn_device) // obtiene la información del sensor
                if (deviceInfo == null || deviceInfo.length == 0) {
                    salida.NAIds.push({ id: sensor.id, message: 'Unallocated in user database' })
                    continue
                }
                if (parseInt(deviceInfo[0].enabled) === 0) {
                    salida.NAIds.push({ id: sensor.id, message: 'Sensor disabled to process' })
                    continue
                }
                if (parseInt(deviceInfo[0].MachineCode) <= 0) {
                    salida.NAIds.push({ id: sensor.id, message: 'Sensor with invalid MachineCode' })
                    continue
                }
            }
            let measures = await getMeasureList(deviceInfo, sensor.channel_1, sensor.channel_2, sensor.channel_3, others, sensor.date, isRoute) // procesa las medidas
            if (measures == null || measures.length == 0) {
                salida.errorIds.push({ id: sensor.id, message: 'No measures to process' })
                continue
            }
            const savedMeasure = measures.find(m => m.saved === false)
            if (savedMeasure != null) {
                salida.savedWithErrors.push({ id: sensor.id, message: 'Save measures with errors' })
                continue
            }

            console.log('Saved Measures -> Id: ', sensor.id, !isRoute ? ' - Code: ' + sensor.sn_device : '', ' - Time: ', Date.now() - startTime, 'ms')
            
            let machineLearningProcess = await generateClusters(measures, sensor.date)
            const savedMachineLearning = machineLearningProcess.find(m => m === false)
            if (savedMachineLearning != null) {
                salida.NAIds.push({ id: sensor.id, message: 'Save machine learning with errors, but the process continue' })
                continue
            }

            console.log('Saved Machine Learning -> Id: ', sensor.id, !isRoute ? ' - Code: ' + sensor.sn_device : '', ' - Time: ', Date.now() - startTime, 'ms \n')
            salida.Oks.push({ id: sensor.id, message: 'OK' })
        } catch (error) {
            // console.log('Error: ', error.message, 'Sensor: ', sensores[i])
            salida.errorIds.push({ id: sensores[i].id, message: error.message })
        }
    }
    await api.endConnection() // cierra la conexión a la base de datos

    // #region Edge Processing
    async function getMeasureList(deviceChannels, channel1, channel2, channel3, config, datetime, isRoute) {
        let calibration = parseFloat(config.calibration)
        let sampleRate = parseInt(config.samplerate)
        let reason = config.reason != null ? parseInt(config.reason) : Erbessd.reasonTypes.Requested
        let mst = []
        if (isRoute && channel1 != null) {
            reason = Erbessd.reasonTypes.Route
            deviceChannels = await readFile.leer_binario(channel1)
            if (deviceChannels != null && deviceChannels.length > 0) {
                calibration = deviceChannels[0].calibration
                sampleRate = deviceChannels[0].sampleRate
                let pointMachine = await api.getPoints(deviceChannels[0].machineCode, [deviceChannels[0].pointIndex])
                if (pointMachine != null && pointMachine.length > 0) {
                    for (let i = 0; i < deviceChannels.length; i++) {
                        Object.assign(deviceChannels[i], pointMachine[0])
                    }
                }
            } else {
                // console.log('No se encontraron datos en el archivo: ', channel1)
                return []
            }
        }
        for (let i = 0; i < deviceChannels.length; i++) {
            const channel = deviceChannels[i];
            try {
                let sensorType = 1
                let sensitivity = 1
                let dataShort = null
                let axis = -1
                let machineCode = -1
                let pointIndex = -1
                if (!isRoute) {
                    if (parseInt(channel.Axis) <= 0) {continue}

                    axis = parseInt(channel.Axis)
                    machineCode = parseInt(channel.MachineCode)
                    pointIndex = parseInt(channel.PointIndex)
                    sensorType = parseInt(channel.dv_type)
                    if (channel.gpSensitivity != null && parseFloat(channel.gpSensitivity) != -1) {
                        sensitivity =  parseFloat(channel.gpSensitivity)
                    }
                    let fileBytes = null
                    switch (parseInt(channel.DeviceChannel)) { // define el canal de lectura
                        case 1:
                            fileBytes = channel1
                            break;
                        case 2:
                            fileBytes = channel2
                            break;
                        case 3:
                            fileBytes = channel3
                            break;
                    }
                    dataShort = readFile.bytesToShorts(fileBytes)
                    if (dataShort == null || dataShort.length == 0) { continue }
                } else {
                    axis = parseInt(channel.axis)
                    machineCode = parseInt(channel.machineCode)
                    pointIndex = parseInt(channel.pointIndex)
                    sensorType = parseInt(channel.sensorType)
                    sensitivity = parseFloat(channel.sensitivity)
                    dataShort = channel.data
                }
                const point = {
                    machineCode: machineCode,
                    pointIndex: pointIndex,
                    MinRPM: parseInt(channel.MinRPM),
                    MaxRPM: parseInt(channel.MaxRPM),
                    minHz: channel.minHz != null ? parseInt(channel.minHz) : 10,
                    maxHz: channel.maxHz != null ? parseInt(channel.maxHz) : 1000
                }
                let options = {
                    sampleRate: sampleRate,
                    calibration: calibration,
                    sensorType: sensorType,
                    sensorSensitivity: sensitivity,
                    data: dataShort,
                    pointIndex: pointIndex,
                    axis: axis,
                    skipWebService: true
                }

                // process measure
                const results = await EdgeProcessing.processSignal(options, point, requiredTrendUnits, trendUnits)
                
                if (results != null && results.mergedValues != null) {
                    // console.log('Results preprocess: ', results.mergedValues)
                    const ms = []
                    const fileID = await api.getFileID(point.machineCode, point.pointIndex, options.axis, datetime)
                    if (datetime != null) {
                        // console.log('- Edge processing finished with FileID -> ', fileID)
                        for (const modifier in results.mergedValues) {
                            let value = results.mergedValues[modifier]
                            if (!Array.isArray(value.v)) {
                                let measure = {
                                    machineCode: point.machineCode,
                                    pointIndex: point.pointIndex,
                                    axis: options.axis,
                                    unit: modifier,
                                    value: value.v,
                                    fileID: fileID,
                                    dateTime: datetime,
                                    reason: reason
                                }
                                ms.push(measure)
                            }
                        }
                        if (ms.length > 0) {
                            let obj = {axis: options.axis, results: ms, saved: false, rowId: null}
                            const rowId = await saveOptions(ms)
                            obj.rowId = rowId
                            obj.saved = rowId != null && rowId > 0
                            mst.push(obj)
                        }
                    }
                }
            } catch (error) {
                console.log('Error msg: ', error.message, ' - Channel: ', channel.DeviceChannel != null ? channel.DeviceChannel : channel.axis)
            }
        }
        return mst
    }

    async function saveOptions(measures) {
        try {
            await api.checkAndCreateTable(false) // verifica si la tabla existe
            const insertId = await api.insertMeasures(measures, true)
            return insertId
        } catch (error) {
            console.log('Error saving measures: ', error.message)
        }
        return false
    }
    // #endregion

    // #region Machine Learning
    async function generateClusters(measures, datetime) {
        const ml = []
        for (let i = 0; i < measures.length; i++) {
            const item = measures[i]
            const opts = {
                machineCode: item.results[0].machineCode,
                pointIndex: item.results[0].pointIndex,
                axis: item.results[0].axis
            }
            const data = []
            item.results.forEach(measure => {
                data.push([datetime, parseInt(measure.unit), measure.value, item.rowId]) // measure.fileID
            })
            const trend = {
                columns: ['Date', 'U', 'V', 'measureid'], // 'fileID'
                data: data
            }
            const clustering = await api.getClustering(opts)
            if (clustering != null && clustering.length > 0) {
                const dataHandler = new DataHandler(trend, MachineLearning.database.scatterTransforms, null)
                for (var c = 0; c < clustering.length; c++) {
                    let cluster = clustering[c]
                    let features = cluster.features.deepClone()
                    if (features.length < 1) {continue}
                    let result = await new Promise((resolve, reject) => {
                        dataHandler.cluster(cluster, result => {
                          resolve(result)
                        }, null, true)
                    })
                    // console.log('Cluster result: ', result)
                    if (result != null) {
                        let responseMl = await saveClusters(cluster, result, dataHandler.models.deepClone(), trend)
                        ml.push(responseMl)
                        dataHandler.models = {}
                    }
                }
                dataHandler.destroy() // destroy data handler to free memory
            }
        }

        return ml
    }
    
    async function saveClusters(clustering, results, models, scatterDataSet) {
        if (results.data != null && results.data.length > 0) {
            try {
                const { clustersIndices } = results
                const cluster = new MachineLearning.database.Cluster({
                    config: clustering,
                    hasDataSplitter: clustersIndices.max() > 500
                })
                cluster.setClusterIndices(clustersIndices, scatterDataSet.data, scatterDataSet.columns)
                const sections = cluster.getSplitterSeries()

                const series = {
                    data: cluster.seriesData,
                    sections,
                    clustersIndices,
                    trend: scatterDataSet,
                }
                const obj = MachineLearning.prepareIndicesForDatabase(series, clustering, models)
                if (clustering.id != null && clustering.id > 0) {
                    const rows = obj.indices.map(m => ({
                        measureId: m.measureId,
                        unit: clustering.unit,
                        value: m.cluster
                    }))
                    let success_indices = await api.insertValues(rows)
                    // let success_indices = await api.insertClusters_Indices(clustering.id, obj.indices)
                    let success_models = await api.updateClusters_Models(clustering.id, obj.modelData)
                    // console.log('Inserted Indices: ', success_indices, ' - Models: ', success_models)
                    return success_indices && success_models
                }
            } catch (error) {
                console.log('Error saving clusters: ', error.message)
                return false
            }
        }
        return true
    }
    // #endregion

    // Eliminar sensores con exito y actualizar los estados de los sensores
    // #region Update Status
    const deleteIds = []
    if (salida.NAIds.length > 0) {
        salida.NAIds.forEach(sensor => deleteIds.push(sensor.id))
        await readFile.PasoTxtError(new Date().toString('YYYY-MM-DD HH:mm:ss'), JSON.stringify(salida.NAIds), 'NAIds') // guarda el error en el txt
    }
    if (salida.Oks.length > 0) {
        salida.Oks.forEach(sensor => deleteIds.push(sensor.id))
    }
    if (salida.errorIds.length > 0) {
        const IdsUpdate = []
        salida.errorIds.forEach(sensor => IdsUpdate.push(sensor.id))
        await api.updateDataState(IdsUpdate, 102) // actualiza estado de sensores a 102
        await readFile.PasoTxtError(new Date().toString('YYYY-MM-DD HH:mm:ss'), JSON.stringify(salida.errorIds), 'errorIds') // guarda el error en el txt
    }
    if (salida.savedWithErrors.length > 0) {
        const IdsUpdate = []
        salida.savedWithErrors.forEach(sensor => IdsUpdate.push(sensor.id))
        await api.updateDataState(IdsUpdate, 103) // actualiza estado de sensores a 103
        await readFile.PasoTxtError(new Date().toString('YYYY-MM-DD HH:mm:ss'), JSON.stringify(salida.savedWithErrors), 'savedWithErrors') // guarda el error en el txt
    }
    
    if (deleteIds.length > 0) {
        await api.deleteDataIds(deleteIds) // elimina sensores con exito
    }
    // #endregion
    
    console.log('Saved Done!')
    process.exit()
}

start()