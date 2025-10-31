// ai-assistant.js

// ========================================================================
// === MÓDULO CONVERSACIONAL aiDANaI v3.0 (Motor de Intenciones)        ===
// ========================================================================

/**
 * El diccionario de intenciones. Cada intención tiene palabras clave
 * primarias (muy relevantes) y secundarias (contextuales).
 */
const INTENTS = {
    FIND_BIGGEST_EXPENSE: {
        primaryKeywords: ['mayor', 'grande', 'más caro'],
        secondaryKeywords: ['gasto', 'compra', 'movimiento'],
        handler: analyzeBiggestExpense
    },
    ANALYZE_CATEGORIES: {
        primaryKeywords: ['categorías', 'reparto', 'distribución', 'en qué'],
        secondaryKeywords: ['gasto', 'gastos', 'dinero'],
        handler: analyzeMainOutflow
    },
    CHECK_SAVINGS_RATE: {
        primaryKeywords: ['ahorro', 'tasa', 'ahorrando'],
        secondaryKeywords: ['saludable', 'cómo voy', 'bien', 'porcentaje'],
        handler: analyzeSavingsRate
    },
    FIND_UNUSUAL_SPEND: {
        primaryKeywords: ['inusual', 'raro', 'extraño', 'anormal', 'sospechoso'],
        secondaryKeywords: ['gasto', 'movimiento', 'transacción'],
        handler: analyzeUnusualActivity
    }
};

/**
 * Analiza la pregunta del usuario, le asigna una puntuación para cada intención
 * y devuelve la intención más probable.
 * @param {string} query - La pregunta del usuario en minúsculas.
 * @returns {string|null} La clave de la intención con la puntuación más alta, o null si ninguna coincide.
 */
function getIntent(query) {
    let bestMatch = { intent: null, score: 0 };

    for (const intentKey in INTENTS) {
        const intent = INTENTS[intentKey];
        let currentScore = 0;

        intent.primaryKeywords.forEach(keyword => {
            if (query.includes(keyword)) {
                currentScore += 2; // Las palabras primarias puntúan más
            }
        });

        intent.secondaryKeywords.forEach(keyword => {
            if (query.includes(keyword)) {
                currentScore += 1;
            }
        });

        if (currentScore > bestMatch.score) {
            bestMatch = { intent: intentKey, score: currentScore };
        }
    }

    // Solo aceptamos una coincidencia si tiene una puntuación mínima para evitar falsos positivos.
    return bestMatch.score > 1 ? bestMatch.intent : null;
}

/**
 * La función principal que orquesta la respuesta del asistente.
 * @param {string} intentKey - La clave de la intención a ejecutar.
 * @param {object} appData - Un objeto que contiene { movements, accounts, concepts }.
 * @returns {Promise<string>} La respuesta HTML del asistente.
 */
async function getAidanaiResponse(intentKey, appData) {
    if (intentKey && INTENTS[intentKey] && INTENTS[intentKey].handler) {
        // Ejecuta la función 'handler' asociada a la intención
        return await INTENTS[intentKey].handler(appData);
    }

    // Respuesta por defecto si no se encuentra una intención
    return `Lo siento, no he entendido bien tu pregunta. Puedes probar a preguntarme cosas como:<br><ul><li>"¿Cuál fue mi mayor gasto?"</li><li>"Analiza mis gastos por categoría"</li><li>"¿Es buena mi tasa de ahorro?"</li></ul>`;
}

// --- NUEVAS FUNCIONES DE ANÁLISIS (AHORA MÁS RÁPIDAS Y EFICIENTES) ---
// Nota: Todas toman 'appData' como parámetro para operar en memoria.

function analyzeBiggestExpense({ movements, concepts }) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const expensesLastMonth = movements.filter(m => 
        new Date(m.fecha) >= lastMonth && m.tipo === 'movimiento' && m.cantidad < 0
    );

    if (expensesLastMonth.length === 0) {
        return `<p>¡Felicidades! Parece que no tuviste ningún gasto el mes pasado.</p>`;
    }
    
    const biggestExpense = expensesLastMonth.reduce((max, mov) => mov.cantidad < max.cantidad ? mov : max);
    const concepto = concepts.find(c => c.id === biggestExpense.conceptoId)?.nombre || 'Sin categoría';

    return `<p>Tu mayor gasto del mes pasado fue de <strong>${formatCurrency(biggestExpense.cantidad)}</strong> en "<em>${escapeHTML(biggestExpense.descripcion)}</em>", bajo el concepto de <strong>${concepto}</strong>.</p>`;
}

function analyzeMainOutflow({ movements, concepts }) {
    const expenseTotals = movements.reduce((acc, m) => {
        if (m.tipo === 'movimiento' && m.cantidad < 0) {
            acc[m.conceptoId] = (acc[m.conceptoId] || 0) + m.cantidad;
        }
        return acc;
    }, {});

    const sortedExpenses = Object.entries(expenseTotals).sort((a, b) => a[1] - b[1]);

    if (sortedExpenses.length === 0) return `<p>No he encontrado categorías de gastos significativas.</p>`;
    
    let html = `<p>Tus <strong>3 mayores focos de gasto</strong> recientes son:</p><ol style="list-style-position: inside; padding-left: 8px;">`;
    sortedExpenses.slice(0, 3).forEach(([conceptoId, total]) => {
        const concepto = concepts.find(c => c.id === conceptoId)?.nombre || 'Desconocido';
        html += `<li style="margin-bottom: 4px;"><strong>${concepto}:</strong> ${formatCurrency(total)}</li>`;
    });
    return html + `</ol>`;
}

async function analyzeSavingsRate({ movements }) {
    // Para esta función, sí necesitamos un contexto de fechas.
    // Usaremos los filtros del dashboard como referencia, que son eficientes.
    const { current } = await getFilteredMovements(false);
    const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));
    const { ingresos, saldoNeto } = calculateTotals(current, visibleAccountIds);
    
    if (ingresos <= 0) return `<p>No he detectado ingresos en el periodo actual del panel para poder calcular tu tasa de ahorro.</p>`;

    const tasaAhorro = (saldoNeto / ingresos) * 100;
    let advice = '';
    if (tasaAhorro >= 20) advice = `¡Excelente! Estás ahorrando más del 20%, un objetivo financiero muy saludable.`;
    else if (tasaAhorro >= 10) advice = `Vas por buen camino. Ahorrar entre un 10% y un 20% es un gran logro.`;
    else if (tasaAhorro > 0) advice = `¡Bien! Estás ahorrando. Revisa tus gastos para ver si puedes aumentar este porcentaje.`;
    else advice = `Has gastado más de lo que ingresaste. Es importante analizar por qué.`;

    return `<p>Considerando los filtros actuales del panel, tu tasa de ahorro es del <strong>${tasaAhorro.toFixed(1)}%</strong>.</p><p style="margin-top: 8px;">${advice}</p>`;
}

function analyzeUnusualActivity({ movements }) {
    if (movements.length < 10) return `<p>Necesito más historial para detectar patrones. Sigue registrando tus gastos.</p>`;

    const allExpenses = movements.filter(m => m.tipo === 'movimiento' && m.cantidad < 0);
    if (allExpenses.length < 10) return `<p>No hay suficientes gastos para un análisis de anomalías todavía.</p>`;

    const avgExpense = allExpenses.reduce((sum, m) => sum + m.cantidad, 0) / allExpenses.length;
    const stdDev = Math.sqrt(allExpenses.map(m => Math.pow(m.cantidad - avgExpense, 2)).reduce((sum, v) => sum + v, 0) / allExpenses.length);

    const threshold = avgExpense - (2.5 * stdDev);
    const unusual = allExpenses.find(m => m.cantidad < threshold);
    
    if (!unusual) return `<p>No he detectado ninguna transacción que se desvíe significativamente de tus patrones de gasto habituales. ¡Todo parece en orden!</p>`;
    
    const concepto = db.conceptos.find(c => c.id === unusual.conceptoId)?.nombre || 'Sin categoría';

    return `<p>He detectado un gasto de <strong>${formatCurrency(unusual.cantidad)}</strong> en "<em>${escapeHTML(unusual.descripcion)}</em>" que es significativamente más alto que tu promedio.</p><p style="margin-top:8px;">Puede ser normal, pero siempre es bueno revisarlo.</p>`;
}