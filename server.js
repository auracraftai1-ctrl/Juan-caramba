const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Permite servir todos los archivos y carpetas estáticas (incluyendo /en/)
app.use(express.static(path.join(__dirname)));

// Ruta principal para el español
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor de Don Juan Caramba corriendo en el puerto ${PORT}`);
});
