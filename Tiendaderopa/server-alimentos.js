// Archivo: server-alimentos.js

const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

// 🚨 USAR PUERTO 3002 para evitar conflictos con los otros proyectos.
const app = express();
const PORT = 3002; 

// URL de la foto del menú del día
const URL_FOTO_MENU = "https://legumbresjae.com/wp-content/uploads/2021/02/jae-2021.02-articulo-plato-saludable-fblink.jpg";

// Configuración de Middlewares
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// ---------------------------------------------
// DEFINICIONES DE LINKS DE INTERÉS (🚨 LINKS DE GOOGLE DRIVE ACTUALIZADOS 🚨)
// ---------------------------------------------

// Nuevo link para Ingredientes/Alérgenos (Documento de Drive)
const LINK_MENU_COMPLETO = "https://drive.google.com/file/d/19jdW50A58r04tV_Wo02Z3QNIWUf4AOf_/view?usp=sharing";
// Nuevo link para Precios Mayoristas (Documento de Drive)
const LINK_PRECIOS_MAYORISTA = "https://drive.google.com/file/d/1qcM5Tqv_0Ga9NdOEztrAWUiqGZZ4f0DK/view?usp=sharing";


// Formato HTML para los links
const MENU_HTML = `<a href="${LINK_MENU_COMPLETO}" target="_blank">[Ver nuestro Menú y Alérgenos]</a>`;
const MAYORISTA_HTML = `<a href="${LINK_PRECIOS_MAYORISTA}" target="_blank">[Ver Tarifas Mayoristas]</a>`;

// ---------------------------------------------
// TRIGGERS SIMPLES
// ---------------------------------------------

const TRIGGERS_SIMPLES = {
    // Trigger para el menú del día (devuelve array de texto + foto)
    "menú": [
        { text: "¡Buenísimo! Nuestro menú del día es: Ensalada de legumbres con palta, tomate cherry y hojas verdes, más una porción de fruta fresca." },
        { image: URL_FOTO_MENU }
    ],
    
    // Opciones sencillas
    "promociones": "¡Esta semana 🎁! 15% OFF en todas las viandas de la línea Veggie. Válido hasta el domingo.",
    "horarios": "Nuestro horario de atención y toma de pedidos es de Lunes a Viernes de 9:00 a 18:00 hs. Las entregas se coordinan previamente.",
    "gracias": "¡A vos! ¡Estamos aquí para ayudarte a comer más sano!"
};

// ---------------------------------------------
// Lógica de Detección de Casos Complejos
// ---------------------------------------------

function checkCasosAlimentos(message) {
    const lowerCaseMessage = message.toLowerCase();
    
    // CASO COMPLEJO 1: Consulta sobre ingredientes/alérgenos
    if (lowerCaseMessage.includes("alergeno") || lowerCaseMessage.includes("ingredientes")) {
        return `Todos nuestros platos detallan sus ingredientes en el menú. Si tenés una alergia severa 🥜, contactanos directamente para asegurarte de que podemos cumplir con la cocina sin contaminación cruzada.\n👉 ${MENU_HTML}`;
    }

    // CASO COMPLEJO 2: Compras Mayoristas (ej. para oficinas o reventa)
    if (lowerCaseMessage.includes("mayorista") || lowerCaseMessage.includes("oficina")) {
        return `¡Claro! Tenemos un plan de descuentos 📈 para pedidos superiores a 15 viandas semanales (ej. para oficinas o reventa).\nPodés revisar las tarifas aquí: ${MAYORISTA_HTML}`;
    }

    return null;
}

// ---------------------------------------------
// Flujo Principal de Triggers
// ---------------------------------------------

function checkTriggers(message) {
    const alimentosResponse = checkCasosAlimentos(message);
    if (alimentosResponse) {
        return alimentosResponse; 
    }
    
    const lowerCaseMessage = message.toLowerCase();
    for (const keyword in TRIGGERS_SIMPLES) {
        if (lowerCaseMessage.includes(keyword)) {
            const response = TRIGGERS_SIMPLES[keyword];
            // Si la respuesta es un array (como el menú), lo devuelve
            if (Array.isArray(response)) {
                return response;
            }
            // Si es un string, lo devuelve
            return response;
        }
    }
    return null; 
}

// ---------------------------------------------
// Conexión a IA (Simulación)
// ---------------------------------------------

async function getAIResponse(prompt) {
    // Si la consulta no matchea ningún trigger simple o complejo
    return `Respuesta IA (SIMULADA): Tu consulta sobre "${prompt}" es muy específica. En breve un asesor de viandas saludables te responderá. ¡Gracias por la paciencia!`;
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
            // Si es un array (menú del día), lo toma directamente
            if (Array.isArray(detectedResponse)) {
                botResponses = detectedResponse; 
            } 
            // Si es un string (otros triggers), lo envuelve
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
    console.log(`✅ Servidor Backend Alimentos Saludables corriendo en http://localhost:${PORT}`);
});