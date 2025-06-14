// Importación de módulos base
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Cargar variables de entorno

// Importación de conexión DB y test de conexión
const { query, testConnection } = require('./config/db');

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const userRoutes = require('./routes/userRoutes');
const historialRouter = require('./routes/HistorialRouter');
const adminRoutes = require('./routes/BDrouter');

// Inicialización de la aplicación
const app = express();

// Middleware base
app.use(cors());
app.use(express.json());

// Variables de entorno
const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV || 'local';

// Ruta al frontend (ajustar según estructura real del proyecto)
const frontendPath = path.resolve(__dirname, '../../frontend');

// Crear carpeta de facturas si no existe
const uploadsDir = path.join(__dirname, '../uploads/facturas');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Probar conexión a la base de datos al iniciar
testConnection();

// Rutas API
app.use('/api/auth', authRoutes);           // Login
app.use('/api/usuarios', userRoutes);       // Registro y gestión de usuarios
app.use('/api/facturas', facturaRoutes);    // Facturas (subir, ver, eliminar, descargar)
app.use('/api/historial', historialRouter); // Ver historial
app.use('/api/extraer', adminRoutes);

// Ruta de prueba para validar conexión a la DB
app.get('/api/test-db', async (req, res) => {
  try {
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

// Archivos estáticos del frontend (solo si tienes assets)
app.use('/assets', express.static(path.join(frontendPath, 'assets')));

// Rutas específicas al frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'login.html'));
});

// Catch-all para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  const url = ENV === 'local' ? `http://localhost:${PORT}` : 'https://www.mesitas2.com';
  console.log(`✅ Servidor corriendo en: ${url}`);
});
