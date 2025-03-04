const logger = require("../utils/logger");
const whatsappService = require("../services/whatsappService");
const { WHATSAPP_TOKEN } = require("../config/environment");

const handleMessage = async (req, res) => {
  try {
    const body = req.body;

    // Log incoming webhook data for debugging
    logger.info("Received webhook data", { body });

    // Validate webhook body
    if (!body || typeof body !== "object") {
      logger.error("Invalid webhook body", { body });
      return res.sendStatus(400);
    }

    if (body.object === "whatsapp_business_account") {
      // Validate message structure
      if (!body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        logger.info("No message in webhook", { body });
        return res.sendStatus(200); // Acknowledge non-message webhooks
      }

      const message = body.entry[0].changes[0].value.messages[0];
      const metadata = body.entry[0].changes[0].value.metadata;

      // Validate required message fields
      if (
        !metadata?.phone_number_id ||
        !message?.from ||
        !message?.text?.body
      ) {
        logger.error("Missing required message fields", { message, metadata });
        return res.sendStatus(400);
      }

      const phone_number_id = metadata.phone_number_id;
      const from = message.from;
      const msg_body = message.text.body;

      // Get template configuration based on message
      const templateConfig = whatsappService.getTemplateForMessage(msg_body);

      // Send template message
      await whatsappService.sendTemplate(
        phone_number_id,
        from,
        templateConfig.type,
        templateConfig.params
      );

      return res.sendStatus(200);
    }

    logger.info("Unhandled webhook object type", { objectType: body.object });
    return res.sendStatus(200); // Acknowledge other webhook types
  } catch (error) {
    logger.error("Error in webhook handler", error);
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

    if (mode === "subscribe" && token === WHATSAPP_TOKEN) {
      logger.info("Webhook verified successfully");
      return res.status(200).send(challenge);
    }

    logger.error("Failed webhook verification", { mode, token });
    return res.sendStatus(403);
  } catch (error) {
    logger.error("Error in webhook verification", error);
    return res.sendStatus(500);
  }
};

module.exports = {
  handleMessage,
  verifyWebhook,
};
