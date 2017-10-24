// @flow

import workerList from './worker_list';
import { emitOn } from './util';

type MessageHandler = (name: string, data: {}) => void;
type ErrorHandler = (err: Error) => void;
export type Socket = {
  remoteAddress: string,
  workerUID: string,
  destroy: () => void,
  on: (name: string, callback: (data: any) => void) => void
};

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

// Error and end message handler
function handleEndAndError(socket: Socket) {
  const worker = socket.workerUID ? workerList.get(socket.workerUID) : null;
  if (worker) {
    worker.detachSocket();
  }
  socket.destroy();
}

// Data handler
function handleData(
  socket: Socket,
  dataString: string
): void {
  forEachMessage(dataString, (name: string, data: any) => {
    // Get a reference to this socket's attached worker
    const worker = socket.workerUID ? workerList.get(socket.workerUID) : null;

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
      }
    } else {
      // Destroy all unknown sockets that arent trying to identify
      socket.destroy();
    }
  });
}

// A function to attach relevant handlers to the socket
export const attachHandlers = (socket: Socket): void => {
  socket.on(
    'end',
    () => handleEndAndError(socket)
  );

  socket.on(
    'error',
    () => handleEndAndError(socket)
  );

  socket.on(
    'data',
    data => handleData(socket, data)
  );
};
