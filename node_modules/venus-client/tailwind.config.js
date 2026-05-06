export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#070b10',
        panel: '#0d1218',
        gold: '#c8a44d',
        goldSoft: '#f0d588'
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      },
      boxShadow: {
        premium: '0 20px 60px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
};