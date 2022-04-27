const { defineConfig } = require('@vue/cli-service')
const { TailwindCSSWebpackPlugin } = require('../../')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: config => {
    config.plugins.push(new TailwindCSSWebpackPlugin());
  }
})
