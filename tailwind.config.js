/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{primary:"#5751E1"},
      animation: {
        'slide-in-top': 'slideInTop 0.2s ease-out', // Slide in from top with duration and easing
      },
      keyframes: {
        slideInTop: {
          '0%': {
            transform: 'translateY(-10%)', // Start from above the screen
            opacity: '0',  // Initially hidden
          },
          '100%': {
            transform: 'translateY(0)', // End at original position
            opacity: '1',  // Fully visible
          },
        },
      },
    },
  },
  plugins: [],
}

