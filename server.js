const express = require('express');
const cors = require('cors');
const path = require('path');
const WebcastChat = require('tiktok-live-connector');

const app = express();
app.use(express.json());
app.use(cors());

// Apunta directo a la carpeta 'public' donde están tus archivos HTML y multimedia
app.use(express.static(path.join(__dirname, 'public')));

let colaChatReal = [];

// ==========================================
// RUTAS PARA LAS DIFERENTES PLATAFORMAS
// ==========================================

// Ruta para Kick (Apunta a kick.html)
app.get('/kick', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'kick.html'));
});

// Ruta para TikTok (Apunta a tiktok.html)
app.get('/tiktok', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tiktok.html'));
});


// ==========================================
// CONEXIÓN DIRECTA AL CHAT DE TIKTOK LIVE
// ==========================================
try {
    const tiktokUsername = "@auracraftai3"; 
    const tiktokTv = new WebcastChat(tiktokUsername);

    tiktokTv.connect().then(state => {
        console.log(`[TikTok] Conectado a la sala ID de @auracraftai3: ${state.roomInfo.room_id}`);
    }).catch(err => {
        console.error('[TikTok] Error al conectar con el chat en vivo:', err.message);
    });

    // Cuando alguien escribe un comentario en tu directo de TikTok
    tiktokTv.on('chat', data => {
        let usuario = data.uniqueId;
        let mensaje = data.comment;

        console.log(`[TikTok Chat] @${usuario}: ${mensaje}`);

        let nuevoConsultanteReal = {
            user: usuario,
            nombre: data.nickname || usuario,
            pregunta: mensaje,
            veredicto: "¡SÍ!",
            sol: "Aries", luna: "Leo", ascendente: "Sagitario",
            frecuencia: "528 Hz", numPoderPersonal: "7", numPoderDia: "14",
            recomendacionExplicita: "Confía en tu intuición y mantén la fe.",
            arcangel: "Arcángel Miguel", consejoArcangel: "Protege tu energía.",
            cuandoInvocarsArcangel: "domingos al amanecer", invocacionArcangel: "Con vela azul.",
            serafin: "Serafín de la Luz", consejoSerafin: "Camina firme.",
            cuandoInvocarsSerafin: "al mediodía", paraQueInvocarsSerafin: "limpiar caminos",
            vela: "Vela Blanca", cuandoVela: "lunes", paraQueVela: "paz",
            accionFuegoBano: "Baño de manzanilla.", prohibicionEstricta: "No oigas envidias.",
            diagnosticoPositivo: "El éxito está garantizado.", diagnosticoDenso: "Superarás los obstáculos.",
            libroSecretos: "La constancia es la clave.", afirmacion: "Soy un imán de prosperidad.",
            consejo: "El que persevera alcanza.", advertencia: "Cuidado con las finanzas.",
            cartasAsignadas: 2 // Cartas por defecto para comentarios del chat
        };

        colaChatReal.push(nuevoConsultanteReal);
    });
} catch (e) {
    console.log("[TikTok] Error al inicializar el conector:", e.message);
}


// ==========================================
// WEBHOOK Y COLA DE CONSULTANTES
// ==========================================

app.post('/webhook-kick', (req, res) => {
    const datos = req.body;
    if (datos && datos.usuario) {
        let nuevoConsultante = {
            user: datos.usuario,
            nombre: datos.nombre || datos.usuario,
            pregunta: datos.pregunta || "¿Qué me depara el destino?",
            veredicto: "¡SÍ!",
            sol: "Aries", luna: "Leo", ascendente: "Sagitario",
            frecuencia: "528 Hz", numPoderPersonal: "7", numPoderDia: "14",
            recomendacionExplicita: "Confía en tu intuición y mantén la fe.",
            arcangel: "Arcángel Miguel", consejoArcangel: "Protege tu energía.",
            cuandoInvocarsArcangel: "domingos al amanecer", invocacionArcangel: "Con vela azul.",
            serafin: "Serafín de la Luz", consejoSerafin: "Camina firme.",
            cuandoInvocarsSerafin: "al mediodía", paraQueInvocarsSerafin: "limpiar caminos",
            vela: "Vela Blanca", cuandoVela: "lunes", paraQueVela: "paz",
            accionFuegoBano: "Baño de manzanilla.", prohibicionEstricta: "No oigas envidias.",
            diagnosticoPositivo: "El éxito está garantizado.", diagnosticoDenso: "Superarás los obstáculos.",
            libroSecretos: "La constancia es la clave.", afirmacion: "Soy un imán de prosperidad.",
            consejo: "El que persevera alcanza.", advertencia: "Cuidado con las finanzas.",
            cartasAsignadas: datos.cartas || 2
        };
        colaChatReal.push(nuevoConsultante);
    }
    res.status(200).json({ status: "ok" });
});

app.get('/obtener-siguiente-usuario', (req, res) => {
    if (colaChatReal.length > 0) {
        res.json(colaChatReal.shift());
    } else {
        res.json(null);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT} para @auracraftai3`);
});
