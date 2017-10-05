// @flow

const EventEmitter = require('events');
const path = require('path');
const { spawn } = require('child_process');
const { uid, emitOn } = require('./util');
const workerList = require('./worker_list');
const server = require('./server');

const rFilePath = path.resolve('./worker.r');

// New worker class
module.exports = (rWorkerPath, port) => class R extends EventEmitter {
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
    server.whenReady(() => {
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
        this.kill();
        emitOn(this, 'exit', code);
      });
    });
  }

  // Attach a socket to worker
  attachSocket(socket) {
    if (!this.socket) {
      this.socket = socket;
      emitOn(this, 'socket-attached', null);
    }
  }

  // Detach socket from worker
  dettachSocket() {
    if (this.socket) {
      this.socket = null;
      emitOn(this, 'socket-detached', null);
    }
  }

  // Kill this worker
  kill(signal) {
    this.dettachSocket();
    if (this.alive) {
      this.process.kill(signal);
    }
  }
};
