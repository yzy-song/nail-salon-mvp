import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';
@ApiTags('员工管理')
@ApiBearerAuth() // 表明需要 Bearer Token 认证
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // --- 管理员权限 ---
  @Post()
  @ApiOperation({ summary: '创建员工' })
  @ApiResponse({ status: 201, description: '员工创建成功' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新员工信息' })
  @ApiResponse({ status: 200, description: '员工信息更新成功' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除员工' })
  @ApiResponse({ status: 200, description: '员工删除成功' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个员工信息' })
  @ApiResponse({ status: 200, description: '返回员工信息' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  // --- 公开接口 ---
  @Get()
  @ApiOperation({ summary: '获取所有员工信息' })
  @ApiResponse({ status: 200, description: '返回所有员工信息' })
  @ApiCommonResponses()
  findAll() {
    return this.employeesService.findAll();
  }
}
