const { query } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para almacenar PDFs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/facturas');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'factura-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
}).single('archivo');

// Subir factura con PDF
const subirFactura = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const { usuario_id, tipo_id, fecha_emision, fecha_vencimiento, total } = req.body;
            const archivo_pdf = req.file ? req.file.path : null;

            const result = await query(
                `INSERT INTO facturas 
                (usuario_id, tipo_id, fecha_emision, fecha_vencimiento, total, archivo_pdf) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`,
                [usuario_id, tipo_id, fecha_emision, fecha_vencimiento, total, archivo_pdf]
            );

            // Registrar en historial
            await query(
                'INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion) VALUES ($1, $2, $3, $4)',
                [usuario_id, 'CREAR', 'facturas', 'Nueva factura creada']
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error al subir factura:', error);
            res.status(500).json({ error: 'Error al procesar la factura' });
        }
    });
};

// Obtener facturas del usuario
const obtenerFacturasUsuario = async (req, res) => {
    try {
        // Verificar que el usuario esté autenticado
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Usuario no autenticado' 
            });
        }

        const result = await query(
            `SELECT f.*, tf.nombre as tipo_factura 
            FROM facturas f 
            JOIN TipoFactura tf ON f.tipo_id = tf.id 
            WHERE f.usuario_id = $1 
            ORDER BY f.fecha_emision DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener facturas:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener facturas' 
        });
    }
};

// Obtener todas las facturas (solo admin)
const obtenerTodasFacturas = async (req, res) => {
    try {
        const result = await query(
            `SELECT f.*, tf.nombre as tipo_factura, u.nombre, u.apellido 
            FROM facturas f 
            JOIN TipoFactura tf ON f.tipo_id = tf.id 
            JOIN usuarios u ON f.usuario_id = u.id 
            ORDER BY f.fecha_emision DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

// Descargar PDF de factura
const descargarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            'SELECT * FROM facturas WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        const factura = result.rows[0];

        // Verificar permisos
        if (req.user.rol !== 'admin' && factura.usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para acceder a esta factura' });
        }

        if (!factura.archivo_pdf) {
            return res.status(404).json({ error: 'No hay archivo PDF asociado' });
        }

        res.download(factura.archivo_pdf);
    } catch (error) {
        res.status(500).json({ error: 'Error al descargar la factura' });
    }
};

module.exports = {
    subirFactura,
    obtenerFacturasUsuario,
    obtenerTodasFacturas,
    descargarFactura
}; 