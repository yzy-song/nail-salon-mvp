import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany();
    // 使用 map 创建一个不含密码的新用户数组
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ID为 ${id} 的用户未找到`);
    }

    // 从返回的用户信息中删除密码
    const { password, ...userWithoutPassword } = user;

    // 此处返回的用户对象，会被 Passport 附加到 Request 对象上 (req.user)
    return userWithoutPassword;
  }
}
