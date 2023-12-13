/**
* respect to https://github.com/cuth/postcss-pxtorem/
**/
import { Plugin, Container, Declaration, Root } from 'postcss';
import createPxReplace from './createPxReplace';
import generateRegex from './generateRegex';
type FunctionalExtend<T> = { [Key in keyof T]: T[Key] | ((root: Root) => T[Key]) };
type FunctionalOptions = FunctionalExtend<Options>
type Options = {
  rootValue?: number | Record<string, number>;
  unitPrecision?: number;
  selectorBlackList?: (string | RegExp)[];
  propWhiteList?: (string | RegExp)[];
  propBlackList?: (string | RegExp)[];
  ignoreIdentifier?: boolean | string | RegExp;
  replace?: boolean;
  mediaQuery?: boolean;
  minPixelValue?: number;
  exclude?: RegExp | string;
}

const defaultOpts: Options = {
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
};

const declarationExists = (decls: Container, prop: string, value: string) => decls.some((decl: Declaration) =>
  decl.prop === prop && decl.value === value
);

const blacklistedSelector = (blacklist: (string | RegExp)[], selector: string) => {
  if (typeof selector !== 'string') return false;

  return blacklist.some(regex => {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;

    return selector.match(regex);
  });
};

const blacklistedProp = (blacklist: (string | RegExp)[], prop: string) => {
  if (typeof prop !== 'string') return false;

  return blacklist.some(regex => {
    if (typeof regex === 'string') return prop.indexOf(regex) !== -1;

    return prop.match(regex);
  });
};

function generateOptions(options: FunctionalOptions, root: Root): Options {
  return {
    ...defaultOpts, ...(Object.entries(options).reduce((prev, [key, value]) => { prev[key] = typeof value === 'function' ? value(root) : value; return prev; }, {} as any))
  }
}



const px2rem = (options?: FunctionalOptions): Plugin => {
  return {
    postcssPlugin: 'postcss-plugin-px2rem-ts',
    Once: (root) => {
      let mediaQueryChangeFlag = true;
      let opts = defaultOpts
      if (options && Object.keys(options).length !== 0) {
        opts = generateOptions(options, root)
      }
      if (opts.exclude && root.source.input.file && root.source.input.file.match(opts.exclude) !== null) return;
      root.walkDecls((decl, i) => {
        const { identifier, pxRegex } = generateRegex(opts)
        const pxReplace = createPxReplace(opts.rootValue, identifier as string, opts.unitPrecision, opts.minPixelValue);
        if (mediaQueryChangeFlag) {
          if (opts.mediaQuery) {
            root.walkAtRules('media', rule => {
              const _rule = rule;
              if (_rule.params.indexOf('px') === -1) return;
              _rule.params = _rule.params.replace(pxRegex, pxReplace);
            });
          }
          mediaQueryChangeFlag = false
        }
        const _decl = decl;
        // 1st check exclude
        // 2st check 'px'
        if (_decl.value.indexOf('px') === -1) return;
        // 3nd check property black list
        if (blacklistedProp(opts.propBlackList, _decl.prop)) return;
        // 4rd check property white list
        if (opts.propWhiteList.length && opts.propWhiteList.indexOf(_decl.prop) === -1) return;
        // 5th check seletor black list
        if (blacklistedSelector(opts.selectorBlackList, (_decl.parent as any).selector)) return;

        const value = _decl.value.replace(pxRegex, pxReplace);

        // if rem unit already exists, do not add or replace
        if (declarationExists(_decl.parent, _decl.prop, value)) return;

        if (opts.replace) {
          _decl.value = value;
        } else {
          _decl.parent.insertAfter(i, _decl.clone({
            value,
          }));
        }
      });
    }
  }
}

export default px2rem
export { px2rem, Options, FunctionalOptions }


