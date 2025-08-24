/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surfaceMuted: 'var(--surface-muted)',
        border: 'var(--border)',
        primary: {
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
        },
        accent: { 
          500: 'var(--accent-500)' 
        },
        text: { 
          700: 'var(--text-700)', 
          900: 'var(--text-900)' 
        },
        muted: { 
          500: 'var(--muted-500)' 
        },
        success: { 
          600: 'var(--success-600)' 
        },
        warning: { 
          600: 'var(--warning-600)' 
        },
        danger: { 
          600: 'var(--danger-600)' 
        },
        ring: 'var(--ring)'
      },
      borderRadius: { 
        xl: '16px', 
        '2xl': '24px' 
      },
      boxShadow: { 
        soft: '0 8px 24px rgba(15,23,42,0.06)' 
      }
    },
  },
  plugins: [],
};
