/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: BODY SWITCH 스타일 진한 틸/청록
        primary: {
          DEFAULT: '#0E7C7B',
          light: '#E6F3F3',
          soft: '#CFE6E6',
          dark: '#0A5E5D',
          deep: '#063F3E',
        },
        // Accent: 보조 컬러 (서브 액션, 일러스트)
        accent: {
          DEFAULT: '#3FB6B2',
          light: '#E8F7F6',
          dark: '#2A8E8B',
        },
        // 배경/표면
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F6F7F9',
          tertiary: '#EEF0F3',
          inverse: '#0F172A',
        },
        // 텍스트
        content: {
          DEFAULT: '#111827',
          secondary: '#4B5563',
          tertiary: '#9CA3AF',
          quaternary: '#D1D5DB',
          inverse: '#FFFFFF',
        },
        // 라인/구분선
        line: {
          DEFAULT: '#E5E7EB',
          light: '#F1F3F5',
          strong: '#D1D5DB',
        },
        // 시맨틱 상태
        state: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#0E7C7B',
          sale: '#FF3B30',
        },
      },
      borderRadius: {
        'card': '16px',
        'card-lg': '20px',
        'card-xl': '24px',
        'button': '12px',
        'input': '14px',
        'chip': '9999px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'card-soft': '0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-elevated': '0 4px 16px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
        'tab': '0 -1px 0 rgba(15, 23, 42, 0.04), 0 -4px 12px rgba(15, 23, 42, 0.04)',
        'fab': '0 6px 20px rgba(14, 124, 123, 0.30), 0 2px 6px rgba(14, 124, 123, 0.18)',
        'chip-active': '0 2px 8px rgba(14, 124, 123, 0.18)',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        brand: ['Pretendard', 'sans-serif'],
      },
      fontSize: {
        // 디스플레이 (브랜드/온보딩)
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '700' }],
        // 헤딩
        'h1': ['24px', { lineHeight: '32px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h2': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3': ['18px', { lineHeight: '26px', letterSpacing: '-0.005em', fontWeight: '600' }],
        'h4': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        // 본문
        'body-lg': ['16px', { lineHeight: '24px' }],
        'body': ['14px', { lineHeight: '22px' }],
        'body-sm': ['13px', { lineHeight: '20px' }],
        'caption': ['12px', { lineHeight: '18px' }],
        'micro': ['11px', { lineHeight: '16px' }],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
