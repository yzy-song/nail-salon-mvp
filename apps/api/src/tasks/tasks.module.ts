import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule], // 导入 EmailModule 以便使用 EmailService
  providers: [TasksService],
})
export class TasksModule {}
