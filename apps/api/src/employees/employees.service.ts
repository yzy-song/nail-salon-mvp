import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee.create({ data: createEmployeeDto });
  }

  // 👇 --- 修改 findAll --- 👇
  findAll() {
    // 只查找未被软删除的记录
    return this.prisma.employee.findMany({ where: { deletedAt: null } });
  }

  // 👇 --- 修改 findOne --- 👇
  async findOne(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null }, // 确保只能找到未被软删除的
    });
    if (!employee) {
      throw new NotFoundException(`ID为 ${id} 的员工未找到`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id); // 同样会检查是否存在且未被软删除
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  // 👇 --- 核心修改：将 delete 改为 update --- 👇
  async remove(id: string) {
    await this.findOne(id); // 检查是否存在
    return this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() }, // 写入删除时间
    });
  }
}
