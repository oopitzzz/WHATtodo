/**
 * 로딩 스피너 컴포넌트
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} color - 스피너 색상 (Tailwind 클래스)
 * @param {string} text - 로딩 텍스트
 */
export default function LoadingSpinner({
  size = 'md',
  color = 'blue',
  text,
  className
}) {
  // 크기별 클래스
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  // 테두리 크기별 클래스
  const borderWidthClasses = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4'
  };

  // 색상 클래스
  const colorClasses = {
    blue: `border-${color}-200 border-t-${color}-600`,
    red: `border-${color}-200 border-t-${color}-600`,
    green: `border-${color}-200 border-t-${color}-600`,
    gray: `border-${color}-200 border-t-${color}-600`
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className || ''}`}>
      <div
        className={`
          animate-spin rounded-full
          ${sizeClasses[size] || sizeClasses.md}
          ${borderWidthClasses[size] || borderWidthClasses.md}
          border-blue-200 border-t-blue-600
        `}
      />
      {text && (
        <p className="text-sm font-medium text-gray-600">{text}</p>
      )}
    </div>
  );
}
