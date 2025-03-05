const axios = require("axios");
const logger = require("../utils/logger");
const config = require("../config/environment");
const { getMessageContent } = require("../templates/whatsappTemplates");

class WhatsAppService {
  constructor() {
    this.baseUrl = `${config.whatsapp.apiUrl}/${config.whatsapp.apiVersion}`;
  }

  async sendMessage(phoneNumberId, to, type, details = {}) {
    try {
      const messageContent = getMessageContent(type, details);

      const data = {
        messaging_product: "whatsapp",
        to: to,
        ...messageContent,
      };

      logger.debug("Sending WhatsApp message", {
        to,
        type,
        data,
      });

      const response = await axios({
        method: "POST",
        url: `${this.baseUrl}/${phoneNumberId}/messages`,
        data: data,
        headers: {
          Authorization: `Bearer ${config.whatsapp.token}`,
          "Content-Type": "application/json",
        },
      });

      logger.debug("Message sent successfully", {
        to,
        type,
        status: response.data.status || "sent",
      });

      return response.data;
    } catch (error) {
      logger.error("Error sending message", {
        error: error.message,
        file: "whatsappService.js",
        line: error.stack?.split("\n")[1]?.trim() || "unknown",
        stack: error.stack,
      });
      throw error;
    }
  }

  async sendOrderConfirmation(phoneNumberId, to, orderDetails) {
    try {
      const messageContent = getMessageContent(
        "orderConfirmation",
        orderDetails
      );

      const data = {
        messaging_product: "whatsapp",
        to: to,
        ...messageContent,
      };

      logger.debug("Sending order confirmation", {
        to,
        data,
      });

      const response = await this.sendMessage(
        phoneNumberId,
        to,
        "orderConfirmation",
        orderDetails
      );

      logger.debug("Order confirmation sent successfully", {
        to,
        status: response.status || "sent",
      });

      return response;
    } catch (error) {
      logger.error("Error sending order confirmation", {
        error: error.message,
        file: "whatsappService.js",
        line: error.stack?.split("\n")[1]?.trim() || "unknown",
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
