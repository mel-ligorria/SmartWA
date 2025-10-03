// Archivo: server-electricista.js

const http = require('http');
const PORT = 3004; 

// URLs de Imágenes
const IMAGE_DISYUNTOR = "https://aigo-oss-mall.oss-accelerate.aliyuncs.com/b2b/goods/images/1465160446121218054_1638366869585_344.png";
const IMAGE_INSTALACION = "https://tse1.mm.bing.net/th/id/OIP.GGO_qc29kDjlDaT79Y8uJgHaFO?pid=Api&P=0&h=180";

// Mensaje de Bienvenida
const WELCOME_MESSAGE = `¡Hola! 📲🤖 Soy tu **Asistente de Electricista**. Pregúntame por **horario de atención**, **promociones semanales** o selecciona una opción del menú:

1️⃣ **Presupuesto Rápido** 💡 Recibí un cálculo estimado en minutos.

2️⃣ **Consultas Técnicas Frecuentes** 🔧 Encuentra respuestas a dudas comunes.

3️⃣ **Solicitud de Servicio Urgente** ⚡ Contacto inmediato con un técnico.

✍️ También puedes hacer tu propia pregunta (ej: **'¿Cómo elegir luces LED?'** o **'por qué salta la térmica'**).`;

// Variable para manejar la espera de presupuesto
let esperandoPresupuesto = false;

// Función que genera las respuestas
function generateResponses(input) {
    const inputLower = input.toLowerCase().trim();

    // Si estamos esperando la consulta de presupuesto
    if (esperandoPresupuesto) {
        esperandoPresupuesto = false; // Resetea la espera
        return [
            { text: `🤖 **Presupuesto estimado: $60.000** 💰 (incluye mano de obra y materiales básicos).

Te muestro una referencia de instalación 👇` },
            { url: IMAGE_INSTALACION },
            { text: "Escribe **menú** para volver." }
        ];
    }

    // Triggers simples
    if (inputLower.includes('horario') && inputLower.includes('atencion')) {
        return [
            { text: "Nuestro horario de atención técnica es de **Lunes a Viernes de 8:00 a 18:00 hs**. Para urgencias ⚡ (Opción 3) estamos **24/7**." }
        ];
    }
    
    if (inputLower.includes('promociones') || inputLower.includes('ofertas')) {
        return [
            { text: "Esta semana tenemos un **20% OFF** en instalaciones de tomas USB y un **15% OFF** en recambios de disyuntores. ¡Aprovechá!" }
        ];
    }

    // Opciones de menú
    switch (inputLower) {
        case '1':
        case 'presupuesto':
            // 1️⃣ Presupuesto Rápido - Mostrar mensaje de solicitud y esperar la entrada del cliente
            esperandoPresupuesto = true;
            return [
                { text: `💡 **Presupuesto Rápido**

🛠️ Para darte una estimación, necesito 3 datos clave:

1️⃣ ¿Es **Reparación** (algo que no funciona) o **Instalación** (algo nuevo)?

2️⃣ ¿Cuál es el problema/servicio? (ej: agregar toma, reemplazar disyuntor, corto circuito).

3️⃣ ¿Dónde es el trabajo? (zona o barrio para calcular traslado).` }
            ];

        case '2': 
        case 'tecnicas':
            return [
                { text: `🔧 **Consultas Técnicas Frecuentes**

Selecciona el tema que te interese:

1️⃣ **Salto de Térmica:** Causas y soluciones al corte de luz repentino.

2️⃣ **Disyuntor:** ¿Qué disyuntor necesito para mi casa?

3️⃣ **Toma a Tierra:** ¿Qué es y por qué es importante?

Escribe **2-1**, **2-2** o **2-3** para ver el detalle.
Escribe **menú** para volver.` }
            ];

        case '2-1':
            return [
                { text: `💥 **Salto de Térmica:** Ocurre por 2 razones principales:

**Cortocircuito:** Un fallo directo entre fase y neutro/tierra. Es urgente y requiere revisión.

**Sobrecarga:** Conectar demasiados aparatos a un mismo circuito. Desconectá algún aparato y volvé a subirla.

Si salta recurrentemente, pedí una revisión (escribe **1**).
Escribe **2** para volver al menú técnico.` }
            ];

        case '2-2':
            return [
                { text: `🔌 **Disyuntor Diferencial:** Es tu protección contra descargas eléctricas (toma corriente).

Para uso domiciliario, se recomienda un disyuntor diferencial de **30 mA** (miliamperes). ¡Es la norma!

Este es un disyuntor de 30mA 👇` },
                { url: IMAGE_DISYUNTOR },
                { text: "Escribe **2** para volver al menú técnico." }
            ];

        case '2-3':
            return [
                { text: `🟢 **Toma a Tierra:** Es un sistema de seguridad que desvía la energía sobrante o de fallos directamente a la tierra, evitando que pase a través de tu cuerpo.

Es obligatorio en toda instalación y reduce el riesgo de electrocución si un aparato falla.

Siempre debe estar instalada por un profesional. ¿Querés cotizarla? Escribe **1** para un presupuesto rápido.
Escribe **2** para volver al menú técnico.` }
            ];

        case '3':
        case 'urgente':
            // 3️⃣ Solicitud de Servicio Urgente - Mejor espaciado
            return [
                { text: `⚡ **¡Entendido!** Agendamos un técnico de guardia.

Si se te cortó la luz en toda la casa, por favor, **compartinos tu dirección y teléfono para coordinar en minutos.**

Contactanos por estos medios para mayor velocidad:
📞 **Llamada urgente:** <a href="tel:+543515061170">+54 351 5061170</a>
💬 **WhatsApp directo:** <a href="https://wa.me/5493515061170?text=Hola,%20necesito%20un%20servicio%20urgente%20de%20electricista." target="_blank">Enviar WhatsApp</a>` }
            ];

        case 'menu':
            return [{ text: WELCOME_MESSAGE }];
        
        default:
            return checkCasosElectricista(inputLower);
    }
}

// Consultas libres
function checkCasosElectricista(inputLower) {
    if (inputLower.includes('luz') || inputLower.includes('iluminacion') || inputLower.includes('led')) {
        return [
            { text: "💡 **Consulta de Iluminación:** ¡Excelente pregunta!" },
            { text: "Las LED **cálidas (2700K – 3000K)** son ideales para un living 🛋️ y dormitorios, creando un ambiente de relax." },
            { text: "Para áreas de trabajo (cocina, escritorio) te sugiero luz **neutra (4000K)**." },
            { text: "💡 **Tip:** ¿Querés ver opciones en promoción? Escribe **promociones**." }
        ];
    }
    if (inputLower.includes('salta la termica') || inputLower.includes('corte de luz') || inputLower.includes('salto de termica')) {
        return [
            { text: "Parece que tenés un problema con el salto de térmica. Escribe **2-1** para ver las causas y soluciones rápidas." }
        ];
    }
    return [
        { text: `🤖 Entiendo que tu consulta sobre "${inputLower}" es técnica. El electricista te responderá a detalle. Por favor, especifica más el problema.` },
        { text: "Escribe **menú** para ver las opciones principales." }
    ];
}

// Configuración del servidor
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/message' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', () => {
            try {
                const { message } = JSON.parse(body);
                const responses = generateResponses(message);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ responses: responses }));
            } catch (error) {
                console.error('Error processing request:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ responses: [{ text: 'Error en el formato de la solicitud.' }] }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`✅ Servidor Backend Electricista corriendo en http://localhost:${PORT}`);
});
