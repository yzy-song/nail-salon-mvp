import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // @Controller() 没有参数，表示它处理根路径
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // @Get() 没有参数，表示它处理针对根路径的 GET 请求
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }
}
