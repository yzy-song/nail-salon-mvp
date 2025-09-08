import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({ description: '关联的图片ID', required: false })
  @IsString()
  @IsOptional()
  imageId?: string;
}
