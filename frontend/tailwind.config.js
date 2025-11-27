/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        priority: {
          high: '#EF4444',    // 빨강
          normal: '#3B82F6',  // 파랑
          low: '#9CA3AF'      // 회색
        }
      },
      screens: {
        'mobile': '375px',
        'tablet': '768px',
        'desktop': '1024px'
      }
    },
  },
}
