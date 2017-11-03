// @flow

import fs from 'fs';
import path from 'path';
import { listen, closeServer } from './socket_server';
import worker from './worker';
import workerList from './worker_list';

export const init = (rScriptPath: string, port: number = 50595) => {
  // Resolve rWorkerPath
  const resolvedRScriptPath = path.resolve(rScriptPath);

  // Check if given rScriptPath exists
  fs.accessSync(resolvedRScriptPath, fs.constants.X_OK);

  // Start socket server
  listen(port);

  // Return worker class
  return worker(resolvedRScriptPath, port);
};

export { workerList };

export const closeAll = (): Promise<void> => Promise.all([
  closeServer(),
  workerList.stopAll()
]).then(() => undefined);
