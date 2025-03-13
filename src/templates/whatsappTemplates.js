const logger = require("../utils/logger");
const {
  default_response: defaultResponseTemplate,
  payment_success: paymentSuccessTemplate,
  payment_failure: paymentFailureTemplate,
  order_confirmation: orderConfirmationTemplate,
} = require("./templates");

const TEMPLATE_TYPES = {
  ORDER_CONFIRMATION: "order_confirmation",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILURE: "payment_failure",
};

/**
 * Get message content based on message type and details
 * @param {string} type - Message type
 * @param {object} details - Message details
 * @param {string} paymentLink - Payment link for order confirmation
 * @returns {object} Message content configuration
 */
const getMessageContent = (type, details = {}, paymentLink = "") => {
  logger.info("getMessageContent invoked", { type, details });

  // Handle invalid type early
  if (!Object.values(TEMPLATE_TYPES).includes(type)) {
    logger.warn("Returning default response for invalid type", { type });
    return defaultResponseTemplate;
  }

  // Handle order confirmation
  if (type === TEMPLATE_TYPES.ORDER_CONFIRMATION && details?.body) {
    const orderText = orderConfirmationTemplate.getText(details, paymentLink);
    logger.info("Returning order confirmation message", { orderText });
    return { type: "text", text: orderText };
  }

  // Handle other template types
  const templateMap = {
    [TEMPLATE_TYPES.PAYMENT_SUCCESS]: paymentSuccessTemplate,
    [TEMPLATE_TYPES.PAYMENT_FAILURE]: paymentFailureTemplate,
  };

  return {
    type: "text",
    text: templateMap[type].getText(details),
  };
};

module.exports = {
  getMessageContent,
  TEMPLATE_TYPES,
};
