/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0b0f17',
          900: '#111827',
          850: '#151e2e',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563'
        },
        brand: {
          primary: '#06b6d4', // Cyan neon
          secondary: '#3b82f6', // Electric blue
          accent: '#10b981', // Emerald green
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
