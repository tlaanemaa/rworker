// @flow

import fs from 'fs';
import { listen } from './server';
import worker from './worker';
import workerList from './worker_list';

export const init = (rScriptPath: string, port: number = 50595) => {
  // Check if given rScriptPath exists
  fs.accessSync(rScriptPath, fs.constants.X_OK);

  // Start socket server
  listen(port);

  // Return worker class
  return worker(rScriptPath, port);
};

// Get all currently registered workers
export { workerList };
