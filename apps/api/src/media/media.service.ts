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
    // 1. Find the image in our DB
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found.`);
    }

    // 2. Delete from Cloudinary
    const publicId = this.getPublicIdFromUrl(image.url);
    await this.cloudinary.deleteImage(publicId);

    // 3. Delete from our DB
    return this.prisma.image.delete({ where: { id } });
  }

  async deleteMany(ids: string[]) {
    // 1. Find all images to be deleted
    const images = await this.prisma.image.findMany({
      where: {
        id: { in: ids },
      },
    });

    if (images.length !== ids.length) {
      throw new NotFoundException('One or more images were not found.');
    }

    // 2. Create deletion promises for Cloudinary and our DB
    const cloudinaryDeletePromises = images.map((image) =>
      this.cloudinary.deleteImage(this.getPublicIdFromUrl(image.url)),
    );

    const prismaDeletePromise = this.prisma.image.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    // 3. Execute all deletions in parallel
    await Promise.all([...cloudinaryDeletePromises, prismaDeletePromise]);

    return { message: `${ids.length} images deleted successfully.` };
  }

  getPublicIdFromUrl(url: string): string {
    // Split the URL by slashes to get its parts
    console.log('Extracting public ID from URL:', url);
    const parts = url.split('/');

    // Get the last part, which is the filename (e.g., "sample.jpg")
    const lastPart = parts[parts.length - 1];

    // Split the filename by the dot and take the first part
    const [publicId] = lastPart.split('.');

    return publicId;
  }
}
