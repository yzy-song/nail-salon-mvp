import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // 在 NestJS 模块初始化时，连接到数据库
    await this.$connect();
  }

  async onModuleDestroy() {
    // 在 NestJS 模块销毁时，断开数据库连接，防止连接泄漏
    await this.$disconnect();
  }
}
