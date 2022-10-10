const { TailwindCSSWebpackPlugin } = require('tailwindcss-webpack-plugin');

module.exports = {
  webpack: {
    configure: config => {
      config.plugins.push(
        new TailwindCSSWebpackPlugin({
          devtools: {
            // port: 8888,
          },
        }),
      );
      return config;
    },
  },
  style: {
    postcss: {
      loaderOptions: options => {
        options.postcssOptions.plugins = options.postcssOptions.plugins.filter(
          plugin => plugin !== 'tailwindcss',
        );
        return options;
      },
    },
  },
};
