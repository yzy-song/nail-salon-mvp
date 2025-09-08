import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';
import { Role } from '@prisma/client';
@ApiTags('仪表盘与统计')
@ApiBearerAuth() // 表明需要 Bearer Token 认证
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard) // 整个模块都需要登录和角色验证
@Roles(Role.ADMIN) // 整个模块都只允许管理员访问
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取统计数据' })
  @ApiResponse({ status: 200, description: '统计数据获取成功' })
  @ApiCommonResponses()
  getStats() {
    return this.dashboardService.getStats();
  }
}
