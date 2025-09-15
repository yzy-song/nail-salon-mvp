import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '@prisma/client';
import { addMinutes, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ForbiddenException } from '@nestjs/common';
import { RescheduleAppointmentDto } from './dto/reschedule.dto';
import { EmailService } from 'src/email/email.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/utils/pagination.util';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // ====================================================================
  // REFACTORED METHODS
  // ====================================================================

  async create(userId: string, createAppointmentDto: CreateAppointmentDto) {
    const { employeeId, serviceId, appointmentTime } = createAppointmentDto;

    // 1. First, check for conflicts
    await this._checkAppointmentConflict(employeeId, serviceId, new Date(appointmentTime));

    // 2. If no conflict, create the appointment
    const newAppointment = await this.prisma.appointment.create({
      data: {
        userId,
        employeeId,
        serviceId,
        appointmentTime: new Date(appointmentTime),
      },
      include: { user: true, service: true },
    });

    // Send confirmation email
    this.emailService.sendBookingConfirmationEmail(newAppointment.user, newAppointment);

    return newAppointment;
  }

  async reschedule(appointmentId: string, rescheduleDto: RescheduleAppointmentDto) {
    const { newAppointmentTime } = rescheduleDto;

    // 1. Find the appointment to get its service and employee
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    // 2. Check for conflicts, making sure to exclude the current appointment
    await this._checkAppointmentConflict(
      appointment.employeeId,
      appointment.serviceId,
      new Date(newAppointmentTime),
      appointment.id, // Pass the current appointment's ID to exclude it
    );

    // 3. If no conflict, update the time
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        appointmentTime: newAppointmentTime,
      },
    });
  }

  // ====================================================================
  // NEW PRIVATE HELPER METHOD
  // ====================================================================

  private async _checkAppointmentConflict(
    employeeId: string,
    serviceId: string,
    newAppointmentTime: Date,
    excludeAppointmentId?: string, // Optional ID to exclude from the check
  ) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const newStartTime = newAppointmentTime;
    const newEndTime = addMinutes(newStartTime, service.duration);

    const whereClause: any = {
      employeeId,
      status: { not: 'CANCELLED' },
      OR: [
        // Case 1: Existing appointment starts during the new appointment
        { appointmentTime: { gte: newStartTime, lt: newEndTime } },
        // Case 2: Existing appointment ends during the new appointment
        // This requires finding appointments that start before our new one...
        // ...and checking if their end time overlaps.
        // We will simplify this by checking if ANY part of an existing appointment
        // falls within our new time slot.
      ],
    };

    // If we are rescheduling, we must exclude the appointment itself from the conflict check
    if (excludeAppointmentId) {
      whereClause.id = { not: excludeAppointmentId };
    }

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: whereClause,
    });

    if (conflictingAppointment) {
      throw new ConflictException(`This time slot is unavailable for the selected employee.`);
    }
  }

  // ====================================================================
  // OTHER METHODS (Unchanged)
  // ====================================================================

  async cancelMyAppoinment(userId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: true,
        service: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    // 关键：校验是否是本人操作
    if (appointment.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this appointment');
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
        service: { select: { name: true, price: true } },
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
      throw new NotFoundException(`Appointment with ID ${id} not found`);
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
