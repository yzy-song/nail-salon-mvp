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
import { PaginationDto } from 'src/common/dot/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';
@ApiTags('预约管理')
@ApiBearerAuth() // 表示需要 Bearer Token 认证
@Controller('appointments')
@UseGuards(AuthGuard('jwt')) // 整个模块都需要登录
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // 顾客创建预约 (任何登录用户都可以)
  @Post()
  @ApiOperation({ summary: '创建预约' })
  @ApiResponse({ status: 201, description: '预约创建成功' })
  @ApiCommonResponses()
  create(@User() user: UserModel, @Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(user.id, createAppointmentDto);
  }

  // 顾客获取自己的预约
  @Get('/mine')
  @ApiOperation({ summary: '获取我的预约' })
  @ApiResponse({ status: 200, description: '返回用户的预约列表' })
  @ApiCommonResponses()
  findMyAppointments(@User('id') userId: string) {
    return this.appointmentsService.findMyAppointments(userId);
  }

  @Delete('/mine/:id')
  @ApiOperation({ summary: '取消我的预约' })
  @ApiResponse({ status: 200, description: '预约取消成功' })
  @ApiCommonResponses()
  cancelMyAppoinment(@User('id') userId: string, @Param('id') appointmentId: string) {
    return this.appointmentsService.cancelMyAppoinment(userId, appointmentId);
  }

  // --- 以下仅限管理员 ---

  // 管理员获取所有预约
  @Get()
  @ApiOperation({ summary: '获取所有预约' })
  @ApiResponse({ status: 200, description: '返回所有预约列表' })
  @ApiCommonResponses()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.appointmentsService.findAll(paginationDto);
  }

  // 管理员更新预约状态
  @Patch(':id/status')
  @ApiOperation({ summary: '更新预约状态' })
  @ApiResponse({ status: 200, description: '预约状态更新成功' })
  @ApiCommonResponses()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, updateStatusDto);
  }

  // This endpoint is for the frontend to verify the payment status
  @Get('by-intent/:intentId')
  // This should be protected by the regular AuthGuard
  findOneByPaymentIntent(@Param('intentId') intentId: string) {
    return this.appointmentsService.findOneByPaymentIntent(intentId);
  }
}
