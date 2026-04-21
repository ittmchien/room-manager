import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.getOrThrow('R2_BUCKET_NAME');
    this.publicUrl = config.getOrThrow('R2_PUBLIC_URL');
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${config.getOrThrow('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async getPresignedUrl(fileName: string, contentType: string): Promise<PresignedUrlResult> {
    const ext = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : '';
    const key = ext ? `uploads/${randomUUID()}.${ext}` : `uploads/${randomUUID()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    try {
      const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
      const fileUrl = `${this.publicUrl}/${key}`;
      return { uploadUrl, fileUrl, key };
    } catch {
      throw new InternalServerErrorException('Failed to generate upload URL');
    }
  }
}
