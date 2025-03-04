const logger = require("../utils/logger");
const config = require("../config/environment");

const verifyWebhook = (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    logger.info("Webhook verification:", {
      mode: mode || "not provided",
      token: token || "not provided",
      challenge: challenge || "not provided",
    });

    if (!mode || !token) {
      logger.error("Webhook verification failed:", {
        error: "Missing mode or token",
      });
      return res.sendStatus(400);
    }

    if (mode === "subscribe" && token === config.webhookToken) {
      logger.info("Webhook verified:", { challenge });
      return res.status(200).send(challenge);
    }

    logger.error("Webhook verification failed:", {
      mode: mode || "not provided",
      verifyToken: token || "not provided",
      tokenMatch: token === config.webhookToken,
      modeMatch: mode === "subscribe",
    });
    return res.sendStatus(403);
  } catch (error) {
    logger.error("Error in verifyWebhook:", error);
    return res.sendStatus(500);
  }
};

const handleWebhook = (req, res) => {
  try {
    const body = req.body;

    // Log the entire webhook payload for debugging
    logger.info("Webhook payload received:", { payload: body });

    // Check if this is a WhatsApp message event
    if (body.object === "whatsapp_business_account") {
      if (body.entry && Array.isArray(body.entry)) {
        body.entry.forEach((entry) => {
          // Log entry metadata
          logger.info("Processing webhook entry:", {
            id: entry.id,
            time: entry.time,
          });

          if (entry.changes && Array.isArray(entry.changes)) {
            entry.changes.forEach((change) => {
              // Check for message in the change value
              if (
                change.value &&
                change.value.messages &&
                Array.isArray(change.value.messages)
              ) {
                change.value.messages.forEach((message) => {
                  // Log detailed message information
                  logger.info("WhatsApp message received:", {
                    messageId: message.id,
                    from: message.from,
                    timestamp: message.timestamp,
                    type: message.type,
                    text: message.text?.body,
                    status: message.status,
                  });
                });
              }

              // Log message status updates if present
              if (
                change.value &&
                change.value.statuses &&
                Array.isArray(change.value.statuses)
              ) {
                change.value.statuses.forEach((status) => {
                  logger.info("WhatsApp message status update:", {
                    messageId: status.id,
                    recipientId: status.recipient_id,
                    status: status.status,
                    timestamp: status.timestamp,
                  });
                });
              }
            });
          }
        });
      }
    }

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    logger.error("Error in handleWebhook:", error);
    return res.sendStatus(500);
  }
};

module.exports = {
  verifyWebhook,
  handleWebhook,
};
