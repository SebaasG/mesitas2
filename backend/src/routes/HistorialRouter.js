// routes/historialRouter.js
const express = require('express');
const router = express.Router();
const { ObtenerHistorial } = require('../controllers/historialcontroller');

// Ruta para obtener el historial completo de facturas
router.get('/', ObtenerHistorial);

module.exports = router;
