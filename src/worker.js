// @flow

import EventEmitter from 'events';
import path from 'path';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import type { Socket } from 'net';
import { uid, emitOn } from './util';
import workerList from './worker_list';
import { whenReady } from './socket_server';
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
  socket: null | Socket;
  socketQueue: Array<Message>;
  uid: string;
  process: null | ChildProcess;
  killTimeout: null | number;
  exitCallback: null | () => void;

  constructor(workerFile: string) {
    super();

    // Initial setup
    this.workerFile = path.resolve(workerFile);
    this.alive = true;
    this.socket = null;
    this.socketQueue = [];
    this.uid = uid();
    this.killTimeout = null;
    this.exitCallback = null;

    // Register this worker
    workerList.add(this);

    // Wait for the server to get ready
    whenReady().then(() => {
      // Start child process
      this.process = spawn(rWorkerPath, [rFilePath, this.workerFile, this.uid, String(port)]);

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
  emit(event: string, ...args:Array<any>) {
    // Reject emits if worker is dead
    if (!this.alive) {
      return false;
    }

    // Create data object
    const message = { event, data: args };

    // If we have a socket then write to it
    if (this.socket) {
      writeMessage(this.socket, message);
    } else {
      this.socketQueue.push(message);
    }

    return true;
  }

  // Attach a socket to worker. Only used by socket class to attach itself
  attachSocket(socket: Socket) {
    if (!this.socket) {
      this.socket = socket;
      this.flushSocketQueue();
      emitOn(this, 'socket-attached', null);
    }
  }

  // Flush socket queue
  flushSocketQueue() {
    if (this.socket) {
      while (this.socketQueue.length > 0) {
        writeMessage(this.socket, this.socketQueue.shift());
      }
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
  kill(signal?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (
        this.alive
      ) {
        // Set a timeout to handle cases where the worker cant be killed for some reason
        this.killTimeout = setTimeout(
          () => reject(new Error('Worker killing timed out!')),
          10000
        );

        // Store the resolve function so cleanup method can call it
        this.exitCallback = resolve;

        // Set the worker to dead state and kill it
        this.alive = false;
        if (this.process) {
          this.process.kill(signal);
        }
      } else {
        // Already dead or no process -> reject
        reject();
      }
    });
  }

  // Clean up this worker, used after it has been killed
  cleanup() {
    if (!this.alive) {
      // Clear the killTimeout
      clearTimeout(this.killTimeout);

      // Drop the socket if we have one
      if (this.socket) {
        this.socket.destroy();
        this.socket = null;
      }

      // Remove reference to the process and remove this worker from workerlist
      this.process = null;
      workerList.remove(this);

      // Call exitCallback if we have one
      if (typeof this.exitCallback === 'function') {
        this.exitCallback();
      }
    }
  }
};

// Export r worker type
export type R = R;
