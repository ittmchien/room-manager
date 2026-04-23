import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UploadService } from './upload.service';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';

@Controller({ path: 'upload', version: '1' })
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('presigned-url')
  getPresignedUrl(@Body() dto: GetPresignedUrlDto) {
    return this.uploadService.getPresignedUrl(dto.fileName, dto.contentType);
  }
}
