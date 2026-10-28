const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Servir de forma automática toda la carpeta del proyecto (esto lee la raíz y carpetas como /english/)
app.use(express.static(path.join(__dirname)));

// Si entran a la raíz y no carga automático, redirige o busca el index principal
app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
        if (err) {
            // Si el index principal está en otra ruta, evitamos que se caiga el servidor
            next();
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor de Don Juan Caramba corriendo en el puerto ${PORT}`);
});
