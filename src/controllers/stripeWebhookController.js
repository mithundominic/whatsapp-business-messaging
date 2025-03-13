const stripe = require("stripe");
const logger = require("../utils/logger");
const config = require("../config/environment");
const stripeWebhookService = require("../services/stripeWebhookService");

// Initialize Stripe with the secret key
const stripeClient = stripe(config.stripe.secretKey);
logger.debug("Stripe client initialized with secret key");

/**
 * Verify the Stripe webhook signature
 * @param {string} signature - The Stripe webhook signature
 * @param {Buffer} body - The raw request body
 * @returns {object|null} The Stripe event if valid, otherwise null
 */
const verifyWebhookSignature = (signature, body) => {
  logger.info("Verifying Stripe webhook signature...", {
    signatureLength: signature.length,
    bodyLength: body.length,
  });

  try {
    // Log the raw body for debugging
    logger.debug("Raw body for verification:", {
      body: body.toString(),
      length: body.length,
      first100Chars: body.toString().substring(0, 100),
      last100Chars: body.toString().substring(body.length - 100),
    });

    const event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      config.stripe.webhookSecret
    );

    logger.success("Webhook signature verified successfully", {
      type: event.type,
      id: event.id,
      created: event.created,
      apiVersion: event.api_version,
    });

    return event;
  } catch (error) {
    logger.error("Failed to verify Stripe webhook signature", {
      errorType: error.type,
      errorMessage: error.message,
      signature: signature,
      body: body.toString(),
    });
    return null;
  }
};

/**
 * Handle Stripe webhook events
 * @param {object} req - The Express request object
 * @param {object} res - The Express response object
 */
const handleWebhook = async (req, res) => {
  logger.info("Incoming Stripe webhook request", {
    headers: req.headers,
    ip: req.ip,
  });

  try {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      logger.error("Missing Stripe signature header", {
        headers: req.headers,
      });
      return res.status(400).send("Bad Request: Missing Stripe signature");
    }

    if (!req.rawBody) {
      logger.error("Missing raw body for webhook verification", {
        body: req.body,
      });
      return res.status(400).send("Bad Request: Missing raw body");
    }

    if (!config.stripe.webhookSecret) {
      logger.error("Missing Stripe webhook secret in configuration");
      return res
        .status(500)
        .send("Internal Server Error: Missing webhook secret");
    }

    // Verify the webhook signature
    logger.debug("Starting webhook signature verification");
    const event = verifyWebhookSignature(signature, req.rawBody);
    if (!event) {
      logger.error("Invalid Stripe webhook signature", {
        signature: signature,
        rawBody: req.rawBody.toString(),
      });
      return res.status(400).send("Bad Request: Invalid signature");
    }

    logger.success("Received valid Stripe webhook event", {
      type: event.type,
      id: event.id,
      created: event.created,
      apiVersion: event.api_version,
    });

    // Handle specific event types
    logger.debug(`Processing Stripe event type: ${event.type}`);
    switch (event.type) {
      case "checkout.session.completed":
        logger.info("Checkout session completed", {
          sessionId: event.data.object.id,
          customer: event.data.object.customer,
          paymentStatus: event.data.object.payment_status,
          amountTotal: event.data.object.amount_total,
        });
        break;

      case "payment_intent.succeeded":
        logger.debug("Starting payment intent success handling");
        await stripeWebhookService.handlePaymentIntentSucceeded(
          event.data.object
        );
        logger.debug("Completed payment intent success handling");
        break;

      case "payment_intent.payment_failed":
        logger.debug("Starting payment intent failure handling");
        await stripeWebhookService.handlePaymentIntentFailed(event.data.object);
        logger.debug("Completed payment intent failure handling");
        break;

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`, {
          eventData: event.data,
        });
    }

    logger.info("Successfully processed Stripe webhook event", {
      type: event.type,
      processingTime: `${Date.now() - event.created * 1000}ms`,
    });
    res.sendStatus(200);
  } catch (error) {
    logger.error("Error handling Stripe webhook", {
      message: error.message,
      stack: error.stack,
      requestHeaders: req.headers,
      requestBody: req.body,
    });
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  handleWebhook,
};
