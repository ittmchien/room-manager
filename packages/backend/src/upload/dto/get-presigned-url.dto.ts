import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GetPresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName!: string;

  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
  contentType!: string;
}
