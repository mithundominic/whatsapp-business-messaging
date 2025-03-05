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
      const totalAmount = orderDetails.product_items.reduce((sum, item) => {
        return sum + item.quantity * item.item_price;
      }, 0);

      const itemsList = orderDetails.product_items
        .map(
          (item) =>
            `${item.product_retailer_id}: ${item.quantity} x ${item.currency} ${item.item_price}`
        )
        .join("\n");

      return {
        body: `Thank you for your order!\n\nOrder Details:\n${itemsList}\n\nTotal Amount: ${orderDetails.product_items[0].currency} ${totalAmount}`,
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
  if (type === "order") {
    return {
      ...templates.order_confirmation,
      text: templates.order_confirmation.getText(details),
    };
  }

  return templates.default_response;
};

module.exports = {
  getMessageContent,
};
