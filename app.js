const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

//Configura conexión a base de datos de MongoDB

const uri = "mongodb+srv://<username>:<password>@cluster0.dpljy8a.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

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
    const Message = mongoose.model('Message', messageSchema);
    const newMessage = new Message(message);
    newMessage.save();

    // Emitir el mensaje a todos los clientes conectados
    io.emit('chatMessage', message);
  });
});

