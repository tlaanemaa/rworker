import { forEachMessage, setEncoding, attachHandlers, writeMessage } from '../src/socket';
import MockSocket from '../__mocks__/socket';

const mockMessage = '{"name": "msg1", "data": "data1"}\n{"name": "msg2", "data": "data2"}';
const mockBadMessage = '{"name" "msg1", "data": "data1"}\n{"name": "msg2", "data": "data2"}';
const mockData = {
  name: 'msg1',
  data: 'hello\nworld'
};

describe('forEachMessage function', () => {
  test('should call callback for each message line', () => {
    const func = jest.fn();
    forEachMessage(mockMessage, func);
    expect(func).toHaveBeenCalledTimes(2);
  });

  test('should trigger errorCallback on error', () => {
    const func = jest.fn();
    const errorFunc = jest.fn();
    forEachMessage(mockBadMessage, func, errorFunc);

    expect(func).toHaveBeenCalledTimes(1);
    expect(errorFunc).toHaveBeenCalledTimes(1);
  });
});

describe('setEncoding function', () => {
  test('sets encoding properly', () => {
    const mockSocket = new MockSocket();
    setEncoding(mockSocket);
    expect(mockSocket.encoding).toBe('utf8');
  });
});

describe('attachHandlers function', () => {
  const mockSocket = new MockSocket();

  test('should not throw', () => {
    const attach = () => attachHandlers(mockSocket);
    expect(attach).not.toThrow();
  });

  test('set data handler should not throw', () => {
    const emitData = () => mockSocket.emit('data', mockMessage);
    expect(emitData).not.toThrow();
  });

  test('set close handler should not throw', () => {
    const emitClose = () => mockSocket.emit('close', null);
    expect(emitClose).not.toThrow();
  });
});

describe('writeMessage function', () => {
  test('properly write data to socket', () => {
    const result = writeMessage(MockSocket, mockData);
    expect(result.message).toBe(`${JSON.stringify(mockData)}\n`);
    expect(result.encoding).toBe('utf8');
  });
});
