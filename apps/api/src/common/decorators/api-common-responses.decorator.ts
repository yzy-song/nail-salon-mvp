import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({ status: 400, description: '请求参数或格式错误' }),
    ApiResponse({ status: 401, description: '未授权或Token无效' }),
    ApiResponse({ status: 403, description: '没有权限访问' }),
    ApiResponse({ status: 500, description: '服务器内部错误' }),
  );
}
