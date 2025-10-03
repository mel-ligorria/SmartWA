// Archivo: server-contable.js

const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = 3000; 

// Configuración de Middlewares
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// ---------------------------------------------
// DEFINICIONES DE LINKS CONTABLES (URLs ESTABLES Y CON ETIQUETA ARCA)
// ---------------------------------------------

// Links para los casos complejos
const URL_FACTURA = "https://auth.afip.gob.ar/contribuyente_/login.xhtml?&modulo=FEC"; 
const URL_MONOTRIBUTO = "https://www.afip.gob.ar/monotributo/"; 
const URL_COMPROBANTES = "https://www.afip.gob.ar/facturacion/"; 

// Formato HTML para los links (Etiquetas visibles con ARCA)
const ARCA_FACTURA_HTML = `<a href="${URL_FACTURA}" target="_blank">[link oficial ARCA]</a>`;
const ARCA_MONOTRIBUTO_HTML = `<a href="${URL_MONOTRIBUTO}" target="_blank">[Guía oficial de ARCA Monotributo]</a>`;
const ARCA_MIS_COMPROBANTES_HTML = `<a href="${URL_COMPROBANTES}" target="_blank">[Enlace Mis Comprobantes ARCA]</a>`;

// ---------------------------------------------
// TRIGGERS SIMPLES
// ---------------------------------------------

const TRIGGERS_SIMPLES = {
    "promociones": "¡Tenemos 2 meses sin cargo de honorarios para nuevos Monotributistas! Promoción válida hasta fin de mes.",
    "horarios": "Nuestro horario de atención telefónica es de Lunes a Viernes de 9:00 a 17:00 hs. Podés solicitar una cita presencial fuera de ese horario.",
    "gracias": "¡De nada! ¡Estoy aquí para resolver tus dudas contables!"
};

// ---------------------------------------------
// Lógica de Detección de Casos Contables Complejos (✅ TODO REEMPLAZADO POR ARCA ✅)
// ---------------------------------------------

function checkCasosContables(message) {
    const lowerCaseMessage = message.toLowerCase();
    
    // CASO 1: Factura B
    if (lowerCaseMessage.includes("factura b") && lowerCaseMessage.includes("cómo hago")) {
        return `Podés generarla en ARCA desde Comprobantes en línea.\nRecordá que es solo para responsables inscriptos.\n👉 ${ARCA_FACTURA_HTML}`;
    }

    // CASO 2: Inscripción Monotributo
    if (lowerCaseMessage.includes("inscribo") && lowerCaseMessage.includes("monotributista")) {
        return `Para darte de alta como monotributista tenés que:\n1️⃣ Ingresar a ARCA con tu clave fiscal.\n2️⃣ Seleccionar la opción "Monotributo" → "Adhesión".\n3️⃣ Completar datos personales, actividad y domicilio.\n4️⃣ Confirmar la categoría y aceptar.\n👉 ${ARCA_MONOTRIBUTO_HTML}`;
    }

    // CASO 3: Certificado de Ingresos
    if (lowerCaseMessage.includes("certificado") && lowerCaseMessage.includes("ingresos")) {
        return `El certificado de ingresos debe generarlo tu contador, pero podés descargar comprobantes de tu actividad desde "Mis Comprobantes" en ARCA.\n👉 ${ARCA_MIS_COMPROBANTES_HTML}`;
    }

    return null;
}

// ---------------------------------------------
// Flujo Principal de Triggers
// ---------------------------------------------

function checkTriggers(message) {
    const contableResponse = checkCasosContables(message);
    if (contableResponse) {
        return contableResponse; 
    }
    
    const lowerCaseMessage = message.toLowerCase();
    for (const keyword in TRIGGERS_SIMPLES) {
        if (lowerCaseMessage.includes(keyword)) {
            return TRIGGERS_SIMPLES[keyword];
        }
    }
    return null; 
}

// ---------------------------------------------
// Conexión a OpenAI (o Simulación)
// ---------------------------------------------

async function getAIResponse(prompt) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('sk-Aquí-va-tu-clave-secreta-de-OpenAI')) {
        return `Respuesta IA (SIMULADA): Procesando tu consulta contable sobre "${prompt}". Si esto fuera real, la IA generaría una respuesta rica ahora.`;
    }
    
    return `Respuesta IA (ACTIVA): Procesando tu consulta contable sobre "${prompt}".`;
}

// ---------------------------------------------
// Ruta de la API
// ---------------------------------------------

app.post('/api/message', async (req, res) => {
    const userMessage = req.body.message;
    
    let botResponses = []; 

    if (!userMessage || userMessage.trim() === '') {
        botResponses.push({ text: "No recibí tu mensaje. ¿Podrías repetirlo?" });
    } else {
        const detectedResponse = checkTriggers(userMessage);

        if (detectedResponse) {
            if (Array.isArray(detectedResponse)) {
                botResponses = detectedResponse; 
            } 
            else if (typeof detectedResponse === 'string') {
                botResponses.push({ text: detectedResponse });
            } else {
                botResponses.push({ text: "Hubo un error al procesar tu solicitud interna." });
            }
        } else {
            botResponses.push({ text: await getAIResponse(userMessage) });
        }
    }

    res.json({ responses: botResponses });
});

// ---------------------------------------------
// Inicio del Servidor
// ---------------------------------------------

app.listen(PORT, () => {
    console.log(`✅ Servidor Backend Contable corriendo en http://localhost:${PORT}`);
});