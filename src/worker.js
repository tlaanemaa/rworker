// @flow

import EventEmitter from 'events';
import path from 'path';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import type { Socket } from 'net';
import { uid, emitOn } from './util';
import workerList from './worker_list';
import { whenReady } from './server';
import { writeMessage } from './socket';

const rFilePath = path.resolve('./worker.r');

export type Message = {
  event: string,
  data: Array<any>
};

// New worker class
export default (rWorkerPath: string, port: number) => class R extends EventEmitter {
  workerFile: string;
  alive: boolean;
  socket: Socket | null;
  socketQueue: Array<Message>;
  uid: string;
  process: ChildProcess | null;

  constructor(workerFile: string) {
    super();

    // Initial setup
    this.workerFile = workerFile;
    this.alive = true;
    this.socket = null;
    this.socketQueue = [];
    this.uid = uid();

    // Register this worker
    workerList.add(this);

    // Wait for the server to get ready
    whenReady().then(() => {
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

  // Emit events on the worker
  emit(event: string, ...args:Array<any>): boolean {
    // Reject emits if worker is dead
    if (!this.alive) {
      return false;
    }

    // Create data object
    const message: Message = { event, data: args };

    // If we have a socket then write to it
    if (this.socket) {
      writeMessage(this.socket, message);
    } else {
      this.socketQueue.push(message);
    }

    return true;
  }

  // Attach a socket to worker. Only used by socket class to attach itself
  attachSocket(socket: Socket): void {
    if (!this.socket) {
      this.socket = socket;
      this.flushSocketQueue();
      emitOn(this, 'socket-attached', null);
    }
  }

  // Flush socket queue
  flushSocketQueue(): void {
    if (this.socket) {
      while (this.socketQueue.length > 0) {
        writeMessage(this.socket, this.socketQueue.shift());
      }
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
  kill(signal?: string): void {
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
        this.socket = null;
      }
      this.process = null;
      workerList.remove(this);
    }
  }
};

// Export r worker type
export type R = R;
