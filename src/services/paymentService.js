const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const logger = require("../utils/logger");

/**
 * Create a payment link using Stripe Checkout
 * @param {number} amount - The total amount for the payment
 * @param {object} orderDetails - Order details including ID and customer phone
 * @returns {string} - The URL of the created checkout session
 */
const createPaymentLink = async (amount, orderDetails) => {
  try {
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!orderDetails?.id || !orderDetails?.customer_phone) {
      throw new Error('Missing required order details');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Order #${orderDetails.id}`,
              description: "Payment for your order",
            },
            unit_amount: Math.round(amount * 100), // Convert to cents and ensure integer
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: orderDetails.id,
        phoneNumber: orderDetails.customer_phone
      },
      payment_intent_data: {
        metadata: {
          orderId: orderDetails.id,
          phoneNumber: orderDetails.customer_phone
        }
      }
    });

    logger.info('Payment session created', {
      sessionId: session.id,
      orderId: orderDetails.id,
      amount
    });

    return session.url;
  } catch (error) {
    logger.error('Error creating payment session', {
      error: error.message,
      orderId: orderDetails?.id,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  createPaymentLink,
};
