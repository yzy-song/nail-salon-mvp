import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { User } from '@prisma/client';
import { google } from 'googleapis';
@Injectable()
export class EmailSyncService {
  private readonly logger = new Logger(EmailSyncService.name);
  private gmail = google.gmail('v1');
  private oAuth2Client;

  private imap: Imap;
  private readonly TREATWELL_BOOKING_EMAIL = '';
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private appointmentsService: AppointmentsService,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground', // Redirect URI
    );

    this.oAuth2Client.setCredentials({
      refresh_token: this.configService.get('GOOGLE_REFRESH_TOKEN'),
    });
    this.TREATWELL_BOOKING_EMAIL = this.configService.get('TREATWELL_BOOKING_EMAIL');
  }

  async syncEmails() {
    this.logger.log('Starting email sync via Gmail API...');
    try {
      const gmailAccount = this.configService.get('GMAIL_USER_EMAIL');

      // 1. Search for unread emails from specific senders
      const res = await this.gmail.users.messages.list({
        auth: this.oAuth2Client,
        userId: gmailAccount,
        q: 'is:unread from:treatwell.es', // Example query
      });

      const messages = res.data.messages;
      if (!messages || messages.length === 0) {
        this.logger.log('No new emails to sync.');
        return;
      }

      this.logger.log(`Found ${messages.length} new emails.`);

      // 2. Process each email
      for (const message of messages) {
        const email = await this.gmail.users.messages.get({
          auth: this.oAuth2Client,
          userId: gmailAccount,
          id: message.id,
        });

        const body = this.findEmailBody(email.data.payload);
        if (body) {
          const decodedBody = Buffer.from(body, 'base64').toString('utf-8');
          const parsedData = this.parseEmailBody(decodedBody);

          if (parsedData) {
            await this.createAppointmentFromEmail(parsedData);
          } else {
            this.logger.warn(`Could not parse email with ID: ${message.id}`);
          }
        }

        // 3. Mark email as read
        await this.gmail.users.messages.modify({
          auth: this.oAuth2Client,
          userId: gmailAccount,
          id: message.id,
          requestBody: {
            removeLabelIds: ['UNREAD'],
          },
        });
      }
      this.logger.log('Email sync finished.');
    } catch (error) {
      this.logger.error('Failed to sync emails:', error);
    }
  }

  private findEmailBody(payload: any): string | null {
    if (payload.body?.data) {
      return payload.body.data;
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain') {
          return part.body?.data || null;
        }
        const nestedBody = this.findEmailBody(part);
        if (nestedBody) return nestedBody;
      }
    }
    return null;
  }
  private parseEmailBody(body: string) {
    this.logger.log('Attempting to parse email body with new regex...');

    // 比如完整的服务名是 "Shellac (Semipermanente) / Semi-Permanent Gel Polish"
    // const serviceMatch = body.match(/Nombre de Producto\s+([\s\S]*?)\s*Precio:/);
    // 这样写，得到的结果是 "Shellac (Semipermanente)"
    // 下面这种写法才能得到完整的服务名
    // const serviceMatch = body.match(/Nombre de Producto\s*([\s\S]*?)\s*(?:Precio:|Opción de Producto:)/,);
    // if (serviceMatch) {
    //   // 只trim，不分割，保留完整服务名
    //   const cleanedServiceName = serviceMatch[1].replace(/\s+/g, ' ').trim();
    // }

    const serviceMatch = body.match(
      /Nombre de Producto\s*([\s\S]*?)\s*(?:Precio:|Opción de Producto:)/,
    );

    const dateTimeMatch = body.match(
      /Fecha\/hora\s*(\d{1,2}\s[a-zA-Z]+\s\d{4})\s*at\s*(\d{2}:\d{2})/,
    );
    const customerNameMatch = body.match(/Nombre del cliente\s*([\w\s]+?)\s*Nuevo/);
    const customerEmailMatch = body.match(/Email del cliente:\s*([^\s]+)/);

    // Use your logic: first, isolate the main appointment details block
    // This block starts with "Establecimiento" and ends with "Estado"
    const mainBlockMatch = body.match(/Establecimiento[\s\S]*?Estado\s+No pagado/);

    if (!mainBlockMatch) {
      this.logger.warn('Could not find the main appointment details block.');
      return null;
    }

    const mainBlock = mainBlockMatch[0];

    // Now, run our specific regexes ONLY within this smaller, safer block
    const employeeNameMatch = mainBlock.match(/con\s+(.*)/);

    if (
      serviceMatch &&
      dateTimeMatch &&
      customerNameMatch &&
      customerEmailMatch &&
      employeeNameMatch
    ) {
      this.logger.log('All fields matched successfully with new regex.');

      const cleanedServiceName = serviceMatch[1].replace(/\s+/g, ' ').trim();

      const spanishMonths: { [key: string]: number } = {
        enero: 0,
        febrero: 1,
        marzo: 2,
        abril: 3,
        mayo: 4,
        junio: 5,
        julio: 6,
        agosto: 7,
        septiembre: 8,
        octubre: 9,
        noviembre: 10,
        diciembre: 11,
      };

      const dateParts = dateTimeMatch[1].split(' ');
      const day = parseInt(dateParts[0], 10);
      const monthName = dateParts[1].toLowerCase();
      const month = spanishMonths[monthName];
      const year = parseInt(dateParts[2], 10);
      const timeParts = dateTimeMatch[2].split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);

      // 创建 Date 对象时指定为 UTC 时间以避免时区问题
      const appointmentTime = new Date(Date.UTC(year, month, day, hours, minutes));

      const parsedData = {
        serviceName: cleanedServiceName,
        appointmentTime: appointmentTime,
        customerName: customerNameMatch[1].trim(),
        customerEmail: customerEmailMatch[1].trim(),
        employeeName: employeeNameMatch[1].trim(),
      };

      this.logger.log('Parsed data:', parsedData);
      return parsedData;
    }

    this.logger.warn(
      'Failed to parse email body with new regex. One or more fields did not match.',
    );
    return null;
  }

  private async createAppointmentFromEmail(data: {
    serviceName: string;
    appointmentTime: Date;
    customerName: string;
    customerEmail: string;
    employeeName: string;
  }) {
    try {
      // Find matching service and the SPECIFIC employee
      const service = await this.prisma.service.findFirst({
        where: { name: { contains: data.serviceName, mode: 'insensitive' } },
      });
      // Use the name from the email to find the employee
      const employee = await this.prisma.employee.findFirst({
        where: { name: { equals: data.employeeName, mode: 'insensitive' } },
      });

      let user = await this.prisma.user.findUnique({ where: { email: data.customerEmail } });
      if (!user) {
        user = await this.createPlaceholderUser(data.customerName, data.customerEmail);
      }

      // Check that all required records were found
      if (employee && service && user) {
        await this.appointmentsService.create(user.id, {
          employeeId: employee.id,
          serviceId: service.id,
          appointmentTime: data.appointmentTime,
        });
        this.logger.log(
          `Successfully synced appointment for ${data.customerName} with ${data.employeeName}`,
        );
      } else {
        this.logger.warn(
          'Could not find matching records (employee, service, or user) for email appointment',
          {
            foundService: !!service,
            foundEmployee: !!employee,
            foundUser: !!user,
            parsedData: data,
          },
        );
      }
    } catch (error: any) {
      if (error.status === 409) {
        this.logger.warn(`Skipped syncing appointment due to time conflict:`, data);
      } else {
        this.logger.error('Error creating appointment from email', error);
      }
    }
  }

  private async createPlaceholderUser(name: string, email: string): Promise<User> {
    const randomPassword = Math.random().toString(36).slice(-8); // Generate a random password
    return this.prisma.user.create({
      data: {
        email,
        name,
        password: randomPassword, // Password is required, but won't be used
        role: 'USER',
      },
    });
  }
}
