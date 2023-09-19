const mongoose = require('mongoose');

// Define el esquema del usuario
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Crea y exporta el modelo de usuario
module.exports = mongoose.model('User', userSchema);