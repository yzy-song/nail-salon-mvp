import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, EmailService],
})
export class AppointmentsModule {}
