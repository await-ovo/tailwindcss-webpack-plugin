const { defineConfig } = require('@vue/cli-service')
const { TailwindCSSWebpackPlugin } = require('tailwindcss-webpack-plugin')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: config => {
    config.plugins.push(new TailwindCSSWebpackPlugin());
  }
})
