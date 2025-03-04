const axios = require("axios");
const logger = require("../utils/logger");
const { WHATSAPP_TOKEN } = require("../config/environment");
const { getTemplateByType } = require("../templates/whatsappTemplates");

class WhatsAppService {
  constructor() {
    this.baseUrl = "https://graph.facebook.com/v12.0";
  }

  async sendTemplate(phoneNumberId, to, templateType, params = {}) {
    try {
      const template = getTemplateByType(templateType, params);

      const data = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: "Hello Mithun Dominic" || template,
      };

      const response = await axios({
        method: "POST",
        url: `${this.baseUrl}/${phoneNumberId}/messages`,
        data: data,
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      logger.info("Template message sent successfully", {
        templateType,
        to,
        response: response.data,
      });

      return response.data;
    } catch (error) {
      logger.error("Error sending template message", error);
      throw error;
    }
  }

  getTemplateForMessage(message) {
    const msg = message.toLowerCase();

    switch (msg) {
      case "hi":
        return {
          type: "hello_world",
        };
      case "book":
        return {
          type: "booking_confirmation",
          params: {
            name: "John Doe",
            rooms: "2",
            date: "2023-06-15",
          },
        };
      default:
        return {
          type: "sample_shipping_confirmation",
        };
    }
  }
}

module.exports = new WhatsAppService();
