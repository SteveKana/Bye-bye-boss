/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5B3FE8',
          dark: '#3D28C4',
          light: '#EEE9FF',
          text: '#5B3FE8',
        },
        navy: {
          DEFAULT: '#0F0B2E',
          light: '#1C1147',
        },
        success: { DEFAULT: '#10B981', text: '#16A34A', light: '#DCFCE7' },
        danger: { DEFAULT: '#DC2626', light: '#FEE2E2' },
        warning: { DEFAULT: '#F59E0B', light: '#FFEDD5' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        xs: '12px',
        sm: '13px',
        base: '14px',
        md: '15px',
        lg: '16px',
        xl: '20px',
        '2xl': '22px',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '20px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.07)',
        soft: '0 1px 3px rgba(0, 0, 0, 0.08)',
        'focus-ring': '0 0 0 3px rgba(91, 63, 232, 0.1)',
      },
    },
  },
  plugins: [],
}
