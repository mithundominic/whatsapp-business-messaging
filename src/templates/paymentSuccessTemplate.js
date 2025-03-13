const logger = require("../utils/logger");

module.exports = {
  type: "text",
  getText: (details) => {
    const receiptUrl = details.receipt_url || "Not available";
    return {
      body: `Payment successful! 🎉\n\nAmount: ${details.currency} ${
        details.amount / 100
      }\nReceipt: ${receiptUrl}`,
    };
  },
};
