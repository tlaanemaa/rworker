const { emit } = require('events').EventEmitter.prototype;

// A simple UID creation function
let lastUID = -1;
module.exports.uid = () => {
  lastUID += 1;
  return `w${Math.floor(46656 + (Math.random() * 1632959)).toString(36)}${lastUID.toString(36)}`;
};

// Emit an event on an object
module.exports.emitOn = (object, name, data) => emit.call(object, name, data);

// Break socket message blobs into messages
module.exports.forEachMessage = (messages, callback, errorCallback) => {
  const blocks = messages.split('\n');
  // Loop over the resulting blocks ignoring the empty ones
  for (let i = 0, n = blocks.length; i < n; i += 1) {
    // Extract current block and check it's length
    let currentBlock = blocks[i].trim();
    if (currentBlock.length > 0) {
      // Parse current block to JSON and emit it on worker
      try {
        currentBlock = JSON.parse(currentBlock);
        callback(currentBlock.name, currentBlock.data);
      } catch (e) {
        if (typeof errorCallback === 'function') {
          errorCallback(e);
        }
      }
    }
  }
};
