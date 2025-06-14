const express = require('express');
const router = express.Router();
const { exportarFacturasExcel } = require('../controllers/BDcontroller');

router.get('/exportar-facturas', exportarFacturasExcel);

module.exports = router;