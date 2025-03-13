const logger = require("../utils/logger");

module.exports = {
  type: "text",
  getText: (details, paymentLink, orderDetails) => {
    logger.info("Generating order confirmation text", {
      orderDetails,
    });

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
      body: `Thank you for your order!\n\nOrder Details:\n${itemsList}\n\nTotal Amount: ${currency} ${totalAmount}\nPayment Link: ${paymentLink}`,
    };
  },
};
