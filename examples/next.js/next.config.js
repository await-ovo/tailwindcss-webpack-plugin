const { TailwindCSSWebpackPlugin } = require('tailwindcss-webpack-plugin');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: config => {
    config.plugins.push(
      new TailwindCSSWebpackPlugin({
        entry: './styles/globals.css',
      }),
    );
    return config;
  },
};
