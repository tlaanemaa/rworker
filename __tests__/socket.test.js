const socket = require('../src/socket');

describe('forEachMessage function', () => {
  const { forEachMessage } = socket;
  const mockMessage = '{"name": "msg1", "data": "data1"}\n{"name": "msg2", "data": "data2"}';

  test('should call callback for each message line', () => {
    const func = jest.fn();
    forEachMessage(mockMessage, func);
    expect(func).toHaveBeenCalledTimes(2);
  });
});

describe('setEncoding function', () => {
  const { setEncoding } = socket;

  test('sets encoding properly', () => {
    const mockSocket = {
      encoding: null,
      setEncoding(value) {
        this.encoding = value;
      }
    };
    setEncoding(mockSocket);
    expect(mockSocket.encoding).toBe('utf8');
  });
});
