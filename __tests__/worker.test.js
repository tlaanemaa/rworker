import init from '../src/worker';

const mockExecutable = './__mocks__/rScript.sh';
const Worker = init(mockExecutable);

describe('Worker', () => {
  test('should throw when initialised with bad path', () => {
    const initialise = () => new Worker('xxx');
    expect(initialise).toThrow();
  });
});
