const { pool } = require('../db');

let activePool = pool;

function setPool(customPool) {
  activePool = customPool || pool;
}

function resetPool() {
  activePool = pool;
}

async function createUser({ email, passwordHash, nickname }) {
  const query = `
    INSERT INTO users (email, password_hash, nickname)
    VALUES ($1, $2, $3)
    RETURNING user_id, email, nickname, profile_image_url,
              notification_enabled, created_at, last_login_at
  `;
  const values = [email, passwordHash, nickname];
  const { rows } = await activePool.query(query, values);
  return rows[0];
}

async function findUserByEmail(email) {
  const query = `
    SELECT user_id, email, password_hash, nickname, profile_image_url,
           notification_enabled, created_at, last_login_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const { rows } = await activePool.query(query, [email]);
  return rows[0] || null;
}

async function findUserById(userId) {
  const query = `
    SELECT user_id, email, nickname, profile_image_url,
           notification_enabled, created_at, last_login_at
    FROM users
    WHERE user_id = $1
    LIMIT 1
  `;
  const { rows } = await activePool.query(query, [userId]);
  return rows[0] || null;
}

async function updateUser(userId, updates = {}) {
  const allowedFields = {
    nickname: 'nickname',
    profileImageUrl: 'profile_image_url',
    notificationEnabled: 'notification_enabled',
  };

  const setClauses = [];
  const values = [];

  Object.entries(allowedFields).forEach(([key, column]) => {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      values.push(updates[key]);
      setClauses.push(`${column} = COALESCE($${values.length}, ${column})`);
    }
  });

  if (!setClauses.length) {
    return findUserById(userId);
  }

  values.push(userId);
  const query = `
    UPDATE users
    SET ${setClauses.join(', ')},
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $${values.length}
    RETURNING user_id, email, nickname, profile_image_url,
              notification_enabled, updated_at
  `;

  const { rows } = await activePool.query(query, values);
  return rows[0] || null;
}

async function updateLastLogin(userId) {
  const query = `
    UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
  `;
  await activePool.query(query, [userId]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateLastLogin,
  __setPool: setPool,
  __resetPool: resetPool,
};
