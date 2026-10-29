const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Apunta directo a la carpeta 'public' donde están tus archivos HTML y multimedia
app.use(express.static(path.join(__dirname, 'public')));

let colaChatReal = [];

// ==========================================
// RUTAS PARA LAS DIFERENTES PLATAFORMAS
// ==========================================

// Ruta para Kick
app.get('/kick', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para TikTok
app.get('/tiktok', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tiktok.html'));
});


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
    console.log(`Servidor activo en puerto ${PORT}`);
});
