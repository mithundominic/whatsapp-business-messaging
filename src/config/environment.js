const config = {
  port: process.env.PORT || 3000,
  webhookToken: process.env.WEBHOOK_VERIFY_TOKEN || "flavours-of-heaven",
  appSecret: process.env.APP_SECRET || "your_app_secret",
};

module.exports = config;
