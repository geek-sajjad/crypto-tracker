import { InternalServerErrorException } from '@nestjs/common';

export function convertStringToFloat(numberString: string): number {
  return parseFloat(numberString);
}

export function convertStringToFloatWithPrecision(
  numberString: string,
  precision: number = 2,
) {
  const floatNum = parseFloat(numberString);

  if (Number.isNaN(floatNum))
    throw new InternalServerErrorException('numberString is NaN.');

  return parseFloat(floatNum.toFixed(precision));
}
