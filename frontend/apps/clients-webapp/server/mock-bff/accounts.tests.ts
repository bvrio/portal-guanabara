import { beforeEach, describe, expect, it } from 'vitest';

import { createAccount, findAccountByEmail, listAccounts, resetAccounts } from './accounts';

describe('mock BFF accounts', () => {
  beforeEach(() => resetAccounts());

  it('seeds one account per persona', () => {
    expect(listAccounts().map((account) => account.id)).toEqual([
      'acc-interested',
      'acc-holder',
      'acc-premium',
    ]);
  });

  it('finds accounts by e-mail case-insensitively', () => {
    expect(findAccountByEmail(' TITULAR@teste.com ')?.id).toBe('acc-holder');
  });

  it('creates registered accounts as interested', () => {
    const account = createAccount(
      { fullName: 'Test Name', cpf: '1', phone: '2', email: 'new@teste.com' },
      'password123',
    );

    expect(account.userType).toBe('interested');
    expect(findAccountByEmail('new@teste.com')?.id).toBe(account.id);
  });
});
