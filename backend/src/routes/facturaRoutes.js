const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    subirFactura,
    obtenerFacturasUsuario,
    obtenerTodasFacturas,
    descargarFactura,
    obtenerFacturasPorParcela,
    EliminarFactura,
    AprobarFactura,
    EliminarFacturaUsuario
    
} = require('../controllers/facturaController');

const authMiddleware = require('../middleware/auth');

// Configuración de Multer para archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/facturas'); // carpeta donde se almacenan temporalmente los archivos
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // nombre único
    }
});

const upload = multer({ storage });

// Rutas protegidas
router.post('/subir', authMiddleware, upload.single('archivo'), subirFactura); // <- importante
router.get('/usuario', authMiddleware, obtenerFacturasUsuario);
router.get('/admin', authMiddleware, obtenerTodasFacturas);
router.delete('/eliminar/:id', authMiddleware, EliminarFactura);
router.get('/descargar/:id', authMiddleware, descargarFactura);
router.get('/parcela/:numero', authMiddleware, obtenerFacturasPorParcela);
router.patch('/actualizar/:id', authMiddleware,AprobarFactura); // Actualizar factura
router.delete('/eliminarUser/:id',authMiddleware, EliminarFacturaUsuario); // Eliminar factura por usuario

router.delete('/:id', authMiddleware, EliminarFactura);

module.exports = router;
