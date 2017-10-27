// @flow

import type { Socket } from 'net';
import workerList from './worker_list';
import type { Message } from './worker';
import { emitOn } from './util';

// Break socket message strings into individual messages
export const forEachMessage = (
  messages: string,
  callback: (name: string, data: {}) => void,
  errorCallback?: (err: Error) => void
) => {
  // Split the blocks and loop over them
  messages.split('\n').forEach((message) => {
    if (message.trim().length > 0) {
      // Parse the message in a try-catch to avoid errors
      try {
        const parsedMessage = JSON.parse(message);
        callback(parsedMessage.name, parsedMessage.data);
      } catch (e) {
        if (typeof errorCallback === 'function') {
          errorCallback(e);
        }
      }
    }
  });
};

// Set socket encoding
export const setEncoding = (socket: Socket) => socket.setEncoding('utf8');

// A function to attach relevant handlers to the socket
export const attachHandlers = (socket: Socket) => {
  // This socket's worker
  // The alternative is to attach this onto the socket itself but
  // changing the socket object is undesirable
  let worker = null;

  // Attach socket close handler that will detach the socket
  // from its worker and then destroy it
  socket.on('close', () => {
    if (worker) {
      worker.detachSocket();
    }
    socket.destroy();
  });

  // Attach socket data handler that will parse the received data and then
  // emit relevant messages on the worker
  // It also handles socket identification and destroys unidentified sockets
  socket.on('data', dataString => forEachMessage(dataString, (name: string, data: any) => {
    if (worker) {
      // If this socket does have a worker, raise the msaage as an event on it
      emitOn(worker, name, data);
    } else if (
      !worker &&
      name === 'identification'
    ) {
      // If this socket is trying to identify itself then do that
      const requestedWorker = workerList.get(data);
      if (requestedWorker) {
        requestedWorker.attachSocket(socket);
        worker = requestedWorker;
      } else {
        // Destroy all sockets trying to identify with an unknown worker
        socket.destroy();
      }
    } else {
      // Destroy all unknown sockets that arent trying to identify
      socket.destroy();
    }
  }));
};

// A helper function to write to the socket
export const writeMessage = (socket: Socket, message: Message) =>
  socket.write(`${JSON.stringify(message)}\n`, 'utf8');
