const assert = require('assert');
const { hashPassword, comparePassword } = require('./bcrypt');

async function runTests() {
  const plain = 'Password123!';
  const hash = await hashPassword(plain);
  assert.ok(hash.startsWith('$2b$'), 'hashed password should start with bcrypt prefix');

  const isMatch = await comparePassword(plain, hash);
  assert.strictEqual(isMatch, true, 'password should match');

  const mismatch = await comparePassword('WrongPassword', hash);
  assert.strictEqual(mismatch, false, 'password should not match');

  console.log('bcrypt util tests passed');
}

runTests();
