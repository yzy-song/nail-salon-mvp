import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

import { startOfDay, endOfDay, format, addMinutes, isWithinInterval } from 'date-fns';
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
      throw new NotFoundException(`Employee with ID ${id} not found or has been deleted.`);
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

  async getAvailability(employeeId: string, date: string, serviceId: string) {
    await this.findOne(employeeId); // 确保员工存在

    if (!serviceId) {
      throw new BadRequestException('Service ID must be provided');
    }

    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }
    const serviceDuration = service.duration;

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        employeeId,
        appointmentTime: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: { service: true },
    });

    const openingTime = 9; // 9 AM
    const closingTime = 18; // 6 PM
    const interval = 10; // 10 minutes
    const allSlots: Date[] = [];

    let currentTime = new Date(startOfDay);
    currentTime.setUTCHours(openingTime, 0, 0, 0);

    const endBoundary = new Date(startOfDay);
    endBoundary.setUTCHours(closingTime, 0, 0, 0);

    while (currentTime < endBoundary) {
      allSlots.push(new Date(currentTime));
      currentTime = addMinutes(currentTime, interval);
    }

    const availableSlots = allSlots.filter((slotStart) => {
      const slotEnd = addMinutes(slotStart, serviceDuration);

      // Slot must end before closing time
      if (slotEnd > endBoundary) return false;

      // Check for overlap with existing appointments
      return !appointments.some((app) => {
        const appStart = new Date(app.appointmentTime);
        const appEnd = addMinutes(appStart, app.service.duration);

        // Overlap condition: (StartA < EndB) and (EndA > StartB)
        return slotStart < appEnd && slotEnd > appStart;
      });
    });

    return availableSlots.map((slot) => format(slot, 'HH:mm'));
  }
}
