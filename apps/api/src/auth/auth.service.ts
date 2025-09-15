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
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // 新增

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private firebaseAdmin: FirebaseAdminService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;
    this.logger.log(`注册请求: email=${email}, name=${name}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`注册失败，邮箱已存在: email=${email}`);
      throw new ConflictException('Email is already registered');
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

    this.logger.log(`注册成功: userId=${newUser.id}, email=${email}`);
    return this._createToken(newUser);
  }

  async login(loginUserDto: any) {
    const { email, password } = loginUserDto;
    this.logger.log(`登录请求: email=${email}`);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.warn(`登录失败: email=${email}`);
      throw new UnauthorizedException('Email or password is incorrect');
    }

    this.logger.log(`登录成功: userId=${user.id}, email=${email}`);
    return this._createToken(user);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    this.logger.log(`忘记密码请求: email=${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.logger.warn(`忘记密码，用户不存在: email=${email}`);
      return { message: 'You will receive a reset email if the email address is valid.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const passwordResetToken = createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = addMinutes(new Date(), 15);

    await this.prisma.user.update({
      where: { email },
      data: { passwordResetToken, passwordResetExpires },
    });

    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
      this.logger.log(`重置密码邮件发送成功: email=${email}`);
    } catch (error) {
      await this.prisma.user.update({
        where: { email },
        data: { passwordResetToken: null, passwordResetExpires: null },
      });
      this.logger.error(`重置密码邮件发送失败: email=${email}`, error.stack);
      throw new Error('Failed to send email, please try again later');
    }

    return { message: 'You will receive a reset email if the email address is valid.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;
    this.logger.log(`重置密码请求`);

    const hashedToken = createHash('sha256').update(token).digest('hex');
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      this.logger.warn('重置密码失败，token无效或已过期');
      throw new UnauthorizedException('Password reset token is invalid or has expired');
    }

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

    this.logger.log(`密码重置成功: userId=${user.id}`);
    return { message: 'Password reset successfully' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    this.logger.log(`更新用户信息: userId=${userId}`);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async firebaseLogin(idToken: string) {
    this.logger.log('Firebase 登录请求');
    try {
      const decodedToken = await this.firebaseAdmin.auth.verifyIdToken(idToken);
      const { email, name, uid } = decodedToken;

      this.logger.log(`Firebase token 验证成功: uid=${uid}, email=${email}`);
      if (!email) {
        this.logger.warn('Firebase token 缺少 email');
        throw new UnauthorizedException('Firebase token is missing email.');
      }

      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        const randomPassword = randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await this.prisma.user.create({
          data: {
            email,
            name: name || 'Firebase User',
            password: hashedPassword,
          },
        });
        this.logger.log(`Firebase 新用户注册: email=${email}`);
      }

      this.logger.log(`Firebase 登录成功: userId=${user.id}, email=${email}`);
      return this._createToken(user);
    } catch (error) {
      this.logger.error('Firebase 登录失败', error.stack);
      throw new UnauthorizedException('Invalid Firebase token.');
    }
  }

  private async _createToken(user: { id: string; email: string; role: string }) {
    this.logger.log(`生成 JWT token: userId=${user.id}, email=${user.email}`);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      access_token: accessToken,
    };
  }
}
