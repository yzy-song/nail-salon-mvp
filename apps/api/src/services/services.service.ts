import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

import { Logger } from '@nestjs/common';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private prisma: PrismaService) {}

  create(createServiceDto: CreateServiceDto) {
    this.logger.log(`创建服务: ${JSON.stringify(createServiceDto)}`);
    return this.prisma.service.create({ data: createServiceDto });
  }

  findAll() {
    this.logger.log('获取所有服务');
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
    this.logger.log(`获取服务详情: id=${id}`);
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
      this.logger.warn(`服务未找到: id=${id}`);
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    // 将数据结构扁平化，方便前端使用
    const { serviceImages, ...restService } = service;
    const images = serviceImages.map((si) => si.image);
    return { ...restService, images };
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    this.logger.log(`更新服务: id=${id}, dto=${JSON.stringify(updateServiceDto)}`);
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
      this.logger.log(`服务更新成功: id=${id}`);
      return updatedService;
    });
  }

  async remove(id: string) {
    this.logger.log(`删除服务: id=${id}`);
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
