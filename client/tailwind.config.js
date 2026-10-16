/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1A3153',
          amber: '#E09B30',
          denim: '#A7C7E7',
          slate: '#4A5568',
          offwhite: '#FAFAFA',
        },
        navy: {
          DEFAULT: '#1A3153',
          dark: '#12223a',
          light: '#23426e',
        },
        amber: {
          brand: '#E09B30',
          hover: '#c88624',
          subtle: 'rgba(224, 155, 48, 0.15)',
        },
        denim: {
          DEFAULT: '#A7C7E7',
          border: '#A7C7E7',
          subtle: 'rgba(167, 199, 231, 0.15)',
        },
        slate: {
          brand: '#4A5568',
        },
        offwhite: {
          DEFAULT: '#FAFAFA',
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        badge: '0.15em',
      },
      boxShadow: {
        'amber-glow': '0 0 25px rgba(224, 155, 48, 0.35)',
        'denim-glow': '0 0 20px rgba(167, 199, 231, 0.25)',
        'navy-card': '0 10px 30px -10px rgba(26, 49, 83, 0.3)',
      },
    },
  },
  plugins: [],
}
