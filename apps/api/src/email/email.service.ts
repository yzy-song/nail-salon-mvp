import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Appointment, Service, User } from '@prisma/client';
import { format } from 'date-fns';
import { Resend } from 'resend';
@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.resend = new Resend(configService.get<string>('RESEND_API_KEY'));
  }

  async sendWelcomeEmail(user: User) {
    const subject = '欢迎来到我们的美甲沙龙！';
    const html = `<h3>您好, ${user.name || '新朋友'}!</h3><p>感谢您的注册，期待为您服务。</p>`;
    // 调用通用方法
    await this.sendEmail(user.email, subject, html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    const subject = '密码重置请求';
    const html = `<p>您好，</p><p>请点击下面的链接来重置您的密码：</p><p><a href="${resetLink}">${resetLink}</a></p><p>此链接将在15分钟内失效。</p>`;
    // 调用通用方法
    await this.sendEmail(email, subject, html);
  }

  async sendBookingStatusUpdateEmail(user: User, appointment: Appointment & { service: Service }) {
    const appointmentTime = format(new Date(appointment.appointmentTime), 'yyyy年MM月dd日 HH:mm');
    const subject = `您的预约状态已更新为: ${appointment.status}`;
    const html = `
      <h3>您好, ${user.name || '顾客'}!</h3>
      <p>您的美甲预约状态已更新。</p>
      <p><strong>服务项目:</strong> ${appointment.service.name}</p>
      <p><strong>预约时间:</strong> ${appointmentTime}</p>
      <p><strong>当前状态:</strong> ${appointment.status}</p>
    `;
    await this.sendEmail(user.email, subject, html);
  }

  async sendBookingReminderEmail(user: User, appointment: Appointment & { service: Service }) {
    const appointmentTime = format(new Date(appointment.appointmentTime), 'yyyy年MM月dd日 HH:mm');
    const subject = '您的美甲预约提醒';
    const html = `
      <h3>您好, ${user.name || '顾客'}!</h3>
      <p>温馨提醒，您有一个美甲预约即将在明天进行。</p>
      <p><strong>服务项目:</strong> ${appointment.service.name}</p>
      <p><strong>预约时间:</strong> ${appointmentTime}</p>
      <p>请准时到店，我们期待您的光临！</p>
    `;
    await this.sendEmail(user.email, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const from = this.configService.get<string>('EMAIL_FROM');
      if (!from) {
        throw new Error('EMAIL_FROM environment variable is not set');
      }
      await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`发送邮件失败到 ${to}: ${error.message}`);
    }
  }
}
