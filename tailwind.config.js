/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#542e91',
        'primary-dark': '#3d2269',
        'primary-light': '#6f45b0',
        'hx-yellow': '#fddc06',
        secondary: '#ffffff',
        background: {
          light: '#ffffff',
          dark: '#1a1a1a'
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
          light: '#ffffff'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #542e91, #6f45b0)',
        'gradient-primary-yellow': 'linear-gradient(135deg, #542e91 0%, #fddc06 100%)',
      }
    },
  },
  plugins: [],
}; 