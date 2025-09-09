import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(
    private cloudinary: CloudinaryService,
    private prisma: PrismaService,
  ) {}

  async uploadFiles(files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) => this.cloudinary.uploadImage(file));
    const uploadResults = await Promise.all(uploadPromises);

    const createDbPromises = uploadResults.map((result) =>
      this.prisma.image.create({
        data: { url: result.secure_url },
      }),
    );

    return Promise.all(createDbPromises);
  }

  async findAll() {
    return this.prisma.image.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string) {
    // In a real app, you might check if the image is in use before deleting.
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found.`);
    }
    // You would also delete from Cloudinary here in a real app.
    return this.prisma.image.delete({ where: { id } });
  }
}
