const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Sirve tu carpeta web estática ('público')
app.use(express.static(path.join(__dirname, 'público')));

// Fila de espera en memoria para los usuarios que vienen del chat
let colaChatReal = [];

// 1. Endpoint que recibe los mensajes y eventos desde tu bot o herramienta de Kick (Webhook)
app.post('/webhook-kick', (req, res) => {
    const datos = req.body;
    
    // Aquí puedes filtrar si el mensaje es una solicitud de lectura, un comando o un regalo
    if (datos && datos.usuario) {
        let nuevoConsultante = {
            user: datos.usuario,
            nombre: datos.nombre || datos.usuario,
            pregunta: datos.pregunta || "¿Qué me depara el destino en el amor y los negocios?",
            veredicto: "¡SÍ!",
            sol: "Aries",
            luna: "Leo",
            ascendente: "Sagitario",
            frecuencia: "528 Hz",
            numPoderPersonal: "7",
            numPoderDia: "14",
            recomendacionExplicita: "Mantén la fe en tus proyectos y confía en tu intuición.",
            arcangel: "Arcángel Miguel",
            consejoArcangel: "Protege tu energía de las malas vibras.",
            cuandoInvocarsArcangel: "los domingos al amanecer",
            invocacionArcangel: "Invocálo con una vela azul.",
            serafin: "Serafín de la Luz",
            consejoSerafin: "Camina con pasos firmes hacia tu destino.",
            cuandoInvocarsSerafin: "al mediodía",
            paraQueInvocarsSerafin: "limpiar caminos",
            vela: "Vela Blanca o Azul",
            cuandoVela: "lunes por la noche",
            paraQueVela: "atraer claridad y paz",
            accionFuegoBano: "Baño de manzanilla y miel.",
            prohibicionEstricta: "No escuches consejos de gente envidiosa.",
            diagnosticoPositivo: "Las cartas se alinean a tu favor y el éxito está garantizado.",
            diagnosticoDenso: "Hay obstáculos temporales que superarás con paciencia.",
            libroSecretos: "El secreto del éxito es la constancia diaria.",
            afirmacion: "Yo soy un imán para la prosperidad.",
            consejo: "Recuerda, mi pana: el que persevera alcanza.",
            advertencia: "No descuides tus finanzas.",
            cartasAsignadas: datos.cartas || 2
        };

        colaChatReal.push(nuevoConsultante);
        console.log("¡Usuario añadido a la cola desde Kick:", datos.usuario);
    }

    res.status(200).json({ status: "ok" });
});

// 2. Endpoint que consulta tu página web HTML cada 10 segundos para jalar al siguiente en la cola
app.get('/obtener-siguiente-usuario', (req, res) => {
    if (colaChatReal.length > 0) {
        let siguiente = colaChatReal.shift(); // Saca al primero de la fila
        res.json(siguiente);
    } else {
        res.json(null); // Si no hay nadie, manda null y la página sigue con su rotación normal
    }
});

// Render asigna el puerto automáticamente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Don Juan Caramba activo en el puerto ${PORT}`);
});
