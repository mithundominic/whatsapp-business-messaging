const express = require("express");
const axios = require("axios");
const app = express();
const WEBHOOK_VERIFY_TOKEN = "flavours-of-heaven";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/webhook", (req, res) => {
  try {
    // Parse params from the webhook verification request
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Webhook verification:", {
      mode: mode || "not provided",
      token: token || "not provided",
      challenge: challenge || "not provided",
    });

    // Input validation
    if (!mode || !token) {
      console.log("Webhook verification failed:", {
        error: "Missing mode or token",
      });
      return res.sendStatus(400);
    }

    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("Webhook verified:", { challenge });
      return res.status(200).send(challenge);
    }

    // Responds with '403 Forbidden' if verify tokens do not match
    console.log("Webhook verification failed:", {
      mode: mode || "not provided",
      verifyToken: token || "not provided",
      tokenMatch: token === "flavours-of-heaven",
      modeMatch: mode === "subscribe",
    });
    return res.sendStatus(403);
  } catch (error) {
    console.error("Error in verifyWebhook:", error);
    return res.sendStatus(500);
  }
});

app.post("/webhook", (req, res) => {
  try {
    // Add bypass header
    const signature = req.headers["x-hub-signature-256"];

    if (!signature) {
      logWebhook("error", { error: "No signature found in the request" });
      return res.sendStatus(403);
    }

    // Verify the signature
    const elements = signature.split("=");
    if (elements.length !== 2) {
      logWebhook("error", { error: "Invalid signature format" });
      return res.sendStatus(403);
    }

    const signatureHash = elements[1];
    const expectedHash = crypto
      .createHmac("sha256", APP_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signatureHash !== expectedHash) {
      logWebhook("error", { error: "Invalid signature" });
      return res.sendStatus(403);
    }

    const body = req.body;

    // Input validation
    if (!body || !body.object) {
      logWebhook("error", { error: "Invalid request body" });
      return res.sendStatus(400);
    }

    // Checks if this is an event from a page subscription
    if (body.object === "page") {
      // Iterates over each entry - there may be multiple if batched
      if (!Array.isArray(body.entry)) {
        logWebhook("error", { error: "Invalid entry format" });
        return res.sendStatus(400);
      }

      body.entry.forEach(function (entry) {
        if (!entry || !entry.messaging || !Array.isArray(entry.messaging)) {
          logWebhook("error", { error: "Invalid entry format" });
          return;
        }

        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        if (
          !webhook_event ||
          !webhook_event.sender ||
          !webhook_event.sender.id
        ) {
          logWebhook("error", { error: "Invalid webhook event format" });
          return;
        }

        const sender_psid = webhook_event.sender.id;

        logWebhook("event_received", {
          event: webhook_event,
          sender_psid: sender_psid,
        });

        // Handle the event based on its type
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
      });

      // Returns a '200 OK' response to all requests
      res.status(200).send("EVENT_RECEIVED");
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  } catch (error) {
    logger.error("Error in handleWebhook:", error);
    return res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
