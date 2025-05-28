const { query } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere correo y contraseña'
            });
        }

        const result = await query(
            'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN rol r ON u.rol_id = r.id WHERE u.correo = $1',
            [correo]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'El correo no está registrado'
            });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña es incorrecta'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                correo: user.correo,
                rol: user.rol_nombre
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        

        await query(
            'INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion) VALUES ($1, $2, $3, $4)',
            [user.id, 'LOGIN', 'usuarios', 'Inicio de sesión exitoso']
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                rol: user.rol_nombre
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};




module.exports = {
    login
};
