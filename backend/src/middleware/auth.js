const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const bearer = req.headers['authorization'];

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(403).json({ success: false, message: 'Token requerido' });
    }

    const token = bearer.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

const requireRole = (roleName) => (req, res, next) => {
    if (req.user.rol !== roleName) {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    next();
};

module.exports = {
    verifyToken,
    requireRole
};
