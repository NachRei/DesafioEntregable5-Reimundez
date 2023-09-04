const express = require('express');
const router = express.Router();
const ProductManager = require('../productManager');  
const CartManager = require('../cartManager');        

module.exports = function (io) {
  // Crea una instancia de ProductManager y CartManager
  const productManager = new ProductManager();
  const cartManager = new CartManager();

  router.get('/', (req, res) => {
    res.render('home');
  });

  router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
  });

  // Escuchar conexiones de WebSockets
  io.on('connection', socket => {
    console.log('Cliente conectado');

    // Manejar el evento "addProduct" enviado por el cliente
    socket.on('addProduct', product => {
      // Agregar el producto utilizando ProductManager
      const addedProduct = productManager.addProduct(product);

      // Agregar el producto al carrito utilizando CartManager
      cartManager.addProductToCart(addedProduct.id, 1);  // Agregar una unidad al carrito

      // Emitir el evento "productAdded" a todos los clientes conectados
      io.emit('productAdded', addedProduct);
    });
  });

  return router;
};
