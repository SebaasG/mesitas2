const { query } = require('../config/db');
const path = require('path');
const fs = require('fs');

// Ruta donde se almacenan los PDFs
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'facturas');

// ---------------------- SUBIR FACTURA ----------------------
const subirFactura = async (req, res) => {
    try {
        const { tipo_id, fecha_emision, fecha_vencimiento, total } = req.body;
        const archivo = req.file;

        // Validar datos requeridos
        if (!tipo_id || !fecha_emision || !fecha_vencimiento || !total) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        if (!archivo) {
            return res.status(400).json({ error: 'Archivo PDF no proporcionado' });
        }

        const usuario_id = req.user?.id || req.usuario_id || 1; // Ajusta según cómo manejes auth
        const archivo_pdf = archivo.filename;

        const result = await query(`
            INSERT INTO facturas (usuario_id, tipo_id, fecha_emision, fecha_vencimiento, total, archivo_pdf)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [usuario_id, tipo_id, fecha_emision, fecha_vencimiento, total, archivo_pdf]
        );

        await query(`
            INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion)
            VALUES ($1, 'CREAR', 'facturas', 'Nueva factura creada')`,
            [usuario_id]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error al subir factura:', error);
        res.status(500).json({ error: 'Error al procesar la factura' });
    }
};

// ---------------------- OBTENER FACTURAS USUARIO ----------------------
const obtenerFacturasUsuario = async (req, res) => {
    try {
        const usuario_id = req.user?.id;
        if (!usuario_id) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        const result = await query(`
            SELECT f.*, tf.nombre AS tipo_factura
            FROM facturas f
            JOIN TipoFactura tf ON f.tipo_id = tf.id
            WHERE f.usuario_id = $1
            ORDER BY f.fecha_emision DESC`,
            [usuario_id]
        );

        res.json({ success: true, data: result.rows });

    } catch (error) {
        console.error('Error al obtener facturas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener facturas' });
    }
};

// ---------------------- OBTENER TODAS (ADMIN) ----------------------
const obtenerTodasFacturas = async (req, res) => {
    try {
        const result = await query(`
            SELECT f.*, tf.nombre AS tipo_factura, u.nombre, u.apellido
            FROM facturas f
            JOIN TipoFactura tf ON f.tipo_id = tf.id
            JOIN usuarios u ON f.usuario_id = u.id
            ORDER BY f.fecha_emision DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener todas las facturas:', error);
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

// ---------------------- ELIMINAR FACTURA ----------------------
const EliminarFactura = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM facturas WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        await query(`
            INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion)
            VALUES ($1, 'ELIMINAR', 'facturas', $2)`,
            [req.user.id, `Factura con ID ${id} eliminada`]
        );

        res.json({ message: 'Factura eliminada correctamente', factura: result.rows[0] });

    } catch (error) {
        console.error('Error al eliminar factura:', error);
        res.status(500).json({ error: 'Error al eliminar factura' });
    }
};

// ---------------------- POR PARCELA ----------------------
const obtenerFacturasPorParcela = async (req, res) => {
    let numeroParcela = req.params.numero;

    if (!numeroParcela) return res.status(400).json({ error: 'Número de parcela no proporcionado' });
    if (!numeroParcela.startsWith('P')) numeroParcela = 'P' + numeroParcela.padStart(3, '0');

    try {
        const result = await query(`
            SELECT f.*, tf.nombre AS tipo_factura, u.nombre, u.apellido
            FROM facturas f
            JOIN TipoFactura tf ON f.tipo_id = tf.id
            JOIN usuarios u ON f.usuario_id = u.id
            JOIN usuarioParcela up ON u.id = up.usuario_id
            JOIN parcelas p ON up.parcela_id = p.id
            WHERE p.numero_parcela = $1
            ORDER BY f.fecha_emision DESC`,
            [numeroParcela]
        );

        res.json(result.rows);

    } catch (error) {
        console.error('Error al obtener facturas por parcela:', error);
        res.status(500).json({ error: 'Error al obtener facturas por parcela' });
    }
};

// ---------------------- DESCARGAR PDF ----------------------
const descargarFactura = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('SELECT * FROM facturas WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Factura no encontrada' });

        const factura = result.rows[0];

        if (req.user.rol !== 'admin' && factura.usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para esta factura' });
        }

        if (!factura.archivo_pdf) return res.status(404).json({ error: 'No hay PDF asociado' });

        const ruta = path.join(uploadDir, factura.archivo_pdf);
        res.download(ruta);

    } catch (error) {
        console.error('Error al descargar factura:', error);
        res.status(500).json({ error: 'Error al descargar la factura' });
    }
};

module.exports = {
    subirFactura,
    obtenerFacturasUsuario,
    obtenerTodasFacturas,
    descargarFactura,
    obtenerFacturasPorParcela,
    EliminarFactura
};
