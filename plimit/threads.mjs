import '../Extends.mjs'
import pLimit from 'p-limit'

async function start() {
  const api = (await import('../api.mjs')).api
  const Enums = (await import('../ErbessdSavingData.mjs')).ErbessdSavingData
  let EdgeProcessing = (await import('../EdgeProcessing.mjs')).EdgeProcessing
  let readFile = (await import('../readANL.mjs')).readANL

  let machinesDef = [2007907250] // código de máquinas a obtener, si está vacío obtiene todas
  let pointsDef = [1]   // puntos a obtener, si está vacío obtiene todos
  let clearTable = false // limpiar tabla antes de iniciar

  const Erbessd = Enums
  const trendUnitsDef = Erbessd.MachineLearning.getTrendUnitsDefault()
  const requiredTrendUnits = Erbessd.MachineLearning.getRequiredTrendUnits()

  // Crear tabla si no existe
  console.time('🔧 checkAndCreateTable')
  const success = await api.checkAndCreateTable()
  console.timeEnd('🔧 checkAndCreateTable')

  if (!success) {
    console.log('⚠**** Table not created. Check logs ****⚠')
    return
  }

  if (clearTable) {
    console.log('⛔ Limpiando tabla...')
    console.time('🧹 truncateTable')
    let success = await api.truncateTable('measuresvalues')
    if (success) await api.truncateTable('measures')
    console.timeEnd('🧹 truncateTable')
  }

  console.time('📦 getMachines')
  let machines = await api.getMachines(machinesDef)
  console.timeEnd('📦 getMachines')

  const hourStart = new Date().toLocaleString()
  console.log('🧠 Total Machines:', machines?.length || 0, 'Start:', hourStart)

  for (let m = 0; m < machines.length; m++) {
    const machine = machines[m]
    console.log(`\n🔍 Máquina: ${machine.Code} - ${machine.Name}`)

    console.time(`📍 getPoints-${machine.Code}`)
    let points = await api.getPoints(machine.Code, pointsDef)
    console.timeEnd(`📍 getPoints-${machine.Code}`)
    console.log('  ↳ Total puntos:', points.length)

    for (let p = 0; p < points.length; p++) {
      const point = points[p]

      console.time(`📁 getFiles-${machine.Code}-${point.pointIndex}`)
      let idsFiles = await api.getMachineFiles(machine.Code, point.pointIndex)
      console.timeEnd(`📁 getFiles-${machine.Code}-${point.pointIndex}`)

      if (idsFiles.length > 0) {
        await processingData(idsFiles, 50, machine, point)
      } else {
        console.log(`⚠ No hay archivos para el punto ${point.pointIndex} - ${point.name}`)
      }
    }
  }

  async function processingData(datos, batch, machine, point) {
    const machineCode = machine.Code
    const limit = pLimit(4) // Número de hilos (cambiar aquí si deseas)
    const ids = [...new Set(datos.map(item => item.fileID))]
    const total = Math.ceil(ids.length / batch)

    console.log(`\n🚀 Procesando puntoIndex: ${point.pointIndex} - ${point.name} (${ids.length} archivos, ${total} lotes)\n`)

    const tasks = []
    for (let i = 0; i < total; i++) {
      const start = i * batch
      const end = start + batch
      const chunk = ids.slice(start, end)

      tasks.push(limit(async () => {
        const t0 = Date.now()
        try {
          console.log(`🔸 Lote ${i + 1}/${total} (${chunk.length} archivos)...`)
          const files = await api.getMultipleFiles(chunk, machineCode)
          if (files.length > 0) {
            await processMeasure(files, machine, point, datos)
          }
          const secs = ((Date.now() - t0) / 1000).toFixed(2)
          console.log(`✅ Lote ${i + 1} finalizado en ${secs}s`)
        } catch (err) {
          console.error(`❌ Error en lote ${i + 1}:`, err)
        }
      }))
    }

    await Promise.all(tasks)
  }

  async function processMeasure(files, machine, point, measures) {
    for (let f = 0; f < files.length; f++) {
      const t0 = Date.now()
      const file = await readFile.readBase64File(files[f].ThisFile)

      if (!file?.data) {
        console.log(`⚠ Archivo vacío o inválido (fileID ${files[f].ID})`)
        continue
      }

      const { sampleRate, calibration, sensitivity, sensorType } = file
      let axis = files[f].Axis
      let reason = Erbessd.reasonTypes.Requested
      const measure = measures.find(m => m.fileID === files[f].ID)
      if (measure) {
        reason = measure.reason
        if (!axis) axis = measure.axis
      }

      if (!axis) {
        console.log(`⚠ Eje no encontrado para fileID ${files[f].ID}`)
        continue
      }

      const options = {
        sampleRate,
        calibration,
        sensorSensitivity: sensitivity,
        sensorType,
        data: file.data[0],
        machineCode: machine.Code,
        pointIndex: point.pointIndex,
        axis,
        skipWebService: true
      }

      await EdgeProcessing.processSignal(options, point, requiredTrendUnits, trendUnitsDef)
      const secs = ((Date.now() - t0) / 1000).toFixed(2)
      console.log(`📊 Archivo procesado (fileID ${files[f].ID}) en ${secs}s`)
    }
  }

  console.log('\n🏁 Finalizado. Inicio:', hourStart, ' - Fin:', new Date().toLocaleString())
  process.exit()
}

start()