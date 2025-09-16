import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { EmployeesModule } from './employees/employees.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MediaModule } from './media/media.module';
import { FirebaseModule } from './firebase/firebase.module';
import { PaymentsModule } from './payments/payments.module';
import { AppLogger } from './common/utils/logger';
import { EmailSyncModule } from './email-sync/email-sync.module';
@Module({
  imports: [
    // 设置.env配置文件为全局可用
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ServicesModule,
    EmployeesModule,
    AppointmentsModule,
    DashboardModule,
    UsersModule,
    EmailModule,
    ScheduleModule.forRoot(),
    TasksModule,
    CloudinaryModule,
    MediaModule,
    FirebaseModule,
    PaymentsModule,
    EmailSyncModule,
  ],
  controllers: [AppController], // NestJS 默认创建的 Controller
  providers: [AppService, AppLogger], // NestJS 默认创建的 Service
})
export class AppModule {}
