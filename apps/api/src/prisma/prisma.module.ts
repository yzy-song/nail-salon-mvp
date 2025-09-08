import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 关键：将此模块设为全局
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 关键：导出 PrismaService 供其他模块使用
})
export class PrismaModule {}
