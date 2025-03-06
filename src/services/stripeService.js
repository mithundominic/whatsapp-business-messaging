const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Ensure to set your Stripe secret key in environment variables
const { logger } = require("../utils/logger");

/**
 * Create a payment link for the given order details.
 * @param {object} orderDetails - The order details for which to create the payment link.
 * @returns {string} - The URL of the payment link.
 */
const createPaymentLink = async (orderDetails) => {
  try {
    // Create line items from order details
    const lineItems = orderDetails.product_items.map((item) => ({
      price_data: {
        currency: "gbp", // Change to your currency
        product_data: {
          name: item.product_retailer_id, // Use product_retailer_id as the product name
        },
        unit_amount: Math.round(item.item_price * 100), // Convert item_price to cents
      },
      quantity: item.quantity, // Use the quantity from the order details
    }));

    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      // Additional options can be added here
    });
    return paymentLink.url;
  } catch (error) {
    logger.error("Error creating payment link", {
      error: error.message,
      orderDetails,
    });
    throw new Error("Unable to create payment link");
  }
};

module.exports = {
  createPaymentLink,
};
