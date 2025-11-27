import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../common/Input';
import Button from '../../common/Button';
import useAuthStore from '../../../store/auth.store';

/**
 * 로그인 폼 컴포넌트
 * @component
 */
export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // 이메일 검증 정규식
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!emailRegex.test(email)) {
      newErrors.email = '유효한 이메일 형식을 입력해주세요';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        setServerError('이메일 또는 비밀번호가 일치하지 않습니다');
      } else if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('로그인에 실패했습니다. 다시 시도해주세요');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {serverError && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {serverError}
        </div>
      )}

      <Input
        type="email"
        label="이메일"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) {
            setErrors({ ...errors, email: '' });
          }
        }}
        error={errors.email}
        required
        onKeyPress={handleKeyPress}
      />

      <Input
        type="password"
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) {
            setErrors({ ...errors, password: '' });
          }
        }}
        error={errors.password}
        required
        onKeyPress={handleKeyPress}
      />

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={isLoading}
      >
        로그인
      </Button>

      <div className="text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
          회원가입
        </Link>
      </div>
    </form>
  );
}
