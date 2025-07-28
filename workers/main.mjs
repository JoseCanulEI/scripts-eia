import '../Extends.mjs';
import WorkerPool from './WorkerPool.mjs';

async function start() {
  const api = (await import('../api.mjs')).api;

  let machinesDef = [];
  let pointsDef = [];
  let clearTable = false;

  let success = await api.checkAndCreateTable();
  if (!success) return console.error('⚠ Table not created ⚠');

  if (clearTable) {
    await api.truncateTable('measuresvalues');
    await api.truncateTable('measures');
    console.log('-- Table cleared --');
  }

  const startTime = Date.now();
  const machines = await api.getMachines(machinesDef);
  console.log('Total Machines:', machines.length);

  const pool = new WorkerPool(16); // ajusta según núcleos

  for (const machine of machines) {
    console.log(`\n🔧 Procesando máquina: ${machine.Code} - ${machine.Name}`);
    const points = await api.getPoints(machine.Code, pointsDef);

    for (const point of points) {
      const idsFiles = await api.getMachineFiles(machine.Code, point.pointIndex);
      if (!idsFiles.length) {
        console.log(`No files for pointIndex: ${point.pointIndex}`);
        continue;
      }

      const uniqueIds = [...new Set(idsFiles.map(f => f.fileID))];
      const batchSize = 100;
      const total = Math.ceil(uniqueIds.length / batchSize);

      for (let i = 0; i < total; i++) {
        const batch = uniqueIds.slice(i * batchSize, (i + 1) * batchSize);
        // const files = await api.getMultipleFiles(batch, machine.Code);
        // if (!files.length) continue;

        console.log(`Processing batch ${i + 1}/${total}`);

        try {
            const res = await pool.runTask({ 
              //files, 
              machine, 
              point, 
              datos: idsFiles,
              batch
            });
        } catch (err) {
            console.log(`Worker batch ${i + 1} error: ${err.message}`);
        }
      }
    }
  }

  await pool.waitForAllWorkers()

  const seconds = (Date.now() - startTime) / 1000;
  console.log(`🏁 Procesamiento terminado en ${seconds} segundos`);
  process.exit();
}

start();