jest.mock('../db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../db');
const { autoDeleteExpiredTrash } = require('./scheduler');

describe('scheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete expired todos and return count', async () => {
    pool.query.mockResolvedValue({ rows: [{ todo_id: 'a' }, { todo_id: 'b' }] });

    const result = await autoDeleteExpiredTrash();

    expect(pool.query).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.deletedCount).toBe(2);
  });

  it('should handle errors gracefully', async () => {
    pool.query.mockRejectedValue(new Error('db error'));

    const result = await autoDeleteExpiredTrash();

    expect(result.success).toBe(false);
    expect(result.deletedCount).toBe(0);
    expect(result.error).toBe('db error');
  });
});
