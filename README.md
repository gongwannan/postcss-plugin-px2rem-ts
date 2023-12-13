# postcss-plugin-px2rem-ts
[![NPM version](https://badge.fury.io/js/postcss-plugin-px2rem-ts.svg)](http://badge.fury.io/js/postcss-plugin-px2rem-ts)

<img align="right" width="135" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo-leftp.svg">

## Features

ts rewrite the [postcss-plugin-px2rem](https://npmjs.org/package/postcss-plugin-px2rem) and Add the functional options;

## Installation

```bash
$ npm i --save postcss-plugin-px2rem-ts
```

## Usage

### input and output

```css
// input
h1 {
  margin: 0 0 20px;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 1px;
}

//output
h1 {
  margin: 0 0 0.4rem;
  font-size: 0.64rem;
  line-height: 1.2;
  letter-spacing: 0.02rem;
}

h1 {
  margin: 0 0 0.2rem;
  font-size: 0.32rem;
  line-height: 1.2;
  letter-spacing: 0.01rem;
}
```

### original

```javascript
import { writeFile, readFileSync } from "fs";
import postcss from "postcss";
import pxtorem from "postcss-plugin-px2rem-ts";

const css = readFileSync("/path/to/test.css", "utf8");
const options = {
  rootValue: (root) => {
    return root.source.input.file.includes("test") ? 50 : 100;
  }
};
const processedCss = postcss(pxtorem(options)).process(css, {
  from: "/path/to/test.css"
}).css;
const processedOtherCss = postcss(pxtorem(options)).process(css, {
  from: "/path/to/other.css"
}).css;

writeFile(
  "/path/to/result.rem.css",
  processedCss + processedOtherCss,
  (err) => {
    if (err) throw err;
    console.log("Rem file written.");
  }
);
```

### with webpack

```javascript
import px2rem from 'postcss-plugin-px2rem-ts';
const px2remOpts = {
  ......
};

export default {
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader',
      },
    ],
  },
  postcss: [px2rem(px2remOpts)],
}
```

### with vite
Vite has built-in postcss and postcss load config plugins, allowing PostCSS configuration to be loaded from a separate configuration file.

some times the ui library is design for 375px screen width, but our design is for 750px screen width, so we need to calculate the rootValue according to the file name, then we can set the options below.

postcss.config.js

```javascript
/* eslint-disable no-undef */
/** @type {require('postcss-load-config').Config} */
const config = {
  plugins: [
    require("autoprefixer"),
    require("postcss-plugin-px2rem-ts")({
      rootValue: (root) => {
        return root.source.input.file.dirname.includes("node_modules/vant")
          ? 50
          : 100;
      }
    })
  ]
};

module.exports = config;
```

## Configuration

Default:

```js
{
  rootValue: 100,
  unitPrecision: 5,
  selectorBlackList: [],
  propWhiteList: [],
  propBlackList: [],
  ignoreIdentifier: false,
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
  exclude: ''
}
```
postcss-plugin-px2rem basic configuration like bellow.
- `rootValue` (Number|Object) The root element font size. Default is 100.
  - If rootValue is an object, for example `{ px: 50, rpx: 100 }`, it will
    replace rpx to 1/100 rem , and px to 1/50 rem.
- `unitPrecision` (Number) The decimal numbers to allow the REM units to grow to.
- `propWhiteList` (Array) The properties that can change from px to rem.
  - Default is an empty array that means disable the white list and enable all properties.
  - Values need to be exact matches.
- `propBlackList` (Array) The properties that should not change from px to rem.
  - Values need to be exact matches.
- `exclude` (Reg) a way to exclude some folder,eg. /(node_module)/.
- `selectorBlackList` (Array) The selectors to ignore and leave as px.
  - If value is string, it checks to see if selector contains the string.
    - `['body']` will match `.body-class`
  - If value is regexp, it checks to see if the selector matches the regexp.
    - `[/^body$/]` will match `body` but not `.body`
- `ignoreIdentifier` (Boolean/String) a way to have a single property ignored, when ignoreIdentifier enabled, then `replace` would be set to `true` automatically.
- `replace` (Boolean) replaces rules containing rems instead of adding fallbacks.
- `mediaQuery` (Boolean) Allow px to be converted in media queries.
- `minPixelValue` (Number) Set the minimum pixel value to replace.


in postcss-plugin-px2rem-ts  optionsType is `FunctionalOptions`
```typescript
type FunctionalExtend<T> = { [Key in keyof T]: T[Key] | ((root: any) => T[Key]) };
type Options = {
  rootValue?: number | Record<string, number>;
  unitPrecision?: number;
  selectorBlackList?: (string | RegExp)[];
  propWhiteList?: (string | RegExp)[];
  propBlackList?: (string | RegExp)[];
  ignoreIdentifier?: boolean | string;
  replace?: boolean;
  mediaQuery?: boolean;
  minPixelValue?: number;
  exclude?: RegExp | string;
}
type FunctionalOptions = FunctionalExtend<Options>
```
### License

MIT
