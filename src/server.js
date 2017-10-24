// @flow

import net from 'net';
import { attachHandlers } from './socket';
import type { Socket } from './socket';

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

  // Attach event handlers to the socket
  attachHandlers(socket);
});

// Clear statup queue after we get ready
server.on('listening', () => {
  for (let i = 0, n = startUpQueue.length; i < n; i += 1) {
    startUpQueue[i]();
  }
});

// Start the local socket server
export const listen = (port: number) => server.listen(port);

// Check if server is listening
export const whenReady = (callback: () => void) => (
  server.listening ? callback() : startUpQueue.push(callback)
);
