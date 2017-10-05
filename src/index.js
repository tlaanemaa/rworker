const fs = require('fs');
const server = require('./server');
const worker = require('./worker');
const workerList = require('./worker_list');

module.exports.init = (rScriptPath, port = 50595) => {
  // Check if given rScriptPath exists
  fs.accessSync(rScriptPath, fs.constants.X_OK);

  // Start socket server
  server.listen(port);

  // Return worker class
  return worker(rScriptPath, port);
};

// Get all currently registered workers
module.exports.workerList = workerList;
