// routes/historialRouter.js

const express = require('express');
const router = express.Router();

// Importa tu middleware de JWT si ya lo usas en historialcontroller
const authMiddleware = require('../middleware/auth');
const { ObtenerHistorial } = require('../controllers/historialcontroller');

// Ruta protegida para obtener historial del usuario autenticado
// Método: GET
// URL completa si en tu app haces `app.use('/api/historial', router)` → GET /api/historial
router.get('/', authMiddleware, ObtenerHistorial);

module.exports = router;
