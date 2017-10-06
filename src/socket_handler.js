// @flow

import type { Socket } from 'net';
import workerList from './worker_list';
import type { R } from './worker';
import { emitOn, forEachMessage } from './util';

class SocketWrapper {
  baseSocket: Socket;
  worker: R;

  constructor(baseSocket: Socket) {
    this.baseSocket = baseSocket;
    this.worker = null;

    // Set socket encoding
    this.baseSocket.setEncoding('utf8');

    // Handle socket events
    this.baseSocket.on(
      'end',
      this.detachWorker.bind(this)
    );

    this.baseSocket.on(
      'error',
      this.detachWorker.bind(this)
    );

    this.baseSocket.on(
      'data',
      data => forEachMessage(data, this.handleData.bind(this))
    );
  }

  // Check if this socket is attached
  isAttached() {
    return this.worker && this.worker.alive;
  }

  // Attach to a worker
  attachWorker(uid) {
    const worker = workerList.get(uid);
    if (worker) {
      this.worker = worker;
      worker.attachSocket(this);
      return true;
    }
    return false;
  }

  // Detach from a worker
  detachWorker() {
    if (this.worker) {
      this.worker.detachSocket();
      this.worker = null;
    }
  }

  // Destroy socket
  destroy() {
    this.detachWorker();
    this.baseSocket.destroy();
  }

  // Handle socket data
  handleData(name, message) {
    if (this.isAttached()) {
      // If socket is attached, send the event to worker
      emitOn(this.worker, name, message);
    } else if (
      message !== 'identification' ||
      !this.attachWorker(message)
    ) {
      // If the socket tries to identify itself then try to do that
      // If identification fails, kill the socket
      this.destroy();
    }
  }
}

// Exposed method for handling sockets
export default (socket: Socket) => new SocketWrapper(socket);
export type { SocketWrapper };
