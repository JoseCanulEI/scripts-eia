import { Worker } from 'worker_threads';
import os from 'os';

export default class WorkerPool {
  constructor(maxWorkers = os.cpus().length) {
    this.maxWorkers = maxWorkers;
    this.queue = [];
    this.activeWorkers = 0;
    this.workers = []
    this.waitingResolve = null

    for (let i = 0; i < this.maxWorkers; i++) {
      this.workers[i] = {
        worker: new Worker('./workers/worker.mjs'),
        busy: false
      }

      this.workers[i].worker.on('message', (result) => {
        this.workers[i].busy = false

        console.log("Worker thread done", this.workers[i].worker.threadId)
        if (this.waitingResolve) {
          console.log("Resolving waiting promise")
          this.waitingResolve()
          this.waitingResolve = null
        }
      })

      this.workers[i].worker.on('error', (error) => {
        console.log("Worker error: ", error)
      })
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }


  async waitForAllWorkers() {
    let someBusy = true

    while (someBusy) {

      someBusy = false
      for (let i = 0; i < this.maxWorkers; i++) {
        if (this.workers[i].busy) {
          someBusy = true
          break
        }
      }

      if (someBusy)
        await this.sleep(500)
    }
  }

  async runTask(workerData) {
    let allBusy = true;
    for (let i = 0; i < this.maxWorkers; i++) {
      if (!this.workers[i].busy) {
        allBusy = false
        break
      }
    }

    let promise = new Promise((resolve, reject) => {
      if (allBusy) {
        console.log("Waiting for worker thread")
        this.waitingResolve = resolve
      } else {
        resolve()
      }
    })

    await promise

    for (let i = 0; i < this.maxWorkers; i++) {
      if (!this.workers[i].busy) {
        console.log("Sending worker data to thread", this.workers[i].worker.threadId)
        this.workers[i].worker.postMessage(workerData)
        this.workers[i].busy = true
        break
      }
    }
  }
}
