// Archivo: server-consultor.js

const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

// 🚨 USAR PUERTO 3003 para el Consultor
const app = express();
const PORT = 3003; 

// URL de ejemplo para casos complejos y guías oficiales
const LINK_INPI = "https://www.argentina.gob.ar/inpi"; 
const LINK_EMPRESA = "https://www.argentina.gob.ar/produccion/crear-una-empresa";
// 🚨 Nuevo link para Autónomos
const LINK_AUTONOMOS = "https://www.argentina.gob.ar/afip/autonomos"; 
// 🚨 Nuevo link para trámites a distancia (TAD)
const LINK_TAD = "https://www.tramitesadistancia.gob.ar/";

// Configuración de Middlewares
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// ---------------------------------------------
// DEFINICIONES DE RESPUESTAS (MENÚ DE OPCIONES)
// ---------------------------------------------

const TRAMITES_HTML = `<a href="${LINK_TAD}" target="_blank">tramitesadistancia.gob.ar</a>`;
const EMPRESA_HTML = `<a href="${LINK_EMPRESA}" target="_blank">Argentina.gob.ar - Cómo crear una empresa</a>`;
const AUTONOMOS_HTML = `<a href="${LINK_AUTONOMOS}" target="_blank">Argentina.gob.ar - Autónomos</a>`;

// URLs de imágenes para diseño de marca
const IMAGE_URL_1 = "https://tse4.mm.bing.net/th/id/OIP.eYEeWyjzgxgfFRfehP53-gHaHa?pid=Api&P=0&h=180";
const IMAGE_URL_2 = "https://tse2.mm.bing.net/th/id/OIP.4uSkyto8YLmAok12PG-f_QHaHQ?pid=Api&P=0&h=180";


const TRIGGERS_MENU = {
    // ---------------------------------------------
    // Opción 1 del menú principal: INICIO DEL FLUJO IVA
    // ---------------------------------------------
    "iva": [
        // MENSAJE 1 (Explicación principal)
        { text: "Te comento 👉 el **IVA** es el impuesto que vas a tener que declarar y pagar como parte de tu actividad. Cada vez que facturás a un cliente, sumás el IVA a tu precio (por ejemplo, 21%). Ese monto no es tuyo, sino que luego lo tenés que ingresar a ARCA.\n\nA la vez, podés descontar el IVA que pagaste en tus compras relacionadas con tu trabajo (crédito fiscal). La diferencia entre lo que cobrás y lo que pagaste es lo que se declara y se paga mensualmente.\n\nEn pocas palabras: facturás con IVA, lo cobrás, pero no lo retenés — lo liquidás y pagás al Estado." },
        
        // MENSAJE 2 (Motivación y menú de seguimiento)
        { text: `**💡 ¡Me alegra que te interese este tema, estás dando pasos clave para tu emprendimiento!**

👉 **¿Querés que lo veamos más en detalle?** Escribí la palabra clave de la opción:

1️⃣ **Ampliada** → Concepto IVA para emprendedores

2️⃣ **Ejemplo** → Caso práctico con números

3️⃣ **Obligaciones** → Requisitos básicos frente a ARCA` }
    ],

    // Sub-opción 1.1: RESPUESTA AMPLIADA (Trigger: "ampliada" o "1")
    "ampliada": {
        text: `📘 **Respuesta ampliada: ¿Qué es el IVA para vos como emprendedor?**

El IVA (Impuesto al Valor Agregado) grava la venta de bienes y servicios. No es un costo tuyo, sino un impuesto que cobrás y luego trasladás al fisco.

--- 

**Escribe 2 para Ejemplo o 3 para Obligaciones.**`
    },
    
    // Sub-opción 1.2: EJEMPLO PRÁCTICO (Trigger: "ejemplo" o "2")
    "ejemplo": {
        text: `📊 **Ejemplo práctico con números:**

- Emitís una factura por tu servicio de $100.000.
- Sumás 21% de IVA → $21.000.
- Total facturado al cliente = $121.000.
- Ese $21.000 no te lo quedás: lo declarás a ARCA.
- Si en ese mes pagaste $5.000 de IVA en insumos, podés descontarlos. Entonces pagarías **$16.000** (21.000 − 5.000).

--- 

**Escribe 1 para Ampliada o 3 para Obligaciones.**`
    },
    
    // Sub-opción 1.3: OBLIGACIONES BÁSICAS (Trigger: "obligaciones" o "3")
    "obligaciones": {
        // AJUSTE: Doble salto de línea antes del submenú final
        text: `📝 **Obligaciones básicas:**

- Estar inscripto en ARCA como Responsable Inscripto.
- Emitir facturas con IVA discriminado.
- Presentar la Declaración Jurada mensual de IVA.
- Ingresar el pago en los vencimientos que marca el calendario fiscal.

--- 

**Escribe 1 para Ampliada o 2 para Ejemplo.**`
    },
    
    // ---------------------------------------------
    // Opción 2 del menú principal: INICIO DEL FLUJO EMPRESA (CORREGIDO ESPACIOS)
    // ---------------------------------------------
    "empresa": [
        // MENSAJE 1 (Pasos principales + Link oficial) - CORREGIDO CON \n\n
        { text: `👉 **Formalizar tu negocio es un gran paso.** Aquí tienes los **4 puntos clave** para crear tu empresa:

1️⃣ **Elegir la figura legal** (ejemplo: Monotributo, SRL, SA, SAS).

2️⃣ **Registrar la sociedad** en la Inspección General de Justicia (IGJ) o en el organismo provincial correspondiente.

3️⃣ **Solicitar el CUIT** en AFIP y dar de alta la actividad.

4️⃣ **Cumplir obligaciones** impositivas y laborales según la forma legal elegida.

🔗 Podés ver la guía oficial en ${EMPRESA_HTML}

Escribe **"más info"** para ver los detalles.` },
    ],

    // NUEVO TRIGGER: Sub-menú y motivación para empresa (Trigger: "masinfo") - CORREGIDO CON ESPACIO
    "masinfo": {
        text: `🚀 **¡Felicitaciones! Estás a un paso de formalizar tu emprendimiento.** Te cuento cómo arrancar:

Escribí la palabra clave de la opción para ver más información:

1️⃣ **legales** → formas legales (SRL, SA, SAS, Monotributo)

2️⃣ **tramites** → trámites iniciales (CUIT, inscripción AFIP, estatuto)

3️⃣ **recomendaciones** → recomendaciones (contadores, costos y tiempos)`
    },

    // Sub-opción 2.1: FORMAS LEGALES (Trigger: "legales" o "1")
    "legales": {
        text: `✅ **Formas legales**

Podés elegir entre:

- 👤 **Monotributo:** La forma más simple si trabajás solo y cumplís con los límites de facturación.
- 🚀 **SAS** (Sociedad por Acciones Simplificada): Ágil, se constituye online y con menos requisitos, ideal para emprendedores.
- 🤝 **SRL** (Sociedad de Responsabilidad Limitada): Muy usada en PyMEs, con responsabilidad limitada al capital aportado.
- 🏛️ **SA** (Sociedad Anónima): Más formal, estructura compleja, suele usarse en grandes empresas o para atraer inversión.

--- 

**Escribe 2 para Trámites o 3 para Recomendaciones.**`
    },
    
    // Sub-opción 2.2: TRÁMITES INICIALES (Trigger: "tramites" o "2")
    "tramites": {
        text: `📝 **Trámites iniciales**

Los pasos básicos son:

1️⃣ **Obtener CUIT** en AFIP.

2️⃣ **Registrar la sociedad** (en la IGJ o registro provincial).

3️⃣ **Redactar y presentar el estatuto** (documento clave que define las reglas internas de la empresa).

--- 

**Escribe 1 para Formas Legales o 3 para Recomendaciones.**`
    },
    
    // Sub-opción 2.3: RECOMENDACIONES (Trigger: "recomendaciones" o "3")
    "recomendaciones": {
        // AJUSTE: Doble salto de línea antes del submenú final
        text: `🧭 **Recomendaciones clave**

- **Contador:** Consultá a un profesional para definir la figura legal más conveniente y evitar errores costos os.
- **Costos y Tiempos:** Tené en cuenta los costos de inscripción (tasas) y los tiempos de aprobación, que varían mucho según la forma legal elegida (la SAS suele ser la más rápida).
- **Planificación:** Planificá las obligaciones impositivas (IVA, Ganancias, Ingresos Brutos) y laborales que vas a asumir.

--- 

**Escribe 1 para Formas Legales o 2 para Trámites.**`
    },
    
    // ---------------------------------------------
    // Opción 3 del menú principal: AUTÓNOMO (REQUISITOS) (CORREGIDO PREFIJO Y ESPACIOS)
    // ---------------------------------------------
    "autónomo": [
        // 🚨 Respuesta actualizada: Eliminé "Opción 3" y usé \n\n para listar
        { text: `**Requisitos para estar dado de alta como autónomo**

Para darte de alta como autónomo necesitás:

1️⃣ Tener **CUIT** (Clave Única de Identificación Tributaria).

2️⃣ Contar con **Clave Fiscal** con nivel de seguridad 2 o superior.

3️⃣ Ingresar al sistema de **AFIP** y declarar tus actividades económicas.

4️⃣ Obtener el **alta en el Régimen de Trabajadores Autónomos**

🔗 Podés ver la guía oficial paso a paso en ${AUTONOMOS_HTML}` }
    ]
};

// ---------------------------------------------
// Lógica de Detección de Casos Complejos (Consulta Libre)
// ---------------------------------------------

function checkCasosConsultor(message) {
    const lowerCaseMessage = message.toLowerCase();
    
    // Detecta registro/registrar + marca
    const isRegistrationQuery = (lowerCaseMessage.includes("registrar") || lowerCaseMessage.includes("registro")) && lowerCaseMessage.includes("marca");
    // Detecta diseño + marca
    const isDesignQuery = lowerCaseMessage.includes("diseño") && lowerCaseMessage.includes("marca");

    // 🚨 FLUJO 1: Registro de Marca (Si es registro, pero NO diseño)
    if (isRegistrationQuery && !isDesignQuery) {
        return [
            { text: `📌 Tenés que iniciar el trámite en el **INPI** (Instituto Nacional de la Propiedad Industrial). Lo hacés online en ${TRAMITES_HTML}.

🔗 Podés ver la guía oficial paso a paso en ${LINK_INPI}` }
        ];
    } 
    
    // 🚨 FLUJO 2: Diseño de Marca (Si es diseño, pero NO registro)
    if (isDesignQuery && !isRegistrationQuery) {
        // Flujo de 4 mensajes para diseño
        return [
            // Mensaje 1: Consejos de diseño
            { text: `🎨 **Diseño de marca**

🚀 **¡Tu marca es tu carta de presentación!**

👉 Te sugerimos trabajar un logo simple, legible y adaptable (colores + tipografía clara).

🔗 Podés probar herramientas como Canva o FreeLogoDesign.` },
            
            // Mensaje 2: Presentación de ejemplos visuales (Separado)
            { text: `📷 Te muestro 2 ejemplos visuales de inspiración según lo que usás hoy.` },
            
            // 🛑 CLAVE: Aquí se usa 'url' en lugar de 'text'
            { url: IMAGE_URL_1 }, 
            
            // 🛑 CLAVE: Aquí se usa 'url' en lugar de 'text'
            { url: IMAGE_URL_2 }
        ];
    }

    // Si ambos o ninguno están presentes, retorna nulo para el flujo normal
    return null;
}

// ---------------------------------------------
// Flujo Principal de Triggers
// ---------------------------------------------

function checkTriggers(message) {
    const lowerCaseMessage = message.toLowerCase();
    const trimmedMessage = lowerCaseMessage.trim();
    
    // Mapa de triggers numéricos y de palabras clave
    const menuMap = { 
        '1': 'iva', 
        '2': 'empresa', 
        '3': 'autónomo', 
        
        // Sub-opciones
        'ampliada': 'ampliada', 'ejemplo': 'ejemplo', 'obligaciones': 'obligaciones',
        'legales': 'legales', 'tramites': 'tramites', 'recomendaciones': 'recomendaciones',
        'masinfo': 'masinfo'
    };

    // 1. Chequea el caso complejo (Registro/Diseño de Marca)
    const consultorResponse = checkCasosConsultor(message);
    if (consultorResponse) {
        return consultorResponse; 
    }
    
    // 2. Determina la palabra clave del mensaje para el menú principal
    let keyword = null;

    if (menuMap[trimmedMessage]) {
        keyword = menuMap[trimmedMessage];
    } else {
        for (const key in TRIGGERS_MENU) {
            if (lowerCaseMessage.includes(key) && key.length > 2) { 
                keyword = key;
                break;
            }
        }
    }

    if (keyword && TRIGGERS_MENU[keyword]) {
        const response = TRIGGERS_MENU[keyword];
        
        if (Array.isArray(response)) {
            return response;
        } 
        else {
            return [response];
        }
    }
    
    return null; 
}

// ---------------------------------------------
// Conexión a IA (Simulación del Consultor)
// ---------------------------------------------

async function getAIResponse(prompt) {
    // Respuesta genérica para consultas fuera del menú o sin trigger específico
    return [{ text: `**¡Genial!** Tu consulta sobre "${prompt}" es específica y merece un análisis detallado. Te recomiendo agendar una cita con un consultor para revisar la viabilidad legal y fiscal de ese punto.` }];
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
            botResponses = detectedResponse; 
        } else {
            botResponses = await getAIResponse(userMessage);
        }
    }

    res.json({ responses: botResponses });
});

// ---------------------------------------------
// Inicio del Servidor
// ---------------------------------------------

app.listen(PORT, () => {
    console.log(`✅ Servidor Backend Consultor de IA corriendo en http://localhost:${PORT}`);
});