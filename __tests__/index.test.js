const rw = require('../src');

// TODO: Figure out why this file path has to be writen differently
const mockExecutable = './__mocks__/rScript.sh';

afterAll(() => rw.closeAll());

describe('Library index', () => {
  test('should export init function', () => {
    expect(typeof rw.init).toBe('function');
  });

  test('should export workerList object', () => {
    expect(typeof rw.workerList).toBe('object');
  });
});

describe('Init function', () => {
  test('should throw error if called with no executable path', () => {
    expect(rw.init).toThrow();
  });

  test('should return a constructor for R object', () => {
    // TODO: Improve this test once we have tests on worker file
    const R = rw.init(mockExecutable);
    expect(typeof R).toBe('function');

    const worker = new R('');
    expect(worker).toBeInstanceOf(R);
  });
});

describe('closeAll function', () => {
  test('should run', () => {
    const { closeAll } = rw;
    return closeAll().then(result => expect(typeof result).toBe('undefined'));
  });
});
