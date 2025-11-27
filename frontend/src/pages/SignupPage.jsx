import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/domain/auth/SignupForm';
import useAuthStore from '../store/auth.store';

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // 이미 인증된 경우 대시보드로 이동
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WHATtodo</h1>
          <p className="text-gray-600">효율적인 할일 관리의 시작</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">회원가입</h2>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
