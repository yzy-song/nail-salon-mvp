import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateServiceDto {
  @ApiProperty({ description: '服务名称', example: '基础美甲' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '服务描述', example: '提供基础美甲服务' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '服务价格', example: 100 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '服务时长', example: 60 })
  @IsNumber()
  @Min(1)
  duration: number; // 持续时间（分钟）
}
