import { IsInt, IsString, Length, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  /** Amount in the smallest currency unit (e.g. cents for `usd`). */
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @Length(3, 3)
  currency: string;
}
