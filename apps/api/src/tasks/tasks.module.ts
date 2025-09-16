import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { EmailModule } from 'src/email/email.module';
import { EmailSyncModule } from 'src/email-sync/email-sync.module';

@Module({
  imports: [EmailModule, EmailSyncModule],
  providers: [TasksService],
})
export class TasksModule {}
