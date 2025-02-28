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
        // HX Purple
        // HEX: #542E91
        // RGB: 84, 46, 145
        // CMYK: 84, 99, 0, 0
        // PMS: 267 C
        primary: '#542e91',
        'primary-dark': '#3d2269',
        'primary-light': '#6f45b0',

        // HX Yellow
        // HEX: #FDDC06
        // RGB: 253, 220, 6
        // CMYK: 0, 9, 99, 0
        // PMS: 108 C
        'hx-yellow': '#fddc06',

        // White
        // HEX: #FFFFFF
        // RGB: 255, 255, 255
        // CMYK: 0, 0, 0, 0
        // PMS: N/A
        secondary: '#ffffff',

        // Off-White
        // HEX: #F0F0F0
        // RGB: 240, 240, 240
        // CMYK: 0, 0, 0, 10
        // PMS: 663 C
        'off-white': '#f0f0f0',

        // Black
        // HEX: #232323
        // RGB: 35, 35, 35
        // CMYK: 0, 0, 0, 90
        // PMS: N/A
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
        //The Holiday Extras brand typeface is Nunito a sans serif typeface with a full range of font weights perfect for print and digital.
        
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #542e91, #6f45b0)',
        'gradient-primary-yellow': 'linear-gradient(135deg, #542e91 0%, #fddc06 100%)',
      }
    },
  },
  plugins: [],