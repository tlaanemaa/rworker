import EventEmitter from 'events';

export default class MockSocket extends EventEmitter {
  constructor() {
    super();

    this.encoding = null;
    this.dead = false;
    this.remoteAddress = '::1';
  }

  setEncoding(value) {
    this.encoding = value;
  }

  destroy() {
    this.dead = true;
  }

  static write(message, encoding) {
    return {
      message,
      encoding
    };
  }
}
