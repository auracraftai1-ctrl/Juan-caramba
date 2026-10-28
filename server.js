const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Habilitar la carpeta actual para assets (imágenes, audios, etc.)
app.use(express.static(__dirname));

// Ruta principal en español
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta en inglés
app.get('/english', (req, res) => {
    res.sendFile(path.join(__dirname, 'english', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
