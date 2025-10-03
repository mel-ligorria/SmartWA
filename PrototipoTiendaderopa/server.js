// Archivo: server.js

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
// LINKS DE CARRITO Y MEDIDAS (DEFINICIONES)
// ---------------------------------------------

// Links de Google Drive proporcionados por el usuario
const TABLA_MEDIDAS_URL = "https://drive.google.com/file/d/1Zo_WES3xym01v71RO7yKGk8zZkJJnhKx/view?usp=drive_link";
const SWEATER_LINK = "https://drive.google.com/file/d/17-GI4r3C9FxjUMvRVHihCL7afwgAgH23/view?usp=drive_link";
const CAMISA_CLASICA_LINK = "https://drive.google.com/file/d/1Qh-HxJOzWS539RJZ823m4qpSDYmZYMJ3/view?usp=drive_link";
const CAMISA_LINO_LINK = "https://drive.google.com/file/d/1jKM9dBntuHqhuv70ymJh1X5qTTK1L0Vn/view?usp=drive_link";
const CAMISA_BLANCA_SUG_LINK = "https://drive.google.com/file/d/1tPMYh9mHFZGIW0s1NyYEqHwtNHbfFWug/view?usp=sharing";

// Formato HTML para los links
const LINK_MEDIDAS_HTML = `<a href="${TABLA_MEDIDAS_URL}" target="_blank">Tabla de medidas (Google Drive)</a>`;

// URL ORIGINAL (PARA CONSULTA DE PRECIO)
const PANTALON_PRECIO_URL = "https://tse2.mm.bing.net/th/id/OIP.xpmLqom_6TeV14yfmy4IoQHaF7?pid=Api&P=0&h=180";
// URL SOLICITADA POR EL USUARIO (PARA CONSULTA DE TALLES)
const PANTALON_TALLES_URL = "https://tse2.mm.bing.net/th/id/OIP.lCmgrzsE1F-58mmfE5GNCQHaHa?pid=Api&P=0&h=180";

// ---------------------------------------------
// Base de Datos Ficticia de Productos 
// ---------------------------------------------

const PRODUCTOS_CATALOGO = [
    { 
        nombre: "pantalón negro", 
        tipo: "pantalón", 
        color: "negro",
        talles: ["S", "M", "L"], 
        precio: 18900, 
        link: "[link del pantalón negro]", 
        // 🚨 Imagen para la consulta de precio (MANTENIDA COMO ESTABA)
        imageUrl: PANTALON_PRECIO_URL, 
        // 🚨 Nueva imagen para la consulta de talles
        sizesImageUrl: PANTALON_TALLES_URL,
        sugerencia: `Podés combinarlo con este sweater (¡aquí está la imagen!) 👉 🛒 <a href="${SWEATER_LINK}" target="_blank">[link del sweater]</a>`
    },
    { 
        nombre: "camisa clásica", 
        tipo: "camisa", 
        color: "celeste",
        talles: ["S", "M", "L"], 
        precio: 15000, 
        link: `🛒 <a href="${CAMISA_CLASICA_LINK}" target="_blank">[link camisa clásica celeste]</a>`
    },
    { 
        nombre: "camisa lino", 
        tipo: "camisa", 
        color: "celeste",
        talles: ["L", "XL"], 
        precio: 19000, 
        link: `🛒 <a href="${CAMISA_LINO_LINK}" target="_blank">[link camisa lino celeste]</a>`
    },
    { 
        nombre: "camisa", 
        tipo: "camisa", 
        color: "blanca",
        talles: ["S", "M", "L", "XL"], 
        precio: 12500, 
        link: `🛒 <a href="${CAMISA_BLANCA_SUG_LINK}" target="_blank">[link catálogo]</a>` 
    },
];

// ---------------------------------------------
// TRIGGERS SIMPLES 
// ---------------------------------------------

const TRIGGERS_SIMPLES = {
    "talles": `Los talles disponibles son S, M y L.\nPuedes ver nuestra tabla de medidas aquí: ${LINK_MEDIDAS_HTML}`,
    "promociones": "¡Tenemos 3x2 en camisas este mes! La promoción es válida hasta agotar stock.",
    "horarios": "Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00 hs.",
    "gracias": "¡De nada! ¡Estoy aquí para ayudarte!"
};

// ---------------------------------------------
// Lógica de Detección de Producto
// ---------------------------------------------

function checkProducto(message) {
    const lowerCaseMessage = message.toLowerCase();
    
    const talleMatch = lowerCaseMessage.match(/\b(talle|en|el)\s*([smlx]{1,2})\b/);
    const talleBuscado = talleMatch ? talleMatch[2].toUpperCase() : null;
    
    let colorBuscado = null;
    if (lowerCaseMessage.includes("negro")) colorBuscado = "negro";
    if (lowerCaseMessage.includes("celeste")) colorBuscado = "celeste";
    
    let isConsultaPrecio = lowerCaseMessage.includes("cuánto sale") || lowerCaseMessage.includes("precio");
    let isConsultaTalles = lowerCaseMessage.includes("talles hay");

    let productosEncontrados = PRODUCTOS_CATALOGO.filter(producto => {
        const nombreMatch = lowerCaseMessage.includes(producto.nombre) || lowerCaseMessage.includes(producto.tipo);
        const filtroColor = colorBuscado && lowerCaseMessage.includes(producto.color);
        
        return nombreMatch || filtroColor;
    });

    if (productosEncontrados.length === 0) {
        return null;
    }
    
    // 4. Generar la Respuesta

    // --- CASO 4: Consulta de precio y talle específico (MANTIENE IMAGEN ORIGINAL) ---
    if (isConsultaPrecio && productosEncontrados.length > 0) {
        const productoMatch = productosEncontrados.find(p => lowerCaseMessage.includes(p.nombre) || lowerCaseMessage.includes(p.tipo));

        if (productoMatch && productoMatch.imageUrl) {
            const talleFinal = talleBuscado && productoMatch.talles.includes(talleBuscado) ? talleBuscado : 'M';
            
            const textResponse = `El ${productoMatch.nombre} talle ${talleFinal} cuesta $${productoMatch.precio.toLocaleString('es-AR')} 💵.\n${productoMatch.sugerencia}`;
            
            // Devolvemos un ARRAY de objetos de respuesta (Texto y luego Imagen)
            return [ 
                { text: textResponse }, 
                { image: productoMatch.imageUrl } // Usa la imageUrl original para esta consulta
            ];
        }
    }
    
    // --- CASO 1: Consulta de talles de producto específico (USA NUEVA IMAGEN) ---
    if (isConsultaTalles) {
        const producto = productosEncontrados.find(p => lowerCaseMessage.includes(p.nombre) || lowerCaseMessage.includes(p.tipo));
        
        if (producto) {
            const camisaBlanca = PRODUCTOS_CATALOGO.find(p => p.nombre === 'camisa' && p.color === 'blanca');
            const sugerenciaLinkHtml = camisaBlanca ? camisaBlanca.link : '[link catálogo]';

            const textResponse = `Disponibles ${producto.talles.join(', ')} 👖.\nTe sugiero este outfit con camisa blanca 👉 ${sugerenciaLinkHtml}`;

            // Usa sizesImageUrl si existe, si no, usa la principal, si no, solo texto
            const imageToUse = producto.sizesImageUrl || producto.imageUrl; 
            
            if (imageToUse) {
                return [ 
                    { text: textResponse }, 
                    { image: imageToUse } // Usa la sizesImageUrl para esta nueva dinámica
                ];
            } else {
                // Si no hay imagen, devolver solo texto (comportamiento original para otros productos)
                return textResponse;
            }
        }
    }

    // --- CASO 10: Filtro complejo (CAMISAS CELESTES) ---
    if (colorBuscado && (talleBuscado || lowerCaseMessage.includes('camisa'))) {
        
        const productosFiltrados = productosEncontrados.filter(p => (colorBuscado && p.color === colorBuscado) && (talleBuscado ? p.talles.includes(talleBuscado) : true));

        if (productosFiltrados.length > 0) {
            let respuesta = `¡Claro! Tenemos ${productosFiltrados.length} modelos en color ${colorBuscado}, ${talleBuscado ? 'disponibles en talle ' + talleBuscado : 'que cumplen los criterios'} 👕:\n`;
            
            productosFiltrados.forEach(p => {
                respuesta += `${p.nombre} ($${p.precio.toLocaleString('es-AR')}) 👉 ${p.link}\n`;
            });
            return respuesta.trim();
        }
    }

    return null;
}

// ---------------------------------------------
// Flujo Principal de Triggers
// ---------------------------------------------

function checkTriggers(message) {
    const productResponse = checkProducto(message);
    if (productResponse) {
        return productResponse; 
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
        return `Respuesta IA (SIMULADA): Procesando tu consulta sobre "${prompt}". Si esto fuera real, la IA generaría una respuesta rica ahora.`;
    }
    
    return `Respuesta IA (ACTIVA): Procesando tu consulta sobre "${prompt}". La clave de OpenAI está configurada.`;
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
    console.log(`✅ Servidor Backend corriendo en http://localhost:${PORT}`);
});