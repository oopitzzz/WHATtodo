const trashService = require('./trashService');

const buildMockRepo = (overrides = {}) => ({
  getTrashedTodosByUserId: jest.fn().mockResolvedValue([
    { todo_id: 'deleted-1', title: 'Deleted Todo 1', status: 'DELETED' },
    { todo_id: 'deleted-2', title: 'Deleted Todo 2', status: 'DELETED' },
  ]),
  getTrashedTodoCount: jest.fn().mockResolvedValue(2),
  permanentlyDeleteTodoById: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('trashService', () => {
  afterEach(() => {
    trashService.__setRepository(null);
    jest.clearAllMocks();
  });

  it('should return paginated trash list with meta', async () => {
    const repo = buildMockRepo();
    trashService.__setRepository(repo);

    const result = await trashService.getTrash('user-1', { page: 1, pageSize: 20 });
    expect(repo.getTrashedTodosByUserId).toHaveBeenCalledWith('user-1', { limit: 20, offset: 0 });
    expect(repo.getTrashedTodoCount).toHaveBeenCalledWith('user-1');
    expect(result.items).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(result.meta.totalPages).toBe(1);
  });

  it('should throw when item not found on permanent delete', async () => {
    const repo = buildMockRepo({ permanentlyDeleteTodoById: jest.fn().mockResolvedValue(false) });
    trashService.__setRepository(repo);

    await expect(trashService.permanentlyDeleteTrash('user-1', 'missing')).rejects.toMatchObject({
      code: 'TRASH_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('should permanently delete when found', async () => {
    const repo = buildMockRepo({ permanentlyDeleteTodoById: jest.fn().mockResolvedValue(true) });
    trashService.__setRepository(repo);

    const result = await trashService.permanentlyDeleteTrash('user-1', 'deleted-1');
    expect(result).toBe(true);
    expect(repo.permanentlyDeleteTodoById).toHaveBeenCalledWith('deleted-1', 'user-1');
  });
});
