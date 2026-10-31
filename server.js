const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const TIKTOK_USER = (process.env.TIKTOK_USER || 'auracraftai3').replace('@', '');
const SIGN_API_KEY = process.env.TIKTOK_SIGN_API_KEY || undefined;

const MAX_COLA = 15;                    // máximo de personas esperando
const COOLDOWN_MS = 5 * 60 * 1000;      // 1 lectura gratis por usuario cada 5 min
const PALABRAS_BLOQUEADAS = ['puta', 'puto', 'mierda', 'marico', 'maricon', 'pendejo', 'verga', 'nazi', 'suicid', 'matarme'];

let colaChatReal = [];
const ultimoPorUsuario = new Map();
const ultimaPregunta = new Map();

// ---------- utilidades ----------
function limpiarUsuario(u) {
    return String(u || '').replace(/[^\w.]/g, '').slice(0, 30);
}
function limpiarNombre(n, respaldo) {
    const limpio = String(n || '').replace(/[^\p{L}\p{N} ]/gu, '').trim().slice(0, 25);
    return limpio || respaldo;
}
function mensajeValido(m) {
    if (m.length < 8 || m.length > 120) return false;
    if (/https?:|www\.|\.com|\.app|@/i.test(m)) return false;
    const minus = m.toLowerCase();
    if (PALABRAS_BLOQUEADAS.some(p => minus.includes(p))) return false;
    return true;
}

function armarConsultante({ usuario, nombre, pregunta, cartas, regaloNombre, regaloIcono }) {
    const si = Math.random() < 0.6;
    return {
        user: usuario,
        nombre,
        genero: Math.random() < 0.5 ? 'f' : 'm',
        pregunta,
        veredicto: si ? '¡SÍ!' : '¡NO!',
        sol: 'Aries', luna: 'Leo', ascendente: 'Sagitario',
        frecuencia: '528 Hz', numPoderPersonal: '7', numPoderDia: '14',
        recomendacionExplicita: 'Confía en tu intuición y toma decisiones con calma.',
        arcangel: 'Arcángel Miguel', consejoArcangel: 'Protege tu energía.',
        cuandoInvocarsArcangel: 'domingos al amanecer', invocacionArcangel: 'Con una vela azul.',
        serafin: 'Serafín de la Luz', consejoSerafin: 'Camina con firmeza.',
        cuandoInvocarsSerafin: 'al mediodía', paraQueInvocarsSerafin: 'limpiar caminos',
        vela: 'Vela Blanca', cuandoVela: 'lunes', paraQueVela: 'traer paz',
        accionFuegoBano: 'Baño de manzanilla.', prohibicionEstricta: 'No te dejes llevar por la envidia ajena.',
        diagnosticoPositivo: 'Tus cartas muestran buenas señales y apertura, siempre que actúes con prudencia.',
        diagnosticoDenso: 'Las cartas piden cautela: revisa bien antes de decidir.',
        libroSecretos: 'La constancia abre los caminos.',
        afirmacion: 'Yo atraigo cosas buenas con paciencia y trabajo.',
        consejo: 'El que persevera alcanza.',
        advertencia: 'Cuida tus decisiones importantes.',
        cartasAsignadas: cartas,
        regaloNombre: regaloNombre || null,
        regaloIcono: regaloIcono || null,
        esReal: true
    };
}

// ---------- eventos de TikTok ----------
function manejarChat(data) {
    const usuario = limpiarUsuario(data.user?.uniqueId || data.uniqueId);
    const mensaje = String(data.comment || '').trim();
    if (!usuario || !mensaje) return;
    console.log(`[TikTok Chat] @${usuario}: ${mensaje}`);

    if (mensajeValido(mensaje)) ultimaPregunta.set(usuario, mensaje);
    else return;

    const ahora = Date.now();
    if (ahora - (ultimoPorUsuario.get(usuario) || 0) < COOLDOWN_MS) return;
    if (colaChatReal.length >= MAX_COLA) return;

    ultimoPorUsuario.set(usuario, ahora);
    colaChatReal.push(armarConsultante({
        usuario,
        nombre: limpiarNombre(data.user?.nickname || data.nickname, usuario),
        pregunta: mensaje,
        cartas: 2
    }));
}

function manejarRegalo(data) {
    console.log('[TikTok Regalo crudo]', JSON.stringify(data).slice(0, 400));
    const usuario = limpiarUsuario(data.user?.uniqueId || data.uniqueId);
    if (!usuario) return;

    const esRacha = (data.giftType ?? data.giftDetails?.giftType) === 1;
    if (esRacha && !data.repeatEnd) return; // cuenta la racha una sola vez

    const monedas = (data.diamondCount ?? data.giftDetails?.diamondCount ?? 0) * (data.repeatCount || 1);
    const nombreRegalo = data.giftName || data.giftDetails?.giftName || 'un regalo';

    // Ajusta estos umbrales a tu tabla de regalos
    let cartas = 3, icono = '👓';
    if (monedas >= 10000) { cartas = 10; icono = '👑'; }
    else if (monedas >= 100) { cartas = 4; icono = '🦁'; }

    colaChatReal.unshift(armarConsultante({
        usuario,
        nombre: limpiarNombre(data.user?.nickname || data.nickname, usuario),
        pregunta: ultimaPregunta.get(usuario) || '¿Qué me depara el destino?',
        cartas,
        regaloNombre: nombreRegalo,
        regaloIcono: icono
    }));
    if (colaChatReal.length > MAX_COLA + 5) colaChatReal.pop();
}

// ---------- conexión con reintentos ----------
async function iniciarTikTok() {
    let lib;
    try {
        lib = await import('tiktok-live-connector'); // funciona con v1 y v2
    } catch (e) {
        console.error('[TikTok] No se pudo cargar tiktok-live-connector:', e.message);
        return;
    }
    const Conexion = lib.TikTokLiveConnection || lib.WebcastPushConnection;
    if (!Conexion) {
        console.error('[TikTok] La librería no trae una clase de conexión conocida.');
        return;
    }
    const Ev = lib.WebcastEvent || {};
    const Ctl = lib.ControlEvent || {};
    const opciones = { processInitialData: false, enableExtendedGiftInfo: true };
    if (SIGN_API_KEY) opciones.signApiKey = SIGN_API_KEY;

    let reintento = null;
    const reintentar = () => {
        if (reintento) return;
        reintento = setTimeout(() => { reintento = null; intentar(); }, 30000);
    };

    function intentar() {
        const conn = new Conexion(TIKTOK_USER, opciones);
        conn.on(Ev.CHAT || 'chat', manejarChat);
        conn.on(Ev.GIFT || 'gift', manejarRegalo);
        conn.on(Ctl.DISCONNECTED || 'disconnected', () => {
            console.log('[TikTok] Desconectado, reintentando en 30 s...');
            reintentar();
        });
        conn.on(Ctl.ERROR || 'error', err => console.error('[TikTok] Error:', err?.message || err));

        conn.connect()
            .then(state => console.log(`[TikTok] Conectado a @${TIKTOK_USER}, sala ${state.roomId || state.roomInfo?.room_id}`))
            .catch(err => {
                console.error('[TikTok] No se pudo conectar (¿ya estás en vivo?):', err?.message || err);
                reintentar();
            });
    }
    intentar();
}
iniciarTikTok();

// ---------- rutas ----------
app.get('/kick', (req, res) => res.sendFile(path.join(__dirname, 'public', 'kick.html')));
app.get('/tiktok', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tiktok.html')));

app.post('/webhook-kick', (req, res) => {
    const d = req.body;
    if (d && d.usuario && colaChatReal.length < MAX_COLA) {
        const usuario = limpiarUsuario(d.usuario);
        const pregunta = String(d.pregunta || '¿Qué me depara el destino?');
        if (usuario && mensajeValido(pregunta)) {
            colaChatReal.push(armarConsultante({
                usuario,
                nombre: limpiarNombre(d.nombre, usuario),
                pregunta,
                cartas: Math.min(parseInt(d.cartas) || 2, 10)
            }));
        }
    }
    res.status(200).json({ status: 'ok' });
});

app.get('/obtener-siguiente-usuario', (req, res) => {
    res.json(colaChatReal.length ? colaChatReal.shift() : null);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT} para @${TIKTOK_USER}`));
