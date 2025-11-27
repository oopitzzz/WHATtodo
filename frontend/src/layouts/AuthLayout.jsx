import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Outlet />
        </div>

        {/* 하단 정보 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2025 WHATtodo. 효율적인 할일 관리의 시작</p>
        </div>
      </div>
    </div>
  );
}
