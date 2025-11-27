import { useEffect, useRef } from 'react';
import Button from './Button';

/**
 * 모달 컴포넌트
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {function} onClose - 닫기 핸들러
 * @param {string} title - 모달 제목
 * @param {string} children - 모달 내용
 * @param {string} confirmText - 확인 버튼 텍스트
 * @param {function} onConfirm - 확인 핸들러
 * @param {boolean} showCancel - 취소 버튼 표시 여부
 */
export default function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  confirmText = '확인',
  onConfirm,
  showCancel = true,
  cancelText = '취소',
  confirmLoading = false,
  size = 'md'
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // ESC 키로 닫기
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 사이즈별 클래스
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  // 모달 바깥 클릭 처리
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-out"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`
          w-full ${sizeClasses[size] || sizeClasses.md}
          bg-white rounded-lg shadow-xl
          animate-in fade-in zoom-in-95 duration-300
        `}
      >
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="px-6 py-4">
          {typeof children === 'string' ? (
            <p className="text-gray-700">{children}</p>
          ) : (
            children
          )}
        </div>

        {/* 푸터 (버튼) */}
        {(onConfirm || showCancel) && (
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            {showCancel && (
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={confirmLoading}
              >
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button
                variant="primary"
                onClick={onConfirm}
                loading={confirmLoading}
              >
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
