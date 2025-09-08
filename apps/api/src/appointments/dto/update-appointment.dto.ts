import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  @ApiProperty({ description: '预约状态', enum: AppointmentStatus })
  status: AppointmentStatus;
}
