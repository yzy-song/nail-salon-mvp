import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';
@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private cloudinary: CloudinaryService,
    private prisma: PrismaService,
  ) {}

  async uploadFiles(files: Express.Multer.File[]) {
    this.logger.log(`上传文件: 数量=${files.length}`);
    const uploadPromises = files.map((file) => this.cloudinary.uploadImage(file));
    const uploadResults = await Promise.all(uploadPromises);

    const createDbPromises = uploadResults.map((result) =>
      this.prisma.image.create({
        data: { url: result.secure_url },
      }),
    );

    const dbResults = await Promise.all(createDbPromises);
    this.logger.log(`文件上传并入库成功: 数量=${dbResults.length}`);
    return dbResults;
  }

  async findAll() {
    this.logger.log('获取所有图片');
    return this.prisma.image.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string) {
    this.logger.log(`删除图片: id=${id}`);
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) {
      this.logger.warn(`图片未找到: id=${id}`);
      throw new NotFoundException(`Image with ID ${id} not found.`);
    }

    const publicId = this.getPublicIdFromUrl(image.url);
    await this.cloudinary.deleteImage(publicId);
    await this.prisma.image.delete({ where: { id } });
    this.logger.log(`图片删除成功: id=${id}`);
    return { message: `Image ${id} deleted successfully.` };
  }

  async deleteMany(ids: string[]) {
    this.logger.log(`批量删除图片: ids=${ids.join(',')}`);
    const images = await this.prisma.image.findMany({
      where: {
        id: { in: ids },
      },
    });

    if (images.length !== ids.length) {
      this.logger.warn('部分图片未找到');
      throw new NotFoundException('One or more images were not found.');
    }

    const cloudinaryDeletePromises = images.map((image) =>
      this.cloudinary.deleteImage(this.getPublicIdFromUrl(image.url)),
    );

    const prismaDeletePromise = this.prisma.image.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    await Promise.all([...cloudinaryDeletePromises, prismaDeletePromise]);
    this.logger.log(`批量删除成功: 数量=${ids.length}`);
    return { message: `${ids.length} images deleted successfully.` };
  }

  getPublicIdFromUrl(url: string): string {
    this.logger.log(`提取 Cloudinary publicId: url=${url}`);
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const [publicId] = lastPart.split('.');
    return publicId;
  }
}
