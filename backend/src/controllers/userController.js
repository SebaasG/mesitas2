const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, direccion, rol_id, password } = req.body;

    if (!nombre || !correo || !password || !rol_id) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Hashear contraseña
    const passwordHasheada = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO usuarios 
       (nombre, apellido, correo, telefono, direccion, rol_id, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre, apellido, correo, telefono, direccion, rol_id`,
      [nombre, apellido, correo, telefono, direccion, rol_id, passwordHasheada]
    );

    res.status(201).json({ message: 'Usuario registrado', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  registrarUsuario,
};
