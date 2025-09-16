import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { addHours, startOfTomorrow, endOfTomorrow } from 'date-fns';
import { EmailService } from 'src/email/email.service';
import { AppointmentStatus } from '@prisma/client';
import { EmailSyncService } from 'src/email-sync/email-sync.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private emailSyncService: EmailSyncService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM) // 每天上午9点执行
  async handleDailyAppointmentReminders() {
    this.logger.log('开始执行每日预约提醒任务...');

    const tomorrowStart = startOfTomorrow();
    const tomorrowEnd = endOfTomorrow();

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        appointmentTime: {
          gte: tomorrowStart,
          lt: tomorrowEnd,
        },
        status: AppointmentStatus.CONFIRMED,
        reminderSent: false, // 只查找未发送过提醒的
      },
      include: {
        user: true,
        service: true,
      },
    });

    if (upcomingAppointments.length === 0) {
      this.logger.log('没有需要提醒的预约。');
      return;
    }

    this.logger.log(`找到 ${upcomingAppointments.length} 个需要提醒的预约。`);

    for (const appointment of upcomingAppointments) {
      await this.emailService.sendBookingReminderEmail(appointment.user, appointment);

      // 更新数据库，标记为已发送
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: { reminderSent: true },
      });

      this.logger.log(`已为预约 ${appointment.id} 发送提醒邮件。`);
    }

    this.logger.log('每日预约提醒任务执行完毕。');
  }

  @Cron('*/1 * * * *') // 每5分钟执行一次
  async handleEmailSync() {
    this.logger.log('Running scheduled email sync...');
    await this.emailSyncService.syncEmails();
  }
}
