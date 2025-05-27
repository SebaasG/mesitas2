const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

async function createUsers() {
    try {
        // Crear roles
        await query(`
            INSERT INTO rol (nombre, descripcion) VALUES
            ('admin', 'Administrador del sistema'),
            ('usuario', 'Usuario regular del sistema')
            ON CONFLICT (nombre) DO NOTHING
        `);

        // Crear tipos de factura
        await query(`
            INSERT INTO TipoFactura (nombre, descripcion) VALUES
            ('Mensual', 'Factura mensual de servicios'),
            ('Anual', 'Factura anual de servicios')
            ON CONFLICT (nombre) DO NOTHING
        `);

        // Hash de contraseñas
        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);

        // Crear usuarios
        await query(`
            INSERT INTO usuarios (nombre, apellido, correo, telefono, direccion, rol_id, password) VALUES
            ('Admin', 'Sistema', 'admin@ejemplo.com', '1234567890', 'Dirección Admin', 1, $1),
            ('Usuario', 'Prueba', 'usuario@ejemplo.com', '0987654321', 'Dirección Usuario', 2, $2)
            ON CONFLICT (correo) DO NOTHING
        `, [adminPassword, userPassword]);

        console.log('✅ Usuarios creados exitosamente');
    } catch (error) {
        console.error('❌ Error al crear usuarios:', error);
    } finally {
        process.exit();
    }
}

createUsers(); 