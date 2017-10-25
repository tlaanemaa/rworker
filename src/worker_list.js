// @flow

import type { R } from './worker';

// Workerlist class
class WorkerList {
  workers: { [string]: R };

  constructor() {
    this.workers = {};
  }

  get(uid: string): R | null {
    return this.workers[uid] || null;
  }

  getAll(): Array<R> {
    return Object.keys(this.workers).map(workerId => this.workers[workerId]);
  }

  add(worker: R): void {
    this.workers[worker.uid] = worker;
  }

  remove(worker: R): void {
    delete this.workers[worker.uid];
  }

  stopAll() {
    return Promise.all(this.getAll().map(worker => new Promise((resolve, reject) => {
      worker.on('exit', () => resolve(null));
      setTimeout(() => reject(new Error('Worker killing timed out!')), 10000);
      worker.kill();
    })));
  }
}

const workerList = new WorkerList();
export default workerList;
