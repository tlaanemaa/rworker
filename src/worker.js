// @flow

import EventEmitter from 'events';
import path from 'path';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import { uid, emitOn } from './util';
import workerList from './worker_list';
import { whenReady } from './server';
import type { SocketWrapper } from './socket_handler';

const rFilePath = path.resolve('./worker.r');

// New worker class
export default (rWorkerPath: string, port: number) => class R extends EventEmitter {
  workerFile: string;
  alive: boolean;
  socket: SocketWrapper | null;
  uid: string;
  process: ChildProcess | null;

  constructor(workerFile: string) {
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
      this.process = spawn(rWorkerPath, [rFilePath, workerFile, this.uid, String(port)]);

      // Set process events (all this weird if stuff is to make flow happy)
      if (this.process) {
        this.process.stdout.on(
          'data',
          data => emitOn(this, 'stdout', data.toString())
        );
      }

      if (this.process) {
        this.process.stderr.on(
          'data',
          data => emitOn(this, 'stderr', data.toString())
        );
      }

      if (this.process) {
        this.process.on('exit', (code) => {
          this.alive = false;
          this.cleanup();
          emitOn(this, 'exit', code);
        });
      }
    });
  }

  // Attach a socket to worker. Only used by socket class to attach itself
  attachSocket(socket: SocketWrapper): void {
    if (!this.socket) {
      this.socket = socket;
      emitOn(this, 'socket-attached', null);
    }
  }

  // Detach socket from worker. Only used by socket class to detach itself
  detachSocket(): void {
    if (this.socket) {
      this.socket = null;
      emitOn(this, 'socket-detached', null);
    }
  }

  // Kill this worker
  kill(signal: string): void {
    if (
      this.alive &&
      this.process
    ) {
      this.alive = false;
      this.process.kill(signal);
    }
  }

  // Clean up this worker, used after it has been killed
  cleanup(): void {
    if (!this.alive) {
      if (this.socket) {
        this.socket.destroy();
      }
      this.process = null;
      workerList.remove(this);
    }
  }
};

// Export r worker type
export type R = R;
