/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0d0f14',
        card: '#171a22',
        line: '#262b36',
        fog: '#8b93a5',
        paper: '#eef0f4',
        'proof-seeker': '#5eaefd',
        engine: '#ff7a59',
        receiver: '#b48ef0',
        architect: '#e8c468',
        beacon: '#57c99b',
      },
    },
  },
  plugins: [],
};
