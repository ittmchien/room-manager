import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UploadService } from '../upload.service';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://bucket.r2.dev/presigned?sig=xxx'),
}));

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) =>
              ({
                R2_BUCKET_NAME: 'test-bucket',
                R2_PUBLIC_URL: 'https://pub.r2.dev',
                R2_ACCOUNT_ID: 'abc123',
                R2_ACCESS_KEY_ID: 'key',
                R2_SECRET_ACCESS_KEY: 'secret',
              })[key],
          },
        },
      ],
    }).compile();

    service = module.get(UploadService);
  });

  it('returns uploadUrl and fileUrl with correct extension', async () => {
    const result = await service.getPresignedUrl('photo.jpg', 'image/jpeg');

    expect(result.uploadUrl).toContain('presigned');
    expect(result.fileUrl).toMatch(/^https:\/\/pub\.r2\.dev\/uploads\/.+\.jpg$/);
    expect(result.key).toMatch(/^uploads\/.+\.jpg$/);
  });

  it('handles filename with no extension — key does not contain "undefined"', async () => {
    const result = await service.getPresignedUrl('photo', 'image/jpeg');
    expect(result).toHaveProperty('uploadUrl');
    expect(result).toHaveProperty('fileUrl');
    expect(result).toHaveProperty('key');
    expect(result.key).not.toContain('undefined');
    expect(result.key).toMatch(/^uploads\/[a-f0-9-]+$/); // UUID only, no extension
  });

  it('throws InternalServerErrorException when getSignedUrl fails', async () => {
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    getSignedUrl.mockRejectedValueOnce(new Error('R2 unavailable'));

    await expect(service.getPresignedUrl('photo.jpg', 'image/jpeg')).rejects.toThrow(
      'Failed to generate upload URL',
    );
  });
});
