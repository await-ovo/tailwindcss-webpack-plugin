const { defineConfig } = require('@vue/cli-service')
const { TailwindCSSWebpackPlugin } = require('../../')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: config => {
    console.log(config.entry);
    config.plugins.push(new TailwindCSSWebpackPlugin());
  }
})
