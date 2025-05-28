// src/routes/facturas.js
const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/facturaController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Ruta protegida para usuarios
router.post('/subir', verifyToken, requireRole('usuario'), facturaCtrl.subirFactura);

// Ruta protegida para admin
router.get('/pendientes', verifyToken, requireRole('administrador'), facturaCtrl.verPendientes);

module.exports = router;
