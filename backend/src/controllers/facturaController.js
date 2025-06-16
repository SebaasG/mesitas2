const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { query } = require('../config/db');


// Carpeta dentro del proyecto: /uploads/facturas
const storageDir = path.join(__dirname, '..', 'uploads', 'facturas');

// Configuración de multer para almacenar PDFs en la carpeta del proyecto
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storageDir);
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
// const subirFactura = async (req, res) => {
//     try {
//         // Datos del body
//         const { tipo_id, fecha_emision, fecha_vencimiento, total } = req.body;

//         // Usuario autenticado desde el token
//         const usuario_id = req.user.id;

//         // Ruta del archivo PDF
//         const archivo_pdf = req.file ? req.file.path : null;

//         // Validar campos obligatorios
//         if (!tipo_id || !fecha_emision || !fecha_vencimiento || !total || !archivo_pdf) {
//             return res.status(400).json({ error: 'Todos los campos son obligatorios' });
//         }

//         // Insertar en la base de datos
//         const result = await query(
//             `INSERT INTO facturas 
//             (usuario_id, tipo_id, fecha_emision, fecha_vencimiento, total, archivo_pdf) 
//             VALUES ($1, $2, $3, $4, $5, $6) 
//             RETURNING *`,
//             [usuario_id, tipo_id, fecha_emision, fecha_vencimiento, total, archivo_pdf]
//         );

//         // Registrar en historial
//         await query(
//             'INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion) VALUES ($1, $2, $3, $4)',
//             [usuario_id, 'CREAR', 'facturas', 'Nueva factura creada']
//         );

//         res.status(201).json(result.rows[0]);
//     } catch (error) {
//         console.error('Error al subir factura:', error);
//         res.status(500).json({ error: 'Error al procesar la factura' });
//     }
// };
const subirFactura = async (req, res) => {
    try {
        const { tipo_id, fecha_pago, total } = req.body;
        const usuario_id = req.user.id;

        // Guardar ruta relativa
        const archivo_pdf = req.file ? path.join('uploads', 'facturas', req.file.filename) : null;

        if (!tipo_id|| !total || !archivo_pdf || !fecha_pago) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const result = await query(
            `INSERT INTO facturas 
            (usuario_id, tipo_id, total, archivo_pdf,fecha_pago) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [usuario_id, tipo_id, total, archivo_pdf,fecha_pago]
        );

        await query(
            'INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion) VALUES ($1, $2, $3, $4)',
            [usuario_id, 'CREAR', 'facturas', 'Nueva factura creada']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al subir factura:', error);
        res.status(500).json({ error: 'Error al procesar la factura' });
    }
};


const AprobarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Validar estado permitido
        const estadosPermitidos = ['APROBADA', 'DESAPROBADA'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado no válido' });
        }

        // Verificar que el usuario sea administrador
        if (req.user.rol !== 'administrador') {
            return res.status(403).json({ error: 'No tienes permiso para cambiar el estado de facturas' });
        }

        // Buscar factura
        const facturaResult = await query('SELECT * FROM facturas WHERE id = $1', [id]);
        if (facturaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        // Actualizar estado
        const result = await query(
            'UPDATE facturas SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );

        // Registrar en historial
        await query(
            'INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion) VALUES ($1, $2, $3, $4)',
            [req.user.id, estado === 'APROBADA' ? 'APROBAR' : 'DESAPROBAR', 'facturas', `Factura con ID ${id} marcada como ${estado}`]
        );

        res.json({
            success: true,
            message: `Factura actualizada a "${estado}" correctamente`,
            factura: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar estado de factura:', error);
        res.status(500).json({ error: 'Error al cambiar el estado de la factura' });
    }
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
            
            ORDER BY f.fecha_pago DESC`,
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
            ORDER BY f.fecha_pago DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

const EliminarFactura = async (req, res) => {
    try {
        const { id } = req.params;

        const facturaResult = await query('SELECT * FROM facturas WHERE id = $1', [id]);
        if (facturaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        const factura = facturaResult.rows[0];

        if (factura.archivo_pdf) {
            const filePath = path.join(__dirname, '..', factura.archivo_pdf.replace(/\\/g, '/'));
            try {
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
                    console.log(`Archivo eliminado: ${filePath}`);
                } else {
                    console.warn(`Archivo no encontrado para eliminar: ${filePath}`);
                }
            } catch (err) {
                console.warn(`Error eliminando archivo: ${filePath}`, err.message);
            }
        }

        const result = await query('DELETE FROM facturas WHERE id = $1 RETURNING *', [id]);

        await query(
            'INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion) VALUES ($1, $2, $3, $4)',
            [req.user.id, 'ELIMINAR', 'facturas', `Factura con ID ${id} eliminada`]
        );

        res.json({ message: 'Factura eliminada correctamente', factura: result.rows[0] });

    } catch (error) {
        console.error('Error al eliminar factura:', error);
        res.status(500).json({ error: 'Error al eliminar factura' });
    }
};


const EliminarFacturaUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar la factura
        const facturaResult = await query('SELECT * FROM facturas WHERE id = $1', [id]);
        if (facturaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        const factura = facturaResult.rows[0];

        // 2. Verificar estado permitido
        if (factura.estado !== 'pendiente' && factura.estado !== 'DESAPROBADA') {
            return res.status(403).json({ error: 'Solo se pueden eliminar facturas pendientes o desaprobadas' });
        }

        // 3. Eliminar archivo si existe
        if (factura.archivo_pdf) {
            const filePath = path.join(__dirname, '..', factura.archivo_pdf.replace(/\\/g, '/'));
            try {
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
                    console.log(`Archivo eliminado: ${filePath}`);
                } else {
                    console.warn(`Archivo no encontrado para eliminar: ${filePath}`);
                }
            } catch (err) {
                console.warn(`Error eliminando archivo: ${filePath}`, err.message);
            }
        }

        // 4. Eliminar factura de la base de datos
        const result = await query('DELETE FROM facturas WHERE id = $1 RETURNING *', [id]);

        // 5. Guardar en historial
        await query(
            'INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion) VALUES ($1, $2, $3, $4)',
            [req.user.id, 'ELIMINAR', 'facturas', `Factura con ID ${id} eliminada`]
        );

        res.json({ message: 'Factura eliminada correctamente', factura: result.rows[0] });

    } catch (error) {
        console.error('Error al eliminar factura:', error);
        res.status(500).json({ error: 'Error al eliminar factura' });
    }
};

// Obtener facturas por número de parcela
const obtenerFacturasPorParcela = async (req, res) => {
    let numeroParcela = req.params.numero;

    if (!numeroParcela) {
        return res.status(400).json({ error: 'Número de parcela no proporcionado' });
    }

    // Asegurar formato tipo "P001", "P002", etc.
    if (!numeroParcela.startsWith('P')) {
        numeroParcela = 'P' + numeroParcela.padStart(3, '0');
    }

    try {
        const result = await query(
            `SELECT f.*, tf.nombre AS tipo_factura, u.nombre, u.apellido
             FROM facturas f
             JOIN TipoFactura tf ON f.tipo_id = tf.id
             JOIN usuarios u ON f.usuario_id = u.id
             JOIN usuarioParcela up ON u.id = up.usuario_id
             JOIN parcelas p ON up.parcela_id = p.id
             WHERE p.numero_parcela = $1
             ORDER BY f.fecha_pago DESC`,
            [numeroParcela]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener facturas por parcela:', error);
        res.status(500).json({ error: 'Error al obtener facturas por parcela' });
    }
};


// Descargar PDF de factura
const descargarFactura = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('SELECT * FROM facturas WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }

        const factura = result.rows[0];

        if (req.user.rol !== 'administrador' && factura.usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para acceder a esta factura' });
        }

        if (!factura.archivo_pdf) {
            return res.status(404).json({ error: 'No hay archivo asociado a la factura' });
        }


        const relativePath = factura.archivo_pdf.replace(/\\/g, '/');
        console.log('Ruta relativa del archivo:', relativePath);
        const filePath = path.join(__dirname, '..', '..', relativePath);
        const filename = path.basename(filePath); // obtiene 'factura-123456789.png' o .pdf, etc.

        await fs.access(filePath); // lanza error si no existe

        // Descargar usando el nombre exacto del archivo
        res.download(filePath, filename);
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
    EliminarFactura,
    AprobarFactura,
    EliminarFacturaUsuario
}; 