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

  add(worker: R): void {
    this.workers[worker.uid] = worker;
  }

  remove(worker: R): void {
    delete this.workers[worker.uid];
  }

  // Check if a given worker exists
  exists(uid: string): boolean {
    return this.workers[uid] !== 'undefined';
  }
}

const workerList = new WorkerList();
export default workerList;
