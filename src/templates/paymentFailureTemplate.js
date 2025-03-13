module.exports = {
  type: "text",
  getText: (details) => {
    return {
      body: `Payment failed ❌\n\nReason: ${
        details.failure_message || "Unknown error"
      }\nPlease try again or contact support.`,
    };
  },
};
