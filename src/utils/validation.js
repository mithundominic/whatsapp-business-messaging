const logger = require("./logger");

/**
 * Validate the webhook body
 * @param {object} body - The webhook body
 * @returns {boolean} True if the body is valid, false otherwise
 */
const validateWebhookBody = (body) => {
  if (!body || typeof body !== "object") {
    logger.error("Invalid webhook body", { body });
    return false;
  }
  return true;
};

/**
 * Validate the message structure
 * @param {object} message - The message object
 * @returns {boolean} True if the message is valid, false otherwise
 */
const validateMessageStructure = (message) => {
  if (!message?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    logger.error("Invalid message structure", { message });
    return false;
  }
  return true;
};

module.exports = {
  validateWebhookBody,
  validateMessageStructure,
};
