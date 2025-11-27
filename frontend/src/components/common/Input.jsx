import { forwardRef } from 'react';

/**
 * 입력 필드 컴포넌트
 * @param {string} type - 'text' | 'email' | 'password' | 'date' | 'textarea'
 * @param {string} label - 라벨 텍스트
 * @param {string} placeholder - 플레이스홀더
 * @param {string} error - 에러 메시지
 * @param {boolean} required - 필수 여부
 * @param {function} onChange - 변경 핸들러
 * @param {string} value - 입력 값
 */
const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  error,
  required = false,
  onChange,
  value,
  className,
  ...props
}, ref) => {
  const isTextarea = type === 'textarea';
  const Component = isTextarea ? 'textarea' : 'input';

  return (
    <div className={`flex flex-col ${className || ''}`}>
      {label && (
        <label className="mb-2 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <Component
        ref={ref}
        type={isTextarea ? undefined : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          px-4 py-2 rounded-lg border-2 transition-colors duration-200
          focus:outline-none
          ${error
            ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-500'
            : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500'
          }
          ${isTextarea ? 'resize-none min-h-[100px]' : ''}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
