require("dotenv").config();

const config = {
  port: process.env.PORT || 3000,
  whatsapp: {
    token: process.env.WHATSAPP_ACCESS_TOKEN,
    apiVersion: process.env.WHATSAPP_API_VERSION,
    apiUrl: process.env.WHATSAPP_API_URL,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessPhoneNumber: process.env.BUSINESS_PHONE_NUMBER,
  },
  webhookToken: process.env.WHATSAPP_WEBHOOK_SECRET,
  nodeEnv: process.env.NODE_ENV,
};

// Validate required environment variables
const requiredEnvVars = [
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_API_VERSION",
  "WHATSAPP_API_URL",
  "WHATSAPP_BUSINESS_ACCOUNT_ID",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_WEBHOOK_SECRET",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

module.exports = config;
