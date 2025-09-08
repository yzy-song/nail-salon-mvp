import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [CloudinaryModule],
})
export class ServicesModule {}
