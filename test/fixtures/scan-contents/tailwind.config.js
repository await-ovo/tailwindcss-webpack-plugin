const path = require('path');
module.exports = {
  content: [`${path.resolve(__dirname, './src')}/**/*.(ts|tsx|js|jsx)`],
  theme: {},
};
