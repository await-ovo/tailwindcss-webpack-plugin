
<h1 align='center'>tailwindcss-vite-plugin</h1>

<p align='center'>
<a href='https://www.npmjs.com/package/tailwindcss-vite-plugin'>
<img src='https://img.shields.io/npm/v/tailwindcss-vite-plugin/latest.svg'>
</a>
<a href='https://npmjs.com/package/tailwindcss-vite-plugin'>
<img src='https://img.shields.io/npm/l/tailwindcss-vite-plugin' >
</a>

## Quick Setup

1. Add `tailwindcss-vite-plugin` dependency to your project

```bash
# Using pnpm
pnpm add tailwindcss-vite-plugin -D

# Using yarn
yarn add --dev tailwindcss-vite-plugin

# Using npm
npm install --save-dev tailwindcss-vite-plugin

```

2. Add `tailwindcss-vite-plugin` to  plugins :

```js
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TailwindCSSVitePlugin } from 'tailwindcss-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TailwindCSSVitePlugin(),
  ],
});
```

That's it! You can now use Tailwind classes with "Design in DevTools" in your app✨

For more usage, see [examples](./examples/).



## Options

- **[`config`](#config)**
- **[`entry`](#entry)**


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
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TailwindCSSVitePlugin } from 'tailwindcss-vite-plugin';
export default defineConfig({
  plugins: [
    react(),
    TailwindCSSVitePlugin({
      config: './other-tailwind-config.js',
    }),
  ],
});

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

However, in some cases we may need to customize the `@tailwind` directive, for example, if we want to use the `@layer` directive,  we  need to customize the tailwind css entry.

If entry is specified, in addition to adding our own `@tailwind` directive, we also need to manually import `_tailwind-devtools_.js'` in our code :

```
// src/App.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer {
  body {
    color: white;
  }
}

// src/App.tsx

import { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import '_tailwind-devtools_.js';
function App() {}
export default App;


// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TailwindCSSVitePlugin } from 'tailwindcss-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TailwindCSSVitePlugin({
      entry: './src/App.css',
    }),
  ],
});

```
For more details, see [examples/vite-react](../../examples/vite-react).

## License

[MIT License](./LICENSE)

<p align='center'>
Made with ❤️ by <a href="https://github.com/await-ovo">await-ovo</a>
</p>

<p align='center'>Enjoy!</p>
