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

    console.log("Webhook verification:", {
      mode: mode || "not provided",
      token: token || "not provided",
      challenge: challenge || "not provided",
    });

    // Input validation
    if (!mode || !token) {
      console.log("Webhook verification failed:", { error: "Missing mode or token" });
      return res.sendStatus(400);
    }

    // Check the mode and token sent are correct
    const WEBHOOK_VERIFY_TOKEN = "flavours-of-heaven"; // Define the token
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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
