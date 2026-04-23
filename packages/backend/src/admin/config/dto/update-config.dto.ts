import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ConfigUpdateItemDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;
}

export class UpdateConfigDto {
  @Type(() => ConfigUpdateItemDto)
  configs!: ConfigUpdateItemDto[];
}
