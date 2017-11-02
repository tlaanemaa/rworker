import EventEmitter from 'events';

export default class MockSocket extends EventEmitter {
  constructor() {
    super();

    this.encoding = null;
  }

  setEncoding(value) {
    this.encoding = value;
  }

  static write(message, encoding) {
    return {
      message,
      encoding
    };
  }
}
