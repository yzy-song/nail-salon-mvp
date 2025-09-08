import { Body, Controller, Post, UseGuards, Get, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user-dto';
import { LoginUserDto } from './dto/login-user.dto';
import { successResponse } from '../common/utils/response.util';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './decorators/user.decorator';

@ApiTags('认证与用户管理')
@Controller('auth') // 定义这个 Controller 的路由前缀是 /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiCommonResponses()
  async register(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.register(createUserDto);
    // 如果您使用了全局拦截器，可以直接 return newUser;
    return successResponse(newUser, '注册成功');
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiCommonResponses()
  async login(@Body() loginUserDto: LoginUserDto) {
    const token = await this.authService.login(loginUserDto);
    // 如果您使用了全局拦截器，可以直接 return token;
    return successResponse(token, '登录成功');
  }

  @Get('profile')
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, description: '用户信息获取成功' })
  @ApiBearerAuth() // 表明需要 Bearer Token 认证
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt')) // <-- 使用 JWT 认证守卫
  getProfile(@Req() req) {
    // req.user 是由上面的 JwtStrategy 中的 validate 方法返回的用户对象
    return req.user;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: '忘记密码' })
  @ApiResponse({ status: 200, description: '忘记密码邮件已发送' })
  @ApiCommonResponses()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiCommonResponses()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiResponse({ status: 200, description: '成功更新用户信息' })
  @ApiCommonResponses()
  @UseGuards(AuthGuard('jwt'))
  updateProfile(
    @User('id') userId: string, // 使用我们自定义的 @User 装饰器直接获取用户ID
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }
}
