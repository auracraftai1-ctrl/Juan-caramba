const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

// Servir tu página web HTML y archivos de la carpeta "público"
app.use(express.static(path.join(__dirname, 'público')));

// Cola de consultantes reales que llegan desde el chat
let colaConsultantesReales = [];

// 1. ENDPOINT PARA RECIBIR EL CHAT / WEBHOOK DESDE KICK O BOTRIX
app.post('/webhook-kick', (req, res) => {
    const usuario = req.body.user || req.body.username || req.body.usuario || "Espectador_Kick";
    const mensaje = req.body.message || req.body.text || req.body.pregunta || "¿Qué me depara el destino?";

    const nuevoConsultante = {
        user: usuario,
        nombre: usuario,
        fecha: "15/06/1992",
        lugar: "Caracas, Venezuela",
        veredicto: "¡SÍ!",
        pregunta: mensaje,
        sol: "Escorpio",
        luna: "Piscis",
        ascendente: "Leo",
        frecuencia: "528 Hz",
        numPoderPersonal: "7",
        numPoderDia: "21",
        recomendacionExplicita: "Mantén tu energía enfocada y no mires atrás.",
        arcangel: "Arcángel Miguel",
        consejoArcangel: "Protege tu espacio astral con fe inquebrantable.",
        invocacionArcangel: "Invocálo los lunes al anochecer.",
        cuandoInvocarsArcangel: "lunes al anochecer",
        serafin: "Serafín del Fuego Sagrado",
        consejoSerafin: "Purifica tus intenciones.",
        cuandoInvocarsSerafin: "al iniciar la noche",
        paraQueInvocarsSerafin: "limpiar caminos y abrir puertas",
        vela: "Vela Azul o Blanca",
        cuandoVela: "lunes por la noche",
        paraQueVela: "atraer protección",
        accionFuegoBano: "Baño de descarga con ruda y sal marina.",
        prohibicionEstricta: "Prohibido dudar de tu propia intuición.",
        diagnosticoPositivo: "Las cartas se alinean a tu favor para abrirte caminos de éxito rotundo.",
        diagnosticoDenso: "Hay energías densas bloqueando tu camino; la precaución es tu mejor escudo.",
        libroSecretos: "La verdadera sabiduría reside en escuchar el silencio del corazón.",
        afirmacion: "Yo soy dueño de mi destino y atraigo el bienestar.",
        consejo: "Mi estimado, recuerda que el que persevera alcanza.",
        advertencia: "Camina con pasos firmes.",
        cartasAsignadas: 2
    };

    colaConsultantesReales.push(nuevoConsultante);
    console.log(`[ORÁCULO] Nueva consulta encolada de @${usuario}: "${mensaje}"`);

    res.status(200).json({ status: "¡Consulta recibida con éxito en el oráculo!" });
});

// 2. ENDPOINT PARA QUE TU PÁGINA WEB CONSULTE EL SIGUIENTE EN LA FILA
app.get('/obtener-siguiente-usuario', (req, res) => {
    if (colaConsultantesReales.length > 0) {
        const siguiente = colaConsultantesReales.shift();
        res.json(siguiente);
    } else {
        res.json(null);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor puente corriendo en el puerto ${PORT}`);
});
