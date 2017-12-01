import net from 'net';
import {
  activeSockets,
  isValidIP,
  whenReady,
  startUpQueue,
  listen,
  connectionListener,
  server,
  closeServer
} from '../src/socket_server';
import MockSocket from '../__mocks__/socket';

const clearActiveSockets = () => {
  Object.keys(activeSockets).forEach((socketId) => {
    activeSockets[socketId].destroy();
    delete activeSockets[socketId];
  });
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

afterAll(() => closeServer());

describe('validIP function', () => {
  test('should return false', () => {
    expect(isValidIP('192.168.1.1')).toBe(false);
  });

  test('should return true', () => {
    expect(isValidIP('::1')).toBe(true);
  });
});

describe('whenReady function', () => {
  test('should add messages to startupQueue', () => {
    expect(startUpQueue.length).toBe(0);
    whenReady();
    expect(startUpQueue.length).toBe(1);
  });
});

describe('connectionListener', () => {
  test('should block connections from invalid addresses', () => {
    const mockSocket = new MockSocket();
    mockSocket.remoteAddress = '192.168.1.1';
    connectionListener(mockSocket);
    expect(mockSocket.dead).toBe(true);
    clearActiveSockets();
  });

  test('should set new socket\'s encoding', () => {
    const mockSocket = new MockSocket();
    connectionListener(mockSocket);
    expect(mockSocket.encoding).toBe('utf8');
    clearActiveSockets();
  });

  test('should remove socket from activeSockets when it closes', () => {
    expect(activeSockets).toEqual({});

    const mockSocket = new MockSocket();
    connectionListener(mockSocket);

    mockSocket.emit('close');
    expect(activeSockets).toEqual({});
  });
});

describe('server', () => {
  test('should be instance of net server class', () => {
    expect(server instanceof net.Server).toBe(true);
  });

  test('should flush queue when started', (done) => {
    const callback = () => done();
    whenReady().then(callback);
    listen(54321);
    return wait(2000).then(() => expect(callback).toHaveBeenCalled());
  });
});

describe('closeServer function', () => {
  test('should destroy and remove all sockets from activeSockets', () => {
    const mockSocket1 = new MockSocket();
    const mockSocket2 = new MockSocket();

    connectionListener(mockSocket1);
    connectionListener(mockSocket2);

    expect(activeSockets).not.toEqual({});

    closeServer();
    expect(mockSocket1.dead).toBe(true);
    expect(mockSocket2.dead).toBe(true);
    expect(activeSockets).toEqual({});
  });
});
