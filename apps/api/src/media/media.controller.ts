import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';
import { DeleteMediaDto } from './dto/delete-media.dto';

@ApiTags('Media Library')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @ApiCommonResponses()
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.mediaService.uploadFiles(files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images from the library' })
  @ApiResponse({ status: 200, description: 'List of images retrieved successfully' })
  @ApiCommonResponses()
  findAll() {
    return this.mediaService.findAll();
  }

  // --- 👇 Reorder the Delete methods ---

  // 1. Place the more specific, static route first. This avoids route conflicts.
  //    If ':id' were first, 'batch' would be treated as an ID.
  @Delete('batch')
  @ApiOperation({ summary: 'Batch delete images' })
  @ApiResponse({ status: 200, description: 'Images deleted successfully' })
  @ApiResponse({ status: 404, description: 'One or more images not found' })
  @ApiCommonResponses()
  deleteMany(@Body() deleteMediaDto: DeleteMediaDto) {
    return this.mediaService.deleteMany(deleteMediaDto.ids);
  }

  // 2. Place the more generic, parameterized route second.
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiCommonResponses()
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
