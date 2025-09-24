import { Controller, Get, Post, Body, Patch, Param, UseGuards, Delete } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role, type User as UserModel } from '@prisma/client';
import { User } from 'src/auth/decorators/user.decorator'; // 导入我们自定义的装饰器
import { Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';
import { RescheduleAppointmentDto } from './dto/reschedule.dto';
import { AssignEmployeeDto } from './dto/assign-employee.dto';
import { CreateGuestAppointmentDto } from './dto/create-guest-appointment.dto';

@ApiTags('Appointment Management')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // 游客预约，不需要登录
  @Post('guest')
  @ApiOperation({ summary: 'Create a new appointment as a guest' })
  @ApiResponse({ status: 201, description: 'Guest appointment created successfully' })
  @ApiCommonResponses()
  createGuestAppointment(@Body() createGuestAppointmentDto: CreateGuestAppointmentDto) {
    return this.appointmentsService.createGuestAppointment(createGuestAppointmentDto);
  }

  // 登录用户预约
  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create an appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiCommonResponses()
  create(@User() user: UserModel, @Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(user.id, createAppointmentDto);
  }

  // 用户获取自己的预约
  @Get('/mine')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get my appointments' })
  @ApiResponse({ status: 200, description: 'Return user appointment information' })
  @ApiCommonResponses()
  findMyAppointments(@User('id') userId: string) {
    return this.appointmentsService.findMyAppointments(userId);
  }

  // 用户取消自己的预约
  @Delete('/mine/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Cancel my appointment' })
  @ApiResponse({ status: 200, description: 'Appointment canceled successfully' })
  @ApiCommonResponses()
  cancelMyAppoinment(@User('id') userId: string, @Param('id') appointmentId: string) {
    return this.appointmentsService.cancelMyAppoinment(userId, appointmentId);
  }

  // --- 以下仅限管理员 ---
  // 管理员获取所有预约
  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'Return all appointment information' })
  @ApiCommonResponses()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.appointmentsService.findAll(paginationDto);
  }

  // 管理员更新预约状态
  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({ status: 200, description: 'Appointment status updated successfully' })
  @ApiCommonResponses()
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, updateStatusDto);
  }

  // 管理员根据支付 intent 查询预约,普通用户可以查看自己的预约
  @Get('by-intent/:intentId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get appointment by payment intent ID' })
  @ApiResponse({ status: 200, description: 'Return appointment information by payment intent ID' })
  @ApiCommonResponses()
  findOneByPaymentIntent(@Param('intentId') intentId: string, userId?: string, userRole?: string) {
    return this.appointmentsService.findOneByPaymentIntent(intentId, userId, userRole);
  }

  // 管理员重新安排预约
  @Patch(':id/reschedule')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reschedule an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled successfully' })
  @ApiCommonResponses()
  reschedule(@Param('id') id: string, @Body() rescheduleDto: RescheduleAppointmentDto) {
    return this.appointmentsService.reschedule(id, rescheduleDto);
  }

  // 管理员分配员工
  @Patch(':id/assign-employee')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign an employee to an appointment' })
  @ApiResponse({ status: 200, description: 'Employee assigned successfully' })
  @ApiCommonResponses()
  assignEmployee(@Param('id') id: string, @Body() assignEmployeeDto: AssignEmployeeDto) {
    return this.appointmentsService.assignEmployee(id, assignEmployeeDto);
  }
}
