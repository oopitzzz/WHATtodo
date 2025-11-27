import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import useAuthStore from '../store/auth.store';

export default function MainLayout() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('로그아웃 실패:', error);
      }
    }
  };

  const navItems = [
    { path: '/dashboard', label: '대시보드', icon: '📊' },
    { path: '/calendar', label: '캘린더', icon: '📅' },
    { path: '/trash', label: '휴지통', icon: '🗑️' },
    { path: '/settings', label: '설정', icon: '⚙️' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="hidden md:flex md:w-64 bg-white shadow-lg flex-col">
        {/* 로고 */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">WHATtodo</h2>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 mt-8 space-y-2 px-4">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            className="w-full"
          >
            로그아웃
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 md:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">WHATtodo</h1>

            {/* 모바일 메뉴 토글 */}
            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ☰
              </button>
            </div>

            {/* 데스크톱 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="hidden md:block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              로그아웃
            </button>
          </div>

          {/* 모바일 메뉴 */}
          {isMenuOpen && (
            <nav className="md:hidden px-4 py-4 border-t border-gray-200 space-y-2">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2 rounded-lg transition-colors block
                    ${isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-4"
              >
                로그아웃
              </Button>
            </nav>
          )}
        </div>

        {/* 페이지 콘텐츠 */}
        <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 md:px-8 lg:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
