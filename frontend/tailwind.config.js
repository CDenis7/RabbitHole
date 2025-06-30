import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        rabbithole: {
          "primary": "#f97316",        // ORANGE - FORȚAT
          "primary-focus": "#ea580c",  // ORANGE ÎNTUNECAT
          "primary-content": "#ffffff",
          "secondary": "#71717a",
          "secondary-focus": "#52525b",
          "secondary-content": "#ffffff",
          "accent": "#fb923c",         // ORANGE ACCENT
          "accent-focus": "#f97316",
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