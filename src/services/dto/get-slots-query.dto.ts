import { IsDateString, IsOptional } from 'class-validator';

export class GetSlotsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
