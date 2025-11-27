import { create } from 'zustand';
import * as authApi from '../backend/authApi';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  /**
   * 회원가입
   */
  signup: async (credentials) => {
    try {
      const data = await authApi.signup(credentials);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true
      });

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 로그인
   */
  login: async (credentials) => {
    try {
      const data = await authApi.login(credentials);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true
      });

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 로그아웃
   */
  logout: async () => {
    try {
      await authApi.logout();

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * 사용자 정보 설정
   */
  setUser: (user) => set({ user }),

  /**
   * Access Token 설정
   */
  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ accessToken: token, isAuthenticated: true });
  }
}));

export default useAuthStore;
