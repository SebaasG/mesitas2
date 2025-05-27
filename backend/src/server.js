const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Cargar variables de entorno

const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const facturaRoutes = require('./routes/facturaRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV || 'local'; // Puede ser 'local' o 'production'

// Ruta absoluta del frontend
const frontendPath = path.resolve(__dirname, '../../frontend');

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads/facturas');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Probar conexión a la base de datos
testConnection();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/facturas', facturaRoutes);

// Ruta de prueba para verificar la conexión
app.get('/api/test-db', async (req, res) => {
    try {
        const { query } = require('./config/db');
        const result = await query('SELECT NOW()');
        res.json({ 
            message: 'Conexión exitosa a la base de datos',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al conectar con la base de datos',
            details: error.message
        });
    }
});

// 🔹 Si está en producción, servimos el frontend desde Express
if (ENV === 'production') {
    app.use(express.static(frontendPath));
} else {
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}

// Iniciar servidor
app.listen(PORT, () => {
    const url = ENV === 'local' ? `http://localhost:${PORT}` : 'https://www.mesitas2.com';
    console.log(`✅ Servidor corriendo en: ${url}`);
});
