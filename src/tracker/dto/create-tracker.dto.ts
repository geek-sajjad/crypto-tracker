import { IsString } from 'class-validator';

export class CreateTrackerDto {
  @IsString()
  cryptoName: string;

  //TODO:Refactor use enums
  @IsString()
  type: string;

  @IsString()
  price: string;
}
