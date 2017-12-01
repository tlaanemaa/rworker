import { forEachMessage, setEncoding, attachHandlers, writeMessage } from '../src/socket';
import workerList from '../src/worker_list';
import MockWorker from '../__mocks__/worker';
import MockSocket from '../__mocks__/socket';

const mockMessage = '{"name": "msg1", "data": "data1"}\n{"name": "msg2", "data": "data2"}\n';
const mockBadMessage = '{"name" "msg1", "data": "data1"}\n{"name": "msg2", "data": "data2"}\n';
const mockIdentification = '{"name": "identification", "data": "mockUID"}\n';
const mockBadIdentification = '{"name": "identification", "data": "asd"}\n';
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

  test('should not throw if no errorCallback is given', () => {
    const func = jest.fn();
    const parseMessage = () => forEachMessage(mockBadMessage, func);

    expect(parseMessage).not.toThrow();
    expect(func).toHaveBeenCalledTimes(1);
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
  test('should not throw', () => {
    const mockSocket = new MockSocket();
    const attach = () => attachHandlers(mockSocket);
    expect(attach).not.toThrow();
  });

  test('should destroy unknown sockets', () => {
    const mockSocket = new MockSocket();
    attachHandlers(mockSocket);
    mockSocket.emit('data', mockMessage);
    expect(mockSocket.dead).toBe(true);
  });

  test('should destroy sockets trying to identify with unknown workers', () => {
    const mockSocket = new MockSocket();
    attachHandlers(mockSocket);

    mockSocket.emit('data', mockBadIdentification);
    expect(mockSocket.dead).toBe(true);
  });

  test('should attach a socket to it\'s worker', () => {
    const mockWorker = new MockWorker('mockUID');
    workerList.add(mockWorker);

    const mockSocket = new MockSocket();
    attachHandlers(mockSocket);

    mockSocket.emit('data', mockIdentification);
    expect(mockWorker.socket).toBe(mockSocket);

    workerList.remove(mockWorker);
  });

  test('should emit messages on it\'s worker', () => {
    const func = jest.fn();

    const mockWorker = new MockWorker('mockUID');
    mockWorker.on('msg1', func);
    workerList.add(mockWorker);

    const mockSocket = new MockSocket();
    attachHandlers(mockSocket);

    mockSocket.emit('data', mockIdentification);
    expect(mockWorker.socket).toBe(mockSocket);

    mockSocket.emit('data', mockMessage);
    expect(func).toHaveBeenCalledTimes(1);

    workerList.remove(mockWorker);
  });

  test('should detach socket from it\'s worker on close', () => {
    const mockWorker = new MockWorker('mockUID');
    workerList.add(mockWorker);

    const mockSocket = new MockSocket();
    attachHandlers(mockSocket);

    mockSocket.emit('data', mockIdentification);
    expect(mockWorker.socket).toBe(mockSocket);

    mockSocket.emit('close');
    expect(mockWorker.socket).toBe(null);
    expect(mockSocket.dead).toBe(true);

    workerList.remove(mockWorker);
  });

  test('should destroy a socket on close even if it has no worker', () => {
    const mockSocket = new MockSocket();
    attachHandlers(mockSocket);

    mockSocket.emit('close');
    expect(mockSocket.dead).toBe(true);
  });
});

describe('writeMessage function', () => {
  test('properly write data to socket', () => {
    const result = writeMessage(MockSocket, mockData);
    expect(result.message).toBe(`${JSON.stringify(mockData)}\n`);
    expect(result.encoding).toBe('utf8');
  });
});
