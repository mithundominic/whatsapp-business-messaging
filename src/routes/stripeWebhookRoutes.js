const express = require('express');
const router = express.Router();
const stripeWebhookService = require('../services/stripeWebhookService');
const logger = require('../utils/logger');

// Stripe webhook endpoint
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      logger.error('Missing Stripe signature');
      return res.sendStatus(400);
    }

    // Verify and construct the event
    const event = stripeWebhookService.constructEvent(req.body, signature);
    
    // Handle the webhook event
    await stripeWebhookService.handleWebhookEvent(event);

    res.sendStatus(200);
  } catch (error) {
    logger.error('Stripe webhook error', {
      error: error.message,
      stack: error.stack
    });
    res.sendStatus(400);
  }
});

module.exports = router;
