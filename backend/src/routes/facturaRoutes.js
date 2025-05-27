const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    subirFactura,
    obtenerFacturasUsuario,
    obtenerTodasFacturas,
    descargarFactura
} = require('../controllers/facturaController');

// Rutas protegidas para usuarios
router.post('/subir', auth, subirFactura);
router.get('/mis-facturas', auth, obtenerFacturasUsuario);
router.get('/descargar/:id', auth, descargarFactura);

// Rutas protegidas para administradores
router.get('/todas', auth, isAdmin, obtenerTodasFacturas);

module.exports = router; 