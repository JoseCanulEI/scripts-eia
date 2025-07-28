import mysql from 'mysql2/promise'
import connections from './config.mjs'
import { readANL } from './readANL.mjs'
import { ErbessdSavingData } from './ErbessdSavingData.mjs'
const { userDB: config, masterDB } = connections

const MySQLDateFormat = 'YYYY-MM-DD HH:mm:ss'
const SQLDateFormat = 'YYYY-MM-DD HH:mm:ss'
const database = config.database
var connection = await mysql.createConnection(config)
var masterConnection = await mysql.createConnection(masterDB)
var dbType = 1 // 1: MySQL, 2: SQL Server
const startDateFiles = null //'2025-06-01 00-00-00'
const endDateFiles = '2025-06-30 23-59-59'

async function request(Query, returnColumns = false, master = false, values = []) {
    let connectionDB = null
    let close = false
    try {
        if (api.userDBConnection != null) {
            connectionDB = api.userDBConnection
        } else {
            if (master) {
                connectionDB = masterConnection
            } else {
                connectionDB = await mysql.createConnection(config)
                close = true
            }
        }
        const [rows, fields] = await connectionDB.execute(Query, values)
        if (close) {
            await connectionDB.end()
        }
        // console.log('Response:- ', rows, fields)
        if (returnColumns) {
            return { rows, columns: fields.map(f => f.name) }
        }
        return rows
    } catch (error) {
        console.log('⚠ Error request: ', error.message)
        await readANL.PasoTxtError(new Date().toString('YYYY-MM-DD HH:mm:ss'), error.message, 'ERR_DB')
        
        if (close) {
            await connectionDB.end()
        }

        return null
    }
}

export const api = {
    userDBConnection: null,
    // #region Connection
    generateDBConnection: async function(configs, serieNumber, DBId) {
        try {
            if (typeof configs === 'string') {
                configs = JSON.parse(configs)
            }
            if (configs == null || configs.cnn == null || configs.cnn === '') {
                let deviceMaster = null
                if (serieNumber != null && serieNumber !== -1) { // phantom
                    deviceMaster = await this.getDBDevice(serieNumber)
                } else if (DBId != null && DBId !== -1) { // routes
                    deviceMaster = await this.getDataBaseById(DBId)
                }
                if (deviceMaster != null && deviceMaster.length > 0) {
                    const db = deviceMaster[0] || {}
                    if (configs == null) {
                        configs = {}
                    }
                    configs.cnn = `server=${db.server};uid=${db.uid};pwd=${db.pwd};database=${db.db_user}`
                } else {
                    return null
                }
            }
            function parseConnectionString(connectionString) {
                return connectionString.split(';').reduce((acc, part) => {
                    const [key, value] = part.split('=')
                    if (key && value) acc[key] = value
                    return acc
                }, {})
            }
            const obj = parseConnectionString(configs.cnn)
            const userConnection = {
                host: obj.server,
                user: obj.uid,
                password: obj.pwd,
                database: obj.database,
                dateStrings: true
            }
            this.userDBConnection = await mysql.createConnection(userConnection)
        } catch (error) {
            this.userDBConnection = null
        }
    },
    endConnection: async function() {
        if (this.userDBConnection != null) {
            await this.userDBConnection.end()
        }
        this.userDBConnection = null
    },
    // #endregion
    
    // #region Historic values
    checkAndCreateTable: async function(showConsole = true) {
        try {
            let databaseUser = database
            if (this.userDBConnection != null && this.userDBConnection.config != null) {
                databaseUser = this.userDBConnection.config.database
            }
            if (showConsole) {
                console.log('\n**** Database: ', databaseUser, ' ****\n')
            }
            
            let rows = await request(`SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = "${databaseUser}" AND TABLE_NAME="measures";`)
            if (rows != null && rows[0].count == 0) {
                if (showConsole) {
                    console.log('Table measures not created. Creating table measures...')
                }
                let createTableQuery = `CREATE TABLE measures (
                    ID INT(11) NOT NULL AUTO_INCREMENT, 
                    MachineCode INT(11) NULL,
                    PointIndex INT(11) NULL,
                    Channel SMALLINT(6) NULL,
                    Date_Time DATETIME NULL,
                    Reason SMALLINT(6) NULL,
                    FileType SMALLINT(6) NULL,
                    FileAvailable TINYINT(2) NULL,
                    SyncID SMALLINT(6) NULL,
                    FileID INT(11) NULL,
                    Extras LONGTEXT NULL,
                    PRIMARY KEY (ID),
                    INDEX indexm1 (MachineCode, PointIndex, Channel, Date_Time),
                    INDEX indexm3 (MachineCode, PointIndex, Channel, Reason),
                    UNIQUE INDEX unique1 (MachineCode, PointIndex, Channel, Date_Time)
                );`
                await request(createTableQuery)
                await this.checkAndCreateTableMValues(showConsole)
            } else {
                if (showConsole) {
                    console.log('Table is already created measures')
                }
            }
            return true
        } catch (error) {
            // console.log('⚠ Error create table: ', error)
            return false
        }
    },
    checkAndCreateTableMValues: async function(showConsole = true) {
        try {
            let databaseUser = database
            if (this.userDBConnection != null && this.userDBConnection.config != null) {
                databaseUser = this.userDBConnection.config.database
            }

            let rows = await request(`SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = "${databaseUser}" AND TABLE_NAME="measuresvalues";`)
            if (rows != null && rows[0].count == 0) {
                if (showConsole) {
                    console.log('Table measuresvalues not created. Creating table measuresvalues...')
                }
                let createTableQuery = `CREATE TABLE measuresvalues (
                    MeasureID INT(11) NOT NULL,
                    Unit INT(11) NOT NULL,
                    Value FLOAT NULL,
                    PRIMARY KEY (MeasureID, Unit),
                    INDEX indexmv12 (MeasureID, Unit)
                );`
                await request(createTableQuery)
            } else {
                if (showConsole) {
                    console.log('Table is already created measuresvalues')
                }
            }
        } catch (error) {
            // console.log('⚠ Error create table: ', error)
            return false
        }
    },
    getMachines: async function(machines) {
        try {
            let query = 'SELECT Code, Name FROM machines'
            if (machines != null && machines.length > 0) {
                query += ' WHERE Code IN (' + machines.join(',') + ')'
            }
            let rows = await request(query)
            return rows != null ? rows : []
        } catch (error) {
            // console.log('⚠ Error getMachines: ', error)
            return []
        }
    },
    getPoints: async function(machineCode, points) {
        try {
            let query = `SELECT MachineCode as machineCode, PointIndex as pointIndex, 
            Name as name, MinRPM, MaxRPM, minHz as MinHzRMS, maxHz as MaxHzRMS, Axis FROM Points 
            WHERE MachineCode = ${machineCode}`
            if (points != null && points.length > 0) {
                query += ' AND PointIndex IN (' + points.join(',') + ')'
            }
            let rows = await request(query)
            return rows != null ? rows : []
        } catch (error) {
            // console.log('⚠ Error getPoints: ', error)
            return []
        }
    },
    getMachineFiles: async function(machineCode, pointIndex) {
        try {
            // let rows = await request(`SELECT date_time AS Date, units AS U, realValue AS V, fileID AS fileID, axis FROM m__${machineCode} 
            //     WHERE pointindex = ${pointIndex} AND axis > -1 AND units IN (0,2) AND FileID > -1;`)
            let rows = await request(`SELECT m.date_time AS Date, m.units AS U, m.realValue AS V, m.axis, m.reason, m.fileID AS fileID 
                FROM m__${machineCode} AS m INNER JOIN m__${machineCode}_f AS f ON m.FileID = f.ID
                WHERE m.pointindex = ${pointIndex} AND m.axis > -1 AND m.units IN (0,2) AND f.Date_Time IS NOT NULL AND f.Date_Time <= '${endDateFiles}';`) // AND f.Date_Time >= '${startDateFiles}' AND f.Date_Time <= '${endDateFiles}'
            return rows != null ? rows : []
        } catch (error) {
            // console.log('⚠ Error getMachineFiles: ', error)
            return []
        }
    },
    getMultipleFiles: async function(fileIDs, machineCode) {
        try {
            let query = `SELECT ID, PointIndex, Axis, Date_Time, ThisFile FROM m__${machineCode}_f WHERE ID IN (${fileIDs.join(',')}) AND Date_Time IS NOT NULL;`
            let rows = await request(query)
            return rows != null ? rows : []
        } catch (error) {
            // console.log('⚠ Error getMultipleFiles: ', error)
            return []
        }
    },
    insertMeasures: async function(measures, returnId = false) {
        try {
            let measure = measures[0]
            if (measure == null) {
                return false
            }
            let query = 'INSERT INTO measures (MachineCode, PointIndex, Channel, Date_Time, Reason, FileType, FileAvailable, SyncID, FileID, Extras) VALUES '
            query += `(${measure.machineCode}, ${measure.pointIndex}, ${measure.axis}, '${measure.dateTime.toString(MySQLDateFormat)}', ${measure.reason}, 1, 1, -1, ${measure.fileID}, NULL);`
            let row = await request(query)
            if (row != null && row.insertId != null) {
                let success = await this.insertValues(measures, row.insertId)
                return returnId ? row.insertId : success
            }
            return returnId ? null : false
        } catch (error) {
            // console.log('⚠ Error insertMeasures: ', error)
            return false
        }
    },
    insertValues: async function(measures, insertId) {
        try {
            let query = `INSERT INTO measuresvalues (MeasureID, Unit, Value) VALUES `
            for (let i = 0; i < measures.length; i++) {
                const measure = measures[i]
                let measureId = insertId
                if (measureId == null || measureId <= 0) {
                    measureId = measure.measureId
                }
                query += `(${measureId}, ${measure.unit}, ${measure.value}),`
            }
            query = query.slice(0, -1)
            let success = await request(query)
            return success != null
        } catch (error) {
            // console.log('⚠ Error insertValues: ', error)
            return false
        }
    },
    truncateTable: async function(table) {
        try {
            let success = await request(`TRUNCATE TABLE ${table}`)
            return success != null
        } catch (error) {
            // console.log('⚠ Error truncateTable: ', error)
            return false
        }
    },
    // #endregion

    // #region Machine Learning
    checkAndCreateTableML: async function(showConsole = true) {
        try {
            let databaseUser = database
            if (this.userDBConnection != null && this.userDBConnection.config != null) {
                databaseUser = this.userDBConnection.config.database
            }
            if (showConsole) {
                console.log('\n**** Database: ', databaseUser, ' ****\n')
            }
            
            const tables = ['ml_clusters_config', 'ml_clusters_models']
            const fields = {
                ml_clusters_config: [
                    'ID INT(11) NOT NULL AUTO_INCREMENT',
                    'MachineCode INT(11)',
                    'PointIndex INT(11)',
                    'Axis INT(11)',
                    'Unit INT(11)',
                    'Config MEDIUMTEXT',
                    'PRIMARY KEY (ID)',
                    'INDEX indicesmlhc2 (MachineCode, PointIndex, Axis, Unit)'
                ],
                ml_clusters_models: [
                    'ID INT(11) NOT NULL AUTO_INCREMENT',
                    'ModelData MEDIUMTEXT',
                    'Cluster INT(11)',
                    'ConfigID INT(11)',
                    'PRIMARY KEY (ID)',
                    'INDEX indicesmlcm2 (ConfigID, Cluster)',
                ]
            }
            for (var table of tables) {
                let rows = await request(`SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = "${databaseUser}" AND TABLE_NAME="${table}";`)
                if (rows != null && rows[0].count == 0) {
                    if (showConsole) {
                        console.log('Table not created. Creating table ', table, '...')
                    }
                    let createTableQuery = `CREATE TABLE ${table} (${fields[table].join(',')});`
                    let success = await request(createTableQuery)
                    if (success == null) {
                        // console.log('⚠ Error creating ml table ', table)
                        return false
                    }
                } else {
                    if (showConsole) {
                        console.log('Table ' + table + ' is already created')
                    }
                }
            }
            return true
        } catch (error) {
            // console.log('⚠ Error create ml tables: ', error)
            return false
        }
    },
    getCustomData: async function(queries, onDone) {
        try {
            let response = []
            if (typeof queries === 'string') {
                queries = [{ query: queries }]
            }
            for (let q = 0; q < queries.length; q++) {
                let { rows, columns } = await request(queries[q].query, true)
                if (rows != null) {
                    let data = []
                    for (let i = 0; i < rows.length; i++) {
                        let row = []
                        for (let key in rows[i]) {
                            row.push(rows[i][key])
                        }
                        data.push(row)
                    }
                    response.push(new ErbessdSavingData.DataSet({
                        id: queries[q].id != null ? queries[q].id : q,
                        data: data,
                        columns: columns
                    }))
                }
            }
            if (onDone != null) {
                onDone(response)
            }
            // console.log('Custom Data: ', response)
            return response
        } catch (error) {
            // console.log('⚠ Error getCustomData: ', error)
            if (onDone != null) {
                onDone([])
            }
            return []
        }
    },
    executeCustom: async function(query, values = [], returnColumns = false, master = false, onDone) {
        try {
            let response = await request(query, returnColumns, master, values)
            if (onDone != null) {
                onDone(response)
            }
            return response
        } catch (error) {
            // console.log('⚠ Error executeCustom: ', error)
            if (onDone != null) {
                onDone([])
            }
            return []
        }
    },
    insertBatchExecute: async function(tableName, columns, rows) {
        try {
            if (!rows || rows.length === 0) return;

            const escapedRows = rows.map(row =>
                `(${row.map(val => mysql.escape(val)).join(', ')})`
            );

            const query = `
                INSERT INTO ${tableName} (${columns.join(', ')})
                VALUES ${escapedRows.join(', ')}
            `;

            return await request(query);
        } catch (error) {
            // console.log('⚠ Error insertBatchExecute: ', error)
            return false
        }
    },
    clearClustersConfig: async function(opts, unit) {
        try {
            let query = `DELETE FROM ml_clusters_config WHERE MachineCode=${opts.machineCode} AND PointIndex=${opts.pointIndex} AND Axis=${opts.axis} AND Unit='${unit}';`
            let success = await request(query)
            return success != null
        } catch (error) {
            // console.log('⚠ Error clearClustersConfig: ', error)
            return false
        }
    },
    insertClusters_Config: async function(config, opts) {
        try {
            let queryInsert = `INSERT INTO ml_clusters_config (MachineCode, PointIndex, Axis, Unit, Config) VALUES
                (${opts.machineCode}, ${opts.pointIndex}, ${opts.axis}, ${config.unit}, '${JSON.stringify(config)}');` // '${dateToString}'
            
            let row = await request(queryInsert)
            return row != null ? row.insertId : null
        } catch (error) {
            // console.log('⚠ Error insertClusters_Config: ', error)
            return null
        }
    },
    insertClusters_Indices: async function(id, indices) {
        try {
            let query = 'INSERT INTO ml_clusters_indices (Date_Time, Cluster, ModelID) VALUES '
            for (let i = 0; i < indices.length; i++) {
                let index = indices[i]
                query += `('${index.dateTime.toString(MySQLDateFormat)}', ${index.cluster}, ${id}),`
            }
            query = query.slice(0, -1)
            let success = await request(query)
            return success != null
        } catch (error) {
            // console.log('⚠ Error insertClusters_Indices: ', error)
            return false
        }
    },
    insertClusters_Models: async function(id, models) {
        try {
            if (models == null || models.length == 0) {
                return true
            }
            let query = 'INSERT INTO ml_clusters_models (ModelData, Cluster, ConfigID) VALUES '
            for (let m = 0; m < models.length; m++) {
                query += `('${models[m].model}', ${models[m].clusterIndex}, ${id}),`
            }
            query = query.slice(0, -1)
            let success = await request(query)
            return success != null
        } catch (error) {
            // console.log('⚠ Error insertClusters_Models: ', error)
            return false
        }
    },
    updateClusters_Models: async function(id, models) {
        try {
            // falta insertar en casos que es un nuevo modelobase64
            if (models == null || models.length == 0) {
                return true
            }
            let query = 'UPDATE ml_clusters_models SET ModelData = CASE Cluster '
            for (let m = 0; m < models.length; m++) {
                query += `WHEN ${models[m].clusterIndex} THEN '${models[m].model}' `
            }
            query += `ELSE ModelData END WHERE ConfigID = ${id};`
            let success = await request(query)
            return success != null
        } catch (error) {
            // console.log('⚠ Error insertClusters_Models: ', error)
            return false
        }
    },
    // #endregion

    // #region Saving Data
    getAll: async function(limit, order, isWiser) {
        try {
            let query = ''
            if (isWiser) {
                query = `SELECT * FROM devicesusers_db.saving_data WHERE state = 100 AND sn_device = -1 order by date ${order} limit ${limit};`
            } else {
                query = `SELECT id, sn_device, date, channel_1, channel_2, channel_3, measures, others, state, loaded_date, configs, saving_data.updated_by
                FROM saving_data INNER JOIN devices_user ON saving_data.sn_device = devices_user.sn
                LEFT JOIN databases_user ON databases_user.id_db = devices_user.db_device
                WHERE (state = 100 AND sn_device != -1) OR (state = 100 AND sn_device != -1 AND db_device=-1)
                ORDER BY date ${order} LIMIT ${limit};`
            }
            let rows = await request(query, false, true)
            return rows != null ? rows : []
        } catch (error) {
            // console.log('⚠ Error getAll: ', error)
            return []
        }
    },
    updateDataState: async function(ids, status) {
        try {
            let query = `UPDATE saving_data SET state = ${status} WHERE id IN (${ids.join(',')});`
            let success = await request(query, false, true)
            return success != null
        } catch (error) {
            // console.log('⚠ Error updateDataState: ', error)
            return false
        }
    },
    getDBDevice: async function(sn) {
        try {
            let query = `SELECT db.id_db, db.id_admin, db.db_type, db.ip as server, db.user_db as uid, 
            db.password_db as pwd, db.db_name_visible as db_user FROM databases_user AS db 
            JOIN devices_user AS usr ON db.id_db = usr.db_device WHERE sn = ${sn};`
            let rows = await request(query, false, true)
            return rows != null ? rows : []
        } catch (error) {
            // console.log('⚠ Error getDBDevice: ', error)
            return []
        }
    },
    getDataBaseById: async function(id) {
        try {
            let query = `SELECT db.id_db, db.id_admin, db.db_type, db.ip as server, db.user_db as uid, 
            db.password_db as pwd, db.db_name_visible as db_user FROM databases_user AS db 
            WHERE id_db = ${id};`
            let rows = await request(query, false, true)
            return rows != null ? rows : []
        } catch (error) {
            // console.log('⚠ Error getDataBaseById: ', error)
            return []
        }
    },
    getDeviceInfo: async function(deviceCode) {
        try {
            let query = `Select IFNULL(evc.MachineCode,-1) AS MachineCode, evc.PointIndex, evc.Axis, evc.DeviceID, 
            evc.DeviceChannel, evc.LastUpdateTime, p.MaxRPM, p.MinRPM, evc.ID, evc.Units, dvc.type AS dv_type, 
            maxHz, MinHz, dvc.enabled, evc.gpSensitivity FROM Devices AS dvc 
            LEFT JOIN  EVConfig AS evc ON evc.DeviceID = dvc.ID 
            LEFT JOIN Points AS P ON p.MachineCode = evc.MachineCode And evc.pointindex = p.PointIndex 
            WHERE dvc.Code = '${deviceCode}' AND dvc.type != 22  AND DeviceChannel NOT IN (100, 101);`
            let rows = await request(query)
            return rows != null ? rows : []
        } catch (error) {
            // console.log('⚠ Error getDeviceInfo: ', error)
            return null
        }
    },
    getFileID: async function(machinecode, pointIndex, axis, date_time) {
        try {
            let query = `SELECT ID FROM m__${machinecode}_f WHERE PointIndex=${pointIndex} AND Axis=${axis} AND Date_Time='${date_time}';`
            let rows = await request(query)
            return rows != null && rows.length > 0 ? rows[0].ID : -1
        } catch (error) {
            // console.log('⚠ Error getFileID: ', error)
            return -1
        }
    },
    updateClusters_Config: async function(config, modelData, opts) {
        try {
            let query = `UPDATE ml_clusters_config SET Config='${JSON.stringify(config)}' WHERE MachineCode=${opts.machineCode} AND PointIndex=${opts.pointIndex} AND Axis=${opts.axis} AND Unit='${config.unit}';`
            let success = await request(query)
            return success != null
        } catch (error) {
            // console.log('⚠ Error updateClusters_Config: ', error)
            return false
        }
    },
    getClustering: async function(opts) {
        try {
            const clustering = []
            let query = `SELECT config, id, unit FROM ml_clusters_config WHERE machinecode=${opts.machineCode} AND pointindex=${opts.pointIndex} AND axis=${opts.axis}`
            const results = await this.getCustomData(query)
            if (results != null && results.length > 0) {
                if (results[0].data != null && results[0].data.length > 0) {
                    for (let i = 0; i < results[0].data.length; i++) {
                        const row = results[0].data[i]
                        const config = JSON.parse(row[0])
                        if (config != null) {
                            config.id = row[1]
                            config.unit = row[2]
                            if (config.dataSplitter != null) {
                                config.dataSplitter.id = row[1]
                            }
                            clustering.push(config)
                        }
                    }
                }
            }
            return clustering
        } catch (error) {
            // console.log('⚠ Error getClustering: ', error)
            return []
        }
    },
    deleteDataIds: async function(ids) {
        try {
            let query = `DELETE FROM saving_data WHERE id IN (${ids.join(',')});`
            let success = await request(query, false, true)
            return success != null
        } catch (error) {
            // console.log('⚠ Error deleteDataIds: ', error)
            return false
        }
    }
    // #endregion
}