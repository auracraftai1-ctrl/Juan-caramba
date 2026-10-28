const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Servir todos los archivos estáticos de la raíz (imágenes, audios, css, js)
app.use(express.static(path.join(__dirname)));

// Ruta principal en Español
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta secundaria en Inglés
app.get('/english', (req, res) => {
    res.sendFile(path.join(__dirname, 'english', 'index.html'));
});

app.get('/english/', (req, res) => {
    res.sendFile(path.join(__dirname, 'english', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor de Don Juan Caramba activo en el puerto ${PORT}`);
});
