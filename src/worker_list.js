
// Workerlist class
class WorkerList {
  constructor() {
    this.workers = {};
  }

  get(uid) {
    return this.workers[uid] || null;
  }

  add(worker) {
    this.workers[worker.uid] = worker;
  }

  remove(worker) {
    delete this.workers[worker.uid];
  }
}

const workerList = new WorkerList();
export default workerList;
