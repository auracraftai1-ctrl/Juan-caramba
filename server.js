const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos (donde tienes tu imagen y diseño)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Juan Caramba corriendo en el puerto ${PORT}`);
});
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// BLINDAJE TOTAL: Captura cualquier error o excepción
process.on('uncaughtException', (err) => {
    console.error('[EXCEPCIÓN NO CONTROLADA]:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[PROMESA RECHAZADA NO CONTROLADA]:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar carpeta estática public
app.use(express.static(path.join(__dirname, 'public')));

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || '';
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || 'auracraftai';

console.log(`[INICIO] Servidor web listo para @${TIKTOK_USERNAME}`);

async function enviarAlWebhook(payload) {
    if (!MAKE_WEBHOOK_URL) return;
    try {
        await axios.post(MAKE_WEBHOOK_URL, payload);
        console.log('[MAKE] Datos enviados exitosamente al webhook.');
    } catch (error) {
        console.error('[ERROR MAKE] Falló el envío al webhook:', error.message);
    }
}

// Ruta principal para servir el overlay visual de Juan Caramba
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'overlay.html'));
});

app.listen(PORT, () => {
    console.log(`[SERVIDOR] Escuchando firmemente en el puerto ${PORT}`);
});
