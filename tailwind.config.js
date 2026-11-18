/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#111318",
        "surface-dim": "#111318",
        "surface-bright": "#37393f",
        "surface-container-lowest": "#0c0e13",
        "surface-container-low": "#1a1b21",
        "surface-container": "#1e2025",
        "surface-container-high": "#282a2f",
        "surface-container-highest": "#33353a",
        "surface-variant": "#33353a",
        "on-surface": "#e2e2e9",
        "on-surface-variant": "#e0bfb9",
        "inverse-surface": "#e2e2e9",
        "inverse-on-surface": "#2e3036",
        primary: "#ffb4a6",
        "primary-container": "#ee654c",
        "on-primary": "#650900",
        "on-primary-container": "#590700",
        "primary-fixed": "#ffdad3",
        "primary-fixed-dim": "#ffb4a6",
        secondary: "#b3ccbd",
        "secondary-container": "#354c3f",
        "on-secondary": "#1f352a",
        "on-secondary-container": "#a2bbab",
        "secondary-fixed": "#cfe9d8",
        "secondary-fixed-dim": "#b3ccbd",
        tertiary: "#f5b7b1",
        "tertiary-container": "#ba837e",
        "on-tertiary": "#4c2522",
        "on-tertiary-container": "#441f1c",
        outline: "#a78a85",
        "outline-variant": "#58413d",
        error: "#ffb4ab",
        "error-container": "#93000a",
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        headline: ['Newsreader', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        full: '9999px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
