const templates = {
  hello_world: {
    name: 'hello_world',
    language: {
      code: 'en_US'
    }
  },
  booking_confirmation: {
    name: 'booking_confirmation',
    language: {
      code: 'en_US'
    },
    getComponents: (name, rooms, date) => ({
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: name
        },
        {
          type: 'text',
          text: rooms
        },
        {
          type: 'text',
          text: date
        }
      ]
    })
  },
  sample_shipping_confirmation: {
    name: 'sample_shipping_confirmation',
    language: {
      code: 'en_US'
    }
  }
};

const getTemplateByType = (type, params = {}) => {
  const template = templates[type];
  if (!template) {
    throw new Error(`Template ${type} not found`);
  }

  const templateData = {
    name: template.name,
    language: template.language
  };

  if (template.getComponents) {
    templateData.components = [template.getComponents(...Object.values(params))];
  }

  return templateData;
};

module.exports = {
  getTemplateByType
};
