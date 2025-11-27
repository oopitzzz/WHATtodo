import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuthStore from '../store/auth.store';
import * as authApi from '../backend/authApi';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();

  const [formData, setFormData] = useState({
    nickname: '',
    notificationEnabled: true
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // 프로필 데이터 로드
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authApi.getUserProfile();
      setFormData({
        nickname: response.user.nickname || '',
        notificationEnabled: response.user.notificationEnabled ?? true
      });
    } catch (err) {
      setError('프로필을 불러올 수 없습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const trimmedNickname = formData.nickname.trim();
    if (!trimmedNickname) {
      newErrors.nickname = '닉네임을 입력해주세요';
    } else if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      newErrors.nickname = '닉네임은 2~20자여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await authApi.updateUserProfile({
        nickname: formData.nickname.trim(),
        notificationEnabled: formData.notificationEnabled
      });

      setUser(response.user);
      setSuccessMessage('프로필이 저장되었습니다');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('프로필 저장에 실패했습니다');
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        setError('로그아웃에 실패했습니다');
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="md" text="설정을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
        <p className="text-gray-600">프로필 및 계정 설정을 관리하세요</p>
      </div>

      {/* 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* 프로필 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">프로필</h2>

        {user && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-2">이메일</p>
            <p className="text-lg font-medium text-gray-900">{user.email}</p>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notificationEnabled"
              name="notificationEnabled"
              checked={formData.notificationEnabled}
              onChange={handleInputChange}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="notificationEnabled" className="ml-3 text-sm font-medium text-gray-700">
              마감일 알림 활성화
            </label>
          </div>

          <Button
            type="submit"
            loading={isSaving}
            disabled={isSaving}
            className="w-full"
          >
            저장
          </Button>
        </form>
      </div>

      {/* 계정 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">계정</h2>

        <Button
          variant="danger"
          onClick={handleLogout}
          className="w-full"
        >
          로그아웃
        </Button>
      </div>
    </div>
  );
}
