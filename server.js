import express from 'express';
import axios from 'axios';

// BLINDAJE TOTAL: Captura cualquier error o excepción para que el servidor NUNCA se caiga
process.on('uncaughtException', (err) => {
    console.error('[EXCEPCIÓN NO CONTROLADA]:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[PROMESA RECHAZADA NO CONTROLADA]:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || '';
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || 'auracraftai';

console.log(`[INICIO] Servidor web listo. Intentando conectar con @${TIKTOK_USERNAME}...`);

async function iniciarBotTikTok() {
    try {
        const { WebcastPushConnection } = await import('tiktok-live-connector');
        const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

        tiktokLiveConnection.connect().then(state => {
            console.info(`[CONECTADO] Conectado al Live de @${TIKTOK_USERNAME} (Room ID: ${state.roomId})`);
        }).catch(err => {
            console.warn('[AVISO] El live no está activo o no se pudo conectar en este momento:', err.message);
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
        console.error('[ERROR] Al cargar o iniciar el conector de TikTok:', e.message);
    }
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
    iniciarBotTikTok();
});
