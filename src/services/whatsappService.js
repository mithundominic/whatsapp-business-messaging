const axios = require("axios");
const logger = require("../utils/logger");
const config = require("../config/environment");
const { getMessageContent } = require("../templates/whatsappTemplates");

class WhatsAppService {
  constructor() {
    this.baseUrl = `${config.whatsapp.apiUrl}/${config.whatsapp.apiVersion}`;
    this.headers = {
      Authorization: `Bearer ${config.whatsapp.token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Sends a WhatsApp message.
   * @param {string} phoneNumberId - The WhatsApp phone number ID.
   * @param {string} to - Recipient's phone number.
   * @param {string} type - Message type (text, template, media, etc.).
   * @param {object} details - Message content details.
   * @returns {Promise<object>} - API response.
   */
  async sendMessage(phoneNumberId, to, type, details = {}) {
    if (!phoneNumberId || !to || !type) {
      throw new Error(
        "Missing required parameters: phoneNumberId, to, or type"
      );
    }

    try {
      const payload = {
        messaging_product: "whatsapp",
        to,
        ...getMessageContent(type, details),
      };

      logger.debug("Sending WhatsApp message", { to, type, payload });

      const { data, status } = await axios.post(
        `${this.baseUrl}/${phoneNumberId}/messages`,
        payload,
        { headers: this.headers }
      );

      logger.debug("Message sent successfully", {
        to,
        type,
        status: data.status || "sent",
        httpStatus: status,
      });

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message || error.message;
      const httpStatus = error.response?.status || "unknown";
      const errorDetails = error.response?.data || {};

      logger.error("Error sending message", {
        errorMessage,
        httpStatus,
        file: "whatsappService.js",
        stack: error.stack,
        errorDetails,
      });

      throw new Error(`Failed to send message to ${to}: ${errorMessage}`);
    }
  }

  /**
   * Sends an order confirmation message.
   * @param {string} phoneNumberId - The WhatsApp phone number ID.
   * @param {string} to - Recipient's phone number.
   * @param {object} orderDetails - Order details.
   * @returns {Promise<object>} - API response.
   */
  async sendOrderConfirmation(phoneNumberId, to, orderDetails = {}) {
    logger.debug("Sending order confirmation", {
      phoneNumberId,
      to,
      orderDetails,
    });
    logger.info("Order details Mithun", orderDetails.id);
    if (!orderDetails.id) {
      throw new Error("Missing required order details: id or status Mithun");
    }

    return this.sendMessage(
      phoneNumberId,
      to,
      "order_confirmation",
      orderDetails
    );
  }
}

module.exports = new WhatsAppService();
