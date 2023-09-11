const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');}

router.get('/', async (req, res) => {
  try {
    // Configuración de parámetros opcionales
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const query = req.query.query || '';
    const sort = req.query.sort === 'desc' ? -1 : 1;

    // Definir el filtro en función de la consulta
    const filter = {};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    // Calcular el índice de inicio y final para paginación
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Contar el total de productos
    const totalProducts = await Product.countDocuments(filter);

    // Obtener los productos con paginación y ordenamiento
    const products = await Product.find(filter)
      .sort({ price: sort })
      .skip(startIndex)
      .limit(limit);

    // Calcular información de paginación
    const totalPages = Math.ceil(totalProducts / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    // Construir la respuesta JSON con todos estos datos
    const response = {
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error en el servidor' });
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
