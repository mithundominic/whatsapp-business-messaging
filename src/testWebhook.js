const axios = require("axios");

const testWebhook = async () => {
  const webhookPayload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "595236046999775",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15551772564",
                phone_number_id: "617573451429692",
              },
              contacts: [
                {
                  profile: {
                    name: "Mithun Dominic",
                  },
                  wa_id: "919535532826",
                },
              ],
              messages: [
                {
                  from: "919535532826",
                  id: "wamid.HBgMOTE5NTM1NTMyODI2FQIAEhgWM0VCMDgyQ0FCRTI2Njk0QzkyNDRBMQA=",
                  timestamp: "1741192729",
                  type: "order",
                  order: {
                    catalog_id: "517815408011938",
                    text: "",
                    product_items: [
                      {
                        product_retailer_id: "salad001",
                        quantity: 2,
                        item_price: 11,
                        currency: "GBP",
                      },
                      {
                        product_retailer_id: "sandwich001",
                        quantity: 1,
                        item_price: 9.99,
                        currency: "GBP",
                      },
                      {
                        product_retailer_id: "pasta001",
                        quantity: 1,
                        item_price: 7.5,
                        currency: "GBP",
                      },
                      {
                        product_retailer_id: "burger001",
                        quantity: 2,
                        item_price: 8.5,
                        currency: "GBP",
                      },
                      {
                        product_retailer_id: "pizza001",
                        quantity: 1,
                        item_price: 10,
                        currency: "GBP",
                      },
                    ],
                  },
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(
      "http://localhost:3000/webhook",
      webhookPayload
    );
    console.log("Webhook test response:", response.data);
  } catch (error) {
    console.error("Error sending webhook test:", error.response.data);
  }
};

testWebhook();
