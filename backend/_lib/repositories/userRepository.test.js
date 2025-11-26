const assert = require('assert');
const userRepository = require('./userRepository');

class MockPool {
  constructor() {
    this.calls = [];
    this.response = { rows: [] };
  }

  async query(text, params) {
    this.calls.push({ text, params });
    return this.response;
  }
}

async function testCreateUser() {
  const mock = new MockPool();
  mock.response = { rows: [{ user_id: 'user-1', email: 'test@example.com' }] };
  userRepository.__setPool(mock);

  const user = await userRepository.createUser({
    email: 'test@example.com',
    passwordHash: 'hashed',
    nickname: 'tester',
  });

  assert.strictEqual(user.user_id, 'user-1');
  const call = mock.calls[0];
  assert(call.text.includes('INSERT INTO users'), 'should insert into users table');
  assert.deepStrictEqual(call.params, ['test@example.com', 'hashed', 'tester']);
}

async function testFindUserByEmail() {
  const mock = new MockPool();
  mock.response = { rows: [{ user_id: 'user-2', email: 'find@example.com' }] };
  userRepository.__setPool(mock);

  const user = await userRepository.findUserByEmail('find@example.com');
  assert.strictEqual(user.email, 'find@example.com');
  const call = mock.calls[0];
  assert(call.text.includes('WHERE email = $1'), 'should parameterize email');
}

async function testUpdateUser() {
  const mock = new MockPool();
  mock.response = { rows: [{ user_id: 'user-3', nickname: 'updated' }] };
  userRepository.__setPool(mock);

  const user = await userRepository.updateUser('user-3', {
    nickname: 'updated',
    notificationEnabled: false,
  });

  assert.strictEqual(user.user_id, 'user-3');
  const call = mock.calls[0];
  assert(call.text.includes('nickname = COALESCE'), 'should update nickname');
  assert(call.text.includes('notification_enabled = COALESCE'), 'should update notification flag');
  assert.strictEqual(call.params[0], 'updated');
  assert.strictEqual(call.params[1], false);
  assert.strictEqual(call.params.at(-1), 'user-3');
}

async function testUpdateLastLogin() {
  const mock = new MockPool();
  userRepository.__setPool(mock);

  await userRepository.updateLastLogin('user-4');
  const call = mock.calls[0];
  assert(call.text.includes('SET last_login_at = CURRENT_TIMESTAMP'), 'should update last_login_at');
  assert.deepStrictEqual(call.params, ['user-4']);
}

async function run() {
  try {
    await testCreateUser();
    await testFindUserByEmail();
    await testUpdateUser();
    await testUpdateLastLogin();
    console.log('user repository tests passed');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    userRepository.__resetPool();
  }
}

run();
