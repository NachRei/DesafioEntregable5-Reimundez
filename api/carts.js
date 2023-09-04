const express = require('express');
const router = express.Router();
const CartManager = require('../cartManager');

const cartManager = new CartManager('data/carrito.json');

router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito.' });
  }
});

router.get('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await cartManager.getCartById(cartId);
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Carrito no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito.' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;

  try {
    const addedProduct = await cartManager.addProductToCart(cartId, productId, quantity);
    if (addedProduct) {
      res.json(addedProduct);
    } else {
      res.status(400).json({ error: 'Error al agregar el producto al carrito.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});

module.exports = router;
