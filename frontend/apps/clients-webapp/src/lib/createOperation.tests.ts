import { describe, expect, it } from 'vitest';

import { createOperation } from './createOperation';

describe('createOperation', () => {
  it('tracks a successful operation', async () => {
    const operation = createOperation(async (value: number) => value * 2);

    const promise = operation.execute(21);
    expect(operation.pending.value).toBe(true);

    await expect(promise).resolves.toBe(42);
    expect(operation.status.value).toBe('success');
    expect(operation.data.value).toBe(42);
  });

  it('tracks a failed operation and rethrows', async () => {
    const failure = new Error('test failure');
    const operation = createOperation(async () => {
      throw failure;
    });

    await expect(operation.execute()).rejects.toBe(failure);
    expect(operation.status.value).toBe('error');
    expect(operation.error.value).toBe(failure);
  });
});
