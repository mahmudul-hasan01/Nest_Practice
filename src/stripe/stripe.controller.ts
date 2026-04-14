import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('products')
  async getProducts(): Promise<unknown> {
    return this.stripeService.getProducts();
  }

  @Get('customers')
  async getCustomers(): Promise<unknown> {
    return this.stripeService.getCustomers();
  }

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() body: CreatePaymentIntentDto,
  ): Promise<unknown> {
    return this.stripeService.createPaymentIntent(body.amount, body.currency);
  }

  @Post('subscriptions')
  async createSubscription(
    @Body() body: { customerId: string; priceId: string },
  ): Promise<unknown> {
    const { customerId, priceId } = body;
    return this.stripeService.createSubscription(customerId, priceId);
  }

  @Post('customers')
  async createCustomer(
    @Body() body: { email: string; name: string },
  ): Promise<unknown> {
    return this.stripeService.createCustomer(body.email, body.name);
  }

  @Post('products')
  async createProduct(
    @Body() body: { name: string; description: string; price: number },
  ): Promise<unknown> {
    return this.stripeService.createProduct(
      body.name,
      body.description,
      body.price,
    );
  }

  @Post('refunds')
  async refundPayment(
    @Body() body: { paymentIntentId: string },
  ): Promise<unknown> {
    return this.stripeService.refundPayment(body.paymentIntentId);
  }

  @Post('payment-links')
  async createPaymentLink(@Body() body: { priceId: string }): Promise<unknown> {
    return this.stripeService.createPaymentLink(body.priceId);
  }

  @Get('balance')
  async getBalance(): Promise<unknown> {
    return this.stripeService.getBalance();
  }
}
