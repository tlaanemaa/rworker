import net from 'net';
import {
  isValidIP,
  startUpQueue,
  whenReady,
  listen,
  server,
  closeServer
} from '../src/socket_server';

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

describe('close server function', () => {

});
