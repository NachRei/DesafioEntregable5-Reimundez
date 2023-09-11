const express = require('express');
const router = express.Router();
const CartManager = require('../cartManager');

// Crea una instancia de CartManager
const cartManager = new CartManager('data/carrito.json');

// Ruta para eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const result = await cartManager.deleteProductFromCart(cartId, productId);
    if (result) {
      res.json({ message: 'Producto eliminado del carrito exitosamente.' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado en el carrito.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto del carrito.' });
  }
});

// Ruta para actualizar el carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  const updatedProducts = req.body.products; // Asume que req.body.products es un arreglo de productos

  try {
    const result = await cartManager.updateCart(cartId, updatedProducts);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Carrito no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el carrito.' });
  }
});

// Ruta para actualizar la cantidad de ejemplares de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity;

  try {
    const updatedProduct = await cartManager.updateProductQuantity(cartId, productId, quantity);
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: 'Producto no encontrado en el carrito.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la cantidad de ejemplares del producto.' });
  }
});

// Ruta para eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const result = await cartManager.clearCart(cartId);
    if (result) {
      res.json({ message: 'Carrito vaciado exitosamente.' });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar el carrito.' });
  }
});

// Exporta el router
module.exports = router;