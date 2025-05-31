const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No se proporcionó token de autenticación'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

const requireRole = (roleName) => (req, res, next) => {
    if (req.user.rol !== roleName) {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    next();
};

module.exports = {
    verificarToken,
    isAdmin
}; 