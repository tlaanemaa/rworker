import EventEmitter from 'events';

export default class Worker extends EventEmitter {
  constructor(uid) {
    super();

    this.uid = uid;
    this.socket = null;
  }

  attachSocket(socket) {
    this.socket = socket;
  }

  detachSocket() {
    this.socket = null;
  }
}
