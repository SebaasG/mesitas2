const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/**
 * registrarUsuario:
 * Crea un nuevo usuario en la base de datos con la contraseña encriptada.
 * Valida los campos obligatorios y evita inyecciones SQL usando parámetros.
 */
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, direccion, rol_id, password } = req.body;

    // Verifica campos obligatorios
    if (!nombre || !correo || !password || !rol_id) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Hashear la contraseña con 10 rondas de sal
    const passwordHasheada = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos
    const result = await query(
      `INSERT INTO usuarios 
        (nombre, apellido, correo, telefono, direccion, rol_id, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, nombre, apellido, correo, telefono, direccion, rol_id`,
      [nombre, apellido, correo, telefono, direccion, rol_id, passwordHasheada]
    );

    // Respuesta exitosa
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
