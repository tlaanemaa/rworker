// @flow

import type { Worker } from './worker';

// Workerlist class
class WorkerList {
  workers: { [string]: Worker };

  constructor() {
    this.workers = {};
  }

  get(uid: string) {
    return this.workers[uid] || null;
  }

  getAll() {
    return Object.keys(this.workers).map(workerId => this.workers[workerId]);
  }

  add(worker: Worker) {
    this.workers[worker.uid] = worker;
  }

  remove(worker: Worker) {
    delete this.workers[worker.uid];
  }

  killAll(): Promise<void> {
    return Promise.all(this.getAll().map(worker =>
      worker.kill()))
      .then(() => undefined);
  }
}

const workerList = new WorkerList();
export default workerList;
