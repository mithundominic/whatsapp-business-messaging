function calculateTotalAmount(productItems) {
  return productItems.reduce((sum, item) => {
    return sum + item.quantity * item.item_price;
  }, 0);
}

module.exports = { calculateTotalAmount };
