// @flow

import EventEmitter from 'events';

const { emit } = EventEmitter.prototype;

// A simple UID creation function
let lastUID = -1;
export const uid = () => {
  lastUID += 1;
  return `w${Math.floor(46656 + (Math.random() * 1632959)).toString(36)}${lastUID.toString(36)}`;
};

// Emit an event on an object
export const emitOn = (object: any, name: string, data: any) => emit.call(object, name, data);
