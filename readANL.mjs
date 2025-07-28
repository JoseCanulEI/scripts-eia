import fs from 'fs/promises'
const CURRENT_FILE_VERSION = 102
const VERSION_102_HEADER_SIZE = 34

export class readANL {
    static async readBase64File(base64) {
        // const byteCharacters = atob(base64)
        // const byteNumbers = new Array(byteCharacters.length)
        // for (let i = 0; i < byteCharacters.length; i++) {
        //     byteNumbers[i] = byteCharacters.charCodeAt(i)
        // }

        // const byteArray = new Uint8Array(byteNumbers)
        return new Promise((resolve, reject) => {
            this.parseBinaryFile(base64, function(result) {
                resolve(result)
            })
        })
    }
    static parseBinaryFile(arrayBuffer, whenLoad, readHeaderOnly = false) {
        const fileArray = new Uint8Array(arrayBuffer)
        const dataView = new DataView(fileArray.buffer)
        let version = fileArray[0]
        let channelCount = dataView.getInt16(2, true)   
        let sampleRate = dataView.getUint32(4, true)
        let calibration = dataView.getFloat32(8, true)
        let sensitivity = dataView.getFloat32(12, true)
        let sensorType = dataView.getUint16(16, true)
        let currentDate = dataView.getFloat64(18, true)
        let currentDateBigUint = dataView.getBigUint64(18, true)
        let machineCode = dataView.getInt32(26, true)
        let pointIndex = dataView.getInt16(30, true)
        let axis = dataView.getInt16(32, true)
        let filePos = version === 6 ? 51 : VERSION_102_HEADER_SIZE
        if(version === 6) {
            channelCount = 1
            // filePos= 51 //version_6_header_size 
            sampleRate = dataView.getUint32(1, true)
            calibration = dataView.getFloat64(5, true)
            sensitivity = dataView.getFloat32(13, true)
            sensorType = dataView.getUint16(17, true)
            // const mms =  dataView.getFloat64(19, true)
            // const g =  dataView.getFloat64(27, true)
            // const ge =  dataView.getFloat64(35, true)
            currentDate = dataView.getBigUint64(43, true)
            machineCode = -1
            pointIndex = -1
            axis = -1
        } else if (version < 100) { 
            version = -1
        }
        const sampleCount = (fileArray.length - filePos) / 2 / channelCount
        
        let data = new Array(channelCount)
        // console.log("file Len", fileArray.length, "Channel count", channelCount, "sample Count", sampleCount)

        if(readHeaderOnly !== true) {
            for (let iChannel = 0; iChannel < channelCount; iChannel++)  {
                data[iChannel] = new Array(sampleCount)
                for (var iSample = 0; iSample < sampleCount; iSample++) {
                    data[iChannel][iSample] = dataView.getInt16(filePos, true)
                    filePos += 2
                }
            }
        }
        
        whenLoad({
            version: version,
            data: data,
            channelCount: channelCount,
            sampleRate: sampleRate,
            calibration: calibration,
            sensitivity: sensitivity,
            sensorType: sensorType,
            currentDate: currentDate,
            currentDateBigUint: currentDateBigUint,
            machineCode: machineCode,
            pointIndex: pointIndex,
            axis: axis,
            getFormatedDate(){
                let date = new Date(this.currentDate * 1000)
                return date
            }
        })
    }

    static bytesToShorts(values) {
        const ret = []
        if (values.length > 100) {
            for (let i = 0; i < values.length; i += 2) {
                ret.push(values.readInt16LE(i))
            }
        }
        return ret
    }

    static async PasoTxtError(date, obj, estatus, append = true) {
        try {
            let path = 'D:\\Datalog\\SavingDataML.txt'
            // const writeOptions = append ? { flags: 'a' } : {}
            const line = `{ "DateTime": "${date}", "Error": "${obj}", "Estatus": "${estatus}" }\n`
            
            // await fs.writeFile(path, line, writeOptions)
            if (append) {
                await fs.appendFile(path, line); // ✅ Append correctamente
            } else {
                await fs.writeFile(path, line);  // ❗ Sobrescribe
            }
        } catch (error) {

        }
    }

    static async leer_binario(file) {
        let signal = []
        let obj = await this.readBase64File(file)
        let channelCount = obj.channelCount
        let machineCode = obj.machineCode
        let pointIndex = obj.pointIndex
        let axis = parseInt(obj.axis)
        let channelRefIndex = -1
        if (channelCount === 2) {
            channelRefIndex = 1
        } else if (channelCount === 4) {
            channelRefIndex = 3
        }

        for (let i = 0; i < channelCount; i++) {
            const objSignal = {}
            objSignal.sampleRate = obj.sampleRate
            objSignal.calibration = obj.calibration
            objSignal.sensitivity = obj.sensitivity
            objSignal.sensorType = obj.sensorType
            objSignal.machineCode = machineCode
            objSignal.pointIndex = pointIndex
            if (axis != -1 && axis != 100) {
                if (channelRefIndex > -1 && i === channelRefIndex) {
                    objSignal.axis = 4
                } else {
                    let subsAxis = axis.toString().substring(i, i + 1)
                    objSignal.axis = parseInt(subsAxis)
                }
            } else {
                if (channelRefIndex > -1 && i === channelRefIndex) {
                    objSignal.axis = 4
                } else {
                    objSignal.axis = axis
                }
            }
            objSignal.data = obj.data[i]
            signal.push(objSignal)
        }

        return signal
    }
}