const { query } = require('../config/db');
const jwt = require('jsonwebtoken');

const ObtenerHistorial = async (req, res) => {
    try {
        // Si estás usando autenticación, puedes validar el token así:
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token no proporcionado' });
        }

        // Verificar token
        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Token inválido' });
            }

            // Consulta SQL
            const result = await query(
                `SELECT h.usuario_id, h.accion, h.fecha  
                    FROM historial h  
                    WHERE DATE(h.fecha) = CURRENT_DATE
                    ORDER BY h.fecha DESC;

                                            `
            );

            res.status(200).json(result.rows);
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ success: false, message: 'Error al obtener historial de facturas' });
    }
};

module.exports = {
    ObtenerHistorial
};
