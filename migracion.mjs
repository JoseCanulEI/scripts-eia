const BATCH_SIZE = 500 // Puedes ajustar según rendimiento y memoria

async function migrarDatosEnLotes() {
  const api = (await import('./api.mjs')).api

  try {
    let offset = 0
    let tieneDatos = true

    const hourStart = new Date().toLocaleString()
    console.log('Starting migration in batches...')
    console.log('Start time: ', hourStart)
    while (tieneDatos) {
      // ✅ Obtener lote con JOIN directo para traer Reason desde origen_2
      const grupoLote = await api.executeCustom(
        `
        SELECT DISTINCT MachineCode, PointIndex, Axis, Date_Time
        FROM ml_historic_values
        ORDER BY MachineCode, PointIndex, Axis, Date_Time
        LIMIT ? OFFSET ?
      `,
        [BATCH_SIZE, offset]
      )

      if (grupoLote.length === 0) {
        tieneDatos = false
        break
      }

      const claves = grupoLote.map(({ MachineCode, PointIndex, Axis, Date_Time }) =>
        `(${MachineCode}, ${PointIndex}, ${Axis}, '${Date_Time}')`
      ).join(',');

      const reasonBatch = await api.executeCustom(`
        SELECT MachineCode, PointIndex, Axis, Date_Time, Reason
        FROM ml_reason_values
        WHERE (MachineCode, PointIndex, Axis, Date_Time) IN (${claves})
      `);

      const reasonMap = new Map();
      for (const row of reasonBatch) {
        const key = `${row.MachineCode}|${row.PointIndex}|${row.Axis}|${row.Date_Time}`;
        reasonMap.set(key, row.Reason);
      }

      let porcentaje = 0
      let index = 0
      console.log(`\n🔄 Migrando lote (offset: ${offset})...`)
      for (const grupo of grupoLote) {
        const { MachineCode, PointIndex, Axis, Date_Time } = grupo

        const reasonKey = `${MachineCode}|${PointIndex}|${Axis}|${Date_Time}`;
        const Reason = reasonMap.get(reasonKey) ?? null;

        // Insertar en measures
        const insert1 = await api.executeCustom(
          `
          INSERT INTO measures (MachineCode, PointIndex, Channel, Date_Time, Reason, FileType, FileAvailable, SyncID, Extras)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [MachineCode, PointIndex, Axis, Date_Time, Reason, 1, 1, -1, null]
        )

        const idDestino1 = insert1.insertId

        // Obtener registros de ml_historic_values
        const datosOrigen = await api.executeCustom(
          `
          SELECT Unit, Value
          FROM ml_historic_values
          WHERE MachineCode = ? AND PointIndex = ? AND Axis = ? AND Date_Time = ?
        `,
          [MachineCode, PointIndex, Axis, Date_Time]
        )

        // Insertar en measuresvalues en bloque
        const valores = datosOrigen.map(({ Unit, Value }) => [idDestino1, Unit, Value, null]);

        if (valores.length > 0) {
          await api.insertBatchExecute(
            'measuresvalues',
            ['MeasureID', 'Unit', 'Value', 'Extras'],
            valores // matriz: [[idDestino1, unit, value], [...], ...]
          )
        }

        // Mostrar progreso
        index++
        porcentaje += 100 / grupoLote.length
        if (index % 50 === 0) // Mostrar cada 50 registros
          console.log(`Progreso: ${Math.round(porcentaje)}%`)
      }

      console.log(`\n✅ Lote transferido (offset: ${offset})`)
      offset += BATCH_SIZE
    }

    console.log('🎉 Migración completada por lotes.')
    const hourEnd = new Date().toLocaleString()
    console.log('Start time: ', hourStart, ' End time: ', hourEnd)
  } catch (err) {
    console.error('❌ Error en migración por lotes:', err)
  }

  process.exit()
}

migrarDatosEnLotes()
