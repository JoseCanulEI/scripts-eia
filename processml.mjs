import './Extends.mjs'
async function start() {
    const api = (await import('./api.mjs')).api
    const { MachineLearning, DataHandler } = await import('./machinelearning/MachineLearning.mjs')
    const Enums = (await import('./ErbessdSavingData.mjs')).ErbessdSavingData
    const startDate = '2023-01-01 00:00:00' // start date to generate data
    const endDate = new Date() // end date to generate data
    let machinesDef = [] // machines to generate data
    let pointsDef = [] // points to generate data
    let axisDef = [] // axis to generate data
    let clearTable = false // clear table before start
    
    // Create table if not exists
    let tableCreated = await api.checkAndCreateTableML()
    if (!tableCreated) {
        console.log('Error creating tables')
        return
    }

    if (clearTable) {
        console.log('Clearing table...')
        // let cleared = await api.truncateTable('ml_clusters_indices')
        await api.truncateTable('ml_clusters_models')
        await api.truncateTable('ml_clusters_config')
        if (cleared) {
            console.log('-- Table cleared --')
        } else {
            console.log('⚠**** Table not cleared. Check logs ****⚠' )
            return
        }
    }
    
    let machines = await api.getMachines(machinesDef) // get all machines
    const hourStart = new Date().toLocaleString()
    console.log('Total Machines: ', machines != null ? machines.length : 0, ' - Hour: ', hourStart)
    for (let m = 0; m < machines.length; m++) {
        console.log('\nGenerating clusters for machine: ' + machines[m].Code + ' - ' + machines[m].Name + ' \n')

        let points = await api.getPoints(machines[m].Code, pointsDef) // get all points for machine
        console.log('Points: ', points != null ? points.length : 0)

        for (let p = 0; p < points.length; p++) {
            if (points[p].Axis != null && points[p].Axis !== '') {
                console.log('\nProcessing pointIndex: ', points[p].pointIndex + ' - ' + points[p].name)
                let axes = points[p].Axis.split(',').map(Number)
                for (let x = 0; x < axes.length; x++) {
                    if (axisDef.length > 0 && !axisDef.includes(axes[x])) continue
                    console.log('- Axis: ', axes[x])
                    await machineLearningProcess(machines[m].Code, points[p].pointIndex, axes[x])
                    console.log('\n')
                }
            } else {
                console.log('No axis defined for point: ', points[p].name)
                console.log('\n')
            }
        }
    }

    async function machineLearningProcess(machineCode, pointIndex, axis) {
        let options = {
            machineCode: machineCode,
            pointIndex: pointIndex,
            axis: axis,
            startDate: startDate,
            endDate: endDate.toString('YYYY-MM-DD HH:mm:ss'),
            clustering:{}
        }
        let processor = []
        let data = await new Promise((resolve) => {
            MachineLearning.database.getTrend(options, (result) => {
                resolve(result)
            })
        })
        if (data == null || data.scatterDataSet == null || data.scatterDataSet.data == null) {
            return console.log('No data found for machine: ', machineCode, ' - pointIndex: ', pointIndex, ' - axis: ', axis)
        }

        let dataHandler = new DataHandler(data.scatterDataSet, null, null)
        const clustering = MachineLearning.getDefaultClusteringOptions()
        for (var c = 0; c < clustering.params.length; c++) {
            const cluster = clustering.params[c]
            let features = cluster.features.deepClone()
            if (features.length < 1) {continue}
            const result = await new Promise((resolve, reject) => {
                dataHandler.cluster(cluster, result => {
                    resolve(result)
                })
            })
            if (result != null) {
                processor.push({config: cluster, result, models: dataHandler.models.deepClone()})
                dataHandler.models = {}
            }
        }
        dataHandler.destroy() // destroy data handler to free memory

        if (processor != null && processor.length > 0) {
            try {
                const options = { machineCode, pointIndex, axis }
                await prepareData(processor, options, data)
            } catch (error) {
                console.log('Error preparing data: ', error)
            }
        } else {
            console.log('Error processing machine learning: processor is null')
        }
    }

    async function prepareData(machinelearning, options, trend) {
        for (let ch = 0; ch < machinelearning.length; ch++) {
            const chart = machinelearning[ch]
            const models = chart.models || {}
            const { clustersIndices } = chart.result
            const modifier = Enums.UnitsModifiers['cluster'+ (ch + 1)]
            chart.config.unit = Enums.Units.packModifierUnit(modifier, Enums.Units.cluster)
            const cluster = new MachineLearning.database.Cluster({
                config: chart.config,
                hasDataSplitter: clustersIndices.max() > 500
            })
            cluster.setClusterIndices(clustersIndices, trend.scatterDataSet.data, trend.scatterDataSet.columns)
            const sections = cluster.getSplitterSeries()

            const series = {
                data: cluster.seriesData,
                sections,
                clustersIndices,
                trend: trend.trendDataSet,
            }
            let obj = MachineLearning.prepareIndicesForDatabase(series, chart.config, models)
            // console.log('Indices: ', indices)
            await saveModels(obj.indices, obj.modelData, chart.config, options)
        }
    }

    async function saveModels(indices, modelData, config, opts) {
        try {
            const id = await api.insertClusters_Config(config, opts)
            console.log('Inserted new model with id: ', id)
            if (id != null && id > 0) {
                const batch = 1000 // batch size for inserting measures
                const total = Math.ceil(indices.length / batch) // total de lotes
                for (let i = 0; i < total; i++) {
                    const start = i * batch
                    const end = start + batch
                    const measures = indices.slice(start, end)
                    const rows = measures.map(m => ({
                        measureId: m.measureId,
                        unit: config.unit,
                        value: m.cluster
                    }))
                    await api.insertValues(rows) // save measures in database
                }
                // let success_indices = await api.insertClusters_Indices(id, indices)
                let success_models = await api.insertClusters_Models(id, modelData)
                console.log('Inserted clusters: ', indices.length, ' - Models: ', success_models)
            }
        } catch (error) {
            console.log('Error saving models: ', error)
        }
    }
    
    console.log('Finished!', 'Start: ' + hourStart, ' - End: ' + new Date().toLocaleString())
    process.exit()
}

start()