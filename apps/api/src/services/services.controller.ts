import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';
@ApiTags('服务管理')
@ApiBearerAuth() // 表明需要 Bearer Token 认证
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // --- 管理员权限 ---
  @Post()
  @ApiOperation({ summary: '创建服务' })
  @ApiResponse({ status: 201, description: '服务创建成功' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新服务信息' })
  @ApiResponse({ status: 200, description: '服务信息更新成功' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除服务' })
  @ApiResponse({ status: 200, description: '服务删除成功' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  // --- 公开接口 ---
  @Get()
  @ApiOperation({ summary: '获取所有服务信息' })
  @ApiResponse({ status: 200, description: '返回所有服务信息' })
  @ApiCommonResponses()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个服务信息' })
  @ApiResponse({ status: 200, description: '返回服务信息' })
  @ApiCommonResponses()
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }
}
