import { closeAll, workerList, init } from '../src';

// TODO: Figure out why this file path has to be writen differently
const mockExecutable = './__mocks__/rScript.sh';

afterAll(() => closeAll());

describe('Library index', () => {
  test('should export init function', () => {
    expect(typeof init).toBe('function');
  });

  test('should export workerList object', () => {
    expect(typeof workerList).toBe('object');
  });
});

describe('Init function', () => {
  test('should throw error if called with no executable path', () => {
    expect(init).toThrow();
  });

  test('should return a constructor for R object', () => {
    // TODO: Improve this test once we have tests on worker file
    const Worker = init(mockExecutable);
    expect(typeof R).toBe('function');

    const worker = new Worker('');
    expect(worker).toBeInstanceOf(Worker);
  });
});

describe('closeAll function', () => {
  test(
    'should run',
    () => closeAll().then(result => expect(typeof result).toBe('undefined'))
  );
});
