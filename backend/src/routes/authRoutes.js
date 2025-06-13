// Importa express y crea un router
const express = require('express');
const router = express.Router();

// Importa la función login desde el controlador
const { login } = require('../controllers/authController');

// Ruta para iniciar sesión
// Método: POST
// Ruta: /api/auth/login
// Body esperado: { correo: "", password: "" }
router.post('/login', login);

// Exporta el router para usarlo en app.js o index.js
module.exports = router;
