import { forEachMessage, setEncoding, writeMessage } from '../src/socket';
import MockSocket from '../__mocks__/socket';

describe('forEachMessage function', () => {
  const mockMessage = '{"name": "msg1", "data": "data1"}\n{"name": "msg2", "data": "data2"}';

  test('should call callback for each message line', () => {
    const func = jest.fn();
    forEachMessage(mockMessage, func);
    expect(func).toHaveBeenCalledTimes(2);
  });
});

describe('setEncoding function', () => {
  test('sets encoding properly', () => {
    const mockSocket = new MockSocket();
    setEncoding(mockSocket);
    expect(mockSocket.encoding).toBe('utf8');
  });
});

// TODO: attachHandlers tests

describe('writeMessage function', () => {
  const mockData = {
    name: 'msg1',
    data: 'hello\nworld'
  };

  test('properly write data to socket', () => {
    const result = writeMessage(MockSocket, mockData);
    expect(result.message).toBe(`${JSON.stringify(mockData)}\n`);
    expect(result.encoding).toBe('utf8');
  });
});
