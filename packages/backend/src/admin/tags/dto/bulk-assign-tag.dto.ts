import { IsString } from 'class-validator';

export class BulkAssignTagDto {
  @IsString({ each: true })
  userIds!: string[];
}
