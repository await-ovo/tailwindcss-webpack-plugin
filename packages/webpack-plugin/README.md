
<h1 align='center'>tailwindcss-webpack-plugin</h1>

<p align='center'>
<a href='https://www.npmjs.com/package/tailwindcss-webpack-plugin'>
<img src='https://img.shields.io/npm/v/tailwindcss-webpack-plugin/latest.svg'>
</a>
<a href='https://npmjs.com/package/tailwindcss-webpack-plugin'>
<img src='https://img.shields.io/npm/l/tailwindcss-webpack-plugin' >
</a>

## Quick Setup

1. Add `tailwindcss-webpack-plugin` dependency to your project

```bash
# Using pnpm
pnpm add tailwindcss-webpack-plugin -D

# Using yarn
yarn add --dev tailwindcss-webpack-plugin

# Using npm
npm install --save-dev tailwindcss-webpack-plugin

```

2. Add `tailwindcss-webpack-plugin` to the webpack plugins, using [Vue CLI](https://cli.vuejs.org/index.html) as an example:

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service')
const { TailwindCSSWebpackPlugin } = require('tailwindcss-webpack-plugin')

module.exports = defineConfig({
  configureWebpack: config => {
    config.plugins.push(new TailwindCSSWebpackPlugin());
  }
})

```

That's it! You can now use Tailwind classes with "Design in DevTools" in your app✨

For more usage, see [examples](./examples/).



## Options

- **[`config`](#config)**
- **[`entry`](#entry)**
- **[`devtools`](#devtools)**


### config

* Type:

```ts
TailwindConfig | string | undefined;
```

* Default: `undefined`


Allows you to specify the Tailwind configuration.

When the type is `string`, the corresponding value indicates the location of the Tailwind configuration file; by default, `undefined` will look for `tailwind.config.js` in the current working directory.

When the type is `TailwindConfig`, no configuration file is read, but the incoming configuration object is used directly.


```
// webpack.config.js
const { TailwindCSSWebpackPlugin } = require('tailwindcss-webpack-plugin');

module.exports = {
  plugins: [
    new TailwindCSSWebpackPlugin({
      config: './other-tailwind-config.js',
    })
  ]
}

```

### entry

* Type:

```ts
string | undefined
```

* Default: `undefined`

By default, we will automatically inject the following directive when compile:

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

However, in some cases we may need to customize the `@tailwind` directive, for example, if we want to use the `@layer` directive, or in [Next.js](https://nextjs.org/), because global styles can only be written in `styles/globals.css`, so we also need to customize the tailwind css entry.

If entry is specified, in addition to adding our own `@tailwind` directive, we also need to manually import `_tailwind-devtools_.js'` in our code :

Take [Next.js](https://nextjs.org/) as an example:

```
// styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer {
  body {
    color: white;
  }
}

// pages/_app.tsx
import '../styles/globals.css';
import '_tailwind-devtools_.js';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;


// next.config.js
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

```


### devtools

* Type:

```ts
{
  port?: number;
  host?: string;
}
```

* Default:

```ts
{
  port: 9999,
  host: '127.0.0.1'
}
```

Allows to customize the host and port of the devtools backend server.

> We use the backend server to receive classes change requests from the browser and regenerate the Tailwind utilities, and trigger webpack hot updates.


## PostCSS Usage Issues

By default, using `tailwindcss-webpack-plugin` means that there is no need to configure `tailwindcss` in the PostCSS plugins.

However, some tools like[Create React App](https://create-react-app.dev/) will automatically add `tailwindcss` to PostCSS plugins if `tailwindcss` is installed under the project, in which case we need to manually remove `tailwindcss` plugin from PostCSS configuration:

Take [craco](https://github.com/gsoft-inc/craco) for example:

```
// craco.config.js
const { TailwindCSSWebpackPlugin } = require('tailwindcss-webpack-plugin');

module.exports = {
  webpack: {
    configure: config => {
      config.plugins.push(
        new TailwindCSSWebpackPlugin(),
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

```


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
