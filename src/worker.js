// @flow

import { EventEmitter } from 'events';
import path from 'path';
import { spawn } from 'child_process';
import { uid, emitOn } from './util';
import workerList from './worker_list';
import { whenReady } from './server';

const rFilePath = path.resolve('./worker.r');

// New worker class
export default (rWorkerPath, port) => class R extends EventEmitter {
  constructor(workerFile) {
    super();

    // Initial setup
    this.workerFile = workerFile;
    this.alive = true;
    this.socket = null;
    this.uid = uid();

    // Register this worker
    workerList.add(this);

    // Wait for the server to get ready
    whenReady(() => {
      // Start child process
      this.process = spawn(rWorkerPath, [rFilePath, workerFile, this.uid, port]);

      // Set process events
      this.process.stdout.on(
        'data',
        data => emitOn(this, 'stdout', data.toString())
      );

      this.process.stderr.on(
        'data',
        data => emitOn(this, 'stderr', data.toString())
      );

      this.process.on('exit', (code) => {
        this.alive = false;
        this.cleanup();
        emitOn(this, 'exit', code);
      });
    });
  }

  // Attach a socket to worker. Only used by socket class to attach itself
  attachSocket(socket) {
    if (!this.socket) {
      this.socket = socket;
      emitOn(this, 'socket-attached', null);
    }
  }

  // Detach socket from worker. Only used by socket class to detach itself
  detachSocket() {
    if (this.socket) {
      this.socket = null;
      emitOn(this, 'socket-detached', null);
    }
  }

  // Kill this worker
  kill(signal) {
    if (this.alive) {
      this.alive = false;
      this.process.kill(signal);
    }
  }

  // Clean up this worker, used after it has been killed
  cleanup() {
    if (!this.alive) {
      if (this.socket) {
        this.socket.destroy();
      }
      this.process = null;
      workerList.remove(this);
    }
  }
};
