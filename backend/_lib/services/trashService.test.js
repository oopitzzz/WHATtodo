const trashService = require('./trashService');

async function runTests() {
  const mockRepository = {
    getTrashedTodosByUserId: async (userId, options) => [
      { todo_id: 'deleted-1', title: 'Deleted Todo 1', status: 'DELETED' },
      { todo_id: 'deleted-2', title: 'Deleted Todo 2', status: 'DELETED' }
    ],
    getTrashedTodoCount: async (userId) => 2,
    permanentlyDeleteTodoById: async (todoId, userId) => {
      return todoId === 'deleted-1' ? true : false;
    }
  };

  trashService.__setRepository(mockRepository);

  try {
    // Test 1: getTrash with pagination
    const trashResult = await trashService.getTrash('user-1', { page: 1, pageSize: 20 });
    if (!trashResult.items || trashResult.items.length !== 2) {
      throw new Error('getTrash items check failed');
    }
    if (!trashResult.meta || trashResult.meta.page !== 1 || trashResult.meta.pageSize !== 20) {
      throw new Error('getTrash meta check failed');
    }
    if (trashResult.meta.total !== 2 || trashResult.meta.totalPages !== 1) {
      throw new Error('getTrash count check failed');
    }

    // Test 2: getTrash with default pagination
    const defaultResult = await trashService.getTrash('user-1', {});
    if (defaultResult.meta.page !== 1 || defaultResult.meta.pageSize !== 20) {
      throw new Error('getTrash default pagination failed');
    }

    // Test 3: permanentlyDeleteTrash success
    const deleteResult = await trashService.permanentlyDeleteTrash('user-1', 'deleted-1');
    if (!deleteResult) {
      throw new Error('permanentlyDeleteTrash should return true');
    }

    // Test 4: permanentlyDeleteTrash not found
    try {
      await trashService.permanentlyDeleteTrash('user-1', 'nonexistent');
      throw new Error('Should have thrown error for nonexistent trash item');
    } catch (err) {
      if (err.statusCode !== 404 || err.code !== 'TRASH_NOT_FOUND') {
        throw new Error('Wrong error for nonexistent trash item');
      }
    }

    console.log('trash service tests passed');
  } catch (error) {
    console.error('❌', error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
