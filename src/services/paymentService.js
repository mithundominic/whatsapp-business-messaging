const stripe = require("stripe");
const logger = require("../utils/logger");
const config = require("../config/environment");

// Initialize Stripe with the secret key
const stripeClient = stripe(config.stripe.secretKey);

/**
 * Create a secure payment link
 * @param {number} amount - The payment amount in smallest currency unit (e.g., cents)
 * @param {string} currency - The currency code (e.g., 'usd')
 * @param {object} metadata - Additional metadata to include
 * @returns {Promise<string>} The payment link URL
 */
const createPaymentLink = async (amount) => {
  if (amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  try {
    logger.info("Creating payment link", { amount });

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Order Payment",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://your-success-url.com",
      cancel_url: "https://your-cancel-url.com",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      // automatic_tax: {
      // enabled: true,
      // }
      // saved_payment_method_options: {
      //   payment_method_save: "enabled",
      // },
    });

    logger.info("Successfully created payment link", {
      sessionId: session.id,
      url: session.url,
    });
    return session.url;
  } catch (error) {
    logger.error("Failed to create payment link", {
      error: error.message,
      stack: error.stack,
      amount,
    });
    throw error;
  }
};

module.exports = {
  createPaymentLink,
};
