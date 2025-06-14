const { query } = require('../config/db');
const jwt = require('jsonwebtoken');

/**
 * ObtenerHistorial:
 * Devuelve las acciones realizadas por el usuario autenticado,
 * filtradas por fecha. Si no se proporciona una fecha, se usa la fecha actual.
 */
const ObtenerHistorial = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Token inválido' });
      }

      const userId = user.id;
      const userRole = user.rol; // <- aquí verificamos el rol
      const fecha = req.query.fecha || new Date().toLocaleDateString('sv-SE'); // 'YYYY-MM-DD' formato


      let result;

      if (userRole === 'administrador') {
        // Mostrar historial completo de todos los usuarios
        result = await query(
          `SELECT h.usuario_id, u.nombre, u.apellido, h.accion, h.fecha, h.tabla_afectada, h.descripcion
           FROM historial h
           JOIN usuarios u ON h.usuario_id = u.id
           WHERE DATE(h.fecha) = $1
           ORDER BY h.fecha DESC`,
          [fecha]
        );
      } else {
        // Mostrar solo historial del usuario autenticado
        result = await query(
          `SELECT h.usuario_id, u.nombre, u.apellido, h.accion, h.fecha, h.tabla_afectada, h.descripcion
           FROM historial h
           JOIN usuarios u ON h.usuario_id = u.id
           WHERE h.usuario_id = $1 AND DATE(h.fecha) = $2
           ORDER BY h.fecha DESC`,
          [userId, fecha]
        );
      }

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


