import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateGuestAppointmentDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  appointmentTime: Date;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;
}
