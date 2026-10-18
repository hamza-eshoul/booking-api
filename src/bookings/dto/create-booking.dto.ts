import {
  IsDateString,
  IsEmail,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  serviceId: string;

  @IsDateString()
  startsAt: string;

  @IsString()
  @Length(2, 80)
  customerName: string;

  @IsEmail()
  customerEmail: string;
}
