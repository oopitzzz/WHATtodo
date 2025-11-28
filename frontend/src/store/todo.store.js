import { create } from 'zustand';
import * as todoApi from '../backend/todoApi';

const useTodoStore = create((set, get) => ({
  todos: [],
  filter: 'ACTIVE',
  sortBy: 'created_at',
  sortDirection: 'desc',
  isLoading: false,
  error: null,

  /**
   * 할일 목록 조회
   */
  fetchTodos: async () => {
    set({ isLoading: true, error: null });

    try {
      const { filter, sortBy, sortDirection } = get();
      const response = await todoApi.getTodos({
        status: filter === 'all' ? undefined : filter,
        sortBy,
        sortDirection
      });

      set({ todos: response.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * 할일 생성
   */
  createTodo: async (todoData) => {
    try {
      const response = await todoApi.createTodo(todoData);
      const newTodo = response.data;

      set((state) => ({ todos: [newTodo, ...state.todos] }));
      return newTodo;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * 할일 수정
   */
  updateTodo: async (id, updates) => {
    try {
      const response = await todoApi.updateTodo(id, updates);
      const updatedTodo = response.data;

      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.todo_id === id ? { ...todo, ...updatedTodo } : todo
        )
      }));
      return updatedTodo;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * 할일 완료 처리
   */
  completeTodo: async (id) => {
    try {
      await todoApi.completeTodo(id);
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.todo_id === id
            ? { ...todo, status: 'COMPLETED', completed_at: new Date().toISOString() }
            : todo
        )
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * 할일 복원
   */
  restoreTodo: async (id, status = 'ACTIVE') => {
    try {
      const response = await todoApi.restoreTodo(id, status);
      const restoredTodo = response.data;

      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.todo_id === id ? { ...todo, ...restoredTodo } : todo
        )
      }));
      return restoredTodo;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * 할일 삭제
   */
  deleteTodo: async (id) => {
    try {
      await todoApi.deleteTodo(id);
      set((state) => ({
        todos: state.todos.filter((todo) => todo.todo_id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * 필터 설정
   */
  setFilter: (filter) => {
    set({ filter });
    get().fetchTodos();
  },

  /**
   * 정렬 기준 설정
   */
  setSortBy: (sortBy) => {
    set({ sortBy });
    get().fetchTodos();
  },

  /**
   * 정렬 방향 설정
   */
  setSortDirection: (sortDirection) => {
    set({ sortDirection });
    get().fetchTodos();
  },

  /**
   * 에러 초기화
   */
  clearError: () => set({ error: null })
}));

export default useTodoStore;
