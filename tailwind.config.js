/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        card: "var(--card)",
        muted: "var(--muted)",
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-fg)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-fg)",
        },
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 6px 18px rgba(20, 22, 30, 0.06)",
      },
    },
  },
  plugins: [],
};
