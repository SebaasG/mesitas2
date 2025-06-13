// Importa express y crea un router
const express = require('express');
const router = express.Router();

// Importa la función login desde el controlador
const { login } = require('../controllers/authController');
const { registrarUsuario } = require('../controllers/userController');


// Ruta para iniciar sesión
// Método: POST
// Ruta: /api/auth/login
// Body esperado: { correo: "", password: "" }
router.post('/login', login);
// Ruta para registrar un nuevo usuario
router.post('/register', registrarUsuario);

// Exporta el router para usarlo en app.js o index.js
module.exports = router;
