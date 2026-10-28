const express = require('express');
const path = require('path');
const app = express();

// Puerto que asigna Render automáticamente o el puerto 3000 por defecto
const PORT = process.env.PORT || 3000;

// Configurar la carpeta raíz para servir archivos estáticos (index.html, imágenes y la carpeta /en/)
app.use(express.static(path.join(__dirname)));

// Ruta de respaldo por si entran a la raíz principal
app.get('/', (req, res) => {
    sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor de Don Juan Caramba corriendo en el puerto ${PORT}`);
});
