// /middlewares/uploadFactura.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ruta donde se guardarán las facturas
const uploadDir = path.join(__dirname, '..', 'uploads', 'facturas');

// Crear la carpeta si no existe (evita errores de guardado)
fs.mkdirSync(uploadDir, { recursive: true });

/**
 * Configuración del almacenamiento de archivos con multer
 */
const storage = multer.diskStorage({
    // Define la carpeta de destino
    destination: (req, file, cb) => cb(null, uploadDir),

    // Define el nombre del archivo
    filename: (req, file, cb) => {
        const uniqueName = 'factura-' + Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname)); // Agrega extensión original (.pdf)
    }
});

/**
 * Middleware de multer configurado con:
 * - Almacenamiento en disco
 * - Filtro para solo permitir archivos PDF
 */
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Solo permitir archivos PDF
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
});

module.exports = upload;
