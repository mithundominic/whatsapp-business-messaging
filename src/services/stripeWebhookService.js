const logger = require("../utils/logger");

/**
 * Handle successful payment intent
 * @param {object} paymentIntent - The Stripe payment intent object
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    logger.info("Starting to process successful payment intent", {
      id: paymentIntent.id,
    });

    logger.info("Payment intent details", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      customer: paymentIntent.customer,
      payment_method: paymentIntent.payment_method,
      created: paymentIntent.created,
      charges: paymentIntent.charges?.data?.map((charge) => ({
        id: charge.id,
        amount: charge.amount,
        status: charge.status,
        created: charge.created,
      })),
    });

    // TODO: Add business logic for successful payments
    logger.info("Successfully processed payment intent", {
      id: paymentIntent.id,
    });
  } catch (error) {
    logger.error("Error handling successful payment intent", {
      error: error.message,
      stack: error.stack,
      paymentIntentId: paymentIntent.id,
    });
    throw error;
  }
};

/**
 * Handle failed payment intent
 * @param {object} paymentIntent - The Stripe payment intent object
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    logger.warn("Payment intent failed", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      failureMessage: paymentIntent.last_payment_error?.message,
    });

    // TODO: Add business logic for failed payments
  } catch (error) {
    logger.error("Error handling failed payment intent", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
};
