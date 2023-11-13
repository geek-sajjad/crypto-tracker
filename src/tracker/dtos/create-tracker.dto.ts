import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { TrackerType } from '../entities';

export class CreateTrackerDto {
  @Length(1, 10)
  @IsString()
  @IsNotEmpty()
  cryptoName: string;

  //TODO:Refactor use enums
  @IsEnum(TrackerType, {
    message: 'Invalid type. Must be one of "increase" or "decrease".',
  })
  type: TrackerType;

  @IsNumber()
  @Min(1)
  @Max(999999.99)
  priceThreshold: number;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  notifyEmail: string;
}
