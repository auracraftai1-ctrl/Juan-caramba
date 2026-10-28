const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Servir de forma automática todos los archivos estáticos de la raíz (imágenes, audios, etc.)
app.use(express.static(path.join(__dirname)));

// Ruta principal para servir tu archivo index.html original en español
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor de Don Juan Caramba activo en el puerto ${PORT}`);
});
