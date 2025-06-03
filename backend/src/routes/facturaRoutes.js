// src/routes/facturas.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const {
    subirFactura,
    obtenerFacturasUsuario,
    obtenerTodasFacturas,
    descargarFactura
} = require('../controllers/facturaController');

// Rutas protegidas con autenticación
router.post('/subir', verificarToken, subirFactura);
router.get('/mis-facturas', verificarToken, obtenerFacturasUsuario);
router.get('/descargar/:id', verificarToken, descargarFactura);

// Ruta solo para administradores
router.get('/todas', verificarToken, obtenerTodasFacturas);

module.exports = router;
