import { computed, ref, shallowRef } from 'vue';

export type OperationStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Reactive state for an imperative (mutation-like) operation.
 *
 * This is a plain utility, not a Hook: Hooks may use it without breaking the
 * "Hook → Hook ❌" rule. Each Hook wraps exactly one Service operation.
 */
export function createOperation<TArgs extends unknown[], TResult>(
  operation: (...args: TArgs) => Promise<TResult>,
) {
  const status = ref<OperationStatus>('idle');
  const error = shallowRef<unknown>(null);
  const data = shallowRef<TResult | null>(null);

  async function execute(...args: TArgs): Promise<TResult> {
    status.value = 'pending';
    error.value = null;

    try {
      const result = await operation(...args);
      data.value = result;
      status.value = 'success';
      return result;
    } catch (cause) {
      error.value = cause;
      status.value = 'error';
      throw cause;
    }
  }

  return {
    execute,
    status,
    error,
    data,
    pending: computed(() => status.value === 'pending'),
  };
}
