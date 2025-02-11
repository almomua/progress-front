/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#dc2626',
        secondary: '#1f2937',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
