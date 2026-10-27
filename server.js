const { WebcastPushConnection } = require('tiktok-live-connector');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || '';
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || 'auracraftai';

console.log(`[INICIO] Intentando conectar con el usuario de TikTok: @${TIKTOK_USERNAME}`);

try {
    const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

    tiktokLiveConnection.connect().then(state => {
        console.info(`[CONECTADO] Conectado al Live de @${TIKTOK_USERNAME} (Room ID: ${state.roomId})`);
    }).catch(err => {
        console.warn('[AVISO] El live no está activo en este momento o falló la conexión:', err.message);
    });

    tiktokLiveConnection.on('chat', data => {
        console.log(`[CHAT] ${data.uniqueId}: ${data.comment}`);
        enviarAlWebhook({
            tipo: 'chat',
            username: data.uniqueId,
            avatar: data.profilePictureUrl || '',
            mensaje: data.comment,
            interaction_level: 'gratis',
            gifts_pending: 0
        });
    });

    tiktokLiveConnection.on('gift', data => {
        if (data.giftType === 1 && !data.repeatEnd) return;

        const giftName = data.giftName ? data.giftName.toLowerCase() : '';
        const repeatCount = data.repeatCount || 1;
        let nivelInteraccion = 'gratis';
        let prioridadPeso = 0;

        if (giftName.includes('león') || giftName.includes('lion')) {
            nivelInteraccion = 'leon';
            prioridadPeso = 100;
        } else if (giftName.includes('gafas') || giftName.includes('sunglasses')) {
            nivelInteraccion = 'gafas';
            prioridadPeso = 50;
        } else if (giftName.includes('rosa') || giftName.includes('rose')) {
            nivelInteraccion = 'rosa';
            prioridadPeso = 10;
        }

        console.log(`[REGALO] ${data.uniqueId} envió ${repeatCount}x ${data.giftName} (Nivel: ${nivelInteraccion})`);

        enviarAlWebhook({
            tipo: 'regalo',
            username: data.uniqueId,
            avatar: data.profilePictureUrl || '',
            gift_name: data.giftName,
            gift_count: repeatCount,
            interaction_level: nivelInteraccion,
            priority: prioridadPeso
        });
    });
} catch (e) {
    console.error('[ERROR CRITICO] Error al inicializar el conector de TikTok:', e.message);
}

async function enviarAlWebhook(payload) {
    if (!MAKE_WEBHOOK_URL) return;
    try {
        await axios.post(MAKE_WEBHOOK_URL, payload);
        console.log('[MAKE] Datos enviados exitosamente al webhook.');
    } catch (error) {
        console.error('[ERROR MAKE] Falló el envío al webhook:', error.message);
    }
}

app.get('/', (req, res) => {
    res.send('El conector de Juan Caramba Tarot AI está activo 24/7 en la nube.');
});

app.listen(PORT, () => {
    console.log(`[SERVIDOR] Escuchando firmemente en el puerto ${PORT}`);
});
