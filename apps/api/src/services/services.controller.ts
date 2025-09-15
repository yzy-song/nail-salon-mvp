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
@ApiTags('Services management')
@ApiBearerAuth() // 表明需要 Bearer Token 认证
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // --- 管理员权限 ---
  @Post()
  @ApiOperation({ summary: 'Create service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service information' })
  @ApiResponse({ status: 200, description: 'Service information updated successfully' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  // --- 公开接口 ---
  @Get()
  @ApiOperation({ summary: 'Get all services information' })
  @ApiResponse({ status: 200, description: 'Return all services information' })
  @ApiCommonResponses()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single service information' })
  @ApiResponse({ status: 200, description: 'Return service information' })
  @ApiCommonResponses()
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }
}
