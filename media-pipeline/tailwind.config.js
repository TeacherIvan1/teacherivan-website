/** @type {import('tailwindcss').Config} */
export default {
  content: ['./remotion/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A3153',
          dark: '#12223a',
          light: '#23426e',
        },
        amber: {
          DEFAULT: '#E09B30',
          dark: '#c88624',
          light: '#f5b550',
        },
        denim: {
          DEFAULT: '#A7C7E7',
          dark: '#8bb5dc',
          light: '#c5ddf3',
        },
        slate: {
          DEFAULT: '#4A5568',
          light: '#718096',
          dark: '#2D3748',
        },
        white: {
          DEFAULT: '#FAFAFA',
          pure: '#FFFFFF',
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
