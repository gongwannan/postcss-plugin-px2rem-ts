const toFixed = (number: number, precision: number) => {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
};

const createPxReplace = (rootValue: number | Record<string, number>, identifier: string, unitPrecision: number, minPixelValue: number) => (m: string, $1: string, $2: string) => {
  if (!$1) return m;
  if (identifier && m.indexOf(identifier) === 0) return m.replace(identifier, '');
  const pixels = parseFloat($1);
  if (pixels < minPixelValue) return m;
  // { px: 100, rpx: 50 }
  const baseValue = (typeof rootValue === "object") ? rootValue[$2] : rootValue;
  const fixedVal = toFixed((pixels / baseValue), unitPrecision);
  return `${fixedVal}rem`;
};

export default createPxReplace