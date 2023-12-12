import * as fs from 'fs';
import postcss from 'postcss';
import px2rem from '../src/index';
import * as path from 'path';

const inputPath = path.join(__dirname, './main.css');
const inputOtherPath = path.join(__dirname, './other.css');
const outputPath = path.join(__dirname, './main-viewport.css');
const css = fs.readFileSync(inputPath, 'utf8');

const postcssInstance = postcss(
  px2rem({
    mediaQuery: true,
    rootValue(root) {
      const file = root.source?.input.file;
      if (file?.includes('main')) return 100;
      return 200;
    }
  })
);
const otherProcessedCss = postcssInstance.process(css, {
  from: inputOtherPath,
  to: outputPath
}).css;
const processedCss = postcssInstance.process(css, {
  from: inputPath,
  to: outputPath
}).css;

fs.writeFile('main-viewport.css', processedCss + otherProcessedCss, function (err) {
  if (err) {
    throw err;
  }
  console.log('File with rem units written.');
});
