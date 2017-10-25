// @flow

import type { Socket } from 'net';
import workerList from './worker_list';
import type { R } from './worker';
import { emitOn } from './util';

type MessageHandler = (name: string, data: {}) => void;
type ErrorHandler = (err: Error) => void;

// Break socket message strings into individual messages
export const forEachMessage = (
  messages: string,
  callback: MessageHandler,
  errorCallback?: ErrorHandler
): void => {
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

// A function to attach relevant handlers to the socket
export const attachHandlers = (socket: Socket): void => {
  // This socket's worker
  // The alternative is to attach this onto the socket itself but
  // changing the socket object is undesirable
  let worker: R = null;

  // Handler for error and end cases
  const destroySocket = (): void => {
    if (worker) {
      worker.detachSocket();
    }
    socket.destroy();
  };

  // Handler for data
  const handleData = (dataString): void => forEachMessage(dataString, (name: string, data: any) => {
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
  });

  // Attach handlers
  socket.on('end', destroySocket);
  socket.on('error', destroySocket);
  socket.on('data', handleData);
};
