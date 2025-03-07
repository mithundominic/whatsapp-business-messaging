const logger = require("../utils/logger");
const { calculateTotalAmount } = require("../utils/calculationUtils");

/**
 * WhatsApp message templates configuration
 * Defines templates for different types of WhatsApp messages
 */
const templates = {
  default_response: {
    type: "text",
    text: {
      body: "Thank you for your message!",
    },
  },

  order_confirmation: {
    type: "text",
    getText: (details, paymentLink, orderDetails) => {
      logger.info("Generating order confirmation text", { orderDetails });

      if (!orderDetails?.product_items || orderDetails.product_items.length === 0) {
        logger.warn("Order details are missing or empty", { orderDetails });
        return { body: "Order details are missing." };
      }

      const totalAmount = calculateTotalAmount(orderDetails.product_items);
      const currency = orderDetails.product_items[0]?.currency || "USD";
      const itemsList = orderDetails.product_items
        .map((item) => `${item.product_retailer_id}: ${item.quantity} x ${currency} ${item.item_price}`)
        .join("\n");

      return {
        body: `Thank you for your order!\n\nOrder Details:\n${itemsList}\n\nTotal Amount: ${currency} ${totalAmount}\nComplete your payment here: ${paymentLink}`,
      };
    },
  },

  payment_confirmation: {
    type: "text",
    getText: (details) => {
      const { orderId, amount, currency } = details;
      return {
        body: `🎉 Payment Successful!\n\nYour payment for Order #${orderId} has been confirmed.\n\nAmount Paid: ${currency} ${amount}\n\nThank you for your business! We'll process your order right away.`
      };
    }
  },

  payment_failed: {
    type: "text",
    getText: (details) => {
      const { orderId, errorMessage } = details;
      return {
        body: `❌ Payment Failed\n\nWe couldn't process your payment for Order #${orderId}.\n\nReason: ${errorMessage || 'An error occurred during payment processing.'}\n\nPlease try again or contact our support team for assistance.`
      };
    }
  }
};

/**
 * Get message content based on message type and details
 * @param {string} type - Message type
 * @param {object} details - Message details
 * @param {string} paymentLink - Payment link for orders
 * @param {object} orderDetails - Order details for order confirmation
 * @returns {object} Message content configuration
 */
const getMessageContent = (type, details = {}, paymentLink = "", orderDetails = null) => {
  try {
    logger.debug("Getting message content", { type, details });

    switch (type) {
      case "order_confirmation":
        if (!paymentLink) {
          logger.error("Missing payment link for order confirmation");
          return {
            type: "text",
            text: { body: "We couldn't generate your payment link. Please try again." }
          };
        }
        const orderText = templates.order_confirmation.getText(details, paymentLink, orderDetails);
        return {
          type: "text",
          text: orderText
        };

      case "payment_confirmation":
        return {
          type: "text",
          text: templates.payment_confirmation.getText(details)
        };

      case "payment_failed":
        return {
          type: "text",
          text: templates.payment_failed.getText(details)
        };

      default:
        logger.warn("Using default response template", { type });
        return templates.default_response;
    }
  } catch (error) {
    logger.error("Error getting message content", {
      error: error.message,
      type,
      details: JSON.stringify(details, null, 2)
    });
    return templates.default_response;
  }
};

module.exports = {
  getMessageContent,
  templates
};
