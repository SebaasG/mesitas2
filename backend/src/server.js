const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carga variables de entorno

const app = express();

app.use(cors());
app.use(express.json());

// Variables de entorno
const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV || 'local'; // Puede ser 'local' o 'production'
const BASE_URL = ENV === 'production' ? 'https://www.mesitas2.com' : `http://localhost:${PORT}`;

// Rutas de prueba
app.get('/', (req, res) => {
    res.send(`Servidor corriendo en modo ${ENV}. URL: ${BASE_URL}`);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en: ${BASE_URL}`);
});
