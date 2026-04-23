import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsIn(['SUPER_ADMIN', 'ADMIN', 'USER'])
  role?: string;
}

export class AssignTagsDto {
  @IsString({ each: true })
  tags!: string[];
}
