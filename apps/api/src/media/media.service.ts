import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(
    private cloudinary: CloudinaryService,
    private prisma: PrismaService,
  ) {}

  async uploadFiles(files: Express.Multer.File[]) {
    // 并行上传所有文件到 Cloudinary
    const uploadPromises = files.map((file) => this.cloudinary.uploadImage(file));
    const uploadResults = await Promise.all(uploadPromises);

    // 将上传成功的结果存入数据库
    const createDbPromises = uploadResults.map((result) =>
      this.prisma.image.create({
        data: {
          url: result.secure_url,
          // altText 可以从请求中获取，这里暂时留空
        },
      }),
    );

    return Promise.all(createDbPromises);
  }
}
