const jwt = require('jsonwebtoken');

// Clave secreta para verificar el token JWT.
// Usa una variable de entorno segura en producción.
const SECRET_KEY = process.env.JWT_SECRET || 'mesitas2025';

/**
 * Middleware para proteger rutas usando JWT.
 * Verifica el token enviado en el header "Authorization".
 */
const authMiddleware = (req, res, next) => {
    // Leer el header Authorization
    const authHeader = req.headers.authorization;

    // Verificar que el header tenga formato: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado o mal formado' });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, SECRET_KEY);

        // Guardar los datos del usuario en el request
        req.user = decoded;

        // Pasar al siguiente middleware o controlador
        next();
    } catch (error) {
        console.error('Token inválido:', error.message);
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = authMiddleware;
