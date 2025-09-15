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
    const subject = 'Welcome to Our Nail Salon!';
    const html = `<h3>Hello, ${user.name || 'Valued Customer'}!</h3>
      <p>Thank you for registering with us. We look forward to serving you!</p>`;
    await this.sendEmail(user.email, subject, html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const html = `<p>Hello,</p>
      <p>Please click the link below to reset your password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 15 minutes.</p>`;
    await this.sendEmail(email, subject, html);
  }

  async sendBookingConfirmationEmail(user: User, appointment: Appointment & { service: Service }) {
    const appointmentTime = format(new Date(appointment.appointmentTime), 'yyyy-MM-dd HH:mm');
    const subject = 'Your Nail Appointment is Confirmed';
    const html = `
      <h3>Hello, ${user.name || 'Valued Customer'}!</h3>
      <p>Your nail appointment has been successfully confirmed.</p>
      <p><strong>Service:</strong> ${appointment.service.name}</p>
      <p><strong>Description:</strong> ${appointment.service.description}</p>
      <p><strong>Appointment Time:</strong> ${appointmentTime}</p>
      <p>If you need to reschedule or cancel, please contact us in advance.</p>
    `;
    await this.sendEmail(user.email, subject, html);
  }

  async sendBookingStatusUpdateEmail(user: User, appointment: Appointment & { service: Service }) {
    const appointmentTime = format(new Date(appointment.appointmentTime), 'yyyy-MM-dd HH:mm');
    const subject = `Your Appointment Status Has Been Updated: ${appointment.status}`;
    const html = `
      <h3>Hello, ${user.name || 'Valued Customer'}!</h3>
      <p>The status of your nail appointment has been updated.</p>
      <p><strong>Service:</strong> ${appointment.service.name}</p>
      <p><strong>Appointment Time:</strong> ${appointmentTime}</p>
      <p><strong>Current Status:</strong> ${appointment.status}</p>
    `;
    await this.sendEmail(user.email, subject, html);
  }

  async sendBookingReminderEmail(user: User, appointment: Appointment & { service: Service }) {
    const appointmentTime = format(new Date(appointment.appointmentTime), 'yyyy-MM-dd HH:mm');
    const subject = 'Nail Appointment Reminder';
    const html = `
      <h3>Hello, ${user.name || 'Valued Customer'}!</h3>
      <p>This is a friendly reminder that you have a nail appointment scheduled for tomorrow.</p>
      <p><strong>Service:</strong> ${appointment.service.name}</p>
      <p><strong>Appointment Time:</strong> ${appointmentTime}</p>
      <p>Please arrive on time. We look forward to seeing you!</p>
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
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}
