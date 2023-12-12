import type { Options } from "./index"

const handleIgnoreIdentifierRegx = (identifier: string, unit: string) => {
  const _identifier = identifier;
  let backslashfy = _identifier.split('').join('\\');
  backslashfy = `\\${backslashfy}`;
  const pattern = `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|((?:${backslashfy}|\\d*)\\.?\\d+)(${unit})`;

  return new RegExp(pattern, 'ig');
};

export default (opts: Options) => {
  let unit = typeof opts.rootValue === "object" ? Object.keys(opts.rootValue).join('|') : 'px';
  const regText = `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${unit})`;
  let pxRegex = new RegExp(regText, 'ig');
  let identifier = opts.ignoreIdentifier;
  if (identifier && typeof identifier === 'string') {
    identifier = identifier.replace(/\s+/g, '');
    opts.replace = true;
    pxRegex = handleIgnoreIdentifierRegx(identifier, unit);
  } else {
    identifier = false;
  }
  return { pxRegex, identifier }
}