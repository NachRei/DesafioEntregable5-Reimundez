const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Importar los modelos de MongoDB
const Product = require('./models/productModel');
const Cart = require('./models/cartModel');
const Message = require('./models/messageModel');

// Configurar Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Configurar las rutas y sockets
const productsRouter = require('./api/products');
const cartsRouter = require('./api/carts');
const viewsRouter = require('./views');

app.use(express.json());
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter(io));  // Pasar la instancia de "io" al viewsRouter

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

// Configurar conexión a la base de datos de MongoDB Atlas

const uri = "mongodb+srv://<username>:<password>@cluster0.dpljy8a.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Ruta para el chat
app.get('/chat', (req, res) => {
  res.render('chat');
});

// Configurar Socket.io para el chat
io.on('connection', (socket) => {
  console.log('Usuario conectado al chat');

  // Escuchar eventos de mensajes del cliente
  socket.on('chatMessage', (message) => {
    // Aquí, guarda el mensaje en MongoDB
    const newMessage = new Message(message);
    newMessage.save();

    // Emitir el mensaje a todos los clientes conectados
    io.emit('chatMessage', message);
  });
});

// Ruta para mostrar todos los productos (view 1.1 o 1.2)
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find(); // Obtener todos los productos desde MongoDB
    res.render('products', { products });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

// Ruta para mostrar un carrito específico (view 2)
app.get('/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await Cart.findById(cartId).populate('products.product'); // Obtener el carrito y los productos asociados
    if (cart) {
      res.render('cart', { cart });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito.' });
  }
});