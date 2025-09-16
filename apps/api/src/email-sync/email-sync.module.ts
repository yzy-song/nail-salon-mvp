import { Module } from '@nestjs/common';
import { EmailSyncService } from './email-sync.service';
import { AppointmentsModule } from 'src/appointments/appointments.module';

@Module({
  imports: [AppointmentsModule], // 导入 AppointmentsModule 以使用其服务
  providers: [EmailSyncService],
  exports: [EmailSyncService],
})
export class EmailSyncModule {}
