const { hashPassword, comparePassword } = require('./bcrypt');

describe('bcrypt utils', () => {
  it('should hash and verify password', async () => {
    const plain = 'Password123!';
    const hash = await hashPassword(plain);
    expect(hash.startsWith('$2b$')).toBe(true);

    const isMatch = await comparePassword(plain, hash);
    expect(isMatch).toBe(true);

    const mismatch = await comparePassword('WrongPassword', hash);
    expect(mismatch).toBe(false);
  });
});
