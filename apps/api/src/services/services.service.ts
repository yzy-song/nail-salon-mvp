import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({ data: createServiceDto });
  }

  findAll() {
    // 通过关联表查询图片
    return this.prisma.service.findMany({
      where: { deletedAt: null },
      include: {
        serviceImages: {
          orderBy: { assignedAt: 'asc' },
          include: { image: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, deletedAt: null },
      include: {
        serviceImages: {
          orderBy: { assignedAt: 'asc' },
          include: { image: true },
        },
      },
    });
    if (!service) {
      throw new NotFoundException(`ID为 ${id} 的服务未找到`);
    }
    // 将数据结构扁平化，方便前端使用
    const { serviceImages, ...restService } = service;
    const images = serviceImages.map((si) => si.image);
    return { ...restService, images };
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id);
    const { imageIds, ...restData } = updateServiceDto;

    return this.prisma.$transaction(async (tx) => {
      const updatedService = await tx.service.update({
        where: { id },
        data: { ...restData },
      });

      if (typeof imageIds !== 'undefined') {
        await tx.serviceImage.deleteMany({ where: { serviceId: id } });

        if (imageIds.length > 0) {
          await tx.serviceImage.createMany({
            data: imageIds.map((imageId) => ({
              serviceId: id,
              imageId: imageId,
            })),
          });
        }
      }
      return updatedService;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
