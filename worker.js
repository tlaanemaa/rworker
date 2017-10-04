const EventEmitter = require('events');
const emit = EventEmitter.prototype.emit;
const path = require('path');
const { spawn } = require('child_process');
const rFilePath = path.resolve('./worker.r');

// Simple UID generating utility
const uid = (function () {
  // Store the last UID so we can increment it
  let lastWorkerUID = -1;

  // Return the function that will be generating UIDs
  return () => {
    lastWorkerUID += 1;
    return `w${Math.floor(46656 + Math.random() * 1632959).toString(36)}${lastWorkerUID.toString(36)}`;
  }
}());

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
    server.addWorker(this);

    // Wait for the server to get ready
    server.whenReady(() => {
      // Start child process
      this.process = spawn(rWorkerPath, [rFilePath, workerFile, this.uid, port]);

      // Set stdout listener
      this.process.stdout.on('data', data =>
        emit.call(this, 'stdout', data.toString())
      );

      // Set stderr listener
      this.process.stderr.on('data', data =>
        emit.call(this, 'stderr', data.toString())
      );

      // Set exit listener
      this.process.on('exit', (code) => {
        this.alive = false;
        server.removeWorker(this);
        emit.call(this, 'exit', data.toString());
      });
    });
  }

  // Emit event to R
  emit(name, data) {
    
  }

  // Kill this worker
  kill(signal) {
    if (this.alive) {
      this.process.kill(signal);
    }
  }

}
