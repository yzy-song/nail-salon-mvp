import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';

@ApiTags('Payments management')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @ApiOperation({ summary: 'Create payment intent for an appointment' })
  @ApiCommonResponses()
  @Post('create-intent')
  createPaymentIntent(@Body('appointmentId') appointmentId: string) {
    return this.paymentsService.createPaymentIntent(appointmentId);
  }
}
