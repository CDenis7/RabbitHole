import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom RabbitHole theme colors
        'rabbit': {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e4dcff',
          300: '#d1c1ff',
          400: '#b794ff',
          500: '#9c5fff',
          600: '#8b3cff',
          700: '#7c2eff',
          800: '#6b1fff',
          900: '#5a0fff',
        },
        'hole': {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        }
      },
      fontFamily: {
        'rabbit': ['"Fira Code"', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(156, 95, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(156, 95, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        rabbithole: {
          "primary": "#9c5fff",
          "primary-focus": "#8b3cff", 
          "primary-content": "#ffffff",
          "secondary": "#71717a",
          "secondary-focus": "#52525b",
          "secondary-content": "#ffffff",
          "accent": "#7c2eff",
          "accent-focus": "#6b1fff",
          "accent-content": "#ffffff",
          "neutral": "#3f3f46",
          "neutral-focus": "#27272a",
          "neutral-content": "#ffffff",
          "base-100": "#18181b",
          "base-200": "#27272a",
          "base-300": "#3f3f46",
          "base-content": "#f4f4f5",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem",
        },
      },
      "dark", 
      "night"
    ],
    darkTheme: "rabbithole",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
}