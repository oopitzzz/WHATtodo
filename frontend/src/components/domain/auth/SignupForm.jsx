import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../common/Input';
import Button from '../../common/Button';
import useAuthStore from '../../../store/auth.store';

/**
 * 회원가입 폼 컴포넌트
 * @component
 */
export default function SignupForm() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const checkPasswordStrength = (pwd) => {
    if (!pwd) return '';
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;

    if (strength === 1) return '약함 (숫자나 특수문자 추가 권장)';
    if (strength === 2) return '중간';
    if (strength === 3) return '강함';
    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '유효한 이메일 형식을 입력해주세요';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요';
    } else if (formData.nickname.trim().length < 2 || formData.nickname.trim().length > 20) {
      newErrors.nickname = '닉네임은 2~20자여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // 비밀번호 강도 체크
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname
      });
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 409) {
        setServerError('이미 가입된 이메일입니다');
        setErrors(prev => ({
          ...prev,
          email: '이미 가입된 이메일입니다'
        }));
      } else if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('회원가입에 실패했습니다. 다시 시도해주세요');
      }
    } finally {
      setIsLoading(false);
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
        name="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        required
      />

      <div>
        <Input
          type="password"
          label="비밀번호"
          name="password"
          placeholder="8자 이상의 비밀번호"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
        />
        {formData.password && (
          <p className={`mt-1 text-xs font-medium ${
            passwordStrength.includes('약함') ? 'text-yellow-600' :
            passwordStrength.includes('중간') ? 'text-blue-600' :
            'text-green-600'
          }`}>
            강도: {passwordStrength}
          </p>
        )}
      </div>

      <Input
        type="password"
        label="비밀번호 확인"
        name="passwordConfirm"
        placeholder="비밀번호를 다시 입력하세요"
        value={formData.passwordConfirm}
        onChange={handleInputChange}
        error={errors.passwordConfirm}
        required
      />

      <Input
        type="text"
        label="닉네임"
        name="nickname"
        placeholder="2~20자의 닉네임"
        value={formData.nickname}
        onChange={handleInputChange}
        error={errors.nickname}
        required
      />

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={isLoading}
      >
        회원가입
      </Button>

      <div className="text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          로그인
        </Link>
      </div>
    </form>
  );
}
