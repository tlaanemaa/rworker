const net = require('net');
const socketServer = require('../src/socket_server');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

afterAll(() => socketServer.closeServer());

describe('validIP function', () => {
  const { isValidIP } = socketServer;

  test('should return false', () => {
    expect(isValidIP('192.168.1.1')).toBe(false);
  });

  test('should return true', () => {
    expect(isValidIP('::1')).toBe(true);
  });
});

describe('whenReady function', () => {
  const { startUpQueue, whenReady } = socketServer;

  test('should add messages to startupQueue', () => {
    expect(startUpQueue.length).toBe(0);
    whenReady();
    expect(startUpQueue.length).toBe(1);
  });
});

describe('server', () => {
  const { server, whenReady, listen } = socketServer;

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

describe('close server function', () => {

});
