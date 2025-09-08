import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { addMinutes } from 'date-fns';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  // 通过依赖注入，引入 PrismaService
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  // 修改 register 方法
  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // 不再返回用户信息，而是直接调用 _createToken 方法返回 token
    return this._createToken(newUser);
  }

  async login(loginUserDto: any) {
    const { email, password } = loginUserDto;

    // 1. 查找用户
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    this.logger.log(`用户 ${email} 登录成功`);
    return this._createToken(user);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // 为了安全, 即使用户不存在, 也返回成功信息, 防止被恶意探测用户是否存在
    if (!user) {
      return { message: '如果邮箱地址有效, 您将会收到一封重置邮件' };
    }

    // 1. 生成一个随机的、不存入数据库的原始 token
    const resetToken = randomBytes(32).toString('hex');

    // 2. 将原始 token 哈希后存入数据库
    const passwordResetToken = createHash('sha256').update(resetToken).digest('hex');

    // 3. 设置过期时间 (例如15分钟后)
    const passwordResetExpires = addMinutes(new Date(), 15);

    await this.prisma.user.update({
      where: { email },
      data: { passwordResetToken, passwordResetExpires },
    });

    // 4. 发送包含原始 token 的邮件
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      // 如果邮件发送失败, 清空重置 token, 避免产生无法使用的 token
      await this.prisma.user.update({
        where: { email },
        data: { passwordResetToken: null, passwordResetExpires: null },
      });
      throw new Error('邮件发送失败，请稍后重试');
    }

    return { message: '如果邮箱地址有效, 您将会收到一封重置邮件' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;

    // 1. 将收到的 token 哈希，以便和数据库中的进行比较
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // 2. 查找用户，并检查 token 是否过期
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gte: new Date(), // 检查过期时间是否大于等于当前时间
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('密码重置Token无效或已过期');
    }

    // 3. 更新密码并清空重置 token
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: '密码重置成功' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
    });

    // 同样，移除密码并返回
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  // 类的内部私有方法,只能在类的其他方法中调用
  private async _createToken(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      access_token: accessToken,
    };
  }
}
