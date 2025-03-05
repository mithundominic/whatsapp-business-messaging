const logger = require("../utils/logger");

/**
 * WhatsApp message templates configuration
 *
 * This file defines templates for different types of WhatsApp messages:
 * - For order messages: Sends order total and items ordered
 * - For other messages: Sends a simple thank you message
 */

const templates = {
  // Default template for non-order messages
  default_response: {
    type: "text",
    text: {
      body: "Thank you for your message!",
    },
  },

  // Template for order messages
  order_confirmation: {
    type: "text",
    getText: (orderDetails) => {
      logger.info("Generating order confirmation text", { orderDetails });

      if (
        !orderDetails?.product_items ||
        orderDetails.product_items.length === 0
      ) {
        logger.warn("Order details are missing or empty", { orderDetails });
        return { body: "Order details are missing." };
      }

      const totalAmount = orderDetails.product_items.reduce((sum, item) => {
        return sum + item.quantity * item.item_price;
      }, 0);

      const currency = orderDetails.product_items[0]?.currency || "USD";

      const itemsList = orderDetails.product_items
        .map(
          (item) =>
            `${item.product_retailer_id}: ${item.quantity} x ${currency} ${item.item_price}`
        )
        .join("\n");

      logger.info("Generated order summary", { totalAmount, itemsList });

      return {
        body: `Thank you for your order!\n\nOrder Details:\n${itemsList}\n\nTotal Amount: ${currency} ${totalAmount}`,
      };
    },
  },
};

/**
 * Get message content based on message type and details
 * @param {string} type - Message type ('order' or other)
 * @param {object} details - Message details (order details for order type)
 * @returns {object} Message content configuration
 */
const getMessageContent = (type, details = {}) => {
  logger.info("getMessageContent invoked", { type, details });

  if (type === "orderConfirmation" && details?.product_items?.length > 0) {
    const orderText = templates.order_confirmation.getText(details);
    logger.info("Returning order confirmation message", { orderText });
    return {
      type: "text",
      text: orderText,
    };
  }

  logger.warn("Returning default response", { type, details });
  return templates.default_response;
};

module.exports = {
  getMessageContent,
};
