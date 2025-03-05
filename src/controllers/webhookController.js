const logger = require("../utils/logger");
const whatsappService = require("../services/whatsappService");
const config = require("../config/environment");

const handleMessage = async (req, res) => {
  try {
    const body = req.body;

    // Validate webhook body
    if (!body || typeof body !== "object") {
      logger.error("Invalid webhook body", { body });
      return res.sendStatus(400);
    }

    // Log the full webhook payload for debugging
    logger.debug("Received webhook payload", {
      object: body.object,
      entry: body.entry,
    });

    if (body.object === "whatsapp_business_account") {
      // Validate message structure
      if (!body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        return res.sendStatus(200); // Acknowledge non-message webhooks silently
      }

      const message = body.entry[0].changes[0].value.messages[0];
      const metadata = body.entry[0].changes[0].value.metadata;

      // Validate required message fields
      if (!metadata?.phone_number_id || !message?.from) {
        logger.error("Missing required message fields", { message, metadata });
        return res.sendStatus(400);
      }

      const phone_number_id = metadata.phone_number_id;
      const from = message.from;

      // Log received message
      logger.info("Received WhatsApp message", {
        from,
        type: message.type,
        timestamp: message.timestamp,
        messageId: message.id,
      });

      if (message.type === "order") {
        // Handle order message
        const orderDetails = message.order;
        await whatsappService.sendOrderConfirmation(
          phone_number_id,
          from,
          orderDetails
        );
      } else if (message.text?.body) {
        // Handle text message
        const msg_body = message.text.body;
        const templateConfig = whatsappService.getTemplateForMessage(msg_body);
        await whatsappService.sendTemplate(
          phone_number_id,
          from,
          templateConfig.type,
          templateConfig.params
        );
      } else {
        logger.warn("Unsupported message type", { type: message.type });
      }

      return res.sendStatus(200);
    }

    return res.sendStatus(200); // Acknowledge other webhook types silently
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
