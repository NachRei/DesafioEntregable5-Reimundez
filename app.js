const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport'); // Agregamos Passport
const LocalStrategy = require('passport-local').Strategy; // Agregamos passport-local
const expressSession = require('express-session');
const bcrypt = require('bcrypt'); // Para el hashing de contraseñas
const User = require('./models/userModel'); // Importa tu modelo de usuario
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Importar los modelos de MongoDB
const Product = require('./models/productModel');
const Cart = require('./models/cartModel');
const Message = require('./models/messageModel');
const User = require('./models/userModel');

// Configurar Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Configurar las rutas y sockets
const productsRouter = require('./api/products');
const cartsRouter = require('./api/carts');
const viewsRouter = require('./views');

// Conecta a tu base de datos MongoDB Atlas
mongoose.connect('mongodb+srv://<username>:<password>@cluster0.dpljy8a.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

// Configura Passport
app.use(
  expressSession({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Busca el usuario en la base de datos por nombre de usuario
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }

      // Comprueba si la contraseña es correcta
      if (bcrypt.compareSync(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
    } catch (error) {
      return done(error);
    }
  })
);

// Configurar Passport GitHub Strategy para la autenticación de GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: 'e1b937141694073d0bd8',
      clientSecret: '30609359fece4f1622b531b9c203f22e7f840f7f',
      callbackURL: 'http://localhost:8080/auth/github/callback', // URL de redirección de GitHub
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ githubId: profile.id }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, user); // Usuario encontrado, autenticación exitosa
        } else {
          // Si el usuario no existe, puedes crearlo en tu base de datos
          const newUser = new User({
            username: profile.username, // O utiliza otro campo de perfil de GitHub
            githubId: profile.id,
          });
          newUser.save((err) => {
            if (err) {
              return done(err);
            }
            return done(null, newUser); // Usuario creado y autenticado exitosamente
          });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Rutas para autenticación y autorización

// Ruta para el formulario de registro
app.get('/register', (req, res) => {
  res.render('register');
});

// Ruta para procesar el registro
app.post('/register', async (req, res) => {
  // Procesar el registro y crear un nuevo usuario en la base de datos
  // Hash de la contraseña y guarda el usuario
  // Redireccionar al usuario a la vista de inicio de sesión
});

// Ruta para el formulario de inicio de sesión
app.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para procesar el inicio de sesión
app.post('/login', passport.authenticate('local', {
  successRedirect: '/products', // Redireccionar después del inicio de sesión exitoso
  failureRedirect: '/login', // Redireccionar en caso de fallo de inicio de sesión
}));

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

// Ruta protegida, solo accesible para usuarios autenticados
app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('profile', { user: req.user }); // Renderizar la vista de perfil
  } else {
    res.redirect('/login'); // Redireccionar si no está autenticado
  }
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

// Configura las rutas de autenticación
const authRouter = require('./auth/auth');
app.use('/auth', authRouter);

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});