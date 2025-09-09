import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteMediaDto {
  @ApiProperty({
    description: 'Array of image IDs to delete',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  ids: string[];
}
