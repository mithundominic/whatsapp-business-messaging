const logger = require("../utils/logger");
const whatsappService = require("./whatsappService");

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
        receipt_url: charge.receipt_url,
      })),
    });

    // Get receipt URL from the first charge
    const receiptUrl = paymentIntent.charges?.data?.[0]?.receipt_url;

    // Send WhatsApp notification
    const phoneNumber = paymentIntent.metadata?.phone_number;
    if (phoneNumber) {
      await whatsappService.sendMessage(
        config.whatsapp.phoneNumberId,
        phoneNumber,
        "payment_success",
        {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          receipt_url: receiptUrl,
        }
      );
    }

    logger.info("Successfully processed payment intent", {
      id: paymentIntent.id,
      receiptUrl,
      whatsappSent: !!phoneNumber,
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

    // Send WhatsApp notification
    const phoneNumber = paymentIntent.metadata?.phone_number;
    if (phoneNumber) {
      await whatsappService.sendMessage(
        config.whatsapp.phoneNumberId,
        phoneNumber,
        "payment_failure",
        {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          failure_message: paymentIntent.last_payment_error?.message,
        }
      );
    }

    logger.info("Sent payment failure notification", {
      id: paymentIntent.id,
      whatsappSent: !!phoneNumber,
    });
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
