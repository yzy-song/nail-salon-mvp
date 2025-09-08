import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateAppointmentDto {
  @ApiProperty({ description: '员工ID', example: '123456' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ description: '服务ID', example: '654321' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: '预约时间', example: '2025-12-25T10:30:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  @IsNotEmpty()
  appointmentTime: Date;
}
