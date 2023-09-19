const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const router = express.Router();

const User = require('./models/User'); // Asegúrate de importar tu modelo de usuario correctamente

// Ruta de registro
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    // Crea un nuevo usuario en la base de datos
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      role: 'usuario', // Asigna el rol por defecto como 'usuario'
    });

    await newUser.save();

    // Inicia sesión después del registro
    req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/products');
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

// Ruta de inicio de sesión
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/products', // Redirige al usuario a la vista de productos después del inicio de sesión exitoso
  failureRedirect: '/auth/login',
  failureFlash: true,
}));

// Ruta de cierre de sesión
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/auth/login');
});

module.exports = router;
