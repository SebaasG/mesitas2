const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../controllers/userController');

router.post('/registro', registrarUsuario);

module.exports = router;
