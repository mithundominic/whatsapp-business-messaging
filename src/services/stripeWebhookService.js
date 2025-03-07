const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');
const whatsappService = require('./whatsappService');
const config = require('../config/environment');

class StripeWebhookService {
  constructor() {
    this.endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  /**
   * Verify and construct the Stripe event
   * @param {string} payload - Raw request body
   * @param {string} signature - Stripe signature header
   * @returns {object} Stripe event
   */
  constructEvent(payload, signature) {
    try {
      return stripe.webhooks.constructEvent(payload, signature, this.endpointSecret);
    } catch (error) {
      logger.error('Error constructing Stripe webhook event', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Handle successful payment
   * @param {object} paymentIntent - Stripe payment intent object
   */
  async handleSuccessfulPayment(paymentIntent) {
    try {
      const { metadata } = paymentIntent;
      if (!metadata?.orderId || !metadata?.phoneNumber) {
        logger.error('Missing required metadata in payment intent', { metadata });
        return;
      }

      // Send payment confirmation to customer
      await whatsappService.sendMessage(
        config.whatsapp.phoneNumberId,
        metadata.phoneNumber,
        'payment_confirmation',
        {
          orderId: metadata.orderId,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency.toUpperCase()
        }
      );

      logger.info('Payment confirmation sent', {
        orderId: metadata.orderId,
        phoneNumber: metadata.phoneNumber,
        amount: paymentIntent.amount
      });
    } catch (error) {
      logger.error('Error handling successful payment', {
        error: error.message,
        paymentIntentId: paymentIntent.id,
        stack: error.stack
      });
    }
  }

  /**
   * Handle failed payment
   * @param {object} paymentIntent - Stripe payment intent object
   */
  async handleFailedPayment(paymentIntent) {
    try {
      const { metadata } = paymentIntent;
      if (!metadata?.orderId || !metadata?.phoneNumber) {
        logger.error('Missing required metadata in payment intent', { metadata });
        return;
      }

      // Send payment failure notification to customer
      await whatsappService.sendMessage(
        config.whatsapp.phoneNumberId,
        metadata.phoneNumber,
        'payment_failed',
        {
          orderId: metadata.orderId,
          errorMessage: paymentIntent.last_payment_error?.message
        }
      );

      logger.info('Payment failure notification sent', {
        orderId: metadata.orderId,
        phoneNumber: metadata.phoneNumber
      });
    } catch (error) {
      logger.error('Error handling failed payment', {
        error: error.message,
        paymentIntentId: paymentIntent.id,
        stack: error.stack
      });
    }
  }

  /**
   * Handle Stripe webhook events
   * @param {object} event - Stripe event object
   */
  async handleWebhookEvent(event) {
    try {
      logger.info('Processing Stripe webhook event', {
        type: event.type,
        id: event.id
      });

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleSuccessfulPayment(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handleFailedPayment(event.data.object);
          break;

        default:
          logger.info('Unhandled event type', { type: event.type });
      }
    } catch (error) {
      logger.error('Error handling webhook event', {
        error: error.message,
        eventType: event.type,
        stack: error.stack
      });
      throw error;
    }
  }
}

module.exports = new StripeWebhookService();
