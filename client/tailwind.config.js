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
        brand: {
          navy: '#1A3153',
          amber: '#E09B30',
          denim: '#A7C7E7',
          slate: '#4A5568',
          offwhite: '#FAFAFA',
        },
        navy: {
          DEFAULT: '#1A3153',
          elevated: '#1E3A5F',
          surface: '#132642',
          midnight: '#091326',
          dark: '#12223a',
          light: '#23426e',
        },
        amber: {
          brand: '#E09B30',
          hover: '#ECAA41',
          bevel: '#9A6515',
          subtle: 'rgba(224, 155, 48, 0.15)',
        },
        denim: {
          DEFAULT: '#A7C7E7',
          soft: '#A7C7E7',
          border: '#A7C7E7',
          subtle: 'rgba(167, 199, 231, 0.15)',
        },
        slate: {
          DEFAULT: '#4A5568',
          body: '#4A5568',
          brand: '#4A5568',
        },
        paper: {
          DEFAULT: '#FAFAFA',
          elevated: '#FFFFFF',
          sunken: '#EEF3F8',
        },
        offwhite: {
          DEFAULT: '#FAFAFA',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      transitionTimingFunction: {
        'soft-land': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snap-settle': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'accel-exit': 'cubic-bezier(0.7, 0, 0.84, 0)',
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
