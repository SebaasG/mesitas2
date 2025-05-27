const queries = {
    // Consultas de usuarios
    usuarios: {
        crear: `
            INSERT INTO usuarios (nombre, apellido, correo, telefono, direccion, rol_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `,
        obtenerPorId: `
            SELECT u.*, r.nombre as rol_nombre
            FROM usuarios u
            JOIN rol r ON u.rol_id = r.id
            WHERE u.id = $1
        `,
        obtenerPorCorreo: `
            SELECT u.*, r.nombre as rol_nombre
            FROM usuarios u
            JOIN rol r ON u.rol_id = r.id
            WHERE u.correo = $1
        `,
        actualizar: `
            UPDATE usuarios
            SET nombre = $1, apellido = $2, telefono = $3, direccion = $4, rol_id = $5
            WHERE id = $6
            RETURNING *
        `,
        listar: `
            SELECT u.*, r.nombre as rol_nombre
            FROM usuarios u
            JOIN rol r ON u.rol_id = r.id
            ORDER BY u.fecha_registro DESC
        `
    },

    // Consultas de parcelas
    parcelas: {
        crear: `
            INSERT INTO parcelas (numero_parcela, ubicacion, estado)
            VALUES ($1, $2, $3)
            RETURNING *
        `,
        obtenerPorId: `
            SELECT * FROM parcelas WHERE id = $1
        `,
        actualizar: `
            UPDATE parcelas
            SET ubicacion = $1, estado = $2
            WHERE id = $3
            RETURNING *
        `,
        listar: `
            SELECT * FROM parcelas ORDER BY numero_parcela
        `
    },

    // Consultas de asignación de parcelas
    usuarioParcela: {
        asignar: `
            INSERT INTO usuarioParcela (usuario_id, parcela_id, estado)
            VALUES ($1, $2, $3)
            RETURNING *
        `,
        obtenerParcelasUsuario: `
            SELECT p.*, up.fecha_asignacion, up.estado as estado_asignacion
            FROM parcelas p
            JOIN usuarioParcela up ON p.id = up.parcela_id
            WHERE up.usuario_id = $1
        `,
        actualizarEstado: `
            UPDATE usuarioParcela
            SET estado = $1
            WHERE usuario_id = $2 AND parcela_id = $3
            RETURNING *
        `
    },

    // Consultas de facturas
    facturas: {
        crear: `
            INSERT INTO facturas (usuario_id, tipo_id, fecha_emision, fecha_vencimiento, total, estado)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `,
        obtenerPorId: `
            SELECT f.*, u.nombre as usuario_nombre, tf.nombre as tipo_factura
            FROM facturas f
            JOIN usuarios u ON f.usuario_id = u.id
            JOIN TipoFactura tf ON f.tipo_id = tf.id
            WHERE f.id = $1
        `,
        listarPorUsuario: `
            SELECT f.*, tf.nombre as tipo_factura
            FROM facturas f
            JOIN TipoFactura tf ON f.tipo_id = tf.id
            WHERE f.usuario_id = $1
            ORDER BY f.fecha_emision DESC
        `,
        actualizarEstado: `
            UPDATE facturas
            SET estado = $1
            WHERE id = $2
            RETURNING *
        `
    },

    // Consultas de pagos
    pagos: {
        registrar: `
            INSERT INTO pagoUsuario (factura_id, fecha_pago, monto, metodo_pago, observaciones)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `,
        obtenerPorFactura: `
            SELECT * FROM pagoUsuario WHERE factura_id = $1 ORDER BY fecha_pago DESC
        `
    },

    // Consultas de historial
    historial: {
        registrar: `
            INSERT INTO historial (usuario_id, accion, tabla_afectada, descripcion)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,
        obtenerPorUsuario: `
            SELECT * FROM historial WHERE usuario_id = $1 ORDER BY fecha DESC
        `
    }
};

module.exports = queries; 