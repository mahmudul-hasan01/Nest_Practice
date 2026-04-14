import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

type StripeClient = InstanceType<typeof Stripe>;
type StripeProduct = Awaited<
  ReturnType<StripeClient['products']['list']>
>['data'][number];
type StripeCustomer = Awaited<
  ReturnType<StripeClient['customers']['list']>
>['data'][number];
type StripePaymentIntent = Awaited<
  ReturnType<StripeClient['paymentIntents']['create']>
>;
type StripeSubscription = Awaited<
  ReturnType<StripeClient['subscriptions']['create']>
>;
type StripeRefund = Awaited<ReturnType<StripeClient['refunds']['create']>>;
type StripeBalance = Awaited<ReturnType<StripeClient['balance']['retrieve']>>;
type StripePaymentLink = Awaited<
  ReturnType<StripeClient['paymentLinks']['create']>
>;

@Injectable()
export class StripeService {
  private readonly stripe: StripeClient;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject('STRIPE_API_KEY')
    private readonly apiKey: string,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: Stripe.API_VERSION,
    });
  }

  async getProducts(): Promise<StripeProduct[]> {
    try {
      const products = await this.stripe.products.list();
      this.logger.log('Products fetched successfully');
      return products.data;
    } catch (error) {
      this.logStripeError('Failed to fetch products', error);
      throw error;
    }
  }

  async getCustomers(): Promise<StripeCustomer[]> {
    try {
      const customers = await this.stripe.customers.list({});
      this.logger.log('Customers fetched successfully');
      return customers.data;
    } catch (error) {
      this.logStripeError('Failed to fetch customers', error);
      throw error;
    }
  }

  /**
   * Amount must be in the smallest currency unit (e.g. cents for USD).
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
  ): Promise<StripePaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
      });
      this.logger.log(
        `PaymentIntent created successfully with amount: ${amount} ${currency}`,
      );
      return paymentIntent;
    } catch (error) {
      this.logStripeError('Failed to create PaymentIntent', error);
      throw error;
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
  ): Promise<StripeSubscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      });
      this.logger.log(
        `Subscription created successfully for customer ${customerId}`,
      );
      return subscription;
    } catch (error) {
      this.logStripeError('Failed to create subscription', error);
      throw error;
    }
  }

  async createCustomer(
    email: string,
    name: string,
  ): Promise<Awaited<ReturnType<StripeClient['customers']['create']>>> {
    try {
      const customer = await this.stripe.customers.create({ email, name });
      this.logger.log(`Customer created successfully with email: ${email}`);
      return customer;
    } catch (error) {
      this.logStripeError('Failed to create customer', error);
      throw error;
    }
  }

  async createProduct(
    name: string,
    description: string,
    price: number,
  ): Promise<StripeProduct> {
    try {
      const product = await this.stripe.products.create({ name, description });
      await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100),
        currency: 'usd',
      });
      this.logger.log(`Product created successfully: ${name}`);
      return product;
    } catch (error) {
      this.logStripeError('Failed to create product', error);
      throw error;
    }
  }

  async refundPayment(paymentIntentId: string): Promise<StripeRefund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      this.logger.log(
        `Refund processed successfully for PaymentIntent: ${paymentIntentId}`,
      );
      return refund;
    } catch (error) {
      this.logStripeError('Failed to process refund', error);
      throw error;
    }
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void> {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      this.logger.log(
        `Payment method ${paymentMethodId} attached to customer ${customerId}`,
      );
    } catch (error) {
      this.logStripeError('Failed to attach payment method', error);
      throw error;
    }
  }

  async getBalance(): Promise<StripeBalance> {
    try {
      const balance = await this.stripe.balance.retrieve();
      this.logger.log('Balance retrieved successfully');
      return balance;
    } catch (error) {
      this.logStripeError('Failed to retrieve balance', error);
      throw error;
    }
  }

  async createPaymentLink(priceId: string): Promise<StripePaymentLink> {
    try {
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{ price: priceId, quantity: 1 }],
      });
      this.logger.log('Payment link created successfully');
      return paymentLink;
    } catch (error) {
      this.logStripeError('Failed to create payment link', error);
      throw error;
    }
  }

  private logStripeError(message: string, error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(message, error.stack);
    } else {
      this.logger.error(message, String(error));
    }
  }
}
