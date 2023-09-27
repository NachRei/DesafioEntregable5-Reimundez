const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require('bcrypt');

const User = require('./models/User'); // Importa tu modelo de usuario

// Configura Passport para autenticación local
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return done(null, false, { message: 'Usuario no encontrado.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return done(null, false, { message: 'Contraseña incorrecta.' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Configura Passport para autenticación con GitHub
passport.use(new GitHubStrategy({
  clientID: 'e1b937141694073d0bd8',
  clientSecret: '30609359fece4f1622b531b9c203f22e7f840f7f',
  callbackURL: 'http://localhost:8080/auth/github/callback' 
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({ githubId: profile.id });

      if (user) {
        return done(null, user);
      } else {
        const newUser = new User({
          githubId: profile.id,
          username: profile.username,
          role: 'usuario' // Puedes asignar un rol por defecto
        });

        await newUser.save();
        return done(null, newUser);
      }
    } catch (error) {
      return done(error);
    }
  }
));

// Serializa y deserializa al usuario para guardar la sesión
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
