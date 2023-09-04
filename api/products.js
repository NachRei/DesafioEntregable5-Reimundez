const express = require('express');
const router = express.Router();
const ProductManager = require('../productManager');

const productManager = new ProductManager('data/productos.json');

router.get('/', async (req, res) => {
  const { limit } = req.query;
  try {
    const products = await productManager.getProducts();
    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        res.json(products.slice(0, parsedLimit));
      } else {
        res.status(400).json({ error: 'El valor del límite debe ser un número entero positivo.' });
      }
    } else {
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

router.get('/:pid', async (req, res) => {
  const productId = req.params.pid;
  try {
    const product = await productManager.getProductById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
});

router.post('/', async (req, res) => {
  const newProduct = req.body;
  try {
    const addedProduct = await productManager.addProduct(newProduct);
    res.status(201).json(addedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto.' });
  }
});

router.put('/:pid', async (req, res) => {
  const productId = req.params.pid;
  const updatedProduct = req.body;
  try {
    const result = await productManager.updateProduct(productId, updatedProduct);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto.' });
  }
});

router.delete('/:pid', async (req, res) => {
  const productId = req.params.pid;
  try {
    const result = await productManager.deleteProduct(productId);
    if (result) {
      res.json({ message: 'Producto eliminado exitosamente.' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
});

module.exports = router;
