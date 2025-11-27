import { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import useTodoStore from '../../../store/todo.store';

/**
 * 할일 생성/수정 폼 컴포넌트
 * @param {boolean} isOpen - 모달 오픈 상태
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {'create' | 'update'} mode - 생성/수정 모드
 * @param {Object} editingTodo - 수정할 할일 (mode='update'일 때)
 */
const TodoForm = ({ isOpen, onClose, mode = 'create', editingTodo = null }) => {
  const { createTodo, updateTodo } = useTodoStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'NORMAL',
    due_date: '',
    memo: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // 편집 모드일 때 초기값 설정
  useEffect(() => {
    if (mode === 'update' && editingTodo) {
      setFormData({
        title: editingTodo.title || '',
        description: editingTodo.description || '',
        priority: editingTodo.priority || 'NORMAL',
        due_date: editingTodo.due_date || '',
        memo: editingTodo.memo || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'NORMAL',
        due_date: '',
        memo: ''
      });
    }
    setErrors({});
    setServerError('');
  }, [isOpen, mode, editingTodo]);

  const validateForm = () => {
    const newErrors = {};

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      newErrors.title = '제목을 입력해주세요';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = '제목은 100자 이내여야 합니다';
    }

    // 마감일 검증 (과거 날짜 방지)
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        newErrors.due_date = '마감일은 오늘 이후여야 합니다';
      }
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        memo: formData.memo.trim() || undefined
      };

      if (mode === 'create') {
        await createTodo(submitData);
      } else if (mode === 'update') {
        await updateTodo(editingTodo.todo_id, submitData);
      }

      onClose();
    } catch (error) {
      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError(`할일 ${mode === 'create' ? '생성' : '수정'}에 실패했습니다`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '새 할일 추가' : '할일 수정'}
      size="md"
      confirmText={mode === 'create' ? '추가' : '저장'}
      onConfirm={handleSubmit}
      confirmLoading={isLoading}
      showCancel
      cancelText="취소"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
            {serverError}
          </div>
        )}

        <Input
          type="text"
          label="제목"
          name="title"
          placeholder="할일 제목을 입력하세요"
          value={formData.title}
          onChange={handleInputChange}
          error={errors.title}
          required
        />

        <Input
          type="textarea"
          label="설명"
          name="description"
          placeholder="할일에 대한 설명을 입력하세요 (선택)"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
        />

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            우선순위
          </label>
          <div className="flex gap-3">
            {['LOW', 'NORMAL', 'HIGH'].map(priority => (
              <label key={priority} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={formData.priority === priority}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {priority === 'HIGH' ? '높음' : priority === 'NORMAL' ? '중간' : '낮음'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Input
          type="date"
          label="마감일"
          name="due_date"
          value={formData.due_date}
          onChange={handleInputChange}
          error={errors.due_date}
        />

        <Input
          type="textarea"
          label="메모"
          name="memo"
          placeholder="추가 메모를 입력하세요 (선택)"
          value={formData.memo}
          onChange={handleInputChange}
          rows="2"
        />
      </form>
    </Modal>
  );
};

export default TodoForm;
