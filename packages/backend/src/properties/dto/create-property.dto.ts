import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;
}
