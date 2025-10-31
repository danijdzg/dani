
const handleExportFilteredCsv = (btn) => {
    // La lista de movimientos a exportar es la que ya tenemos filtrada en db.movimientos
    const movementsToExport = db.movimientos;

    if (movementsToExport.length === 0) {
        showToast("No hay datos para exportar.", "warning");
        return;
    }

    setButtonLoading(btn, true, 'Exportando...');

    try {
        const cuentasMap = new Map(db.cuentas.map(c => [c.id, c.nombre]));
        const conceptosMap = new Map(db.conceptos.map(c => [c.id, c.nombre]));

        const csvHeader = ['FECHA', 'CUENTA', 'CONCEPTO', 'IMPORTE', 'DESCRIPCIÓN'];
        let csvRows = [csvHeader.join(';')];
        
        // Ordenamos los movimientos por fecha para la exportación
        movementsToExport.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        for (const mov of movementsToExport) {
            const fecha = formatDateForCsv(mov.fecha);
            const descripcion = `"${mov.descripcion.replace(/"/g, '""')}"`;
            const importeStr = (mov.cantidad / 100).toLocaleString('es-ES', { useGrouping: false, minimumFractionDigits: 2 });
            let cuentaNombre = '';
            let conceptoNombre = '';

            if (mov.tipo === 'traspaso') {
                const origen = cuentasMap.get(mov.cuentaOrigenId) || '?';
                const destino = cuentasMap.get(mov.cuentaDestinoId) || '?';
                cuentaNombre = `"${origen} -> ${destino}"`;
                conceptoNombre = '"TRASPASO"';
            } else {
                cuentaNombre = `"${cuentasMap.get(mov.cuentaId) || 'S/C'}"`;
                conceptoNombre = `"${conceptosMap.get(mov.conceptoId) || 'S/C'}"`;
            }

            csvRows.push([fecha, cuentaNombre, conceptoNombre, importeStr, descripcion].join(';'));
        }

        const csvString = csvRows.join('\r\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diario_filtrado_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Exportación CSV completada.", "info");

    } catch (error) {
        console.error("Error al exportar CSV filtrado:", error);
        showToast("Error durante la exportación.", "danger");
    } finally {
        setButtonLoading(btn, false);
    }
};

	import { addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears } from 'https://cdn.jsdelivr.net/npm/date-fns@2.29.3/+esm'
        
        const firebaseConfig = { apiKey: "AIzaSyAp-t-2qmbvSX-QEBW9B1aAJHBESqnXy9M", authDomain: "cuentas-aidanai.firebaseapp.com", projectId: "cuentas-aidanai", storageBucket: "cuentas-aidanai.appspot.com", messagingSenderId: "58244686591", appId: "1:58244686591:web:85c87256c2287d350322ca" };
const PAGE_IDS = {
    INICIO: 'inicio-page',
    DIARIO: 'diario-page',
    INVERSIONES: 'inversiones-page',
    PLANIFICAR: 'planificar-page', // ¡La nueva página!
    AJUSTES: 'ajustes-page',
};


	const THEMES = {
    'default': { name: 'Neon Blade', icon: 'dark_mode' },
    'sunset-groove': { name: 'Sunset Groove', icon: 'light_mode' }
};
	        
// CÓDIGO CORRECTO Y ÚNICO QUE DEBE QUEDAR EN TU ARCHIVO
// PEGA ESTE BLOQUE ÚNICO Y CORRECTO EN SU LUGAR
	const AVAILABLE_WIDGETS = {
        'super-centro-operaciones': { title: 'Centro de Operaciones', description: 'Visión completa con filtros, KPIs y análisis de conceptos.', icon: 'query_stats' },
        'action-center': { title: 'Centro de Acciones', description: 'Alertas y tareas pendientes.', icon: 'notifications_active' },
        'net-worth-trend': { title: 'Evolución del Patrimonio', description: 'Gráfico histórico de la variación de tu patrimonio neto.', icon: 'show_chart' },
        'patrimonio-structure': { title: 'Patrimonio', description: 'Gráfico interactivo y listado de todas tus cuentas y su peso.', icon: 'account_balance' },
        'emergency-fund': { title: 'Colchón de Emergencia', description: 'Mide tu red de seguridad financiera.', icon: 'shield' },
        'fi-progress': { title: 'Independencia Financiera', description: 'Sigue tu progreso hacia la libertad financiera.', icon: 'flag' },
        'informe-personalizado': { title: 'Mi Informe Personalizado', description: 'Un gráfico a tu medida con los datos que más te importan.', icon: 'insights' }
    };
const DEFAULT_DASHBOARD_WIDGETS = [
    'super-centro-operaciones', // <-- El widget principal y más completo
    'net-worth-trend',          // Evolución del Patrimonio
    'patrimonio-structure',     // Desglose del Patrimonio
    'action-center'             // Centro de Acciones (Recurrentes pendientes)
];
// ▼▼▼ REEMPLAZAR POR COMPLETO CON LA VERSIÓN FINAL Y MATEMÁTICAMENTE CORRECTA ▼▼▼
// AÑADE ESTA NUEVA FUNCIÓN A main.js
const updateAnalisisWidgets = async () => {
    try {
        // Renderiza el informe personalizado
        const informeContainer = document.querySelector('[data-widget-type="informe-personalizado"]');
        if (informeContainer) {
            informeContainer.innerHTML = renderDashboardInformeWidget();
            await renderInformeWidgetContent();
        }
        
        // Renderiza y calcula Colchón de Emergencia e Independencia Financiera
        const saldos = await getSaldos();
        const patrimonioNeto = Object.values(saldos).reduce((sum, s) => sum + s, 0);
        const efData = calculateEmergencyFund(saldos, db.cuentas, recentMovementsCache);
        const fiData = calculateFinancialIndependence(patrimonioNeto, efData.gastoMensualPromedio);

        // Colchón de Emergencia
        const efContainer = document.querySelector('[data-widget-type="emergency-fund"]');
        if (efContainer) {
            efContainer.innerHTML = renderDashboardEmergencyFund(); // Dibuja el esqueleto
            const efWidget = efContainer.querySelector('#emergency-fund-widget');
            efWidget.querySelector('.card__content').classList.remove('skeleton'); 
            const monthsValueEl = efWidget.querySelector('#kpi-ef-months-value'); 
            const progressEl = efWidget.querySelector('#kpi-ef-progress'); 
            const textEl = efWidget.querySelector('#kpi-ef-text');
            if (monthsValueEl && progressEl && textEl) { 
                monthsValueEl.textContent = isFinite(efData.mesesCobertura) ? efData.mesesCobertura.toFixed(1) : '∞'; 
                progressEl.value = Math.min(efData.mesesCobertura, 6); 
                let textClass = 'text-danger'; 
                if (efData.mesesCobertura >= 6) textClass = 'text-positive'; 
                else if (efData.mesesCobertura >= 3) textClass = 'text-warning'; 
                monthsValueEl.className = `kpi-item__value ${textClass}`; 
                textEl.innerHTML = `Tu dinero líquido cubre <strong>${isFinite(efData.mesesCobertura) ? efData.mesesCobertura.toFixed(1) : 'todos tus'}</strong> meses de gastos.`; 
            }
        }
        
        // Independencia Financiera
        const fiContainer = document.querySelector('[data-widget-type="fi-progress"]');
        if(fiContainer) {
            fiContainer.innerHTML = renderDashboardFIProgress(); // Dibuja el esqueleto
            const fiWidget = fiContainer.querySelector('#fi-progress-widget');
            fiWidget.querySelector('.card__content').classList.remove('skeleton'); 
            const percentageValueEl = fiWidget.querySelector('#kpi-fi-percentage-value'); 
            const progressEl = fiWidget.querySelector('#kpi-fi-progress'); 
            const textEl = fiWidget.querySelector('#kpi-fi-text'); 
            if (percentageValueEl && progressEl && textEl) { 
                percentageValueEl.textContent = `${fiData.progresoFI.toFixed(1)}%`; 
                progressEl.value = fiData.progresoFI; 
                textEl.innerHTML = `Objetivo: <strong>${formatCurrency(fiData.objetivoFI)}</strong> (basado en un gasto anual de ${formatCurrency(fiData.gastoAnualEstimado)})`; 
            }
        }

    } catch (error) {
        console.error("Error al actualizar los widgets de análisis:", error);
    }
};

const getRecurrentsForDate = (dateString) => {
    const targetDate = parseDateStringAsUTC(dateString);
    if (!targetDate || !db.recurrentes) return [];

    const results = [];
    const targetTime = targetDate.getTime();
    
    db.recurrentes.forEach(r => {
        const nextDate = parseDateStringAsUTC(r.nextDate);
        if (!nextDate) return;

        // Descartamos si el evento ya ha finalizado
        if (r.endDate) {
            const endDate = parseDateStringAsUTC(r.endDate);
            if (targetTime > endDate.getTime()) {
                return;
            }
        }
        
        // La nueva lógica infalible
        let cursorDate = new Date(nextDate);

        if (targetTime === cursorDate.getTime()) {
            results.push(r); // Coincidencia directa
            return;
        }

        // Si la fecha objetivo es POSTERIOR a la próxima fecha, avanzamos
        if (targetTime > cursorDate.getTime()) {
            // Límite de seguridad para evitar bucles infinitos
            const limit = new Date(cursorDate);
            limit.setUTCFullYear(limit.getUTCFullYear() + 10);

            while (cursorDate.getTime() < targetTime && cursorDate.getTime() < limit.getTime()) {
                cursorDate = calculateNextDueDate(cursorDate.toISOString().slice(0, 10), r.frequency);
            }
            if (cursorDate.getTime() === targetTime) {
                results.push(r);
            }
        } 
        // Si la fecha objetivo es ANTERIOR, retrocedemos
        else {
            // Límite de seguridad
            const limit = new Date(cursorDate);
            limit.setUTCFullYear(limit.getUTCFullYear() - 10);
            
            while (cursorDate.getTime() > targetTime && cursorDate.getTime() > limit.getTime()) {
                cursorDate = calculatePreviousDueDate(cursorDate.toISOString().slice(0, 10), r.frequency);
            }
            if (cursorDate.getTime() === targetTime) {
                results.push(r);
            }
        }
    });

    return results;
};

const getInitialDb = () => ({
    cuentas: [], 
    conceptos: [], 
    movimientos: [], 
    presupuestos: [],
    recurrentes: [],
    inversiones_historial: [],
    inversion_cashflows: [],
    config: { 
        skipIntro: false,
        dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
        savedReports: {} // <-- AÑADIDO: para guardar la configuración de los informes
    } 
});
		// ▼▼▼ PEGA ESTE BLOQUE DE CÓDIGO JS ▼▼▼

// Variable global para guardar los filtros activos
let diarioActiveFilters = null;
let allDiarioMovementsCache = []; // Caché para guardar TODOS los movimientos una vez cargados

// Función para abrir y preparar el modal de filtros
const showDiarioFiltersModal = () => {
    showModal('diario-filters-modal');

    // Rellenamos los selectores múltiples de Cuentas y Conceptos
    const populateMultiSelect = (id, data, nameKey, valKey = 'id') => {
        const selectEl = select(id);
        if (!selectEl) return;
        selectEl.innerHTML = [...data]
            .sort((a, b) => (a[nameKey] || "").localeCompare(b[nameKey] || ""))
            .map(item => `<option value="${item[valKey]}">${item[nameKey]}</option>`)
            .join('');
    };
    
    populateMultiSelect('filter-diario-cuentas', getVisibleAccounts(), 'nombre');
    populateMultiSelect('filter-diario-conceptos', db.conceptos, 'nombre');

    // Rellenamos el formulario con los filtros que ya estaban activos (si los hay)
    if (diarioActiveFilters) {
        select('filter-diario-start-date').value = diarioActiveFilters.startDate || '';
        select('filter-diario-end-date').value = diarioActiveFilters.endDate || '';
        select('filter-diario-description').value = diarioActiveFilters.description || '';
        select('filter-diario-min-amount').value = diarioActiveFilters.minAmount || '';
        select('filter-diario-max-amount').value = diarioActiveFilters.maxAmount || '';
        // Reseleccionamos las opciones en los selectores múltiples
        Array.from(select('filter-diario-cuentas').options).forEach(opt => {
            opt.selected = diarioActiveFilters.cuentas?.includes(opt.value);
        });
        Array.from(select('filter-diario-conceptos').options).forEach(opt => {
            opt.selected = diarioActiveFilters.conceptos?.includes(opt.value);
        });
    }
};

// La función que se ejecuta al pulsar "Aplicar Filtros"
const applyDiarioFilters = async () => {
    // Guardamos los valores del formulario en nuestra variable global
    diarioActiveFilters = {
        startDate: select('filter-diario-start-date').value,
        endDate: select('filter-diario-end-date').value,
        description: select('filter-diario-description').value.toLowerCase(),
        minAmount: select('filter-diario-min-amount').value,
        maxAmount: select('filter-diario-max-amount').value,
        cuentas: Array.from(select('filter-diario-cuentas').selectedOptions).map(opt => opt.value),
        conceptos: Array.from(select('filter-diario-conceptos').selectedOptions).map(opt => opt.value)
    };
    
    hideModal('diario-filters-modal');
    hapticFeedback('success');
    showToast('Filtros aplicados. Mostrando resultados.', 'info');
    
    // Volvemos a renderizar la página del Diario para que aplique los filtros
    await renderDiarioPage();
};

// La función que se ejecuta al pulsar "Limpiar Filtros"
const clearDiarioFilters = async () => {
    diarioActiveFilters = null;
    select('diario-filters-form').reset();
    hideModal('diario-filters-modal');
    showToast('Filtros eliminados.', 'info');
    await renderDiarioPage();
};

// ▲▲▲ FIN DEL BLOQUE A PEGAR ▲▲▲
        let currentUser = null, unsubscribeListeners = [], db = getInitialDb(), deselectedAccountTypesFilter = new Set();
		let ptrState = {
			startY: 0,
			isPulling: false,
			distance: 0,
			threshold: 80 // Distancia en píxeles que hay que arrastrar para que se active
		};
		let calculatorKeyboardHandler = null;
		let deselectedInvestmentTypesFilter = new Set();
		let selectedInvestmentTypeFilter = null;
		let intelligentIndex = new Map();
		let syncState = 'synced'; 
		let isOffBalanceMode = false;
        let descriptionIndex = {};
		let globalSearchDebounceTimer = null;
		let newMovementIdToHighlight = null;
		let unsubscribeRecientesListener = null
        const originalButtonTexts = new Map();
        let conceptosChart = null, liquidAssetsChart = null, detailInvestmentChart = null, informesChart = null, assetAllocationChart = null, budgetTrendChart = null, netWorthChart = null;
        let lastScrollTop = null;
        let pageScrollPositions = {};
        let jsonWizardState = {
            file: null,
            data: null,
            preview: {
                counts: {},
                meta: {}
            }
        };
        let isInitialLoadComplete = false;
        let dataLoaded = {
            presupuestos: false,
            recurrentes: false,
            inversiones: false
        };
        
		const MOVEMENTS_PAGE_SIZE = 200;
        let lastVisibleMovementDoc = null; 
        let isLoadingMoreMovements = false; 
        let allMovementsLoaded = false; 
        
        let runningBalancesCache = null;
		let recentMovementsCache = []; // <-- AÑADIR: Caché para los movimientos recientes del dashboard
		        
        const vList = {
			scrollerEl: null, sizerEl: null, contentEl: null, items: [], itemMap: [], 
			heights: {}, 
			renderBuffer: 10, lastRenderedRange: { start: -1, end: -1 }, isScrolling: null
		};
        
       // ▼▼▼ COPIA Y PEGA ESTE BLOQUE ÚNICO EN LUGAR DEL CÓDIGO DE LA CALCULADORA QUE TENGAS ▼▼▼

        let calculatorState = {
    displayValue: '0',
    operand1: null,
    operator: null,
    waitingForNewValue: true,
    targetInput: null,
    isVisible: false, 
    isResultDisplayed: false,
    historyValue: '', // <-- ¡NUEVA! Guarda la operación
};

// Actualiza el display del historial
const updateCalculatorHistoryDisplay = () => {
    const historyDisplay = select('calculator-history-display');
    if (historyDisplay) historyDisplay.textContent = calculatorState.historyValue;
};

// Mapea las claves a los símbolos visuales
const getOperatorSymbol = (key) => ({
    'add': '+', 'subtract': '−', 'multiply': '×', 'divide': '÷'
}[key] || '');

// Gestiona qué botón de operador se ve activo
const updateActiveOperatorButton = () => {
    selectAll('.calculator-btn.btn-operator').forEach(btn => btn.classList.remove('btn-operator--active'));
    if (calculatorState.operator) {
        const activeBtn = document.querySelector(`.calculator-btn[data-key="${calculatorState.operator}"]`);
        if (activeBtn) activeBtn.classList.add('btn-operator--active');
    }
};      

const handleCalculatorInput = (key) => {
    hapticFeedback('light');
    let { displayValue, waitingForNewValue, operand1, operator, isResultDisplayed, historyValue } = calculatorState;
    
    if (isResultDisplayed && !['add', 'subtract', 'multiply', 'divide', 'sign'].includes(key)) {
        displayValue = '0';
        isResultDisplayed = false;
        historyValue = ''; // Limpiamos historial al empezar un nuevo cálculo
    }

    const isOperator = ['add', 'subtract', 'multiply', 'divide'].includes(key);

    if (isOperator) {
        if (operand1 !== null && operator !== null && !waitingForNewValue) {
            calculate();
            displayValue = calculatorState.displayValue; 
        }
        operand1 = parseFloat(displayValue.replace(',', '.'));
        operator = key;
        historyValue = `${displayValue} ${getOperatorSymbol(operator)}`;
        waitingForNewValue = true;
        isResultDisplayed = false;
    } else {
        switch(key) {
            case 'done':
                hapticFeedback('medium');
                if (operand1 !== null && operator !== null && !waitingForNewValue) {
                    calculate();
                    displayValue = calculatorState.displayValue;
                }
                if (calculatorState.targetInput) {
                    const finalValue = parseFloat(displayValue.replace(',', '.')) || 0;
                    calculatorState.targetInput.value = finalValue.toLocaleString('es-ES', { 
                        useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 
                    });
                    // Disparamos eventos para que cualquier otra lógica reaccione
                    calculatorState.targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                    calculatorState.targetInput.dispatchEvent(new Event('blur')); 
                }
                historyValue = '';
                hideCalculator();
                select('movimiento-descripcion').focus(); // Llevamos al usuario al siguiente paso
                return;
            case 'comma':
                if (waitingForNewValue) {
                    displayValue = '0,';
                    waitingForNewValue = false;
                } else if (!displayValue.includes(',')) displayValue += ',';
                isResultDisplayed = false;
                break;
            case 'clear': 
                displayValue = '0'; waitingForNewValue = true; operand1 = null; operator = null; isResultDisplayed = false; historyValue = '';
                break;
            case 'backspace': 
                displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : '0';
                if (displayValue === '0') waitingForNewValue = true;
                isResultDisplayed = false;
                break;
            case 'sign': 
                if (displayValue !== '0') displayValue = displayValue.startsWith('-') ? displayValue.slice(1) : `-${displayValue}`; 
                break;
            default: // Dígitos
                if (waitingForNewValue || displayValue === '0') {
                    displayValue = key;
                    waitingForNewValue = false;
                } else if (displayValue.length < 12) { // Límite para evitar desbordes
                    displayValue += key;
                }
                isResultDisplayed = false;
                break;
        }
    }
    
    // Guardamos y actualizamos la UI
    Object.assign(calculatorState, { displayValue, waitingForNewValue, operand1, operator, isResultDisplayed, historyValue });
    updateCalculatorDisplay();
    updateCalculatorHistoryDisplay();
    updateActiveOperatorButton();
};

const calculate = () => {
            const val1 = calculatorState.operand1;
            const val2 = parseFloat(calculatorState.displayValue.replace(',', '.'));
            if (isNaN(val1) || isNaN(val2) || !calculatorState.operator) return;

            let result = 0;
            switch (calculatorState.operator) {
                case 'add': result = val1 + val2; break;
                case 'subtract': result = val1 - val2; break;
                case 'multiply': result = val1 * val2; break;
                case 'divide':
                    if (val2 === 0) {
                        showToast("No se puede dividir por cero.", "danger");
                        result = 0;
                    } else {
                        result = val1 / val2;
                    }
                    break;
            }

            const resultString = parseFloat(result.toPrecision(12)).toString().replace('.', ',');
            
            calculatorState.displayValue = resultString;
            calculatorState.operand1 = null;
            calculatorState.operator = null;
            calculatorState.waitingForNewValue = true;
            calculatorState.isResultDisplayed = true;
        };

// ▲▲▲ FIN DEL BLOQUE ▲▲▲

        let descriptionSuggestionDebounceTimer = null; 
        const DESCRIPTION_SUGGESTION_LIMIT = 5;
        
                    

		let isDashboardRendering = false;
		let isDiarioPageRendering = false; // <-- AÑADE ESTA LÍNEA
		let dashboardUpdateDebounceTimer = null;
		let diarioViewMode = 'list'; // 'list' o 'calendar'
		let diarioCalendarDate = new Date();
		

async function hashPin(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPin(pin, storedHash) {
    const pinHash = await hashPin(pin);
    return pinHash === storedHash;
}

const updateSyncStatusIcon = () => {
    const iconEl = select('sync-status-icon');
    if (!iconEl) return;

    let iconName = '';
    let iconTitle = '';
    let iconClass = '';

    switch (syncState) {
        case 'syncing':
            iconName = `<span class="sync-icon-spinner">sync</span>`;
            iconTitle = 'Sincronizando datos con la nube...';
            iconClass = 'sync-status--syncing';
            break;
        case 'error':
            iconName = 'cloud_off';
            iconTitle = 'Error de conexión. Tus cambios se guardan localmente y se sincronizarán al recuperar la conexión.';
            iconClass = 'sync-status--error';
            break;
        case 'synced':
        default:
            iconName = 'cloud_done';
            iconTitle = 'Todos los datos están guardados y sincronizados en la nube.';
            iconClass = 'sync-status--synced';
            break;
    }
    
    iconEl.innerHTML = iconName;
    iconEl.title = iconTitle;
    iconEl.className = `material-icons ${iconClass}`;
};
                const buildDescriptionIndex = () => {
            descriptionIndex = {};
            if (!db.movimientos || db.movimientos.length === 0) return;

            const movementsToIndex = db.movimientos.slice(0, 500); 

            movementsToIndex.forEach(mov => {
                const desc = mov.descripcion.trim().toLowerCase();
                if (desc.length > 3) {
                    if (!descriptionIndex[desc]) {
                        descriptionIndex[desc] = {
                            conceptoId: mov.conceptoId,
                            count: 0
                        };
                    }
                    descriptionIndex[desc].count++;
                }
            });
        };
               
    
        firebase.initializeApp(firebaseConfig);
        const fbAuth = firebase.auth();
        fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const fbDb = firebase.firestore();
        
        fbDb.enablePersistence({synchronizeTabs: true}).catch(err => {
            if (err.code == 'failed-precondition') showToast('Modo offline no disponible (múltiples pestañas).', 'warning');
            else if (err.code == 'unimplemented') showToast('Navegador no soporta modo offline.', 'warning');
        });
        
async function saveDoc(collectionName, docId, data, btn = null) {
    if (!currentUser) { showToast("Error: No hay usuario.", "danger"); return; }
    if (btn) setButtonLoading(btn, true);

    syncState = 'syncing';
    updateSyncStatusIcon();

    try {
        const docRef = fbDb.collection('users').doc(currentUser.uid).collection(collectionName).doc(docId);
        await docRef.set(data, { merge: true });
        
        await fbDb.waitForPendingWrites();

        syncState = 'synced';
        
    } catch (error) {
        console.error(`Error guardando en ${collectionName}:`, error);
        showToast("Error al guardar.", "danger");
        syncState = 'error';
    } finally {
        if (btn) setButtonLoading(btn, false);
        updateSyncStatusIcon();
    }
}


        async function updateAccountBalance(cuentaId, amountInCents) {
            if (!currentUser || !cuentaId || typeof amountInCents !== 'number') {
                console.error("Argumentos inválidos para updateAccountBalance");
                return;
            }

            try {
                const accountRef = fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(cuentaId);
                await accountRef.update({
                    saldo: firebase.firestore.FieldValue.increment(amountInCents)
                });
            } catch (error) {
                console.error(`Error al actualizar saldo de la cuenta ${cuentaId}:`, error);
                showToast("Error crítico: no se pudo actualizar el saldo.", "danger");
            }
        }
        
                
        async function deleteDoc(collectionName, docId) {
    if (!currentUser) { showToast("Error: No hay usuario.", "danger"); return; }
    
    syncState = 'syncing';
    updateSyncStatusIcon();

    try {
        await fbDb.collection('users').doc(currentUser.uid).collection(collectionName).doc(docId).delete();
        await fbDb.waitForPendingWrites();
        syncState = 'synced';
    } catch (error) {
        console.error(`Error borrando de ${collectionName}:`, error);
        showToast("Error al borrar.", "danger");
        syncState = 'error';
    } finally {
        updateSyncStatusIcon();
    }
}
        
 // REEMPLAZA tu función loadCoreData por esta versión actualizada
async function loadCoreData(uid) {
    unsubscribeListeners.forEach(unsub => unsub());
    unsubscribeListeners = [];
    
    dataLoaded = { presupuestos: false, recurrentes: false, inversiones: false };

    const userRef = fbDb.collection('users').doc(uid);

    const collectionsToLoadInitially = ['cuentas', 'conceptos', 'recurrentes'];

    collectionsToLoadInitially.forEach(collectionName => {
        const unsubscribe = userRef.collection(collectionName).onSnapshot(snapshot => {
            db[collectionName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (collectionName === 'recurrentes') {
    dataLoaded.recurrentes = true;
    const activePage = document.querySelector('.view--active');
    if (activePage && (activePage.id === PAGE_IDS.DIARIO)) {
        // En lugar de recargar todo, solo actualizamos la UI de la lista virtual.
        // Esto es instantáneo y no vuelve a pedir datos a la BBDD.
        updateVirtualListUI(); 
    }
    if (activePage && (activePage.id === PAGE_IDS.PLANIFICACION)) {
        renderPlanificacionPage();
    }
}
            
            populateAllDropdowns();
            
            if (select(PAGE_IDS.INICIO)?.classList.contains('view--active')) scheduleDashboardUpdate();
            
        }, error => console.error(`Error escuchando ${collectionName}: `, error));
        unsubscribeListeners.push(unsubscribe);
    });

    const unsubConfig = userRef.onSnapshot(doc => {
        db.config = doc.exists && doc.data().config ? doc.data().config : getInitialDb().config;
        localStorage.setItem('skipIntro', (db.config && db.config.skipIntro) || 'false');
        loadConfig();
    }, error => console.error("Error escuchando la configuración del usuario: ", error));
    unsubscribeListeners.push(unsubConfig);

    // =====================================================================
    // === INICIO: LÓGICA DE CARGA INTELIGENTE PARA EL DASHBOARD (EL MANANTIAL) ===
    // =====================================================================
    // Desconectamos cualquier listener anterior para evitar duplicados al iniciar sesión de nuevo.
    if (unsubscribeRecientesListener) unsubscribeRecientesListener();

    // Creamos una consulta para los últimos 3 meses de movimientos. Esto es suficiente
    // para los cálculos de "vs mes anterior" y "vs año anterior" del dashboard.
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Este listener mantendrá nuestra caché `recentMovementsCache` siempre actualizada en tiempo real.
    unsubscribeRecientesListener = userRef.collection('movimientos')
        .where('fecha', '>=', threeMonthsAgo.toISOString())
        .onSnapshot(snapshot => {
            console.log("Listener de recientes: Datos actualizados en la caché.");
            // Actualizamos la caché con los datos más frescos.
            recentMovementsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Si el usuario está en la página de Inicio, la actualizamos inmediatamente.
            const activePage = document.querySelector('.view--active');
            if (activePage && activePage.id === PAGE_IDS.INICIO) {
                scheduleDashboardUpdate();
            }
        }, error => console.error("Error escuchando movimientos recientes: ", error));
    // ===================================================================
    // === FIN: LÓGICA DE CARGA INTELIGENTE ==============================
    // ===================================================================
                        
    buildDescriptionIndex();
    startMainApp();
};

        
        async function loadPresupuestos() {
    if (dataLoaded.presupuestos || !currentUser) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
        console.log("Lazy loading: Cargando presupuestos (y esperando)...");
        
        let firstLoad = true;
        const unsub = fbDb.collection('users').doc(currentUser.uid).collection('presupuestos').onSnapshot(snapshot => {
            db.presupuestos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (firstLoad) {
                dataLoaded.presupuestos = true;
                firstLoad = false;
                resolve(); // ¡Promesa cumplida! La ejecución puede continuar.
            }

            const activePage = document.querySelector('.view--active');
            if (activePage && activePage.id === PAGE_IDS.PLANIFICACION) {
                renderBudgetTracking();
            }
        }, err => {
            console.error("Error al cargar presupuestos:", err);
            reject(err); // Si hay un error, rompemos la promesa.
        });
        unsubscribeListeners.push(unsub);
    });
}

        async function loadInversiones() {
    if (dataLoaded.inversiones || !currentUser) return Promise.resolve();

    console.log("Lazy loading: Cargando datos de inversión (y esperando)...");

    const coleccionesInversion = ['inversiones_historial', 'inversion_cashflows'];
    
    const promises = coleccionesInversion.map(collectionName => {
        return new Promise((resolve, reject) => {
            let firstLoad = true;
            const unsub = fbDb.collection('users').doc(currentUser.uid).collection(collectionName).onSnapshot(snapshot => {
                db[collectionName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                if (firstLoad) {
                    firstLoad = false;
                    resolve(); // ¡Promesa cumplida para este tipo de dato!
                }
            }, err => {
                console.error(`Error al cargar ${collectionName}:`, err);
                reject(err);
            });
            unsubscribeListeners.push(unsub);
        });
    });

    await Promise.all(promises);

    dataLoaded.inversiones = true;

    }
    const checkAuthState = () => {
            fbAuth.onAuthStateChanged((user) => {
                if (user) {
                    const storedPinHash = localStorage.getItem('pinUserHash');
                    const storedPinEmail = localStorage.getItem('pinUserEmail');

                    if (storedPinHash && storedPinEmail === user.email) {
                        showPinScreen(user);
                    } else {
                        currentUser = user;
                        loadCoreData(user.uid);
                    }
                } else {
                    currentUser = null;
                    unsubscribeListeners.forEach(unsub => unsub());
                    unsubscribeListeners = [];
                    db = getInitialDb();
                    showLoginScreen();
                }
            });
        };

        const calculateNextDueDate = (currentDueDate, frequency) => {
            const d = new Date(currentDueDate);
            d.setHours(12, 0, 0, 0); 
        
            switch (frequency) {
                case 'daily': return addDays(d, 1);
                case 'weekly': return addWeeks(d, 1);
                case 'monthly': return addMonths(d, 1);
                case 'yearly': return addYears(d, 1);
                default: return d;
            }
        };
        const calculatePreviousDueDate = (currentDueDate, frequency) => {
    const d = new Date(currentDueDate);
    d.setHours(12, 0, 0, 0); 

    switch (frequency) {
        case 'daily': return subDays(d, 1);
        case 'weekly': return subWeeks(d, 1);
        case 'monthly': return subMonths(d, 1);
        case 'yearly': return subYears(d, 1);
        default: return d;
    }
};
		
		const select = (id) => document.getElementById(id);
		const selectAll = (s) => document.querySelectorAll(s);
		const selectOne = (s) => document.querySelector(s);
        const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		const chunkArray = (array, size) => {
			const chunks = [];
			for (let i = 0; i < array.length; i += size) {
				chunks.push(array.slice(i, i + size));
			}
			return chunks;
		};
		const measureListItemHeights = () => {
    // Ya no medimos nada. Usamos valores fijos basados en el CSS.
    // Es un "contrato" entre nuestro estilo y nuestro código.
    vList.heights = {
        transaction: 64, // Coincide con el min-height que pusimos en el CSS
        transfer: 76,    // Valor estimado para traspasos, puedes ajustarlo
        header: 40,      // Valor estimado para cabeceras
        pendingHeader: 40, // Valor estimado
        pendingItem: 72    // Valor estimado
    };
    
    console.log('Alturas de elementos definidas (Robusto):', vList.heights);
};
        const hapticFeedback = (type = 'light') => {
            if ('vibrate' in navigator) {
                try {
                    let pattern;
                    switch (type) {
                        case 'light':   pattern = 10; break;
                        case 'medium':  pattern = 25; break;
                        case 'success': pattern = [15, 60, 15]; break;
                        case 'warning': pattern = [30, 40, 30]; break;
                        case 'error':   pattern = [50, 50, 50]; break;
                        default:        pattern = 10;
                    }
                    navigator.vibrate(pattern);
                } catch (e) {}
            }
        };

        const parseDateStringAsUTC = (dateString) => {
            if (!dateString) return null;
            return new Date(dateString + 'T12:00:00Z');
        };
		const generateReportFilterControls = (reportId, defaultPeriod = 'año-actual') => {
    return `
        <div class="report-filters" data-report-id="${reportId}" style="margin-bottom: var(--sp-4); padding: var(--sp-3); background-color: var(--c-surface-variant); border-radius: var(--border-radius-md);">
            <div class="form-group" style="margin-bottom: var(--sp-2);">
                <label for="filter-periodo-${reportId}" class="form-label" style="margin-bottom: var(--sp-1);">Seleccionar Periodo</label>
                <select id="filter-periodo-${reportId}" class="form-select report-period-selector">
                    <option value="mes-actual" ${defaultPeriod === 'mes-actual' ? 'selected' : ''}>Este Mes</option>
                    <option value="año-actual" ${defaultPeriod === 'año-actual' ? 'selected' : ''}>Este Año</option>
                    <option value="ultimo-año" ${defaultPeriod === 'ultimo-año' ? 'selected' : ''}>Últimos 12 Meses</option>
                    <option value="custom">Personalizado</option>
                </select>
            </div>
            <div id="custom-date-filters-${reportId}" class="form-grid hidden" style="grid-template-columns: 1fr 1fr; gap: var(--sp-2);">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="filter-fecha-inicio-${reportId}" class="form-label" style="font-size: var(--fs-xs);">Desde</label>
                    <input type="date" id="filter-fecha-inicio-${reportId}" class="form-input">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="filter-fecha-fin-${reportId}" class="form-label" style="font-size: var(--fs-xs);">Hasta</label>
                    <input type="date" id="filter-fecha-fin-${reportId}" class="form-input">
                </div>
            </div>
        </div>`;
};

	/**
 * Obtiene las fechas de inicio y fin basadas en un selector de periodo de informe.
 * @param {string} reportId - El ID del informe.
 * @returns {{sDate: Date, eDate: Date}} Un objeto con las fechas de inicio y fin.
 */
const getDatesFromReportFilter = (reportId) => {
    const periodSelector = select(`filter-periodo-${reportId}`);
    if (!periodSelector) return { sDate: null, eDate: null };

    const p = periodSelector.value;
    let sDate, eDate;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (p) {
        case 'mes-actual':
            sDate = new Date(now.getFullYear(), now.getMonth(), 1);
            eDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'año-actual':
            sDate = new Date(now.getFullYear(), 0, 1);
            eDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
        case 'ultimo-año':
            eDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            sDate = new Date(now);
            sDate.setFullYear(sDate.getFullYear() - 1);
            sDate.setDate(sDate.getDate() + 1);
            sDate.setHours(0,0,0,0);
            break;
        case 'custom':
            const startInput = select(`filter-fecha-inicio-${reportId}`);
            const endInput = select(`filter-fecha-fin-${reportId}`);
            sDate = startInput?.value ? parseDateStringAsUTC(startInput.value) : null;
            eDate = endInput?.value ? parseDateStringAsUTC(endInput.value) : null;
            if (eDate) eDate.setUTCHours(23, 59, 59, 999);
            break;
    }
    return { sDate, eDate };
};


/**
 * REVISADO: Calcula el impacto real de un movimiento en el flujo de caja,
 * asegurándose de que la cuenta del movimiento está visible.
 * @param {object} mov - El objeto de movimiento.
 * @param {Set<string>} visibleAccountIds - Un Set con los IDs de las cuentas visibles.
 * @returns {number} La cantidad en céntimos del impacto del movimiento.
 */
const calculateMovementAmount = (mov, visibleAccountIds) => {
    let amount = 0;
    if (mov.tipo === 'movimiento') {
        // CORRECCIÓN CLAVE: Solo se suma si la cuenta del movimiento pertenece a la contabilidad visible.
        if (visibleAccountIds.has(mov.cuentaId)) {
            amount = mov.cantidad;
        }
    } else if (mov.tipo === 'traspaso') {
        const origenVisible = visibleAccountIds.has(mov.cuentaOrigenId);
        const destinoVisible = visibleAccountIds.has(mov.cuentaDestinoId);
        // Si el traspaso es entre contabilidades, solo contamos la parte que entra o sale.
        if (origenVisible && !destinoVisible) amount = -mov.cantidad; // Sale dinero
        else if (!origenVisible && destinoVisible) amount = mov.cantidad; // Entra dinero
        // Si es un traspaso interno (ambas visibles) o externo (ninguna visible), el impacto es 0.
    }
    return amount;
};

/**
 * REVISADO: Función central para calcular totales de ingresos/gastos/neto.
 * Ahora utiliza la función 'calculateMovementAmount' corregida.
 * @param {Array<object>} movs - Array de movimientos a procesar.
 * @param {Set<string>} visibleAccountIds - Set de IDs de cuentas visibles.
 * @returns {{ingresos: number, gastos: number, saldoNeto: number}}
 */
const calculateTotals = (movs, visibleAccountIds) => {
    return movs.reduce((acc, mov) => {
        const amount = calculateMovementAmount(mov, visibleAccountIds);
        if (amount > 0) acc.ingresos += amount;
        else acc.gastos += amount;
        acc.saldoNeto += amount;
        return acc;
    }, { ingresos: 0, gastos: 0, saldoNeto: 0 });
};
// --- ACTUALIZAR EL EVENT LISTENER ---
// Añadir un nuevo listener para el evento 'change' en los selectores de los informes
document.body.addEventListener('change', e => {
    if (e.target.classList.contains('report-period-selector')) {
        const reportId = e.target.closest('.report-filters').dataset.reportId;
        const customFilters = select(`custom-date-filters-${reportId}`);
        if (customFilters) customFilters.classList.toggle('hidden', e.target.value !== 'custom');
        
        // Si no es personalizado, se regenera el informe inmediatamente
        if (e.target.value !== 'custom') {
            renderInformeDetallado(reportId);
        }
    }
    // Añadir un listener para los inputs de fecha personalizados
    if (e.target.type === 'date' && e.target.id.startsWith('filter-fecha-')) {
        const reportId = e.target.closest('.report-filters').dataset.reportId;
        const startDate = select(`filter-fecha-inicio-${reportId}`).value;
        const endDate = select(`filter-fecha-fin-${reportId}`).value;
        if(startDate && endDate) {
             renderInformeDetallado(reportId);
        }
    }
});


        const generateId = () => fbDb.collection('users').doc().id;
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const formatCurrency = (numInCents) => {
    const number = (numInCents || 0) / 100;
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(number);
};

// ▼▼▼ PÉGALA AQUÍ ▼▼▼
const showToast = (message, type = 'info', duration = 3000) => {
    const container = select('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
};
// ▲▲▲ AQUÍ TERMINA LA FUNCIÓN PEGADA ▲▲▲
// ▼▼▼ PEGA ESTE BLOQUE DE CÓDIGO JS EN TU SCRIPT ▼▼▼
   // Variable global para guardar a nuestro "asistente"
let widgetObserver = null;

/**
 * Esta es la función que se llamará cuando un esqueleto entre en la pantalla.
 * Es como la orden que le damos al asistente: "¡Enciende esta luz!".
 */
const lazyLoadWidget = async (widgetElement) => {
    const widgetType = widgetElement.dataset.widgetType;
    if (!widgetType) return;

    // Marcamos el widget como "cargando" para evitar que se cargue dos veces
    widgetElement.dataset.widgetType = 'loading';
    
    // Le ponemos un spinner para que el usuario vea que algo pasa
    widgetElement.classList.add('widget--loading');
    const spinner = document.createElement('div');
    spinner.className = 'widget-spinner';
    spinner.innerHTML = '<span class="spinner" style="width: 28px; height: 28px;"></span>';
    widgetElement.prepend(spinner);

    // Dependiendo de la "etiqueta" del widget, llamamos a la función de carga correcta.
    // Usaremos la función 'updateDashboardData' que ya tienes, que es muy potente.
    try {
        await updateDashboardData(); // Esta función ya sabe cómo rellenar todos los widgets
    } catch(error) {
        console.error(`Error al cargar el widget ${widgetType}:`, error);
        widgetElement.innerHTML = `<div class="empty-state text-danger"><p>Error al cargar este widget.</p></div>`;
    } finally {
        // Una vez cargado, quitamos el spinner y la clase de carga.
        widgetElement.classList.remove('widget--loading');
        spinner.remove();
    }
};

/**
 * Esta función crea y activa a nuestro "asistente".
 * Le dice qué elementos tiene que vigilar.
 */
const initWidgetObserver = () => {
    // Si ya teníamos un asistente, lo despedimos para contratar uno nuevo y limpio.
    if (widgetObserver) {
        widgetObserver.disconnect();
    }

    const options = {
        root: selectOne('.app-layout__main'), // Observa el scroll dentro del contenedor principal
        rootMargin: '150px', // Empieza a cargar el widget cuando esté a 150px de entrar en pantalla
        threshold: 0.01 // Se activa en cuanto un 1% del widget sea visible
    };

    // Creamos el asistente y le decimos qué hacer cuando vea algo.
    widgetObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Si el elemento que estamos vigilando (entry.target) está ahora visible...
            if (entry.isIntersecting) {
                const widgetElement = entry.target;
                
                // Le damos la orden de cargar su contenido.
                lazyLoadWidget(widgetElement);
                
                // Le decimos al asistente que deje de vigilar este elemento, ¡su trabajo aquí ha terminado!
                observer.unobserve(widgetElement);
            }
        });
    }, options);

    // Finalmente, le damos al asistente la lista de todos los esqueletos que tiene que vigilar.
    const widgetsToLoad = document.querySelectorAll('[data-widget-type]');
    widgetsToLoad.forEach(widget => {
        widgetObserver.observe(widget);
    });
};

// ▲▲▲ FIN DEL BLOQUE A PEGAR ▲▲▲
        const toSentenceCase = (str) => {
			if (!str || typeof str !== 'string') return '';
			return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
		};

        const setButtonLoading = (btn, isLoading, text = 'Cargando...') => {
            if (!btn) return;
            if (isLoading) { if (!originalButtonTexts.has(btn)) originalButtonTexts.set(btn, btn.innerHTML); btn.setAttribute('disabled', 'true'); btn.classList.add('btn--loading'); btn.innerHTML = `<span class="spinner"></span> <span>${text}</span>`;
            } else { btn.removeAttribute('disabled'); btn.classList.remove('btn--loading'); if (originalButtonTexts.has(btn)) { btn.innerHTML = originalButtonTexts.get(btn); originalButtonTexts.delete(btn); } }
        };
// --- PEGA ESTA NUEVA FUNCIÓN COMPLETA EN TU JAVASCRIPT ---

/**
 * Dispara una animación de una "burbuja" que viaja desde un elemento
 * hasta la parte superior de la lista de movimientos.
 * @param {HTMLElement} fromElement - El elemento desde donde empieza la animación (ej. el botón Guardar).
 * @param {string} color - 'green' para ingresos, 'red' para gastos.
 */
const triggerSaveAnimation = (fromElement, color) => {
    if (!fromElement) return;
    const startRect = fromElement.getBoundingClientRect();
    const listElement = select('movimientos-list-container') || select('diario-page');
    const endRect = listElement.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.className = 'save-animation-bubble';
    bubble.style.backgroundColor = color === 'green' ? 'var(--c-success)' : 'var(--c-danger)';
    bubble.style.left = `${startRect.left + startRect.width / 2 - 10}px`;
    bubble.style.top = `${startRect.top + startRect.height / 2 - 10}px`;
    document.body.appendChild(bubble);
    void bubble.offsetWidth; // Force reflow
    bubble.style.animation = `fly-to-list 0.7s cubic-bezier(0.5, 0, 1, 0.5) forwards`;
    bubble.style.transform = `translate(${endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2)}px, ${endRect.top - (startRect.top + startRect.height / 2)}px) scale(0)`;
    bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
};
        const displayError = (id, msg) => { const err = select(`${id}-error`); if (err) { err.textContent = msg; err.setAttribute('role', 'alert'); } const inp = select(id); if (inp) inp.classList.add('form-input--invalid'); };
        const clearError = (id) => { const err = select(`${id}-error`); if (err) { err.textContent = ''; err.removeAttribute('role'); } const inp = select(id); if (inp) inp.classList.remove('form-input--invalid'); };
        const clearAllErrors = (formId) => { const f = select(formId); if (!f) return; f.querySelectorAll('.form-error').forEach((e) => e.textContent = ''); f.querySelectorAll('.form-input--invalid').forEach(e => e.classList.remove('form-input--invalid')); };
        const animateCountUp = (el, end, duration = 700, formatAsCurrency = true, prefix = '', suffix = '') => {
            if (!el) return;
            const start = parseFloat(el.dataset.currentValue || '0');
            const endValue = end / 100;
            if (start === endValue || !el.offsetParent) { el.textContent = formatAsCurrency ? formatCurrency(end) : `${prefix}${end}${suffix}`; el.dataset.currentValue = String(endValue); return; }
            el.dataset.currentValue = String(endValue); let startTime = null;
            const step = (timestamp) => { if (!startTime) startTime = timestamp; const p = Math.min((timestamp - startTime) / duration, 1); const current = p * (end - start*100) + start*100; el.textContent = formatAsCurrency ? formatCurrency(current) : `${prefix}${current.toFixed(2)}${suffix}`; if (p < 1) requestAnimationFrame(step); else el.textContent = formatAsCurrency ? formatCurrency(end) : `${prefix}${end/100}${suffix}`; };
            requestAnimationFrame(step);
        };
        const escapeHTML = str => (str || '').replace(/[&<>"']/g, match => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[match]);
        
        const parseCurrencyString = (str) => {
            if (typeof str !== 'string' || !str.trim()) return NaN;
            
            let cleanStr = str.replace(/[€$£\s]/g, '');

            const hasComma = cleanStr.includes(',');
            const hasPeriod = cleanStr.includes('.');

            if (hasComma && hasPeriod) {
                if (cleanStr.lastIndexOf(',') > cleanStr.lastIndexOf('.')) {
                    cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
                } else {
                    cleanStr = cleanStr.replace(/,/g, '');
                }
            } else if (hasComma) {
                cleanStr = cleanStr.replace(',', '.');
            }
            
            return parseFloat(cleanStr);
        };
		const formatAsCurrencyInput = (num) => {
    if (isNaN(num)) return '';
    // Usamos Intl.NumberFormat que es la forma moderna y correcta de hacerlo.
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true // ¡Esta es la opción clave!
    }).format(num);
};
		const showPinScreen = (user) => {
            currentUser = user;
            const pinScreen = select('pin-login-screen');
            const loginScreen = select('login-screen');
            const appRoot = select('app-root');

            if (appRoot) appRoot.classList.remove('app-layout--visible');
            if (loginScreen) loginScreen.classList.remove('login-view--visible');
            if (pinScreen) pinScreen.classList.add('login-view--visible');
            
            const pinInputs = selectAll('#pin-inputs-container .pin-input');
            pinInputs.forEach(input => input.value = '');
            (select('pin-error')).textContent = '';
            if (pinInputs.length > 0) pinInputs[0].focus();
        };

        const handlePinSubmit = async () => {
            const pinInputs = selectAll('#pin-inputs-container .pin-input');
            const pin = Array.from(pinInputs).map(input => input.value).join('');
            const errorEl = select('pin-error');
            
            if (pin.length !== 4) {
                errorEl.textContent = 'El PIN debe tener 4 dígitos.';
                return;
            }

            const storedHash = localStorage.getItem('pinUserHash');
            const isValid = await verifyPin(pin, storedHash);

            if (isValid) {
                hapticFeedback('success');
                loadCoreData(currentUser.uid);
            } else {
                hapticFeedback('error');
                errorEl.textContent = 'PIN incorrecto. Inténtalo de nuevo.';
                pinInputs.forEach(input => input.value = '');
                pinInputs[0].focus();
            }
        };
    const handleKpiDrilldown = async (kpiButton) => {
    const type = kpiButton.dataset.type;
    if (!type) return;

    hapticFeedback('light');
    showGenericModal('Cargando detalles...', `<div style="text-align:center; padding: var(--sp-5);"><span class="spinner"></span></div>`);

    const { current } = await getFilteredMovements(false);
    
    let movementsToShow = [];
    let modalTitle = '';

    switch (type) {
        case 'ingresos':
            modalTitle = 'Ingresos del Periodo';
            movementsToShow = current.filter(m => calculateMovementAmount(m, new Set(getVisibleAccounts().map(c => c.id))) > 0);
            break;
        case 'gastos':
            modalTitle = 'Gastos del Periodo';
            movementsToShow = current.filter(m => calculateMovementAmount(m, new Set(getVisibleAccounts().map(c => c.id))) < 0);
            break;
        case 'saldoNeto':
            modalTitle = 'Todos los Movimientos del Periodo';
            movementsToShow = current;
            break;
        default:
            hideModal('generic-modal');
            return;
    }

    // ¡USAMOS NUESTRA FUNCIÓN MAESTRA OTRA VEZ!
    if (movementsToShow.length > 0) {
        recalculateAndApplyRunningBalances(movementsToShow, db.cuentas);
    }

    // Y ahora llamamos a la función que muestra la lista.
    showDrillDownModal(modalTitle, movementsToShow);
};
        const handlePinInputInteraction = () => {
            const inputs = Array.from(selectAll('#pin-inputs-container .pin-input'));
            inputs.forEach((input, index) => {
                input.addEventListener('keydown', (e) => {
                    if (e.key >= 0 && e.key <= 9) {
                        inputs[index].value = '';
                        setTimeout(() => {
                           if (index < inputs.length - 1) {
                                inputs[index + 1].focus();
                           } else {
                               handlePinSubmit();
                           }
                        }, 10);
                    } else if (e.key === 'Backspace') {
                        if (index > 0) {
                            setTimeout(() => inputs[index - 1].focus(), 10);
                        }
                    }
                });
            });
        };
    const initApp = async () => {
    // Esta es la función que realmente carga el resto de la aplicación.
    const procederConCargaDeApp = () => {
        document.documentElement.lang = 'es';
        setupTheme();
        const savedTheme = localStorage.getItem('appTheme') || 'default';
        document.body.dataset.theme = savedTheme;
        updateThemeIcon();
        attachEventListeners();
        checkAuthState(); // ¡La llamada clave está aquí!
    };

    // LLAMAMOS DIRECTAMENTE A LA CARGA DE LA APP, IGNORANDO EL VÍDEO
    procederConCargaDeApp();
};

		window.addEventListener('online', () => {
    console.log("Conexión recuperada. Sincronizando...");
    syncState = 'syncing';
    updateSyncStatusIcon();
    setTimeout(() => {
        syncState = 'synced';
        updateSyncStatusIcon();
    }, 2500);
});

window.addEventListener('offline', () => {
    console.log("Se ha perdido la conexión.");
    syncState = 'error';
    updateSyncStatusIcon();
});
    const startMainApp = async () => {
            const loginScreen = select('login-screen');
            const pinLoginScreen = select('pin-login-screen');
            const appRoot = select('app-root');

            if (loginScreen) loginScreen.classList.remove('login-view--visible');
            if (pinLoginScreen) pinLoginScreen.classList.remove('login-view--visible');
            if (appRoot) appRoot.classList.add('app-layout--visible');
            
            populateAllDropdowns();
            loadConfig();
            
            measureListItemHeights();
            
            updateSyncStatusIcon();
            buildIntelligentIndex();
			navigateTo(PAGE_IDS.DIARIO, true); // <-- CAMBIADO
            updateThemeIcon(localStorage.getItem('appTheme') || 'default');
            isInitialLoadComplete = true;
			};

        
    const showLoginScreen = () => {
        const loginScreen = select('login-screen');
        const pinLoginScreen = select('pin-login-screen');
        const appRoot = select('app-root');
        if (appRoot) appRoot.classList.remove('app-layout--visible');
        if (pinLoginScreen) pinLoginScreen.classList.remove('login-view--visible');
        if (loginScreen) loginScreen.classList.add('login-view--visible');
    };
	
    const showPasswordFallback = () => {
    hapticFeedback('light');
    const pinScreen = select('pin-login-screen');
    if (!pinScreen) return;

    pinScreen.querySelector('.pin-inputs').classList.add('hidden');
    pinScreen.querySelector('[data-action="use-password-instead"]').parentElement.classList.add('hidden');
    
    pinScreen.querySelector('.login-view__tagline').textContent = 'Introduce tu contraseña para continuar.';
    
    const form = pinScreen.querySelector('form');
    const passwordContainer = document.createElement('div');
    passwordContainer.innerHTML = `
        <div class="form-group form-group--with-icon" style="margin-top: 1.5rem;">
            <span class="material-icons">lock</span>
            <input type="password" id="pin-fallback-password" class="form-input" placeholder="Contraseña" required>
        </div>
        <button type="submit" class="btn btn--primary btn--full" style="margin-top: 1rem;">Verificar</button>
    `;
    form.appendChild(passwordContainer);
    select('pin-fallback-password').focus();

    form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        setButtonLoading(btn, true);

        const password = select('pin-fallback-password').value;
        const errorEl = select('pin-error');
        errorEl.textContent = '';

        try {
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
            await currentUser.reauthenticateWithCredential(credential);
            
            startMainApp(); 

        } catch (error) {
            errorEl.textContent = 'Contraseña incorrecta.';
            hapticFeedback('error');
        } finally {
            setButtonLoading(btn, false);
        }
    };
};
         
        const handleLogin = (btn) => {
            const email = (select('login-email')).value.trim(), password = (select('login-password')).value, errEl = select('login-error'); clearAllErrors('login-form'); if(errEl) errEl.textContent = ''; let v = true;
            if (!email) { displayError('login-email', 'El correo es obligatorio.'); v = false; }
            if (!password) { displayError('login-password', 'La contraseña es obligatoria.'); v = false; }
            if (!v) return; setButtonLoading(btn, true, 'Iniciando...');
            fbAuth.signInWithEmailAndPassword(email, password).then(() => showToast(`¡Bienvenido/a de nuevo!`)).catch((err) => { setButtonLoading(btn, false); if (['auth/wrong-password', 'auth/user-not-found', 'auth/invalid-credential'].includes(err.code)) (errEl).textContent = 'Error: Credenciales incorrectas.'; else if (err.code === 'auth/invalid-email') displayError('login-email', 'Formato de correo no válido.'); else (errEl).textContent = 'Error al iniciar sesión.'; });
        };
        const handleRegister = (btn) => {
            const email = (select('login-email')).value.trim(), password = (select('login-password')).value, errEl = select('login-error'); clearAllErrors('login-form'); if(errEl) errEl.textContent = ''; let v = true;
            if (!email) { displayError('login-email', 'El correo es obligatorio.'); v = false; }
            if (password.length < 6) { displayError('login-password', 'La contraseña debe tener al menos 6 caracteres.'); v = false; }
            if (!v) return; setButtonLoading(btn, true, 'Registrando...');
            fbAuth.createUserWithEmailAndPassword(email, password).then(() => showToast(`¡Registro completado!`)).catch((err) => { setButtonLoading(btn, false); if (err.code == 'auth/weak-password') displayError('login-password', 'La contraseña debe tener al menos 6 caracteres.'); else if (err.code == 'auth/email-already-in-use') displayError('login-email', 'El correo ya está registrado.'); else if (err.code === 'auth/invalid-email') displayError('login-email', 'Formato de correo no válido.'); else (errEl).textContent = 'Error en el registro.'; });
        };
        const handleExitApp = () => {
            const exitScreen = select('exit-screen');
            const appRoot = select('app-root');

            if (exitScreen) {
                exitScreen.style.display = 'flex';
                setTimeout(() => exitScreen.style.opacity = '1', 50);

                if (isInitialLoadComplete && appRoot) {
                    appRoot.classList.add('app-layout--transformed-by-modal');
                }
            }
        };
        const destroyAllCharts = () => {
    const charts = [
        conceptosChart, liquidAssetsChart, detailInvestmentChart, informesChart,
        assetAllocationChart, budgetTrendChart, netWorthChart, informeActivoChart, informeChart
    ];

    for (let i = 0; i < charts.length; i++) {
        if (charts[i]) {
            charts[i].destroy();
            // Sobrescribimos la variable global para asegurarnos de que se limpia.
            switch (i) {
                case 0: conceptosChart = null; break;
                case 1: liquidAssetsChart = null; break;
                case 2: detailInvestmentChart = null; break;
                case 3: informesChart = null; break;
                case 4: assetAllocationChart = null; break;
                case 5: budgetTrendChart = null; break;
                case 6: netWorthChart = null; break;
                case 7: informeActivoChart = null; break;
                case 8: informeChart = null; break;
            }
        }
    }
};

// EN main.js - REEMPLAZA TU FUNCIÓN navigateTo POR ESTA VERSIÓN
const navigateTo = async (pageId, isInitial = false) => {
    const oldView = document.querySelector('.view--active');
    const newView = select(pageId);
    const mainScroller = selectOne('.app-layout__main');

    // Guardar la posición del scroll de la vista anterior
    if (oldView && mainScroller) {
        pageScrollPositions[oldView.id] = mainScroller.scrollTop;
    }

    if (!newView || (oldView && oldView.id === pageId)) return;
    
    // --- LÓGICA DE CARGA DE VISTAS CORREGIDA ---
    // Ya no se intenta hacer 'fetch' de archivos HTML. La función de renderizado se encargará de todo.

    destroyAllCharts();

    if (!isInitial) hapticFeedback('light');

    if (!isInitial && window.history.state?.page !== pageId) {
        history.pushState({ page: pageId }, '', `#${pageId}`);
    }

    const navItems = Array.from(selectAll('.bottom-nav__item'));
    const oldIndex = oldView ? navItems.findIndex(item => item.dataset.page === oldView.id) : -1;
    const newIndex = navItems.findIndex(item => item.dataset.page === newView.id);
    const isForward = newIndex > oldIndex;

    const actionsEl = select('top-bar-actions');
    const leftEl = select('top-bar-left-button');
    const fab = select('fab-add-movimiento'); // Asumiendo que pudieras tener un FAB
    
    const standardActions = `
        <button data-action="global-search" class="icon-btn" title="Búsqueda Global (Cmd/Ctrl+K)" aria-label="Búsqueda Global">
            <span class="material-icons">search</span>
        </button>
        <button id="theme-toggle-btn" data-action="toggle-theme" class="icon-btn" title="Cambiar Tema" aria-label="Cambiar Tema">
            <span class="material-icons">dark_mode</span>
        </button>
        <button data-action="show-main-menu" class="icon-btn" title="Más opciones" aria-label="Mostrar más opciones">
            <span class="material-icons">more_vert</span>
        </button>
    `;
    
    // Lazy loading de datos si es necesario
    if (pageId === PAGE_IDS.PLANIFICAR && !dataLoaded.presupuestos) await loadPresupuestos();
    if (pageId === PAGE_IDS.INVERSIONES && !dataLoaded.inversiones) await loadInversiones();

    const pageRenderers = {
        [PAGE_IDS.INICIO]: { title: 'Panel', render: renderInicioPage, actions: standardActions },
        [PAGE_IDS.DIARIO]: { title: 'Diario', render: renderDiarioPage, actions: standardActions },
        [PAGE_IDS.INVERSIONES]: { title: 'Inversiones', render: renderInversionesView, actions: standardActions },
        [PAGE_IDS.PLANIFICAR]: { title: 'Planificar', render: renderPlanificacionPage, actions: standardActions },
        [PAGE_IDS.AJUSTES]: { title: 'Ajustes', render: renderAjustesPage, actions: standardActions },
    };

    if (pageRenderers[pageId]) { 
        if (leftEl) {
            let leftSideHTML = `<button id="ledger-toggle-btn" class="btn btn--secondary" data-action="toggle-ledger" title="Cambiar a Contabilidad ${isOffBalanceMode ? 'A' : 'B'}"> ${isOffBalanceMode ? 'B' : 'A'}</button><span id="page-title-display">${pageRenderers[pageId].title}</span>`;
            if (pageId === PAGE_IDS.INICIO) leftSideHTML += `<button data-action="configure-dashboard" class="icon-btn" title="Personalizar qué se ve en el Panel" style="margin-left: 8px;"><span class="material-icons">dashboard_customize</span></button>`;
            if (pageId === PAGE_IDS.DIARIO) {
                leftSideHTML += `
                    <button data-action="show-diario-filters" class="icon-btn" title="Filtrar y Buscar" style="margin-left: 8px;">
                        <span class="material-icons">filter_list</span>
                    </button>
                    <button data-action="toggle-diario-view" class="icon-btn" title="Cambiar Vista">
                        <span class="material-icons">${diarioViewMode === 'list' ? 'calendar_month' : 'list'}</span>
                    </button>
                `;
            }
            leftEl.innerHTML = leftSideHTML;
        }

        if (actionsEl) actionsEl.innerHTML = pageRenderers[pageId].actions;
        
        // --- LLAMADA DIRECTA A LA FUNCIÓN DE RENDERIZADO ---
        // Este es el cambio clave. Ahora llamamos a la función JS que genera el HTML.
        await pageRenderers[pageId].render();
    }
    
    selectAll('.bottom-nav__item').forEach(b => b.classList.toggle('bottom-nav__item--active', b.dataset.page === newView.id));
    if (fab) fab.classList.toggle('fab--visible', true);
    updateThemeIcon();
    
    newView.classList.add('view--active'); 
    
    if (oldView && !isInitial) {
        const outClass = isForward ? 'view-transition-out-forward' : 'view-transition-out-backward';
        const inClass = isForward ? 'view-transition-in-forward' : 'view-transition-in-backward';

        newView.classList.add(inClass);
        oldView.classList.add(outClass);

        oldView.addEventListener('animationend', () => {
            oldView.classList.remove('view--active', outClass);
            newView.classList.remove(inClass);
        }, { once: true });

    } else if (oldView) {
        oldView.classList.remove('view--active');
    }

    // Restaurar posición de scroll de la nueva vista
    if (mainScroller) {
        mainScroller.scrollTop = pageScrollPositions[pageId] || 0;
    }

    if (pageId === PAGE_IDS.INICIO) {
        // En lugar de llamar directamente a la actualización (que puede ser pesada),
        // usamos el sistema inteligente que ya tienes para que no se solape.
        scheduleDashboardUpdate();
    }
};
        
    const setupTheme = () => { 
    const gridColor = 'rgba(255, 255, 255, 0.1)';
    const textColor = '#FFFFFF';
    Chart.defaults.color = textColor; 
    Chart.defaults.borderColor = gridColor;
    Chart.register(ChartDataLabels);
};
        
    const buildIntelligentIndex = (movementsSource = db.movimientos) => {
    intelligentIndex.clear(); 
    if (!movementsSource || movementsSource.length === 0) return;

    const visibleAccounts = getVisibleAccounts().map(c => c.id);
    const tempIndex = new Map();

    const movementsToIndex = [...movementsSource]
        .filter(mov => mov.tipo === 'movimiento' && visibleAccounts.includes(mov.cuentaId)) // Filtramos solo por el ledger activo
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Ordenamos por fecha

    for (const mov of movementsToIndex) {
        const desc = mov.descripcion.trim().toLowerCase();
        if (desc.length > 3) {
            const key = desc;
            if (!tempIndex.has(key)) {
                tempIndex.set(key, {
                    conceptoId: mov.conceptoId,
                    cuentaId: mov.cuentaId,
                    count: 0, // Reiniciamos el contador
                    lastUsed: 0
                });
            }
            const entry = tempIndex.get(key);
            entry.conceptoId = mov.conceptoId; 
            entry.cuentaId = mov.cuentaId;
            entry.count++; 
            entry.lastUsed = new Date(mov.fecha).getTime();
        }
    }
    
    intelligentIndex = tempIndex;
    console.log(`Índice inteligente MEJORADO con ${intelligentIndex.size} entradas.`);
};
		
		
// =================================================================
// === BLOQUE DE FUNCIONES DE CUENTAS (CORREGIDO Y UNIFICADO) ===
// =================================================================

/**
 * REVISADO Y ÚNICO: Obtiene únicamente las cuentas activas para la contabilidad actual (A o B).
 * Esta es la función MÁS IMPORTANTE para el filtrado.
 */
const getVisibleAccounts = () => (db.cuentas || []).filter(c => !!c.offBalance === isOffBalanceMode);

/**
 * Obtiene las cuentas líquidas de la contabilidad visible actual.
 */
const getLiquidAccounts = () => getVisibleAccounts().filter((c) => !['PROPIEDAD', 'PRÉSTAMO'].includes((c.tipo || '').trim().toUpperCase()));

/**
 * Obtiene los saldos de TODAS las cuentas, sin importar la contabilidad.
 * Es usado por el sistema de cálculo de saldos acumulados.
 */
const getAllSaldos = () => {
    const saldos = {};
    (db.cuentas || []).forEach(cuenta => {
        saldos[cuenta.id] = cuenta.saldo || 0;
    });
    return saldos;
};
        async function fetchAllMovementsForBalances() {
            if (!currentUser) return [];
            const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        const fetchAllMovementsForSearch = async () => {
            if (!currentUser) return [];
            try {
                const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error("Error al obtener todos los movimientos para la búsqueda:", error);
                showToast("Error al realizar la búsqueda en la base de datos.", "danger");
                return [];
            }
        };
        const getSaldos = async () => {
            const visibleAccounts = getVisibleAccounts();
            const saldos = {};
            visibleAccounts.forEach(cuenta => {
                saldos[cuenta.id] = cuenta.saldo || 0;
            });
            return saldos;
        };
		
	const fetchAllMovementsForHistory = async () => {
    if (!currentUser) return [];
    try {
        const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al obtener el historial completo de movimientos:", error);
        showToast("Error al cargar el historial para el gráfico de patrimonio.", "danger");
        return [];
    }
};
		
        
const getFilteredMovements = async (forComparison = false) => {
    // 1. OBTENER FECHAS DEL FILTRO (esto no cambia)
    const filterPeriodo = select('filter-periodo');
    const p = filterPeriodo ? filterPeriodo.value : 'mes-actual';
    let sDate, eDate, prevSDate, prevEDate;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (p) {
        case 'mes-actual':
            sDate = new Date(now.getFullYear(), now.getMonth(), 1);
            eDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            prevSDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            prevEDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            break;
        case 'año-actual':
            sDate = new Date(now.getFullYear(), 0, 1);
            eDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            prevSDate = new Date(now.getFullYear() - 1, 0, 1);
            prevEDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
            break;
        case 'custom':
            const filterFechaInicio = select('filter-fecha-inicio');
            const filterFechaFin = select('filter-fecha-fin');
            sDate = filterFechaInicio?.value ? parseDateStringAsUTC(filterFechaInicio.value) : null;
            eDate = filterFechaFin?.value ? parseDateStringAsUTC(filterFechaFin.value) : null;
            if(eDate) eDate.setUTCHours(23, 59, 59, 999);
            // Para el modo 'custom', no calculamos periodo previo.
            prevSDate = null; prevEDate = null; 
            break;
        default:
            return { current: [], previous: [], label: '' };
    }

    if (!sDate || !eDate) return { current: [], previous: [], label: '' };

    // 2. ¡LA MAGIA! CONSULTAR A LA BASE DE DATOS DIRECTAMENTE
    const fetchMovementsForRange = async (start, end) => {
        if (!start || !end) return [];

        const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos')
            .where('fecha', '>=', start.toISOString())
            .where('fecha', '<=', end.toISOString())
            .get();
        return snapshot.docs.map(doc => doc.data());
    };

    // 3. OBTENER Y FILTRAR LOS MOVIMIENTOS
    const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));
    
    // Función interna para filtrar por contabilidad (A o B)
    const filterByLedger = (movs) => movs.filter(m => {
        if (m.tipo === 'traspaso') {
            return visibleAccountIds.has(m.cuentaOrigenId) || visibleAccountIds.has(m.cuentaDestinoId);
        }
        return visibleAccountIds.has(m.cuentaId);
    });

    const currentMovsRaw = await fetchMovementsForRange(sDate, eDate);
    const currentMovs = filterByLedger(currentMovsRaw);

    if (!forComparison) return { current: currentMovs, previous: [], label: '' };
    
    const prevMovsRaw = await fetchMovementsForRange(prevSDate, prevEDate);
    const prevMovs = filterByLedger(prevMovsRaw);

    const comparisonLabel = p === 'mes-actual' ? 'vs mes ant.' : (p === 'año-actual' ? 'vs año ant.' : '');
    
    return { current: currentMovs, previous: prevMovs, label: comparisonLabel };
};
        
        const calculateIRR = (cashflows) => {
            if (cashflows.length < 2) return 0;
            const sortedCashflows = [...cashflows].sort((a, b) => a.date.getTime() - b.date.getTime());
            const firstDate = sortedCashflows[0].date;
            const npv = (rate) => { let total = 0; for (const flow of sortedCashflows) { const years = (flow.date.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000); total += flow.amount / Math.pow(1 + rate, years); } return total; };
            const derivative = (rate) => { let total = 0; for (const flow of sortedCashflows) { const years = (flow.date.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000); if (years > 0) { total -= years * flow.amount / Math.pow(1 + rate, years + 1); } } return total; };
            let guess = 0.1; const maxIterations = 100; const tolerance = 1e-7;
            for (let i = 0; i < maxIterations; i++) {
                const npvValue = npv(guess); const derivativeValue = derivative(guess); if (Math.abs(derivativeValue) < tolerance) break; const newGuess = guess - npvValue / derivativeValue; if (Math.abs(newGuess - guess) <= tolerance) { return newGuess; } guess = newGuess; }
            return 0;
        };
		
// =========================================================================================
// === VERSIÓN FINAL: P&L basado en Saldo Contable y TIR basada en CADA movimiento        ===
// =========================================================================================
const calculatePortfolioPerformance = async (cuentaId = null) => {
    if (!dataLoaded.inversiones) await loadInversiones();

    const allInvestmentAccounts = getVisibleAccounts().filter(c => c.esInversion);
    const investmentAccounts = cuentaId ? allInvestmentAccounts.filter(c => c.id === cuentaId) : allInvestmentAccounts;
    
    if (investmentAccounts.length === 0) {
        return { valorActual: 0, capitalInvertido: 0, pnlAbsoluto: 0, pnlPorcentual: 0, irr: 0 };
    }

    const allMovements = await fetchAllMovementsForHistory();

    let totalValorActual = 0;
    let totalCapitalInvertido_para_PNL = 0;
    let allIrrCashflows = [];

    for (const cuenta of investmentAccounts) {
        // --- PARTE 1: LÓGICA PARA P&L (BASADO EN SALDO CONTABLE) ---

        // 1. Obtenemos el valor de mercado actual desde la valoración manual.
        const valoraciones = (db.inversiones_historial || [])
            .filter(v => v.cuentaId === cuenta.id)
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        const valorActual = valoraciones.length > 0 ? valoraciones[0].valor : 0;
        
        // 2. PREMISA DEL USUARIO: El "Capital Aportado" es exactamente el saldo contable.
        const capitalInvertido_para_PNL = cuenta.saldo || 0;
        
        totalValorActual += valorActual;
        totalCapitalInvertido_para_PNL += capitalInvertido_para_PNL;

        // --- PARTE 2: LÓGICA PARA TIR (BASADA EN CADA MOVIMIENTO INDIVIDUAL) ---
        
        const accountMovements = allMovements.filter(m => 
            (m.tipo === 'movimiento' && m.cuentaId === cuenta.id) ||
            (m.tipo === 'traspaso' && (m.cuentaDestinoId === cuenta.id || m.cuentaOrigenId === cuenta.id))
        );

        // 3. PREMISA DEL USUARIO: Convertimos CADA movimiento en un flujo de caja para la TIR.
        const irrCashflows = accountMovements
            .map(mov => {
                let effectOnAccount = 0;

                // Determinamos el efecto real del movimiento sobre el saldo de ESTA cuenta.
                if (mov.tipo === 'movimiento') {
                    effectOnAccount = mov.cantidad;
                } else if (mov.tipo === 'traspaso') {
                    if (mov.cuentaDestinoId === cuenta.id) {
                        effectOnAccount = mov.cantidad; // Entra dinero a la cuenta
                    } else if (mov.cuentaOrigenId === cuenta.id) {
                        effectOnAccount = -mov.cantidad; // Sale dinero de la cuenta
                    }
                }
                
                // Si el movimiento afectó a la cuenta, lo convertimos en un flujo de caja.
                if (effectOnAccount !== 0) {
                    // PREMISA DEL USUARIO:
                    // - Si es una entrada (effectOnAccount > 0), es una "aportación" -> Flujo de caja NEGATIVO.
                    // - Si es una salida (effectOnAccount < 0), es una "retirada" -> Flujo de caja POSITIVO.
                    // Esto es matemáticamente equivalente a invertir el signo del efecto.
                    return { amount: -effectOnAccount, date: new Date(mov.fecha) };
                }
                
                return null; // Si no afectó, no es un flujo de caja.
            })
            .filter(cf => cf !== null); // Limpiamos los nulos

        // 4. El valor actual se añade como el último flujo de caja positivo (retirada final ficticia).
        if (valorActual !== 0) {
            irrCashflows.push({ amount: valorActual, date: new Date() });
        }
        allIrrCashflows.push(...irrCashflows);
    }

    // --- PARTE 3: CÁLCULOS FINALES ---

    // El P&L se calcula con tu lógica: Valoración - Saldo Contable.
    const pnlAbsoluto = totalValorActual - totalCapitalInvertido_para_PNL;
    const pnlPorcentual = totalCapitalInvertido_para_PNL !== 0 ? (pnlAbsoluto / totalCapitalInvertido_para_PNL) * 100 : 0;
    
    // La TIR se calcula con la lógica de flujos de caja que definiste.
    const irr = calculateIRR(allIrrCashflows);

    return { 
        valorActual: totalValorActual, 
        capitalInvertido: totalCapitalInvertido_para_PNL,
        pnlAbsoluto, 
        pnlPorcentual, 
        irr 
    };
};

    const recalculateAndApplyRunningBalances = (movements, allAccountsDb) => {
    // 1. Agrupamos los movimientos por cada cuenta afectada.
    const movementsByAccount = {};
    movements.forEach(mov => {
        if (mov.tipo === 'traspaso') {
            if (!movementsByAccount[mov.cuentaOrigenId]) movementsByAccount[mov.cuentaOrigenId] = [];
            if (!movementsByAccount[mov.cuentaDestinoId]) movementsByAccount[mov.cuentaDestinoId] = [];
            movementsByAccount[mov.cuentaOrigenId].push(mov);
            movementsByAccount[mov.cuentaDestinoId].push(mov);
        } else {
            if (!movementsByAccount[mov.cuentaId]) movementsByAccount[mov.cuentaId] = [];
            movementsByAccount[mov.cuentaId].push(mov);
        }
    });

    // 2. Para cada cuenta, calculamos su historial de saldos.
    for (const cuentaId in movementsByAccount) {
        const cuenta = allAccountsDb.find(c => c.id === cuentaId);
        if (!cuenta) continue; // Si la cuenta no existe, la ignoramos.

        // Nuestra "Verdad Absoluta": el saldo real y actual de la cuenta.
        let runningBalance = cuenta.saldo || 0;

        const accountMovements = movementsByAccount[cuentaId];
        
        // La ordenación infalible: primero por fecha/hora, luego por ID. El más reciente, primero.
        accountMovements.sort((a, b) => {
            const dateComparison = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
            if (dateComparison !== 0) return dateComparison;
            return b.id.localeCompare(a.id);
        });

        // 3. Recorremos los movimientos HACIA ATRÁS en el tiempo.
        for (const mov of accountMovements) {
            // Asignamos el saldo actual a la propiedad correcta.
            if (mov.tipo === 'traspaso') {
                if (mov.cuentaOrigenId === cuentaId) mov.runningBalanceOrigen = runningBalance;
                if (mov.cuentaDestinoId === cuentaId) mov.runningBalanceDestino = runningBalance;
            } else {
                mov.runningBalance = runningBalance;
            }

            // "Deshacemos" la operación para calcular el saldo ANTERIOR.
            if (mov.tipo === 'traspaso') {
                if (mov.cuentaOrigenId === cuentaId) runningBalance += mov.cantidad;
                if (mov.cuentaDestinoId === cuentaId) runningBalance -= mov.cantidad;
            } else {
                runningBalance -= mov.cantidad;
            }
        }
    }
};
             const processMovementsForRunningBalance = async (movements, forceRecalculate = false) => {
            if (!runningBalancesCache || forceRecalculate) {
                runningBalancesCache = getAllSaldos();
            }

            const sortedMovements = [...movements].sort((a, b) => {
        const dateComparison = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        if (dateComparison !== 0) return dateComparison;
        // El ID del documento como desempate final garantiza el orden.
        return b.id.localeCompare(a.id); 
    });

            for (const mov of sortedMovements) {
                if (mov.tipo === 'traspaso') {
                    if (!runningBalancesCache.hasOwnProperty(mov.cuentaOrigenId)) {
                        runningBalancesCache[mov.cuentaOrigenId] = 0;
                    }
                    if (!runningBalancesCache.hasOwnProperty(mov.cuentaDestinoId)) {
                        runningBalancesCache[mov.cuentaDestinoId] = 0;
                    }

                    mov.runningBalanceOrigen = runningBalancesCache[mov.cuentaOrigenId];
                    mov.runningBalanceDestino = runningBalancesCache[mov.cuentaDestinoId];

                    runningBalancesCache[mov.cuentaOrigenId] += mov.cantidad;
                    runningBalancesCache[mov.cuentaDestinoId] -= mov.cantidad;

                } else {
                    if (!runningBalancesCache.hasOwnProperty(mov.cuentaId)) {
                        runningBalancesCache[mov.cuentaId] = 0;
                    }

                    mov.runningBalance = runningBalancesCache[mov.cuentaId];
                    runningBalancesCache[mov.cuentaId] -= mov.cantidad;
                }
            }
        };
        
        const populateAllDropdowns = () => {
    
    // --- PARTE 1: Lógica original para rellenar los datos ---
    
    const visibleAccounts = getVisibleAccounts();
    
    // Función interna para poblar un <select> con datos.
    const populate = (id, data, nameKey, valKey = 'id', all = false, none = false) => {
        const el = select(id);
        if (!el) return;
        const currentVal = el.value;
        let opts = all ? '<option value="">Todos</option>' : '';
        if (none) opts += '<option value="">Ninguno</option>';
        
        [...data]
            .sort((a, b) => (a[nameKey] || "").localeCompare(b[nameKey] || ""))
            .forEach(i => opts += `<option value="${i[valKey]}">${i[nameKey]}</option>`);
        
        el.innerHTML = opts;
        const optionsArray = Array.from(el.options);
        el.value = optionsArray.some(o => o.value === currentVal) ? currentVal : (optionsArray.length > 0 ? optionsArray[0].value : "");
    };
    
    // Rellenamos los diferentes selects de la aplicación
    populate('movimiento-cuenta', visibleAccounts, 'nombre', 'id', false, true);
    populateTraspasoDropdowns();
    populate('filter-cuenta', visibleAccounts, 'nombre', 'id', true);
    populate('movimiento-concepto', db.conceptos, 'nombre', 'id', false, true);
    populate('filter-concepto', db.conceptos, 'nombre', 'id', true);
    
    // Lógica específica para el selector de año del presupuesto
    const budgetYearSelect = select('budget-year-selector');
    if (budgetYearSelect) {
        const currentVal = budgetYearSelect.value;
        const currentYear = new Date().getFullYear();
        let years = new Set([currentYear]);
        (db.presupuestos || []).forEach((p) => years.add(p.ano));
        budgetYearSelect.innerHTML = [...years].sort((a, b) => b - a).map(y => `<option value="${y}">${y}</option>`).join('');
        if (currentVal && [...years].some(y => y == parseInt(currentVal))) {
            budgetYearSelect.value = currentVal;
        } else {
            budgetYearSelect.value = String(currentYear);
        }
    }

    // --- PARTE 2: Aplicar el estilo personalizado a los selects del formulario ---
    
    // Se ejecuta en un timeout para asegurar que el DOM ha sido actualizado por la lógica anterior.
    setTimeout(() => {
        // Buscamos los selects por su ID y los transformamos en el componente personalizado.
        const conceptoSelect = select('movimiento-concepto');
        const cuentaSelect = select('movimiento-cuenta');
        const origenSelect = select('movimiento-cuenta-origen');
        const destinoSelect = select('movimiento-cuenta-destino');

        if (conceptoSelect) createCustomSelect(conceptoSelect);
        if (cuentaSelect) createCustomSelect(cuentaSelect);
        if (origenSelect) createCustomSelect(origenSelect);
        if (destinoSelect) createCustomSelect(destinoSelect);
    }, 0);
};

        const populateTraspasoDropdowns = () => {
            const traspasoToggle = select('traspaso-show-all-accounts-toggle');
            const showAll = traspasoToggle ? traspasoToggle.checked : false;
            const accountsToList = showAll ? (db.cuentas || []) : getVisibleAccounts();
            
            const populate = (id, data, none = false) => {
                const el = select(id); if (!el) return;
                const currentVal = el.value;
                let opts = none ? '<option value="">Ninguno</option>' : '';
                data.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(i => opts += `<option value="${i.id}">${i.nombre}</option>`);
                el.innerHTML = opts;
                const optionsArray = Array.from(el.options);
                if (optionsArray.some(o => o.value === currentVal)) {
                    el.value = currentVal;
                } else {
                    el.value = optionsArray.length > 0 ? optionsArray[0].value : "";
                }
            };

            populate('movimiento-cuenta-origen', accountsToList, true);
            populate('movimiento-cuenta-destino', accountsToList, true);
        };
        
               
        const handleUpdateBudgets = () => {
    hapticFeedback('light');

    const initialHtml = `
        <div class="form-group" style="margin-bottom: var(--sp-4);">
            <label for="budget-year-selector-modal" class="form-label">Selecciona el año para gestionar:</label>
            <select id="budget-year-selector-modal" class="form-select"></select>
        </div>
        <div id="budgets-form-container">
            <div class="empty-state" style="background:transparent; border:none; padding-top:0;">
                <p>Selecciona un año para empezar.</p>
            </div>
        </div>`;
    showGenericModal('Gestionar Presupuestos Anuales', initialHtml);

    const renderYearForm = (year) => {
        const container = select('budgets-form-container');
        if (!container) return;

        const budgetsForYear = (db.presupuestos || []).filter(p => p.ano === year);
        const conceptsWithBudget = new Set(budgetsForYear.map(b => b.conceptoId));

        let formHtml = `<form id="update-budgets-form" novalidate>
            <p class="form-label" style="margin-bottom: var(--sp-3)">
                Introduce el límite anual. Usa <b>valores positivos para metas de ingreso</b> y <b>valores negativos para límites de gasto</b>. Deja en blanco o en 0 si no quieres presupuestar un concepto.
            </p>
            <div style="max-height: 45vh; overflow-y: auto; padding-right: var(--sp-2);">`;

        db.conceptos
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .forEach(c => {
                const budget = budgetsForYear.find(b => b.ano === year && b.conceptoId === c.id);
                const currentAmount = budget ? (budget.cantidad / 100).toFixed(2).replace('.', ',') : '';
                const placeholder = conceptsWithBudget.has(c.id) ? '' : '0,00';
                formHtml += `
                    <div class="form-group">
                        <label for="budget-input-${c.id}" class="form-label" style="font-weight: 600;">${c.nombre}</label>
                        <input type="text" id="budget-input-${c.id}" data-concept-id="${c.id}" class="form-input" inputmode="decimal" value="${currentAmount}" placeholder="${placeholder}">
                    </div>`;
            });
        
        formHtml += `</div><div class="modal__actions"><button type="submit" class="btn btn--primary btn--full">Guardar Cambios para ${year}</button></div></form>`;
        container.innerHTML = formHtml;
        
        const updateBudgetsForm = select('update-budgets-form');
        if (updateBudgetsForm) {
            updateBudgetsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                setButtonLoading(btn, true, 'Guardando...');

                const inputs = e.target.querySelectorAll('input[data-concept-id]');
                const batch = fbDb.batch();

                for (const input of inputs) {
                    const conceptoId = input.dataset.conceptId;
                    const amountValue = parseCurrencyString(input.value);
                    
                    if (isNaN(amountValue)) continue;

                    const newAmountInCentimos = Math.round(amountValue * 100);
                    let budget = (db.presupuestos || []).find(b => b.ano === year && b.conceptoId === conceptoId);
                    
                    if (budget) {
                        const ref = fbDb.collection('users').doc(currentUser.uid).collection('presupuestos').doc(budget.id);
                        if (newAmountInCentimos !== 0) {
                            batch.update(ref, { cantidad: newAmountInCentimos });
                        } else {
                            batch.delete(ref);
                        }
                    } else if (newAmountInCentimos !== 0) {
                        const newId = generateId();
                        const ref = fbDb.collection('users').doc(currentUser.uid).collection('presupuestos').doc(newId);
                        batch.set(ref, { id: newId, ano: year, conceptoId: conceptoId, cantidad: newAmountInCentimos });
                    }
                }

                await batch.commit();
                setButtonLoading(btn, false);
                hideModal('generic-modal');
                hapticFeedback('success');
                showToast(`Presupuestos de ${year} actualizados.`);
                
                renderBudgetTracking(); 
            });
        }
    };

    setTimeout(() => {
        const yearSelect = select('budget-year-selector-modal');
        if (!yearSelect) return;
        
        const currentYear = new Date().getFullYear();
        let years = new Set([currentYear, currentYear + 1]);
        (db.presupuestos || []).forEach(p => years.add(p.ano));
        
        yearSelect.innerHTML = `<option value="">Seleccionar...</option>` + 
            [...years].sort((a, b) => b - a).map(y => `<option value="${y}">${y}</option>`).join('');
        
        yearSelect.addEventListener('change', (e) => {
            const selectedYear = parseInt(e.target.value, 10);
            if (selectedYear) {
                renderYearForm(selectedYear);
            } else {
                const container = select('budgets-form-container');
                if (container) container.innerHTML = `<div class="empty-state" style="background:transparent; border:none; padding-top:0;"><p>Selecciona un año para empezar.</p></div>`;
            }
        });
    }, 0);
};
        

const renderBudgetTracking = async () => {
    const dashboardContainer = select('annual-budget-dashboard');
    const placeholder = select('budget-init-placeholder');
    const yearSelector = select('budget-year-selector');
    if (!dashboardContainer || !placeholder || !yearSelector) return;
    
    const year = parseInt(yearSelector.value, 10);
    
    const allYearBudgets = (db.presupuestos || [])
        .filter(b => b.ano === year && db.conceptos.find(c => c.id === b.conceptoId));

    if (allYearBudgets.length === 0) {
        dashboardContainer.classList.add('hidden');
        placeholder.classList.remove('hidden');
        const titleEl = select('budget-placeholder-title');
        const textEl = select('budget-placeholder-text');
        if (titleEl) titleEl.textContent = `Configurar Presupuestos ${year}`;
        if (textEl) textEl.textContent = `Aún no has definido metas de ingreso o límites de gasto para el año ${year}.`;
        return;
    }
    
    dashboardContainer.classList.remove('hidden');
    placeholder.classList.add('hidden');

    const { percentage: yearProgress, daysPassed, daysRemaining, totalDaysInYear } = getYearProgress();
    
    // --- INICIO DE LA CORRECCIÓN CLAVE ---
    
    // 1. Definimos las fechas del año completo.
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    
    // 2. Creamos una consulta a Firestore MUCHO MÁS SIMPLE, solo por rango de fecha.
    //    Esta consulta SIEMPRE funcionará sin necesidad de índices complejos.
    const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos')
        .where('fecha', '>=', startDate.toISOString())
        .where('fecha', '<=', endDate.toISOString())
        .get();

    // 3. Obtenemos los IDs de las cuentas visibles para la contabilidad actual (A o B).
    const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));
    
    // 4. Filtramos los resultados EN JAVASCRIPT. Es más robusto y eficiente para esta cantidad de datos.
    const movements = snapshot.docs
        .map(doc => doc.data())
        .filter(mov => 
            mov.tipo === 'movimiento' &&       // Solo nos interesan ingresos y gastos, no traspasos.
            visibleAccountIds.has(mov.cuentaId) // Solo movimientos de la contabilidad activa.
        );
        
    // --- FIN DE LA CORRECCIÓN CLAVE ---

    // El resto de la función se mantiene EXACTAMENTE IGUAL, ya que la lógica de cálculo
    // que tenías a partir de aquí ya era correcta.
    
    const monthlyIncomeData = {};
    const monthlyExpenseData = {};
    movements.forEach(mov => {
        const month = new Date(mov.fecha).getMonth();
        if (mov.cantidad > 0) {
            monthlyIncomeData[month] = (monthlyIncomeData[month] || 0) + mov.cantidad;
        } else {
            monthlyExpenseData[month] = (monthlyExpenseData[month] || 0) + Math.abs(mov.cantidad);
        }
    });

    const expenseBudgets = allYearBudgets.filter(b => b.cantidad < 0);
    let totalBudgetedExpense = 0;
    const expenseDetails = expenseBudgets.map(budget => {
        const actualSpent = Math.abs(movements.filter(m => m.conceptoId === budget.conceptoId && m.cantidad < 0).reduce((sum, m) => sum + m.cantidad, 0));
        const budgetLimit = Math.abs(budget.cantidad);
        totalBudgetedExpense += budgetLimit;

        const rawPacePercentage = (budgetLimit > 0 && yearProgress > 0) ? ((actualSpent / budgetLimit) / (yearProgress / 100)) * 100 : (actualSpent > 0 ? 200 : 100);
        const pacePercentage = Math.min(rawPacePercentage, 200);

        let status;
        if (rawPacePercentage > 120) {
            status = { text: 'Excedido', icon: 'cancel', color: 'text-danger' };
        } else if (rawPacePercentage >= 80) {
            status = { text: 'Vas bien', icon: 'check_circle', color: 'text-info' };
        } else {
            status = { text: 'Ahorrando', icon: 'verified', color: 'text-positive' };
        }

        const projectedAnnualSpent = (daysPassed > 0) ? (actualSpent / daysPassed) * totalDaysInYear : 0;
        return { ...budget, actual: actualSpent, limit: budgetLimit, projected: projectedAnnualSpent, pacePercentage, status };
    });
    const totalProjectedExpense = expenseDetails.reduce((sum, b) => sum + b.projected, 0);

    const incomeBudgets = allYearBudgets.filter(b => b.cantidad >= 0);
    let totalBudgetedIncome = 0;
    const incomeDetails = incomeBudgets.map(budget => {
        const actualIncome = movements.filter(m => m.conceptoId === budget.conceptoId && m.cantidad > 0).reduce((sum, m) => sum + m.cantidad, 0);
        const budgetGoal = budget.cantidad;
        totalBudgetedIncome += budgetGoal;

        const rawPacePercentage = (budgetGoal > 0 && yearProgress > 0) ? ((actualIncome / budgetGoal) / (yearProgress / 100)) * 100 : (actualIncome > 0 ? 200 : 0);
        const pacePercentage = Math.min(rawPacePercentage, 200);

        let status;
        if (rawPacePercentage > 120) {
            status = { text: 'Superado', icon: 'rocket_launch', color: 'text-positive' };
        } else if (rawPacePercentage >= 80) {
            status = { text: 'Vas bien', icon: 'check_circle', color: 'text-info' };
        } else {
            status = { text: 'Por debajo del objetivo', icon: 'trending_down', color: 'text-warning' };
        }

        const projectedAnnualIncome = (daysPassed > 0) ? (actualIncome / daysPassed) * totalDaysInYear : 0;
        return { ...budget, actual: actualIncome, limit: budgetGoal, projected: projectedAnnualIncome, pacePercentage, status };
    });
    const totalProjectedIncome = incomeDetails.reduce((sum, b) => sum + b.projected, 0);

    const projectedNet = totalProjectedIncome - totalProjectedExpense;
    const kpiContainer = select('budget-kpi-container');
    if (kpiContainer) kpiContainer.innerHTML = `
        <div class="kpi-item"><h4 class="kpi-item__label">Proyección Ingresos</h4><strong class="kpi-item__value text-positive">${formatCurrency(totalProjectedIncome)}</strong></div>
        <div class="kpi-item"><h4 class="kpi-item__label">Proyección Gastos</h4><strong class="kpi-item__value text-negative">${formatCurrency(totalProjectedExpense)}</strong></div>
        <div class="kpi-item"><h4 class="kpi-item__label">Proyección Neta Anual</h4><strong class="kpi-item__value ${projectedNet >= 0 ? 'text-positive' : 'text-negative'}">${formatCurrency(projectedNet)}</strong></div>
    `;
    renderBudgetTrendChart(monthlyIncomeData, monthlyExpenseData, totalBudgetedExpense / 12);

    const listContainer = select('budget-details-list');
    let listHtml = '';

    if (incomeDetails.length > 0) {
        listHtml += `<h4 style="margin-top: var(--sp-5);">Metas de Ingresos</h4>`;
        listHtml += incomeDetails.sort((a, b) => (a.projected / (a.limit || 1)) - (b.projected / (b.limit || 1))).map(b => {
            const concepto = db.conceptos.find(c => c.id === b.conceptoId);
            const conceptoNombre = (concepto && concepto.nombre) || 'Concepto no encontrado';
            return `
            <div class="card" style="margin-bottom: var(--sp-3);"><div class="card__content" style="padding: var(--sp-3);">
                <div style="display: grid; grid-template-columns: 80px 1fr; gap: var(--sp-4); align-items: center;">
                    <div style="position: relative; width: 80px; height: 55px;"><canvas id="gauge-chart-${b.id}"></canvas><div style="position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-weight: 800; font-size: var(--fs-lg);">${b.pacePercentage.toFixed(0)}<span style="font-size: 0.7em;">%</span></div></div>
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--sp-2);"><h4 style="font-size: var(--fs-base); font-weight: 700;">${conceptoNombre}</h4><span class="${b.status.color}" style="font-weight: 600; font-size: var(--fs-xs); display:flex; align-items:center; gap: 4px;">
    <span class="material-icons" style="font-size: 14px;">${b.status.icon}</span>
    <span>${b.status.text}</span>
    <button class="icon-btn" data-action="show-help-topic" data-topic="pace" style="width: 18px; height: 18px; margin-left: 2px;">
        <span class="material-icons" style="font-size: 14px;">help_outline</span>
    </button>
</span>
                        <div style="font-size: var(--fs-sm);"><strong>Ingresado:</strong> ${formatCurrency(b.actual)} de ${formatCurrency(b.limit)}</div>
                        <div style="font-size: var(--fs-sm); font-weight: 600;"><strong>Proyección:</strong> <span class="${b.projected >= b.limit ? 'text-positive' : 'text-danger'}">${formatCurrency(b.projected)}</span></div>
                    </div>
                </div>
            </div></div>`;
        }).join('');
    }
    
    if (expenseDetails.length > 0) {
        listHtml += `<h4 style="margin-top: var(--sp-5);">Límites de Gasto</h4>`;
        listHtml += expenseDetails.sort((a, b) => (b.projected / (b.limit || 1)) - (a.projected / (a.limit || 1))).map(b => {
            const concepto = db.conceptos.find(c => c.id === b.conceptoId);
            const conceptoNombre = (concepto && concepto.nombre) || 'Concepto no encontrado';
            return `
            <div class="card" style="margin-bottom: var(--sp-3);"><div class="card__content" style="padding: var(--sp-3);">
                <div style="display: grid; grid-template-columns: 80px 1fr; gap: var(--sp-4); align-items: center;">
                    <div style="position: relative; width: 80px; height: 55px;"><canvas id="gauge-chart-${b.id}"></canvas><div style="position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-weight: 800; font-size: var(--fs-lg);">${b.pacePercentage.toFixed(0)}<span style="font-size: 0.7em;">%</span></div></div>
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--sp-2);"><h4 style="font-size: var(--fs-base); font-weight: 700;">${conceptoNombre}</h4><span class="${b.status.color}" style="font-weight: 600; font-size: var(--fs-xs); display:flex; align-items:center; gap: 4px;"><span class="material-icons" style="font-size: 14px;">${b.status.icon}</span> ${b.status.text}</span></div>
                        <div style="font-size: var(--fs-sm);"><strong>Gastado:</strong> ${formatCurrency(b.actual)} de ${formatCurrency(b.limit)}</div>
                        <div style="font-size: var(--fs-sm); font-weight: 600;"><strong>Proyección:</strong> <span class="${b.projected > b.limit ? 'text-danger' : 'text-positive'}">${formatCurrency(b.projected)}</span></div>
                    </div>
                </div>
            </div></div>`;
        }).join('');
    }
    
    if (listContainer) listContainer.innerHTML = listHtml;

    setTimeout(() => {
        [...incomeDetails, ...expenseDetails].forEach(b => {
            renderGaugeChart(`gauge-chart-${b.id}`, b.pacePercentage, 100);
        });
    }, 50);
};
	const handleToggleInvestmentTypeFilter = (type) => {
    hapticFeedback('light');
    if (deselectedInvestmentTypesFilter.has(type)) {
        deselectedInvestmentTypesFilter.delete(type);
    } else {
        deselectedInvestmentTypesFilter.add(type);
    }

    // LA SOLUCIÓN:
    // Ya no buscamos el contenedor, simplemente llamamos a la función de
    // renderizado con el ID correcto para la pestaña de Inversiones.
    renderInversionesView();
};

// ====================================================================================
// === PASO 2: REEMPLAZA ESTA FUNCIÓN COMPLETA - VERSIÓN CON ETIQUETAS CLARAS ===
// ====================================================================================

let investmentChartMode = 'valorado';

const renderPortfolioMainContent = async (targetContainerId) => {
    const container = select(targetContainerId);
    if (!container) return;

    const investmentAccounts = getVisibleAccounts().filter((c) => c.esInversion);
    const CHART_COLORS = ['#007AFF', '#30D158', '#FFD60A', '#FF3B30', '#C084FC', '#4ECDC4', '#EF626C', '#A8D58A'];

    if (investmentAccounts.length === 0) {
        container.innerHTML = `<div id="empty-investments" class="empty-state" style="margin-top: 0; border: none; background: transparent;">
                <span class="material-icons">rocket_launch</span>
                <h3>Tu Portafolio empieza aquí</h3>
                <p>Ve a 'Ajustes' > 'Cuentas' y marca una cuenta como 'de inversión' para empezar el seguimiento.</p>
                <button class="btn btn--primary" data-action="manage-investment-accounts" style="margin-top: var(--sp-4);">
                    <span class="material-icons" style="font-size: 16px;">checklist</span>
                    <span>Gestionar Activos</span>
                </button>
            </div>`;
        return;
    }

    const performanceData = await Promise.all(
        investmentAccounts.map(async (cuenta) => {
            const performance = await calculatePortfolioPerformance(cuenta.id);
            return { ...cuenta, ...performance };
        })
    );

    const allInvestmentTypes = [...new Set(performanceData.map(asset => toSentenceCase(asset.tipo || 'S/T')))].sort();
    const colorMap = {};
    allInvestmentTypes.forEach((label, index) => { colorMap[label] = CHART_COLORS[index % CHART_COLORS.length]; });

    const pillsHTML = allInvestmentTypes.map(t => {
        const isActive = !deselectedInvestmentTypesFilter.has(t);
        const color = colorMap[t];
        let style = isActive ? `style="background-color: ${color}; border-color: ${color}; color: #FFFFFF;"` : '';
        return `<button class="filter-pill ${isActive ? 'filter-pill--active' : ''}" data-action="toggle-investment-type-filter" data-type="${t}" ${style}>${t}</button>`;
    }).join('');

    const displayAssetsData = performanceData.filter(asset => !deselectedInvestmentTypesFilter.has(toSentenceCase(asset.tipo || 'S/T')));

    const portfolioTotalValorado = displayAssetsData.reduce((sum, cuenta) => sum + cuenta.valorActual, 0);
    const portfolioTotalInvertido = displayAssetsData.reduce((sum, cuenta) => sum + cuenta.capitalInvertido, 0);
    const rentabilidadTotalAbsoluta = portfolioTotalValorado - portfolioTotalInvertido;
    const rentabilidadTotalPorcentual = portfolioTotalInvertido !== 0 ? (rentabilidadTotalAbsoluta / portfolioTotalInvertido) * 100 : 0;
    const rentabilidadClass = rentabilidadTotalAbsoluta >= 0 ? 'text-positive' : 'text-negative';

    container.innerHTML = `
        <div class="card" style="margin-bottom: var(--sp-4);">
            <div class="card__content" style="display: flex; justify-content: space-around; text-align: center; padding: var(--sp-3);">
                <div>
                    <h4 class="kpi-item__label">Capital Aportado</h4>
                    <strong class="kpi-item__value" style="font-size: var(--fs-lg);">${formatCurrency(portfolioTotalInvertido)}</strong>
                </div>
                <div>
                    <h4 class="kpi-item__label">Valor de Mercado</h4>
                    <strong class="kpi-item__value" style="font-size: var(--fs-lg);">${formatCurrency(portfolioTotalValorado)}</strong>
                </div>
                <div>
                    <h4 class="kpi-item__label">Ganancia / Pérdida</h4>
                    <strong class="kpi-item__value ${rentabilidadClass}" style="font-size: var(--fs-lg);">${formatCurrency(rentabilidadTotalAbsoluta)}</strong>
                    <div class="kpi-item__comparison ${rentabilidadClass}" style="font-weight: 600;">(${rentabilidadTotalPorcentual.toFixed(1)}%)</div>
                </div>
            </div>
        </div>

        <details class="accordion" open style="margin-bottom: var(--sp-4);">
            <summary><h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);"><span class="material-icons">pie_chart</span>Asignación y Filtros</h3><span class="material-icons accordion__icon">expand_more</span></summary>
            <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                <div class="filter-pills" style="margin-bottom: var(--sp-2);">${pillsHTML}</div>
                <div class="filter-pills" style="justify-content: center; margin-bottom: var(--sp-4);">
                    <button class="filter-pill ${investmentChartMode === 'valorado' ? 'filter-pill--active' : ''}" data-action="set-investment-chart-mode" data-mode="valorado">Por Valor de Mercado</button>
                    <button class="filter-pill ${investmentChartMode === 'invertido' ? 'filter-pill--active' : ''}" data-action="set-investment-chart-mode" data-mode="invertido">Por Capital Aportado</button>
                </div>
                <div class="chart-container" style="height: 250px; margin-bottom: 0;"><canvas id="asset-allocation-chart"></canvas></div>
            </div>
        </details>
        <div id="investment-assets-list"></div>
        <div class="card card--no-bg" style="padding:0; margin-top: var(--sp-4);">
            <button class="btn btn--secondary btn--full" data-action="manage-investment-accounts"><span class="material-icons" style="font-size: 16px;">checklist</span>Gestionar Activos</button>
        </div>`;
    
    setTimeout(() => {
        const chartCtx = select('asset-allocation-chart')?.getContext('2d');
        if (chartCtx) {
            if (assetAllocationChart) assetAllocationChart.destroy();
            const keyToSum = investmentChartMode === 'valorado' ? 'valorActual' : 'capitalInvertido';
            const treeData = [];
            displayAssetsData.forEach(asset => {
                const valor = asset[keyToSum] / 100;
                if (valor > 0) treeData.push({ tipo: toSentenceCase(asset.tipo || 'S/T'), nombre: asset.nombre, valor: valor });
            });
            if (treeData.length > 0) {
                assetAllocationChart = new Chart(chartCtx, {
                    type: 'treemap',
                    data: {
                        datasets: [{
                            tree: treeData,
                            key: 'valor',
                            groups: ['tipo', 'nombre'],
                            spacing: 0.5,
                            borderWidth: 1.5,
                            borderColor: getComputedStyle(document.body).getPropertyValue('--c-background'),
                            backgroundColor: (ctx) => {
                                return ctx.type === 'data' ? colorMap[ctx.raw._data.tipo] || 'grey' : 'transparent';
                            },
                            labels: {
                                display: true,
                                color: '#FFFFFF',
                                font: { size: 11, weight: '600' },
                                align: 'center',
                                position: 'middle',
                                formatter: (ctx) => {
                                    return ctx.raw.g.includes(ctx.raw._data.nombre) ? ctx.raw._data.nombre.split(' ') : null;
                                }
                            }
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: { callbacks: { label: (ctx) => `${ctx.raw._data.nombre}: ${formatCurrency(ctx.raw.v * 100)}` } },
                            datalabels: { display: false }
                        }
                    }
                });
            } else {
                 select('asset-allocation-chart').closest('.chart-container').innerHTML = `<div class="empty-state" style="padding:16px 0; background:transparent; border:none;"><p>No hay activos con valor para mostrar.</p></div>`;
            }
        }
        const listContainer = select('investment-assets-list');
        if (listContainer) {
            const listHtml = displayAssetsData.sort((a,b) => b.valorActual - a.valorActual).map(cuenta => {
                    const pnlClass = cuenta.pnlAbsoluto >= 0 ? 'text-positive' : 'text-negative';
                    return `<div class="modal__list-item" data-action="view-account-details" data-id="${cuenta.id}" style="cursor: pointer; padding: var(--sp-3); display: block; border-bottom: 1px solid var(--c-outline);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: var(--sp-1);">
                            <strong style="font-size: var(--fs-base);">${escapeHTML(cuenta.nombre)}</strong><strong style="font-size: var(--fs-base);">${formatCurrency(cuenta.valorActual)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: var(--sp-2); font-size: var(--fs-xs);">
                            <span class="${pnlClass}" style="font-weight: 600;">P&L: ${formatCurrency(cuenta.pnlAbsoluto)} (${cuenta.pnlPorcentual.toFixed(1)}%)</span>
                            <span style="color:var(--c-info); font-weight:600;">TIR: ${!isNaN(cuenta.irr) ? (cuenta.irr * 100).toFixed(1) + '%' : 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                            <span style="color:var(--c-on-surface-secondary); font-size: var(--fs-xs);">Aportado: ${formatCurrency(cuenta.capitalInvertido)}</span>
                            <button class="btn btn--secondary" data-action="update-asset-value" data-id="${cuenta.id}" style="padding: 4px 10px; font-size: 0.75rem;"><span class="material-icons" style="font-size: 14px;">add_chart</span>Valoración</button>
                        </div>
                    </div>`;
                }).join('');
            listContainer.innerHTML = listHtml ? `<div class="card"><div class="card__content" style="padding: 0;">${listHtml}</div></div>` : '';
        }
    }, 50);
};

        const renderVirtualListItem = (item) => {
			if (item.type === 'month-header') {
    const monthName = item.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    return `
        <div class="movimiento-month-header">
            <h3 class="movimiento-month-header__title">${monthName}</h3>
            <div class="movimiento-month-header__summary">
                <p class="text-positive">${formatCurrency(item.income)}</p>
                <p class="text-negative">${formatCurrency(item.expense)}</p>
                <p class="${item.net >= 0 ? 'text-positive' : 'text-negative'}" style="border-top: 1px solid var(--c-outline); margin-top: 2px; padding-top: 2px;">
                    ${formatCurrency(item.net)}
                </p>
            </div>
        </div>
    `;
    }
            if (item.type === 'pending-header') {
                return `
                    <div class="movimiento-date-header" style="background-color: var(--c-warning); color: var(--c-black); font-weight: 800; letter-spacing: 0.5px;">
                        <span>
                            <span class="material-icons" style="font-size: 16px; vertical-align: bottom; margin-right: 4px;">update</span>
                            RECURRENTES PENDIENTES (${item.count})
                        </span>
                    </div>`;
            }

            if (item.type === 'pending-item') {
				const r = item.recurrent;
				const nextDate = new Date(r.nextDate + 'T12:00:00Z');
				const formattedDate = nextDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
				const amountClass = r.cantidad >= 0 ? 'text-positive' : 'text-negative';

    return `
    <div class="transaction-card" id="pending-recurrente-${r.id}" style="background-color: color-mix(in srgb, var(--c-warning) 10%, transparent);">
        <div class="transaction-card__indicator transaction-card__indicator--recurrent"></div>
        <div class="transaction-card__content">
            <div class="transaction-card__details">
                <div class="transaction-card__row-1">${escapeHTML(r.descripcion)}</div>
                <div class="transaction-card__row-2" style="font-weight: 600; color: var(--c-warning);">Pendiente desde: ${formattedDate}</div>
                
                <!-- NUEVO: Ahora las acciones están mejor organizadas y con el botón Editar -->
                <div class="acciones-recurrentes-corregidas">
    <button class="btn btn--secondary" data-action="edit-recurrente-from-pending" data-id="${r.id}" title="Editar antes de añadir" style="padding: 4px 8px; font-size: 0.7rem;">
        <span class="material-icons" style="font-size: 14px;">edit</span>
        <span>Editar</span>
    </button>
    <button class="btn btn--secondary" data-action="skip-recurrent" data-id="${r.id}" title="Omitir esta vez" style="padding: 4px 8px; font-size: 0.7rem;">
        <span class="material-icons" style="font-size: 14px;">skip_next</span>
        <span>No añadir</span>
    </button>
    <button class="btn btn--primary" data-action="confirm-recurrent" data-id="${r.id}" title="Crear el movimiento ahora" style="padding: 4px 8px; font-size: 0.7rem;">
        <span class="material-icons" style="font-size: 14px;">check</span>
        <span>Añadir Ahora</span>
    </button>
</div>
            </div>
            <div class="transaction-card__figures">
                <strong class="transaction-card__amount ${amountClass}">${formatCurrency(r.cantidad)}</strong>
            </div>
        </div>
    </div>`;
}
            if (item.type === 'date-header') {
                const dateObj = new Date(item.date + 'T12:00:00Z');
                const day = dateObj.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', '');
                const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

                return `
                    <div class="movimiento-date-header">
                        <span>${day} ${dateStr}</span>
                        <span>${formatCurrency(item.total)}</span>
                    </div>
                `;
            }
			if (item.type === 'transaction') {
        return TransactionCardComponent(item.movement, { cuentas: db.cuentas, conceptos: db.conceptos });
		}
        
        };
        
        const renderVisibleItems = () => {
            if (!vList.scrollerEl || !vList.contentEl) return; 
            const scrollTop = vList.scrollerEl.scrollTop;
            const containerHeight = vList.scrollerEl.clientHeight;
            let startIndex = -1, endIndex = -1;
            
            for (let i = 0; i < vList.itemMap.length; i++) {
                const item = vList.itemMap[i];
                if (startIndex === -1 && item.offset + item.height > scrollTop) {
                    startIndex = Math.max(0, i - vList.renderBuffer);
                }
                if (endIndex === -1 && item.offset + item.height > scrollTop + containerHeight) {
                    endIndex = Math.min(vList.itemMap.length - 1, i + vList.renderBuffer);
                    break;
                }
            }
            if (startIndex === -1 && vList.items.length > 0) startIndex = 0;
            if (endIndex === -1) endIndex = vList.itemMap.length - 1;
            
            if (startIndex === vList.lastRenderedRange.start && endIndex === vList.lastRenderedRange.end) return;
            
            let visibleHtml = ''; 
            for (let i = startIndex; i <= endIndex; i++) {
                if (vList.items[i]) visibleHtml += renderVirtualListItem(vList.items[i]);
            }
            vList.contentEl.innerHTML = visibleHtml; 
			const renderedItems = vList.contentEl.querySelectorAll('.list-item-animate');
renderedItems.forEach((item, index) => {
    // Aplicamos la clase que dispara la animación con un pequeño retraso
    // para cada elemento, creando el efecto cascada.
    setTimeout(() => {
        item.classList.add('item-enter-active');
    }, index * 40); // 40 milisegundos de retraso entre cada item
});
            const offsetY = vList.itemMap[startIndex] ? vList.itemMap[startIndex].offset : 0; 
            vList.contentEl.style.transform = `translateY(${offsetY}px)`; 
            vList.lastRenderedRange = { start: startIndex, end: endIndex };
        };
// =================================================================
// === INICIO: NUEVA FUNCIÓN AYUDANTE PARA REFRESCOS RÁPIDOS     ===
// =================================================================
const updateLocalDataAndRefreshUI = async () => {
    // 1. Recalcula los saldos con la lista de movimientos actualizada que tenemos en memoria.
    await processMovementsForRunningBalance(db.movimientos, true);
    
    // 2. Le dice a la lista virtual que se redibuje con los nuevos datos.
    updateVirtualListUI();

    // 3. (Opcional pero recomendado) Actualiza el índice de autocompletado.
    buildIntelligentIndex();
};
// =================================================================
// === FIN: NUEVA FUNCIÓN AYUDANTE                               ===
// ================================================================= 
 
// ▼▼▼ REEMPLAZA TU FUNCIÓN updateVirtualListUI POR COMPLETO CON ESTA VERSIÓN CORREGIDA ▼▼▼

const updateVirtualListUI = () => {
    if (!vList.sizerEl) return;

    vList.items = [];
    vList.itemMap = [];
    let currentHeight = 0;
    
    // 1. Lógica para los recurrentes pendientes (esto no cambia)
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const pendingRecurrents = (db.recurrentes || [])
        .filter(r => {
            const nextDate = parseDateStringAsUTC(r.nextDate);
            return nextDate && new Date(Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth(), nextDate.getUTCDate())) <= today;
        })
        .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));

    if (pendingRecurrents.length > 0) {
        vList.items.push({ type: 'pending-header', count: pendingRecurrents.length });
        vList.itemMap.push({ height: vList.heights.pendingHeader, offset: currentHeight });
        currentHeight += vList.heights.pendingHeader;
        pendingRecurrents.forEach(recurrent => {
            vList.items.push({ type: 'pending-item', recurrent: recurrent });
            vList.itemMap.push({ height: vList.heights.pendingItem, offset: currentHeight });
            currentHeight += vList.heights.pendingItem;
        });
    }

   // 2. Agrupación de movimientos por mes y día
    const groupedByMonth = {};
    const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));

    (db.movimientos || []).forEach(mov => {
        let isVisibleInLedger = false;
        let amountForTotals = 0;

        // ✅ INICIO DE LA LÓGICA CORREGIDA PARA VISIBILIDAD Y TOTALES ✅
        if (mov.tipo === 'traspaso') {
            const origenVisible = visibleAccountIds.has(mov.cuentaOrigenId);
            const destinoVisible = visibleAccountIds.has(mov.cuentaDestinoId);
            
            // Un traspaso es VISIBLE si al menos una de sus cuentas está en la contabilidad actual.
            isVisibleInLedger = origenVisible || destinoVisible;

            // Su IMPACTO en los totales solo se cuenta si es un traspaso entre contabilidades.
            if (origenVisible && !destinoVisible) amountForTotals = -mov.cantidad;
            else if (!origenVisible && destinoVisible) amountForTotals = mov.cantidad;

        } else { // Es un movimiento normal (ingreso/gasto)
            isVisibleInLedger = visibleAccountIds.has(mov.cuentaId);
            if (isVisibleInLedger) {
                amountForTotals = mov.cantidad;
            }
        }

        // Si el movimiento es visible, lo procesamos para mostrarlo.
        if (isVisibleInLedger) {
            const date = new Date(mov.fecha);
            const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
            const dateKey = mov.fecha.slice(0, 10);
            
            if (!groupedByMonth[monthKey]) { groupedByMonth[monthKey] = { days: {}, monthNet: 0, monthIncome: 0, monthExpense: 0 }; }
            if (!groupedByMonth[monthKey].days[dateKey]) { groupedByMonth[monthKey].days[dateKey] = { movements: [], total: 0 }; }
            
            // Añadimos el movimiento a la lista de ESE DÍA.
            groupedByMonth[monthKey].days[dateKey].movements.push(mov);

            // Actualizamos los totales SÓLO con el impacto real en la contabilidad.
            groupedByMonth[monthKey].days[dateKey].total += amountForTotals;
            groupedByMonth[monthKey].monthNet += amountForTotals;
            if (amountForTotals > 0) groupedByMonth[monthKey].monthIncome += amountForTotals;
            else groupedByMonth[monthKey].monthExpense += amountForTotals;
        }
        // ✅ FIN DE LA LÓGICA CORREGIDA ✅
    });

    // 3. Construcción de la lista para la interfaz (esta parte ya era correcta)
    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

    for (const monthKey of sortedMonths) {
        const monthData = groupedByMonth[monthKey];
        const monthDate = new Date(monthKey + '-02T12:00:00Z');

        vList.items.push({ type: 'month-header', date: monthDate, net: monthData.monthNet, income: monthData.monthIncome, expense: monthData.monthExpense });
        vList.itemMap.push({ height: 70, offset: currentHeight });
        currentHeight += 70;

        const sortedDates = Object.keys(monthData.days).sort((a, b) => b.localeCompare(a));
        for (const dateKey of sortedDates) {
            const group = monthData.days[dateKey];
            
            if (group.movements && group.movements.length > 0) {
                vList.items.push({ type: 'date-header', date: dateKey, total: group.total });
                vList.itemMap.push({ height: vList.heights.header, offset: currentHeight });
                currentHeight += vList.heights.header;
                group.movements.sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id.localeCompare(a.id));
                for (const mov of group.movements) {
                    const itemHeight = mov.tipo === 'traspaso' ? vList.heights.transfer : vList.heights.transaction;
                    vList.items.push({ type: 'transaction', movement: mov });
                    vList.itemMap.push({ height: itemHeight, offset: currentHeight });
                    currentHeight += itemHeight;
                }
            }
        }
    }
    
    // 4. Renderizar y actualizar (sin cambios)
    vList.sizerEl.style.height = `${currentHeight}px`;
    vList.lastRenderedRange = { start: -1, end: -1 }; 
    renderVisibleItems();
    const loadMoreContainer = select('load-more-container');
    const emptyContainer = select('empty-movimientos');
    const listContainer = select('movimientos-list-container');
    if (vList.items.length === 0) {
        listContainer?.classList.add('hidden');
        loadMoreContainer?.classList.add('hidden');
        emptyContainer?.classList.remove('hidden');
    } else {
        listContainer?.classList.remove('hidden');
        emptyContainer?.classList.add('hidden');
        loadMoreContainer?.classList.toggle('hidden', allMovementsLoaded);
    }
};

// Paso B: La función que carga los datos. Ahora es más simple y se llama
// tanto al inicio como al pulsar el botón.
// =============================================================
// === INICIO: FUNCIÓN `fetchMovementsPage` (CORRECCIÓN CRÍTICA)
// =============================================================

// Esta función es la que se comunica directamente con Firestore para traer los lotes de movimientos.
// Es ESENCIAL que esté presente en el código.

async function fetchMovementsPage(startAfterDoc = null) {
    if (!currentUser) return [];
    try {
        let query = fbDb.collection('users').doc(currentUser.uid).collection('movimientos')
            .orderBy('fecha', 'desc').orderBy(firebase.firestore.FieldPath.documentId(), 'desc');

        if (startAfterDoc) {
            query = query.startAfter(startAfterDoc);
        }

        query = query.limit(MOVEMENTS_PAGE_SIZE);
        const snapshot = await query.get();

        if (snapshot.empty) {
            allMovementsLoaded = true;
            return [];
        }

        lastVisibleMovementDoc = snapshot.docs[snapshot.docs.length - 1];

        if (snapshot.docs.length < MOVEMENTS_PAGE_SIZE) {
            allMovementsLoaded = true;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Error al obtener los movimientos:", error);
        showToast("Error al cargar los movimientos.", "danger");
        return [];
    }
}
// ===========================================================
// === FIN: FUNCIÓN `fetchMovementsPage`
// ===========================================================

// =================================================================
// === INICIO: CÓDIGO A AÑADIR (ÚNICA VERSIÓN CORRECTA)
// =================================================================

const filterMovementsByLedger = (movements) => {
    const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));
    if (visibleAccountIds.size === 0) return [];
    
    return movements.filter(m => {
        if (m.tipo === 'traspaso') {
            return visibleAccountIds.has(m.cuentaOrigenId) || visibleAccountIds.has(m.cuentaDestinoId);
        } else {
            return visibleAccountIds.has(m.cuentaId);
        }
    });
};

// ===============================================================
// === FIN: CÓDIGO A AÑADIR
// ===============================================================

const loadMoreMovements = async (isInitial = false) => {
    if (isLoadingMoreMovements || allMovementsLoaded) return;

    isLoadingMoreMovements = true;
    const loadMoreBtn = select('load-more-btn'); // Esto se usaba para el botón, lo mantenemos por si vuelve.

    // La lógica de mostrar esqueletos o el spinner del botón pertenece a renderDiarioPage,
    // pero la dejamos aquí condicionada para no romper nada si se usa en otro contexto.
    if (isInitial) {
        let skeletonHTML = '';
        for (let i = 0; i < 7; i++) {
            skeletonHTML += `<div class="skeleton-card"><div class="skeleton skeleton-card__indicator"></div><div class="skeleton-card__content"><div><div class="skeleton skeleton-card__line skeleton-card__line--sm"></div><div class="skeleton skeleton-card__line skeleton-card__line--xs"></div></div><div class="skeleton skeleton-card__amount"></div></div></div>`;
        }
        const contentEl = select('virtual-list-content');
        if(contentEl) contentEl.innerHTML = skeletonHTML;
    } else if (loadMoreBtn) {
        setButtonLoading(loadMoreBtn, true, 'Cargando...');
    }

    try {
        let newMovementsChunk = [];
        let fetchedFilteredCount = 0;

        while (fetchedFilteredCount < 50 && !allMovementsLoaded) {
            const rawMovsFromDB = await fetchMovementsPage(lastVisibleMovementDoc);
            if (rawMovsFromDB.length === 0) break;
            const filteredBatch = filterMovementsByLedger(rawMovsFromDB);
            newMovementsChunk.push(...filteredBatch);
            fetchedFilteredCount += filteredBatch.length;
        }
        
        if (newMovementsChunk.length > 0) {
            db.movimientos.push(...newMovementsChunk);
            await processMovementsForRunningBalance(db.movimientos, true);
        }

        updateVirtualListUI();

    } catch (error) {
        console.error("Error al cargar más movimientos:", error);
        showToast("No se pudieron cargar más movimientos.", "danger");
    } finally {
        isLoadingMoreMovements = false;
        if (loadMoreBtn) {
            setButtonLoading(loadMoreBtn, false);
        }
    }
};

// =========================================================================
// === INICIO: REEMPLAZO COMPLETO Y MEJORADO DE loadInitialMovements     ===
// =========================================================================

        let movementsObserver = null; // Variable global para el observador
		const initMovementsObserver = () => {
    // Si ya existía un vigilante, lo reiniciamos
    if (movementsObserver) {
        movementsObserver.disconnect();
    }

    const trigger = select('infinite-scroll-trigger');
    if (!trigger) return;

    // Configuramos el vigilante para que actúe cuando el "activador" esté a punto de verse
    const options = {
        root: selectOne('.app-layout__main'), // Vigila el scroll dentro de la ventana principal
        rootMargin: '200px', // Empieza a cargar 200px antes de que llegue al final
        threshold: 0.01
    };

    movementsObserver = new IntersectionObserver((entries) => {
        // Si el vigilante ve nuestro activador...
        if (entries[0].isIntersecting) {
            // ...llama a la función para cargar más movimientos automáticamente.
            loadMoreMovements();
        }
    }, options);

    // Le decimos al vigilante que empiece a observar nuestro activador invisible.
    movementsObserver.observe(trigger);
};

// ▼▼▼ REEMPLAZA TU FUNCIÓN renderDiarioPage POR COMPLETO CON ESTA VERSIÓN ▼▼▼

const renderDiarioPage = async () => {
    if (isDiarioPageRendering) {
        console.log("BLOQUEADO: Intento de re-renderizar el Diario mientras ya estaba en proceso.");
        return;
    }
    isDiarioPageRendering = true;

    try {
        const container = select('diario-page');
        if (!container.querySelector('#diario-view-container')) {
            container.innerHTML = '<div id="diario-view-container"></div>';
        }
        
        const viewContainer = select('diario-view-container');
        if (!viewContainer) return;

        if (diarioViewMode === 'calendar') {
            if (movementsObserver) movementsObserver.disconnect();
            await renderDiarioCalendar();
            return; // Salimos aquí si estamos en vista de calendario
        }

        viewContainer.innerHTML = `
            <div id="diario-filter-active-indicator" class="hidden">
                <p>Mostrando resultados filtrados.</p>
                <div>
                    <button data-action="export-filtered-csv" class="btn btn--secondary" style="padding: 4px 10px; font-size: 0.75rem;"><span class="material-icons" style="font-size: 14px;">download</span>Exportar</button>
                    <button data-action="clear-diario-filters" class="btn btn--secondary" style="padding: 4px 10px; font-size: 0.75rem;">Limpiar</button>
                </div>
            </div>
            <div id="movimientos-list-container">
                <div id="virtual-list-sizer"><div id="virtual-list-content"></div></div>
            </div>
            <div id="infinite-scroll-trigger" style="height: 50px;"></div> 
            <div id="empty-movimientos" class="empty-state hidden" style="margin: 0 var(--sp-4);">
                <span class="material-icons">search_off</span><h3>Sin Resultados</h3><p>No se encontraron movimientos que coincidan con tus filtros.</p>
            </div>`;

        vList.scrollerEl = selectOne('.app-layout__main');
        vList.sizerEl = select('virtual-list-sizer');
        vList.contentEl = select('virtual-list-content');
        
        const scrollTrigger = select('infinite-scroll-trigger');

        if (diarioActiveFilters) {
            if (scrollTrigger) scrollTrigger.classList.add('hidden');
            if (movementsObserver) movementsObserver.disconnect();

            select('diario-filter-active-indicator').classList.remove('hidden');
            
            if (allDiarioMovementsCache.length === 0) {
                allDiarioMovementsCache = await fetchAllMovementsForHistory();
            }

            const { startDate, endDate, description, minAmount, maxAmount, cuentas, conceptos } = diarioActiveFilters;
            db.movimientos = allDiarioMovementsCache.filter(m => {
                if (startDate && m.fecha < startDate) return false;
                if (endDate && m.fecha > endDate) return false;
                if (description && !m.descripcion.toLowerCase().includes(description)) return false;
                const cantidadEuros = m.cantidad / 100;
                if (minAmount && cantidadEuros < parseFloat(minAmount)) return false;
                if (maxAmount && cantidadEuros > parseFloat(maxAmount)) return false;
                if (cuentas.length > 0) {
                    if (m.tipo === 'traspaso' && !cuentas.includes(m.cuentaOrigenId) && !cuentas.includes(m.cuentaDestinoId)) return false;
                    if (m.tipo === 'movimiento' && !cuentas.includes(m.cuentaId)) return false;
                }
                if (conceptos.length > 0 && m.tipo === 'movimiento' && !conceptos.includes(m.conceptoId)) return false;
                return true;
            });
            
            await processMovementsForRunningBalance(db.movimientos, true);
            updateVirtualListUI();

        } else {
            if (scrollTrigger) scrollTrigger.classList.remove('hidden');
            select('diario-filter-active-indicator').classList.add('hidden');
            
            db.movimientos = [];
            lastVisibleMovementDoc = null;
            allMovementsLoaded = false;
            isLoadingMoreMovements = false; 
            
            await loadMoreMovements(true);
            initMovementsObserver();
        }

    } catch (error) {
        console.error("Error crítico renderizando la página del diario:", error);
        // Si hay un error, es crucial liberar la guarda para poder intentarlo de nuevo.
    } finally {
       
        isDiarioPageRendering = false;
    }
};
		
	const getYearProgress = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const year = now.getFullYear();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDaysInYear = isLeap ? 366 : 365;

    return {
        percentage: (dayOfYear / totalDaysInYear) * 100,
        daysPassed: dayOfYear,
        daysRemaining: totalDaysInYear - dayOfYear,
    };
};

const renderGaugeChart = (canvasId, percentageConsumed, yearProgressPercentage) => {
    const canvas = select(canvasId);
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;

    if (Chart.getChart(canvasId)) {
        Chart.getChart(canvasId).destroy();
    }

    const isAheadOfPace = percentageConsumed > yearProgressPercentage;
    
    const spentColor = isAheadOfPace ? 'var(--c-danger)' : 'var(--c-primary)';
    const remainingColor = 'var(--c-surface-variant)';

    const data = {
        datasets: [{
            data: [
                Math.min(percentageConsumed, 100),
                Math.max(0, 100 - Math.min(percentageConsumed, 100))
            ],
            backgroundColor: [spentColor, remainingColor],
            borderColor: 'var(--c-surface)',
            borderWidth: 2,
        }]
    };
    
    const paceLinePlugin = {
        id: 'paceLine',
        afterDraw: chart => {
            const { ctx, chartArea } = chart;
            const angle = Math.PI + (Math.PI * yearProgressPercentage / 100);
            const cx = (chartArea.left + chartArea.right) / 2;
            const cy = (chartArea.top + chartArea.bottom) / 2 + 15;
            const radius = chart.outerRadius;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + radius * Math.sin(angle), cy + radius * Math.cos(angle));
            ctx.strokeStyle = 'var(--c-success)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 180,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                datalabels: { display: false }
            }
        },
        plugins: [paceLinePlugin]
    });
};

const renderBudgetTrendChart = (monthlyIncomeData, monthlyExpenseData, averageBudgetedExpense) => {
    const canvasId = 'budget-trend-chart';
    const canvas = select(canvasId);
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;

    if (budgetTrendChart) {
        budgetTrendChart.destroy();
    }

    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const incomeData = labels.map((_, i) => (monthlyIncomeData[i] || 0) / 100);
    const expenseData = labels.map((_, i) => (monthlyExpenseData[i] || 0) / 100);
    
    const colorSuccess = getComputedStyle(document.body).getPropertyValue('--c-success').trim();
    const colorDanger = getComputedStyle(document.body).getPropertyValue('--c-danger').trim();
    const colorWarning = getComputedStyle(document.body).getPropertyValue('--c-warning').trim();

    budgetTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ingresos Mensuales',
                    data: incomeData,
                    backgroundColor: colorSuccess, 
                    borderRadius: 4,
                    order: 2
                },
                {
                    label: 'Gastos Mensuales',
                    data: expenseData,
                    backgroundColor: colorDanger, 
                    borderRadius: 4,
                    order: 3
                },
                {
                    type: 'line',
                    label: 'Promedio Gasto Presupuestado',
                    data: Array(12).fill(averageBudgetedExpense / 100),
                    borderColor: colorWarning,
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    order: 1,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: { beginAtZero: true, ticks: { callback: value => `€${value}` } },
        x: { grid: { display: false } }
    },
    plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
        datalabels: { display: false }
    },
    // === ¡APLICAMOS EL MISMO PATRÓN DE DRILL-DOWN! ===
    onClick: async (event, elements) => {
        if (elements.length === 0) return;
        
        const monthIndex = elements[0].index;
        const monthName = labels[monthIndex];
        const year = parseInt(select('budget-year-selector').value, 10);
        
        // Obtener todos los movimientos del año seleccionado para poder filtrarlos
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        const visibleAccountIds = getVisibleAccounts().map(c => c.id);
        const baseQuery = fbDb.collection('users').doc(currentUser.uid).collection('movimientos')
                                .where('fecha', '>=', startDate.toISOString())
                                .where('fecha', '<=', endDate.toISOString())
                                .where('tipo', '==', 'movimiento');
        const movementsOfYear = await fetchMovementsInChunks(baseQuery, 'cuentaId', visibleAccountIds);

        // Filtrar los movimientos solo para el mes que se ha clicado
        const movementsOfMonth = movementsOfYear.filter(m => new Date(m.fecha).getMonth() === monthIndex);
        
        hapticFeedback('light');
        
         showDrillDownModal(`Movimientos de ${monthName} ${year}`, movementsOfMonth);
		},
    onHover: (event, chartElement) => {
        event.native.target.style.cursor = chartElement ? 'pointer' : 'default';
    }
    // ====================================================
}
    });
};


// =============================================================
// === INICIO: FUNCIÓN RESTAURADA PARA EL WIDGET DE PATRIMONIO ===
// =============================================================
const renderPatrimonioPage = async () => {
    const container = select('patrimonio-completo-container');
    if (!container) return;

    const visibleAccounts = getVisibleAccounts();
    const saldos = await getSaldos();
    const BASE_COLORS = ['#007AFF', '#30D158', '#FFD60A', '#FF3B30', '#C084FC', '#4ECDC4', '#EF626C', '#A8D58A'];

    const allAccountTypes = [...new Set(visibleAccounts.map((c) => toSentenceCase(c.tipo || 'S/T')))].sort();
    const filteredAccountTypes = new Set(allAccountTypes.filter(t => !deselectedAccountTypesFilter.has(t)));

    const colorMap = {};
    allAccountTypes.forEach((tipo, index) => {
        colorMap[tipo] = BASE_COLORS[index % BASE_COLORS.length];
    });

    const pillsHTML = allAccountTypes.map(t => {
        const isActive = !deselectedAccountTypesFilter.has(t);
        const color = colorMap[t];
        let style = '';
        if (isActive && color) {
            style = `style="background-color: ${color}; border-color: ${color}; color: #FFFFFF; box-shadow: 0 0 8px ${color}70;"`;
        }
        return `<button class="filter-pill ${isActive ? 'filter-pill--active' : ''}" data-action="toggle-account-type-filter" data-type="${t}" ${style}>${t}</button>`;
    }).join('') || `<p style="font-size:var(--fs-xs); color:var(--c-on-surface-secondary)">No hay cuentas en esta vista.</p>`;
    
    const filteredAccounts = visibleAccounts.filter(c => {
        const tipo = toSentenceCase(c.tipo || 'S/T');
        return filteredAccountTypes.has(tipo);
    });

    const totalFiltrado = filteredAccounts.reduce((sum, c) => sum + (saldos[c.id] || 0), 0);
    
    const treeData = [];
    filteredAccounts.forEach(c => {
        const saldo = saldos[c.id] || 0;
        if (saldo > 0) {
            treeData.push({ tipo: toSentenceCase(c.tipo || 'S/T'), nombre: c.nombre, saldo: saldo / 100 });
        }
    });

    container.innerHTML = `
        <h3 class="card__title"><span class="material-icons">account_balance</span>Patrimonio</h3>
        <div class="card__content" style="padding-top:0;">
            <div class="patrimonio-header-grid__kpi" style="margin-bottom: var(--sp-4);">
                <h4 class="kpi-item__label">Patrimonio Neto (Seleccionado)</h4>
                <strong id="patrimonio-total-balance" class="kpi-item__value" style="font-size: 2rem; line-height: 1.1;">${formatCurrency(totalFiltrado)}</strong>
            </div>
            <div class="patrimonio-header-grid__filters" style="margin-bottom: var(--sp-4);">
                <h4 class="kpi-item__label">Filtros por tipo de activo</h4>
                <div id="filter-account-types-pills" class="filter-pills" style="margin-bottom: 0;">${pillsHTML}</div>
            </div>
            <div id="liquid-assets-chart-container" class="chart-container" style="height: 250px; margin-bottom: var(--sp-4);"><canvas id="liquid-assets-chart"></canvas></div>
            <div id="patrimonio-cuentas-lista"></div>
        </div>`;

    setTimeout(() => {
        const chartCtx = select('liquid-assets-chart')?.getContext('2d');
        if (chartCtx) {
            if (liquidAssetsChart) liquidAssetsChart.destroy();
            if (treeData.length > 0) {
                liquidAssetsChart = new Chart(chartCtx, { type: 'treemap', data: { datasets: [{ tree: treeData, key: 'saldo', groups: ['tipo', 'nombre'], spacing: 0.5, borderWidth: 1.5, borderColor: getComputedStyle(document.body).getPropertyValue('--c-background'), backgroundColor: (ctx) => (ctx.type === 'data' ? colorMap[ctx.raw._data.tipo] || 'grey' : 'transparent'), labels: { display: true, color: '#FFFFFF', font: { size: 11, weight: '600' }, align: 'center', position: 'middle', formatter: (ctx) => (ctx.raw.g.includes(ctx.raw._data.nombre) ? ctx.raw._data.nombre.split(' ') : null) } }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw._data.nombre}: ${formatCurrency(ctx.raw.v * 100)}` } }, datalabels: { display: false }}} });
            } else {
                select('liquid-assets-chart-container').innerHTML = `<div class="empty-state" style="padding:16px 0; background:transparent; border:none;"><p>No hay activos con saldo positivo para mostrar.</p></div>`;
            }
        }
        const listaContainer = select('patrimonio-cuentas-lista');
        if (listaContainer) {
            const accountsByType = filteredAccounts.reduce((acc, c) => { const tipo = toSentenceCase(c.tipo || 'S/T'); if (!acc[tipo]) acc[tipo] = []; acc[tipo].push(c); return acc; }, {});
            listaContainer.innerHTML = Object.keys(accountsByType).sort().map(tipo => {
                const accountsInType = accountsByType[tipo];
                const typeBalance = accountsInType.reduce((sum, acc) => sum + (saldos[acc.id] || 0), 0);
                const porcentajeGlobal = totalFiltrado > 0 ? (typeBalance / totalFiltrado) * 100 : 0;
                const accountsHtml = accountsInType.sort((a,b) => a.nombre.localeCompare(b.nombre)).map(c => `<div class="modal__list-item" data-action="view-account-details" data-id="${c.id}" style="cursor: pointer; padding: var(--sp-2) 0;"><div><span style="display: block;">${c.nombre}</span><small style="color: var(--c-on-surface-secondary);">${((saldos[c.id] || 0) / typeBalance * 100).toFixed(1)}% de ${tipo}</small></div><div style="display: flex; align-items: center; gap: var(--sp-2);">${formatCurrency(saldos[c.id] || 0)}<span class="material-icons" style="font-size: 18px;">chevron_right</span></div></div>`).join('');
                if (!accountsHtml) return '';
                return `<details class="accordion" style="margin-bottom: var(--sp-2);"><summary><span class="account-group__name">${tipo}</span><div style="display:flex; align-items:center; gap:var(--sp-2);"><small style="color: var(--c-on-surface-tertiary); margin-right: var(--sp-2);">${porcentajeGlobal.toFixed(1)}%</small><span class="account-group__balance">${formatCurrency(typeBalance)}</span><span class="material-icons accordion__icon">expand_more</span></div></summary><div class="accordion__content" style="padding: 0 var(--sp-3);">${accountsHtml}</div></details>`;
            }).join('');
        }
    }, 50);
};
                
        
        const loadConfig = () => { 
            const userEmailEl = select('config-user-email'); 
            if (userEmailEl && currentUser) userEmailEl.textContent = currentUser.email;  			
        };
		
  const renderInicioPage = async () => {
    const container = select(PAGE_IDS.INICIO);
    if (!container) return;

    // AHORA ESTA FUNCIÓN SOLO CREA EL CONTENEDOR PRINCIPAL PARA LOS WIDGETS
    container.innerHTML = `
        <div id="resumen-content-container">
             <!-- Los esqueletos de los widgets se cargarán aquí -->
        </div>
    `;
    
    // Las llamadas a otras funciones se mantienen
    populateAllDropdowns();
    renderInicioResumenView(); // Esta función rellenará 'resumen-content-container'
    
    // Cargamos los datos para que el dashboard pueda pintarse
    await Promise.all([loadPresupuestos(), loadInversiones()]);
};
 
// =====================================================================
// === INICIO: PASO 1 - REEMPLAZA ESTA FUNCIÓN POR COMPLETO          ===
// =====================================================================
/**
 * Genera el HTML para una tarjeta de movimiento o traspaso con sus acciones de swipe.
 * @param {object} m - El objeto del movimiento.
 * @param {object} dbData - Objeto con acceso a `db.cuentas` y `db.conceptos`.
 * @returns {string} El string HTML del componente completo.
 */
const TransactionCardComponent = (m, dbData) => {
    const { cuentas, conceptos } = dbData;
    const highlightClass = (m.id === newMovementIdToHighlight) ? 'list-item-animate' : '';

    const formattedDate = new Date(m.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let cardContentHTML = '';

    if (m.tipo === 'traspaso') {
        const origen = cuentas.find(c => c.id === m.cuentaOrigenId);
        const destino = cuentas.find(c => c.id === m.cuentaDestinoId);
        
        // CORRECCIÓN: El HTML ahora incluye el indicador DENTRO de este bloque.
        cardContentHTML = `
            <div class="transaction-card__indicator transaction-card__indicator--transfer"></div>
            <div class="transaction-card__content">
                <div class="transaction-card__details">
                    <div class="transaction-card__concept">${escapeHTML(m.descripcion) || 'Traspaso'}</div>
                    <div class="transaction-card__description">${formattedDate}</div>
                    <div class="transaction-card__transfer-details">
                        <div class="transaction-card__transfer-row">
                            <span><span class="material-icons">arrow_upward</span> ${(origen?.nombre) || '?'}</span>
                            <span class="transaction-card__balance">${formatCurrency(m.runningBalanceOrigen)}</span>
                        </div>
                        <div class="transaction-card__transfer-row">
                            <span><span class="material-icons">arrow_downward</span> ${(destino?.nombre) || '?'}</span>
                            <span class="transaction-card__balance">${formatCurrency(m.runningBalanceDestino)}</span>
                        </div>
                    </div>
                </div>
                <div class="transaction-card__figures">
                    <div class="transaction-card__amount text-info">${formatCurrency(m.cantidad)}</div>
                </div>
            </div>`;
    } else {
        const cuenta = cuentas.find(c => c.id === m.cuentaId);
        const concept = conceptos.find(c => c.id === m.conceptoId);
        const amountClass = m.cantidad >= 0 ? 'text-positive' : 'text-negative';
        
        // CORRECCIÓN: La variable 'indicatorClass' se define y se usa solo dentro de este bloque.
        const indicatorClass = m.cantidad >= 0 ? 'transaction-card__indicator--income' : 'transaction-card__indicator--expense';
        
        cardContentHTML = `
            <div class="transaction-card__indicator ${indicatorClass}"></div>
            <div class="transaction-card__content">
                <div class="transaction-card__details">
                    <div class="transaction-card__row-1">${toSentenceCase(concept?.nombre || 'S/C')}</div>
                    <div class="transaction-card__row-2">${formattedDate} • ${escapeHTML(m.descripcion)}</div>
                </div>
                <div class="transaction-card__figures">
                    <div class="transaction-card__amount ${amountClass}">${formatCurrency(m.cantidad)}</div>
                    <div class="transaction-card__balance">${formatCurrency(m.runningBalance)}</div>
                    <div class="transaction-card__row-2" style="text-align: right;">${escapeHTML(cuenta?.nombre || 'S/C')}</div>
                </div>
            </div>`;
    }
    
    // El contenedor exterior sigue siendo el mismo, pero ahora solo envuelve el contenido ya completo.
    return `
    <div class="swipe-container list-item-animate">
        <div class="swipe-actions-container left">
            <button class="swipe-action-btn duplicate" data-action="swipe-duplicate-movement" data-id="${m.id}">
                <span class="material-icons">content_copy</span>
                <span>Duplicar</span>
            </button>
        </div>
        <div class="swipe-actions-container right">
            <button class="swipe-action-btn delete" data-action="swipe-delete-movement" data-id="${m.id}" data-is-recurrent="false">
                <span class="material-icons">delete</span>
                <span>Borrar</span>
            </button>
        </div>
        <div class="transaction-card ${highlightClass}" data-id="${m.id}" data-action="edit-movement-from-list">
            ${cardContentHTML}
        </div>
    </div>`;
};
// ▼▼▼ REEMPLAZA TU FUNCIÓN renderPortfolioEvolutionChart CON ESTA VERSIÓN ESPECTACULAR ▼▼▼

/**
 * Renderiza un gráfico de área apilado que muestra la evolución del capital aportado y las ganancias/pérdidas.
 * @param {string} targetContainerId - El ID del contenedor donde se dibujará el gráfico.
 */
async function renderPortfolioEvolutionChart(targetContainerId) {
    const container = select(targetContainerId);
    if (!container) return;

    container.innerHTML = `<div class="chart-container skeleton" style="height: 220px; border-radius: var(--border-radius-lg);"><canvas id="portfolio-evolution-chart"></canvas></div>`;

    await loadInversiones();
    const allMovements = await fetchAllMovementsForHistory();

    const filteredInvestmentAccounts = getVisibleAccounts().filter(account => {
        const accountType = toSentenceCase(account.tipo || 'S/T');
        return !deselectedInvestmentTypesFilter.has(accountType) && account.esInversion;
    });
    const filteredAccountIds = new Set(filteredInvestmentAccounts.map(c => c.id));

    if (filteredInvestmentAccounts.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding:16px 0; background:transparent; border:none;"><p>No hay activos seleccionados para mostrar la evolución.</p></div>`;
        return;
    }

    // 1. Recopilamos todos los eventos (esta parte no cambia)
    const timeline = [];
    const history = (db.inversiones_historial || []).filter(h => filteredAccountIds.has(h.cuentaId));
    history.forEach(v => timeline.push({ date: v.fecha.slice(0, 10), type: 'valuation', value: v.valor, accountId: v.cuentaId }));

    const cashFlowMovements = allMovements.filter(m => {
        return (m.tipo === 'movimiento' && filteredAccountIds.has(m.cuentaId)) ||
               (m.tipo === 'traspaso' && (filteredAccountIds.has(m.cuentaOrigenId) || filteredAccountIds.has(m.cuentaDestinoId)));
    });
    cashFlowMovements.forEach(m => {
        let amount = 0;
        if (m.tipo === 'movimiento') amount = m.cantidad;
        else if (m.tipo === 'traspaso') {
            if (filteredAccountIds.has(m.cuentaDestinoId) && !filteredAccountIds.has(m.cuentaOrigenId)) amount = m.cantidad;
            if (filteredAccountIds.has(m.cuentaOrigenId) && !filteredAccountIds.has(m.cuentaDestinoId)) amount = -m.cantidad;
        }
        if (amount !== 0) timeline.push({ date: m.fecha.slice(0, 10), type: 'cashflow', value: amount });
    });
    
    if (timeline.length < 1) {
         container.innerHTML = `<div class="empty-state" style="padding:16px 0; background:transparent; border:none;"><p>No hay datos suficientes para mostrar la evolución.</p></div>`;
         return;
    }
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2. Procesamos la línea de tiempo (esta parte no cambia)
    const dailyData = new Map();
    let runningCapital = 0;
    const lastKnownValues = new Map();

    timeline.forEach(event => {
        if (!dailyData.has(event.date)) {
            const prevDate = new Date(event.date); prevDate.setDate(prevDate.getDate() - 1);
            const prevDateKey = prevDate.toISOString().slice(0, 10);
            dailyData.set(event.date, dailyData.has(prevDateKey) ? { ...dailyData.get(prevDateKey) } : { capital: runningCapital, value: 0 });
        }
        const day = dailyData.get(event.date);
        if (event.type === 'cashflow') {
            runningCapital += event.value;
            day.capital = runningCapital;
        } else if (event.type === 'valuation') {
            lastKnownValues.set(event.accountId, event.value);
        }
        let totalValue = 0;
        for(const id of filteredAccountIds) totalValue += lastKnownValues.get(id) || 0;
        day.value = totalValue;
    });

    // 3. Preparamos datos para Chart.js (esta parte no cambia)
    const sortedDates = [...dailyData.keys()].sort();
    const chartLabels = sortedDates;
    const capitalData = sortedDates.map(date => dailyData.get(date).capital / 100);
    const totalValueData = sortedDates.map(date => dailyData.get(date).value / 100);

    // --- ¡AQUÍ EMPIEZA LA NUEVA MAGIA VISUAL! ---
    const chartCanvas = select('portfolio-evolution-chart');
    const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;
    if (!chartCtx) return;

    if (Chart.getChart(chartCanvas)) Chart.getChart(chartCanvas).destroy();
    chartCanvas.closest('.chart-container').classList.remove('skeleton');

    // Creamos el gradiente para el área
    const primaryColor = getComputedStyle(document.body).getPropertyValue('--c-primary').trim();
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, primaryColor.replace(')', ', 0.6)'));
    gradient.addColorStop(1, primaryColor.replace(')', ', 0.05)'));
    
    new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Valor Total',
					data: totalValueData,
					borderColor: primaryColor,      // Mantenemos el color principal para la línea
					backgroundColor: gradient,      // El gradiente para el área se queda igual
					
					tension: 0.4,
					pointRadius: 0,
					borderWidth: 2.5,               // Un grosor de 2.5px para que la línea se vea bien definida
		},
                {
                    label: 'Capital Aportado',
                    data: capitalData,
                    borderColor: getComputedStyle(document.body).getPropertyValue('--c-info').trim(),
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2,
                    borderDash: [5, 5], // <-- Línea punteada para que sea una referencia
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: { callback: value => formatCurrency(value * 100) }
                },
                x: {
                    type: 'time',
                    time: { unit: 'month', tooltipFormat: 'dd MMM yyyy' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true } },
                datalabels: { display: false },
                // Tooltip mejorado para mostrar el P&L calculado al momento
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${formatCurrency(value * 100)}`;
                        },
                        footer: (tooltipItems) => {
                            const total = tooltipItems.find(i => i.dataset.label === 'Valor Total')?.parsed.y || 0;
                            const capital = tooltipItems.find(i => i.dataset.label === 'Capital Aportado')?.parsed.y || 0;
                            const pnl = total - capital;
                            const pnlFormatted = formatCurrency(pnl * 100);
                            // Le damos un color al P&L en el tooltip
                            return `P&L: ${pnlFormatted}`;
                        }
                    }
                }
            },
            interaction: { mode: 'index', intersect: false }
        }
    });
}
 
// =================================================================
// === INICIO: NUEVO MOTOR DE RENDERIZADO DE INFORMES (v2.0) ===
// =================================================================

// Esta variable global evitará errores de "Canvas en uso"
let informeActivoChart = null;

async function renderInformeResumenEjecutivo(container) {
    // 1. Ya no se genera el HTML de los filtros aquí.
    container.innerHTML = `<div class="skeleton" style="height: 100px;"></div>`;

    // 2. EXTRAEMOS LAS FECHAS DEL SELECTOR que ya existe en el DOM
    const { sDate, eDate } = getDatesFromReportFilter('resumen_ejecutivo');

    if (!sDate || !eDate) {
        container.innerHTML = `<p class="form-label">Por favor, selecciona un rango de fechas válido.</p>`;
        return;
    }

    // 3. OBTENEMOS y FILTRAMOS LOS DATOS (esta lógica no cambia)
    const conceptoInicial = db.conceptos.find(c => c.nombre.toLowerCase() === 'inicial');
    const conceptoInicialId = conceptoInicial ? conceptoInicial.id : null;

    const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos')
        .where('fecha', '>=', sDate.toISOString())
        .where('fecha', '<=', eDate.toISOString())
        .get();

    const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));
    const movements = snapshot.docs.map(doc => doc.data()).filter(m => {
        if (m.conceptoId === conceptoInicialId) return false;
        if (m.tipo === 'traspaso') return visibleAccountIds.has(m.cuentaOrigenId) || visibleAccountIds.has(m.cuentaDestinoId);
        return visibleAccountIds.has(m.cuentaId);
    });

    const saldos = await getSaldos();
    const patrimonioNeto = Object.values(saldos).reduce((sum, s) => sum + s, 0);

    const { ingresos, gastos, saldoNeto } = calculateTotals(movements, visibleAccountIds);
    const tasaAhorro = ingresos > 0 ? (saldoNeto / ingresos) * 100 : 0;

    // 4. RENDERIZAMOS LOS RESULTADOS en el contenedor que nos han pasado
    container.innerHTML = `
        <div class="kpi-grid" id="kpi-data-resumen_ejecutivo">
             <div class="kpi-item" data-label="Patrimonio Neto Total" data-value="${patrimonioNeto}">
                <h4 class="kpi-item__label">Patrimonio Neto Total</h4>
                <strong class="kpi-item__value">${formatCurrency(patrimonioNeto)}</strong>
                <div class="kpi-item__comparison">Valor actual global</div>
            </div>
            <div class="kpi-item" data-label="Flujo de Caja Neto" data-value="${saldoNeto}">
                <h4 class="kpi-item__label">Flujo de Caja Neto</h4>
                <strong class="kpi-item__value ${saldoNeto >= 0 ? 'text-positive' : 'text-negative'}">${formatCurrency(saldoNeto)}</strong>
            </div>
            <div class="kpi-item" data-label="Tasa de Ahorro" data-value="${tasaAhorro.toFixed(1)}%">
                <h4 class="kpi-item__label">Tasa de Ahorro</h4>
                <strong class="kpi-item__value ${tasaAhorro >= 10 ? 'text-positive' : 'text-warning'}">${tasaAhorro.toFixed(1)}%</strong>
            </div>
        </div>`;
}


async function renderInformeAsignacionActivos(container) {
    // CAMBIO 1: La función interna 'getAssetClass' ya no es necesaria y se ha eliminado.

    const saldos = await getSaldos();
    
    // CAMBIO 2: Modificamos la lógica de agrupación. Ahora usamos el "tipo" de la cuenta directamente.
    const assetAllocation = getVisibleAccounts().reduce((acc, cuenta) => {
        // Mantenemos la exclusión de las deudas para no distorsionar el gráfico de activos.
        if (cuenta.tipo.toUpperCase() !== 'PRÉSTAMO' && cuenta.tipo.toUpperCase() !== 'TARJETA DE CRÉDITO') {
            // Usamos 'toSentenceCase' para un formato limpio (ej: 'banco' -> 'Banco')
            const assetType = toSentenceCase(cuenta.tipo || 'Sin Tipo');
            acc[assetType] = (acc[assetType] || 0) + (saldos[cuenta.id] || 0);
        }
        return acc;
    }, {});

    const labels = Object.keys(assetAllocation);
    const data = Object.values(assetAllocation).map(v => v / 100);

    // CAMBIO 3: Actualizamos el texto descriptivo para que refleje la nueva vista detallada.
    container.innerHTML = `
        <p class="form-label" style="margin-bottom: var(--sp-3);">Distribución detallada de tu patrimonio, agrupado por el tipo específico de cada cuenta. Esto te da una visión granular de la composición de tus activos.</p>
        <div class="chart-container" style="height: 280px;">
            <canvas id="asignacion-activos-chart"></canvas>
        </div>
        <!-- Aquí iría la tabla de rebalanceo en una futura iteración -->
    `;

    const ctx = select('asignacion-activos-chart').getContext('2d');
    
    // El resto de la lógica del gráfico no necesita cambios, ya que se adapta a los nuevos datos.
    informeActivoChart = new Chart(ctx, {
        type: 'doughnut',
        data: { 
            labels, 
            datasets: [{ 
                data, 
                backgroundColor: ['#007AFF', '#30D158', '#FFD60A', '#FF3B30', '#BF5AF2', '#5E5CE6', '#FF9F0A', '#45B6E9', '#D158A7'] 
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'right' }, 
                datalabels: { 
                    formatter: (val, ctx) => { 
                        const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0); 
                        const percentage = (val * 100 / sum);
                        // Solo mostramos la etiqueta si es mayor al 3% para no saturar el gráfico
                        return percentage > 3 ? percentage.toFixed(1) + '%' : '';
                    }, 
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    }
                } 
            } 
        }
    });
}
    
    /**
     * Renderiza el informe: Scorecard de Rendimiento de Inversiones.
     */
    async function renderInformeRendimientoInversiones(container) {
    const investmentAccounts = getVisibleAccounts().filter(c => c.esInversion);
    if (investmentAccounts.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>No tienes cuentas marcadas como "inversión".</p></div>`;
        return;
    }

    // 1. OBTENER DATOS DE CADA ACTIVO
    let performanceData = await Promise.all(
        investmentAccounts.map(async (cuenta) => {
            const perf = await calculatePortfolioPerformance(cuenta.id);
            return { ...cuenta, ...perf };
        })
    );

    // 2. ORDENAR LOS DATOS por valor actual de mayor a menor
    performanceData.sort((a, b) => b.valorActual - a.valorActual);

    // 3. CALCULAR EL SUMARIO TOTAL
    const portfolioTotal = await calculatePortfolioPerformance(); // Obtenemos el rendimiento global

    // 4. CONSTRUIR EL HTML DE LA TABLA
    let tableHtml = `
        <p class="form-label" style="margin-bottom: var(--sp-3);">Comparativa de rendimiento de tus activos de inversión, ordenados por valor de mercado.</p>
        <div style="overflow-x: auto;">
            <table id="table-data-rendimiento_inversiones" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th>Activo</th>
                        <th>Valor Actual</th>
                        <th>P&L (€)</th>
                        <th>P&L (%)</th>
                        <th>TIR Anual</th>
                    </tr>
                </thead>
                <tbody>`;

    // Añadir una fila por cada activo
    performanceData.forEach(perf => {
        const pnlClass = perf.pnlAbsoluto >= 0 ? 'text-positive' : 'text-negative';
        const tirClass = perf.irr >= 0.05 ? 'text-positive' : (perf.irr >= 0 ? 'text-warning' : 'text-negative');
        tableHtml += `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid var(--c-outline);">${perf.nombre}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--c-outline); text-align: right;">${formatCurrency(perf.valorActual)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--c-outline); text-align: right;" class="${pnlClass}">${formatCurrency(perf.pnlAbsoluto)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--c-outline); text-align: right;" class="${pnlClass}">${perf.pnlPorcentual.toFixed(2)}%</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--c-outline); text-align: right;" class="${tirClass}">${(perf.irr * 100).toFixed(2)}%</td>
            </tr>`;
    });

    tableHtml += `</tbody>`;

    // --- AÑADIR LA NUEVA FILA DE SUMARIO ---
    const totalPnlClass = portfolioTotal.pnlAbsoluto >= 0 ? 'text-positive' : 'text-negative';
    const totalTirClass = portfolioTotal.irr >= 0.05 ? 'text-positive' : (portfolioTotal.irr >= 0 ? 'text-warning' : 'text-negative');

    tableHtml += `
        <tfoot style="font-weight: 700; border-top: 2px solid var(--c-outline);">
            <tr>
                <td style="padding: 10px 8px;">TOTAL PORTAFOLIO</td>
                <td style="padding: 10px 8px; text-align: right;">${formatCurrency(portfolioTotal.valorActual)}</td>
                <td style="padding: 10px 8px; text-align: right;" class="${totalPnlClass}">${formatCurrency(portfolioTotal.pnlAbsoluto)}</td>
                <td style="padding: 10px 8px; text-align: right;" class="${totalPnlClass}">${portfolioTotal.pnlPorcentual.toFixed(2)}%</td>
                <td style="padding: 10px 8px; text-align: right;" class="${totalTirClass}">${(portfolioTotal.irr * 100).toFixed(2)}%</td>
            </tr>
        </tfoot>`;

    tableHtml += `</table></div>`;
    container.innerHTML = tableHtml;
}

/**
 * Función "router" que llama al renderizador de informe correcto cuando se abre un acordeón.
 * @param {string} informeId - El ID del informe a mostrar.
 */
async function renderInformeDetallado(informeId) {
    const container = select(`informe-content-${informeId}`);
    if (!container) return;

    if (informeActivoChart) {
        informeActivoChart.destroy();
        informeActivoChart = null;
    }
    
    container.innerHTML = `<div class="skeleton" style="height: 200px; border-radius: var(--border-radius-lg);"></div>`;

    try {
        const reportRenderers = {
            'extracto_cuenta': () => { // El extracto tiene una lógica de formulario diferente
                const content = `
                    <form id="informe-cuenta-form" novalidate>
                        <div class="form-group">
                            <label for="informe-cuenta-select" class="form-label">Selecciona una cuenta para ver su historial completo:</label>
                            <select id="informe-cuenta-select" class="form-select" required></select>
                        </div>
                        <button type="submit" class="btn btn--primary btn--full">Generar Extracto</button>
                    </form>
                    <div id="informe-resultado-container" style="margin-top: var(--sp-4);"></div>`;
                container.innerHTML = content;
                const populate = (id, data, nameKey, valKey='id') => {
                    const el = select(id); if (!el) return;
                    let opts = '<option value="">Seleccionar cuenta...</option>';
                    [...data].sort((a,b) => (a[nameKey]||"").localeCompare(b[nameKey]||"")).forEach(i => opts += `<option value="${i[valKey]}">${i[nameKey]}</option>`);
                    el.innerHTML = opts;
                };
                populate('informe-cuenta-select', getVisibleAccounts(), 'nombre', 'id');
            },
            
            // Aquí puedes añadir más informes en el futuro
        };

        if (reportRenderers[informeId]) {
            await reportRenderers[informeId](container);
        } else {
            container.innerHTML = `<div class="empty-state"><p>Informe no disponible.</p></div>`;
        }
    } catch (error) {
        console.error(`Error al renderizar el informe '${informeId}':`, error);
        container.innerHTML = `<div class="empty-state text-danger"><p>Error al generar el informe.</p></div>`;
    }
}

   
const renderDashboardActionCenter = () => {
    return `
    <div class="card" id="action-center-widget">
        <h3 class="card__title">
            <span class="material-icons text-warning">notifications_active</span>
            <span>Centro de Acciones</span>
        </h3>
        <div class="card__content" id="action-center-content" style="padding-top: 0; padding-bottom: var(--sp-2);">
            <div class="skeleton" style="height: 70px; border-radius: var(--border-radius-md);"></div>
        </div>
    </div>`;
};
// --- ▼▼▼ PEGA ESTAS DOS NUEVAS FUNCIONES COMPLETAS ▼▼▼ ---

/**
 * Renderiza el esqueleto del widget "Colchón de Emergencia".
 */
const renderDashboardEmergencyFund = () => {
    return `
    <div class="card" id="emergency-fund-widget">
        <h3 class="card__title">
            <span class="material-icons text-info">shield</span>
            <span>Colchón de Emergencia</span>
            <button class="icon-btn" data-action="show-help-topic" data-topic="colchon-emergencia" style="width: 20px; height: 20px; margin-left: 4px;">
                <span class="material-icons" style="font-size: 16px;">help_outline</span>
            </button>
        </h3>
        <div class="card__content skeleton" style="padding-top: 0;">
            <div class="kpi-item" style="padding: var(--sp-2) 0; text-align: center;">
                <strong id="kpi-ef-months-value" class="kpi-item__value" style="font-size: 2.2rem; line-height: 1.1;">0.0</strong>
                <h4 class="kpi-item__label" style="margin-top: 0;">Meses de Cobertura</h4>
            </div>
            <progress id="kpi-ef-progress" max="6" value="0" style="width: 100%; height: 8px;"></progress>
            <p id="kpi-ef-text" class="kpi-item__comparison" style="text-align: center; margin-top: var(--sp-2); min-height: 14px;"></p>
        </div>
    </div>`;
};

/**
 * Renderiza el esqueleto del widget "Progreso Hacia la Independencia Financiera".
 */
const renderDashboardFIProgress = () => {
    return `
    <div class="card" id="fi-progress-widget">
        <h3 class="card__title">
            <span class="material-icons text-positive">flag</span>
            <span>Independencia Financiera</span>
            <button class="icon-btn" data-action="show-help-topic" data-topic="independencia-financiera" style="width: 20px; height: 20px; margin-left: 4px;">
                <span class="material-icons" style="font-size: 16px;">help_outline</span>
            </button>
        </h3>
        <div class="card__content skeleton" style="padding-top: 0;">
            <div class="kpi-item" style="padding: var(--sp-2) 0; text-align: center;">
                <strong id="kpi-fi-percentage-value" class="kpi-item__value" style="font-size: 2.2rem; line-height: 1.1;">0.0%</strong>
                <h4 class="kpi-item__label" style="margin-top: 0;">Completado</h4>
            </div>
            <progress id="kpi-fi-progress" max="100" value="0" style="width: 100%; height: 8px;"></progress>
            <p id="kpi-fi-text" class="kpi-item__comparison" style="text-align: center; margin-top: var(--sp-2); min-height: 14px;"></p>
        </div>
    </div>`;
};

// --- ▲▲▲ FIN DEL CÓDIGO A PEGAR ▲▲▲ ---

/**
 * Renderiza el esqueleto del nuevo widget "Evolución del Patrimonio".
 */
const renderDashboardNetWorthTrend = () => {
    return `
    <div class="card" id="net-worth-trend-widget">
        <h3 class="card__title"><span class="material-icons">show_chart</span>Evolución del Patrimonio Neto</h3>
        <div class="card__content">
            <div class="chart-container skeleton" style="height: 220px; border-radius: var(--border-radius-lg);">
                <canvas id="net-worth-chart"></canvas>
            </div>
        </div>
    </div>`;
};


/**
 * Dibuja un gráfico de tipo "gauge" (velocímetro) para la Tasa de Ahorro.
 * @param {string} canvasId - El ID del elemento canvas.
 * @param {number} percentage - El porcentaje de ahorro a mostrar.
 */
const renderSavingsRateGauge = (canvasId, percentage) => {
    const canvas = select(canvasId);
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;

    if (Chart.getChart(canvasId)) {
        Chart.getChart(canvasId).destroy();
    }

    let color;
    if (percentage < 0) color = 'var(--c-danger)';
    else if (percentage < 10) color = 'var(--c-warning)';
    else color = 'var(--c-success)';
    
    const value = Math.max(0, Math.min(100, percentage)); // Aseguramos que el valor esté entre 0 y 100 para el gráfico

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [getComputedStyle(document.body).getPropertyValue(color).trim(), getComputedStyle(document.body).getPropertyValue('--c-surface-variant').trim()],
                borderColor: 'transparent',
                borderWidth: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 180,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                datalabels: { display: false }
            }
        }
    });
};

const renderDashboardKpiSummary = () => {
   // ¡Simplemente eliminamos el atributo style!
   return `<div class="kpi-grid" id="kpi-container">
            <div class="kpi-item">
                <h4 class="kpi-item__label">Ingresos</h4>
                <strong id="kpi-ingresos-value" class="kpi-item__value text-positive skeleton" data-current-value="0">+0,00 €</strong> 
                <div id="kpi-ingresos-comparison" class="kpi-item__comparison"></div>
            </div>
            <div class="kpi-item">
                <h4 class="kpi-item__label">Gastos</h4>
                <strong id="kpi-gastos-value" class="kpi-item__value text-negative skeleton" data-current-value="0">0,00 €</strong>
                <div id="kpi-gastos-comparison" class="kpi-item__comparison"></div>
            </div>
            <div class="kpi-item">
                <h4 class="kpi-item__label">Saldo Neto Periodo</h4>
                <strong id="kpi-saldo-neto-value" class="kpi-item__value skeleton" data-current-value="0">0,00 €</strong>
                <div id="kpi-saldo-neto-comparison" class="kpi-item__comparison"></div>
            </div>
        </div>`;
};
// ▼▼▼ REEMPLAZA TU FUNCIÓN renderDashboardSuperCentroOperaciones CON ESTA VERSIÓN REORDENADA ▼▼▼

const renderDashboardSuperCentroOperaciones = () => {
    const skeletonRows = Array(3).fill('<div class="skeleton" style="height: 48px; margin-bottom: var(--sp-2); border-radius: 8px;"></div>').join('');
    
    return `
    <div class="card card--no-bg" id="super-centro-operaciones-widget">
        <div class="accordion-wrapper">
            <details class="accordion" open>
                <summary>
                    <h3 class="card__title" style="margin: 0; padding: 0; color: var(--c-on-surface);">
                        <span class="material-icons">query_stats</span>
                        Centro de Operaciones
                    </h3>
                    <span class="material-icons accordion__icon">expand_more</span>
                </summary>

                <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                    
                    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
                        <div class="kpi-item">
                            <h4 class="kpi-item__label" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                                <span>Patrimonio Neto Total</span>
                                <button class="icon-btn" data-action="show-help-topic" data-topic="patrimonio-neto" style="width: 20px; height: 20px;">
                                    <span class="material-icons" style="font-size: 16px;">help_outline</span>
                                </button>
                            </h4>
                            <strong id="kpi-patrimonio-neto-value" class="kpi-item__value skeleton" data-current-value="0">0,00 €</strong>
                            <div class="kpi-item__comparison">Vista global actual</div>
                        </div>
                        <div class="kpi-item">
                            <h4 class="kpi-item__label" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                                <span>Tasa de Ahorro</span>
                                <button class="icon-btn" data-action="show-help-topic" data-topic="tasa-ahorro" style="width: 20px; height: 20px;">
                                    <span class="material-icons" style="font-size: 16px;">help_outline</span>
                                </button>
                            </h4>
                            <div style="position: relative; height: 60px; margin: auto;">
                                 <canvas id="kpi-savings-rate-chart"></canvas>
                                 <div id="kpi-tasa-ahorro-value" class="kpi-item__value skeleton" style="position: absolute; top: 60%; left: 50%; transform: translate(-50%, -50%);">0%</div>
                            </div>
                            <div id="kpi-tasa-ahorro-comparison" class="kpi-item__comparison"></div>
                        </div>
                        <div class="kpi-item">
                            <h4 class="kpi-item__label" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                                <span>P&L Portafolio Inversión</span>
                                 <button class="icon-btn" data-action="show-help-topic" data-topic="pnl-inversion" style="width: 20px; height: 20px;">
                                    <span class="material-icons" style="font-size: 16px;">help_outline</span>
                                </button>
                            </h4>
                            <strong id="kpi-pnl-inversion-value" class="kpi-item__value skeleton" data-current-value="0">0,00 €</strong>
                            <div id="kpi-pnl-inversion-comparison" class="kpi-item__comparison">Rentabilidad total</div>
                        </div>
                    </div>

                    <hr style="border-color: var(--c-outline); opacity: 0.5; margin: var(--sp-5) 0;">

                    <!-- ▼▼▼ BLOQUE DE FILTROS MOVIDO AQUÍ ▼▼▼ -->
                    <div class="report-filters">
                        <div class="form-group" style="margin-bottom: var(--sp-2);">
                            <select id="filter-periodo" class="form-select report-period-selector">
                                <option value="mes-actual">Este Mes</option>
                                <option value="año-actual">Este Año</option>
                                <option value="custom">Personalizado</option>
                            </select>
                        </div>
                        <div id="custom-date-filters" class="form-grid hidden" style="grid-template-columns: 1fr 1fr;">
                            <input type="date" id="filter-fecha-inicio" class="form-input">
                            <input type="date" id="filter-fecha-fin" class="form-input">
                        </div>
                        <button class="btn btn--secondary btn--full hidden" data-action="apply-filters" style="margin-top:var(--sp-2)">Aplicar</button>
                    </div>
                    <!-- ▲▲▲ FIN DEL BLOQUE DE FILTROS MOVIDO ▲▲▲ -->

                    <hr style="border-color: var(--c-outline); opacity: 0.5; margin: var(--sp-5) 0;">

                    <div class="kpi-grid" id="kpi-container" style="margin-bottom: var(--sp-5);">
                        <button class="kpi-item" data-action="show-kpi-drilldown" data-type="ingresos">
                            <h4 class="kpi-item__label">Ingresos</h4>
                            <strong id="kpi-ingresos-value" class="kpi-item__value text-positive skeleton" data-current-value="0">+0,00 €</strong> 
                            <div id="kpi-ingresos-comparison" class="kpi-item__comparison"></div>
                        </button>
                        <button class="kpi-item" data-action="show-kpi-drilldown" data-type="gastos">
                            <h4 class="kpi-item__label">Gastos</h4>
                            <strong id="kpi-gastos-value" class="kpi-item__value text-negative skeleton" data-current-value="0">0,00 €</strong>
                            <div id="kpi-gastos-comparison" class="kpi-item__comparison"></div>
                        </button>
                        <button class="kpi-item" data-action="show-kpi-drilldown" data-type="saldoNeto">
                            <h4 class="kpi-item__label">Saldo Neto Periodo</h4>
                            <strong id="kpi-saldo-neto-value" class="kpi-item__value skeleton" data-current-value="0">0,00 €</strong>
                            <div id="kpi-saldo-neto-comparison" class="kpi-item__comparison"></div>
                        </button>
                    </div>
                    
                    <hr style="border-color: var(--c-outline); opacity: 0.5; margin: var(--sp-5) 0;">

                    <h3 class="card__title" style="padding: 0 0 var(--sp-3) 0;"><span class="material-icons">category</span>Totales por Concepto</h3>
                    <div class="chart-container skeleton" style="height: 240px; margin-bottom: var(--sp-2); border-radius: var(--border-radius-lg);">
                        <canvas id="conceptos-chart"></canvas>
                    </div>
                    <div id="concepto-totals-list">${skeletonRows}</div>

                </div>
            </details>
        </div>
    </div>`;
};

const renderDashboardExpandedKpiSummary = () => {
    return `
    <div class="card" id="kpi-ampliado-widget">
        <h3 class="card__title"><span class="material-icons">query_stats</span>Centro de Operaciones</h3>
        <div class="card__content">
            <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
                
                <div class="kpi-item">
                    <h4 class="kpi-item__label" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span>Tasa de Ahorro</span>
                        <button class="icon-btn" data-action="show-help-topic" data-topic="tasa-ahorro" style="width: 20px; height: 20px;">
                            <span class="material-icons" style="font-size: 16px;">help_outline</span>
                        </button>
                    </h4>
                    <div style="position: relative; height: 60px; margin: auto;">
                         <canvas id="kpi-savings-rate-chart"></canvas>
                         <div id="kpi-tasa-ahorro-value" class="kpi-item__value skeleton" style="position: absolute; top: 60%; left: 50%; transform: translate(-50%, -50%);">0%</div>
                    </div>
                    <div id="kpi-tasa-ahorro-comparison" class="kpi-item__comparison"></div>
                </div>

                <div class="kpi-item">
                    <h4 class="kpi-item__label" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span>Patrimonio Neto Total</span>
                        <button class="icon-btn" data-action="show-help-topic" data-topic="patrimonio-neto" style="width: 20px; height: 20px;">
                            <span class="material-icons" style="font-size: 16px;">help_outline</span>
                        </button>
                    </h4>
                    <strong id="kpi-patrimonio-neto-value" class="kpi-item__value skeleton" data-current-value="0">0,00 €</strong>
                    <div class="kpi-item__comparison">Vista global actual</div>
                </div>
                
                <div class="kpi-item">
                    <h4 class="kpi-item__label" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span>P&L Portafolio Inversión</span>
                         <button class="icon-btn" data-action="show-help-topic" data-topic="pnl-inversion" style="width: 20px; height: 20px;">
                            <span class="material-icons" style="font-size: 16px;">help_outline</span>
                        </button>
                    </h4>
                    <strong id="kpi-pnl-inversion-value" class="kpi-item__value skeleton" data-current-value="0">0,00 €</strong>
                    <div id="kpi-pnl-inversion-comparison" class="kpi-item__comparison">Rentabilidad total</div>
                </div>

                <div class="kpi-item" style="grid-column: 1 / -1;">
                     <h4 class="kpi-item__label" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span>Progreso Presupuesto (Gastos del Periodo)</span>
                        <button class="icon-btn" data-action="show-help-topic" data-topic="progreso-presupuesto" style="width: 20px; height: 20px;">
                            <span class="material-icons" style="font-size: 16px;">help_outline</span>
                        </button>
                    </h4>
                    <div class="budget-item__progress" style="margin: 8px 0;">
                        <progress id="kpi-presupuesto-progress" max="100" value="0" style="width: 100%; height: 8px;" class="budget-item__progress"></progress>
                    </div>
                    <div id="kpi-presupuesto-text" class="kpi-item__comparison skeleton" style="height: auto; min-height: 14px;">Calculando...</div>
                </div>

            </div>
        </div>
    </div>`;
};
           const renderDashboardConceptTotals = () => {
            // Generamos 3 filas de esqueleto para la lista
            const skeletonRows = Array(3).fill('<div class="skeleton" style="height: 48px; margin-bottom: var(--sp-2); border-radius: 8px;"></div>').join('');
            
            return `
                <div class="card card--no-bg" id="concept-totals-widget">
                    <div class="accordion-wrapper">
                        <details class="accordion" open>
                            <summary>
                                <h3 class="card__title" style="margin: 0; padding: 0; color: var(--c-on-surface);"><span class="material-icons">category</span>Totales por Concepto</h3>
                                <span class="material-icons accordion__icon">expand_more</span>
                            </summary>
                            <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                                <div class="chart-container skeleton" style="height: 240px; margin-bottom: var(--sp-2); border-radius: var(--border-radius-lg);">
                                    <canvas id="conceptos-chart"></canvas>
                                </div>
                                <div id="concepto-totals-list">${skeletonRows}</div>
                            </div>
                        </details>
                    </div>
                </div>`;
        };

/// ▼▼▼ REEMPLAZA TU FUNCIÓN renderInicioResumenView POR COMPLETO CON ESTA VERSIÓN ▼▼▼
const renderInicioResumenView = () => {
    const resumenContentContainer = select('resumen-content-container');
    if (!resumenContentContainer) return;

    destroyAllCharts();

    const widgetOrder = (db.config && db.config.dashboardWidgets) || DEFAULT_DASHBOARD_WIDGETS;

    // AHORA, esta función solo imprime los esqueletos con una etiqueta especial.
    resumenContentContainer.innerHTML = widgetOrder.map(widgetId => {
        // La etiqueta es 'data-widget-type'
        switch(widgetId) {
        case 'super-centro-operaciones':
            return `<div data-widget-type="super-centro-operaciones">${renderDashboardSuperCentroOperaciones()}</div>`;
        case 'action-center':
            return `<div data-widget-type="action-center">${renderDashboardActionCenter()}</div>`;
        case 'net-worth-trend':
            return `<div data-widget-type="net-worth-trend">${renderDashboardNetWorthTrend()}</div>`;
        case 'patrimonio-structure':
           return `<div data-widget-type="patrimonio-structure"><div class="card" id="patrimonio-widget"><div id="patrimonio-completo-container"><div class="skeleton" style="height:250px;"></div></div></div></div>`;
        case 'emergency-fund':
            return `<div data-widget-type="emergency-fund">${renderDashboardEmergencyFund()}</div>`;
        case 'fi-progress':
            return `<div data-widget-type="fi-progress">${renderDashboardFIProgress()}</div>`;
        case 'informe-personalizado':
             return `<div data-widget-type="informe-personalizado">${renderDashboardInformeWidget()}</div>`;
        default:
            return '';
    }
    }).join('<div style="height: var(--sp-4);"></div>');
    
    // ¡IMPORTANTE! Después de dibujar los esqueletos, le decimos a nuestro "asistente" que empiece a observar.
    initWidgetObserver();
};
		
        const _renderRecientesFromCache = async () => {
            const recientesContainer = select('inicio-view-recientes');
            if (!recientesContainer) return;
            
            const movsToDisplay = recentMovementsCache;
            
            if (movsToDisplay.length === 0) {
                recientesContainer.innerHTML = `<div class="empty-state" style="border: none; background: transparent;"><p>No hay movimientos recientes en esta contabilidad.</p></div>`;
                return;
            }

            await processMovementsForRunningBalance(movsToDisplay, true); 

            const grouped = {};
            const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));
            movsToDisplay.forEach(mov => {
                const dateKey = mov.fecha.slice(0, 10);
                if (!grouped[dateKey]) {
                    grouped[dateKey] = { movements: [], total: 0 };
                }
                grouped[dateKey].movements.push(mov);
                if (mov.tipo === 'traspaso') {
                    const origenVisible = visibleAccountIds.has(mov.cuentaOrigenId);
                    const destinoVisible = visibleAccountIds.has(mov.cuentaDestinoId);
                    if (origenVisible && !destinoVisible) { grouped[dateKey].total -= mov.cantidad; }
                    else if (!origenVisible && destinoVisible) { grouped[dateKey].total += mov.cantidad; }
                } else {
                    grouped[dateKey].total += mov.cantidad;
                }
            });

            let html = '';
            const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
            for (const dateKey of sortedDates) {
                const group = grouped[dateKey];
                html += renderVirtualListItem({ type: 'date-header', date: dateKey, total: group.total });
                
                group.movements.sort((a, b) => b.id.localeCompare(a.id));

                for (const mov of group.movements) {
                    html += renderVirtualListItem({ type: 'transaction', movement: mov });
                }
            }
            html += `<div style="text-align: center; margin-top: var(--sp-4);"><button class="btn btn--secondary" data-action="navigate" data-page="${PAGE_IDS.DIARIO}">Ver todos los movimientos</button></div>`;
            recientesContainer.innerHTML = html;
        };
		 const renderPendingRecurrents = () => {
    const container = select('pending-recurrents-container');
    if (!container || !db.recurrentes) return;

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    const pending = db.recurrentes
    .filter(r => {
        // --- ¡ESTA ES LA CORRECCIÓN CLAVE! ---
        // Primero, nos aseguramos de que la fecha existe antes de intentar usarla.
        if (!r.nextDate) return false;

        const nextDate = parseDateStringAsUTC(r.nextDate);
        // Segundo, comprobamos que la fecha se ha podido interpretar correctamente.
        if (!nextDate) return false;

        const normalizedNextDate = new Date(Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth(), nextDate.getUTCDate()));
        return normalizedNextDate <= today;
    })
    .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));

    if (pending.length === 0) {
        container.innerHTML = '';
        return;
    }

    const itemsHTML = pending.map(r => {
        const nextDate = new Date(r.nextDate + 'T12:00:00Z');
        const formattedDate = nextDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        const amountClass = r.cantidad >= 0 ? 'text-positive' : 'text-negative';
        const dateText = `Pendiente desde: ${formattedDate}`;

        return `
        <div class="transaction-card" id="pending-recurrente-${r.id}" style="background-color: color-mix(in srgb, var(--c-warning) 10%, transparent);">
            <div class="transaction-card__indicator transaction-card__indicator--recurrent"></div>
            <div class="transaction-card__content">
                <div class="transaction-card__details">
                    <div class="transaction-card__row-1">${escapeHTML(r.descripcion)}</div>
                    <div class="transaction-card__row-2" style="font-weight: 600; color: var(--c-warning);">${dateText}</div>
                </div>
                <div class="transaction-card__figures" style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                    <strong class="transaction-card__amount ${amountClass}">${formatCurrency(r.cantidad)}</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                <div class="transaction-card__recurrent-actions">
    <button class="btn btn--secondary" data-action="skip-recurrent" data-id="${r.id}" title="Omitir esta vez" style="padding: 4px 8px; font-size: 0.7rem;">
<span class="material-icons" style="font-size: 14px;">skip_next</span>No añadir
</button>
<button class="btn btn--primary" data-action="confirm-recurrent" data-id="${r.id}" title="Crear el movimiento ahora" style="padding: 4px 8px; font-size: 0.7rem;">
<span class="material-icons" style="font-size: 14px;">check</span>Añadir Ahora
</button>
</div>
</div>
</div>
`;
}).join('');

            container.innerHTML = `
        <div class="card card--no-bg accordion-wrapper" style="margin-top: var(--sp-4);">
            <details class="accordion" open>
                <summary>
                    <h3 class="card__title" style="margin: 0; padding: 0; color: var(--c-on-surface);">
                        <span class="material-icons">event_repeat</span>
                        Operaciones Recurrentes Pendientes
                    </h3>
                    <span class="material-icons accordion__icon">expand_more</span>
                </summary>
                <div class="accordion__content" style="padding: 0 var(--sp-2) var(--sp-2) var(--sp-2);">
                <div class="contenedor-recurrentes-vertical">
            ${itemsHTML}
        </div>
    </div>
            </details>
        </div>
    `;
};


// main.js - ASEGÚRATE DE QUE ESTA ES LA ÚNICA VERSIÓN DE ESTA FUNCIÓN

const renderPlanificacionPage = () => {
    const container = select(PAGE_IDS.PLANIFICAR);
    if(!container) return;

    // HTML que define la estructura de la página con los 3 acordeones.
    container.innerHTML = `
        <!-- 1. ACORDEÓN DE MOVIMIENTOS RECURRENTES (AHORA CERRADO POR DEFECTO) -->
        <div class="card card--no-bg accordion-wrapper">
            <details class="accordion">
                <summary>
                    <h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);"><span class="material-icons">event_repeat</span>Movimientos Recurrentes</h3>
                    <span class="material-icons accordion__icon">expand_more</span>
                </summary>
                <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                    <div id="pending-recurrents-container"></div>
                    <p class="form-label" style="margin-bottom: var(--sp-3);">Pulsa en una operación para editarla. Estas son las que se ejecutarán en el futuro.</p>
                    <div id="recurrentes-list-container"></div>
                </div>
            </details>
        </div>

        <!-- 2. ACORDEÓN DE PRESUPUESTOS ANUALES (SIN CAMBIOS) -->
        <div class="card card--no-bg accordion-wrapper">
            <details class="accordion">
                <summary>
                    <h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);"><span class="material-icons">request_quote</span>Presupuestos Anuales</h3>
                    <span class="material-icons accordion__icon">expand_more</span>
                </summary>
                <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-4);">
                        <div class="form-group" style="flex-grow: 1; margin: 0;">
                            <label for="budget-year-selector" class="form-label">Año del Presupuesto</label>
                            <select id="budget-year-selector" class="form-select"></select>
                        </div>
                        <button data-action="update-budgets" class="btn btn--secondary" style="margin-left: var(--sp-3);">
                            <span class="material-icons" style="font-size: 16px;">edit_calendar</span><span>Gestionar</span>
                        </button>
                    </div>
                    <div id="annual-budget-dashboard">
                        <div id="budget-kpi-container" class="kpi-grid"></div>
                        <div class="card" style="margin-top: var(--sp-4);">
                            <h3 class="card__title"><span class="material-icons">trending_up</span>Tendencia Ingresos y Gastos</h3>
                            <div class="card__content">
                                <div class="chart-container" style="height: 220px;"><canvas id="budget-trend-chart"></canvas></div>
                            </div>
                        </div>
                        <div id="budget-details-list" style="margin-top: var(--sp-4);"></div>
                    </div>
                    <div id="budget-init-placeholder" class="empty-state hidden">
                        <span class="material-icons">edit_calendar</span>
                        <h3 id="budget-placeholder-title">Define tu Plan Financiero</h3>
                        <p id="budget-placeholder-text">Establece límites de gasto y metas de ingreso para tomar el control de tu año. ¡Empieza ahora!</p>
                        <button data-action="update-budgets" class="btn btn--primary" style="margin-top: var(--sp-4);">
                            <span class="material-icons" style="font-size: 16px;">add_circle_outline</span><span>Crear Presupuestos</span>
                        </button>
                    </div>
                </div>
            </details>
        </div>

        <!-- 3. ¡NUEVO ACORDEÓN! EXTRACTO DE CUENTA / CARTILLA -->
        <div class="card card--no-bg accordion-wrapper">
            <details id="acordeon-extracto_cuenta" class="accordion informe-acordeon">
                <summary>
                    <h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);">
                        <span class="material-icons">wysiwyg</span>
                        <span>Extracto de Cuenta (Cartilla)</span>
                    </h3>
                    <span class="material-icons accordion__icon">expand_more</span>
                </summary>
                <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                    <div id="informe-content-extracto_cuenta">
                         <form id="informe-cuenta-form" novalidate>
                            <div class="form-group">
                                <label for="informe-cuenta-select" class="form-label">Selecciona una cuenta para ver su historial completo:</label>
                                <select id="informe-cuenta-select" class="form-select" required></select>
                            </div>
                            <button type="submit" class="btn btn--primary btn--full">Generar Extracto</button>
                        </form>
                        <div id="informe-resultado-container" style="margin-top: var(--sp-4);"></div>
                    </div>
                </div>
            </details>
        </div>
    `;
    
    // Llamamos a las funciones que rellenarán este HTML con datos.
    populateAllDropdowns(); // <-- Esta función rellenará el nuevo selector de cuentas.
    renderBudgetTracking();
    renderPendingRecurrents();
    renderRecurrentsListOnPage();
};
 const renderInversionesView = () => {
    const container = select(PAGE_IDS.INVERSIONES);
    if (!container) return;

    // Ahora esta función se encarga de TODO: crea el esqueleto y llama a las funciones que lo rellenan.
    container.innerHTML = `
        <div id="inversiones-content-container">
            <!-- Nuevo Acordeón para el Gráfico de Evolución -->
            <details class="accordion" open style="margin-bottom: var(--sp-4);">
                <summary>
                    <h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);">
                        <span class="material-icons">show_chart</span>
                        Evolución del Portafolio
                    </h3>
                    <span class="material-icons accordion__icon">expand_more</span>
                </summary>
                <div class="accordion__content" id="portfolio-evolution-container" style="padding: var(--sp-3) var(--sp-4);">
                    <!-- Esqueleto de carga para el gráfico de evolución -->
                    <div class="chart-container skeleton" style="height: 220px; border-radius: var(--border-radius-lg);"></div>
                </div>
            </details>

            <!-- El resto de tu HTML de la página de Inversiones se generará después -->
            <div id="portfolio-main-content">
                <!-- Esqueleto de carga para el resto de la página -->
                <div class="skeleton" style="height: 300px; border-radius: var(--border-radius-lg);"></div>
            </div>
        </div>
    `;
	    // Llamamos a las dos funciones que rellenarán cada parte.
    setTimeout(async () => {
        await renderPortfolioEvolutionChart('portfolio-evolution-container');
        await renderPortfolioMainContent('portfolio-main-content');
    }, 50);
};
  // =================================================================
// === INICIO: NUEVO MOTOR DE RENDERIZADO DE INFORMES Y PDF      ===
// =================================================================
async function renderInformeFlujoCaja(container) {
    // 1. Ya no se genera el HTML de los filtros aquí.
    container.innerHTML = `<div class="skeleton" style="height: 250px;"></div>`;

    // 2. EXTRAEMOS LAS FECHAS
    const { sDate, eDate } = getDatesFromReportFilter('flujo_caja');

    if (!sDate || !eDate) {
        container.innerHTML = `<p class="form-label">Por favor, selecciona un rango de fechas válido.</p>`;
        return;
    }

    // 3. OBTENEMOS y FILTRAMOS LOS DATOS (lógica sin cambios)
    const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos')
        .where('fecha', '>=', sDate.toISOString())
        .where('fecha', '<=', eDate.toISOString())
        .get();

    const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));
    const movements = snapshot.docs.map(doc => doc.data()).filter(m => {
        if (m.tipo === 'traspaso') return visibleAccountIds.has(m.cuentaOrigenId) || visibleAccountIds.has(m.cuentaDestinoId);
        return visibleAccountIds.has(m.cuentaId);
    });

    // 4. PROCESAMOS Y AGRUPAMOS LOS DATOS POR MES (lógica sin cambios)
    const monthlyData = {};
    movements.forEach(mov => {
        const d = new Date(mov.fecha);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[key]) monthlyData[key] = { ingresos: 0, gastos: 0 };
        
        let amount = calculateMovementAmount(mov, visibleAccountIds);
        if (amount > 0) monthlyData[key].ingresos += amount;
        else monthlyData[key].gastos += amount;
    });

    const sortedKeys = Object.keys(monthlyData).sort();
    const labels = sortedKeys.map(key => new Date(key + '-02').toLocaleString('es-ES', { month: 'short', year: '2-digit' }));
    const ingresosData = sortedKeys.map(key => monthlyData[key].ingresos / 100);
    const gastosData = sortedKeys.map(key => Math.abs(monthlyData[key].gastos / 100));

    // 5. RENDERIZAMOS EL GRÁFICO
    container.innerHTML = `<div class="chart-container" style="height: 250px;"><canvas id="flujo-caja-chart"></canvas></div>`;
    const ctx = select('flujo-caja-chart').getContext('2d');
    informeActivoChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Ingresos', data: ingresosData, backgroundColor: getComputedStyle(document.body).getPropertyValue('--c-success').trim() },
                { label: 'Gastos', data: gastosData, backgroundColor: getComputedStyle(document.body).getPropertyValue('--c-danger').trim() }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'top' }, datalabels: { display: false } } }
    });
}

const renderRecurrentsListOnPage = () => {
    const container = select('recurrentes-list-container');
    if (!container) return;

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const upcomingRecurrents = (db.recurrentes || [])
        .filter(r => {
            const nextDate = parseDateStringAsUTC(r.nextDate);
            // Si no hay fecha, no lo mostramos para evitar errores
            if (!nextDate) return false; 
            const normalizedNextDate = new Date(Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth(), nextDate.getUTCDate()));
            return normalizedNextDate > today;
        })
        .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));

    if (upcomingRecurrents.length === 0) {
        container.innerHTML = `<div class="empty-state" style="background: transparent; border: none; padding-top: var(--sp-2);"><p>No tienes operaciones programadas a futuro.</p></div>`;
        return;
    }

    container.innerHTML = upcomingRecurrents.map(r => {
        const nextDate = parseDateStringAsUTC(r.nextDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        
        const frequencyMap = { once: 'Única vez', daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' };
        
        const amountClass = r.cantidad >= 0 ? 'text-positive' : 'text-negative';
        const icon = r.cantidad >= 0 ? 'south_west' : 'north_east';
        
        // ▼▼▼ ¡LA ÚNICA LÍNEA QUE CAMBIA ES LA SIGUIENTE! ▼▼▼
        // Hemos añadido: data-action="edit-recurrente" y data-id="${r.id}" al div principal.
        return `
        <div class="modal__list-item" id="page-recurrente-item-${r.id}" data-action="edit-recurrente" data-id="${r.id}">
			<div style="display: flex; align-items: center; gap: 12px; flex-grow: 1; min-width: 0;">
				<span class="material-icons ${amountClass}" style="font-size: 20px;">${icon}</span>
				<div style="display: flex; flex-direction: column; min-width: 0;">
					<span style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(r.descripcion)}</span>
				<small style="color: var(--c-on-surface-secondary); font-size: var(--fs-xs);">Próximo: ${nextDate} (${frequencyMap[r.frequency] || 'N/A'})</small>
			</div>
		</div>
		<strong class="${amountClass}" style="margin-right: var(--sp-2);">${formatCurrency(r.cantidad)}</strong>
	</div>`;
    }).join('');
};

// Define los colores para cada componente del patrimonio
const NET_WORTH_COMPONENT_COLORS = {
    'Líquido': 'rgba(0, 122, 255, 0.7)',      // Azul (var(--c-primary))
    'Inversión': 'rgba(48, 209, 88, 0.7)',   // Verde (var(--c-success))
    'Propiedades': 'rgba(191, 90, 242, 0.7)', // Púrpura (var(--c-info))
    'Deuda': 'rgba(255, 69, 58, 0.7)'         // Rojo (var(--c-danger))
};

/**
 * Clasifica un tipo de cuenta en una de las categorías principales del patrimonio.
 * @param {string} accountType - El tipo de cuenta (ej. "Banco", "Broker").
 * @returns {string} La categoría del componente ('Líquido', 'Inversión', 'Propiedades', 'Deuda').
 */
const getNetWorthComponent = (accountType) => {
    const type = (accountType || '').toUpperCase();
    if (['PRÉSTAMO', 'TARJETA DE CRÉDITO'].includes(type)) return 'Deuda';
    if (['PROPIEDAD', 'INMOBILIARIO'].includes(type)) return 'Propiedades';
    if (['BROKER', 'FONDOS', 'RENTA FIJA', 'PENSIÓN', 'CRIPTO', 'FINTECH'].includes(type) || type.includes('INVERSIÓN')) return 'Inversión';
    return 'Líquido'; // Por defecto, todo lo demás es líquido (Banco, Ahorro, Efectivo, etc.)
};

/**
 * Suaviza los datos diarios a puntos semanales para un gráfico más limpio y rápido.
 * @param {object} dailyData - Objeto con datos diarios.
 * @returns {object} Objeto con datos semanales.
 */
const resampleDataWeekly = (dailyData) => {
    const weeklyData = {};
    const sortedDates = Object.keys(dailyData).sort();

    if (sortedDates.length === 0) return {};

    let lastDate = null;
    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        // Usamos el domingo (día 0) como fin de la semana
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() - date.getDay() + 7);
        const weekKey = weekEnd.toISOString().slice(0, 10);
        
        // Guardamos el último valor registrado de la semana
        weeklyData[weekKey] = dailyData[dateStr];
        lastDate = dateStr;
    });

    // Aseguramos que el último punto de datos siempre esté presente
    const lastWeekKey = new Date(new Date(lastDate).setDate(new Date(lastDate).getDate() - new Date(lastDate).getDay() + 7)).toISOString().slice(0,10);
    weeklyData[lastWeekKey] = dailyData[lastDate];
    
    return weeklyData;
};

const updateNetWorthChart = async (saldos) => {
    const canvasId = 'net-worth-chart';
    const netWorthCanvas = select(canvasId);
    if (!netWorthCanvas) return;
    const chartContainer = netWorthCanvas.closest('.chart-container');

    // AQUÍ ESTÁ LA MAGIA: Consultamos directamente a Chart.js y destruimos CUALQUIER
    // instancia que esté usando este canvas antes de intentar crear una nueva.
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) {
        existingChart.destroy();
    }
    netWorthChart = null; // Limpiamos la referencia global por si acaso.
    
    const allMovements = await fetchAllMovementsForHistory();
    // ... El resto del cuerpo de la función para obtener datos y crear el gráfico
    // se mantiene EXACTAMENTE IGUAL que en la versión que ya tenéis...
    const visibleAccountIds = new Set(Object.keys(saldos));
    const cuentas = db.cuentas.filter(c => visibleAccountIds.has(c.id));

    if (allMovements.length === 0 && cuentas.length === 0) {
        if(chartContainer) {
            chartContainer.classList.remove('skeleton');
            chartContainer.innerHTML = `<div class="empty-state" style="padding:16px 0; background:transparent; border:none;"><p>Aún no hay datos para mostrar la evolución.</p></div>`;
        }
        return;
    }
    if(chartContainer) chartContainer.classList.remove('skeleton');

    const currentComponentTotals = { 'Líquido': 0, 'Inversión': 0, 'Propiedades': 0, 'Deuda': 0 };
    cuentas.forEach(c => {
        const component = getNetWorthComponent(c.tipo);
        const balance = c.saldo || 0;
        if (component === 'Deuda') {
            currentComponentTotals.Deuda += Math.abs(balance);
        } else {
            currentComponentTotals[component] += balance;
        }
    });

    let runningComponentTotals = { ...currentComponentTotals };
    const dailyData = {};
    const todayKey = new Date().toISOString().slice(0, 10);
    dailyData[todayKey] = { ...runningComponentTotals };

    const sortedMovements = allMovements.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    for (const mov of sortedMovements) {
        let componentChange = null;
        let changeAmount = 0;

        if (mov.tipo === 'movimiento') {
            const cuenta = cuentas.find(c => c.id === mov.cuentaId);
            if (cuenta) {
                componentChange = getNetWorthComponent(cuenta.tipo);
                changeAmount = mov.cantidad;
            }
        } else if (mov.tipo === 'traspaso') {
            const origen = cuentas.find(c => c.id === mov.cuentaOrigenId);
            const destino = cuentas.find(c => c.id === mov.cuentaDestinoId);
            const origenComp = origen ? getNetWorthComponent(origen.tipo) : null;
            const destinoComp = destino ? getNetWorthComponent(destino.tipo) : null;

            if (origen && !destino) {
                componentChange = origenComp;
                changeAmount = -mov.cantidad;
            } else if (!origen && destino) {
                componentChange = destinoComp;
                changeAmount = mov.cantidad;
            } else if (origen && destino && origenComp !== destinoComp) {
                runningComponentTotals[origenComp] += origenComp === 'Deuda' ? -mov.cantidad : mov.cantidad;
                runningComponentTotals[destinoComp] += destinoComp === 'Deuda' ? mov.cantidad : -mov.cantidad;
            }
        }
        
        if (componentChange) {
            runningComponentTotals[componentChange] -= (componentChange === 'Deuda' ? -changeAmount : changeAmount);
        }
        
        const dateKey = mov.fecha.slice(0, 10);
        dailyData[dateKey] = { ...runningComponentTotals };
    }
    
    const weeklyData = resampleDataWeekly(dailyData);
    const sortedDates = Object.keys(weeklyData).sort();

    if(chartContainer) chartContainer.classList.remove('skeleton');

    const datasets = Object.keys(NET_WORTH_COMPONENT_COLORS).map(component => ({
        label: component,
        data: sortedDates.map(date => (weeklyData[date][component] || 0) / 100),
        fill: true,
        backgroundColor: NET_WORTH_COMPONENT_COLORS[component],
        borderColor: NET_WORTH_COMPONENT_COLORS[component].replace('0.7', '1'),
        pointRadius: 0,
        borderWidth: 1.5,
    }));
    
    const ctx = netWorthCanvas.getContext('2d');
    netWorthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    stacked: true,
                    ticks: { callback: v => formatCurrency(v * 100).replace(/\s/g,'') }
                },
                x: {
                    type: 'time',
                    time: { unit: 'month', tooltipFormat: 'dd MMM yyyy', displayFormats: { month: 'MMM yy' } },
                    ticks: { autoSkip: true, maxTicksLimit: 6 },
                    grid: { display: false }
                }
            },
            plugins: {
                datalabels: { display: false },
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 15, padding: 20 }
                },
                tooltip: {
                    intersect: false,
                    mode: 'index',
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return ` ${label}: ${formatCurrency(value * 100)}`;
                        },
                        footer: (tooltipItems) => {
                            let sum = 0;
                            tooltipItems.forEach(function(tooltipItem) {
                                sum += tooltipItem.parsed.y;
                            });
                            return `Total: ${formatCurrency(sum * 100)}`;
                        },
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
        }
    });
};

const scheduleDashboardUpdate = () => {
    // El jefe de obra solo trabaja si la página "Inicio" está abierta.
    const activePage = document.querySelector('.view--active');
    if (!activePage || activePage.id !== PAGE_IDS.INICIO) {
        return;
    }
      
    clearTimeout(dashboardUpdateDebounceTimer);
        
    dashboardUpdateDebounceTimer = setTimeout(updateDashboardData, 50);
};

// ▼▼▼ REEMPLAZA TODA TU FUNCIÓN updateDashboardData CON ESTA VERSIÓN FINALÍSIMA Y VERIFICADA ▼▼▼

const updateDashboardData = async () => {
    const activePage = document.querySelector('.view--active');
    if (!activePage || activePage.id !== PAGE_IDS.INICIO) {
        return;
    }

    if (isDashboardRendering) return;
    isDashboardRendering = true;

    
    try {
        const { current, previous, label } = await getFilteredMovements(true);
        const saldos = await getSaldos();
        
        await updateNetWorthChart(saldos);

        const visibleAccountIds = new Set(Object.keys(saldos));
        const investmentAccountIds = new Set(getVisibleAccounts().filter(c => c.esInversion).map(c => c.id));
		
        const calculateTotals = (movs) => {
            let ingresos = 0, gastos = 0, saldoNeto = 0;
            movs.forEach(m => {
                const amount = calculateMovementAmount(m, visibleAccountIds);
                if (amount > 0) ingresos += amount;
                else gastos += amount;
                saldoNeto += amount;
            });
            return { ingresos, gastos, saldoNeto };
        };
		
        const currentTotals = calculateTotals(current);
        const previousTotals = calculateTotals(previous);
        const saldoNetoActual = currentTotals.saldoNeto;
        const saldoNetoAnterior = previousTotals.saldoNeto;
        const tasaAhorroActual = currentTotals.ingresos > 0 ? (saldoNetoActual / currentTotals.ingresos) * 100 : (saldoNetoActual < 0 ? -100 : 0);
        const tasaAhorroAnterior = previousTotals.ingresos > 0 ? (previousTotals.saldoNeto / previousTotals.ingresos) * 100 : 0;
        const patrimonioNeto = Object.values(saldos).reduce((sum, s) => sum + s, 0);
        const portfolioPerformance = await calculatePortfolioPerformance();
        const pnlInversionActual = portfolioPerformance.pnlAbsoluto;
        const now = new Date();
        const expenseBudgets = (db.presupuestos || []).filter(b => b.ano === now.getFullYear() && b.cantidad < 0);
        let totalBudgetedExpense = 0;
        let actualExpenseForBudget = Math.abs(currentTotals.gastos);
        if (expenseBudgets.length > 0) {
            const periodFilterEl = select('filter-periodo');
            const periodFilter = periodFilterEl ? periodFilterEl.value : 'mes-actual';
            const totalAnnualBudget = expenseBudgets.reduce((sum, b) => sum + Math.abs(b.cantidad), 0);
            if (periodFilter === 'mes-actual') totalBudgetedExpense = totalAnnualBudget / 12;
            else if (periodFilter === 'año-actual') totalBudgetedExpense = totalAnnualBudget;
            else {
                const sDateEl = select('filter-fecha-inicio'), eDateEl = select('filter-fecha-fin');
                if (sDateEl?.value && eDateEl?.value) {
                    const diffDays = (new Date(eDateEl.value) - new Date(sDateEl.value)) / 86400000 + 1;
                    totalBudgetedExpense = (totalAnnualBudget / (now.getFullYear() % 4 === 0 ? 366 : 365)) * diffDays;
                }
            }
        }
        const efData = calculateEmergencyFund(saldos, db.cuentas, recentMovementsCache);
        const fiData = calculateFinancialIndependence(patrimonioNeto, efData.gastoMensualPromedio);
        const getComparisonHTML = (currentVal, prevVal, comparisonLabel, lowerIsBetter = false) => {
            if (!comparisonLabel || prevVal === 0 || Math.abs(prevVal) < 1) return '';
            const isImprovement = lowerIsBetter ? (currentVal < prevVal) : (currentVal > prevVal);
            const diff = (currentVal - prevVal) / Math.abs(prevVal) * 100;
            const diffClass = isImprovement ? 'text-positive' : 'text-negative';
            const icon = isImprovement ? 'arrow_upward' : 'arrow_downward';
            return `<span class="${diffClass}"><span class="material-icons" style="font-size: 12px; vertical-align: middle;">${icon}</span> ${Math.abs(diff).toFixed(0)}%</span> <span style="color:var(--c-on-surface-secondary)">${comparisonLabel}</span>`;
        };
		
        if (select('kpi-ingresos-value')) {
            selectAll('#kpi-container .skeleton').forEach(el => el.classList.remove('skeleton'));
            animateCountUp(select('kpi-ingresos-value'), currentTotals.ingresos);
            select('kpi-ingresos-comparison').innerHTML = getComparisonHTML(currentTotals.ingresos, previousTotals.ingresos, label);
            animateCountUp(select('kpi-gastos-value'), currentTotals.gastos);
            select('kpi-gastos-comparison').innerHTML = getComparisonHTML(Math.abs(currentTotals.gastos), Math.abs(previousTotals.gastos), label, true);
        }
        const saldoNetoEl = select('kpi-saldo-neto-value');
        if (saldoNetoEl) {
            saldoNetoEl.className = `kpi-item__value ${saldoNetoActual >= 0 ? 'text-positive' : 'text-negative'}`;
            animateCountUp(saldoNetoEl, saldoNetoActual);
            select('kpi-saldo-neto-comparison').innerHTML = getComparisonHTML(saldoNetoActual, saldoNetoAnterior, label);
        }

        // --- INICIO DE LA CORRECCIÓN CLAVE ---
        // Ahora el cartero busca directamente los buzones, sin importar en qué edificio estén.
        if (select('kpi-tasa-ahorro-value')) {
            selectAll('#super-centro-operaciones-widget .skeleton').forEach(el => el.classList.remove('skeleton'));
            const kpiTasaAhorroValueEl = select('kpi-tasa-ahorro-value');
            kpiTasaAhorroValueEl.textContent = `${tasaAhorroActual.toFixed(1)}%`;
            kpiTasaAhorroValueEl.className = `kpi-item__value ${tasaAhorroActual >= 0 ? 'text-positive' : 'text-negative'}`;
            renderSavingsRateGauge('kpi-savings-rate-chart', tasaAhorroActual);
            select('kpi-tasa-ahorro-comparison').innerHTML = getComparisonHTML(tasaAhorroActual, tasaAhorroAnterior, label.replace('vs', ''));
            animateCountUp(select('kpi-patrimonio-neto-value'), patrimonioNeto);
            const kpiPnlEl = select('kpi-pnl-inversion-value');
            kpiPnlEl.className = `kpi-item__value ${pnlInversionActual >= 0 ? 'text-positive' : 'text-negative'}`;
            if (investmentAccountIds.size > 0) animateCountUp(kpiPnlEl, pnlInversionActual); else kpiPnlEl.textContent = 'N/A';
            const progressEl = select('kpi-presupuesto-progress'), progressTextEl = select('kpi-presupuesto-text');
			if (progressEl && progressTextEl) { // <--- LÍNEA AÑADIDA
            progressTextEl.classList.remove('skeleton');
            if (totalBudgetedExpense > 0) {
                const percentage = (actualExpenseForBudget / totalBudgetedExpense) * 100;
                if(progressEl) progressEl.value = Math.min(percentage, 100);
                progressTextEl.innerHTML = `Gastado <strong>${formatCurrency(actualExpenseForBudget)}</strong> de un límite de <strong>${formatCurrency(totalBudgetedExpense)}</strong> (${percentage.toFixed(0)}%)`;
                if(progressEl) {
                    progressEl.className = 'budget-item__progress';
                    if (percentage > 100) progressEl.classList.add('budget-item__progress--danger');
                    else if (percentage > 85) progressEl.classList.add('budget-item__progress--warning');
                }
            } else {
                if(progressEl) progressEl.value = 0;
                progressTextEl.textContent = 'No hay presupuestos de gasto definidos para este año.';
            }
			}
        } 
        // --- FIN DE LA CORRECCIÓN CLAVE ---
        
        const actionCenterContainer = select('action-center-content');
        if (actionCenterContainer) {
             let actionItems = []; const now = new Date(); const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); const pendingRecurrents = (db.recurrentes || []).filter(r => new Date(r.nextDate) <= today); pendingRecurrents.forEach(r => actionItems.push({ urgency: 3, type: 'pending', data: r, subtitle: `Vencido desde el ${new Date(r.nextDate).toLocaleDateString()}` })); (db.recurrentes || []).filter(r => { const nextDate = new Date(r.nextDate); return nextDate > today && nextDate <= nextWeek; }).slice(0, 10).forEach(r => actionItems.push({ urgency: 2, type: 'upcoming', data: r, subtitle: `Vence el ${new Date(r.nextDate).toLocaleDateString()}` })); actionItems.sort((a, b) => b.urgency - a.urgency || new Date(a.data.nextDate) - new Date(b.data.nextDate)); if (actionItems.length === 0) { actionCenterContainer.innerHTML = `<div class="empty-state" style="padding: var(--sp-2) 0; background: transparent; border: none;"><span class="material-icons text-positive">task_alt</span><p style="color: var(--c-on-surface-secondary);">¡Todo en orden!</p></div>`; } else { actionCenterContainer.innerHTML = actionItems.map(item => { const r = item.data; const amountClass = r.cantidad >= 0 ? 'text-positive' : 'text-negative'; const actionButtons = item.type === 'pending' ? `<div style="display: flex; gap: var(--sp-2);"><button class="btn btn--secondary" data-action="skip-recurrent" data-id="${r.id}" style="padding: 4px 8px; font-size: 0.7rem;">Omitir</button><button class="btn btn--primary" data-action="confirm-recurrent" data-id="${r.id}" style="padding: 4px 8px; font-size: 0.7rem;">Añadir</button></div>` : ''; return `<div class="modal__list-item" style="padding: var(--sp-2) 0;"><div><strong style="font-size: var(--fs-sm);">${r.descripcion}</strong><small style="display: block; color: var(--c-on-surface-secondary);">${item.subtitle}</small></div><div style="text-align: right;"><strong class="${amountClass}" style="font-size: var(--fs-base);">${formatCurrency(r.cantidad)}</strong>${actionButtons}</div></div>`; }).join(''); }
        }
        const efWidget = select('emergency-fund-widget');
        if (efWidget) {
            efWidget.querySelector('.card__content').classList.remove('skeleton'); const monthsValueEl = select('kpi-ef-months-value'); const progressEl = select('kpi-ef-progress'); const textEl = select('kpi-ef-text'); if (monthsValueEl && progressEl && textEl) { monthsValueEl.textContent = isFinite(efData.mesesCobertura) ? efData.mesesCobertura.toFixed(1) : '∞'; progressEl.value = Math.min(efData.mesesCobertura, 6); let textClass = 'text-danger'; if (efData.mesesCobertura >= 6) textClass = 'text-positive'; else if (efData.mesesCobertura >= 3) textClass = 'text-warning'; monthsValueEl.className = `kpi-item__value ${textClass}`; textEl.innerHTML = `Tu dinero líquido cubre <strong>${isFinite(efData.mesesCobertura) ? efData.mesesCobertura.toFixed(1) : 'todos tus'}</strong> meses de gastos.`; }
        }
        const fiWidget = select('fi-progress-widget');
        if (fiWidget) {
            fiWidget.querySelector('.card__content').classList.remove('skeleton'); const percentageValueEl = select('kpi-fi-percentage-value'); const progressEl = select('kpi-fi-progress'); const textEl = select('kpi-fi-text'); if (percentageValueEl && progressEl && textEl) { percentageValueEl.textContent = `${fiData.progresoFI.toFixed(1)}%`; progressEl.value = fiData.progresoFI; textEl.innerHTML = `Objetivo: <strong>${formatCurrency(fiData.objetivoFI)}</strong> (basado en un gasto anual de ${formatCurrency(fiData.gastoAnualEstimado)})`; }
        }
        const conceptListContainer = select('concepto-totals-list');
        const chartCanvas = select('conceptos-chart');
        if (conceptListContainer && chartCanvas) {
    const chartCtx = chartCanvas.getContext('2d');
    const chartContainer = chartCanvas.closest('.chart-container');
    if(chartContainer) chartContainer.classList.remove('skeleton');
    if (conceptosChart) conceptosChart.destroy();
    
    // Misma lógica que ya tienes para calcular los totales por concepto
    const cTots = current.reduce((a, m) => {
        if (m.tipo === 'movimiento' && m.conceptoId) {
            const con = db.conceptos.find((c) => c.id === m.conceptoId);
            if(con){
                if (!a[m.conceptoId]) a[m.conceptoId] = { total: 0, movements: [], icon: con.icon || 'label' };
                a[m.conceptoId].total += m.cantidad;
                a[m.conceptoId].movements.push(m);
            }
        }
        return a;
    }, {});

    const sortedTotals = Object.entries(cTots).sort(([, a], [, b]) => a.total - b.total);

    // Dibuja el gráfico (sin cambios en esta parte)
    const colorSuccess = getComputedStyle(document.body).getPropertyValue('--c-chart-positive').trim();
    const colorDanger = getComputedStyle(document.body).getPropertyValue('--c-danger').trim();
    conceptosChart = new Chart(chartCtx, { type: 'bar', data: { labels: sortedTotals.map(([id]) => toSentenceCase(db.conceptos.find(c => c.id === id)?.nombre || '?')), datasets: [{ data: sortedTotals.map(([, data]) => data.total / 100), backgroundColor: sortedTotals.map(([, data]) => data.total >= 0 ? colorSuccess : colorDanger), borderRadius: 6, }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { display: false }, tooltip: { callbacks: { label: (context) => `Total: ${formatCurrency(context.parsed.y * 100)}` } } }, scales: { y: { ticks: { callback: (value) => `${value.toLocaleString('es-ES')}` } } }, onClick: (event, elements) => { if (elements.length === 0) return; const index = elements[0].index; const [conceptoId, data] = sortedTotals[index]; const concepto = db.conceptos.find(c => c.id === conceptoId); const conceptoNombre = concepto ? toSentenceCase(concepto.nombre) : 'Desconocido'; hapticFeedback('light'); showDrillDownModal(`Movimientos de: ${conceptoNombre}`, data.movements); }, onHover: (event, chartElement) => { event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default'; } } });

    // --- ⭐ NUEVA LÓGICA PARA RENDERIZAR LA LISTA AGRUPADA ---
    
    // 1. Separamos los conceptos en gastos e ingresos
    const gastos = sortedTotals.filter(([, data]) => data.total < 0).sort(([, a], [, b]) => a.total - b.total);
    const ingresos = sortedTotals.filter(([, data]) => data.total > 0).sort(([, a], [, b]) => b.total - a.total);

    let listHtml = '';

    const renderGroup = (title, items, totalPeriodValue) => {
        if (items.length === 0) return '';
        const groupTotal = items.reduce((sum, [, data]) => sum + data.total, 0);

        // La función para renderizar cada fila (la hemos extraído para no repetir código)
        const renderRow = ([id, data]) => {
            const concepto = db.conceptos.find(c => c.id === id);
            const nombreConcepto = (concepto && concepto.nombre) || 'Desconocido';
            const amountClass = data.total >= 0 ? 'text-positive' : 'text-negative';
            const percentage = totalPeriodValue > 0 ? (Math.abs(data.total) / totalPeriodValue) * 100 : 0;
            const progressClass = data.total < 0 ? 'budget-item__progress--danger' : '';

            return `<div class="modal__list-item" style="cursor: pointer; padding: var(--sp-2) var(--sp-1);" data-action="show-concept-drilldown" data-concept-id="${id}" data-concept-name="${escapeHTML(nombreConcepto)}"><div style="flex-grow: 1;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;"><span>${escapeHTML(nombreConcepto)}</span><strong class="${amountClass}">${formatCurrency(data.total)}</strong></div><div class="budget-item__progress"><progress max="100" value="${percentage}" class="budget-item__progress ${progressClass}" style="width: 100%; height: 5px;"></progress></div></div></div>`;
        };

        return `
            <details class="accordion" style="background-color: transparent; border: 1px solid var(--c-outline); border-radius: var(--border-radius-md); margin-bottom: var(--sp-2);">
                <summary>
                    <span style="font-weight: 700;">${title}</span>
                    <strong>${formatCurrency(groupTotal)}</strong>
                </summary>
                <div class="accordion__content" style="padding: 0 var(--sp-2) var(--sp-1) var(--sp-2);">
                    ${items.map(renderRow).join('')}
                </div>
            </details>
        `;
    };

    if (sortedTotals.length === 0) {
        listHtml = `<div class="empty-state" style="padding:16px 0; background:transparent; border:none;"><p>Sin datos para los filtros.</p></div>`;
    } else {
        listHtml += renderGroup('Gastos', gastos, Math.abs(currentTotals.gastos));
        listHtml += renderGroup('Ingresos', ingresos, currentTotals.ingresos);
    }
    
    conceptListContainer.innerHTML = listHtml;
}
		
		if (select('patrimonio-completo-container')) { await renderPatrimonioPage(); }
        if (select('patrimonio-inversiones-container')) { await renderInversionesPage('patrimonio-inversiones-container'); }
        if (select('informe-personalizado-widget')) { await renderInformeWidgetContent(); }
		
    } finally {
        // --- INICIO DE LA CORRECCIÓN ---
        const widgetContainers = document.querySelectorAll('[data-widget-type]');
        // --- FIN DE LA CORRECCIÓN ---
        
        widgetContainers.forEach(container => {
            if (container) {
                container.classList.remove('widget--loading');
                const spinner = container.querySelector('.widget-spinner');
                if (spinner) {
                    spinner.remove();
                }
            }
        });
        isDashboardRendering = false;
    }
};
/**
 * Calcula y renderiza el gráfico de evolución del patrimonio neto.
 * @param {object} saldos - El objeto con los saldos actuales de las cuentas.
 */




let informeChart = null; // Variable global para el gráfico del informe
let informeBuilderDebounceTimer = null;

// Renderiza el HTML estático del widget en el panel de Inicio
const renderDashboardInformeWidget = () => {
    const reportConfig = db.config?.savedReports?.main;
    const title = reportConfig?.title || "Mi Informe Personalizado";
    return `
    <div class="card" id="informe-personalizado-widget">
        <div class="card__title" style="justify-content: space-between; padding-bottom: 0;">
            <div style="display: flex; align-items: center; gap: var(--sp-2);">
                <span class="material-icons">insights</span>
                <span id="informe-widget-title">${escapeHTML(title)}</span>
            </div>
            <button data-action="show-informe-builder" class="btn btn--secondary">
                <span class="material-icons" style="font-size: 16px;">edit</span>
                <span>Configurar</span>
            </button>
        </div>
        <div class="card__content" id="informe-widget-content">
            <div class="empty-state skeleton" style="background:transparent; border:none; padding: var(--sp-4) 0;">
                <p>Cargando informe...</p>
            </div>
        </div>
    </div>`;
};

// Rellena el widget con el gráfico y datos según la configuración guardada
const renderInformeWidgetContent = async () => {
    const container = select('informe-widget-content');
    if (!container) return;

    const reportConfig = db.config?.savedReports?.main;

    if (!reportConfig) {
        container.innerHTML = `
        <div class="empty-state" style="background:transparent; border:none; padding: var(--sp-4) 0;">
            <p>Aún no has configurado tu informe. Haz clic en "Configurar" para empezar.</p>
        </div>`;
        return;
    }
    
    container.innerHTML = `<div class="chart-container" style="height: 240px;"><canvas id="informe-main-chart"></canvas></div>`;

    const data = await generateInformeData(reportConfig);
    const chartCanvas = select('informe-main-chart');
    const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;

    if (informeChart) informeChart.destroy();
    if (!chartCtx) return;

    if (data.labels.length === 0) {
        container.innerHTML = `<div class="empty-state" style="background:transparent; border:none; padding: var(--sp-2) 0;"><p>No se encontraron datos para los criterios de tu informe.</p></div>`;
        return;
    }

    informeChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: data.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: reportConfig.desglose === 'concepto' },
                y: { stacked: reportConfig.desglose === 'concepto', ticks: { callback: (value) => `€${value.toLocaleString('es-ES')}` } }
            },
            plugins: {
                legend: { display: data.datasets.length > 1, position: 'top' },
                tooltip: { callbacks: { label: (c) => `${c.dataset.label || ''}: ${formatCurrency(c.raw * 100)}` } },
                datalabels: { display: false }
            }
        }
    });
};

// Muestra el modal para construir/editar el informe
const showInformeBuilderModal = () => {
    const reportConfig = db.config?.savedReports?.main || {};
    const today = new Date().toISOString().slice(0, 10);
    const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10);
    
    const accountsOptions = getVisibleAccounts()
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map(c => `<option value="${c.id}" ${reportConfig.cuentas?.includes(c.id) ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`)
        .join('');

    const conceptosOptions = db.conceptos
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map(c => `<option value="${c.id}" ${reportConfig.conceptos?.includes(c.id) ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`)
        .join('');

    const html = `
        <form id="informe-builder-form" novalidate>
            <div class="form-group">
                <label for="informe-title" class="form-label">Nombre del Informe</label>
                <input type="text" id="informe-title" class="form-input" value="${escapeHTML(reportConfig.title || 'Mi Informe Personalizado')}">
            </div>
            <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
                 <div class="form-group">
                    <label for="informe-metrica" class="form-label">Métrica Principal</label>
                    <select id="informe-metrica" class="form-select">
                        <option value="saldo_neto" ${reportConfig.metrica === 'saldo_neto' ? 'selected' : ''}>Saldo Neto</option>
                        <option value="gastos" ${reportConfig.metrica === 'gastos' ? 'selected' : ''}>Gastos</option>
                        <option value="ingresos" ${reportConfig.metrica === 'ingresos' ? 'selected' : ''}>Ingresos</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="informe-agrupacion" class="form-label">Agrupar por</label>
                    <select id="informe-agrupacion" class="form-select">
                        <option value="mes" ${reportConfig.agrupacion === 'mes' ? 'selected' : ''}>Mes</option>
                        <option value="trimestre" ${reportConfig.agrupacion === 'trimestre' ? 'selected' : ''}>Trimestre</option>
                    </select>
                </div>
            </div>
             <div class="form-group">
                <label for="informe-desglose" class="form-label">Desglosar por</label>
                <select id="informe-desglose" class="form-select">
                    <option value="total" ${reportConfig.desglose === 'total' ? 'selected' : ''}>Total General</option>
                    <option value="concepto" ${reportConfig.desglose === 'concepto' ? 'selected' : ''}>Top 5 Conceptos</option>
                </select>
            </div>
            <hr style="border-color: var(--c-outline); opacity: 0.5; margin: var(--sp-4) 0;">
            <h4 style="margin-bottom: var(--sp-3);">Filtros de Datos</h4>
            <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="form-group">
                    <label for="informe-fecha-inicio" class="form-label">Desde</label>
                    <input type="date" id="informe-fecha-inicio" class="form-input" value="${reportConfig.fechaInicio || lastYear}">
                </div>
                <div class="form-group">
                    <label for="informe-fecha-fin" class="form-label">Hasta</label>
                    <input type="date" id="informe-fecha-fin" class="form-input" value="${reportConfig.fechaFin || today}">
                </div>
            </div>
            <div class="form-group">
                <label for="informe-cuentas" class="form-label">Cuentas (deja en blanco para todas)</label>
                <select id="informe-cuentas" class="form-select" multiple style="height: 120px;">${accountsOptions}</select>
            </div>
            <div class="form-group">
                <label for="informe-conceptos" class="form-label">Conceptos (deja en blanco para todos)</label>
                <select id="informe-conceptos" class="form-select" multiple style="height: 120px;">${conceptosOptions}</select>
            </div>
             <div id="informe-preview-container" style="margin-top: var(--sp-4);">
                <h4 style="margin-bottom: var(--sp-2);">Previsualización</h4>
                <div class="chart-container skeleton" style="height: 220px;"><canvas id="informe-preview-chart"></canvas></div>
            </div>
            <div class="modal__actions">
                <button type="button" data-action="save-informe" class="btn btn--primary btn--full">Guardar y Actualizar Panel</button>
            </div>
        </form>`;
    
    showGenericModal('Creador de Informes', html);
    
    setTimeout(() => {
        const form = select('informe-builder-form');
        form.addEventListener('input', () => handleInformeBuilderChange());
        handleInformeBuilderChange(); // Carga la preview inicial
    }, 100);
};

// Se ejecuta al cambiar cualquier filtro en el modal para actualizar la preview
const handleInformeBuilderChange = () => {
    clearTimeout(informeBuilderDebounceTimer);
    informeBuilderDebounceTimer = setTimeout(async () => {
        const previewContainer = select('informe-preview-container');
        if (!previewContainer) return;

        const config = {
            title: select('informe-title').value,
            metrica: select('informe-metrica').value,
            agrupacion: select('informe-agrupacion').value,
            desglose: select('informe-desglose').value,
            fechaInicio: select('informe-fecha-inicio').value,
            fechaFin: select('informe-fecha-fin').value,
            cuentas: Array.from(select('informe-cuentas').selectedOptions).map(opt => opt.value),
            conceptos: Array.from(select('informe-conceptos').selectedOptions).map(opt => opt.value),
        };

        const chartContainer = previewContainer.querySelector('.chart-container');
        chartContainer.classList.add('skeleton');
        
        const data = await generateInformeData(config);
        
        chartContainer.classList.remove('skeleton');
        const chartCanvas = select('informe-preview-chart');
        const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;
        if (informeChart) informeChart.destroy();
        if (!chartCtx) return;

        if(data.labels.length === 0) {
            chartContainer.innerHTML = `<div class="empty-state" style="padding: var(--sp-3) 0; border: none; background: transparent;"><p>No hay datos para esta selección.</p></div><canvas id="informe-preview-chart" style="display: none;"></canvas>`;
            return;
        } else {
             chartContainer.innerHTML = `<canvas id="informe-preview-chart"></canvas>`;
        }
        
        informeChart = new Chart(select('informe-preview-chart').getContext('2d'), {
            type: config.desglose === 'concepto' ? 'bar' : 'line',
            data: { labels: data.labels, datasets: data.datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { 
                    x: { stacked: config.desglose === 'concepto' },
                    y: { stacked: config.desglose === 'concepto', ticks: { callback: (v) => `€${v.toLocaleString()}` } }
                },
                plugins: { legend: { display: data.datasets.length > 1 }, tooltip: { callbacks: { label: (c) => `${c.dataset.label || ''}: ${formatCurrency(c.raw * 100)}` }}, datalabels: { display: false } }
            }
        });
    }, 400);
};

// Guarda la configuración del informe en la base de datos
const handleSaveInforme = async (btn) => {
    setButtonLoading(btn, true);
    const config = {
        title: select('informe-title').value.trim(),
        metrica: select('informe-metrica').value,
        agrupacion: select('informe-agrupacion').value,
        desglose: select('informe-desglose').value,
        fechaInicio: select('informe-fecha-inicio').value,
        fechaFin: select('informe-fecha-fin').value,
        cuentas: Array.from(select('informe-cuentas').selectedOptions).map(opt => opt.value),
        conceptos: Array.from(select('informe-conceptos').selectedOptions).map(opt => opt.value),
    };
    if (!db.config.savedReports) db.config.savedReports = {};
    db.config.savedReports.main = config;

    await fbDb.collection('users').doc(currentUser.uid).set({ config: db.config }, { merge: true });

    setButtonLoading(btn, false);
    hideModal('generic-modal');
    hapticFeedback('success');
    showToast('Informe guardado y actualizado en el panel.');
    select('informe-widget-title').textContent = escapeHTML(config.title);
    await renderInformeWidgetContent();
};

// La función MÁGICA: toma una configuración y devuelve los datos para el gráfico
const generateInformeData = async (config) => {
    const sDate = parseDateStringAsUTC(config.fechaInicio);
    const eDate = parseDateStringAsUTC(config.fechaFin);
    if (eDate) eDate.setUTCHours(23, 59, 59, 999);
    if (!sDate || !eDate) return { labels: [], datasets: [] };
    
    const querySnapshot = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos')
        .where('fecha', '>=', sDate.toISOString()).where('fecha', '<=', eDate.toISOString()).get();
    
    let movements = querySnapshot.docs.map(doc => doc.data());
    const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));
    
    // Filtrado por cuentas
    const filterCuentas = config.cuentas && config.cuentas.length > 0;
    const selectedCuentas = new Set(config.cuentas);
    movements = movements.filter(m => {
        const cuentaSet = filterCuentas ? selectedCuentas : visibleAccountIds;
        if (m.tipo === 'traspaso') return cuentaSet.has(m.cuentaOrigenId) || cuentaSet.has(m.cuentaDestinoId);
        return cuentaSet.has(m.cuentaId);
    });

    // Filtrado por conceptos
    const filterConceptos = config.conceptos && config.conceptos.length > 0;
    if (filterConceptos) {
        const selectedConceptos = new Set(config.conceptos);
        movements = movements.filter(m => selectedConceptos.has(m.conceptoId));
    }
    
    // Agrupación y procesamiento de datos
    const groupedData = {};
    const getGroupKey = (date) => {
        if (config.agrupacion === 'trimestre') return `${date.getUTCFullYear()}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
        return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    };

    movements.forEach(m => {
        const groupKey = getGroupKey(new Date(m.fecha));
        if (!groupedData[groupKey]) groupedData[groupKey] = {};
        
        let Categoria = 'Total';
        if(config.desglose === 'concepto' && m.conceptoId) {
            Categoria = m.conceptoId;
        }
        if(!groupedData[groupKey][Categoria]) groupedData[groupKey][Categoria] = { ingresos: 0, gastos: 0 };
        
        const cuentaSet = filterCuentas ? selectedCuentas : visibleAccountIds;
        if(m.tipo === 'traspaso') {
            if(cuentaSet.has(m.cuentaDestinoId)) groupedData[groupKey][Categoria].ingresos += m.cantidad;
            if(cuentaSet.has(m.cuentaOrigenId)) groupedData[groupKey][Categoria].gastos -= m.cantidad;
        } else {
            if(m.cantidad > 0) groupedData[groupKey][Categoria].ingresos += m.cantidad;
            else groupedData[groupKey][Categoria].gastos += m.cantidad;
        }
    });

    const labels = Object.keys(groupedData).sort();
    let datasets = [];
    const colorPalette = ['#007AFF', '#30D158', '#FFD60A', '#FF3B30', '#BF5AF2', '#5E5CE6'];

    if (config.desglose === 'total') {
        const data = labels.map(label => {
            const periodData = groupedData[label]['Total'] || {ingresos: 0, gastos: 0};
            if(config.metrica === 'ingresos') return periodData.ingresos / 100;
            if(config.metrica === 'gastos') return Math.abs(periodData.gastos / 100);
            return (periodData.ingresos + periodData.gastos) / 100;
        });
        datasets.push({ label: 'Total', data, backgroundColor: colorPalette, borderColor: colorPalette });
    } else { // Desglose por concepto
        const conceptTotals = {};
        Object.values(groupedData).forEach(period => {
            Object.entries(period).forEach(([conceptId, data]) => {
                if(conceptId !== 'Total') {
                    if(!conceptTotals[conceptId]) conceptTotals[conceptId] = 0;
                    conceptTotals[conceptId] += Math.abs(data.ingresos) + Math.abs(data.gastos);
                }
            });
        });

        const topConcepts = Object.entries(conceptTotals).sort((a,b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
        const conceptMap = new Map(db.conceptos.map(c => [c.id, c.nombre]));
        
        const finalConcepts = [...topConcepts, 'Otros'];
        datasets = finalConcepts.map((conceptId, index) => {
            const data = labels.map(label => {
                let periodTotal = 0;
                const periodData = groupedData[label];
                if(conceptId === 'Otros') {
                    Object.entries(periodData).forEach(([cId, data]) => {
                        if(!topConcepts.includes(cId)) {
                             if(config.metrica === 'ingresos') periodTotal += data.ingresos;
                             else if(config.metrica === 'gastos') periodTotal += data.gastos;
                             else periodTotal += data.ingresos + data.gastos;
                        }
                    });
                } else if(periodData[conceptId]) {
                    const data = periodData[conceptId];
                    if(config.metrica === 'ingresos') periodTotal = data.ingresos;
                    else if(config.metrica === 'gastos') periodTotal = data.gastos;
                    else periodTotal = data.ingresos + data.gastos;
                }
                return config.metrica === 'gastos' ? Math.abs(periodTotal / 100) : periodTotal / 100;
            });
            return {
                label: conceptMap.get(conceptId) || 'Otros',
                data,
                backgroundColor: colorPalette[index % colorPalette.length]
            };
        });
    }

    return { labels, datasets };
};
        

/** Función auxiliar que calcula dónde se debe insertar el elemento que se arrastra. */
const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll('.widget-config-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
};

		let suggestionDebounceTimer = null;
        const applyDescriptionSuggestion = (target) => {
    // Extraemos la información directamente del elemento clicado
    const { description, conceptoId, cuentaId } = target.dataset;

    // Rellenamos los campos del formulario
    select('movimiento-descripcion').value = toSentenceCase(description);
    select('movimiento-concepto').value = conceptoId;
    select('movimiento-cuenta').value = cuentaId;
    
    // Ocultamos la caja de sugerencias
    select('description-suggestions').style.display = 'none';

    // Damos feedback visual y movemos el cursor al siguiente paso
    hapticFeedback('light');
    [select('movimiento-concepto'), select('movimiento-cuenta')].forEach(el => {
        const parent = el.closest('.form-group-addon');
        if(parent) {
            parent.classList.add('field-highlighted');
            setTimeout(() => parent.classList.remove('field-highlighted'), 1500);
        }
    });

    // ¡La magia final! Movemos el foco al campo de la cantidad.
    select('movimiento-cantidad').focus();
};

// =================================================================
// === INICIO: CÓDIGO UNIFICADO PARA MODALES ARRASTRABLES ===
// =================================================================

let modalDragState = {
    isDragging: false,
    startY: 0,
    currentY: 0,
    targetModal: null
};

// Se activa CUANDO EMPIEZAS A ARRASTRAR
function handleModalDragStart(e) {
    const modal = e.target.closest('.modal');
    if (!modal) return;

    const modalBody = modal.querySelector('.modal__body');
    if (modalBody && modalBody.scrollTop > 0) return;

    modalDragState.isDragging = true;
    modalDragState.targetModal = modal;
    modalDragState.startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    modal.style.transition = 'none';
}

// Se activa MIENTRAS MUEVES EL DEDO/RATÓN
function handleModalDragMove(e) {
    if (!modalDragState.isDragging || !modalDragState.targetModal) return;

    modalDragState.currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    let deltaY = modalDragState.currentY - modalDragState.startY;

    if (deltaY > 0) {
        e.preventDefault();
        modalDragState.targetModal.style.transform = `translateY(${deltaY}px)`;
    }
}

// Se activa CUANDO SUELTAS EL DEDO/RATÓN
function handleModalDragEnd(e) {
    if (!modalDragState.isDragging || !modalDragState.targetModal) return;

    const modal = modalDragState.targetModal;
    modal.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'; 

    const deltaY = modalDragState.currentY - modalDragState.startY;
    const modalHeight = modal.offsetHeight;

    if (deltaY > modalHeight * 0.3) {
        const overlay = modal.closest('.modal-overlay');
        if (overlay) hideModal(overlay.id);
    } else {
        modal.style.transform = 'translateY(0)';
    }

    modalDragState.isDragging = false;
    modalDragState.targetModal = null;
}

// FUNCIÓN showModal ACTUALIZADA
const showModal = (id) => {
    const m = select(id);
    if (m) {
        m.classList.add('modal-overlay--active');
        select('app-root').classList.add('app-layout--transformed-by-modal');

        const modalElement = m.querySelector('.modal');
        if (modalElement) {
            modalElement.addEventListener('mousedown', handleModalDragStart);
            modalElement.addEventListener('touchstart', handleModalDragStart, { passive: true });
        }

        document.addEventListener('mousemove', handleModalDragMove);
        document.addEventListener('touchmove', handleModalDragMove, { passive: false });
        document.addEventListener('mouseup', handleModalDragEnd);
        document.addEventListener('touchend', handleModalDragEnd);

        if (!id.includes('calculator')) {
            const f = m.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (f) f.focus();
        }
    }
};

// FUNCIÓN hideModal ACTUALIZADA
const hideModal = (id) => {
    const m = select(id);
    if (m) {
        m.classList.remove('modal-overlay--active');
        select('app-root').classList.remove('app-layout--transformed-by-modal');

        const modalElement = m.querySelector('.modal');
        if (modalElement) {
            modalElement.removeEventListener('mousedown', handleModalDragStart);
            modalElement.removeEventListener('touchstart', handleModalDragStart);
        }
        document.removeEventListener('mousemove', handleModalDragMove);
        document.removeEventListener('touchmove', handleModalDragMove);
        document.removeEventListener('mouseup', handleModalDragEnd);
        document.removeEventListener('touchend', handleModalDragEnd);

        if (modalElement) modalElement.style.transform = '';
    }

    const mainScroller = selectOne('.app-layout__main');
    if (mainScroller && lastScrollTop !== null) {
        requestAnimationFrame(() => {
            mainScroller.scrollTop = lastScrollTop;
            lastScrollTop = null;
        });
    }
};

// =================================================================
// === FIN: CÓDIGO UNIFICADO PARA MODALES ARRASTRABLES ===
// =================================================================


        const closeCalculatorOnClickOutside = (e) => {
            const calculatorEl = select('calculator-ui');
            if (!calculatorState.isVisible || (calculatorEl && calculatorEl.contains(e.target))) {
                 setTimeout(() => {
                     document.addEventListener('click', closeCalculatorOnClickOutside, { once: true });
                 }, 0);
                return;
            }
            hideCalculator();
        };       

		 const updateDoneButtonText = () => {
            const doneButton = select('calculator-btn-done');
            if (doneButton) {
                doneButton.textContent = calculatorState.isResultDisplayed ? 'Cerrar' : 'OK';
            }
        };
        

        const updateCalculatorDisplay = () => {
    const display = select('calculator-display');
    if (display) {
        // Esta función ahora es muy "tonta". Simplemente muestra lo que hay en
        // calculatorState.displayValue, sin intentar formatearlo o cambiarlo.
        // ¡El camarero obediente!
        display.textContent = calculatorState.displayValue;
    }
};
        const showGenericModal=(title,html)=>{const titleEl = select('generic-modal-title'); if (titleEl) titleEl.textContent=title; const bodyEl = select('generic-modal-body'); if(bodyEl) bodyEl.innerHTML=html;showModal('generic-modal');};
const showDrillDownModal = (title, movements) => {
    // Ordenamos los movimientos para que se muestren cronológicamente
    movements.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Construimos el contenido del modal
    let modalContentHTML = movements.length === 0
    ? `<div class="empty-state" style="background:transparent; border:none; padding-top: var(--sp-4);">
           <span class="material-icons">search_off</span>
           <h3>Sin movimientos</h3>
           <p>No se han encontrado movimientos para esta selección.</p>
       </div>`
    : movements.map(m => 
          // Mantenemos la clase de animación 'list-item-animate'
          TransactionCardComponent(m, { cuentas: db.cuentas, conceptos: db.conceptos })
      )
      .join('')
      // Cambiamos la acción para que la edición funcione desde dentro del modal
      .replace(/data-action="edit-movement-from-list"/g, 'data-action="edit-movement-from-modal"');

    // Llamamos a la función para mostrar el modal
    showGenericModal(title, modalContentHTML);
    
    // --- ¡LA MAGIA SUCEDE AQUÍ! ---
    // Después de que el modal se muestra, activamos la animación en cascada.
    setTimeout(() => {
        const modalBody = document.getElementById('generic-modal-body');
        if (modalBody) {
            const itemsToAnimate = modalBody.querySelectorAll('.list-item-animate');
            itemsToAnimate.forEach((item, index) => {
                // Aplicamos la clase que dispara la animación con un pequeño retraso
                // para cada elemento, creando el efecto cascada.
                setTimeout(() => {
                    item.classList.add('item-enter-active');
                }, index * 40); // 40 milisegundos de retraso entre cada item
            });
        }
    }, 50); // Un pequeño retardo para asegurar que el modal es visible
};
        const showConfirmationModal=(msg, onConfirm, title="Confirmar Acción")=>{ hapticFeedback('medium'); const id='confirmation-modal';const existingModal = document.getElementById(id); if(existingModal) existingModal.remove(); const overlay=document.createElement('div');overlay.id=id;overlay.className='modal-overlay modal-overlay--active'; overlay.innerHTML=`<div class="modal" role="alertdialog" style="border-radius:var(--border-radius-lg)"><div class="modal__header"><h3 class="modal__title">${title}</h3></div><div class="modal__body"><p>${msg}</p><div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-4);"><button class="btn btn--secondary btn--full" data-action="close-modal" data-modal-id="confirmation-modal">Cancelar</button><button class="btn btn--danger btn--full" data-action="confirm-action">Sí, continuar</button></div></div></div>`; document.body.appendChild(overlay); (overlay.querySelector('[data-action="confirm-action"]')).onclick=()=>{hapticFeedback('medium');onConfirm();overlay.remove();}; (overlay.querySelector('[data-action="close-modal"]')).onclick=()=>overlay.remove(); };


// Esta nueva función prepara el campo de cantidad cuando se abre el formulario.
const initAmountInput = () => {
    const amountInput = select('movimiento-cantidad');
    const calculatorToggle = select('calculator-toggle-btn');
    if (!amountInput || !calculatorToggle) return;
    
    if (isMobileDevice()) {
        // MÓVIL: Hacemos que el input no saque el teclado y que al tocarlo, se abra nuestra calculadora.
        amountInput.setAttribute('inputmode', 'none');
        calculatorToggle.style.display = 'none'; // Ocultamos el botón del icono en móvil
        
        // Usamos un listener de 'click' porque 'focus' puede ser problemático en algunos móviles
        amountInput.onclick = (e) => {
            e.preventDefault();
            showCalculator(amountInput);
        };

    } else {
        // ESCRITORIO: Permitimos escribir normalmente y el botón del icono abre la calculadora.
        amountInput.setAttribute('inputmode', 'decimal');
        calculatorToggle.style.display = 'inline-flex';
        amountInput.onclick = null; // Quitamos el listener de móvil por si acaso
        calculatorToggle.onclick = () => showCalculator(amountInput);
    }
};


const showCalculator = (targetInput) => {
    const calculatorOverlay = select('calculator-overlay');
    if (!calculatorOverlay) return;
    
    calculatorOverlay.classList.add('modal-overlay--active');
    calculatorState.isVisible = true;
    calculatorState.targetInput = targetInput;
    calculatorState.displayValue = '0';
    calculatorState.waitingForNewValue = true;
    updateCalculatorDisplay();

    // ¡LA MAGIA PARA PC!
    if (!isMobileDevice()) {
        if (calculatorKeyboardHandler) document.removeEventListener('keydown', calculatorKeyboardHandler);
        
        calculatorKeyboardHandler = (e) => {
            if ("0123456789,.+-*\/".includes(e.key) || ['Enter', 'Backspace', 'Escape', 'Delete'].includes(e.key)) e.preventDefault();
            
            if (e.key >= '0' && e.key <= '9') handleCalculatorInput(e.key);
            else if (e.key === ',' || e.key === '.') handleCalculatorInput('comma');
            else if (e.key === 'Enter') handleCalculatorInput('done');
            else if (e.key === 'Backspace') handleCalculatorInput('backspace');
            else if (e.key === 'Delete') handleCalculatorInput('clear');
            else if (e.key === 'Escape') hideCalculator();
            else if (e.key === '+') handleCalculatorInput('add');
            else if (e.key === '-') handleCalculatorInput('subtract');
            else if (e.key === '*' || e.key.toLowerCase() === 'x') handleCalculatorInput('multiply');
            else if (e.key === '/') handleCalculatorInput('divide');
        };
        document.addEventListener('keydown', calculatorKeyboardHandler);
    }
};

const hideCalculator = () => {
    const calculatorOverlay = select('calculator-overlay');
    if (calculatorOverlay) {
        calculatorOverlay.classList.remove('modal-overlay--active');
    }
    calculatorState.isVisible = false;
    
    if (calculatorKeyboardHandler) {
        document.removeEventListener('keydown', calculatorKeyboardHandler);
        calculatorKeyboardHandler = null;
    }
};		
		
		
// =================================================================
// === INICIO: FUNCIÓN showToast (CORRECCIÓN CRÍTICA) ===
// =================================================================
const showAccountMovementsModal = async (cId) => {
    const cuenta = getVisibleAccounts().find((c) => c.id === cId);
    if (!cuenta) return;

    showGenericModal(`Movimientos de ${cuenta.nombre}`, `<div style="text-align:center; padding: var(--sp-5);"><span class="spinner"></span><p style="margin-top: var(--sp-3);">Cargando historial...</p></div>`);

    try {
    // ▼▼▼ ESTA PARTE ES LA NUEVA Y EFICIENTE ▼▼▼
    const userMovementsRef = fbDb.collection('users').doc(currentUser.uid).collection('movimientos');
    
    // Creamos tres promesas de consulta, una para cada campo donde puede aparecer el ID de la cuenta.
    const queryPromises = [
        userMovementsRef.where('cuentaId', '==', cId).get(),
        userMovementsRef.where('cuentaOrigenId', '==', cId).get(),
        userMovementsRef.where('cuentaDestinoId', '==', cId).get()
    ];
    
    // Ejecutamos las tres consultas en paralelo para máxima velocidad.
    const snapshots = await Promise.all(queryPromises);
    
    // Unimos los resultados y eliminamos duplicados usando un Map.
    const movementsMap = new Map();
    snapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
            if (!movementsMap.has(doc.id)) {
                movementsMap.set(doc.id, { id: doc.id, ...doc.data() });
            }
        });
    });

    const accountMovements = Array.from(movementsMap.values());
        
        // ¡LA MAGIA SUCEDE AQUÍ! Usamos nuestra nueva función para preparar los datos.
        if (accountMovements.length > 0) {
            recalculateAndApplyRunningBalances(accountMovements, db.cuentas);
        }
        
        // Llamamos directamente a showDrillDownModal, que ya sabe cómo mostrar la lista.
        showDrillDownModal(`Movimientos de ${cuenta.nombre}`, accountMovements);

    } catch (error) {
        console.error("Error al obtener los movimientos de la cuenta:", error);
        showToast("No se pudo cargar el historial de la cuenta.", "danger");
        const modalBody = select('generic-modal-body');
        if (modalBody) {
            modalBody.innerHTML = `<p class="text-danger" style="text-align:center;">Ha ocurrido un error al cargar los datos.</p>`;
        }
    }
};
    const showAccountMovementsForDashboardPeriod = async (accountId) => {
    const cuenta = getVisibleAccounts().find((c) => c.id === accountId);
    if (!cuenta) return;

    // Mostramos un spinner mientras se procesan los datos.
    showGenericModal(`Movimientos de ${cuenta.nombre}`, `<div style="text-align:center; padding: var(--sp-5);"><span class="spinner"></span></div>`);

    // 1. Obtenemos los movimientos ya filtrados por fecha del panel.
    const { current } = await getFilteredMovements(false);
    
    // 2. Filtramos esa lista por la cuenta seleccionada.
    const accountMovementsInPeriod = current.filter(m => 
        m.cuentaId === accountId || 
        m.cuentaOrigenId === accountId || 
        m.cuentaDestinoId === accountId
    );
    
    // 3. ¡EL PASO CRÍTICO QUE FALTABA!
    // Calculamos los saldos acumulados para esta lista específica de movimientos.
    if (accountMovementsInPeriod.length > 0) {
        recalculateAndApplyRunningBalances(accountMovementsInPeriod, db.cuentas);
    }

    // 4. Usamos la función de modal existente para mostrar el resultado ya procesado.
    showDrillDownModal(`Movimientos de ${cuenta.nombre}`, accountMovementsInPeriod);
};
const setMovimientoFormType = (type) => {
    hapticFeedback('light');
    const isTraspaso = type === 'traspaso';

    // 1. Obtenemos referencias a los elementos
    const titleEl = select('form-movimiento-title');
    const amountGroup = select('movimiento-cantidad-form-group');
    const mode = select('movimiento-mode').value; // <-- ¡LA CLAVE ESTÁ AQUÍ!

    // Ocultar/mostrar campos
    select('movimiento-fields').classList.toggle('hidden', isTraspaso);
    select('traspaso-fields').classList.toggle('hidden', !isTraspaso);

    // 2. Reseteamos colores
    if (titleEl) {
        titleEl.classList.remove('title--gasto', 'title--ingreso', 'title--traspaso');
    }
    if (amountGroup) {
        amountGroup.classList.remove('is-gasto', 'is-ingreso', 'is-traspaso');
    }

    // 3. Aplicamos colores y el TÍTULO CORRECTO
    if (titleEl && amountGroup) {
        const isEditing = mode.startsWith('edit');
        let baseTitle = isEditing ? 'Editar' : 'Nuevo';

        switch (type) {
            case 'gasto':
                titleEl.textContent = `${baseTitle} Gasto`;
                titleEl.classList.add('title--gasto');
                amountGroup.classList.add('is-gasto');
                break;
            case 'ingreso':
                titleEl.textContent = `${baseTitle} Ingreso`;
                titleEl.classList.add('title--ingreso');
                amountGroup.classList.add('is-ingreso');
                break;
            case 'traspaso':
                titleEl.textContent = `${baseTitle} Traspaso`;
                titleEl.classList.add('title--traspaso');
                amountGroup.classList.add('is-traspaso');
                if (!isEditing && select('movimiento-descripcion').value.trim() === '') {
                    select('movimiento-descripcion').value = 'Traspaso';
                }
                break;
        }
    }
    
    // Gestionar la clase activa en los botones
    selectAll('[data-action="set-movimiento-type"]').forEach(btn => {
        btn.classList.toggle('filter-pill--active', btn.dataset.type === type);
    });
};

                const updateDateDisplay = (dateInput) => {
            const dateTextEl = select('movimiento-fecha-text');
            if (!dateTextEl || !dateInput.value) return;

            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            today.setHours(0, 0, 0, 0);
            yesterday.setHours(0, 0, 0, 0);

            const selectedDate = new Date(dateInput.value);
            selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate.getTime() === today.getTime()) {
                dateTextEl.textContent = "Hoy";
            } else if (selectedDate.getTime() === yesterday.getTime()) {
                dateTextEl.textContent = "Ayer";
            } else {
                dateTextEl.textContent = selectedDate.toLocaleDateString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });
            }
        };


const startMovementForm = async (id = null, isRecurrent = false) => {
    hapticFeedback('medium');
    const form = select('form-movimiento');
    form.reset();
    clearAllErrors(form.id);
    populateAllDropdowns();

    let data = null;
    let mode = 'new';
    let initialType = 'gasto';

    if (id) {
        try {
            const collectionName = isRecurrent ? 'recurrentes' : 'movimientos';
            const doc = await fbDb.collection('users').doc(currentUser.uid).collection(collectionName).doc(id).get();

            if (doc.exists) {
                data = { id: doc.id, ...doc.data() };
                mode = isRecurrent ? 'edit-recurrent' : 'edit-single';
                initialType = data.tipo === 'traspaso' ? 'traspaso' : (data.cantidad < 0 ? 'gasto' : 'ingreso');
            } else {
                showToast("Error: No se encontró el elemento para editar.", "danger");
                id = null;
            }
        } catch (error) {
            console.error("Error al cargar datos para editar:", error);
            showToast("Error al cargar los datos.", "danger");
            return;
        }
    }

    setMovimientoFormType(initialType);
    select('movimiento-mode').value = mode;
    select('movimiento-id').value = id || '';

    if (data) {
        select('movimiento-cantidad').value = `${(Math.abs(data.cantidad) / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, useGrouping: false })}`;
        
        const fechaInput = select('movimiento-fecha');
        const dateStringForInput = isRecurrent ? data.nextDate : data.fecha;

        if (dateStringForInput) {
            const fecha = new Date(dateStringForInput);
            fechaInput.value = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
            updateDateDisplay(fechaInput);
        } else {
            const fecha = new Date();
            fechaInput.value = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
            updateDateDisplay(fechaInput);
        }

        select('movimiento-descripcion').value = data.descripcion || '';

        if (data.tipo === 'traspaso') {
            select('movimiento-cuenta-origen').value = data.cuentaOrigenId || '';
            select('movimiento-cuenta-destino').value = data.cuentaDestinoId || '';
            select('movimiento-cuenta-origen').dispatchEvent(new Event('change'));
            select('movimiento-cuenta-destino').dispatchEvent(new Event('change'));
        } else {
            select('movimiento-cuenta').value = data.cuentaId || '';
            select('movimiento-concepto').value = data.conceptoId || '';
            select('movimiento-cuenta').dispatchEvent(new Event('change'));
            select('movimiento-concepto').dispatchEvent(new Event('change'));
        }

        const recurrenteCheckbox = select('movimiento-recurrente');
        const recurrentOptions = select('recurrent-options');
        if (mode === 'edit-recurrent') {
            recurrenteCheckbox.checked = true;
            select('recurrent-frequency').value = data.frequency;
            select('recurrent-next-date').value = data.nextDate;
            select('recurrent-end-date').value = data.endDate || '';
            recurrentOptions.classList.remove('hidden');
        } else {
            recurrenteCheckbox.checked = false;
            recurrentOptions.classList.add('hidden');
        }
    } else {
        const fechaInput = select('movimiento-fecha');
        const fecha = new Date();
        fechaInput.value = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
        updateDateDisplay(fechaInput);
    }
    
    select('delete-movimiento-btn').classList.toggle('hidden', !id || !data);
    select('delete-movimiento-btn').dataset.isRecurrent = String(isRecurrent);
    select('duplicate-movimiento-btn').classList.toggle('hidden', !(mode === 'edit-single' && data));

    showModal('movimiento-modal');
    initAmountInput();
    
    if (!id) {
        setTimeout(() => showCalculator(select('movimiento-cantidad')), 150);
    }
};
        
        
        const showGlobalSearchModal = () => {
            hapticFeedback('medium');
            showModal('global-search-modal');
            setTimeout(() => {
                const input = select('global-search-input');
								
                if (input) {
                    input.focus();
                    input.value = '';
                    input.dispatchEvent(new Event('input'));
                }
            }, 100);
        };
        
        // REEMPLAZA TU FUNCIÓN performGlobalSearch POR ESTA VERSIÓN MEJORADA
const performGlobalSearch = async (query) => {
    const resultsContainer = select('global-search-results');
    if (!resultsContainer) return;

    if (!query || query.trim().length < 2) {
        resultsContainer.innerHTML = `<div class="empty-state" style="background:transparent; border: none;"><span class="material-icons">manage_search</span><h3>Encuéntralo todo</h3><p>Busca movimientos, cuentas o conceptos. <br>Atajo: <strong>Cmd/Ctrl + K</strong></p></div>`;
        return;
    }

    resultsContainer.innerHTML = `<div style="text-align: center; padding: var(--sp-5);"><span class="spinner"></span><p style="margin-top: var(--sp-2);">Buscando en toda tu base de datos...</p></div>`;
    
    const queryLower = query.toLowerCase();
    let resultsHtml = '';
    const MAX_RESULTS_PER_GROUP = 10;

    const allMovements = await fetchAllMovementsForSearch();

    // --- SECCIÓN DE MOVIMIENTOS MEJORADA ---
    const movs = allMovements
        .map(m => {
            const concepto = db.conceptos.find(c => c.id === m.conceptoId);
            const conceptoNombre = (concepto && concepto.nombre) || '';
            let cuentaInfo = '';
            if (m.tipo === 'traspaso') {
                const origen = db.cuentas.find(c => c.id === m.cuentaOrigenId);
                const destino = db.cuentas.find(c => c.id === m.cuentaDestinoId);
                cuentaInfo = `${(origen && origen.nombre) || ''} → ${(destino && destino.nombre) || ''}`;
            } else {
                const cuenta = db.cuentas.find(c => c.id === m.cuentaId);
                cuentaInfo = (cuenta && cuenta.nombre) || '';
            }
            const fecha = new Date(m.fecha).toLocaleDateString('es-ES');
            const importe = (m.cantidad / 100).toLocaleString('es-ES');
            const searchableText = `${m.descripcion} ${conceptoNombre} ${cuentaInfo} ${fecha} ${importe}`.toLowerCase();
            return { movement: m, text: searchableText, cuentaInfo: cuentaInfo };
        })
        .filter(item => item.text.includes(queryLower))
        .sort((a, b) => new Date(b.movement.fecha) - new Date(a.movement.fecha))
        .slice(0, MAX_RESULTS_PER_GROUP)
        .map(item => item); // Devolvemos el objeto completo con cuentaInfo

    if (movs.length > 0) {
        resultsHtml += `<div class="search-result-group">
                            <div class="search-result-group__title">Movimientos Encontrados</div>`;
        movs.forEach(item => {
            const m = item.movement;
            const amountClass = m.cantidad >= 0 ? 'text-positive' : 'text-negative';
            resultsHtml += `
                <button class="search-result-item" data-action="search-result-movimiento" data-id="${m.id}">
                    <span class="material-icons search-result-item__icon">receipt_long</span>
                    <div class="search-result-item__details">
                        <p>${escapeHTML(m.descripcion)}</p>
                        <small>${new Date(m.fecha).toLocaleDateString('es-ES')} • ${escapeHTML(item.cuentaInfo)}</small>
                    </div>
                    <strong class="search-result-item__amount ${amountClass}">${formatCurrency(m.cantidad)}</strong>
                </button>`;
        });
        resultsHtml += `</div>`;
    }

    // --- SECCIÓN DE CUENTAS MEJORADA ---
    const cuentas = (db.cuentas || []).filter(c => c.nombre.toLowerCase().includes(queryLower) || c.tipo.toLowerCase().includes(queryLower)).slice(0, MAX_RESULTS_PER_GROUP);
    if (cuentas.length > 0) {
        resultsHtml += `<div class="search-result-group">
                            <div class="search-result-group__title">Cuentas</div>`;
        cuentas.forEach(c => {
            resultsHtml += `
                <button class="search-result-item" data-action="search-result-cuenta" data-id="${c.id}">
                    <span class="material-icons search-result-item__icon">account_balance_wallet</span>
                    <div class="search-result-item__details">
                        <p>${escapeHTML(c.nombre)}</p>
                        <small>${escapeHTML(c.tipo)}</small>
                    </div>
                </button>`;
        });
        resultsHtml += `</div>`;
    }

    // --- SECCIÓN DE CONCEPTOS MEJORADA ---
    const conceptos = (db.conceptos || []).filter(c => c.nombre.toLowerCase().includes(queryLower)).slice(0, MAX_RESULTS_PER_GROUP);
    if (conceptos.length > 0) {
        resultsHtml += `<div class="search-result-group">
                            <div class="search-result-group__title">Conceptos</div>`;
        conceptos.forEach(c => {
            resultsHtml += `
                <button class="search-result-item" data-action="search-result-concepto" data-id="${c.id}">
                    <span class="material-icons search-result-item__icon">label</span>
                    <div class="search-result-item__details">
                        <p>${escapeHTML(c.nombre)}</p>
                    </div>
                </button>`;
        });
        resultsHtml += `</div>`;
    }

    if (!resultsHtml) {
        resultsHtml = `<div class="empty-state" style="background:transparent; border: none;"><span class="material-icons">search_off</span><h3>Sin resultados</h3><p>No se encontró nada para "${escapeHTML(query)}".</p></div>`;
    }
    
    resultsContainer.innerHTML = resultsHtml;
};

		// REEMPLAZA tu función showValoracionModal con esta versión
const showValoracionModal = (cuentaId) => {
    const cuenta = db.cuentas.find(c => c.id === cuentaId);
    if (!cuenta) return;

    const fechaISO = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
    
    const ultimaValoracion = (db.inversiones_historial || []).filter(v => v.cuentaId === cuentaId).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

    const valorActualInput = ultimaValoracion ? (ultimaValoracion.valor / 100).toLocaleString('es-ES', { useGrouping: false, minimumFractionDigits: 2 }) : '';

    const formHtml = `
    <form id="form-valoracion" data-id="${cuentaId}" novalidate>
        <p class="form-label" style="margin-bottom: var(--sp-3);">
            Introduce el valor de mercado actual para <strong>${escapeHTML(cuenta.nombre)}</strong>. Esto actualizará el P&L y la TIR.
        </p>
        <div class="form-group">
            <label for="valoracion-valor" class="form-label">Nuevo Valor Total del Activo</label>
            <input type="text" id="valoracion-valor" class="form-input input-amount-calculator" inputmode="none" required value="${valorActualInput}" placeholder="Ej: 15250,75">
        </div>
        <div class="form-group">
            <label for="valoracion-fecha" class="form-label">Fecha de la Valoración</label>
            <input type="date" id="valoracion-fecha" class="form-input" value="${fechaISO}" required>
        </div>
        <div class="modal__actions">
            <button type="submit" class="btn btn--primary">Guardar Valoración</button>
        </div>
    </form>`;

    showGenericModal(`Actualizar Valor de ${cuenta.nombre}`, formHtml);
};

// ======================================================================================
// === INICIO: GUARDADO DE VALORACIÓN - VERSIÓN FINAL CON ACTUALIZACIÓN OPTIMISTA (v8.0) ===
// ======================================================================================
const handleSaveValoracion = async (form, btn) => {
    setButtonLoading(btn, true);
    const cuentaId = form.dataset.id;
    const cuenta = db.cuentas.find(c => c.id === cuentaId);
    if (!cuenta) {
        showToast("Error: No se pudo encontrar la cuenta.", "danger");
        setButtonLoading(btn, false);
        return;
    }

    const valor = parseCurrencyString(select('valoracion-valor').value);
    const fecha = select('valoracion-fecha').value;
    
    if (isNaN(valor) || !fecha || valor < 0) {
        showToast('El valor debe ser un número positivo y la fecha es obligatoria.', "warning");
        setButtonLoading(btn, false);
        return;
    }
    
    const fechaISO = parseDateStringAsUTC(fecha).toISOString();
    const valorEnCentimos = Math.round(valor * 100);

    try {
        const userRef = fbDb.collection('users').doc(currentUser.uid);
        const query = userRef.collection('inversiones_historial').where('cuentaId', '==', cuentaId).where('fecha', '==', fechaISO).limit(1);
        const existingSnapshot = await query.get();

        let docId;
        if (!existingSnapshot.empty) {
            docId = existingSnapshot.docs[0].id;
			await existingSnapshot.docs[0].ref.update({ valor: valorEnCentimos });
        } else {
            docId = generateId();
            await saveDoc('inversiones_historial', docId, { id: docId, cuentaId, valor: valorEnCentimos, fecha: fechaISO });
        }

        // =====================================================================
        // === INICIO: ACTUALIZACIÓN OPTIMISTA DE LA UI (LA SOLUCIÓN CLAVE)   ===
        // =====================================================================

        // 1. Buscamos si ya existe una valoración para esta fecha en nuestra memoria local.
        const existingIndex = (db.inversiones_historial || []).findIndex(v => v.cuentaId === cuentaId && v.fecha === fechaISO);

        if (existingIndex > -1) {
            // Si existe, la actualizamos directamente en la memoria.
            db.inversiones_historial[existingIndex].valor = valorEnCentimos;
        } else {
            // Si no existe, la añadimos a la memoria.
            if (!db.inversiones_historial) db.inversiones_historial = [];
            db.inversiones_historial.push({ id: docId, cuentaId, valor: valorEnCentimos, fecha: fechaISO });
        }

        // 2. Nos aseguramos de que el filtro para este tipo de activo esté visible.
        const tipoDeCuenta = toSentenceCase(cuenta.tipo || 'S/T');
        deselectedInvestmentTypesFilter.delete(tipoDeCuenta);

        // 3. Ahora sí, redibujamos la pantalla. Esta llamada usará la memoria que acabamos de actualizar.
        const container = select('inversiones-content-container');
        if (container) {
            await renderInversionesPage('inversiones-content-container');
        }
        
        // ===================================================================
        // === FIN: ACTUALIZACIÓN OPTIMISTA DE LA UI                       ===
        // ===================================================================

        setButtonLoading(btn, false);
        hideModal('generic-modal');
        hapticFeedback('success');
        showToast('Valoración guardada y cálculos actualizados instantáneamente.');

    } catch (error) {
        console.error("Error al guardar la valoración:", error);
        showToast("No se pudo guardar la valoración.", "danger");
        setButtonLoading(btn, false);
    }
};
// ======================================================================================
// === FIN: GUARDADO DE VALORACIÓN - VERSIÓN FINAL                                      ===
// ======================================================================================

const showHelpModal = () => {
    const titleEl = select('help-modal-title');
    const bodyEl = select('help-modal-body');
    
    if (titleEl) {
        titleEl.textContent = 'Guía de Usuario aiDANaI';
    }
    if (bodyEl) {
        bodyEl.innerHTML = `
<div style="text-align: center; margin-bottom: var(--sp-4);">
    <img src="aiDANaI.webp" alt="Logo Cuentas aiDANaI" class="login-view__logo" style="margin-bottom: var(--sp-2);">
    <h3 style="font-size: 1.4rem;">Tu Centro de Mando Financiero</h3>
    <p style="color: var(--c-primary); font-weight: 600;">Donde la claridad se convierte en poder.</p>
</div>

<h4>¡Bienvenido a tu copiloto financiero personal!</h4>
<p>Si alguna vez has sentido que tu dinero tiene vida propia, que aparece y desaparece como por arte de magia, has llegado al lugar perfecto. Manejar las finanzas es como ser el director de una orquesta: cada instrumento (tus cuentas) debe sonar en armonía para crear una sinfonía de prosperidad. Esta aplicación te entrega la batuta.</p>
<p>Ha sido diseñada para ser tu GPS financiero, no un examinador severo. Olvídate de hojas de cálculo complejas. Aquí todo está pensado para que, en menos de cinco minutos, te sientas como el CEO de tu propio banco personal. ¿Listo/a para tomar el control? ¡Vamos allá!</p>

<h3><span class="material-icons">explore</span>El Gran Tour: Un Paseo por Tu Imperio</h3>
<p>Cada pestaña de la aplicación es un departamento de tu imperio financiero, diseñado para responder a una pregunta clave sobre tu dinero:</p>

<details class="accordion" style="margin-bottom: var(--sp-2);">
    <summary><span class="material-icons" style="margin-right:8px">dashboard</span><strong>1. Panel: ¿Cómo voy hoy? (La Torre de Control)</strong></summary>
    <div class="accordion__content" style="padding-top: var(--sp-2);">
        <p>Esta es tu <strong>vista de pájaro</strong>. De un solo vistazo, tienes el pulso de tu situación. Es tu panel personalizable con "Widgets", que son como tus asesores personales. Puedes activarlos, desactivarlos y reordenarlos desde el botón <span class="material-icons" style="font-size:1em; vertical-align:bottom;">dashboard_customize</span> en la barra superior.</p>
        <p><strong>Consejo de experto:</strong> ¡No te quedes en la superficie! La mayoría de los datos son interactivos. Haz clic en las barras de los gráficos (por ejemplo, en la barra de "Comida" en el gráfico de conceptos) y verás un desglose de todos los movimientos de esa categoría para el periodo seleccionado.</p>
    </div>
</details>

<details class="accordion" style="margin-bottom: var(--sp-2);">
    <summary><span class="material-icons" style="margin-right:8px">receipt_long</span><strong>2. Diario: ¿Qué ha pasado exactamente? (El Libro de la Verdad)</strong></summary>
    <div class="accordion__content" style="padding-top: var(--sp-2);">
        <p>Este es tu <strong>historial financiero completo</strong>, el registro notarial de cada céntimo. Es la verdad absoluta de tus finanzas, sin trampa ni cartón.</p>
        <p><strong>Superpoder secreto:</strong> ¡El Gesto Mágico! En un dispositivo móvil, desliza cualquier movimiento hacia la <strong>derecha para duplicarlo</strong> (perfecto para ese café que te tomas cada mañana) o hacia la <strong>izquierda para borrarlo</strong>. Esto te ahorrará horas a lo largo del año.</p>
    </div>
</details>

<details class="accordion" style="margin-bottom: var(--sp-2);">
    <summary><span class="material-icons" style="margin-right:8px">edit_calendar</span><strong>3. Planificar: ¿Cuál es mi plan de futuro? (La Sala de Estrategia)</strong></summary>
    <div class="accordion__content" style="padding-top: var(--sp-2);">
        <p>Aquí te pones el sombrero de estratega. Es donde le dices a tu dinero qué hacer, en lugar de preguntarte a dónde se ha ido a final de mes. Domina tu futuro con dos herramientas clave:</p>
         <ul>
            <li><strong>Movimientos Recurrentes:</strong> ¡Automatiza tu vida! Registra tu nómina, el alquiler, Netflix, el gimnasio... La app los tendrá listos para ti cada mes en la sección "Diario" para que los confirmes con un solo clic. Se acabó teclear lo mismo una y otra vez.</li>
            <li><strong>Presupuestos Anuales:</strong> ¡Tu plan de batalla! Define cuánto quieres gastar o ingresar por categoría al año. La app te mostrará proyecciones y te dirá si vas por buen camino para tus metas o si te estás pasando con los pedidos a domicilio.</li>
        </ul>
    </div>
</details>

<details class="accordion" style="margin-bottom: var(--sp-2);">
    <summary><span class="material-icons" style="margin-right:8px">rocket_launch</span><strong>4. Inversiones: ¿Mi dinero está trabajando para mí? (El Motor de Riqueza)</strong></summary>
    <div class="accordion__content" style="padding-top: var(--sp-2);">
        <p>Esta es la sección dedicada a tu portafolio. Analiza tus inversiones como un profesional con métricas clave que te darán una claridad total:</p>
        <ul>
            <li><strong>P&L (Ganancias y Pérdidas):</strong> Es el "marcador" del partido. Te dice, en euros y en porcentaje, si vas ganando o perdiendo basándose en la diferencia entre el valor de mercado que introduces y el capital que has aportado. Simple y honesto.</li>
            <li><strong>TIR (Tasa Interna de Retorno):</strong> ¡El indicador definitivo! Olvídate de porcentajes confusos. La TIR te dice la rentabilidad <strong>anualizada real</strong> de tu dinero, teniendo en cuenta CUÁNDO y CUÁNTO has invertido. Es la métrica que usan los profesionales para saber si una inversión de verdad merece la pena.</li>
        </ul>
    </div>
</details>

<h3><span class="material-icons">stars</span>Funciones Estrella: Tus Superpoderes Secretos</h3>
<p>Ahora que conoces el terreno, déjame revelarte las funciones que convierten esta app en una auténtica navaja suiza para tus finanzas.</p>

<details class="accordion" style="margin-bottom: var(--sp-2);">
    <summary>🚀 <strong>Contabilidad Dual (A/B): Tu Arma Secreta</strong></summary>
    <div class="accordion__content" style="padding-top: var(--sp-2);"><p>El botón <strong>[A]/[B]</strong> en la esquina superior izquierda es pura magia. Te permite llevar dos contabilidades <strong>totalmente separadas e independientes</strong>. ¡Es como tener dos aplicaciones en una!</p>
    <p><strong>Ejemplos que te cambiarán la vida:</strong></p>
    <ul>
        <li><strong>Contabilidad A (Personal):</strong> Tu vida diaria, tus gastos, tu nómina, la compra semanal.</li>
        <li><strong>Contabilidad B (Proyecto):</strong> Las finanzas de tu pequeño negocio, la reforma de casa, la gestión de una comunidad de vecinos, o incluso ese viaje épico con amigos para que nadie se haga el loco con los gastos. ¡Todo separado y sin mezclar!</li>
    </ul>
    </div>
</details>

<details class="accordion" style="margin-bottom: var(--sp-2);">
    <summary>🔍 <strong>Búsqueda Global (Atajo: Ctrl/Cmd + K)</strong></summary>
    <div class="accordion__content" style="padding-top: var(--sp-2);"><p>Pulsa el icono de la lupa (o el atajo de teclado en un ordenador) y desata su poder. Escribe lo que sea: "pizza", "nómina", "alquiler", "Amazon"... La búsqueda te mostrará al instante movimientos, cuentas o conceptos relacionados. ¡Es la forma más rápida de encontrar cualquier cosa en segundos!</p></div>
</details>

<details class="accordion" style="margin-bottom: var(--sp-2);">
    <summary>🧠 <strong>Autocompletado Inteligente: El Copiloto Automático</strong></summary>
    <div class="accordion__content" style="padding-top: var(--sp-2);">
        <p>Cuando añadas un movimiento, empieza a escribir la descripción. Verás que te sugiero conceptos y cuentas basándome en tus hábitos. Si siempre que escribes "Mercadona" lo asocias al concepto "Supermercado" y a tu "Tarjeta de Débito", la aplicación lo aprenderá. Con el tiempo, rellenará los campos por ti. ¡Tu tiempo es oro!</p>
    </div>
</details>

<details class="accordion" style="margin-bottom: var(--sp-2);">
    <summary>🔄 <strong>Importación Mágica desde CSV: El Puente Definitivo</strong></summary>
    <div class="accordion__content" style="padding-top: var(--sp-2);">
        <p>¿Vienes de otra app o de una hoja de cálculo? ¡No hay problema! Ve a <strong>Ajustes > Importar desde CSV</strong>. Solo necesitas un archivo con 5 columnas en este orden exacto (con cabecera incluida):</p>
        <code>FECHA;CUENTA;CONCEPTO;IMPORTE;DESCRIPCIÓN</code>
        <p>La aplicación es tan inteligente que si una cuenta o concepto no existe, ¡lo creará automáticamente por ti! Usa estas palabras mágicas en la columna de concepto para desatar todo su poder:</p>
        <ul>
            <li>Usa <code>INICIAL</code> para establecer el saldo de partida de una cuenta en una fecha concreta.</li>
            <li>Usa <code>TRASPASO</code> para que empareje automáticamente los movimientos entre tus cuentas.</li>
        </ul>
    </div>
</details>

<p style="text-align: center; margin-top: var(--sp-5); font-style: italic; color: var(--c-on-surface-secondary);">¡Explora, registra y toma el control definitivo de tu futuro financiero! Estás al mando.</p>
        `;
    }
    
    showModal('help-modal');
};
 
	const updateThemeIcon = () => {
    const themeBtn = select('theme-toggle-btn');
    if (!themeBtn) return;
    
    const iconEl = themeBtn.querySelector('.material-icons');
    if (!iconEl) return;

    const themeKeys = Object.keys(THEMES);
    const currentThemeKey = document.body.dataset.theme || 'default';
    const currentIndex = themeKeys.indexOf(currentThemeKey);
    
    // Lógica para el siguiente tema (para el tooltip)
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextThemeKey = themeKeys[nextIndex];

    // ¡CORRECCIÓN CLAVE!
    // 1. El icono muestra el estado ACTUAL.
    iconEl.textContent = THEMES[currentThemeKey].icon;
    // 2. El tooltip describe la ACCIÓN a realizar.
    themeBtn.title = `Cambiar a Tema: ${THEMES[nextThemeKey].name}`;
};
	// --- ▼▼▼ PEGA ESTAS DOS NUEVAS FUNCIONES COMPLETAS ▼▼▼ ---

/**
 * Calcula los datos del colchón de emergencia.
 * @param {object} saldos - Objeto con los saldos de todas las cuentas.
 * @param {Array} cuentas - Array con la información de todas las cuentas.
 * @param {Array} recentMovements - Array con los movimientos de los últimos 3 meses.
 * @returns {object} Un objeto con los resultados del cálculo.
 */
const calculateEmergencyFund = (saldos, cuentas, recentMovements) => {
    const LIQUIDO_TYPES = ['BANCO', 'AHORRO', 'EFECTIVO'];
    const DEBT_TYPES = ['TARJETA DE CRÉDITO'];

    let totalLiquido = 0;
    let totalDeudaTarjeta = 0;

    cuentas.forEach(c => {
        const tipo = (c.tipo || '').toUpperCase();
        if (LIQUIDO_TYPES.includes(tipo)) {
            totalLiquido += (saldos[c.id] || 0);
        } else if (DEBT_TYPES.includes(tipo)) {
            totalDeudaTarjeta += (saldos[c.id] || 0); // La deuda ya es negativa
        }
    });

    const colchonNeto = totalLiquido + totalDeudaTarjeta; // Sumamos porque la deuda ya es negativa

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expensesLast3Months = recentMovements
        .filter(m => new Date(m.fecha) >= threeMonthsAgo && m.tipo === 'movimiento' && m.cantidad < 0)
        .reduce((sum, m) => sum + m.cantidad, 0);

    const gastoMensualPromedio = Math.abs(expensesLast3Months / 3);

    const mesesCobertura = (gastoMensualPromedio > 0) ? (colchonNeto / gastoMensualPromedio) : Infinity;

    return { colchonNeto, gastoMensualPromedio, mesesCobertura };
};

/**
 * Calcula los datos de progreso hacia la Independencia Financiera.
 * @param {number} patrimonioNeto - El patrimonio neto total del usuario.
 * @param {number} gastoMensualPromedio - El gasto mensual promedio.
 * @returns {object} Un objeto con los resultados del cálculo.
 */
const calculateFinancialIndependence = (patrimonioNeto, gastoMensualPromedio) => {
    const gastoAnualEstimado = gastoMensualPromedio * 12;
    const objetivoFI = gastoAnualEstimado * 30;
    
    let progresoFI = 0;
    if (objetivoFI > 0 && patrimonioNeto > 0) {
        progresoFI = (patrimonioNeto / objetivoFI) * 100;
    }

    return { patrimonioNeto, gastoAnualEstimado, objetivoFI, progresoFI };
};

// --- ▲▲▲ FIN DEL CÓDIGO A PEGAR ▲▲▲ ---

 // REEMPLAZA LA FUNCIÓN ANTIGUA CON ESTA
const handleToggleTheme = () => {
    const themeKeys = Object.keys(THEMES);
    const currentTheme = document.body.dataset.theme || 'default';
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const newTheme = themeKeys[nextIndex];

    document.body.dataset.theme = newTheme;
    localStorage.setItem('appTheme', newTheme);
    hapticFeedback('light');
    updateThemeIcon(); // No necesita parámetro, ahora es más inteligente

    // Esto es importante para que los gráficos recarguen sus colores
    if (conceptosChart) conceptosChart.destroy();
    if (liquidAssetsChart) liquidAssetsChart.destroy();
    
    const activePageEl = document.querySelector('.view--active');
    const activePageId = activePageEl ? activePageEl.id : null;
    if (activePageId) {
        navigateTo(activePageId, true);
    }
};
        const showConceptosModal = () => { 
            const html = `
    <div class="form-group" style="margin-bottom: var(--sp-3);">
        <input type="search" id="concepto-search-input" class="form-input" placeholder="Buscar conceptos..." autocomplete="off">
    </div>
                <form id="add-concepto-form" novalidate style="margin-bottom: var(--sp-4);">
                    <div class="form-grid"><div class="form-group" style="grid-column: 1 / -1;"><label for="new-concepto-nombre" class="form-label">Nombre del Concepto</label><input type="text" id="new-concepto-nombre" class="form-input" placeholder="Ej: Nómina" required></div></div>
                    <button type="submit" class="btn btn--primary btn--full">Añadir Concepto</button>
                </form>
                <hr style="border-color: var(--c-outline); opacity: 0.5;"><h4 style="margin-top: var(--sp-4); margin-bottom: var(--sp-2); font-size: var(--fs-base); color: var(--c-on-surface-secondary);">Conceptos Existentes</h4><div id="conceptos-modal-list"></div>`; 
            showGenericModal('Gestionar Conceptos', html); 
            renderConceptosModalList(); 
        };
        
        const renderConceptosModalList = () => { 
            const list = select('conceptos-modal-list'); 
            if (!list) return;
			 const searchQuery = select('concepto-search-input')?.value.toLowerCase() || '';
    const conceptosFiltrados = (db.conceptos || []).filter(c => 
        c.nombre.toLowerCase().includes(searchQuery)
    );
            list.innerHTML = conceptosFiltrados.length === 0 
                ? `<p style="font-size:var(--fs-sm); color:var(--c-on-surface-secondary); text-align:center; padding: var(--sp-4) 0;">No hay conceptos.</p>` 
                : conceptosFiltrados.sort((a,b) => a.nombre.localeCompare(b.nombre)).map((c) => {
                    const icon = (c && c.icon) || 'label';
                    const nombre = (c && c.nombre) || '';
                    return `<div id="concepto-item-${c.id}" class="modal__list-item"><div style="display: flex; align-items: center; gap: 12px; flex-grow: 1; min-width: 0;"><span class="material-icons" style="color: var(--c-primary);">${icon}</span><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(nombre)}</span></div><div style="display: flex; align-items: center; gap: var(--sp-1); flex-shrink: 0;"><button class="icon-btn" data-action="edit-concepto" data-id="${c.id}" title="Editar Concepto"><span class="material-icons">edit_note</span></button><button class="icon-btn" data-action="delete-concepto" data-id="${c.id}" title="Eliminar Concepto"><span class="material-icons">delete_outline</span></button></div></div>`;
                }).join(''); 
        };
        
        const showConceptoEditForm = (id) => {
            const itemContainer = select(`concepto-item-${id}`);
            const concepto = db.conceptos.find(c => c.id === id);
            if (!itemContainer || !concepto) return;
            itemContainer.innerHTML = `
                <form class="inline-edit-form" data-id="${id}" novalidate>
                    <div class="form-group" style="margin-bottom: 0;"><label class="form-label" for="edit-concepto-nombre-${id}">Nombre</label><input type="text" id="edit-concepto-nombre-${id}" class="form-input" value="${escapeHTML(concepto.nombre)}" required></div>
                    <div style="display:flex; justify-content: flex-end; gap: var(--sp-2); align-items: center; margin-top: var(--sp-2);"><button type="button" class="btn btn--secondary" data-action="cancel-edit-concepto">Cancelar</button><button type="button" class="btn btn--primary" data-action="save-edited-concepto" data-id="${id}">Guardar</button></div>
                </form>`;
            select(`edit-concepto-nombre-${id}`).focus();
        };
        const handleSaveEditedConcept = async (id, btn) => {
            const nombreInput = select(`edit-concepto-nombre-${id}`);
            const nombre = nombreInput.value.trim();
            if (!nombre) { showToast('El nombre es obligatorio.', 'warning'); nombreInput.classList.add('form-input--invalid'); return; }
            
            await saveDoc('conceptos', id, { nombre }, btn);
			hapticFeedback('success');
			showToast('Concepto actualizado.');
			renderConceptosModalList();
        };

        const showCuentasModal = () => { 
            const existingAccountTypes = [...new Set((db.cuentas || []).map(c => c.tipo))].sort();
            const datalistOptions = existingAccountTypes.map(type => `<option value="${type}"></option>`).join('');
            const html = `
			<div class="form-group" style="margin-bottom: var(--sp-3);">
        <input type="search" id="cuenta-search-input" class="form-input" placeholder="Buscar cuentas..." autocomplete="off">
    </div>
                   <form id="add-cuenta-form" novalidate>
                <div class="form-group"><label for="new-cuenta-nombre" class="form-label">Nombre de la Cuenta</label><input type="text" id="new-cuenta-nombre" class="form-input" placeholder="Ej: Cartera personal" required></div>
                <div class="form-group"><label for="new-cuenta-tipo" class="form-label">Tipo de Cuenta</label><input type="text" id="new-cuenta-tipo" class="form-input" list="tipos-cuenta-list" placeholder="Ej: Banco, Cripto, Fintech..." required><datalist id="tipos-cuenta-list">${datalistOptions}</datalist></div>
                <button type="submit" class="btn btn--primary btn--full" style="margin-top: var(--sp-3)">Añadir Cuenta</button>
            </form>
            <hr style="margin: var(--sp-4) 0; border-color: var(--c-outline); opacity: 0.5;"><h4 style="margin-top: var(--sp-4); margin-bottom: var(--sp-2); font-size: var(--fs-base); color: var(--c-on-surface-secondary);">Cuentas Existentes</h4><div id="cuentas-modal-list"></div>`; 
            showGenericModal('Gestionar Cuentas', html); 
            renderCuentasModalList(); 
        };
    
        const renderCuentasModalList = () => {
            const list = select('cuentas-modal-list');
            if (!list) return;
            const searchQuery = select('cuenta-search-input')?.value.toLowerCase() || '';
            const cuentasFiltradas = (db.cuentas || []).filter(c => 
                c.nombre.toLowerCase().includes(searchQuery) || 
                c.tipo.toLowerCase().includes(searchQuery)
            );
            list.innerHTML = cuentasFiltradas.length === 0 
                ? `<p style="font-size:var(--fs-sm); color:var(--c-on-surface-secondary); text-align:center; padding: var(--sp-4) 0;">No hay cuentas.</p>` 
                : [...cuentasFiltradas].sort((a,b) => a.nombre.localeCompare(b.nombre)).map((c) => `
                    <div class="modal__list-item" id="cuenta-item-${c.id}">
                    <div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;"><span style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(c.nombre)}</span><small style="color: var(--c-on-surface-secondary); font-size: var(--fs-xs);">${toSentenceCase(escapeHTML(c.tipo))}</small></div>
                    <div style="display: flex; align-items: center; gap: var(--sp-1); flex-shrink: 0;"><div class="form-switch-group" style="gap: var(--sp-2);"><label for="offbalance-toggle-${c.id}" style="font-size: var(--fs-xs); color: var(--c-on-surface-secondary);" title="Marcar como 'Contabilidad B'">B</label><label class="form-switch"><input type="checkbox" id="offbalance-toggle-${c.id}" data-action="toggle-off-balance" data-id="${c.id}" ${c.offBalance ? 'checked' : ''}><span class="slider"></span></label></div><button class="icon-btn" data-action="edit-cuenta" data-id="${c.id}" title="Editar Cuenta"><span class="material-icons">edit_note</span></button><button class="icon-btn" data-action="delete-cuenta" data-id="${c.id}" title="Eliminar Cuenta"><span class="material-icons">delete_outline</span></button></div>
                    </div>`).join('');
        };
    
        const showAccountEditForm = (id) => {
            const itemContainer = select(`cuenta-item-${id}`);
            const cuenta = db.cuentas.find(c => c.id === id);
            if (!itemContainer || !cuenta) return;
            itemContainer.innerHTML = `
                <form class="inline-edit-form" data-id="${id}" novalidate>
                    <div class="form-grid">
                                                <div class="form-group" style="margin-bottom: 0;"><label class="form-label" for="edit-cuenta-nombre-${id}">Nombre</label><input type="text" id="edit-cuenta-nombre-${id}" class="form-input" value="${escapeHTML(cuenta.nombre)}" required></div>
                        <div class="form-group" style="margin-bottom: 0;"><label class="form-label" for="edit-cuenta-tipo-${id}">Tipo</label><input type="text" id="edit-cuenta-tipo-${id}" class="form-input" list="tipos-cuenta-list" value="${escapeHTML(cuenta.tipo)}" required></div>
                    </div>
                    <div style="display:flex; justify-content: flex-end; gap: var(--sp-2); align-items: center; margin-top: var(--sp-2);"><button type="button" class="btn btn--secondary" data-action="cancel-edit-cuenta">Cancelar</button><button type="button" class="btn btn--primary" data-action="save-edited-cuenta" data-id="${id}">Guardar</button></div>
                </form>`;
            select(`edit-cuenta-nombre-${id}`).focus();
        };
    
        const handleSaveEditedAccount = async (id, btn) => {
            const nombreInput = select(`edit-cuenta-nombre-${id}`);
            const tipoInput = select(`edit-cuenta-tipo-${id}`);
            const nombre = nombreInput.value.trim();
            const tipo = toSentenceCase(tipoInput.value.trim());
        
            if (!nombre || !tipo) { showToast('El nombre y el tipo no pueden estar vacíos.', 'warning'); if (!nombre) nombreInput.classList.add('form-input--invalid'); if (!tipo) tipoInput.classList.add('form-input--invalid'); return; }
            
            await saveDoc('cuentas', id, { nombre, tipo }, btn);
            hapticFeedback('success');
            showToast('Cuenta actualizada.');
            renderCuentasModalList();
        };

        const showRecurrentesModal = () => {
            let html = `<p class="form-label" style="margin-bottom: var(--sp-3);">Aquí puedes ver y gestionar tus operaciones programadas. Se crearán automáticamente en su fecha de ejecución.</p><div id="recurrentes-modal-list"></div>`;
            showGenericModal('Gestionar Movimientos Recurrentes', html);
            renderRecurrentesModalList();
        };
				
        const renderRecurrentesModalList = () => {
    const list = select('recurrentes-modal-list');
    if (!list) return;
    const recurrentes = [...(db.recurrentes || [])].sort((a,b) => new Date(a.nextDate) - new Date(b.nextDate));
    list.innerHTML = recurrentes.length === 0 
        ? `<div class="empty-state" style="background:transparent; padding:var(--sp-4) 0; border: none;"><span class="material-icons">event_repeat</span><h3>Sin operaciones programadas</h3><p>Puedes crear una al añadir un nuevo movimiento.</p></div>`
        : recurrentes.map(r => {
            const nextDate = parseDateStringAsUTC(r.nextDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            
            // --- LA MISMA CORRECCIÓN, APLICADA AQUÍ TAMBIÉN ---
            const frequencyMap = { once: 'Única vez', daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' };
            
            const amountClass = r.cantidad >= 0 ? 'text-positive' : 'text-negative';
            const icon = r.cantidad >= 0 ? 'south_west' : 'north_east';
            return `
            <div class="modal__list-item" id="recurrente-item-${r.id}">
                <div style="display: flex; align-items: center; gap: 12px; flex-grow: 1; min-width: 0;">
                    <span class="material-icons ${amountClass}" style="font-size: 20px;">${icon}</span>
                <div style="display: flex; flex-direction: column; min-width: 0;">
                        <span style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(r.descripcion)}</span>
                        <small style="color: var(--c-on-surface-secondary); font-size: var(--fs-xs);">Próximo: ${nextDate} (${frequencyMap[r.frequency] || 'N/A'})</small>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--sp-1); flex-shrink: 0;">
                    <strong class="${amountClass}" style="margin-right: var(--sp-2);">${formatCurrency(r.cantidad)}</strong>
                    <button class="icon-btn" data-action="edit-recurrente" data-id="${r.id}" title="Editar Recurrente"><span class="material-icons">edit</span></button>
                </div>
            </div>`
        }).join('');
};

        const showManageInvestmentAccountsModal = () => {
            const visibleAccounts = getVisibleAccounts().sort((a, b) => a.nombre.localeCompare(b.nombre));
            let formHtml = `
            <form id="manage-investment-accounts-form" novalidate>
                <p class="form-label" style="margin-bottom: var(--sp-3);">
                    Selecciona las cuentas que quieres que formen parte de tu portafolio de inversión. Estas aparecerán en la sección "Portafolio" para un seguimiento detallado de su rentabilidad.
                </p>
                <div style="max-height: 40vh; overflow-y: auto; padding: var(--sp-2); background: var(--c-surface-variant); border-radius: var(--border-radius-md);">`;

            if (visibleAccounts.length > 0) {
                formHtml += visibleAccounts.map(c => `
                    <div class="form-checkbox-group modal__list-item" style="padding: var(--sp-2);">
                        <input type="checkbox" id="investment-toggle-${c.id}" value="${c.id}" ${c.esInversion ? 'checked' : ''}>
                        <label for="investment-toggle-${c.id}" style="flex-grow: 1;">${escapeHTML(c.nombre)} <small>(${toSentenceCase(c.tipo)})</small></label>
                    </div>
                `).join('');
            } else {
                formHtml += `<p class="empty-state" style="background: transparent; border: none;">No hay cuentas en la contabilidad actual para configurar.</p>`;
            }

            formHtml += `
                </div>
				<div style="border-top: 1px solid var(--c-outline); padding-top: var(--sp-4); margin-top: var(--sp-4);">
    <h4 style="color: var(--c-danger);">Zona de Peligro</h4>
    <p class="form-label" style="margin-bottom: var(--sp-3);">
        Esta acción creará una nueva valoración para TODOS tus activos de inversión, igualando su valor al capital aportado. Esto pondrá su P&L a cero a fecha de hoy.
    </p>
    <button type="button" class="btn btn--danger btn--full" data-action="reset-portfolio-baseline">
        <span class="material-icons" style="font-size: 16px;">restart_alt</span>
        <span>Resetear P&L de Todos los Activos</span>
    </button>
</div>
                <div class="modal__actions">
                    <button type="submit" class="btn btn--primary btn--full">Guardar Selección</button>
                </div>
            </form>`;

            showGenericModal('Gestionar Activos de Inversión', formHtml);
        };

        
// =========================================================================
// === INICIO: MODAL DE CONFIGURACIÓN DE WIDGETS (v2.2 - VERSIÓN FINAL) ===
// =========================================================================
const showDashboardConfigModal = () => {
    const savedWidgetOrder = (db.config && db.config.dashboardWidgets) || DEFAULT_DASHBOARD_WIDGETS;
    const widgetOrder = savedWidgetOrder.filter(widgetId => AVAILABLE_WIDGETS[widgetId]);
    
    // 1. Construimos la lista de widgets activos e inactivos
    let listHtml = widgetOrder.map(widgetId => 
        renderWidgetConfigItem(widgetId, AVAILABLE_WIDGETS[widgetId], true)
    ).join('');

    listHtml += Object.keys(AVAILABLE_WIDGETS)
        .filter(id => !widgetOrder.includes(id))
        .map(widgetId => renderWidgetConfigItem(widgetId, AVAILABLE_WIDGETS[widgetId], false))
        .join('');

    // 2. CORRECCIÓN: Construimos el HTML correcto para el modal de configuración
    const modalHtml = `
        <p class="form-label" style="margin-bottom: var(--sp-3);">
            Arrastra para reordenar los módulos de tu Panel. Activa o desactiva los que quieras ver.
        </p>
        <div id="widget-config-list">${listHtml}</div>
        <div class="modal__actions">
            <button class="btn btn--primary btn--full" data-action="save-dashboard-config">Guardar Configuración</button>
        </div>
    `;

    // 3. Mostramos el modal correcto con el título correcto
    showGenericModal('Personalizar Panel', modalHtml);
    hapticFeedback('light');
    
    // 4. Activamos la funcionalidad de arrastrar y soltar DESPUÉS de que el modal es visible
    const list = select('widget-config-list');
    if (list) {
        Sortable.create(list, {
            handle: '.drag-handle', // El icono para arrastrar
            animation: 150, // Animación suave al soltar
        });
    }
};

const renderWidgetConfigItem = (id, details, isEnabled) => `
    <div class="widget-config-item" data-id="${id}">
        <span class="material-icons drag-handle">drag_indicator</span>
        <div class="widget-config-item__details">
            <p class="widget-config-item__title">${details.title}</p>
            <p class="widget-config-item__desc">${details.description}</p>
        </div>
        <label class="form-switch"><input type="checkbox" ${isEnabled ? 'checked' : ''}><span class="slider"></span></label>
    </div>`;

const handleSaveDashboardConfig = async (btn) => {
    setButtonLoading(btn, true);
    const list = select('widget-config-list');
    if (!list) return;

    const newOrder = Array.from(list.querySelectorAll('.widget-config-item'))
        .filter(item => item.querySelector('input[type="checkbox"]').checked)
        .map(item => item.dataset.id);

    if (!db.config) db.config = {};
    db.config.dashboardWidgets = newOrder;
    await fbDb.collection('users').doc(currentUser.uid).set({ config: db.config }, { merge: true });
    
    setButtonLoading(btn, false);
    hideModal('generic-modal');
    hapticFeedback('success');
    showToast('Panel actualizado.');
    renderInicioResumenView();
};

// =============================================================
// === BLOQUE ÚNICO Y DEFINITIVO PARA LA PESTAÑA DE INFORMES ===
// =============================================================

const renderInformeCuentaRow = (mov, cuentaId, allCuentas) => {
    const fecha = new Date(mov.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    let importe = 0;
    let colorClass = '';
    let descripcionFinal = '';

    if (mov.tipo === 'traspaso') {
        const origen = allCuentas.find(c => c.id === mov.cuentaOrigenId);
        const destino = allCuentas.find(c => c.id === mov.cuentaDestinoId);
        
        if (mov.cuentaOrigenId === cuentaId) {
            importe = -mov.cantidad;
            colorClass = 'text-gasto';
            descripcionFinal = `Traspaso a ${destino ? escapeHTML(destino.nombre) : '?'}`;
        } else {
            importe = mov.cantidad;
            colorClass = 'text-ingreso';
            descripcionFinal = `Traspaso desde ${origen ? escapeHTML(origen.nombre) : '?'}`;
        }
        if (mov.descripcion && mov.descripcion.toLowerCase() !== 'traspaso') {
            descripcionFinal += ` - ${escapeHTML(mov.descripcion)}`;
        }
    } else {
        importe = mov.cantidad;
        colorClass = importe >= 0 ? 'text-ingreso' : 'text-gasto';
        descripcionFinal = mov.descripcion ? escapeHTML(mov.descripcion) : 'Movimiento sin descripción';
    }

    // NUEVO HTML con la estructura Flexbox
    return `
        <div class="informe-linea-movimiento">
            <span class="fecha">${fecha}</span>
            <span class="descripcion">${descripcionFinal}</span>
            <span class="importe ${colorClass}">${formatCurrency(importe)}</span>
			<span class="saldo">${formatCurrency(mov.runningBalance)}</span>
        </div>
    `;
};
const renderInformesPage = () => {
    const container = select(PAGE_IDS.INFORMES);
    if (!container) return;

    // AHORA SOLO MOSTRAMOS EL ÚNICO INFORME NECESARIO
    container.innerHTML = `
        <div class="card card--no-bg accordion-wrapper">
            <details id="acordeon-extracto_cuenta" class="accordion informe-acordeon" open>
                <summary>
                    <h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);">
                        <span class="material-icons">wysiwyg</span>
                        <span>Extracto de Cuenta (Cartilla)</span>
                    </h3>
                    <span class="material-icons accordion__icon">expand_more</span>
                </summary>
                <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                    <div id="informe-content-extracto_cuenta">
                         <form id="informe-cuenta-form" novalidate>
                            <div class="form-group">
                                <label for="informe-cuenta-select" class="form-label">Selecciona una cuenta para ver su historial completo:</label>
                                <select id="informe-cuenta-select" class="form-select" required></select>
                            </div>
                            <button type="submit" class="btn btn--primary btn--full">Generar Extracto</button>
                        </form>
                        <div id="informe-resultado-container" style="margin-top: var(--sp-4);"></div>
                    </div>
                </div>
            </details>
        </div>
    `;

    // Rellenamos el selector de cuentas
    const populate = (id, data, nameKey, valKey='id') => {
        const el = select(id); if (!el) return;
        let opts = '<option value="">Seleccionar cuenta...</option>';
        [...data].sort((a,b) => (a[nameKey]||"").localeCompare(b[nameKey]||"")).forEach(i => opts += `<option value="${i[valKey]}">${i[nameKey]}</option>`);
        el.innerHTML = opts;
    };
    populate('informe-cuenta-select', getVisibleAccounts(), 'nombre', 'id');
};

const handleGenerateInformeCuenta = async (form, btn) => {
    setButtonLoading(btn, true, 'Generando...');
    const cuentaId = select('informe-cuenta-select').value;
    const resultadoContainer = select('informe-resultado-container');

    if (!cuentaId || !resultadoContainer) {
        showToast("Por favor, selecciona una cuenta.", "warning");
        setButtonLoading(btn, false);
        return;
    }

    const cuenta = db.cuentas.find(c => c.id === cuentaId);
    if (!cuenta) {
         showToast("Cuenta no encontrada.", "danger");
         setButtonLoading(btn, false);
         return;
    }

    resultadoContainer.innerHTML = `<div class="card"><div class="card__content" style="text-align:center;"><span class="spinner"></span></div></div>`;

    try {
        // 1. Obtener TODOS los movimientos (considera obtener solo los de la cuenta si el rendimiento se ve afectado)
        const todosLosMovimientos = await fetchAllMovementsForHistory();

        // 2. Filtrar movimientos relacionados con la cuenta seleccionada
        const movimientosDeLaCuenta = todosLosMovimientos.filter(m =>
            (m.cuentaId === cuentaId) ||
            (m.cuentaOrigenId === cuentaId) ||
            (m.cuentaDestinoId === cuentaId)
        );

        // Si no hay movimientos, mostrar estado vacío
        if (movimientosDeLaCuenta.length === 0) {
             resultadoContainer.innerHTML = `
                <h3 class="card__title">Extracto de ${escapeHTML(cuenta.nombre)}</h3>
                <div class="empty-state"><p>Esta cuenta no tiene movimientos.</p></div>`;
             setButtonLoading(btn, false);
             return;
        }

        // 3. Ordenar movimientos ANTIGUO -> NUEVO para cálculo de saldo acumulado
        movimientosDeLaCuenta.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime() || a.id.localeCompare(b.id));

        // 4. Calcular Saldos Acumulados (Iterando ANTIGUO -> NUEVO)
        // Determinar el saldo inicial *antes* del primer movimiento en la lista
        const impactoTotalHistorico = movimientosDeLaCuenta.reduce((sum, mov) => {
            if (mov.tipo === 'traspaso') {
                if (mov.cuentaOrigenId === cuentaId) return sum - mov.cantidad;
                if (mov.cuentaDestinoId === cuentaId) return sum + mov.cantidad;
            } else if (mov.cuentaId === cuentaId) { // Solo contar movimientos directos para cálculo de saldo
                return sum + mov.cantidad;
            }
            return sum;
        }, 0);
        let saldoAcumulado = (cuenta.saldo || 0) - impactoTotalHistorico;

        // Asignar saldo acumulado a cada movimiento
        for (const mov of movimientosDeLaCuenta) {
            if (mov.tipo === 'traspaso') {
                if (mov.cuentaOrigenId === cuentaId) saldoAcumulado -= mov.cantidad;
                if (mov.cuentaDestinoId === cuentaId) saldoAcumulado += mov.cantidad;
            } else if (mov.cuentaId === cuentaId) { // Solo ajustar por movimientos directos
                saldoAcumulado += mov.cantidad;
            }
            // Guardar el saldo *después* de que ocurriera el movimiento
            mov.runningBalance = saldoAcumulado;
        }

        // 5. Agrupar movimientos por Mes (YYYY-MM)
        const groupedByMonth = movimientosDeLaCuenta.reduce((acc, mov) => {
            const monthKey = mov.fecha.slice(0, 7); // "YYYY-MM"
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(mov);
            return acc;
        }, {});

        // 6. Generar HTML (Iterando NUEVO -> ANTIGUO para mostrar)
			let resultadoHtml = `
    <h3 class="card__title">
        <span>Extracto de ${escapeHTML(cuenta.nombre)}</span>
    </h3>
    <div class="informe-extracto-container">
                <div class="informe-linea-header">
                    <span class="fecha">Fecha</span>
                    <span class="descripcion">Descripción</span>
                    <span class="importe">Importe</span>
                    <span class="saldo">Saldo</span>
                </div>`;

        // Función auxiliar para calcular el impacto específico en la cuenta
        const calculateAccountImpact = (mov, accId) => {
             if (mov.tipo === 'traspaso') {
                if (mov.cuentaOrigenId === accId) return -mov.cantidad;
                if (mov.cuentaDestinoId === accId) return mov.cantidad;
             } else if (mov.cuentaId === accId) {
                return mov.cantidad;
             }
             return 0; // El movimiento no impacta el flujo de caja de esta cuenta
        };


        // Obtener claves de mes y ordenar NUEVO -> ANTIGUO
        const sortedMonthKeys = Object.keys(groupedByMonth).sort().reverse();

        for (const monthKey of sortedMonthKeys) {
            const movementsForMonth = groupedByMonth[monthKey];

            // 1. INICIALIZAR los totales del mes a CERO ANTES del bucle de movimientos
            let monthIncome = 0;
            let monthExpense = 0;

            // 2. Ordenar movimientos dentro del mes (NUEVO -> ANTIGUO para mostrar)
            movementsForMonth.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime() || b.id.localeCompare(a.id));

            // 3. BUCLE PARA AÑADIR LAS FILAS DE MOVIMIENTOS Y CALCULAR TOTALES
            for (const mov of movementsForMonth) {
                // Añadir la fila del movimiento al HTML
                resultadoHtml += renderInformeCuentaRow(mov, cuentaId, db.cuentas); // Usa el runningBalance precalculado

                // Calcular el impacto de este movimiento y sumarlo a los totales del mes
                const impact = calculateAccountImpact(mov, cuentaId);
                if (impact > 0) {
                    monthIncome += impact;
                } else {
                    monthExpense += impact; // Los gastos son negativos
                }
            } // <-- FIN del bucle for (const mov...)

            // 4. DESPUÉS del bucle de movimientos, calcular el neto y AÑADIR LA FILA DE RESUMEN
            const monthNet = monthIncome + monthExpense;
            // Usar día 2 para crear la fecha evita problemas con zonas horarias al obtener el nombre del mes
            const monthDate = new Date(monthKey + '-02T12:00:00Z');
            const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });

            resultadoHtml += `
                <div class="informe-linea-resumen">
                    <span class="fecha"></span>
                    <span class="descripcion">${monthName}: Ingresos ${formatCurrency(monthIncome)} - Gastos ${formatCurrency(Math.abs(monthExpense))}</span>
                    <span class="importe ${monthNet >= 0 ? 'text-ingreso' : 'text-gasto'}">${formatCurrency(monthNet)}</span>
                    <span class="saldo"></span>
                </div>`; // <-- Fila de resumen añadida AL FINAL

        } // --- FIN DEL BUCLE DE MESES ---

        // Cerrar el contenedor principal del informe
        resultadoHtml += `</div>`;
        resultadoContainer.innerHTML = resultadoHtml;
    } catch (error) {
        console.error("Error generando informe de cuenta:", error);
        resultadoContainer.innerHTML = `<div class="card card--no-bg text-danger" style="padding: var(--sp-4); text-align: center;">Error al generar el informe.</div>`;
        showToast("No se pudo generar el extracto.", "danger");
    } finally {
        setButtonLoading(btn, false);
    }
};
 /**
 * Cierra todos los dropdowns personalizados abiertos, excepto el que se le pasa como argumento.
 * @param {HTMLElement|null} exceptThisOne - El wrapper del select que no debe cerrarse.
 */
function closeAllCustomSelects(exceptThisOne) {
    document.querySelectorAll('.custom-select-wrapper.is-open').forEach(wrapper => {
        if (wrapper !== exceptThisOne) {
            wrapper.classList.remove('is-open');
            const trigger = wrapper.querySelector('.custom-select__trigger');
            if (trigger) {
                trigger.setAttribute('aria-expanded', 'false');
            }
        }
    });
}

/**
 * Transforma un elemento <select> nativo en un componente de dropdown personalizado y accesible.
 * @param {HTMLElement} selectElement - El elemento <select> a transformar.
 */
function createCustomSelect(selectElement) {
    // Guarda de seguridad por si el elemento no existe
    if (!selectElement) return;

    // Evita reinicializar si ya es un dropdown personalizado
    const existingWrapper = selectElement.closest('.custom-select-wrapper');
    if (existingWrapper) {
        // Si ya existe, simplemente le pedimos que se actualice con el valor actual
        selectElement.dispatchEvent(new Event('change'));
        return;
    }

    // 1. Crear la estructura HTML
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    const trigger = document.createElement('div');
    trigger.className = 'custom-select__trigger';
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select__options';
    optionsContainer.setAttribute('role', 'listbox');

    // 2. Mover el <select> original y añadir los nuevos elementos
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    wrapper.appendChild(trigger);
    wrapper.appendChild(selectElement);
    wrapper.appendChild(optionsContainer);
    selectElement.classList.add('form-select-hidden');

    // 3. Función para sincronizar la UI con el estado del <select>
    const populateOptions = () => {
        optionsContainer.innerHTML = '';
        let selectedText = 'Ninguno'; // Texto por defecto si no hay nada seleccionado

        Array.from(selectElement.options).forEach(optionEl => {
            const customOption = document.createElement('div');
            customOption.className = 'custom-select__option';
            customOption.textContent = optionEl.textContent;
            customOption.dataset.value = optionEl.value;
            customOption.setAttribute('role', 'option');

            // Comprobamos si esta es la opción seleccionada
            if (optionEl.selected && optionEl.value) {
                customOption.classList.add('is-selected');
                selectedText = optionEl.textContent;
            }
            optionsContainer.appendChild(customOption);
        });
        
        // Actualizamos el texto visible
        trigger.textContent = selectedText;
    };

    // La primera vez que se crea, se ejecuta para mostrar el estado inicial
    populateOptions();

    // 4. Añadir Event Listeners para la interacción del usuario
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllCustomSelects(wrapper);
        wrapper.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', wrapper.classList.contains('is-open'));
    });

    optionsContainer.addEventListener('click', (e) => {
        const option = e.target.closest('.custom-select__option');
        if (option) {
            // Cuando el usuario hace clic, actualizamos el <select> original...
            selectElement.value = option.dataset.value;
            // ...y disparamos el evento 'change' manualmente
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            
            wrapper.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        }
    });
    
    // ▼▼▼ ¡ESTA ES LA LÍNEA QUE SOLUCIONA EL BUG! ▼▼▼
    // Le decimos al componente que "escuche". Si el <select> original cambia
    // por CUALQUIER motivo (como tu script asignándole un valor), la función
    // populateOptions() se ejecutará de nuevo para actualizar el texto visible.
    selectElement.addEventListener('change', populateOptions);
}


// =================================================================
// === FIN DEL BLOQUE DEFINITIVO                                 ===
// =================================================================
 const attachEventListeners = () => {
    const cantidadInput = document.getElementById("movimiento-cantidad");
    if (cantidadInput) {
        const cantidadError = document.getElementById("movimiento-cantidad-error");
        cantidadInput.addEventListener("input", () => {
            let valor = cantidadInput.value.trim();
            valor = valor.replace(",", ".");
            const regex = /^\d+(.\d{0,2})?$/;
            if (valor === "" || !regex.test(valor)) {
                cantidadError.textContent = "Introduce un número positivo (ej: 2,50 o 15.00)";
                cantidadInput.classList.add("form-input--error");
            } else {
                cantidadError.textContent = "";
                cantidadInput.classList.remove("form--error");
            }
        });
        const descripcionInput = document.getElementById("movimiento-descripcion");
        const cuentaSelect = document.getElementById("movimiento-cuenta");
        const saveBtn = document.getElementById("save-movimiento-btn");
        document.addEventListener("show-modal", (e) => {
            if (e.detail.modalId === "movimiento-modal") {
                setTimeout(() => cantidadInput.focus(), 100);
            }
        });
        cantidadInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                descripcionInput.focus();
            }
        });
        descripcionInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                cuentaSelect.focus();
            }
        });
        cuentaSelect.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                saveBtn.click();
            }
        });
    }

    const amountInputForFormatting = select('movimiento-cantidad');
    if (amountInputForFormatting) {
        amountInputForFormatting.addEventListener('focus', (e) => {
            const input = e.target;
            if (input.value === '') return;
            const rawValue = input.value.replace(/\./g, '');
            input.value = rawValue;
        });
        amountInputForFormatting.addEventListener('blur', (e) => {
            const input = e.target;
            if (input.value === '') return;
            const numericValue = parseCurrencyString(input.value);
            input.value = formatAsCurrencyInput(numericValue);
        });
    }

    window.addEventListener('popstate', (event) => {
        const activeModal = document.querySelector('.modal-overlay--active');
        if (activeModal) {
            hideModal(activeModal.id);
            history.pushState({ page: window.history.state?.page }, '', `#${window.history.state?.page || 'panel-page'}`);
            return;
        }
        const pageToNavigate = event.state ? event.state.page : PAGE_IDS.INICIO;
        if (pageToNavigate) {
            navigateTo(pageToNavigate, false);
        }
    });

    document.body.addEventListener('click', async (e) => {
        const target = e.target;

        if (!target.closest('.custom-select-wrapper')) {
            closeAllCustomSelects(null);
        }

        if (target.matches('.input-amount-calculator')) {
            e.preventDefault();
            showCalculator(target);
            return;
        }
        const actionTarget = target.closest('[data-action]');
        if (!actionTarget && !target.closest('.transaction-card')) {
            resetActiveSwipe();
        }
        if (!actionTarget) return;

        const { action, id, page, type, modalId, reportId } = actionTarget.dataset;
        const btn = actionTarget.closest('button');
        
        const actions = {
            'show-main-menu': () => {
                const menu = document.getElementById('main-menu-popover');
                if (!menu) return;
                menu.classList.toggle('popover-menu--visible');
                if (menu.classList.contains('popover-menu--visible')) {
                    setTimeout(() => {
                        const closeOnClickOutside = (event) => {
                            if (!menu.contains(event.target) && !event.target.closest('[data-action="show-main-menu"]')) {
                                menu.classList.remove('popover-menu--visible');
                                document.removeEventListener('click', closeOnClickOutside);
                            }
                        };
                        document.addEventListener('click', closeOnClickOutside);
                    }, 0);
                }
            },
            'open-main-add-modal': () => startMovementForm(),
            'export-filtered-csv': () => handleExportFilteredCsv(btn),
            'show-diario-filters': showDiarioFiltersModal,
            'clear-diario-filters': clearDiarioFilters,
            'toggle-amount-type': () => {
                const amountInput = select('movimiento-cantidad');
                const amountGroup = select('movimiento-cantidad-form-group');
                if (!amountInput || !amountGroup) return;
                hapticFeedback('light');
                const currentValue = parseCurrencyString(amountInput.value) || 0;
                const isCurrentlyGasto = amountGroup.classList.contains('is-gasto');
                const newValue = currentValue === 0 ? 0 : -currentValue;
                amountInput.value = newValue.toLocaleString('es-ES', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 });
                updateAmountTypeUI(!isCurrentlyGasto);
            },
            'context-edit': () => { hideModal('generic-modal'); startMovementForm(id, false); },
            'context-duplicate': () => { hideModal('generic-modal'); const movement = db.movimientos.find(m => m.id === id); if(movement) handleDuplicateMovement(movement); },
            'context-delete': () => { hideModal('generic-modal'); showConfirmationModal('¿Seguro que quieres eliminar este movimiento?', async () => { await deleteMovementAndAdjustBalance(id, false); }); },
            'show-kpi-drilldown': () => handleKpiDrilldown(actionTarget),
            'edit-movement-from-modal': (e) => { const movementId = e.target.closest('[data-id]').dataset.id; hideModal('generic-modal'); startMovementForm(movementId, false); },
            'edit-movement-from-list': (e) => { const movementId = e.target.closest('[data-id]').dataset.id; startMovementForm(movementId, false); },
			'edit-recurrente': () => { hideModal('generic-modal'); startMovementForm(id, true); },
            'view-account-details': (e) => { const accountId = e.target.closest('[data-id]').dataset.id; showAccountMovementsModal(accountId); },
            'apply-description-suggestion': (e) => {
                const suggestionItem = e.target.closest('.suggestion-item');
                if (suggestionItem) {
                    applyDescriptionSuggestion(suggestionItem);
                }
            },
            'show-concept-drilldown': () => {
                const conceptId = actionTarget.dataset.conceptId;
                const conceptName = actionTarget.dataset.conceptName;
                getFilteredMovements(false).then(({ current }) => {
                    const movementsOfConcept = current.filter(m => m.conceptoId === conceptId);
                    showDrillDownModal(`Movimientos de: ${conceptName}`, movementsOfConcept);
                });
            },
            'toggle-diario-view': () => { diarioViewMode = diarioViewMode === 'list' ? 'calendar' : 'list'; const btnIcon = selectOne('[data-action="toggle-diario-view"] .material-icons'); if(btnIcon) btnIcon.textContent = diarioViewMode === 'list' ? 'calendar_month' : 'list'; renderDiarioPage(); },
            'calendar-nav': () => {
                const direction = actionTarget.dataset.direction;
                if (!(diarioCalendarDate instanceof Date) || isNaN(diarioCalendarDate)) {
                    diarioCalendarDate = new Date();
                }
                const currentMonth = diarioCalendarDate.getUTCMonth();
                diarioCalendarDate.setUTCMonth(currentMonth + (direction === 'next' ? 1 : -1));
                renderDiarioCalendar();
            },
            'show-day-details': () => {
                const date = actionTarget.dataset.date;
                const movementsOfDay = db.movimientos.filter(m => m.fecha.startsWith(date));
                if (movementsOfDay.length > 0) {
                    const formattedDate = new Date(date + 'T12:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                    showDrillDownModal(`Movimientos del ${formattedDate}`, movementsOfDay);
                }
            },
            'toggle-investment-type-filter': () => handleToggleInvestmentTypeFilter(type),
            'toggle-account-type-filter': () => { hapticFeedback('light'); if (deselectedAccountTypesFilter.has(type)) { deselectedAccountTypesFilter.delete(type); } else { deselectedAccountTypesFilter.add(type); } renderPatrimonioPage(); },
            'show-help-topic': () => {
                const topic = actionTarget.dataset.topic;
                if(topic) {
                    let title, content;
                    if (topic === 'tasa-ahorro') { title = '¿Cómo se calcula la Tasa de Ahorro?'; content = `<p>Mide qué porcentaje de tus ingresos consigues guardar después de cubrir todos tus gastos en el periodo seleccionado.</p><h4>Fórmula:</h4><code style="display: block; background: var(--c-surface-variant); padding: var(--sp-2); border-radius: 6px; font-size: 0.9em; margin-top: var(--sp-1);">(Saldo Neto del Periodo / Ingresos Totales del Periodo) * 100</code><p style="margin-top: var(--sp-2);">Es el indicador clave de tu capacidad para generar riqueza.</p>`; }
                    else if (topic === 'patrimonio-neto') { title = '¿Cómo se calcula el Patrimonio Neto?'; content = `<p>Representa tu riqueza total. Es la suma de todo lo que tienes (activos) menos todo lo que debes (pasivos).</p><h4>Fórmula:</h4><code style="display: block; background: var(--c-surface-variant); padding: var(--sp-2); border-radius: 6px; font-size: 0.9em; margin-top: var(--sp-1);">Suma de los saldos de todas tus cuentas.</code><p style="margin-top: var(--sp-2);"><strong>Importante:</strong> Este valor es siempre tu situación global actual y no se ve afectado por los filtros de fecha del panel.</p>`; }
                    else if (topic === 'pnl-inversion') { title = '¿Cómo se calcula el P&L de Inversión?'; content = `<p>P&L son las siglas de "Profits and Losses" (Ganancias y Pérdidas). Mide el <strong>flujo de caja neto</strong> de tus cuentas de inversión durante el periodo seleccionado.</p><h4>Fórmula:</h4><code style="display: block; background: var(--c-surface-variant); padding: var(--sp-2); border-radius: 6px; font-size: 0.9em; margin-top: var(--sp-1);">Suma de todos los movimientos en cuentas de inversión.</code><p style="margin-top: var(--sp-2);">No incluye la revalorización de activos que no hayas vendido. Es útil para saber si tus inversiones te están dando dinero (dividendos, ventas) o si estás invirtiendo más capital (compras).</p>`; }
                    else if (topic === 'progreso-presupuesto') { title = '¿Cómo se calcula el Progreso del Presupuesto?'; content = `<p>Compara tus gastos reales con tu plan de gastos para el periodo seleccionado.</p><h4>Fórmula:</h4><ol style="list-style-position: inside; padding-left: var(--sp-2);"><li style="margin-bottom: 6px;">Se calcula tu <strong>límite de gasto proporcional</strong> para el periodo (ej. Presupuesto Anual / 12 para un mes).</li><li style="margin-bottom: 6px;">Se comparan tus <strong>gastos reales</strong> del periodo con ese límite.</li></ol><p style="margin-top: var(--sp-2);">Te ayuda a ver si te estás ciñendo a tu plan financiero y a corregir desviaciones a tiempo.</p>`; }
                    else if (topic === 'colchon-emergencia') { title = 'Colchón de Emergencia'; content = `<p>Es tu red de seguridad financiera. Mide cuántos meses podrías vivir cubriendo tus gastos si dejaras de tener ingresos hoy mismo.</p><h4>Fórmula:</h4><code style="display: block; background: var(--c-surface-variant); padding: var(--sp-2); border-radius: 6px; font-size: 0.9em; margin-top: var(--sp-1);">Dinero Líquido Total / Gasto Mensual Promedio</code><p style="margin-top: var(--sp-2);">Se considera "dinero líquido" el saldo de tus cuentas de tipo Banco, Ahorro y Efectivo.</p>`; }
                    else if (topic === 'independencia-financiera') { title = 'Independencia Financiera (I.F.)'; content = `<p>Mide tu progreso para alcanzar el punto en el que tus inversiones podrían cubrir tus gastos para siempre, sin necesidad de trabajar.</p><h4>Fórmula del Objetivo:</h4><code style="display: block; background: var(--c-surface-variant); padding: var(--sp-2); border-radius: 6px; font-size: 0.9em; margin-top: var(--sp-1);">(Gasto Mensual Promedio * 12) * 30</code><p style="margin-top: var(--sp-2);">El porcentaje muestra qué parte de ese objetivo ya has alcanzado con tu patrimonio neto actual.</p>`; }
                    const titleEl = select('help-modal-title'); const bodyEl = select('help-modal-body');
                    if(titleEl) titleEl.textContent = title; if(bodyEl) bodyEl.innerHTML = `<div style="padding: 0 var(--sp-2);">${content}</div>`;
                    showModal('help-modal');
                }
            },
            'configure-dashboard': (e) => { e.preventDefault(); showDashboardConfigModal(); },
            'save-dashboard-config': () => handleSaveDashboardConfig(btn),
            'use-password-instead': () => showPasswordFallback(),
            'toggle-theme': () => { handleToggleTheme(); hapticFeedback('light'); },
            'navigate': () => { hapticFeedback('light'); navigateTo(page); },
            'help': showHelpModal,
            'exit': handleExitApp,
            'forgot-password': (e) => { e.preventDefault(); const email = prompt("Por favor, introduce el correo electrónico de tu cuenta para restablecer la contraseña:"); if (email) { firebase.auth().sendPasswordResetEmail(email).then(() => { showToast('Se ha enviado un correo para restablecer tu contraseña.', 'info', 5000); }).catch((error) => { console.error("Error al enviar correo de recuperación:", error); if (error.code === 'auth/user-not-found') { showToast('No se encontró ninguna cuenta con ese correo.', 'danger'); } else { showToast('Error al intentar restablecer la contraseña.', 'danger'); } }); } },
            'show-register': (e) => { e.preventDefault(); const title = select('login-title'); const mainButton = document.querySelector('#login-form button[data-action="login"]'); const secondaryAction = document.querySelector('.login-view__secondary-action'); if (mainButton.dataset.action === 'login') { title.textContent = 'Crear una Cuenta Nueva'; mainButton.dataset.action = 'register'; mainButton.textContent = 'Registrarse'; secondaryAction.innerHTML = `<span>¿Ya tienes una cuenta?</span> <a href="#" class="login-view__link" data-action="show-login">Inicia sesión</a>`; } else { handleRegister(mainButton); } },
            'show-login': (e) => { e.preventDefault(); const title = select('login-title'); const mainButton = document.querySelector('#login-form button[data-action="register"]'); const secondaryAction = document.querySelector('.login-view__secondary-action'); if (mainButton.dataset.action === 'register') { title.textContent = 'Bienvenido de nuevo'; mainButton.dataset.action = 'login'; mainButton.textContent = 'Iniciar Sesión'; secondaryAction.innerHTML = `<span>¿No tienes una cuenta?</span> <a href="#" class="login-view__link" data-action="show-register">Regístrate aquí</a>`; } },
            'import-csv': showCsvImportWizard,
            'toggle-ledger': async () => {
    hapticFeedback('medium');
    
    // 1. Cambiamos el estado global
    isOffBalanceMode = !isOffBalanceMode;
    document.body.dataset.ledgerMode = isOffBalanceMode ? 'B' : 'A';

    // 2. Notificamos al usuario
    showToast(`Mostrando Contabilidad ${isOffBalanceMode ? 'B' : 'A'}.`, 'info');

    // 3. Obtenemos la página activa
    const activePageEl = document.querySelector('.view--active');
    const activePageId = activePageEl ? activePageEl.id : PAGE_IDS.DIARIO;

    // 4. Forzamos una navegación a la misma página.
    // Esto es más robusto que llamar a la función de renderizado directamente,
    // ya que `navigateTo` se encarga de todo el ciclo de vida:
    // - Destruye gráficos antiguos.
    // - Re-renderiza la barra superior completa.
    // - Llama a la función de renderizado correcta, que ahora contendrá la lógica de reseteo.
    // - Gestiona las animaciones de transición.
    await navigateTo(activePageId, true); // El `true` evita animaciones y la entrada al historial.
},
            'toggle-off-balance': async () => { const checkbox = target.closest('input[type="checkbox"]'); if (!checkbox) return; hapticFeedback('light'); await saveDoc('cuentas', checkbox.dataset.id, { offBalance: checkbox.checked }); },
            'apply-filters': () => { hapticFeedback('light'); scheduleDashboardUpdate(); },
            'delete-movement-from-modal': () => { const isRecurrent = (actionTarget.dataset.isRecurrent === 'true'); const idToDelete = select('movimiento-id').value; const message = isRecurrent ? '¿Seguro que quieres eliminar esta operación recurrente?' : '¿Seguro que quieres eliminar este movimiento?'; showConfirmationModal(message, async () => { hideModal('movimiento-modal'); await deleteMovementAndAdjustBalance(idToDelete, isRecurrent); }); },
            'swipe-delete-movement': () => { const isRecurrent = actionTarget.dataset.isRecurrent === 'true'; showConfirmationModal('¿Seguro que quieres eliminar este movimiento?', async () => { await deleteMovementAndAdjustBalance(id, isRecurrent); }); },
            'swipe-duplicate-movement': () => { const movement = db.movimientos.find(m => m.id === id) || recentMovementsCache.find(m => m.id === id); if (movement) handleDuplicateMovement(movement); },
            'search-result-movimiento': (e) => { hideModal('global-search-modal'); startMovementForm(e.target.closest('[data-id]').dataset.id, false); },
            'delete-concepto': async () => { const movsCheck = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos').where('conceptoId', '==', id).limit(1).get(); if(!movsCheck.empty) { showToast("Concepto en uso, no se puede borrar.","warning"); return; } showConfirmationModal('¿Seguro que quieres eliminar este concepto?', async () => { await deleteDoc('conceptos', id); hapticFeedback('success'); showToast("Concepto eliminado."); renderConceptosModalList(); }); },
            'delete-cuenta': async () => { const movsCheck = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos').where('cuentaId', '==', id).limit(1).get(); if(!movsCheck.empty) { showToast("Cuenta con movimientos, no se puede borrar.","warning",3500); return; } showConfirmationModal('¿Seguro que quieres eliminar esta cuenta?', async () => { await deleteDoc('cuentas', id); hapticFeedback('success'); showToast("Cuenta eliminada."); renderCuentasModalList(); }); },
            'close-modal': () => { const closestOverlay = target.closest('.modal-overlay'); const effectiveModalId = modalId || (closestOverlay ? closestOverlay.id : null); if (effectiveModalId) hideModal(effectiveModalId); },
            'manage-conceptos': showConceptosModal, 'manage-cuentas': showCuentasModal,
            'save-config': () => handleSaveConfig(btn),
            'export-data': () => handleExportData(btn), 'export-csv': () => handleExportCsv(btn), 'import-data': () => showImportJSONWizard(),
            'clear-data': () => { showConfirmationModal('¿Borrar TODOS tus datos de la nube? Esta acción es IRREVERSIBLE y no se puede deshacer.', async () => { /* Lógica de borrado aquí */ }, 'Confirmación Final de Borrado'); },
            'update-budgets': handleUpdateBudgets, 'logout': () => fbAuth.signOut(), 'delete-account': () => { showConfirmationModal('Esto eliminará tu cuenta y todos tus datos de forma PERMANENTE. ¿Estás absolutamente seguro?', async () => { /* Lógica de borrado de cuenta aquí */ }); },
            'manage-investment-accounts': showManageInvestmentAccountsModal, 'update-asset-value': () => showValoracionModal(id),
            'set-investment-chart-mode': () => handleSetInvestmentChartMode(actionTarget.dataset.mode),
            'global-search': () => { showGlobalSearchModal(); hapticFeedback('medium'); },
            'edit-concepto': () => showConceptoEditForm(id), 'cancel-edit-concepto': renderConceptosModalList, 'save-edited-concepto': () => handleSaveEditedConcept(id, btn),
            'edit-cuenta': () => showAccountEditForm(id), 'cancel-edit-cuenta': renderCuentasModalList, 'save-edited-cuenta': () => handleSaveEditedAccount(id, btn),
            'duplicate-movement': () => { hapticFeedback('medium'); select('movimiento-mode').value = 'new'; select('movimiento-id').value = ''; select('form-movimiento-title').textContent = 'Duplicar Movimiento'; select('delete-movimiento-btn').classList.add('hidden'); select('duplicate-movimiento-btn').classList.add('hidden'); const today = new Date(); const fechaInput = select('movimiento-fecha'); fechaInput.value = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 10); updateDateDisplay(fechaInput); showToast('Datos duplicados. Ajusta y guarda como nuevo.', 'info'); },
            'save-and-new-movement': () => handleSaveMovement(document.getElementById('form-movimiento'), btn), 'set-movimiento-type': () => setMovimientoFormType(type),
            'recalculate-balances': () => { showConfirmationModal('Esta es una herramienta de auditoría que recalculará el saldo de cada cuenta desde cero, leyendo todo tu historial de movimientos. Úsala solo si sospechas que hay una inconsistencia. La operación puede tardar y consumir datos. ¿Quieres continuar?', () => auditAndFixAllBalances(btn), 'Confirmar Auditoría Completa'); },
            'json-wizard-back-2': () => goToJSONStep(1), 'json-wizard-import-final': () => handleFinalJsonImport(btn),
            'toggle-traspaso-accounts-filter': () => populateTraspasoDropdowns(), 'set-pin': async () => { const pin = prompt("Introduce tu nuevo PIN de 4 dígitos. Déjalo en blanco para eliminarlo."); if (pin === null) return; if (pin === "") { localStorage.removeItem('pinUserHash'); localStorage.removeItem('pinUserEmail'); showToast('PIN de acceso rápido eliminado.', 'info'); return; } if (!/^\d{4}$/.test(pin)) { showToast('El PIN debe contener exactamente 4 dígitos numéricos.', 'danger'); return; } const pinConfirm = prompt("Confirma tu nuevo PIN de 4 dígitos."); if (pin !== pinConfirm) { showToast('Los PINs no coinciden. Inténtalo de nuevo.', 'danger'); return; } const pinHash = await hashPin(pin); localStorage.setItem('pinUserHash', pinHash); localStorage.setItem('pinUserEmail', currentUser.email); hapticFeedback('success'); showToast('¡PIN de acceso rápido configurado con éxito!', 'info'); },
            'edit-recurrente-from-pending': () => startMovementForm(id, true),
            'confirm-recurrent': () => handleConfirmRecurrent(id, btn), 'skip-recurrent': () => handleSkipRecurrent(id, btn),
			'show-informe-builder': showInformeBuilderModal, 'save-informe': () => handleSaveInforme(btn),
        };
        
        if (actions[action]) {
            actions[action](e);
        }
    });

    document.body.addEventListener('toggle', (e) => {
        const detailsElement = e.target;
        if (detailsElement.tagName !== 'DETAILS' || !detailsElement.classList.contains('informe-acordeon')) { return; }
        if (detailsElement.open) {
            const informeId = detailsElement.id.replace('acordeon-', '');
            renderInformeDetallado(informeId);
        }
    }, true);
    
    document.body.addEventListener('submit', (e) => {
        e.preventDefault();
        const target = e.target;
        const submitter = e.submitter;
        const handlers = {
            'login-form': () => { const action = submitter ? submitter.dataset.action : 'login'; if (action === 'login') { handleLogin(submitter); } else if (action === 'register') { handleRegister(submitter); } },
            'pin-form': handlePinSubmit,
            'form-movimiento': () => handleSaveMovement(target, submitter),
            'add-concepto-form': () => handleAddConcept(submitter),
            'add-cuenta-form': () => handleAddAccount(submitter),
            'informe-cuenta-form': () => handleGenerateInformeCuenta(target, submitter),
            'manage-investment-accounts-form': () => handleSaveInvestmentAccounts(target, submitter),
            'form-valoracion': () => handleSaveValoracion(target, submitter),
            'diario-filters-form': applyDiarioFilters
        };
        if (handlers[target.id]) { handlers[target.id](); }
    });
    
    document.body.addEventListener('input', (e) => { const id = e.target.id; if (id) { clearError(id); if (id === 'movimiento-cantidad') validateField('movimiento-cantidad', true); if (id === 'movimiento-descripcion') handleDescriptionInput(); if (id === 'movimiento-concepto' || id === 'movimiento-cuenta') validateField(id, true); if (id === 'movimiento-cuenta-origen' || id === 'movimiento-cuenta-destino') { validateField('movimiento-cuenta-origen', true); validateField('movimiento-cuenta-destino', true); } if (id === 'concepto-search-input') { clearTimeout(globalSearchDebounceTimer); globalSearchDebounceTimer = setTimeout(() => renderConceptosModalList(), 200); } if (id === 'cuenta-search-input') { clearTimeout(globalSearchDebounceTimer); globalSearchDebounceTimer = setTimeout(() => renderCuentasModalList(), 200); } } });
    
    document.body.addEventListener('blur', (e) => { const id = e.target.id; if (id) { if (id === 'movimiento-cantidad') validateField('movimiento-cantidad'); if (id === 'movimiento-concepto' || id === 'movimiento-cuenta') validateField(id); } }, true);
    
    document.body.addEventListener('focusin', (e) => { if (e.target.matches('.pin-input')) { handlePinInputInteraction(); } if (e.target.id === 'movimiento-descripcion') { handleDescriptionInput(); } });
    
    document.addEventListener('change', e => {
        const target = e.target;
        if (target.id === 'filter-periodo') {
            const el = select('custom-date-filters');
            if (el) el.classList.toggle('hidden', target.value !== 'custom');
            const applyBtnEl = document.querySelector('[data-action="apply-filters"]');
            const isCustom = target.value === 'custom';
            if (applyBtnEl) applyBtnEl.classList.toggle('hidden', !isCustom);
            if (!isCustom) { hapticFeedback('light'); scheduleDashboardUpdate(); }
        }
        if (target.id === 'movimiento-recurrente') {
            select('recurrent-options').classList.toggle('hidden', !target.checked);
            if(target.checked && !select('recurrent-next-date').value) {
                select('recurrent-next-date').value = select('movimiento-fecha').value;
            }
        }
        if (target.id === 'recurrent-frequency') {
            const endDateGroup = select('recurrent-end-date').closest('.form-group');
            if (endDateGroup) {
                endDateGroup.classList.toggle('hidden', target.value === 'once');
            }
        }
    });
    
    const importFileInput = select('import-file-input'); if (importFileInput) importFileInput.addEventListener('change', (e) => { if(e.target.files) handleJSONFileSelect(e.target.files[0]); });
    const calculatorGrid = select('calculator-grid'); if (calculatorGrid) calculatorGrid.addEventListener('click', (e) => { const btn = e.target.closest('button'); if(btn && btn.dataset.key) handleCalculatorInput(btn.dataset.key); });
    const searchInput = select('global-search-input'); if (searchInput) searchInput.addEventListener('input', () => { clearTimeout(globalSearchDebounceTimer); globalSearchDebounceTimer = setTimeout(() => { performGlobalSearch(searchInput.value); }, 250); });
    document.body.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); e.stopPropagation(); showGlobalSearchModal(); } });
    const dropZone = select('json-drop-zone'); if (dropZone) { dropZone.addEventListener('click', () => { const el = select('import-file-input'); if (el) el.click() }); dropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('drag-over'); }); dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('drag-over'); }); dropZone.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('drag-over'); const files = e.dataTransfer.files; if (files && files.length > 0) handleJSONFileSelect(files); }); }
    const suggestionsBox = select('description-suggestions'); if (suggestionsBox) { suggestionsBox.addEventListener('click', (e) => { const suggestionItem = e.target.closest('.suggestion-item'); if (suggestionItem) { const { description, conceptoId, cuentaId } = suggestionItem.dataset; applyDescriptionSuggestion(description, conceptoId, cuentaId); } }); }
    const fechaDisplayButton = select('movimiento-fecha-display'); const fechaRealInput = select('movimiento-fecha'); if (fechaDisplayButton && fechaRealInput) { fechaDisplayButton.addEventListener('click', () => fechaRealInput.showPicker()); fechaRealInput.addEventListener('input', () => updateDateDisplay(fechaRealInput)); }
    const diarioContainer = select('diario-page'); if (diarioContainer) { const mainScroller = selectOne('.app-layout__main'); diarioContainer.addEventListener('touchstart', (e) => { if (mainScroller.scrollTop > 0) return; ptrState.startY = e.touches[0].clientY; ptrState.isPulling = true; if (e.target.closest('.transaction-card')) { handleInteractionStart(e); } }, { passive: true }); diarioContainer.addEventListener('touchmove', (e) => { if (!ptrState.isPulling) { handleInteractionMove(e); return; } const currentY = e.touches[0].clientY; ptrState.distance = currentY - ptrState.startY; if (ptrState.distance > 0) { e.preventDefault(); const indicator = select('pull-to-refresh-indicator'); if (indicator) { indicator.classList.add('visible'); const rotation = Math.min(ptrState.distance * 2, 360); indicator.querySelector('.spinner').style.transform = `rotate(${rotation}deg)`; } } }, { passive: false }); diarioContainer.addEventListener('touchend', async (e) => { const indicator = select('pull-to-refresh-indicator'); if (ptrState.isPulling && ptrState.distance > ptrState.threshold) { hapticFeedback('medium'); if (indicator) { indicator.querySelector('.spinner').style.animation = 'spin 1s linear infinite'; } await loadMoreMovements(true); setTimeout(() => { if (indicator) { indicator.classList.remove('visible'); indicator.querySelector('.spinner').style.animation = ''; } }, 500); } else if (indicator) { indicator.classList.remove('visible'); } ptrState.isPulling = false; ptrState.distance = 0; handleInteractionEnd(e); }); diarioContainer.addEventListener('mousedown', (e) => e.target.closest('.transaction-card') && handleInteractionStart(e)); diarioContainer.addEventListener('mousemove', handleInteractionMove); diarioContainer.addEventListener('mouseup', handleInteractionEnd); diarioContainer.addEventListener('mouseleave', handleInteractionEnd); }
    const mainScroller = selectOne('.app-layout__main'); if (mainScroller) { let scrollRAF = null; mainScroller.addEventListener('scroll', () => { if (scrollRAF) window.cancelAnimationFrame(scrollRAF); scrollRAF = window.requestAnimationFrame(() => { if (diarioViewMode === 'list' && select('diario-page')?.classList.contains('view--active')) { renderVisibleItems(); } }); }, { passive: true }); }
    document.body.addEventListener('toggle', (e) => { const detailsElement = e.target; if (detailsElement.tagName !== 'DETAILS' || !detailsElement.classList.contains('informe-acordeon')) { return; } if (detailsElement.open) { const id = detailsElement.id; const informeId = id.replace('acordeon-', ''); const container = select(`informe-content-${informeId}`); if (container && container.querySelector('.form-label')) { renderInformeDetallado(informeId); } } }, true);
};
// =================================================================
// === FIN: BLOQUE DE CÓDIGO CORREGIDO PARA REEMPLAZAR           ===
// =================================================================

	const handleSetInvestmentChartMode = (mode) => {
    if (investmentChartMode === mode) return; // No hacer nada si ya está en ese modo
    hapticFeedback('light');
    investmentChartMode = mode; // Actualizamos el estado global
    
    // LA SOLUCIÓN:
    // Aplicamos la misma lógica aquí. Forzamos el redibujado en el contenedor correcto.
    renderInversionesView();
};
            
        const showImportJSONWizard = () => {
            jsonWizardState = { file: null, data: null, preview: { counts: {}, meta: {} } };
            goToJSONStep(1);
            const errorEl = select('json-file-error');
            const textEl = select('json-drop-zone-text');
            if(errorEl) errorEl.textContent = '';
            if(textEl) textEl.textContent = 'Arrastra tu archivo aquí o haz clic';
            showModal('json-import-wizard-modal');
        };

        const goToJSONStep = (stepNumber) => {
            selectAll('.json-wizard-step').forEach(step => step.style.display = 'none');
            const targetStep = select(`json-wizard-step-${stepNumber}`);
            if (targetStep) targetStep.style.display = 'flex';
        };

        const handleJSONFileSelect = (file) => {
            const errorEl = select('json-file-error');
            if(!errorEl) return;
            errorEl.textContent = '';

            if (!file.type.includes('json')) {
                errorEl.textContent = 'Error: El archivo debe ser de tipo .json.';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    let data = JSON.parse(event.target.result);
                    let dataToAnalyze = data;

                    if (data.meta && data.data) {
                        jsonWizardState.preview.meta = data.meta;
                        dataToAnalyze = data.data;
                    } else {
                        jsonWizardState.preview.meta = { appName: 'Cuentas (Formato Antiguo)', exportDate: 'N/A' };
                    }

                    if (!dataToAnalyze.cuentas || !dataToAnalyze.conceptos || !dataToAnalyze.movimientos) {
                        throw new Error("El archivo no tiene la estructura de una copia de seguridad válida.");
                    }

                    jsonWizardState.data = dataToAnalyze;
                    
                    const counts = {};
                    for (const key in dataToAnalyze) {
                        if (Array.isArray(dataToAnalyze[key])) {
                            counts[key] = dataToAnalyze[key].length;
                        }
                    }
                    jsonWizardState.preview.counts = counts;
                    
                    renderJSONPreview();
                    goToJSONStep(2);

                } catch (error) {
                    console.error("Error al procesar el archivo JSON:", error);
                    errorEl.textContent = `Error: ${error.message}`;
                }
            };
            reader.readAsText(file);
        };

        const renderJSONPreview = () => {
            const previewList = select('json-preview-list');
            if(!previewList) return;
            const { counts } = jsonWizardState.preview;
            
            const friendlyNames = {
                cuentas: 'Cuentas', conceptos: 'Conceptos', movimientos: 'Movimientos',
                presupuestos: 'Presupuestos', recurrentes: 'Recurrentes',
                inversiones_historial: 'Historial de Inversión', inversion_cashflows: 'Flujos de Capital'
            };
            
            let html = '';
            for(const key in counts) {
                if(counts[key] > 0) {
                    html += `<li><span class="material-icons">check_circle</span> <strong>${counts[key]}</strong> ${friendlyNames[key] || key}</li>`;
                }
            }
            
            previewList.innerHTML = html || `<li><span class="material-icons">info</span>El archivo parece estar vacío.</li>`;
        };

        const handleFinalJsonImport = async (btn) => {
            goToJSONStep(3);
            setButtonLoading(btn, true, 'Importando...');
            select('json-import-progress').style.display = 'block';
            select('json-import-result').style.display = 'none';

            try {
                const dataToImport = jsonWizardState.data;
                const collectionsToClear = ['cuentas', 'conceptos', 'movimientos', 'presupuestos', 'recurrentes', 'inversiones_historial', 'inversion_cashflows'];

                for (const collectionName of collectionsToClear) {
                    const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection(collectionName).get();
                    if (snapshot.empty) continue;
                    let batch = fbDb.batch();
                    let count = 0;
                    for (const doc of snapshot.docs) {
                        batch.delete(doc.ref);
                        count++;
                        if (count >= 450) { await batch.commit(); batch = fbDb.batch(); count = 0; }
                    }
                    if(count > 0) await batch.commit();
                }
                
                for (const collectionName of Object.keys(dataToImport)) {
                    const items = dataToImport[collectionName];
                    if (Array.isArray(items) && items.length > 0) {
                        let batch = fbDb.batch();
                        let count = 0;
                        for (const item of items) {
                            if (item.id) {
                                const docRef = fbDb.collection('users').doc(currentUser.uid).collection(collectionName).doc(item.id);
                                batch.set(docRef, item);
                                count++;
                                if (count >= 450) { await batch.commit(); batch = fbDb.batch(); count = 0; }
                            }
                        }
                        if(count > 0) await batch.commit();
                    } else if (collectionName === 'config') {
                        await fbDb.collection('users').doc(currentUser.uid).set({ config: items }, { merge: true });
                    }
                }
                
                select('json-import-progress').style.display = 'none';
                select('json-import-result').style.display = 'block';
                select('json-result-message').textContent = `Se han importado los datos correctamente. La aplicación se recargará.`;
                hapticFeedback('success');
                
                setTimeout(() => location.reload(), 4000);

            } catch (error) {
                console.error("Error durante la importación final:", error);
                showToast("Error crítico durante la importación.", "danger", 5000);
                select('json-result-title').textContent = '¡Error en la Importación!';
                select('json-result-message').textContent = `Ocurrió un error. Por favor, revisa la consola e inténtalo de nuevo.`;
                select('json-import-result .material-icons').style.color = 'var(--c-danger)';
                setButtonLoading(btn, false);
            }
        };
    
// =================================================================
// === INICIO: NUEVA FUNCIÓN PARA CONFIRMAR MOVIMIENTOS RECURRENTES ===
// =================================================================
const handleConfirmRecurrent = async (id, btn) => {
    if (btn) setButtonLoading(btn, true);

    const recurrenteIndex = db.recurrentes.findIndex(r => r.id === id);
    if (recurrenteIndex === -1) {
        showToast("Error: no se encontró la operación recurrente.", "danger");
        if (btn) setButtonLoading(btn, false);
        return;
    }
    const recurrente = db.recurrentes[recurrenteIndex];

    try {
        const newMovementId = generateId();
        
        // Lógica optimista (actualización local inmediata)
        const newMovementData = {
            id: newMovementId,
            cantidad: recurrente.cantidad,
            descripcion: recurrente.descripcion,
            fecha: new Date().toISOString(), // Se añade con la fecha de hoy
            tipo: recurrente.tipo,
            cuentaId: recurrente.cuentaId,
            conceptoId: recurrente.conceptoId,
            cuentaOrigenId: recurrente.cuentaOrigenId,
            cuentaDestinoId: recurrente.cuentaDestinoId
        };
        
        db.movimientos.unshift(newMovementData);

        // === ¡AQUÍ ESTÁ LA MAGIA! ===
        if (recurrente.frequency === 'once') {
            // Si es de única vez, lo eliminamos de la lista local de recurrentes.
            db.recurrentes.splice(recurrenteIndex, 1);
        } else {
            // Si es periódico, calculamos la siguiente fecha.
            const nextDueDate = calculateNextDueDate(recurrente.nextDate, recurrente.frequency);
            db.recurrentes[recurrenteIndex].nextDate = nextDueDate.toISOString().slice(0, 10);
        }
        
        // Refrescamos la UI al instante
        const activePage = document.querySelector('.view--active');
        if (activePage && activePage.id === PAGE_IDS.DIARIO) {
            updateLocalDataAndRefreshUI();
        } else if (activePage && activePage.id === PAGE_IDS.PLANIFICACION) {
            renderPlanificacionPage();
        }

        // Sincronización en segundo plano con Firebase
        const batch = fbDb.batch();
        const newMovementRef = fbDb.collection('users').doc(currentUser.uid).collection('movimientos').doc(newMovementId);
        batch.set(newMovementRef, newMovementData);
        
        const recurrenteRef = fbDb.collection('users').doc(currentUser.uid).collection('recurrentes').doc(id);

        // === ¡LA MISMA LÓGICA EN FIREBASE! ===
        if (recurrente.frequency === 'once') {
            // Si es de única vez, lo borramos de la base de datos.
            batch.delete(recurrenteRef);
        } else {
            // Si es periódico, actualizamos su próxima fecha.
            const nextDueDate = calculateNextDueDate(recurrente.nextDate, recurrente.frequency);
            batch.update(recurrenteRef, { nextDate: nextDueDate.toISOString().slice(0, 10) });
        }

        // Ajuste de saldos (esto no cambia)
        if (recurrente.tipo === 'traspaso') {
            const origenRef = fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(recurrente.cuentaOrigenId);
            const destinoRef = fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(recurrente.cuentaDestinoId);
            batch.update(origenRef, { saldo: firebase.firestore.FieldValue.increment(-recurrente.cantidad) });
            batch.update(destinoRef, { saldo: firebase.firestore.FieldValue.increment(recurrente.cantidad) });
        } else {
            const cuentaRef = fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(recurrente.cuentaId);
            batch.update(cuentaRef, { saldo: firebase.firestore.FieldValue.increment(recurrente.cantidad) });
        }

        await batch.commit();

        hapticFeedback('success');
        showToast("Movimiento añadido desde recurrente.", "info");

    } catch (error) {
        console.error("Error al confirmar el movimiento recurrente:", error);
        showToast("No se pudo añadir el movimiento recurrente.", "danger");
        // En caso de error, podríamos necesitar recargar los datos para asegurar la consistencia.
    } finally {
        if (btn) setButtonLoading(btn, false);
    }
};

const handleSkipRecurrent = async (id, btn) => {
    if (btn) setButtonLoading(btn, true);

    const recurrente = db.recurrentes.find(r => r.id === id);
    if (!recurrente) {
        showToast("Error: no se encontró la operación recurrente.", "danger");
        if (btn) setButtonLoading(btn, false);
        return;
    }

    try {
        // === ¡LA MISMA MAGIA OTRA VEZ! ===
        if (recurrente.frequency === 'once') {
            // Si es de única vez y lo omitimos, simplemente lo borramos.
            await deleteDoc('recurrentes', id);
            showToast("Operación programada eliminada.", "info");
        } else {
            // Si es periódico, calculamos la siguiente fecha para omitir la actual.
            const nextDueDate = calculateNextDueDate(recurrente.nextDate, recurrente.frequency);
            await saveDoc('recurrentes', id, { nextDate: nextDueDate.toISOString().slice(0, 10) });
            showToast("Operación recurrente omitida esta vez.", "info");
        }

        hapticFeedback('success');

        // La animación de borrado y refresco de UI funciona para ambos casos.
        const itemEl = select(`pending-recurrente-${id}`);
        if (itemEl) {
            itemEl.classList.add('item-deleting');
            itemEl.addEventListener('animationend', () => {
                const activePage = document.querySelector('.view--active');
                if (activePage && activePage.id === PAGE_IDS.DIARIO) {
                    updateVirtualListUI();
                } else if (activePage && activePage.id === PAGE_IDS.PLANIFICACION) {
                    renderPlanificacionPage();
                } else {
                    scheduleDashboardUpdate();
                }
            }, { once: true });
        }

    } catch (error) {
        console.error("Error al omitir el movimiento recurrente:", error);
        showToast("No se pudo omitir la operación.", "danger");
    } finally {
        if (btn) setButtonLoading(btn, false);
    }
};

const generateCalendarGrid = (date, dataMap) => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    
    const firstDayOffset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    
    // --- INICIO DE LA CORRECCIÓN ---
    // Obtenemos el número de días del mes de forma segura en UTC.
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    // --- FIN DE LA CORRECCIÓN ---

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    
    let gridHtml = `<div class="calendar-header">
        <button class="icon-btn" data-action="calendar-nav" data-direction="prev"><span class="material-icons">chevron_left</span></button>
        <h3 class="calendar-header__title">${monthName}</h3>
        <button class="icon-btn" data-action="calendar-nav" data-direction="next"><span class="material-icons">chevron_right</span></button>
    </div>`;

    gridHtml += '<div class="calendar-grid">';
    const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    weekdays.forEach(day => gridHtml += `<div class="calendar-weekday">${day}</div>`);

    let dayOfMonth = 1;
    for (let i = 0; i < 42; i++) {
        // La condición del bucle se mantiene, ya que con el `daysInMonth` corregido, debería funcionar.
        if (i < firstDayOffset || dayOfMonth > daysInMonth) {
            gridHtml += `<div class="calendar-day empty"></div>`;
        } else {
            const currentDate = new Date(Date.UTC(year, month, dayOfMonth));
            const dateKey = currentDate.toISOString().slice(0, 10);
            const dayData = dataMap.get(dateKey);
            
            let classes = 'calendar-day';
            if (currentDate.getTime() === today.getTime()) {
                classes += ' is-today';
            }

            gridHtml += `<div class="${classes}" data-action="show-day-details" data-date="${dateKey}">
                <span class="calendar-day__number">${dayOfMonth}</span>`;

            if (dayData) {
                if (dayData.total !== undefined) {
                    const totalClass = dayData.total >= 0 ? 'text-positive' : 'text-negative';
                    if (Math.abs(dayData.total) > 0) {
                        gridHtml += `<span class="calendar-day__total ${totalClass}">${formatCurrency(dayData.total)}</span>`;
                    }
                }
                if (dayData.markers) {
                    gridHtml += `<div class="calendar-day__markers">`;
                    if(dayData.markers.has('income')) gridHtml += `<div class="calendar-day__marker marker--income"></div>`;
                    if(dayData.markers.has('expense')) gridHtml += `<div class="calendar-day__marker marker--expense"></div>`;
                    gridHtml += `</div>`;
                }
            }
            
            gridHtml += `</div>`;
            dayOfMonth++;
        }
    }
    gridHtml += '</div>';
    return gridHtml;
};
// Reemplaza esta función completa:
const renderDiarioCalendar = async () => {
    const container = select('diario-view-container');
    if (!container) return;
    
    container.innerHTML = `<div class="calendar-container skeleton" style="height: 400px;"></div>`;

    try {
        // Aseguramos que diarioCalendarDate siempre sea un objeto Date válido
        if (!(diarioCalendarDate instanceof Date) || isNaN(diarioCalendarDate)) {
            diarioCalendarDate = new Date();
        }
        // Forzamos la fecha a mediodía para evitar problemas de zona horaria en los cálculos
        diarioCalendarDate.setHours(12, 0, 0, 0);

        const year = diarioCalendarDate.getFullYear();
        const month = diarioCalendarDate.getMonth();
        
        const startDate = new Date(Date.UTC(year, month, 1));
        const endDate = new Date(Date.UTC(year, month + 1, 1)); // El primer instante del siguiente mes
        
        const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos')
            .where('fecha', '>=', startDate.toISOString())
            .where('fecha', '<', endDate.toISOString())
            .get();

        const movementsOfMonth = snapshot.docs.map(doc => doc.data());
        
        const dataMap = new Map();
        movementsOfMonth.forEach(m => {
            const dateKey = m.fecha.slice(0, 10);
            if (!dataMap.has(dateKey)) dataMap.set(dateKey, { total: 0, markers: new Set() });
            
            let amount = 0;
            const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));

            if (m.tipo === 'traspaso') {
                if (visibleAccountIds.has(m.cuentaOrigenId) && !visibleAccountIds.has(m.cuentaDestinoId)) amount = -m.cantidad;
                else if (!visibleAccountIds.has(m.cuentaOrigenId) && visibleAccountIds.has(m.cuentaDestinoId)) amount = m.cantidad;
            } else {
                if (visibleAccountIds.has(m.cuentaId)) amount = m.cantidad;
            }

            if (amount !== 0) {
                 dataMap.get(dateKey).total += amount;
                 if (amount > 0) dataMap.get(dateKey).markers.add('income');
                 if (amount < 0) dataMap.get(dateKey).markers.add('expense');
            }
        });
        
        container.innerHTML = `<div class="calendar-container" data-context="diario">${generateCalendarGrid(diarioCalendarDate, dataMap)}</div>`;
    } catch(error) {
        console.error("Error fetching calendar data:", error);
        container.innerHTML = `<div class="empty-state"><p class="text-danger">No se pudieron cargar los datos del calendario.</p></div>`;
    }
};


const applyOptimisticBalanceUpdate = (newData, oldData = null) => {
    // Revertir el impacto del movimiento antiguo si estamos editando
    if (oldData) {
        if (oldData.tipo === 'traspaso') {
            const origen = db.cuentas.find(c => c.id === oldData.cuentaOrigenId);
            if (origen) origen.saldo += oldData.cantidad;
            const destino = db.cuentas.find(c => c.id === oldData.cuentaDestinoId);
            if (destino) destino.saldo -= oldData.cantidad;
        } else {
            const cuenta = db.cuentas.find(c => c.id === oldData.cuentaId);
            if (cuenta) cuenta.saldo -= oldData.cantidad;
        }
    }

    // Aplicar el impacto del nuevo movimiento
    if (newData.tipo === 'traspaso') {
        const origen = db.cuentas.find(c => c.id === newData.cuentaOrigenId);
        if (origen) origen.saldo -= newData.cantidad;
        const destino = db.cuentas.find(c => c.id === newData.cuentaDestinoId);
        if (destino) destino.saldo += newData.cantidad;
    } else {
        const cuenta = db.cuentas.find(c => c.id === newData.cuentaId);
        if (cuenta) cuenta.saldo += newData.cantidad;
    }
};

const handleSaveMovement = async (form, btn) => {
    clearAllErrors(form.id);
    if (!validateMovementForm()) {
        hapticFeedback('error');
        showToast('Por favor, revisa los campos marcados en rojo.', 'warning');
        return false;
    }

    const isSaveAndNew = btn && btn.dataset.action === 'save-and-new-movement';
    setButtonLoading(btn, true);

    const isRecurrent = select('movimiento-recurrente').checked;

    if (isRecurrent) {
    // --- LÓGICA CORREGIDA Y ROBUSTA PARA MOVIMIENTOS RECURRENTES ---
    try {
        const id = select('movimiento-id').value || generateId();
        const tipoRecurrente = document.querySelector('[data-action="set-movimiento-type"].filter-pill--active').dataset.type;
        const cantidadPositiva = parseCurrencyString(select('movimiento-cantidad').value);
        const cantidadEnCentimos = Math.round(cantidadPositiva * 100);

        // 1. Preparamos el objeto base con los datos comunes
        const dataToSave = {
            id: id,
            descripcion: select('movimiento-descripcion').value.trim(),
            frequency: select('recurrent-frequency').value,
            nextDate: select('recurrent-next-date').value,
            endDate: select('recurrent-end-date').value || null,
        };

        // 2. Añadimos los campos específicos según el tipo de movimiento
        if (tipoRecurrente === 'traspaso') {
            Object.assign(dataToSave, {
                tipo: 'traspaso',
                cantidad: Math.abs(cantidadEnCentimos),
                cuentaOrigenId: select('movimiento-cuenta-origen').value,
                cuentaDestinoId: select('movimiento-cuenta-destino').value,
                // Nos aseguramos de limpiar los campos que no se usan
                cuentaId: null,
                conceptoId: null,
            });
        } else { // Es 'gasto' o 'ingreso'
            Object.assign(dataToSave, {
                tipo: 'movimiento',
                cantidad: tipoRecurrente === 'gasto' ? -Math.abs(cantidadEnCentimos) : Math.abs(cantidadEnCentimos),
                cuentaId: select('movimiento-cuenta').value,
                conceptoId: select('movimiento-concepto').value,
                // Limpiamos los campos de traspaso
                cuentaOrigenId: null,
                cuentaDestinoId: null,
            });
        }
        
        // 3. Guardamos en la base de datos
        await saveDoc('recurrentes', id, dataToSave);

        // 4. El resto de la lógica para la UI se mantiene igual
        setButtonLoading(btn, false);
        hapticFeedback('success');
        triggerSaveAnimation(btn, dataToSave.cantidad >= 0 ? 'green' : 'red');
        
        if (!isSaveAndNew) {
            hideModal('movimiento-modal');
            showToast(select('movimiento-mode').value.startsWith('edit') ? 'Operación programada actualizada.' : 'Operación programada.');
        } else {
            form.reset();
            setMovimientoFormType('gasto');
            showToast('Operación guardada, puedes añadir otra.', 'info');
            select('movimiento-cantidad').focus();
        }

        // Refrescamos la vista de planificación para ver los cambios
        const activePage = document.querySelector('.view--active');
        if (activePage && activePage.id === PAGE_IDS.PLANIFICACION) {
            renderPlanificacionPage();
        } else if (activePage && activePage.id === PAGE_IDS.DIARIO) {
            renderDiarioPage(); // También refresca el diario por si hay pendientes
        }
        return true;

    } catch (error) {
        console.error("Error al guardar la operación recurrente:", error);
        showToast("No se pudo guardar la operación recurrente.", "danger");
        setButtonLoading(btn, false);
        return false;
    }
    } else {
        // --- LÓGICA PARA MOVIMIENTOS NORMALES (sin cambios) ---
        const mode = select('movimiento-mode').value;
        const movementId = select('movimiento-id').value;
        const selectedType = document.querySelector('[data-action="set-movimiento-type"].filter-pill--active').dataset.type;
        const cantidadPositiva = parseCurrencyString(select('movimiento-cantidad').value);
        let cantidadFinal = Math.round(Math.abs(cantidadPositiva) * 100);
        if (selectedType === 'gasto') { cantidadFinal = -cantidadFinal; }
        
        const dataFromForm = {
            id: movementId || generateId(),
            cantidad: cantidadFinal,
            tipo: selectedType === 'traspaso' ? 'traspaso' : 'movimiento',
            descripcion: (() => {
                let descInput = select('movimiento-descripcion').value.trim();
                if (selectedType === 'traspaso' && descInput === '') {
                    const origen = select('movimiento-cuenta-origen');
                    const destino = select('movimiento-cuenta-destino');
                    const nombreOrigen = origen.options[origen.selectedIndex]?.text || '?';
                    const nombreDestino = destino.options[destino.selectedIndex]?.text || '?';
                    descInput = `Traspaso de ${nombreOrigen} a ${nombreDestino}`;
                }
                return descInput;
            })(),
            fecha: parseDateStringAsUTC(select('movimiento-fecha').value).toISOString(),
            cuentaId: select('movimiento-cuenta').value,
            conceptoId: select('movimiento-concepto').value,
            cuentaOrigenId: select('movimiento-cuenta-origen').value,
            cuentaDestinoId: select('movimiento-cuenta-destino').value,
        };

        try {
            // (El resto de esta lógica, con applyOptimisticBalanceUpdate y la transacción, es correcta)
            let oldMovementData = null;
            if (mode.startsWith('edit')) {
                oldMovementData = db.movimientos.find(m => m.id === dataFromForm.id) || null;
            }
            applyOptimisticBalanceUpdate(dataFromForm, oldMovementData);
            if (mode.startsWith('edit')) {
                const index = db.movimientos.findIndex(m => m.id === dataFromForm.id);
                if (index !== -1) db.movimientos[index] = dataFromForm;
            } else {
                db.movimientos.unshift(dataFromForm);
                newMovementIdToHighlight = dataFromForm.id;
            }
            db.movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id.localeCompare(a.id));
            updateLocalDataAndRefreshUI();
            
            // ... (el resto del código de la transacción de Firebase se mantiene)
            await fbDb.runTransaction(async (transaction) => {
                 let oldDataForTx = null;
                if (mode.startsWith('edit')) {
                    const oldDocRef = fbDb.collection('users').doc(currentUser.uid).collection('movimientos').doc(movementId);
                    const oldDoc = await transaction.get(oldDocRef);
                    if (oldDoc.exists) oldDataForTx = oldDoc.data();
                }
                if (oldDataForTx) {
                    if (oldDataForTx.tipo === 'traspaso') {
                        transaction.update(fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(oldDataForTx.cuentaOrigenId), { saldo: firebase.firestore.FieldValue.increment(oldDataForTx.cantidad) });
                        transaction.update(fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(oldDataForTx.cuentaDestinoId), { saldo: firebase.firestore.FieldValue.increment(-oldDataForTx.cantidad) });
                    } else {
                        transaction.update(fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(oldDataForTx.cuentaId), { saldo: firebase.firestore.FieldValue.increment(-oldDataForTx.cantidad) });
                    }
                }
                if (dataFromForm.tipo === 'traspaso') {
                    transaction.update(fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(dataFromForm.cuentaOrigenId), { saldo: firebase.firestore.FieldValue.increment(-dataFromForm.cantidad) });
                    transaction.update(fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(dataFromForm.cuentaDestinoId), { saldo: firebase.firestore.FieldValue.increment(dataFromForm.cantidad) });
                } else {
                    transaction.update(fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(dataFromForm.cuentaId), { saldo: firebase.firestore.FieldValue.increment(dataFromForm.cantidad) });
                }
                const movRef = fbDb.collection('users').doc(currentUser.uid).collection('movimientos').doc(dataFromForm.id);
                transaction.set(movRef, dataFromForm);
            });
            
            setButtonLoading(btn, false);
            hapticFeedback('success');
            triggerSaveAnimation(btn, dataFromForm.cantidad >= 0 ? 'green' : 'red');

            if (!isSaveAndNew) {
                setTimeout(() => hideModal('movimiento-modal'), 200);
                showToast(mode === 'new' ? 'Movimiento guardado.' : 'Movimiento actualizado.');
            } else {
                form.reset();
                setMovimientoFormType('gasto');
                const today = new Date();
                const fechaInput = select('movimiento-fecha');
                fechaInput.value = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
                updateDateDisplay(fechaInput);
                select('movimiento-cantidad').focus();
            }

            return true;

        } catch (error) {
            console.error("Error al guardar el movimiento:", error);
            showToast("Error crítico al guardar. La operación fue cancelada.", "danger");
            setButtonLoading(btn, false);
            if (select('diario-page')?.classList.contains('view--active')) {
                await renderDiarioPage();
            }
            return false;
        }
    }
};

/**

Prepara el formulario para duplicar un movimiento existente.

@param {object} movementToDuplicate - El objeto del movimiento que se va a copiar.
*/
const handleDuplicateMovement = (movementToDuplicate) => {
if (!movementToDuplicate) return;

hapticFeedback('medium');

// 1. Abrimos el formulario de edición con los datos del movimiento original.
// Esto rellena todos los campos por nosotros (cantidad, descripción, etc.).
startMovementForm(movementToDuplicate.id, false);

// 2. Usamos un pequeño retardo para asegurarnos de que el formulario ya está visible
// antes de modificarlo para que actúe como "Nuevo" en lugar de "Editar".
setTimeout(() => {
// 3. Modificamos el estado del formulario para que sepa que vamos a crear
// un movimiento NUEVO, no a actualizar el antiguo.
select('movimiento-mode').value = 'new';
select('movimiento-id').value = ''; // Borramos el ID antiguo, ¡muy importante!
select('form-movimiento-title').textContent = 'Duplicar Movimiento';


// 4. Ocultamos los botones que no tienen sentido aquí (borrar y duplicar de nuevo).
 select('delete-movimiento-btn').classList.add('hidden');
 select('duplicate-movimiento-btn').classList.add('hidden');
 
 // 5. Ponemos la fecha de hoy por defecto, que es lo más común al duplicar.
 const today = new Date();
 const fechaInput = select('movimiento-fecha');
 fechaInput.value = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
 updateDateDisplay(fechaInput); // Actualizamos el texto "Hoy"

 showToast('Datos duplicados. Ajusta y guarda.', 'info');

}, 50); // 50 milisegundos es suficiente.
};


const handleAddConcept = async (btn) => { 
    const nombreInput = select('new-concepto-nombre');
    const nombre = toSentenceCase(nombreInput.value.trim());
    if (!nombre) { showToast('El nombre es obligatorio.', 'warning'); return; }
    
    // --- LÍNEA AÑADIDA PARA VERIFICAR ---
    if (db.conceptos.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
        showToast(`El concepto "${nombre}" ya existe.`, 'danger');
        return;
    }

    const newId = generateId();
    await saveDoc('conceptos', newId, { id: newId, nombre, icon: 'label' }, btn);
    hapticFeedback('success'); 
    showToast('Concepto añadido.');
    (select('add-concepto-form')).reset(); 
};

 const handleSaveConfig = async (btn) => { 
     setButtonLoading(btn, true);
     const newConfig = { dashboardWidgets: (db.config && db.config.dashboardWidgets) || DEFAULT_DASHBOARD_WIDGETS };
     await fbDb.collection('users').doc(currentUser.uid).set({ config: newConfig }, { merge: true });
     localStorage.setItem('skipIntro', String(newConfig.skipIntro));
     setButtonLoading(btn, false);
     hapticFeedback('success'); showToast('Configuración guardada.'); 
 };
 

          const handleExportData = async (btn) => {
     if (!currentUser) { showToast("No hay usuario autenticado.", "danger"); return; }
     setButtonLoading(btn, true, 'Exportando...');
     try {
         const dataPayload = {};
         const collections = ['cuentas', 'conceptos', 'movimientos', 'presupuestos', 'recurrentes', 'inversiones_historial', 'inversion_cashflows'];
         
         for (const collectionName of collections) {
             const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection(collectionName).get();
             dataPayload[collectionName] = snapshot.docs.map(doc => doc.data());
         }
         dataPayload.config = db.config;

         const exportObject = {
             meta: {
                 appName: "DaniCtas",
                 version: "3.0.0",
                 exportDate: new Date().toISOString()
             },
             data: dataPayload
         };
         
         const jsonString = JSON.stringify(exportObject, null, 2);
         const blob = new Blob([jsonString], { type: 'application/json' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `cuentas_aidanai_backup_${new Date().toISOString().slice(0,10)}.json`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
         showToast("Exportación JSON completada.", "info");
     } catch (error) {
         console.error("Error al exportar datos:", error);
         showToast("Error durante la exportación.", "danger");
     } finally {
         setButtonLoading(btn, false);
     }
 };
 const formatDateForCsv = (isoDateString) => {
     if (!isoDateString) return '';
     const date = new Date(isoDateString);
     const day = String(date.getUTCDate()).padStart(2, '0');
     const month = String(date.getUTCMonth() + 1).padStart(2, '0');
     const year = date.getUTCFullYear();
     return `${day}/${month}/${year}`;
 };

 const handleExportCsv = async (btn) => {
     if (!currentUser) { showToast("No hay usuario autenticado.", "danger"); return; }
     setButtonLoading(btn, true, 'Exportando...');
     
     try {
         const allMovements = await fetchAllMovementsForSearch();
         const allCuentas = db.cuentas;
         const allConceptos = db.conceptos;

         const cuentasMap = new Map(allCuentas.map(c => [c.id, c]));
         const conceptosMap = new Map(allConceptos.map(c => [c.id, c]));

         let csvRows = [];
         const csvHeader = ['FECHA', 'CUENTA', 'CONCEPTO', 'IMPORTE', 'DESCRIPCIÓN'];
         csvRows.push(csvHeader.join(';'));
         
         for (const cuenta of allCuentas) {
             const movementsOfAccount = allMovements.filter(m => {
                 return (m.tipo === 'movimiento' && m.cuentaId === cuenta.id) ||
                        (m.tipo === 'traspaso' && m.cuentaOrigenId === cuenta.id) ||
                        (m.tipo === 'traspaso' && m.cuentaDestinoId === cuenta.id);
             });

             const balanceChange = movementsOfAccount.reduce((sum, m) => {
                 if (m.tipo === 'movimiento') return sum + m.cantidad;
                 if (m.tipo === 'traspaso' && m.cuentaOrigenId === cuenta.id) return sum - m.cantidad;
                 if (m.tipo === 'traspaso' && m.cuentaDestinoId === cuenta.id) return sum + m.cantidad;
                 return sum;
             }, 0);
             
             const initialBalance = (cuenta.saldo || 0) - balanceChange;
             
             if (initialBalance !== 0) {
                 const cuentaNombre = `${cuenta.offBalance ? 'N-' : ''}${cuenta.nombre}`;
                 const importeStr = (initialBalance / 100).toLocaleString('es-ES', { useGrouping: false, minimumFractionDigits: 2 });
                 const fechaCreacion = cuenta.fechaCreacion ? formatDateForCsv(cuenta.fechaCreacion) : '01/01/2025';

                 csvRows.push([fechaCreacion, `"${cuentaNombre}"`, 'INICIAL', importeStr, '"Saldo Inicial"'].join(';'));
             }
         }
         
         const sortedMovements = allMovements.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

         for (const mov of sortedMovements) {
             const fecha = formatDateForCsv(mov.fecha);
             const descripcion = `"${mov.descripcion.replace(/"/g, '""')}"`;
             const importeStr = (mov.cantidad / 100).toLocaleString('es-ES', { useGrouping: false, minimumFractionDigits: 2 });

             if (mov.tipo === 'traspaso') {
                 const cuentaOrigen = cuentasMap.get(mov.cuentaOrigenId);
                 const cuentaDestino = cuentasMap.get(mov.cuentaDestinoId);
                 
                 if (cuentaOrigen && cuentaDestino) {
                     const nombreOrigen = `${cuentaOrigen.offBalance ? 'N-' : ''}${cuentaOrigen.nombre}`;
                     const nombreDestino = `${cuentaDestino.offBalance ? 'N-' : ''}${cuentaDestino.nombre}`;
                     const importeNegativo = (-mov.cantidad / 100).toLocaleString('es-ES', { useGrouping: false, minimumFractionDigits: 2 });
                     
                     csvRows.push([fecha, `"${nombreOrigen}"`, 'TRASPASO', importeNegativo, descripcion].join(';'));
                     csvRows.push([fecha, `"${nombreDestino}"`, 'TRASPASO', importeStr, descripcion].join(';'));
                 }
             } else {
                 const cuenta = cuentasMap.get(mov.cuentaId);
                 const concepto = conceptosMap.get(mov.conceptoId);

                 if (cuenta && concepto && concepto.nombre !== 'Saldo Inicial') {
                     const nombreCuenta = `${cuenta.offBalance ? 'N-' : ''}${cuenta.nombre}`;
                     csvRows.push([fecha, `"${nombreCuenta}"`, `"${concepto.nombre}"`, importeStr, descripcion].join(';'));
                 }
             }
         }

         const csvString = csvRows.join('\r\n');
         const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `cuentas_aidanai_export_${new Date().toISOString().slice(0,10)}.csv`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
         showToast("Exportación CSV completada.", "info");
         
     } catch (error) {
         console.error("Error al exportar datos a CSV:", error);
         showToast("Error durante la exportación a CSV.", "danger");
     } finally {
         setButtonLoading(btn, false);
     }
 };
 const csv_parseDate = (dateString) => {
     if (!dateString) return null;
     const parts = dateString.split('/');
     if (parts.length !== 3) return null;
     const day = parseInt(parts[0], 10);
	 const month = parseInt(parts[1], 10) - 1;
	 const year = parseInt(parts[2], 10);
     if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1970) return null;
     return new Date(Date.UTC(year, month, day, 12, 0, 0));
 };

 const csv_parseCurrency = (currencyString) => {
     if (typeof currencyString !== 'string' || !currencyString) return 0;
     const number = parseFloat(
         currencyString
         .replace('€', '')
         .trim()
         .replace(/\./g, '')
         .replace(',', '.')
     );
     return isNaN(number) ? 0 : Math.round(number * 100);
 };

 const csv_inferType = (name) => {
     const upperName = name.toUpperCase();
     if (upperName.includes('TARJETA')) return { tipo: 'Tarjeta', esInversion: false };
     if (upperName.includes('EFECTIVO')) return { tipo: 'Efectivo', esInversion: false };
     if (upperName.includes('PENSIÓN')) return { tipo: 'Pensión', esInversion: true };
     if (upperName.includes('LETRAS')) return { tipo: 'Renta Fija', esInversion: true };
     if (['FONDO', 'FONDOS'].some(t => upperName.includes(t))) return { tipo: 'Fondos', esInversion: true };
     if (['TRADEREPUBLIC', 'MYINVESTOR', 'DEGIRO', 'INTERACTIVEBROKERS', 'INDEXACAPITAL', 'COINBASE', 'CRIPTAN', 'KRAKEN', 'BIT2ME', 'N26', 'FREEDOM24', 'DEBLOCK', 'BBVA', 'CIVISLEND', 'HOUSERS', 'URBANITAE', 'MINTOS', 'HAUSERA'].some(b => upperName.includes(b))) return { tipo: 'Broker', esInversion: true };
     if (upperName.includes('NARANJA') || upperName.includes('AHORRO')) return { tipo: 'Ahorro', esInversion: false };
     return { tipo: 'Banco', esInversion: false };
 };

  const csv_processFile = (file) => {
     return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = (event) => {
             try {
                 const csvData = event.target.result.replace(/^\uFEFF/, '');
                 const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '' && line.includes(';'));
                 if (lines.length <= 1) {
                     showToast("El archivo CSV está vacío o solo contiene la cabecera.", "warning");
                     return resolve(null);
                 }
                 
                 lines.shift(); // Eliminar la cabecera

                 let rowCount = 0, initialCount = 0;
                 const cuentasMap = new Map();
                 const conceptosMap = new Map();
                 const movimientos = [];
                 const potentialTransfers = [];
                 
                 for (const line of lines) {
                     rowCount++;
                     const columns = line.split(';').map(c => c.trim().replace(/"/g, ''));
                     const [fechaStr, cuentaStr, conceptoStr, importeStr, descripcion = ''] = columns;

                     if (!fechaStr || !cuentaStr || !conceptoStr || !importeStr) {
                         console.warn(`Línea inválida o incompleta #${rowCount + 1}. Saltando...`, line);
                         continue;
                     }
                     
                     const fecha = csv_parseDate(fechaStr);
                     if (!fecha) {
                          console.warn(`Fecha inválida en la fila ${rowCount + 1}: ${fechaStr}`);
                          continue;
                     }

                     const conceptoLimpio = conceptoStr.trim().toUpperCase().replace(/\s*;-$/, '');
                     const offBalance = cuentaStr.startsWith('N-');
                     const nombreCuentaLimpio = cuentaStr.replace(/^(D-|N-)/, '');
                     const cantidad = csv_parseCurrency(importeStr);

                     if (!cuentasMap.has(nombreCuentaLimpio)) {
                         const { tipo, esInversion } = csv_inferType(nombreCuentaLimpio);
                         cuentasMap.set(nombreCuentaLimpio, { id: generateId(), nombre: nombreCuentaLimpio, tipo, saldo: 0, esInversion, offBalance, fechaCreacion: new Date(Date.UTC(2025, 0, 1)).toISOString() });
                     }

                     if (conceptoLimpio === 'INICIAL') {
                         initialCount++;
                         if (!conceptosMap.has('SALDO INICIAL')) conceptosMap.set('SALDO INICIAL', { id: generateId(), nombre: 'Saldo Inicial', icon: 'account_balance' });
                         const conceptoInicial = conceptosMap.get('SALDO INICIAL');
                         movimientos.push({ id: generateId(), fecha: fecha.toISOString(), cantidad, descripcion: descripcion || 'Existencia Inicial', tipo: 'movimiento', cuentaId: cuentasMap.get(nombreCuentaLimpio).id, conceptoId: conceptoInicial ? conceptoInicial.id : null });
                         continue;
                     }

                     if (conceptoLimpio && conceptoLimpio !== 'TRASPASO' && !conceptosMap.has(conceptoLimpio)) {
                         conceptosMap.set(conceptoLimpio, { id: generateId(), nombre: toSentenceCase(conceptoLimpio), icon: 'label' });
                     }
                     
                     if (conceptoLimpio === 'TRASPASO') {
                         // CAMBIO CLAVE: Incluimos la descripción en el objeto que guardamos para su posterior análisis.
                         potentialTransfers.push({ fecha, nombreCuenta: nombreCuentaLimpio, cantidad, descripcion, originalRow: rowCount });
                     } else {
                         const conceptoActual = conceptosMap.get(conceptoLimpio);
                         movimientos.push({ id: generateId(), fecha: fecha.toISOString(), cantidad, descripcion, tipo: 'movimiento', cuentaId: cuentasMap.get(nombreCuentaLimpio).id, conceptoId: conceptoActual ? conceptoActual.id : null });
                     }
                 }

                 let matchedTransfersCount = 0;
                 let unmatchedTransfers = [];
                 const transferGroups = new Map();
                 
                 potentialTransfers.forEach(t => {
                     // CAMBIO CLAVE: La nueva "llave" para agrupar ahora incluye la descripción.
                     // Esto asegura que solo traspasos con misma fecha, importe Y descripción se agrupen.
                     const key = `${t.fecha.getTime()}_${Math.abs(t.cantidad)}_${t.descripcion}`;
                     if (!transferGroups.has(key)) transferGroups.set(key, []);
                     transferGroups.get(key).push(t);
                 });

                 transferGroups.forEach((group) => {
                     const gastos = group.filter(t => t.cantidad < 0);
                     const ingresos = group.filter(t => t.cantidad > 0);
                     
                     // Este bucle ahora opera sobre un grupo mucho más específico y fiable.
                     while (gastos.length > 0 && ingresos.length > 0) {
                         const Gasto = gastos.pop();
                         const Ingreso = ingresos.pop();
                         movimientos.push({ id: generateId(), fecha: Gasto.fecha.toISOString(), cantidad: Math.abs(Gasto.cantidad), descripcion: Gasto.descripcion || Ingreso.descripcion || 'Traspaso', tipo: 'traspaso', cuentaOrigenId: cuentasMap.get(Gasto.nombreCuenta).id, cuentaDestinoId: cuentasMap.get(Ingreso.nombreCuenta).id });
                         matchedTransfersCount++;
                     }
                     // Los que no se emparejan se añaden a la lista de "sin pareja".
                     unmatchedTransfers.push(...gastos, ...ingresos);
                 });
                 
                 const conceptoInicialId = conceptosMap.has('SALDO INICIAL') ? conceptosMap.get('SALDO INICIAL').id : null;
                 const finalData = { cuentas: Array.from(cuentasMap.values()), conceptos: Array.from(conceptosMap.values()), movimientos, presupuestos: [], recurrentes: [], inversiones_historial: [], inversion_cashflows: [], config: getInitialDb().config };
                 const totalMovements = movimientos.filter(m => m.tipo === 'movimiento' && m.conceptoId !== conceptoInicialId).length;

                 resolve({
                     jsonData: finalData,
                     stats: { rowCount, accounts: cuentasMap.size, concepts: conceptosMap.size, movements: totalMovements, transfers: matchedTransfersCount, initials: initialCount, unmatched: unmatchedTransfers.length }
                 });

             } catch (error) {
                 reject(error);
             }
         };
         reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
         reader.readAsText(file, 'UTF-8');
     });
 };

 const showCsvImportWizard = () => {
     const wizardHTML = `
     <div id="csv-wizard-content">
         <div id="csv-wizard-step-1" class="json-wizard-step">
             <h4>Paso 1: Selecciona tu archivo CSV</h4>
             <p class="form-label" style="margin-bottom: var(--sp-3);">
                 Columnas requeridas: <code>FECHA;CUENTA;CONCEPTO;IMPORTE;DESCRIPCIÓN</code>.
                 <br><strong>Atención:</strong> La importación reemplazará <strong>todos</strong> tus datos actuales.
             </p>
             <div id="csv-drop-zone" class="upload-area">
                 <p>Arrastra tu archivo <code>.csv</code> aquí o <strong>haz clic para seleccionarlo</strong>.</p>
                 <span id="csv-file-name" class="file-name" style="color: var(--c-success); font-weight: 600; margin-top: 1rem; display: block;"></span>
             </div>
             <div id="csv-file-error" class="form-error" style="text-align: center; margin-top: var(--sp-3);"></div>
             <div class="modal__actions">
                 <button id="csv-process-btn" class="btn btn--primary btn--full" disabled>Analizar Archivo</button>
             </div>
         </div>

         <div id="csv-wizard-step-2" class="json-wizard-step" style="display: none;">
             <h4>Paso 2: Revisa y confirma</h4>
             <p class="form-label" style="margin-bottom: var(--sp-3);">Hemos analizado tu archivo. Si los datos son correctos, pulsa "Importar" para reemplazar tus datos actuales.</p>
             <div class="results-log" style="display: block; margin-top: 0;">
                 <h2>Resultados del Análisis</h2>
                 <ul id="csv-preview-list"></ul>
             </div>
             <div class="form-error" style="margin-top: var(--sp-2); text-align: center;"><strong>Atención:</strong> Esta acción es irreversible.</div>
             <div class="modal__actions" style="justify-content: space-between;">
                 <button id="csv-wizard-back-btn" class="btn btn--secondary">Atrás</button>
                 <button id="csv-wizard-import-final" class="btn btn--danger"><span class="material-icons">warning</span>Importar y Reemplazar</button>
             </div>
         </div>

         <div id="csv-wizard-step-3" class="json-wizard-step" style="display: none; justify-content: center; align-items: center; text-align: center; min-height: 250px;">
             <div id="csv-import-progress">
                 <span class="spinner" style="width: 48px; height: 48px; border-width: 4px;"></span>
                 <h4 style="margin-top: var(--sp-4);">Importando...</h4>
                 <p>Borrando datos antiguos e importando los nuevos. Por favor, no cierres esta ventana.</p>
             </div>
              <div id="csv-import-result" style="display: none;">
                 <span class="material-icons" style="font-size: 60px; color: var(--c-success);">task_alt</span>
                 <h4 id="csv-result-title" style="margin-top: var(--sp-2);"></h4>
                 <p id="csv-result-message"></p>
                 <div class="modal__actions" style="justify: center;">
                     <button class="btn btn--primary" data-action="close-modal" data-modal-id="generic-modal">Finalizar</button>
                 </div>
              </div>
         </div>
     </div>`;

     showGenericModal('Asistente de Importación CSV', wizardHTML);

     setTimeout(() => {
         let csvFile = null;
         let processedData = null;
         const wizardContent = select('csv-wizard-content');
         if (!wizardContent) return;

         const goToStep = (step) => {
             wizardContent.querySelectorAll('.json-wizard-step').forEach(s => s.style.display = 'none');
             wizardContent.querySelector(`#csv-wizard-step-${step}`).style.display = 'flex';
         };

         const fileInput = document.createElement('input');
         fileInput.type = 'file'; fileInput.accept = '.csv, text/csv'; fileInput.className = 'hidden';
         wizardContent.appendChild(fileInput);

         const handleFileSelection = (files) => {
             const file = files;
             const nameEl = select('csv-file-name'), processBtn = select('csv-process-btn'), errorEl = select('csv-file-error');
             if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
                 csvFile = file;
                 nameEl.textContent = `Archivo: ${file.name}`;
                 processBtn.disabled = false;
                 errorEl.textContent = '';
             } else {
                 csvFile = null;
                 nameEl.textContent = 'Por favor, selecciona un archivo .csv válido.';
                 processBtn.disabled = true;
             }
         };
         
         const dropZone = select('csv-drop-zone');
         dropZone.addEventListener('click', () => fileInput.click());
         fileInput.addEventListener('change', () => handleFileSelection(fileInput.files));
         dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
         dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
         dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFileSelection(e.dataTransfer.files); });

         select('csv-process-btn').addEventListener('click', async (e) => {
             if (!csvFile) return;
             const btn = e.target;
             setButtonLoading(btn, true, 'Analizando...');
             try {
                 const result = await csv_processFile(csvFile);
                 if (result) {
                     processedData = result.jsonData;
                     const { stats } = result;
                     const previewList = select('csv-preview-list');
                     let html = `
                         <li><span class="label">Filas Válidas Leídas</span><span class="value">${stats.rowCount}</span></li>
                         <li><span class="label">Cuentas a Crear</span><span class="value success">${stats.accounts}</span></li>
                         <li><span class="label">Conceptos a Crear</span><span class="value success">${stats.concepts}</span></li>
                         <li><span class="label">Saldos Iniciales</span><span class="value">${stats.initials}</span></li>
                         <li><span class="label">Movimientos (Ingreso/Gasto)</span><span class="value">${stats.movements}</span></li>
                         <li><span class="label">Transferencias Emparejadas</span><span class="value">${stats.transfers}</span></li>
                         <li><span class="label">Transferencias sin Pareja</span><span class="value ${stats.unmatched > 0 ? 'danger' : 'success'}">${stats.unmatched}</span></li>
                     `;
                     previewList.innerHTML = html;
                     goToStep(2);
                 }
             } catch (error) {
                 console.error("Error al procesar CSV:", error);
                 select('csv-file-error').textContent = `Error: ${error.message}`;
             } finally {
                 setButtonLoading(btn, false);
             }
         });

         select('csv-wizard-back-btn').addEventListener('click', () => goToStep(1));
         select('csv-wizard-import-final').addEventListener('click', (e) => {
             if (processedData) handleFinalCsvImport(e.target, processedData, goToStep);
         });
     }, 0);
 };

 const handleFinalCsvImport = async (btn, dataToImport, goToStep) => {
     goToStep(3);
     setButtonLoading(btn, true, 'Importando...');

     try {
         const collectionsToClear = ['cuentas', 'conceptos', 'movimientos', 'presupuestos', 'recurrentes', 'inversiones_historial', 'inversion_cashflows'];

         for (const collectionName of collectionsToClear) {
             const snapshot = await fbDb.collection('users').doc(currentUser.uid).collection(collectionName).get();
             if (snapshot.empty) continue;
             let batch = fbDb.batch();
             let count = 0;
             for (const doc of snapshot.docs) {
                 batch.delete(doc.ref);
                 count++;
                 if (count >= 450) { await batch.commit(); batch = fbDb.batch(); count = 0; }
             }
             if (count > 0) await batch.commit();
         }
         
         for (const collectionName of Object.keys(dataToImport)) {
             const items = dataToImport[collectionName];
             if (Array.isArray(items) && items.length > 0) {
                 let batch = fbDb.batch();
                 let count = 0;
                 for (const item of items) {
                     if (item.id) {
                         const docRef = fbDb.collection('users').doc(currentUser.uid).collection(collectionName).doc(item.id);
                         batch.set(docRef, item);
                         count++;
                         if (count >= 450) { await batch.commit(); batch = fbDb.batch(); count = 0; }
                     }
                 }
                 if (count > 0) await batch.commit();
             } else if (collectionName === 'config') {
                 await fbDb.collection('users').doc(currentUser.uid).set({ config: items }, { merge: true });
             }
         }
         
         const resultEl = select('csv-import-result');
         select('csv-import-progress').style.display = 'none';
         if(resultEl) {
             resultEl.style.display = 'block';
             resultEl.querySelector('#csv-result-title').textContent = '¡Importación Completada!';
             resultEl.querySelector('#csv-result-message').textContent = 'Los datos se han importado correctamente. La aplicación se recargará.';
         }
         
         hapticFeedback('success');
         showToast('¡Importación completada!', 'info', 4000);
         setTimeout(() => location.reload(), 4500);

     } catch (error) {
         console.error("Error en importación final desde CSV:", error);
         showToast("Error crítico durante la importación.", "danger", 5000);
         const resultEl = select('csv-import-result');
         select('csv-import-progress').style.display = 'none';
         if(resultEl) {
             resultEl.style.display = 'block';
             resultEl.querySelector('#csv-result-title').textContent = '¡Error en la Importación!';
             resultEl.querySelector('#csv-result-message').textContent = 'Ocurrió un error. Revisa la consola e inténtalo de nuevo.';
             const iconEl = resultEl.querySelector('.material-icons');
             if (iconEl) iconEl.style.color = 'var(--c-danger)';
         }
         setButtonLoading(btn, false);
     }
 };


// ==============================================================
// === INICIO: FUNCIÓN DE BORRADO OPTIMIZADA (v2.0) ===
// ==============================================================
const deleteMovementAndAdjustBalance = async (id, isRecurrent = false) => {
    const collection = isRecurrent ? 'recurrentes' : 'movimientos';
    const ANIMATION_DURATION = 400; // Debe coincidir con la duración en el CSS (0.4s)

    // Buscamos el elemento visual en el DOM ANTES de hacer cualquier cambio.
    const itemElement = document.querySelector(`.transaction-card[data-id="${id}"]`)?.closest('.swipe-container');

    try {
        // 1. ELIMINACIÓN DE DATOS (Optimista e Inmediata)
        let itemToDelete;
        if (isRecurrent) {
            const index = db.recurrentes.findIndex(r => r.id === id);
            if (index === -1) throw new Error("Recurrente no encontrado.");
            [itemToDelete] = db.recurrentes.splice(index, 1);
        } else {
            const index = db.movimientos.findIndex(m => m.id === id);
            if (index === -1) throw new Error("Movimiento no encontrado.");
            [itemToDelete] = db.movimientos.splice(index, 1);
        }

        // 2. EFECTO VISUAL (Si el elemento está en pantalla)
        if (itemElement) {
            itemElement.classList.add('item-deleting');
        }

        // 3. SINCRONIZACIÓN Y REDIBUJADO
        setTimeout(() => {
            updateLocalDataAndRefreshUI(); // Redibuja la lista virtual con los datos ya actualizados.
            if (isRecurrent) renderPlanificacionPage(); // Refresca la vista de planificación si se borra un recurrente.
        }, itemElement ? ANIMATION_DURATION : 0); // Si no hay elemento visual, el redibujado es inmediato.

        // 4. PERSISTENCIA EN BASE DE DATOS (en segundo plano)
        const batch = fbDb.batch();
        const userRef = fbDb.collection('users').doc(currentUser.uid);

        if (!isRecurrent) {
            if (itemToDelete.tipo === 'traspaso') {
                const origenRef = userRef.collection('cuentas').doc(itemToDelete.cuentaOrigenId);
                const destinoRef = userRef.collection('cuentas').doc(itemToDelete.cuentaDestinoId);
                batch.update(origenRef, { saldo: firebase.firestore.FieldValue.increment(itemToDelete.cantidad) });
                batch.update(destinoRef, { saldo: firebase.firestore.FieldValue.increment(-itemToDelete.cantidad) });
            } else {
                const cuentaRef = userRef.collection('cuentas').doc(itemToDelete.cuentaId);
                batch.update(cuentaRef, { saldo: firebase.firestore.FieldValue.increment(-itemToDelete.cantidad) });
            }
        }

        const docToDeleteRef = userRef.collection(collection).doc(id);
        batch.delete(docToDeleteRef);
        await batch.commit();

        hapticFeedback('success');
        showToast("Elemento eliminado.", "info");

    } catch (error) {
        console.error("Error al eliminar:", error);
        showToast("Error al eliminar. Recargando para mantener la consistencia...", "danger");
        setTimeout(() => location.reload(), 1500); // Recarga como último recurso.
    }
};
// ============================================================
// === FIN: FUNCIÓN DE BORRADO OPTIMIZADA ===
// ============================================================
const auditAndFixAllBalances = async (btn) => {
    if (!currentUser) {
        showToast("Debes iniciar sesión para realizar esta acción.", "danger");
        return;
    }

    setButtonLoading(btn, true, 'Auditando...');
    showToast("Iniciando recálculo de saldos... Esto puede tardar un momento.", 'info', 4000);

    try {
        const userRef = fbDb.collection('users').doc(currentUser.uid);
        const cuentasRef = userRef.collection('cuentas');
        const movimientosRef = userRef.collection('movimientos');

        const cuentasSnapshot = await cuentasRef.get();
        const newBalances = {};
        cuentasSnapshot.forEach(doc => {
            newBalances[doc.id] = 0;
        });

        const movimientosSnapshot = await movimientosRef.get();
        console.log(`Procesando ${movimientosSnapshot.size} movimientos para el recálculo.`);

        movimientosSnapshot.forEach(doc => {
            const mov = doc.data();
            if (mov.tipo === 'traspaso') {
                if (newBalances.hasOwnProperty(mov.cuentaOrigenId)) {
                    newBalances[mov.cuentaOrigenId] -= mov.cantidad;
                }
                if (newBalances.hasOwnProperty(mov.cuentaDestinoId)) {
                    newBalances[mov.cuentaDestinoId] += mov.cantidad;
                }
            } else {
                if (newBalances.hasOwnProperty(mov.cuentaId)) {
                    newBalances[mov.cuentaId] += mov.cantidad;
                }
            }
        });

        const batch = fbDb.batch();
        for (const cuentaId in newBalances) {
            const cuentaRef = cuentasRef.doc(cuentaId);
            batch.update(cuentaRef, { saldo: newBalances[cuentaId] });
        }
        
        await batch.commit();

        hapticFeedback('success');
        showToast("¡Auditoría completada! Todos los saldos han sido recalculados y actualizados.", "info", 5000);
        
        loadCoreData(currentUser.uid);

    } catch (error) {
        console.error("Error crítico durante el recálculo de saldos:", error);
        showToast("Ocurrió un error grave durante el recálculo. Revisa la consola.", "danger");
    } finally {
        setButtonLoading(btn, false);
    }
};    

const handleSaveInvestmentAccounts = async (form, btn) => {
    setButtonLoading(btn, true);
    const selectedIds = new Set(Array.from(form.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value));
    const batch = fbDb.batch();
    db.cuentas.forEach(c => {
        const ref = fbDb.collection('users').doc(currentUser.uid).collection('cuentas').doc(c.id);
        batch.update(ref, { esInversion: selectedIds.has(c.id) });
    });
    await batch.commit();
    setButtonLoading(btn, false);
    hideModal('generic-modal');
    hapticFeedback('success');
    showToast('Portafolio actualizado.');
};
const handleResetPortfolioBaseline = async (btn) => {
const investmentAccounts = getVisibleAccounts().filter(c => c.esInversion);
if (investmentAccounts.length === 0) {
    showToast("No hay activos de inversión para resetear.", "warning");
    return;
}

showConfirmationModal(
    `¿Estás seguro? Se creará una nueva valoración para ${investmentAccounts.length} activo(s), poniendo su valor al capital aportado. Esto pondrá su P&L a cero a fecha de hoy. Esta acción no se puede deshacer.`,
    async () => {
        setButtonLoading(btn, true, 'Reseteando...');
        try {
            const batch = fbDb.batch();
            const userRef = fbDb.collection('users').doc(currentUser.uid);
            const todayISO = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();

            for (const cuenta of investmentAccounts) {
                // Calculamos el capital invertido para esta cuenta específica
                const cashflows = (db.inversion_cashflows || []).filter(cf => cf.cuentaId === cuenta.id);
                const capitalInvertido = cashflows.reduce((sum, cf) => sum + cf.cantidad, 0);

                // Creamos la nueva valoración que iguala el valor al capital
                const newId = generateId();
                const newValoracion = {
                    id: newId,
                    cuentaId: cuenta.id,
                    valor: capitalInvertido, // ¡La magia está aquí!
                    fecha: todayISO
                };
                
                const docRef = userRef.collection('inversiones_historial').doc(newId);
                batch.set(docRef, newValoracion);
            }

            await batch.commit();

            hapticFeedback('success');
            showToast("¡Línea base establecida! El P&L de todos los activos ha sido reseteado a cero.", "info", 5000);
            
            // Cerramos el modal y refrescamos el portafolio para ver el cambio
            hideModal('generic-modal');
            const container = select('patrimonio-inversiones-container');
            if (container) {
                renderInversionesPage('patrimonio-inversiones-container');
            }

        } catch (error) {
            console.error("Error al resetear la línea base del portafolio:", error);
            showToast("Ocurrió un error durante el reseteo.", "danger");
        } finally {
            setButtonLoading(btn, false);
        }
    },
    "Confirmar Reseteo de P&L"
);

};

document.addEventListener('DOMContentLoaded', initApp);

const fetchMovementsInChunks = async (baseQuery, field, ids) => {
    if (ids.length === 0) {
        return [];
    }
    const idChunks = chunkArray(ids, 10);
    
    const queryPromises = idChunks.map(chunk => {
        return baseQuery.where(field, 'in', chunk).get();
    });

    const querySnapshots = await Promise.all(queryPromises);

    let movements = [];
    querySnapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
            movements.push({ id: doc.id, ...doc.data() });
        });
    });

    return movements;
};

const validateField = (id, silent = false) => {
    const input = select(id);
    if (!input) return true;

    clearError(id);
    let isValid = true;
    const value = input.value.trim();
    
    // CORRECCIÓN: Obtenemos el tipo de la misma forma que en el resto de la app
    const activeTypeButton = document.querySelector('[data-action="set-movimiento-type"].filter-pill--active');
    const type = activeTypeButton ? activeTypeButton.dataset.type : 'gasto';
    const formType = (type === 'traspaso') ? 'traspaso' : 'movimiento';


    switch (id) {
        case 'movimiento-cantidad':
            const amount = parseCurrencyString(value);
            if (isNaN(amount) || value === '') {
                displayError(id, 'Cantidad no válida.'); isValid = false;
            }
            break;
        case 'movimiento-descripcion':
            // La descripción no es obligatoria para traspasos con autocompletado
            if (formType === 'movimiento' && value === '') {
                displayError(id, 'La descripción es obligatoria.'); isValid = false;
            }
            break;
        case 'movimiento-concepto':
            if (formType === 'movimiento' && value === '') {
                displayError(id, 'El concepto es obligatorio.'); isValid = false;
            }
            break;
        case 'movimiento-cuenta':
            if (formType === 'movimiento' && value === '') {
                displayError(id, 'La cuenta es obligatoria.'); isValid = false;
            }
            break;
        case 'movimiento-cuenta-origen':
        case 'movimiento-cuenta-destino':
            if (formType === 'traspaso') {
                const origen = select('movimiento-cuenta-origen').value;
                const destino = select('movimiento-cuenta-destino').value;
                if (value === '') {
                    displayError(id, 'La cuenta es obligatoria.');
                    isValid = false;
                } else if (origen && destino && origen === destino) {
                    if (input.id === 'movimiento-cuenta-origen') {
                        displayError(id, 'No puede ser la misma cuenta destino.');
                    } else {
                        displayError(id, 'No puede ser la misma cuenta origen.');
                    }
                    isValid = false;
                }
            }
            break;
        case 'movimiento-fecha':
            if (value === '') {
                displayError(id, 'La fecha es obligatoria.'); isValid = false;
            }
            break;
        case 'new-cuenta-nombre':
        case 'new-cuenta-tipo':
        case 'edit-cuenta-nombre':
        case 'edit-cuenta-tipo':
            if (value === '') {
                displayError(id, 'Este campo es obligatorio.'); isValid = false;
            }
            break;
        case 'new-concepto-nombre':
        case 'edit-concepto-nombre':
            if (value === '') {
                displayError(id, 'Este campo es obligatorio.'); isValid = false;
            }
            break;
         case 'valoracion-valor':
            const valor = parseCurrencyString(value);
            if (isNaN(valor) || valor < 0) {
                displayError(id, 'Valor no válido. Debe ser un número positivo.'); isValid = false;
            }
            break;
        case 'valoracion-fecha':
            if (value === '') {
                displayError(id, 'La fecha es obligatoria.'); isValid = false;
            }
            break;
        case 'aportacion-cantidad':
            const aportacion = parseCurrencyString(value);
            if (isNaN(aportacion) || value === '') {
                displayError(id, 'Cantidad no válida.'); isValid = false;
            }
            break;
        case 'aportacion-fecha':
            if (value === '') {
                displayError(id, 'La fecha es obligatoria.'); isValid = false;
            }
            break;
    }

    if (!isValid && !silent) hapticFeedback('light');

    return isValid;
};

const validateMovementForm = () => {
    let isValid = true;
    
    // Obtenemos el tipo de formulario a partir del botón activo
    const selectedType = document.querySelector('[data-action="set-movimiento-type"].filter-pill--active').dataset.type;

    // Validamos los campos comunes
    if (!validateField('movimiento-cantidad')) isValid = false;
    if (!validateField('movimiento-fecha')) isValid = false;

    // Validamos los campos específicos según el tipo
    if (selectedType === 'traspaso') {
        if (!validateField('movimiento-cuenta-origen')) isValid = false;
        if (!validateField('movimiento-cuenta-destino')) isValid = false;
    } else { // para 'gasto' e 'ingreso'
        if (!validateField('movimiento-descripcion')) isValid = false;
        if (!validateField('movimiento-concepto')) isValid = false;
        if (!validateField('movimiento-cuenta')) isValid = false;
    }
    
    return isValid;
};
 
const longPressState = { timer: null, isLongPress: false };
const swipeState = { activeCard: null, startX: 0, currentX: 0, isSwiping: false, isSwipeIntent: false, threshold: 60 };

const handleInteractionStart = (e) => {
    const card = e.target.closest('.transaction-card');
    if (!card || !card.dataset.id) return;

    resetActiveSwipe();

    longPressState.isLongPress = false;
    longPressState.timer = setTimeout(() => {
        longPressState.isLongPress = true;
        swipeState.isSwiping = false;
        
        hapticFeedback('medium');
        
        showContextMenuForMovement(card.dataset.id);
        
    }, 500);

    swipeState.isSwiping = true;
    swipeState.isSwipeIntent = false;
    swipeState.activeCard = card;
    // --- INICIO DE LA MODIFICACIÓN ---
    const point = e.type === 'touchstart' ? e.touches[0] : e;
    swipeState.startX = point.clientX;
    swipeState.currentX = swipeState.startX;
    swipeState.startY = point.clientY; // <-- AÑADE ESTA LÍNEA
    // --- FIN DE LA MODIFICACIÓN ---
};


const handleInteractionMove = (e) => {
    if (!swipeState.isSwiping || !swipeState.activeCard) return;

    // --- INICIO DE LA MODIFICACIÓN ---
    const point = e.type === 'touchmove' ? e.touches[0] : e;
    const deltaX = point.clientX - swipeState.startX;
    const deltaY = point.clientY - swipeState.startY; // <-- AÑADE ESTA LÍNEA

    // Si es la primera vez que se detecta movimiento, decidimos si es scroll o swipe
    if (!swipeState.isSwipeIntent && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        // Si el movimiento es más vertical que horizontal, es un SCROLL.
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            // Cancelamos todo el proceso de swipe y dejamos que el navegador haga scroll.
            if (longPressState.timer) clearTimeout(longPressState.timer);
            swipeState.isSwiping = false;
            return;
        }
        // Si es más horizontal, es un SWIPE.
        swipeState.isSwipeIntent = true;
        if (longPressState.timer) clearTimeout(longPressState.timer);
    }
    // --- FIN DE LA MODIFICACIÓN ---

    if (swipeState.isSwipeIntent) {
        e.preventDefault(); 
        swipeState.currentX = point.clientX;
        const currentDiff = swipeState.currentX - swipeState.startX;
        
        const direction = currentDiff > 0 ? 'right' : 'left';
        const leftActions = swipeState.activeCard.parentElement.querySelector('.swipe-actions-container.left');
        const rightActions = swipeState.activeCard.parentElement.querySelector('.swipe-actions-container.right');
        const activeActions = direction === 'right' ? leftActions : rightActions;
        const inactiveActions = direction === 'right' ? rightActions : leftActions;

        if (activeActions) activeActions.classList.add('swipe-actions-container--visible');
        if (inactiveActions) inactiveActions.classList.remove('swipe-actions-container--visible');
        
        const progress = Math.min(Math.abs(currentDiff) / swipeState.threshold, 1);
        const icon = activeActions ? activeActions.querySelector('.material-icons') : null;
        if (icon) {
            icon.style.transform = `scale(${0.5 + (progress * 0.7)})`;
            icon.style.opacity = progress;
        }
        
        swipeState.activeCard.style.transition = 'none';
        swipeState.activeCard.style.transform = `translateX(${currentDiff}px)`;
    }
};
const handleInteractionEnd = (e) => {
    // Siempre limpiamos el cronómetro al soltar, por si no se había disparado.
    if (longPressState.timer) {
        clearTimeout(longPressState.timer);
        longPressState.timer = null;
    }
    
    // Si ya se ejecutó la acción de pulsación larga, no hacemos nada más.
    if (longPressState.isLongPress) {
        longPressState.isLongPress = false; // Reseteamos para la próxima vez
        return;
    }

    // El resto de tu lógica de swipe se mantiene igual.
    if (!swipeState.isSwiping || !swipeState.activeCard) return;
    
    if (swipeState.isSwipeIntent) {
        const diff = swipeState.currentX - swipeState.startX;
        swipeState.activeCard.style.transition = 'transform 0.3s ease-out';
        
        if (Math.abs(diff) > swipeState.threshold) {
            const direction = diff > 0 ? 'right' : 'left';
            const finalX = direction === 'right' ? 75 : -75;
            swipeState.activeCard.style.transform = `translateX(${finalX}px)`;
            hapticFeedback('light');
        } else {
            resetActiveSwipe();
        }
    } 

    swipeState.isSwiping = false;
    swipeState.isSwipeIntent = false;
};
const showContextMenuForMovement = (movementId) => {
    const movement = db.movimientos.find(m => m.id === movementId);
    if (!movement) return;

    const html = `
        <div style="display: flex; flex-direction: column; gap: var(--sp-2);">
            <button class="btn btn--secondary btn--full" data-action="context-edit" data-id="${movementId}">
                <span class="material-icons">edit</span> Editar Movimiento
            </button>
            <button class="btn btn--secondary btn--full" data-action="context-duplicate" data-id="${movementId}">
                <span class="material-icons">content_copy</span> Duplicar
            </button>
            <button class="btn btn--danger btn--full" data-action="context-delete" data-id="${movementId}">
                <span class="material-icons">delete</span> Eliminar
            </button>
        </div>
    `;
    
    // Usamos el modal genérico para mostrar las opciones
    showGenericModal(`Acciones para: ${movement.descripcion}`, html);
};
// Asegúrate de que tu función resetActiveSwipe también oculte las acciones
const resetActiveSwipe = () => {
if (swipeState.activeCard) {
swipeState.activeCard.style.transition = 'transform 0.3s ease-out';
swipeState.activeCard.style.transform = 'translateX(0px)';
// También nos aseguramos de ocultar las acciones aquí
const parent = swipeState.activeCard.parentElement;
parent.querySelector('.swipe-actions-container.left')?.classList.remove('swipe-actions-container--visible');
parent.querySelector('.swipe-actions-container.right')?.classList.remove('swipe-actions-container--visible');
}
swipeState.activeCard = null;
};

const handleDescriptionInput = () => {
    clearTimeout(descriptionSuggestionDebounceTimer);
    descriptionSuggestionDebounceTimer = setTimeout(() => {
        const descriptionInput = select('movimiento-descripcion');
        const suggestionsBox = select('description-suggestions');
        if (!descriptionInput || !suggestionsBox) return;

        const query = descriptionInput.value.trim().toLowerCase();
        suggestionsBox.innerHTML = '';

        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        // 1. Busca las mejores sugerencias basadas en tus hábitos
        const suggestions = [];
        for (const [desc, data] of intelligentIndex.entries()) {
            if (desc.includes(query)) {
                suggestions.push({ description: desc, ...data });
            }
        }

        const now = Date.now();
        suggestions.sort((a, b) => {
            const recencyA = Math.exp((a.lastUsed - now) / (1000 * 3600 * 24 * 30));
            const recencyB = Math.exp((b.lastUsed - now) / (1000 * 3600 * 24 * 30));
            const scoreA = (a.count * 0.6) + (recencyA * 0.4);
            const scoreB = (b.count * 0.6) + (recencyB * 0.4);
            return scoreB - scoreA;
        });

        const topSuggestion = suggestions[0];
        const conceptoSelect = select('movimiento-concepto');
        const cuentaSelect = select('movimiento-cuenta');

        // ==========================================================
        // ===        ✨ ¡LA MAGIA DEL COPILOTO SUCEDE AQUÍ! ✨      ===
        // ==========================================================
        if (topSuggestion) {
            // 2. Si lo que escribes coincide con el inicio de tu mejor sugerencia...
            if (topSuggestion.description.startsWith(query) && topSuggestion.description.length > query.length) {
                
                // 3. ...y si el campo "Concepto" está vacío, ¡lo rellenamos por ti!
                if (!conceptoSelect.value && conceptoSelect.querySelector(`option[value="${topSuggestion.conceptoId}"]`)) {
                    conceptoSelect.value = topSuggestion.conceptoId;
                    
                    // Animación para que veas lo que ha pasado
                    const parent = conceptoSelect.closest('.form-group-addon');
                    if(parent) {
                        parent.classList.add('field-highlighted');
                        setTimeout(() => parent.classList.remove('field-highlighted'), 1500);
                    }
                }
                
                // 4. ...y hacemos lo mismo con el campo "Cuenta".
                if (!cuentaSelect.value && cuentaSelect.querySelector(`option[value="${topSuggestion.cuentaId}"]`)) {
                    cuentaSelect.value = topSuggestion.cuentaId;

                    // Animación para que veas lo que ha pasado
                    const parent = cuentaSelect.closest('.form-group-addon');
                    if(parent) {
                        parent.classList.add('field-highlighted');
                        setTimeout(() => parent.classList.remove('field-highlighted'), 1500);
                    }
                }
            }
            
            // ==========================================================
            // ===                FIN DE LA MAGIA                     ===
            // ==========================================================

            // 5. El resto del código simplemente muestra la lista de sugerencias, como ya hacía antes.
            suggestionsBox.innerHTML = suggestions.slice(0, DESCRIPTION_SUGGESTION_LIMIT).map(s => {
                const concepto = db.conceptos.find(c => c.id === s.conceptoId)?.nombre || 'S/C';
                const cuenta = db.cuentas.find(c => c.id === s.cuentaId)?.nombre || 'S/C';
                return `
                    <div class="suggestion-item" 
                         data-action="apply-description-suggestion"
                         data-description="${escapeHTML(s.description)}" 
                         data-concepto-id="${s.conceptoId}" 
                         data-cuenta-id="${s.cuentaId}"
                         tabindex="0">
                        <p>${escapeHTML(toSentenceCase(s.description))}</p>
                        <small>${escapeHTML(concepto)} • ${escapeHTML(cuenta)}</small>
                    </div>`;
            }).join('');
            suggestionsBox.style.display = 'block';
        } else {
            suggestionsBox.style.display = 'none';
        }
    }, 250);
};
// EN main.js - AÑADE ESTO AL FINAL DEL FICHERO

// --- REGISTRO DEL SERVICE WORKER ---
// Comprobamos si el navegador soporta Service Workers
if ('serviceWorker' in navigator) {
  // Usamos el evento 'load' para no retrasar la carga inicial de la app
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(error => {
        console.log('Fallo en el registro del Service Worker:', error);
      });
  });
}

const renderAjustesPage = () => {
    const container = select(PAGE_IDS.AJUSTES);
    if (!container) return;

    // Estructura HTML de la nueva página de Ajustes
    container.innerHTML = `
        <div class="card card--no-bg accordion-wrapper" style="padding: 0 var(--sp-4);">

            <!-- Grupo 1: Gestión de Datos -->
            <h3 class="settings-group__title">Gestión de Datos</h3>
            <div class="card" style="margin-bottom: var(--sp-4);">
                <div class="card__content" style="padding: 0;">
                    <button class="settings-item" data-action="manage-cuentas">
                        <span class="material-icons">account_balance_wallet</span>
                        <span class="settings-item__label">Gestionar Cuentas</span>
                        <span class="material-icons">chevron_right</span>
                    </button>
                    <button class="settings-item" data-action="manage-conceptos">
                        <span class="material-icons">label</span>
                        <span class="settings-item__label">Gestionar Conceptos</span>
                        <span class="material-icons">chevron_right</span>
                    </button>
                </div>
            </div>

            <!-- Grupo 2: Copias de Seguridad y Migración -->
            <h3 class="settings-group__title">Copias de Seguridad y Migración</h3>
            <div class="card" style="margin-bottom: var(--sp-4);">
                <div class="card__content" style="padding: 0;">
                    <button class="settings-item" data-action="export-data">
                        <span class="material-icons text-positive">cloud_upload</span>
                        <span class="settings-item__label">Exportar Copia de Seguridad (JSON)</span>
                        <span class="material-icons">chevron_right</span>
                    </button>
                     <button class="settings-item" data-action="export-csv">
                        <span class="material-icons text-positive">description</span>
                        <span class="settings-item__label">Exportar a CSV (Excel)</span>
                        <span class="material-icons">chevron_right</span>
                    </button>
                    <button class="settings-item" data-action="import-data">
                        <span class="material-icons text-warning">cloud_download</span>
                        <span class="settings-item__label">Importar Copia de Seguridad (JSON)</span>
                        <span class="material-icons">chevron_right</span>
                    </button>
                    <button class="settings-item" data-action="import-csv">
                         <span class="material-icons text-warning">grid_on</span>
                        <span class="settings-item__label">Importar desde CSV</span>
                        <span class="material-icons">chevron_right</span>
                    </button>
                </div>
            </div>
            
            <!-- Grupo 3: Seguridad y Cuenta -->
            <h3 class="settings-group__title">Seguridad y Cuenta</h3>
            <div class="card" style="margin-bottom: var(--sp-4);">
                <div class="card__content" style="padding: 0;">
                    <div class="settings-item">
                        <span class="material-icons">alternate_email</span>
                        <span id="config-user-email" class="settings-item__label">Cargando...</span>
                    </div>
                    <button class="settings-item" data-action="set-pin">
                        <span class="material-icons">pin</span>
                        <span class="settings-item__label">Configurar PIN de acceso rápido</span>
                        <span class="material-icons">chevron_right</span>
                    </button>
                    <button class="settings-item" data-action="logout">
                        <span class="material-icons text-danger">logout</span>
                        <span class="settings-item__label text-danger">Cerrar Sesión</span>
                    </button>
                </div>
            </div>

        </div>
    `;
    
    // Esta función es necesaria para que se muestre tu email
    loadConfig();
};
