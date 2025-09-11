import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '@prisma/client';
import { addMinutes } from 'date-fns';

import { PaginationDto } from 'src/common/dot/pagination.dto';
import { ForbiddenException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { paginate } from 'src/common/utils/pagination.util';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // 顾客创建预约
  async create(userId: string, createAppointmentDto: CreateAppointmentDto) {
    const { employeeId, serviceId, appointmentTime } = createAppointmentDto;

    // 2. 并行校验服务和员工是否存在，效率更高
    const [service, employee] = await Promise.all([
      this.prisma.service.findUnique({ where: { id: serviceId } }),
      this.prisma.employee.findUnique({ where: { id: employeeId } }),
    ]);

    if (!service) {
      throw new NotFoundException(`ID为 ${serviceId} 的服务未找到`);
    }
    if (!employee) {
      throw new NotFoundException(`ID为 ${employeeId} 的员工未找到`);
    }

    // 3. 计算预约的开始和结束时间
    const startTime = new Date(appointmentTime);
    const endTime = addMinutes(startTime, service.duration);

    // 4. 查找时间冲突的预约
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        employeeId,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
        // 核心逻辑：检查时间范围是否有重叠
        OR: [
          {
            appointmentTime: {
              lt: endTime, // 已有预约的开始时间 < 新预约的结束时间
            },
            // 计算已有预约的结束时间，并检查是否 > 新预约的开始时间
            // 注意：这里需要原生查询或更复杂的逻辑，我们先用一个简化的方式
            // 简化逻辑：我们检查是否有预约的开始时间落在了我们的新预约时间段内
          },
          {
            appointmentTime: {
              gte: startTime,
              lt: endTime,
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new ConflictException(`该员工在此时间段内已有预约，请选择其他时间`);
    }

    // 发送预约成功邮件
    const appointment = await this.prisma.appointment.create({
      data: {
        userId,
        employeeId,
        serviceId,
        appointmentTime: startTime, // 确保存入的是 Date 对象
      },
      include: {
        user: true,
        service: true,
      },
    });

    // 发送确认邮件
    await this.emailService.sendBookingConfirmationEmail(appointment.user, appointment);
    return appointment;
  }

  async cancelMyAppoinment(userId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: true,
        service: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`ID为 ${appointmentId} 的预约未找到`);
    }

    // 关键：校验是否是本人操作
    if (appointment.userId !== userId) {
      throw new ForbiddenException('您没有权限取消此预约');
    }

    const cancelledAppointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });

    // 发送取消确认邮件
    await this.emailService.sendBookingStatusUpdateEmail(appointment.user, appointment);
    return cancelledAppointment;
  }

  // 管理员获取所有预约
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: { name: true, email: true },
          },
          service: {
            select: { name: true },
          },
          employee: {
            select: { name: true },
          },
        },
      }),
      this.prisma.appointment.count(),
    ]);

    // Directly call the utility function to format the return value
    return paginate(items, total, page, limit);
  }

  // 顾客获取自己的预约
  findMyAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      include: {
        employee: { select: { name: true } },
        service: { select: { name: true } },
      },
    });
  }

  // 管理员更新预约状态
  async updateStatus(id: string, updateDto: UpdateAppointmentStatusDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
    if (!appointment) {
      throw new NotFoundException(`ID为 ${id} 的预约未找到`);
    }
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: { status: updateDto.status },
      include: { service: true },
    });

    await this.emailService.sendBookingStatusUpdateEmail(appointment.user, updatedAppointment);
    return updatedAppointment;
  }

  async findOneByPaymentIntent(paymentIntentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { paymentIntentId },
      include: {
        // ... include whatever details the status page might need
      },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with paymentIntentId ${paymentIntentId} not found`);
    }
    return appointment;
  }
}
