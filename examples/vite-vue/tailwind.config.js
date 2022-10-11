module.exports = {
  content: ['./src/**/*.vue', './index.html'],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        black: '#000',
        white: '#fff',
        gray: {
          100: 'yellow',
          900: 'red',
        },
      },
    },
  },
  plugins: [],
};
