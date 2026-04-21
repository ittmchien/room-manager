import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class SubscribeDto {
  @IsUrl()
  endpoint!: string;

  @IsString()
  @IsNotEmpty()
  p256dhKey!: string;

  @IsString()
  @IsNotEmpty()
  authKey!: string;
}
