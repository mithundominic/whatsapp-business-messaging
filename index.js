const express = require("express");
const axios = require("axios");

const app = express();
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

    logWebhook("verification", {
      mode: mode || "not provided",
      token: token || "not provided",
      challenge: challenge || "not provided",
    });

    // Input validation
    if (!mode || !token) {
      logWebhook("verification_failed", { error: "Missing mode or token" });
      return res.sendStatus(400);
    }

    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      logWebhook("verified", { challenge });
      return res.status(200).send(challenge);
    }

    // Responds with '403 Forbidden' if verify tokens do not match
    logWebhook("verification_failed", {
      mode: mode || "not provided",
      verifyToken: token || "not provided",
      tokenMatch: token === "flavours-of-heaven",
      modeMatch: mode === "subscribe",
    });
    return res.sendStatus(403);
  } catch (error) {
    logger.error("Error in verifyWebhook:", error);
    return res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
