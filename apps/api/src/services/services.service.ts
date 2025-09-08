import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // 创建服务
  async create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({ data: createServiceDto });
  }

  // 查找所有服务
  async findAll() {
    return this.prisma.service.findMany({ where: { deletedAt: null } });
  }

  // 查找单个服务
  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id, deletedAt: null },
    });
    if (!service) {
      throw new NotFoundException(`ID为 ${id} 的服务未找到`);
    }
    return service;
  }

  // 更新服务
  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id); // 检查服务是否存在
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  // 删除服务
  async remove(id: string) {
    await this.findOne(id); // 检查服务是否存在
    return this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() }, // 写入删除时间
    });
  }
}
