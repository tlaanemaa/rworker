const net = require('net');
const EventEmitter = require('events');
const emit = EventEmitter.prototype.emit;
const workersList = {}; // TODO: Separate workerlist to its own file
const startUpQueue = [];

// Emit a message on a worker by id
function emitOnWorker(uid, name, data) {
  if (workersList[uid]) {
    emit(workersList[uid], name, data);
  }
}

// Socket data stream parser
function parseSocketStream(data, callback) {
  // Cut data on newline
  const blocks = data.split('\n');
  // Loop over the resulting blocks ignoring the empty ones
  for (let i = 0, n = blocks.length; i < n; i++) {
    let currentBlock = blocks[i].trim();
    if (currentBlock.length > 0) {
      callback(JSON.parse(currentBlock)); // TODO: This needs a try-catch
    }
  }
}

// Attach socket to a worker
function attachSocket(uid, socket) {
  const worker = workersList[uid];
  if (worker) {
    socket.workerUID = uid;
    worker.socket = socket; // TODO: write methods for this on worker
    emitOnWorker(uid, 'socket-attached', null);
  }
}

// Detatch socket from a worker
function detachSocket(uid) {
  const worker = workersList[uid];
  if (worker) {
    socket.workerUID = null;
    worker.socket = null;  // TODO: write methods for this on worker
  }
}

// Check socket identification
function isIdentified(socket) {
  return (
    socket.workerUID &&
    workersList[socket.workerUID] &&
    workesList[socker.workerUID].alive
  );
}

// Check if socket can be identified
function canBeIdentified(uid) {
  return (
    workersList[uid] &&
    workersList[uid].alive
  )
}

// Check if ip is localhost
function isLocalhost(address) {
  return (
    address === '127.0.0.1' ||
    address === '::ffff:127.0.0.1'
  )
}

// Create local socket server for communication between R and Node.js
const server = net.createServer((socket) => {
  // TODO: Write a wrapper class for sockets since they have alot of specific functionality

  // Kill all connections that are not from localhost
  if (!isLocalhost(socket.remoteAddress)) {
    socket.destroy();
  }

  // Set all sockets to output their data in utf8
  sock.setEncoding('utf8');

  // Handle socket ends
  socket.on('end', () => {
    detachSocket(this);
  });

  // Handle socket errors
  socket.on('error', () => {
    detachSocket(this);
  });

  // Handle socket messages
  socket.on('data', (data) => {
    parseSocketStream(data, (message) => {
      if (isIdentified(this)) {
        // Emit data messages on worker object
        emitOnWorker(this.workerUID, message.name, message.data);

      } else if (
        message.name === 'identification' &&
        canBeIdentified(message.data)
      ) {
        // Register new socket
        attachSocket(message.data, this);

      } else {
        // Kill unidentified sockets
        this.write('rejected\n', 'utf8');
        this.destroy();
      }
    });
  });

});

// Clear statup queue after we get ready
server.on('listening', () => {
  for (var i = 0, n = startUpQueue.length; i < n; i++) {
    startUpQueue[i]();
  }
})

// Start the local socket server
module.exports.listen = (port) => server.listen(port);

// Check if server is listening
module.exports.whenReady = (callback) => (
  server.listening ? callback() : startUpQueue.push(callback)
);

// Simple method to get all currently registered workers
module.exports.getWorkers = () => workersList;

// Add a new worker
module.exports.addWorker = (worker) => {
  workersList[worker.uid] = workersList;
}

// Remove worker
module.exports.removeWorker = (worker) => {
  delete workersList[worker.uid];
}
