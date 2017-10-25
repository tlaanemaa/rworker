// @flow

import net from 'net';
import type { Socket } from 'net';
import { attachHandlers, setEncoding } from './socket';

// List of currently active sockets
let socketCounter = 0;
const activeSockets: { [string]: Socket } = {};

// A queue for startup events while server is not yet ready
const startUpQueue = [];

// Check if ip is localhost
function isValidIP(address: any): boolean {
  return (
    address === '127.0.0.1' ||
    address === '::ffff:127.0.0.1'
  );
}

// Create local socket server for communication between R and Node.js
const server = net.createServer((socket: Socket) => {
  // Kill all connections that are not from localhost
  if (!isValidIP(socket.remoteAddress)) {
    socket.destroy();
  }

  // Set socket encoding
  setEncoding(socket);

  // Add the new socket to active sockets list
  socketCounter += 1;
  const socketId = `s${socketCounter}`;
  activeSockets[socketId] = socket;

  // Add close listener to socket so we can remove it once it closes
  socket.on('close', () => delete activeSockets[socketId]);

  // Attach event handlers to the socket
  attachHandlers(socket);
});

// Clear statup queue after we get ready
server.on('listening', () => {
  while (startUpQueue.length > 0) {
    startUpQueue.shift()();
  }
});

// Start the local socket server
export const listen = (port: number) => server.listen(port);

// Check if server is listening
export const whenReady = (callback: () => void) => (
  server.listening ? callback() : startUpQueue.push(callback)
);

// Stop server
export const closeServer = (): Promise<void> => new Promise((resolve) => {
  server.close(() => {
    server.unref();
    resolve();
  });
  Object.keys(activeSockets).forEach((socketId) => {
    activeSockets[socketId].destroy();
    delete activeSockets[socketId];
  });
});
