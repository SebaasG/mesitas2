const { query } = require('../config/db');
const jwt = require('jsonwebtoken');

/**
 * ObtenerHistorial:
 * Devuelve las acciones realizadas por el usuario autenticado,
 * filtradas por fecha. Si no se proporciona una fecha, se usa la fecha actual.
 */
const ObtenerHistorial = async (req, res) => {
    try {
        // 1. Obtener el token del header Authorization (formato: "Bearer <token>")
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Token no proporcionado' });
        }

        // 2. Verificar el token usando JWT_SECRET
        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Token inválido' });
            }

            // 3. Extraer el ID del usuario autenticado desde el token
            const userId = user.id;

            // 4. Verificar si hay un parámetro de fecha en la query (formato YYYY-MM-DD)
            const fecha = req.query.fecha || new Date().toISOString().slice(0, 10); // toma la fecha actual si no se envía

            // 5. Ejecutar la consulta filtrando por usuario y por fecha
            const result = await query(
                `SELECT usuario_id, accion, fecha, tabla_afectada, descripcion
                 FROM historial
                 WHERE usuario_id = $1 AND DATE(fecha) = $2
                 ORDER BY fecha DESC`,
                [userId, fecha]
            );

            // 6. Responder con los datos obtenidos
            res.status(200).json({
                success: true,
                data: result.rows,
                filtro: fecha
            });
        });

    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial de acciones'
        });
    }
};

module.exports = {
    ObtenerHistorial
};
