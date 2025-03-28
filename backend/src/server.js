const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Cargar variables de entorno

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV || 'local'; // Puede ser 'local' o 'production'

// Ruta absoluta del frontend
const frontendPath = path.resolve(__dirname, '../../frontend');

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
