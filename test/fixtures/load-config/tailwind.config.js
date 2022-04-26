const a = require('./dep-a');

module.exports = {
  content: ['./src/**/*.js'],
  theme: {
    ...a,
  },
};
