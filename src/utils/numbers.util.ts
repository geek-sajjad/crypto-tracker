export function convertStringToFloat(numberString: string): number {
  return parseFloat(numberString);
}

export function convertStringToFloatWithPrecision(
  numberString: string,
  precision: number = 2,
) {
  const floatNum = parseFloat(numberString);
  return parseFloat(floatNum.toFixed(precision));
}
