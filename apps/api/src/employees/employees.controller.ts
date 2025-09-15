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
@ApiTags('Employees management')
@ApiBearerAuth() // 表明需要 Bearer Token 认证
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get employee information' })
  @ApiResponse({ status: 200, description: 'Return employee information' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  // --- 管理员权限 ---
  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee information' })
  @ApiResponse({ status: 200, description: 'Employee information updated successfully' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  // --- 公开接口 ---
  @Get()
  @ApiOperation({ summary: 'Get all employees information' })
  @ApiResponse({ status: 200, description: 'Return all employees information' })
  @ApiCommonResponses()
  findAll() {
    return this.employeesService.findAll();
  }
}
