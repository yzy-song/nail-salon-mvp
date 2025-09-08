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
    const uploadPromises = files.map((file) => this.cloudinary.uploadImage(file));
    const uploadResults = await Promise.all(uploadPromises);

    const createDbPromises = uploadResults.map((result) =>
      this.prisma.image.create({
        data: { url: result.secure_url },
      }),
    );

    return Promise.all(createDbPromises);
  }
}
