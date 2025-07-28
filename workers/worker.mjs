// worker.js
import '../Extends.mjs';
import { parentPort, threadId } from 'worker_threads';
const api = (await import('../api.mjs')).api;

async function processData(workerData) {
  try {
    const { batch, machine, point, datos } = workerData;

    const files = await api.getMultipleFiles(batch, machine.Code);
    // if (!files.length) continue;

    const { EdgeProcessing } = await import('../EdgeProcessing.mjs');
    const readFileModule = await import('../readANL.mjs');
    const enumsModule = await import('../ErbessdSavingData.mjs');

    const readFile = readFileModule.readANL;
    const Enums = enumsModule.ErbessdSavingData;

    const trendUnitsDef = Enums.MachineLearning.getTrendUnitsDefault();
    const requiredTrendUnits = Enums.MachineLearning.getRequiredTrendUnits();

    for (const f of files) {
      try {
        const startProcess = Date.now();
        const file = await readFile.readBase64File(f.ThisFile);
        if (!file || !file.data) {
          console.warn(`[Worker ${threadId}][FileID: ${f.ID}] Archivo vacío o inválido`);
          continue;
        }

        let axis = f.Axis;
        let reason = Enums.reasonTypes.Requested;
        const measure = datos.find(m => m.fileID === f.ID);
        if (measure) {
          reason = measure.reason;
          if (!axis) axis = measure.axis;
        }

        if (!axis) {
          console.warn(`[Worker ${threadId}][FileID: ${f.ID}] ❌ No se encontró axis`);
          continue;
        }

        const options = {
          sampleRate: file.sampleRate,
          calibration: file.calibration,
          sensorSensitivity: file.sensitivity,
          sensorType: file.sensorType,
          data: file.data[0],
          machineCode: machine.Code,
          pointIndex: point.pointIndex,
          axis,
          skipWebService: true
        };

        const results = await EdgeProcessing.processSignal(options, point, requiredTrendUnits, trendUnitsDef);
        console.log(`[Worker ${threadId}][FileID: ${f.ID}] ✅ Procesado correctamente`);
        if (results != null && results.mergedValues != null) {
          let success = await saveMeasure(results, machine, point, axis, f.ID, f.Date_Time, reason)
          const secs = (Date.now() - startProcess) / 1000;
          console.log('Saving measure: ', success, ' -> Time: ', secs, ' seconds');
        } else {
          console.log('Error processing signal, results is null')
        }
      } catch (err) {
        console.error(`[Worker][FileID: ${f.ID}] 🛑 Error al procesar:`, err.message);
      }
    }

    parentPort.postMessage({
      status: 'done',
      pointIndex: point.pointIndex,
      processed: files.length
    });
  } catch (err) {
    console.error('💥 Error crítico en worker:', err.message);
    process.exit(1);
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

parentPort.on('message', async (msg) => {
  // console.log("---------------------------> Starting worker process", threadId)
  await processData(msg)
  // console.log("<-------------------------- Ending worker process", threadId)
})