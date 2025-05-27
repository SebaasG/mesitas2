-- Tabla de roles
CREATE TABLE rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50),
    correo VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol_id INT REFERENCES rol(id),
    password TEXT NOT NULL
);

-- Tabla de parcelas
CREATE TABLE parcelas (
    id SERIAL PRIMARY KEY,
    numero_parcela VARCHAR(10) UNIQUE NOT NULL,
    ubicacion TEXT,
    estado VARCHAR(15) DEFAULT 'activo'
);

-- Tabla de relación usuario-parcela
CREATE TABLE usuarioParcela (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    parcela_id INT REFERENCES parcelas(id),
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(15) DEFAULT 'activo',
    UNIQUE (usuario_id, parcela_id)
);

-- Tabla de tipos de factura
CREATE TABLE TipoFactura (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL,
    descripcion TEXT
);

-- Tabla de facturas
CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    tipo_id INT REFERENCES TipoFactura(id),
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    archivo_pdf TEXT
);

-- Tabla de pagos
CREATE TABLE pagoUsuario (
    id SERIAL PRIMARY KEY,
    factura_id INT REFERENCES facturas(id),
    fecha_pago DATE NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(30),
    observaciones TEXT
);

-- Tabla de historial
CREATE TABLE historial (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    accion VARCHAR(50) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tabla_afectada VARCHAR(40),
    descripcion TEXT
);

-- Insertar roles básicos
INSERT INTO rol (nombre, descripcion) VALUES
('admin', 'Administrador del sistema'),
('usuario', 'Usuario regular del sistema');

-- Insertar tipos de factura básicos
INSERT INTO TipoFactura (nombre, descripcion) VALUES
('Mensual', 'Factura mensual de servicios'),
('Anual', 'Factura anual de servicios');

-- Insertar usuario administrador (password: admin123)
INSERT INTO usuarios (nombre, apellido, correo, telefono, direccion, rol_id, password) VALUES
('Admin', 'Sistema', 'admin@ejemplo.com', '1234567890', 'Dirección Admin', 1, '$2a$10$rQnM1.5qB5qB5qB5qB5qB.5qB5qB5qB5qB5qB5qB5qB5qB5qB5qB5qB');

-- Insertar usuario de prueba (password: user123)
INSERT INTO usuarios (nombre, apellido, correo, telefono, direccion, rol_id, password) VALUES
('Usuario', 'Prueba', 'usuario@ejemplo.com', '0987654321', 'Dirección Usuario', 2, '$2a$10$rQnM1.5qB5qB5qB5qB5qB.5qB5qB5qB5qB5qB5qB5qB5qB5qB5qB5qB'); 