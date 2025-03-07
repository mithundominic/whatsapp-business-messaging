const logger = require("../utils/logger");
const { calculateTotalAmount } = require("../utils/calculationUtils");
const whatsappService = require("../services/whatsappService");
const paymentService = require("../services/paymentService");
const config = require("../config/environment");
const {
  validateWebhookBody,
  validateMessageStructure,
} = require("../utils/validation");

/**
 * Handle order messages
 * @param {string} phoneNumberId - The phone number ID
 * @param {string} from - The sender's phone number
 * @param {object} orderDetails - The order details
 * @param {string} id - The ID from the webhook payload
 */
const handleOrderMessage = async (phoneNumberId, from, orderDetails, id) => {
  logger.info("Order details received", { orderDetails, id });
  if (orderDetails) {
    const totalAmount = calculateTotalAmount(orderDetails.product_items);
    logger.info("Total amount calculated", { totalAmount });

    await whatsappService.sendOrderConfirmation(phoneNumberId, from, {
      ...orderDetails,
      totalAmount, // Include total amount in the order confirmation
      id,
    });
  } else {
    logger.warn("No order details found in the message", { orderDetails });
  }
};

/**
 * Handle text messages
 * @param {string} phoneNumberId - The phone number ID
 * @param {string} from - The sender's phone number
 * @param {string} messageBody - The message body
 */
const handleTextMessage = async (phoneNumberId, from, messageBody) => {
  const templateConfig = whatsappService.getTemplateForMessage(messageBody);
  await whatsappService.sendTemplate(
    phoneNumberId,
    from,
    templateConfig.type,
    templateConfig.params
  );
};

const handleMessage = async (req, res) => {
  try {
    const body = req.body;

    // Validate webhook body
    if (!validateWebhookBody(body)) {
      return res.sendStatus(400);
    }

    // Log the full webhook payload for debugging
    logger.debug("Received webhook payload", {
      object: body.object,
      entry: body.entry,
    });

    if (body.object === "whatsapp_business_account") {
      // Validate message structure
      if (!validateMessageStructure(body)) {
        return res.sendStatus(200); // Acknowledge non-message webhooks silently
      }

      const message = body.entry[0]?.changes[0]?.value?.messages?.[0];
      const metadata = body.entry[0]?.changes[0]?.value?.metadata;
      const id = body.entry[0]?.id;

      // Validate required message fields
      if (!metadata?.phone_number_id || !message?.from) {
        logger.error("Missing required message fields", { message, metadata });
        return res.sendStatus(400);
      }

      const phoneNumberId = metadata.phone_number_id;
      const from = message.from;

      // Log received message
      logger.info("Received WhatsApp message", {
        from,
        type: message.type,
        timestamp: message.timestamp,
        messageId: message?.id || "N/A",
      });

      if (message.type === "order") {
        const orderDetails = message.order || null; // Ensure order details are extracted correctly and it's null if not present
        await handleOrderMessage(phoneNumberId, from, orderDetails, id);
      } else if (message.text && message.text.body) {
        await handleTextMessage(phoneNumberId, from, message.text.body);
      } else {
        logger.warn("Unsupported message type", { type: message.type });
      }

      await res.sendStatus(200);
      return;
    }

    await res.sendStatus(200); // Acknowledge other webhook types silently
  } catch (error) {
    logger.error("Error in webhook handler", {
      error: error.message,
      file: "webhookController.js",
      line: error.stack?.split("\n")[1]?.trim() || "unknown",
      stack: error.stack,
    });
    return res.sendStatus(500);
  }
};

const verifyWebhook = (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (!mode || !token) {
      logger.error("Missing mode or token in verification request");
      return res.sendStatus(400);
    }

    if (mode === "subscribe" && token === config.webhookToken) {
      logger.info("Webhook verified successfully");
      return res.status(200).send(challenge);
    }

    logger.error("Failed webhook verification", { mode, token });
    return res.sendStatus(403);
  } catch (error) {
    logger.error("Error in webhook verification", {
      error: error.message,
      file: "webhookController.js",
      line: error.stack?.split("\n")[1]?.trim() || "unknown",
      stack: error.stack,
    });
    return res.sendStatus(500);
  }
};

module.exports = {
  handleMessage,
  verifyWebhook,
};
