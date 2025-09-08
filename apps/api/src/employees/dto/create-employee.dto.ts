import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateEmployeeDto {
  @ApiProperty({ description: '员工姓名', example: '李四' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '员工职位', example: '高级美甲师' })
  @IsString()
  @IsNotEmpty()
  title: string; // 例如: '高级美甲师', '实习美甲师'
}
