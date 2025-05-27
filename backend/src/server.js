const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV || 'local';
const frontendPath = path.resolve(__dirname, '../../frontend');

// Sirve los archivos estáticos primero NO TOCAR
app.use('/assets', express.static(path.join(frontendPath, 'assets')));

// Rutas específicas para páginas NO TOCAR
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'pages', 'login.html'));
});

// ❗️3. Esta debe ir al final para no interceptar todo (y bloquear archivos estáticos) NO TOCAR
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    const url = ENV === 'local' ? `http://localhost:${PORT}` : 'https://www.mesitas2.com';
    console.log(`✅ Servidor corriendo en: ${url}`);
});
