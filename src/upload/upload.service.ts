import { Injectable } from '@nestjs/common';
import { ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });

  constructor(private readonly configService: ConfigService) {}

  async upload(fileName: string, file: Buffer): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: 'boilersell-bucket',
        Key: fileName,
        Body: file,
      }),
    );
    return `https://boilersell-bucket.s3.${this.configService.getOrThrow('AWS_S3_REGION')}.amazonaws.com/${fileName}`;
}
}