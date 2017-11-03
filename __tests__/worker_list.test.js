import workerList from '../src/worker_list';

const mockWorker1 = { uid: 'uid1' };
const mockWorker2 = { uid: 'uid2' };

describe('workerList', () => {
  test('should add new item', () => {
    workerList.add(mockWorker1);
    expect(workerList.workers.uid1).toBe(mockWorker1);

    workerList.add(mockWorker2);
    expect(workerList.workers.uid2).toBe(mockWorker2);
  });

  test('should get items', () => {
    expect(workerList.get('uid1')).toBe(mockWorker1);
    expect(workerList.get('asd')).toBe(null);
  });

  test('should get all items', () => {
    expect(workerList.getAll()).toEqual([mockWorker1, mockWorker2]);
  });

  test('should kill all', () => {
    mockWorker1.kill = jest.fn();
    mockWorker2.kill = jest.fn();

    workerList.killAll();
    expect(mockWorker1.kill).toHaveBeenCalledTimes(1);
    expect(mockWorker2.kill).toHaveBeenCalledTimes(1);
  });

  test('should remove', () => {
    workerList.remove(mockWorker1);
    workerList.remove(mockWorker2);
    expect(workerList.workers).toEqual({});
  });
});
