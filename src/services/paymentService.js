const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment link using Stripe Checkout
 * @param {number} amount - The total amount for the payment
 * @returns {string} - The URL of the created checkout session
 */
const createPaymentLink = async (amount) => {
  const session = await stripe.checkout.sessions.create({
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
  });
  return session.url;
};

module.exports = {
  createPaymentLink,
};
