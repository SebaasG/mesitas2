// /middlewares/uploadFactura.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ruta donde se guardarán las facturas
const uploadDir = path.join(__dirname, '..', 'uploads', 'facturas');

// Crear la carpeta si no existe
fs.mkdirSync(uploadDir, { recursive: true });

/**
 * Configuración del almacenamiento de archivos con multer
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = 'factura-' + Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
    }
});

/**
 * Extensiones MIME permitidas
 */
const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
];

/**
 * Middleware de multer configurado para aceptar PDF e imágenes
 */
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF o imágenes (jpg, jpeg, png)'));
        }
    }
});

module.exports = upload;
