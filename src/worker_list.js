// @flow

import type { R } from './worker';

// Workerlist class
class WorkerList {
  workers: { [string]: R };

  constructor() {
    this.workers = {};
  }

  get(uid: string) {
    return this.workers[uid] || null;
  }

  getAll() {
    return Object.keys(this.workers).map(workerId => this.workers[workerId]);
  }

  add(worker: R) {
    this.workers[worker.uid] = worker;
  }

  remove(worker: R) {
    delete this.workers[worker.uid];
  }

  stopAll(): Promise<void> {
    return Promise.all(this.getAll().map(worker =>
      worker.kill()))
      .then(() => undefined);
  }
}

const workerList = new WorkerList();
export default workerList;
