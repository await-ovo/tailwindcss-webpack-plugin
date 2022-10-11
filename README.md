
<h1 align='center'>

<p align='center'>
<sup><em><a href="https://windicss.org/integrations/vite.html#design-in-devtools">"Design in DevTools"</a> for <a href="https://tailwindcss.com/">Tailwind CSS</a> ⚡️</em></sup>
</p>
</h1>

<p align='center'>
<a href='https://www.npmjs.com/package/tailwindcss-webpack-plugin'>
<img src='https://img.shields.io/npm/v/tailwindcss-webpack-plugin/latest.svg'>
</a>
<a href='https://npmjs.com/package/tailwindcss-webpack-plugin'>
<img src='https://img.shields.io/npm/l/tailwindcss-webpack-plugin' >
</a>

[Tailwind CSS](https://tailwindcss.com/) v3.0 has [Just-in-Time](https://tailwindcss.com/blog/tailwindcss-v3#just-in-time-all-the-time) mode enabled by default, which brings a huge performance improvement, but since classes are generated on demand based on your source code, adding some unused classes directly in DevTools is now impossible, which can be a bit annoying.

Fortunately, this plugin can help us try out any tailwind utilities in DevTools, and it's important to note that this plugin was inspired by [Windi CSS](https://windicss.org/integrations/webpack.html), and the name "Design in devtool"s was also learned from the [Windi CSS](https://windicss.org/integrations/webpack.html) documentation, thanks to the amazing [vite-plugin-windicss](https://github.com/windicss/vite-plugin-windicss) and [webpack-plugin-windicss](https://github.com/windicss/windicss-webpack-plugin) packages ✨

<p align="center">
<a href="https://www.youtube.com/watch?v=fceKcPPMuJk">
<img src="https://i.imgur.com/2hdNeTnl.png">
</a>
</p>
<br/>
<p align="center">
tailwind-css-webpack-plugin example - Click to Watch!"
</p>


## Features

- 🛠️&nbsp; Zero configuration to start
- ⚡️&nbsp; ["Design in DevTools"](https://windicss.org/integrations/vite.html#design-in-devtools) mode
- 🎨&nbsp; [Visualizing your Tailwind CSS configuration file](https://github.com/rogden/tailwind-config-viewer#tailwind-config-viewer).
- ⚙️&nbsp; Auto-inject [@tailwind](https://tailwindcss.com/docs/functions-and-directives#tailwind) directives
- 📦&nbsp; No need to add tailwind to the PostCSS plugins
- 🔥&nbsp; Bundler-agnostic: [Webpack](https://webpack.js.org/),[Vite](https://vitejs.dev/), etc!
- 🚀&nbsp; Framework-agnostic: [Vue CLI](https://cli.vuejs.org/index.html), [Next.js](https://nextjs.org/), [Create React App](https://create-react-app.dev/), etc!

## Quick Start
|                                                     |                                                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [tailwindcss-vite-plugin](./packages/vite-plugin)                             | Tailwind CSS "Design in Devtools" for Vite                                       |
| [tailwindcss-webpack-plugin](./packages/webpack-plugin)               | Tailwind CSS "Design in Devtools" for Webpack                       |

## License

[MIT License](./LICENSE)

<p align='center'>
Made with ❤️ by <a href="https://github.com/await-ovo">await-ovo</a>
</p>

<p align='center'>Enjoy!</p>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/talwindcss-webpack-plugin/latest.svg
[npm-version-href]: https://npmjs.com/package/tailwindcss-webpack-plugin

[license-src]: https://img.shields.io/npm/l/tailwindcss-webpack-plugin
[license-href]: https://npmjs.com/package/tailwindcss-webpack-plugin
