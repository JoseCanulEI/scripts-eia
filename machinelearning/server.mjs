import { spawn, exec } from 'child_process'
import path from 'path'

let server = null
let system = 'shell' // 'ubuntu' or 'shell'
async function startServer() {
    return new Promise((resolve) => {
        // Define the command to start the server
        const PROJECT_DIR = path.resolve('./'); // Ajusta si es necesario
        const folder = system === 'ubuntu' ? 'bin' : 'Scripts'
        const MACHINELEARNING_DIR = path.join(PROJECT_DIR, 'machinelearning')
        const VENV_ACTIVATE = path.join(MACHINELEARNING_DIR, '.venv', folder, 'activate')
        const PYTHON_SCRIPT = path.join(MACHINELEARNING_DIR, 'eimlws.py')
    
        // Start the server
        if (system === 'shell') {
            server = spawn('cmd.exe', ['/c', `${VENV_ACTIVATE} && python ${PYTHON_SCRIPT}`], {
                shell: true,
                cwd: MACHINELEARNING_DIR
            })
        } else {
            server = exec(`source ${VENV_ACTIVATE} && python3 ${PYTHON_SCRIPT}`, { cwd: MACHINELEARNING_DIR, shell: '/bin/bash' });
        }
        
        // Log the server output
        server.stdout.on('data', (data) => {
            console.log(`${data}`)
            resolve(true)
        })
        
        // Log any errors
        server.stderr.on('data', (data) => {
            // console.error(`stderr: ${data}`)
            resolve(true)
        })
        
        // Log when the server closes
        server.on('close', (code) => {
            // console.log(`child process exited with code ${code}`)
        })
        
        // Handle the exit signals
        process.on('SIGINT', async () => {
            // console.log('Exiting (SIGINT)')
            await endServer()
            process.exit()
        }) // Exit the process on Ctrl+C
        process.on('SIGTERM', async () => {
            // console.log('Exiting (SIGTERM)')
            await endServer()
            process.exit()
        }) // Exit the process on SIGTERM
    })
}

async function endServer() {
    if (server != null) {
        console.log('Ending server')
        return await new Promise((resolve) => {
            let command
            if (system === 'shell') {
                command = `taskkill /PID ${server.pid} /T /F`
            } else {
                command = `ps aux | grep eimlws.py | grep -v grep | awk '{print $2}' | xargs kill -9`
            }
            exec(command, (err) => {
                if (err) {
                    console.log('Error killing server: ', err)
                } else {
                    server = null
                    console.log('Server killed')
                }
                resolve(true)
            }) // Kill the server
        })
    }
    return true
}

export { startServer, endServer }