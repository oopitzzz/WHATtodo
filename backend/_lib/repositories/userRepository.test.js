// 1. Mock the database module. This is hoisted by Jest.
jest.mock('../db');

// 2. Import the mocked pool and the repository functions
const { pool } = require('../db');
const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateLastLogin,
} = require('./userRepository');


describe('User Repository', () => {
  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user and return the user data', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        nickname: 'tester',
      };
      const expectedUser = {
        user_id: 'a-uuid',
        email: userData.email,
        nickname: userData.nickname,
        created_at: new Date().toISOString(),
      };

      pool.query.mockResolvedValueOnce({ rows: [expectedUser] });

      const result = await createUser(userData);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [userData.email, userData.passwordHash, userData.nickname]
      );
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if the database query fails', async () => {
        const userData = {
            email: 'test@example.com',
            passwordHash: 'hashedpassword',
            nickname: 'tester',
        };
        const dbError = new Error('DB error');
        pool.query.mockRejectedValueOnce(dbError);

        await expect(createUser(userData)).rejects.toThrow(dbError);
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user if found by email', async () => {
      const email = 'test@example.com';
      const expectedUser = { user_id: 'a-uuid', email: email, password_hash: 'hashed' };
      
      pool.query.mockResolvedValueOnce({ rows: [expectedUser] });

      const result = await findUserByEmail(email);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT user_id, email'),
        [email]
      );
      expect(pool.query.mock.calls[0][0]).toContain('LIMIT 1');
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user is not found by email', async () => {
      const email = 'notfound@example.com';
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await findUserByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should return a user if found by ID', async () => {
      const userId = 'a-uuid';
      const expectedUser = { user_id: userId, email: 'test@example.com' };
      
      pool.query.mockResolvedValueOnce({ rows: [expectedUser] });

      const result = await findUserById(userId);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT user_id, email, nickname'),
        [userId]
      );
      expect(pool.query.mock.calls[0][0]).toContain('LIMIT 1');
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user is not found by ID', async () => {
      const userId = 'non-existent-uuid';
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await findUserById(userId);

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update a user and return the updated data', async () => {
      const userId = 'a-uuid';
      const updates = { nickname: 'new-nickname', profileImageUrl: 'http://new.url/img.png', notificationEnabled: false };
      const expectedUser = { user_id: userId, nickname: updates.nickname };

      pool.query.mockResolvedValueOnce({ rows: [expectedUser] });

      const result = await updateUser(userId, updates);

      expect(pool.query).toHaveBeenCalledTimes(1);
      const call = pool.query.mock.calls[0];
      expect(call[0]).toContain('UPDATE users');
      expect(call[0]).toContain('nickname = COALESCE');
      expect(call[0]).toContain('notification_enabled = COALESCE');
      expect(call[1]).toEqual([updates.nickname, updates.profileImageUrl, updates.notificationEnabled, userId]);
      expect(result).toEqual(expectedUser);
    });

    it('should handle partial updates', async () => {
        const userId = 'a-uuid';
        const updates = { nickname: 'only-nickname' };
  
        pool.query.mockResolvedValueOnce({ rows: [{ user_id: userId, nickname: updates.nickname }] });
  
        await updateUser(userId, updates);
  
        const call = pool.query.mock.calls[0];
        expect(call[0]).toContain('nickname = COALESCE');
        expect(call[1]).toEqual([updates.nickname, userId]);
      });

    it('should return null if the user to update is not found', async () => {
        const userId = 'non-existent-uuid';
        const updates = { nickname: 'any-nickname' };

        pool.query.mockResolvedValueOnce({ rows: [] });

        const result = await updateUser(userId, updates);
      expect(result).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should call the update query with the correct user ID', async () => {
      const userId = 'a-uuid';
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      await updateLastLogin(userId);

      expect(pool.query).toHaveBeenCalledTimes(1);
      const call = pool.query.mock.calls[0];
      expect(call[0]).toContain('SET last_login_at = CURRENT_TIMESTAMP');
      expect(call[1]).toEqual([userId]);
    });
  });
});
