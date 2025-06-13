const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, direccion, rol_id, password } = req.body;

    if (!nombre || !correo || !password || !rol_id) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ message: 'Correo inválido' });
    }

    if (password.length < 6 || password.length > 50) {
      return res.status(400).json({ message: 'La contraseña debe tener entre 6 y 50 caracteres' });
    }

    const telefonoRegex = /^\d{7,15}$/;
    if (telefono && !telefonoRegex.test(telefono)) {
      return res.status(400).json({ message: 'Teléfono inválido' });
    }

    const nombreRegex = /^[a-zA-ZÀ-ÿ\s]{2,50}$/;
    if (!nombreRegex.test(nombre)) {
      return res.status(400).json({ message: 'Nombre inválido' });
    }

    if (apellido && !nombreRegex.test(apellido)) {
      return res.status(400).json({ message: 'Apellido inválido' });
    }

    const direccionRegex = /^[\w\s\#\-\.\,]{0,100}$/;
    if (direccion && !direccionRegex.test(direccion)) {
      return res.status(400).json({ message: 'Dirección inválida' });
    }

    const passwordHasheada = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO usuarios 
        (nombre, apellido, correo, telefono, direccion, rol_id, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, nombre, apellido, correo, telefono, direccion, rol_id`,
      [nombre, apellido, correo, telefono, direccion, rol_id, passwordHasheada]
    );

    res.status(201).json({
      message: 'Usuario registrado',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  registrarUsuario,
};
