const express = require('express');
const router = express.Router();
const {
  getCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
} = require('../controllers/cart.controller');

router.get('/', getCartItems);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);
router.post('/checkout', checkout);

module.exports = router;
