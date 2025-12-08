
import { addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears } from 'https://cdn.jsdelivr.net/npm/date-fns@2.29.3/+esm';
const KPI_EXPLANATIONS = {
    'patrimonio': { title: 'Patrimonio Neto', text: 'Es el valor real de tu riqueza hoy.<br><br><strong>Fórmula:</strong><br>(Dinero en Bancos + Inversiones + Propiedades) - (Deudas de Tarjetas + Préstamos pendientes).' },
    'liquidez': { title: 'Liquidez', text: 'Dinero disponible para gastar inmediatamente.<br><br>Suma de todas las cuentas tipo <strong>Banco</strong> y <strong>Efectivo</strong>.' },
    'invertido': { title: 'Capital Invertido', text: 'Dinero total que has sacado de tu bolsillo para poner en cuentas de Inversión. No incluye lo que has ganado o perdido después.' },
    'ingresos': { title: 'Ingresos del Periodo', text: 'Dinero nuevo que ha entrado en tus cuentas en las fechas seleccionadas.<br><br>No cuenta traspasos entre tus propias cuentas.' },
    'gastos': { title: 'Gastos del Periodo', text: 'Dinero que ha salido de tus cuentas en las fechas seleccionadas hacia terceros (compras, facturas, etc.).' },
    'neto': { title: 'Flujo Neto (Ahorro)', text: 'La diferencia real entre lo que ganaste y lo que gastaste.<br><br><strong>Ingresos - Gastos</strong><br>Si es positivo, tu riqueza ha aumentado.' },
    'rentabilidad': { title: 'Rentabilidad (TIR)', text: 'Tasa Interna de Retorno. Es la métrica más precisa: calcula cuánto rinde tu dinero anualmente teniendo en cuenta <em>cuándo</em> lo invertiste.' },
    'pnl': { title: 'Ganancia/Pérdida (P&L)', text: 'Profit & Loss (Ganancias y Pérdidas).<br><br><strong>Valor de Mercado Actual - Capital Invertido</strong><br>Es el dinero "gratis" que has ganado (o perdido) con tus inversiones.' },
    'tasa_ahorro': { title: 'Tasa de Ahorro', text: 'Porcentaje de tus ingresos que has logrado conservar.<br><br><strong>(Ahorro Neto / Ingresos) × 100</strong>.' },
    'cobertura': { title: 'Cobertura (Runway)', text: 'Si hoy dejaras de tener ingresos, ¿cuántos meses podrías vivir con tu liquidez actual?<br><br>Basado en tu gasto medio mensual de los últimos 3 meses.' },
    'libertad': { title: 'Independencia Financiera', text: 'Tu progreso hacia la libertad total.<br><br>Calculado sobre la "Regla del 4%": Necesitas acumular 25 veces tus gastos anuales para vivir de las rentas.' }
};
const setupEnhancedFormNavigation = () => {
    const inputs = [
        { id: 'movimiento-cantidad', next: 'movimiento-concepto' },
        { id: 'movimiento-descripcion', next: 'movimiento-cuenta' },
        { id: 'movimiento-cuenta', next: 'save-movimiento-btn' }
    ];
    
    inputs.forEach(({id, next}, index) => {
        const input = select(id);
        if (!input) return;
        
        input.addEventListener('keydown', (e) => {
            // Enter para avanzar
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                
                if (next === 'save-movimiento-btn') {
                    select(next)?.click();
                } else {
                    // Para selects personalizados
                    const wrapper = select(next)?.closest('.custom-select-wrapper');
                    const trigger = wrapper?.querySelector('.custom-select__trigger');
                    trigger?.focus();
                    trigger?.click();
                }
            }
            
            // Shift+Enter para retroceder
            if (e.key === 'Enter' && e.shiftKey && index > 0) {
                e.preventDefault();
                select(inputs[index-1].id)?.focus();
            }
            
            // Escape para limpiar/cancelar
            if (e.key === 'Escape') {
                if (id === 'movimiento-cantidad') {
                    input.value = '';
                    handleCalculatorInput('clear');
                }
            }
        });
    });
    
    // Autofocus en cantidad al abrir el formulario
    const movimientoForm = select('movimiento-form');
    movimientoForm?.addEventListener('shown', () => {
        setTimeout(() => select('movimiento-cantidad')?.focus(), 100);
    });
};
const setupRealTimeValidation = () => {
    const cantidadInput = select('movimiento-cantidad');
    const cuentaSelect = select('movimiento-cuenta');
    const errorContainer = select('movimiento-form-errors');
    
    if (!cantidadInput || !errorContainer) return;
    
    const showFieldError = (message, fieldId) => {
        // Eliminar error previo
        errorContainer.querySelector(`[data-field="${fieldId}"]`)?.remove();
        
        if (message) {
            const errorEl = document.createElement('div');
            errorEl.className = 'form-error';
            errorEl.dataset.field = fieldId;
            errorEl.textContent = message;
            errorContainer.appendChild(errorEl);
        }
    };
    
    // Validar cantidad
    cantidadInput.addEventListener('input', () => {
        const value = parseCurrencyString(cantidadInput.value);
        if (isNaN(value) || value === 0) {
            showFieldError('El importe no es válido', 'cantidad');
        } else {
            showFieldError('', 'cantidad');
        }
    });
    
    // Validar cuenta
    cuentaSelect.addEventListener('change', () => {
        if (!cuentaSelect.value) {
            showFieldError('Selecciona una cuenta', 'cuenta');
        } else {
            showFieldError('', 'cuenta');
        }
    });
};
const showRenameLedgersModal = () => {
    const names = db.config.ledgerNames || { A: "Personal", B: "Ahorro", C: "Extra" };
    
    const html = `
    <form id="rename-ledgers-form" novalidate>
        <p class="form-label" style="margin-bottom: var(--sp-3);">
            Asigna nombres familiares a tus contabilidades para identificarlas mejor.
        </p>
        
        <div class="form-group">
            <label class="form-label" style="color: var(--c-primary);">Caja A (Principal)</label>
            <input type="text" id="input-ledger-name-A" class="form-input" value="${escapeHTML(names.A)}" placeholder="Ej: Personal" maxlength="12" required>
        </div>

        <div class="form-group">
            <label class="form-label" style="color: var(--c-danger);">Caja B (Secundaria)</label>
            <input type="text" id="input-ledger-name-B" class="form-input" value="${escapeHTML(names.B)}" placeholder="Ej: Negocio" maxlength="12" required>
        </div>

        <div class="form-group">
            <label class="form-label" style="color: var(--c-success);">Caja C (Extra)</label>
            <input type="text" id="input-ledger-name-C" class="form-input" value="${escapeHTML(names.C)}" placeholder="Ej: Hucha" maxlength="12" required>
        </div>

        <div class="modal__actions">
            <button type="submit" class="btn btn--primary btn--full">Guardar Nombres</button>
        </div>
    </form>`;

    showGenericModal('Personalizar Cajas', html);
};

const handleSaveLedgerNames = async (btn) => {
    setButtonLoading(btn, true);
    
    const newNames = {
        A: select('input-ledger-name-A').value.trim() || "Caja A",
        B: select('input-ledger-name-B').value.trim() || "Caja B",
        C: select('input-ledger-name-C').value.trim() || "Caja C"
    };

    // Actualizar local
    if (!db.config) db.config = {};
    db.config.ledgerNames = newNames;

    // Guardar en Firebase
    await fbDb.collection('users').doc(currentUser.uid).set({ config: db.config }, { merge: true });

    // Actualizar el botón de la barra superior inmediatamente
    const ledgerBtn = select('ledger-toggle-btn');
    if (ledgerBtn) {
        ledgerBtn.textContent = getLedgerName(currentLedger);
    }

    setButtonLoading(btn, false);
    hideModal('generic-modal');
    hapticFeedback('success');
    showToast('Nombres actualizados correctamente.');
};
const optimizeMobileInputExperience = () => {
    const cantidadInput = select('movimiento-cantidad');
    const isTouch = 'ontouchstart' in window;
    
    if (!isTouch || !cantidadInput) return;
    
    // Reducir la altura de la calculadora en móvil
    const calculator = select('calculator-container');
    if (calculator) {
        calculator.style.maxHeight = '50vh';
        calculator.style.overflowY = 'auto';
    }
    
    // Mejorar el foco en móvil
    cantidadInput.addEventListener('focus', () => {
        setTimeout(() => {
            cantidadInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
    
    // Input numérico nativo para móviles como fallback
    cantidadInput.setAttribute('inputmode', 'decimal');
    cantidadInput.setAttribute('pattern', '[0-9,.-]*');
};
const setupSmartConceptSuggestions = () => {
    const descripcionInput = select('movimiento-descripcion');
    const conceptoSelect = select('movimiento-concepto');
    
    if (!descripcionInput || !conceptoSelect) return;
    
    // Cache de conceptos usados frecuentemente
    const conceptUsage = new Map();
    
    descripcionInput.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase();
        if (text.length < 2) return;
        
        // Buscar conceptos similares en movimientos recientes
        const recentWithSameDesc = recentMovementsCache
            .filter(m => m.descripcion?.toLowerCase().includes(text))
            .slice(0, 5);
        
        if (recentWithSameDesc.length > 0) {
            // Encontrar concepto más usado para esta descripción
            const conceptCounts = new Map();
            recentWithSameDesc.forEach(m => {
                const count = conceptCounts.get(m.conceptoId) || 0;
                conceptCounts.set(m.conceptoId, count + 1);
            });
            
            const mostUsed = [...conceptCounts.entries()].sort((a,b) => b[1]-a[1])[0];
            if (mostUsed) {
                // Auto-seleccionar concepto
                conceptoSelect.value = mostUsed[0];
                conceptoSelect.dispatchEvent(new Event('change'));
            }
        }
    });
};
// Limpiar memoria después de añadir movimiento
const cleanupAfterMovementSave = () => {
    // Reset del formulario
    select('movimiento-form')?.reset();
    
    // Liberar memoria de la caché de movimientos
    if (allDiarioMovementsCache.length > 1000) {
        allDiarioMovementsCache = allDiarioMovementsCache.slice(-500);
    }
    
    // Forzar recálculo de balances si hay muchos movimientos
    if (db.movimientos.length > 500) {
        setTimeout(() => processMovementsForRunningBalance(db.movimientos, true), 1000);
    }
};
const setupQuickAddMode = () => {
    // Botón para añadir rápido (pantalla principal)
    const quickAddBtn = document.createElement('button');
    quickAddBtn.className = 'floating-action-btn';
    quickAddBtn.innerHTML = '<span class="material-icons">add</span>';
    quickAddBtn.title = 'Añadir movimiento rápido';
    quickAddBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 16px;
        width: 56px;
        height: 56px;
        border-radius: 28px;
        background: var(--c-primary);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(quickAddBtn);
    
    quickAddBtn.addEventListener('click', () => {
        // Abrir modal simplificado
        showModal('quick-add-modal');
        
        // Configurar valores por defecto del día
        const today = new Date().toISOString().split('T')[0];
        const defaultConcept = db.conceptos.find(c => c.nombre === 'VARIOS')?.id;
        const defaultAccount = getLiquidAccounts()[0]?.id;
        
        // Rellenar valores
        if (defaultConcept) select('quick-concepto').value = defaultConcept;
        if (defaultAccount) select('quick-cuenta').value = defaultAccount;
        select('quick-fecha').value = today;
        
        // Enfocar cantidad
        setTimeout(() => select('quick-cantidad')?.focus(), 100);
    });
};
const renderInformeCuentaRow = (mov, cuentaId, allCuentas) => {
    const fecha = new Date(mov.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
    let cargo = '';
    let abono = '';
    let conceptoTexto = '';
    
    // Si estamos en modo GLOBAL (cuentaId es null), mostramos el nombre de la cuenta
    const isGlobal = cuentaId === null;
    const cuentaPropia = isGlobal ? allCuentas.find(c => c.id === mov.cuentaId) : null;
    const prefixCuenta = cuentaPropia ? `[${cuentaPropia.nombre}] ` : '';

    // Lógica de importes y descripciones
    if (mov.tipo === 'traspaso') {
        // En modo global, el traspaso interno se anula visualmente o se muestra neutro
        // pero vamos a mantener la lógica relativa para mostrar flujo.
        const esOrigen = mov.cuentaOrigenId === cuentaId || (isGlobal && mov.cantidad < 0); // Simplificación
        
        const origen = allCuentas.find(c => c.id === mov.cuentaOrigenId);
        const destino = allCuentas.find(c => c.id === mov.cuentaDestinoId);
        
        const nombreOrigen = origen ? escapeHTML(origen.nombre) : '?';
        const nombreDestino = destino ? escapeHTML(destino.nombre) : '?';
        
        conceptoTexto = `TRASPASO: ${nombreOrigen} -> ${nombreDestino}`;
        
        // En extracto global, un traspaso interno no afecta al saldo neto global,
        // pero lo mostramos en la columna que corresponda al signo para referencia.
        if (mov.cantidad < 0) cargo = formatCurrency(Math.abs(mov.cantidad));
        else abono = formatCurrency(mov.cantidad);

        if (mov.descripcion && mov.descripcion !== 'Traspaso') {
            conceptoTexto += ` (${escapeHTML(mov.descripcion)})`;
        }
    } else {
        // Movimiento normal
        const concepto = db.conceptos.find(c => c.id === mov.conceptoId);
        const nombreConcepto = concepto ? concepto.nombre.toUpperCase() : 'VARIO';
        
        // En modo global añadimos el nombre de la cuenta al principio
        conceptoTexto = `${prefixCuenta}${nombreConcepto}`;
        if (mov.descripcion) conceptoTexto += ` - ${escapeHTML(mov.descripcion)}`;

        if (mov.cantidad < 0) {
            cargo = formatCurrency(Math.abs(mov.cantidad));
        } else {
            abono = formatCurrency(mov.cantidad);
        }
    }

    return `
        <div class="cartilla-row">
            <div class="cartilla-cell cartilla-date">${fecha}</div>
            <div class="cartilla-cell cartilla-concept">${conceptoTexto}</div>
            <div class="cartilla-cell cartilla-amount text-debit">${cargo}</div>
            <div class="cartilla-cell cartilla-amount text-credit">${abono}</div>
            <div class="cartilla-cell cartilla-balance">${formatCurrency(mov.runningBalance)}</div>
        </div>
    `;
};

const handleGenerateInformeCuenta = async (form, btn = null) => {
    // 1. Solo activamos la animación del botón si se proporciona (ahora es opcional)
    if (btn) setButtonLoading(btn, true, 'Imprimiendo...');
    
    const cuentaId = select('informe-cuenta-select').value;
    const resultadoContainer = select('informe-resultado-container');

    // 2. Si no hay cuenta seleccionada, limpiamos y salimos
    if (!cuentaId) {
        resultadoContainer.innerHTML = '';
        if (btn) setButtonLoading(btn, false);
        return;
    }

    // 3. Mostramos un indicador de carga en el contenedor de resultados
    resultadoContainer.innerHTML = `
        <div style="text-align:center; padding: var(--sp-5);">
            <span class="spinner" style="color:var(--c-primary); width: 24px; height:24px;"></span>
            <p style="font-size:var(--fs-xs); margin-top:8px; color:var(--c-on-surface-secondary);">Cargando movimientos...</p>
        </div>`;

    const cuenta = db.cuentas.find(c => c.id === cuentaId);

    try {
        // --- Obtención y cálculo de datos (IGUAL QUE ANTES) ---
        const todosLosMovimientos = await fetchAllMovementsForHistory();
        
        let movimientosDeLaCuenta = todosLosMovimientos.filter(m =>
            (m.cuentaId === cuentaId) || (m.cuentaOrigenId === cuentaId) || (m.cuentaDestinoId === cuentaId)
        );

        if (movimientosDeLaCuenta.length === 0) {
             resultadoContainer.innerHTML = `<div class="empty-state" style="background:transparent; border:none; padding:var(--sp-4);"><p>Sin movimientos registrados.</p></div>`;
             if (btn) setButtonLoading(btn, false);
             return;
        }

        movimientosDeLaCuenta.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        let saldoAcumulado = 0;
        for (const mov of movimientosDeLaCuenta) {
            let impacto = 0;
            if (mov.tipo === 'traspaso') {
                if (mov.cuentaOrigenId === cuentaId) impacto = -mov.cantidad;
                if (mov.cuentaDestinoId === cuentaId) impacto = mov.cantidad;
            } else {
                impacto = mov.cantidad;
            }
            saldoAcumulado += impacto;
            mov.runningBalance = saldoAcumulado;
        }

        movimientosDeLaCuenta.reverse(); 

        // --- Renderizado HTML ---
        let html = `
            <div class="cartilla-container">
                <div class="cartilla-header-info">
                    <h4>EXTRACTO DE CUENTA</h4>
                    <p><strong>Titular:</strong> ${escapeHTML(cuenta.nombre)}</p>
                    <p class="cartilla-print-date">Fecha: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="cartilla-table">
                    <div class="cartilla-row cartilla-head">
                        <div class="cartilla-cell">FECHA</div>
                        <div class="cartilla-cell">CONCEPTO</div>
                        <div class="cartilla-cell text-right">CARGOS</div>
                        <div class="cartilla-cell text-right">ABONOS</div>
                        <div class="cartilla-cell text-right">SALDO</div>
                    </div>`;
                
        for (const mov of movimientosDeLaCuenta) {
            html += renderInformeCuentaRow(mov, cuentaId, db.cuentas);
        }
        
        html += `</div><div class="cartilla-footer">** FIN DEL EXTRACTO **</div></div>`;
        resultadoContainer.innerHTML = html;

    } catch (error) {
        console.error(error);
        showToast("Error generando el extracto.", "danger");
        resultadoContainer.innerHTML = `<div class="empty-state text-danger"><p>Error al cargar datos.</p></div>`;
    } finally {
        if (btn) setButtonLoading(btn, false);
    }
};
const handleGenerateGlobalExtract = async (btn = null) => {
    const resultadoContainer = select('informe-resultado-container');
    if (!resultadoContainer) return;

    // Si viene de un botón, mostramos estado de carga
    if (btn) setButtonLoading(btn, true, 'Procesando...');
    else hapticFeedback('medium');
    
    // Limpiamos el selector de cuenta individual para evitar confusión
    const selectCuenta = select('informe-cuenta-select');
    if (selectCuenta) {
        selectCuenta.value = "";
        // Reset visual del custom select
        const wrapper = selectCuenta.closest('.custom-select-wrapper');
        const trigger = wrapper?.querySelector('.custom-select__trigger');
        if(trigger) trigger.innerHTML = `<span style="color: var(--c-on-surface-tertiary); opacity: 0.7;">Seleccionar cuenta...</span>`;
    }

    resultadoContainer.innerHTML = `
        <div style="text-align:center; padding: var(--sp-5);">
            <span class="spinner" style="color:var(--c-primary); width: 24px; height:24px;"></span>
            <p style="font-size:var(--fs-xs); margin-top:8px; color:var(--c-on-surface-secondary);">
                Consolidando movimientos por fecha...
            </p>
        </div>`;

    try {
        // 1. Obtener datos
        const allMovements = await fetchAllMovementsForHistory();
        const saldos = await getSaldos();
        
        // 2. Calcular Patrimonio Neto Actual (Punto de partida)
        let currentGlobalBalance = Object.values(saldos).reduce((sum, s) => sum + s, 0);
        
        // 3. Filtrar movimientos de la contabilidad visible
        const visibleAccountIds = new Set(getVisibleAccounts().map(c => c.id));
        
        let globalMovements = allMovements.filter(m => {
            if (m.tipo === 'traspaso') {
                return visibleAccountIds.has(m.cuentaOrigenId) || visibleAccountIds.has(m.cuentaDestinoId);
            }
            return visibleAccountIds.has(m.cuentaId);
        });

        // 4. ORDENAR POR FECHA (Reciente -> Antiguo)
        globalMovements.sort((a, b) => {
            const dateDiff = new Date(b.fecha) - new Date(a.fecha);
            if (dateDiff !== 0) return dateDiff;
            return b.id.localeCompare(a.id);
        });

        // 5. Calcular Saldos Históricos (Running Balance Inverso)
        let runningBalance = currentGlobalBalance;

        for (const mov of globalMovements) {
            mov.runningBalance = runningBalance; 

            let impact = 0;
            if (mov.tipo === 'traspaso') {
                const origenVisible = visibleAccountIds.has(mov.cuentaOrigenId);
                const destinoVisible = visibleAccountIds.has(mov.cuentaDestinoId);
                
                // Calculamos impacto neto en el patrimonio visible
                if (origenVisible && !destinoVisible) impact = -mov.cantidad; // Sale
                else if (!origenVisible && destinoVisible) impact = mov.cantidad; // Entra
                
                // Ajuste visual: Sobrescribimos cantidad para que se pinte en la columna correcta
                mov.cantidad = impact; 
                
            } else {
                impact = mov.cantidad;
            }

            // Restamos el impacto para saber el saldo anterior
            runningBalance -= impact;
        }

        // 6. Renderizar HTML (AQUÍ ESTABA EL ERROR)
        // Hemos cambiado 'isOffBalanceMode' por 'getLedgerName(currentLedger)'
        let html = `
            <div class="cartilla-container" style="border-top: 4px solid var(--c-primary);">
                <div class="cartilla-header-info">
                    <h4 style="color: var(--c-primary);">LIBRO MAYOR GLOBAL</h4>
                    <p><strong>Contabilidad:</strong> ${getLedgerName(currentLedger)}</p>
                    <p class="cartilla-print-date">Ordenado por fecha · ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="cartilla-table">
                    <div class="cartilla-row cartilla-head">
                        <div class="cartilla-cell">FECHA</div>
                        <div class="cartilla-cell">CUENTA / CONCEPTO</div>
                        <div class="cartilla-cell text-right">CARGOS</div>
                        <div class="cartilla-cell text-right">ABONOS</div>
                        <div class="cartilla-cell text-right">GLOBAL</div>
                    </div>`;
                
        for (const mov of globalMovements) {
            // Pasamos null como cuentaId para activar el modo Global
            html += renderInformeCuentaRow(mov, null, db.cuentas);
        }
        
        html += `</div>
            <div class="cartilla-footer">
                ** FIN DEL INFORME **
            </div>
        </div>`;

        resultadoContainer.innerHTML = html;
        showToast("Extracto Global generado.", "success");

    } catch (error) {
        console.error(error);
        resultadoContainer.innerHTML = `<div class="empty-state text-danger"><p>Error al calcular.</p></div>`;
    } finally {
        if (btn) setButtonLoading(btn, false);
    }
};

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

const firebaseConfig = { apiKey: "AIzaSyAp-t-2qmbvSX-QEBW9B1aAJHBESqnXy9M", authDomain: "cuentas-aidanai.firebaseapp.com", projectId: "cuentas-aidanai", storageBucket: "cuentas-aidanai.appspot.com", messagingSenderId: "58244686591", appId: "1:58244686591:web:85c87256c2287d350322ca" };
const PAGE_IDS = {
    PANEL: 'panel-page',
    DIARIO: 'diario-page',
    PATRIMONIO: 'patrimonio-page',
    PLANIFICAR: 'planificar-page',
    AJUSTES: 'ajustes-page',
};

const THEMES = {
    'default': { name: 'Abismo Digital', icon: 'dark_mode' },
    'sunset-groove': { name: 'Brisa Alpina', icon: 'light_mode' }
};

// ▼▼▼ REEMPLAZAR TU FUNCIÓN updateAnalisisWidgets CON ESTA VERSIÓN SIMPLIFICADA ▼▼▼
const updateAnalisisWidgets = async () => {
    try {
        // Renderiza y calcula Colchón de Emergencia e Independencia Financiera
        const saldos = await getSaldos();
        const patrimonioNeto = Object.values(saldos).reduce((sum, s) => sum + s, 0);
        const efData = calculateEmergencyFund(saldos, db.cuentas, recentMovementsCache);
        const fiData = calculateFinancialIndependence(patrimonioNeto, efData.gastoMensualPromedio);

        // Colchón de Emergencia
        const efContainer = document.querySelector('[data-widget-type="emergency-fund"]');
        if (efContainer) {
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
        savedReports: {} // <-- AÑADIDO: para guardar la configuración de los informes
    } 
});
		// ▼▼▼ PEGA ESTE BLOQUE DE CÓDIG
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
		let userHasInteracted = false;
		let ptrState = {
			startY: 0,
			isPulling: false,
			distance: 0,
			threshold: 80 // Distancia en píxeles que hay que arrastrar para que se active
		};
		let calculatorKeyboardHandler = null;
		let deselectedInvestmentTypesFilter = new Set();
		let selectedInvestmentTypeFilter = null;
		let syncState = 'synced'; 
		let currentLedger = 'A'; // Valores posibles: 'A', 'B', 'C'
		let portfolioViewMode = 'EUR'; // 'EUR' o 'BTC'
		let btcPriceData = { price: 0, lastUpdated: null };

			// Helper para formatear BTC
			const formatBTC = (amount) => {
				return '₿ ' + new Intl.NumberFormat('en-US', { 
					minimumFractionDigits: 4, 
					maximumFractionDigits: 6 
					}).format(amount);
				};
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
    historyValue: '', // Guarda la operación en curso
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
const fetchBtcPrice = async () => {
    // Evitar llamadas excesivas (cache de 60 segundos)
    const now = Date.now();
    if (btcPriceData.lastUpdated && (now - btcPriceData.lastUpdated < 60000)) {
        return btcPriceData.price;
    }

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        const data = await response.json();
        if (data && data.bitcoin && data.bitcoin.eur) {
            btcPriceData.price = data.bitcoin.eur;
            btcPriceData.lastUpdated = now;
            return data.bitcoin.eur;
        }
    } catch (error) {
        console.error("Error al obtener precio BTC:", error);
        showToast("No se pudo actualizar el precio de BTC", "warning");
    }
    return btcPriceData.price || 0; // Retorna 0 o el último precio conocido si falla
};
const handleCalculatorInput = (key) => {
    hapticFeedback('light');
    let { displayValue, waitingForNewValue, operand1, operator, isResultDisplayed, historyValue } = calculatorState;
    
    // Reset si venimos de un resultado y se escribe número
    if (isResultDisplayed && !['add', 'subtract', 'multiply', 'divide', 'sign'].includes(key)) {
        displayValue = '0';
        isResultDisplayed = false;
        historyValue = ''; 
    }

    const isOperator = ['add', 'subtract', 'multiply', 'divide'].includes(key);

    if (isOperator) {
        if (operand1 !== null && operator !== null && !waitingForNewValue) {
            calculate();
            displayValue = calculatorState.displayValue; 
        }
        operand1 = parseFloat(displayValue.replace(',', '.'));
        operator = key;
        // Mostramos la operación en la barrita pequeña de historial
        historyValue = `${displayValue} ${getOperatorSymbol(operator)}`;
        waitingForNewValue = true;
        isResultDisplayed = false;
    } else {
        switch(key) {
            case 'done':
                hapticFeedback('medium');
                // Calcular final si hay pendiente
                if (operand1 !== null && operator !== null && !waitingForNewValue) {
                    calculate();
                    displayValue = calculatorState.displayValue;
                }
                
                // Actualizar input final
                updateTargetInput(displayValue);
                
                historyValue = '';
                hideCalculator(); 

                // --- AVANCE AUTOMÁTICO AL SIGUIENTE CAMPO ---
                // Al dar OK, pasamos al concepto automáticamente
                setTimeout(() => {
                    const conceptoSelect = document.getElementById('movimiento-concepto');
                    // Buscamos el trigger del custom select
                    const wrapper = conceptoSelect?.closest('.custom-select-wrapper');
                    const trigger = wrapper?.querySelector('.custom-select__trigger');
                    
                    if (trigger) {
                        trigger.focus(); // Enfocar para navegación teclado
                        trigger.click(); // Abrir el menú
                    }
                }, 100); 
                return;

            case 'comma':
                if (waitingForNewValue) { displayValue = '0,'; waitingForNewValue = false; } 
                else if (!displayValue.includes(',')) displayValue += ',';
                break;

            case 'clear': 
                displayValue = '0'; waitingForNewValue = true; operand1 = null; operator = null; isResultDisplayed = false; historyValue = '';
                break;

            case 'backspace': 
                displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : '0';
                if (displayValue === '0') waitingForNewValue = true;
                break;

            case 'sign': 
                if (displayValue !== '0') displayValue = displayValue.startsWith('-') ? displayValue.slice(1) : `-${displayValue}`; 
                break;

            default: // Dígitos (0-9)
                if (waitingForNewValue || displayValue === '0') {
                    displayValue = key;
                    waitingForNewValue = false;
                } else if (displayValue.length < 12) { 
                    displayValue += key;
                }
                break;
        }
    }
    
    // Guardamos estado
    Object.assign(calculatorState, { displayValue, waitingForNewValue, operand1, operator, isResultDisplayed, historyValue });
    
    // Actualizamos UI interna
    updateCalculatorDisplay();
    updateCalculatorHistoryDisplay();
    updateActiveOperatorButton();

    // === FEEDBACK EN VIVO: Actualizamos el input mientras escribes ===
    // Solo si no estamos en medio de una operación pendiente (para no confundir)
    if (!operand1) {
        updateTargetInput(displayValue);
    }
};

// Función auxiliar para escribir en el input real
const updateTargetInput = (val) => {
    if (calculatorState.targetInput) {
        const num = parseFloat(val.replace(',', '.')) || 0;
        // Formateamos bonito en el input real
        calculatorState.targetInput.value = num.toLocaleString('es-ES', { 
            useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 
        });
        // Disparamos evento para que el sistema sepa que cambió
        calculatorState.targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
};

// --- INICIO: BLOQUE CALCULADORA REPARADO Y BLINDADO ---

// Función auxiliar segura: Convierte cualquier entrada a CÉNTIMOS (entero)
const parseCalculatorValue = (val) => {
    if (val === null || val === undefined || val === '') return NaN;
    // Convierte a string, cambia coma por punto y multiplica por 100
    const num = parseFloat(val.toString().replace(',', '.'));
    return Math.round(num * 100);
};

const calculate = () => {
    // 1. Convertimos todo a enteros (céntimos)
    const val1 = parseCalculatorValue(calculatorState.operand1);
    const val2 = parseCalculatorValue(calculatorState.displayValue);
    
    // 2. Seguridad
    if (isNaN(val1) || isNaN(val2) || !calculatorState.operator) return;

    let resultInCents = 0;
    
    // 3. Operamos en enteros para precisión perfecta
    switch (calculatorState.operator) {
        case 'add': resultInCents = val1 + val2; break;
        case 'subtract': resultInCents = val1 - val2; break;
        case 'multiply': resultInCents = Math.round((val1 * val2) / 100); break; 
        case 'divide':
            if (val2 === 0) { 
                showToast("No se puede dividir por cero.", "danger"); 
                calculatorState.displayValue = 'Error';
                return; 
            }
            resultInCents = Math.round((val1 * 100) / val2); 
            break;
    }

    // 4. Formateamos bonito para el usuario
    const result = resultInCents / 100;
    calculatorState.displayValue = result.toLocaleString('es-ES', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2,
        useGrouping: false 
    }); 
    
    // 5. Reset de estado
    calculatorState.operand1 = null;
    calculatorState.operator = null;
    calculatorState.waitingForNewValue = true;
    calculatorState.isResultDisplayed = true;
    
    updateCalculatorDisplay();
};

// Mejora visual: Escala dinámica de fuente en el display
const updateCalculatorDisplay = () => {
    const display = select('calculator-display');
    if (!display) return;
    const value = calculatorState.displayValue;
    display.textContent = value;
    
    const length = value.length;
    if (length > 9) display.style.fontSize = '2rem';
    else if (length > 7) display.style.fontSize = '2.5rem';
    else display.style.fontSize = '3rem';
};
// --- FIN: BLOQUE CALCULADORA ---
                    

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
        
// CÓDIGO CORREGIDO PARA loadCoreData
async function loadCoreData(uid) {
    unsubscribeListeners.forEach(unsub => unsub());
    unsubscribeListeners = [];
    
    dataLoaded = { presupuestos: false, recurrentes: false, inversiones: false };

    const userRef = fbDb.collection('users').doc(uid);
    const collectionsToLoad = ['cuentas', 'conceptos'];

    collectionsToLoad.forEach(collectionName => {
        const unsubscribe = userRef.collection(collectionName).onSnapshot(snapshot => {
            db[collectionName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            populateAllDropdowns();
            
            // === ¡LA OTRA CORRECIÓN CLAVE ESTÁ AQUÍ! ===
            if (select(PAGE_IDS.PANEL)?.classList.contains('view--active')) {
                scheduleDashboardUpdate();
            }
            // =========================================

        }, error => console.error(`Error escuchando ${collectionName}: `, error));
        unsubscribeListeners.push(unsubscribe);
    });
    
    const unsubRecurrentes = userRef.collection('recurrentes').onSnapshot(snapshot => {
        if (db.recurrentes.length === 0) {
            db.recurrentes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            snapshot.docChanges().forEach(change => {
                const data = { id: change.doc.id, ...change.doc.data() };
                const index = db.recurrentes.findIndex(item => item.id === change.doc.id);
                if (change.type === 'added') { if (index === -1) db.recurrentes.push(data); }
                if (change.type === 'modified') { if (index > -1) db.recurrentes[index] = data; }
                if (change.type === 'removed') { if (index > -1) db.recurrentes.splice(index, 1); }
            });
        }
        db.recurrentes.sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));
        const activePage = document.querySelector('.view--active');
        if (activePage) {
            if (activePage.id === PAGE_IDS.DIARIO) renderDiarioPage();
            // CORRECCIÓN ADICIONAL: Apuntamos a la nueva página de Planificar
            if (activePage.id === PAGE_IDS.PLANIFICAR) renderPlanificacionPage();
        }
    }, error => console.error(`Error escuchando recurrentes: `, error));
    unsubscribeListeners.push(unsubRecurrentes);

    const unsubConfig = userRef.onSnapshot(doc => {
        db.config = doc.exists && doc.data().config ? doc.data().config : getInitialDb().config;
        localStorage.setItem('skipIntro', (db.config && db.config.skipIntro) || 'false');
        loadConfig();
		updateLedgerButtonUI();
    }, error => console.error("Error escuchando la configuración del usuario: ", error));
    unsubscribeListeners.push(unsubConfig);
    
    if (unsubscribeRecientesListener) unsubscribeRecientesListener();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    unsubscribeRecientesListener = userRef.collection('movimientos')
        .where('fecha', '>=', threeMonthsAgo.toISOString())
        .onSnapshot(snapshot => {
            recentMovementsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const activePage = document.querySelector('.view--active');
            
            // === ¡Y LA ÚLTIMA CORRECIÓN CLAVE ESTÁ AQUÍ! ===
            if (activePage && activePage.id === PAGE_IDS.PANEL) {
                scheduleDashboardUpdate();
            }
            // ============================================

        }, error => console.error("Error escuchando movimientos recientes: ", error));
                        
        startMainApp();
};

        
        async function loadPresupuestos() {
    if (dataLoaded.presupuestos || !currentUser) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
              
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
            // Limpieza profunda de Suscripciones
            unsubscribeListeners.forEach(unsub => unsub());
            unsubscribeListeners = [];
            if (unsubscribeRecientesListener) {
                unsubscribeRecientesListener();
                unsubscribeRecientesListener = null;
            }
            
            // Limpieza profunda de Datos en Memoria
            db = getInitialDb();
            recentMovementsCache = [];
            allDiarioMovementsCache = [];
            runningBalancesCache = null;
            lastVisibleMovementDoc = null;
            allMovementsLoaded = false;
                        
            // Limpieza de la UI
            destroyAllCharts();
            showLoginScreen();
        }
    });
};

 const calculateNextDueDate = (currentDueDate, frequency, weekDays = []) => {
    // Parseamos la fecha base asegurando mediodía UTC para evitar saltos
    const d = new Date(currentDueDate + 'T12:00:00Z');
    
    if (isNaN(d.getTime())) return new Date(); // Fallback de seguridad

    switch (frequency) {
        case 'daily': return addDays(d, 1);
        case 'monthly': return addMonths(d, 1);
        case 'yearly': return addYears(d, 1);
        case 'weekly': {
            if (!weekDays || weekDays.length === 0) return addDays(d, 7); // Fallback si no hay días

            const sortedDays = [...weekDays].map(Number).sort((a, b) => a - b);
            const currentDay = d.getUTCDay(); // Usamos getUTCDay para ser consistentes

            // Buscar el próximo día en la misma semana
            const nextDayInWeek = sortedDays.find(day => day > currentDay);
            
            if (nextDayInWeek !== undefined) {
                return addDays(d, nextDayInWeek - currentDay);
            } else {
                // Saltar a la siguiente semana
                const daysUntilNextWeek = 7 - currentDay;
                const firstDayOfNextWeek = sortedDays[0];
                return addDays(d, daysUntilNextWeek + firstDayOfNextWeek);
            }
        }
        default: return d;
    }
};

const calculatePreviousDueDate = (currentDueDate, frequency, weekDays = []) => {
    const d = parseDateStringAsUTC(currentDueDate);
    if (!d) return new Date();

    switch (frequency) {
        case 'daily': return subDays(d, 1);
        case 'monthly': return subMonths(d, 1);
        case 'yearly': return subYears(d, 1);
        case 'weekly': {
             if (!weekDays || weekDays.length === 0) return d;

            const sortedDays = [...weekDays].map(Number).sort((a, b) => a - b);
            const currentDay = d.getUTCDay();

            // Buscar el día válido anterior en la misma semana
            const prevDayInWeek = [...sortedDays].reverse().find(day => day < currentDay);
            
            if (prevDayInWeek !== undefined) {
                return subDays(d, currentDay - prevDayInWeek);
            } else {
                // No hay días antes en esta semana, saltar a la anterior
                const daysSinceStartOfWeek = currentDay;
                const lastDayOfPrevWeek = sortedDays[sortedDays.length - 1];
                return subDays(d, daysSinceStartOfWeek + (7 - lastDayOfPrevWeek));
            }
        }
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
    // Solo vibra si el navegador lo soporta Y el usuario ya ha interactuado.
    if (!userHasInteracted || !('vibrate' in navigator)) {
        return;
    }
    
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
    } catch (e) {
        // La vibración puede fallar silenciosamente. No es un error crítico.
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
 * Configura la navegación secuencial inteligente.
 * Orden: Cantidad -> Concepto -> Detalle (Auto-relleno) -> Cuenta -> Guardar
 */
const setupFormNavigation = () => {
    // Referencias
    const cantidadInput = select('movimiento-cantidad');
    const conceptoSelect = select('movimiento-concepto'); // Select real
    const descripcionInput = select('movimiento-descripcion');
    const cuentaSelect = select('movimiento-cuenta'); // Select real
    
    const saveButton = select('save-movimiento-btn');

    // Helpers para encontrar los "Triggers" (los divs falsos que se ven en pantalla)
    const getTrigger = (id) => select(id)?.closest('.form-field-compact')?.querySelector('.custom-select__trigger');

    // 1. CANTIDAD [ENTER] -> Abrir CONCEPTO
    cantidadInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Enfocamos el disparador visual del concepto
            getTrigger('movimiento-concepto')?.focus();
        }
    });
	const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    // 2. AL CAMBIAR CONCEPTO (Lógica de autocompletado del detalle)
    // Usamos 'change' en el select real, que nuestra función createCustomSelect ya dispara.
    conceptoSelect.addEventListener('change', () => {
        const conceptoTexto = conceptoSelect.options[conceptoSelect.selectedIndex]?.text;
        
        // Si el detalle está vacío o tiene el mismo valor que el concepto anterior (lógica simple), rellenamos.
        // La regla: "si no se cambia pondrá el mismo nombre que concepto". 
        // Hacemos que SIEMPRE sugiera el concepto si el campo está vacío.
        if (conceptoTexto && descripcionInput.value.trim() === '') {
            descripcionInput.value = toSentenceCase(conceptoTexto);
        }
        
        // Tras elegir concepto, saltamos al campo Detalle
        // Pequeño timeout para dar tiempo a que se cierre el dropdown visual
        setTimeout(() => {
            descripcionInput.focus();
            descripcionInput.select(); // Seleccionamos texto para facilitar sobrescritura si se desea cambiar
        }, 100);
		if (!isTouch) {
        setTimeout(() => {
            descripcionInput.focus();
            descripcionInput.select();
        }, 100);
    } else {
        // En móvil, al menos aseguramos que el campo sea visible
        descripcionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    });

    // 3. DETALLE [ENTER] -> Abrir CUENTA
    descripcionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            getTrigger('movimiento-cuenta')?.focus();
        }
    });

    // 4. AL CAMBIAR CUENTA -> Enfocar GUARDAR (o guardar directamente)
    cuentaSelect.addEventListener('change', () => {
        setTimeout(() => {
            saveButton.focus(); // Llevamos al usuario al botón guardar
            // Opcional: Si quieres que guarde directamente al elegir cuenta, descomenta:
            // saveButton.click(); 
        }, 100);
    });
    
    // Lógica para TRASPASOS (Camino alternativo)
    const origenTrigger = getTrigger('movimiento-cuenta-origen');
    
    // Si estamos en modo traspaso (detectamos por visibilidad), cambiamos el flujo desde descripción
    // (o podemos saltar descripción en traspasos, pero lo dejamos accesible).
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
document.body.addEventListener('change', e => {
    // 1. Selector de Periodo (Mes/Año/Custom)
    if (e.target.classList.contains('report-period-selector')) {
        const reportFilter = e.target.closest('.report-filters');
        if (reportFilter) {
            const reportId = reportFilter.dataset.reportId;
            const customFilters = select(`custom-date-filters-${reportId}`);
            if (customFilters) customFilters.classList.toggle('hidden', e.target.value !== 'custom');
            
            if (e.target.value !== 'custom') {
                renderInformeDetallado(reportId);
            }
        }
    }

    // 2. Inputs de Fecha Personalizados (CORREGIDO)
    if (e.target.type === 'date' && e.target.id.startsWith('filter-fecha-')) {
        const reportFilter = e.target.closest('.report-filters');
        if (reportFilter) {
            const reportId = reportFilter.dataset.reportId;
            
            // Usamos el operador ?. para evitar el crash si el elemento no existe
            const startDate = select(`filter-fecha-inicio-${reportId}`)?.value;
            const endDate = select(`filter-fecha-fin-${reportId}`)?.value;

            // Solo renderizamos si AMBAS fechas tienen valor
            if(startDate && endDate) {
                 renderInformeDetallado(reportId);
            }
        }
    }
});


        const generateId = () => fbDb.collection('users').doc().id;
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const formatCurrency = (numInCents) => {
    const number = (numInCents || 0) / 100;
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(number);
};
	const getLedgerName = (letter) => {
    // Intenta obtener el nombre personalizado, si no existe, usa "Caja X"
    return db.config?.ledgerNames?.[letter] || `Caja ${letter}`;
};
const updateLedgerButtonUI = () => {
    const btn = select('ledger-toggle-btn');
    if (btn) {
        // Obtenemos el nombre usando tu función helper existente
        const name = getLedgerName(currentLedger);
        
        // Actualizamos el texto y el título
        btn.textContent = name;
        btn.title = `Estás en: ${name}`;
    }
};
/* --- HELPER: Convierte HEX a RGBA para los gradientes --- */
const hexToRgba = (hex, alpha) => {
    let r = 0, g = 0, b = 0;
    // Manejo de 3 dígitos (#FFF)
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } 
    // Manejo de 6 dígitos (#FFFFFF)
    else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// --- Habilitador de Interacción ---
// Los navegadores modernos, por seguridad, solo permiten la vibración DESPUÉS de que el usuario
// haya tocado la pantalla al menos una vez. Esta pequeña pieza de código se encarga de eso.
const enableHaptics = () => {
    userHasInteracted = true;
    // Una vez que el usuario ha interactuado, eliminamos los listeners para no ejecutarlos más.
    document.body.removeEventListener('touchstart', enableHaptics, { once: true });
    document.body.removeEventListener('click', enableHaptics, { once: true });
};

const showToast = (message, type = 'info', duration = 3500) => {
    const container = select('toast-container');
    if (!container) return;

    // 1. Crear elemento
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    // 2. Definir icono según el tipo
    const icons = {
        success: 'check_circle',
        danger: 'error',
        warning: 'warning',
        info: 'info'
    };
    const iconName = icons[type] || 'info';

    // 3. Inyectar HTML con estructura Flexbox
    toast.innerHTML = `
        <span class="material-icons toast__icon">${iconName}</span>
        <span class="toast__message">${message}</span>
    `;

    // 4. Añadir al DOM
    container.appendChild(toast);

    // 5. Activar animación de entrada (Next Frame)
    requestAnimationFrame(() => {
        toast.classList.add('toast--visible');
        // Pequeña vibración al aparecer para feedback físico
        if (type === 'success' || type === 'danger') hapticFeedback('light');
    });

    // 6. Programar salida
    setTimeout(() => {
        toast.classList.remove('toast--visible');
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px) scale(0.95)';
        
        // Eliminar del DOM tras la transición CSS
        toast.addEventListener('transitionend', () => {
            if (toast.parentElement) toast.remove();
        });
    }, duration);
};


        const toSentenceCase = (str) => {
			if (!str || typeof str !== 'string') return '';
			return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
		};

        const setButtonLoading = (btn, isLoading, text = 'Cargando...') => {
            if (!btn) return;
            if (isLoading) { if (!originalButtonTexts.has(btn)) originalButtonTexts.set(btn, btn.innerHTML); btn.setAttribute('disabled', 'true'); btn.classList.add('btn--loading'); btn.innerHTML = `<span class="spinner"></span> <span>${text}</span>`;
            } else { btn.removeAttribute('disabled'); btn.classList.remove('btn--loading'); if (originalButtonTexts.has(btn)) { btn.innerHTML = originalButtonTexts.get(btn); originalButtonTexts.delete(btn); } }
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
    if (typeof str !== 'string' || !str.trim()) return 0; // Retorna 0 en lugar de NaN para evitar errores matemáticos posteriores
    let cleanStr = str.replace(/[€$£\s]/g, '');

    // Si solo hay un separador, asumimos que es decimal si hay 1 o 2 dígitos después.
    // Si hay 3, es ambiguo, pero en España suele ser millares (1.000).
    // Tu lógica actual es buena, pero añadamos seguridad:
    
    // Normalizar a formato inglés interno (1234.56)
    if (cleanStr.includes(',') && cleanStr.includes('.')) {
        // Caso complejo: 1.234,56 -> eliminar puntos, cambiar coma
        cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
    } else if (cleanStr.includes(',')) {
        // Caso simple coma: 12,50 -> 12.50
        cleanStr = cleanStr.replace(',', '.');
    } 
    // Caso simple punto: 12.50 se queda igual. 
    // PERO si es 1.200 (mil doscientos), JS lo toma como 1.2.
    // Dada tu audiencia (España), asumimos que el input manual de la calculadora usa ',' para decimales.
    
    const result = parseFloat(cleanStr);
    return isNaN(result) ? 0 : result;
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
	if (localStorage.getItem('privacyMode') === 'true') {
    document.body.classList.add('privacy-mode');
	}
    if (loginScreen) loginScreen.classList.remove('login-view--visible');
    if (pinLoginScreen) pinLoginScreen.classList.remove('login-view--visible');
    if (appRoot) appRoot.classList.add('app-layout--visible');
    
    populateAllDropdowns();
    loadConfig();
    
    measureListItemHeights();
    
    updateSyncStatusIcon();
        
    // === ¡LA CORRECCIÓN CLAVE ESTÁ AQUÍ! ===
    navigateTo(PAGE_IDS.PANEL, true); 
    // =====================================

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
    // Lista completa de TODAS las instancias de Chart.js en tu app
    const chartInstances = [
        conceptosChart, liquidAssetsChart, detailInvestmentChart, 
        informesChart, assetAllocationChart, budgetTrendChart, 
        netWorthChart, informeActivoChart, informeChart
    ];

    // 1. Destruir instancias conocidas
    chartInstances.forEach(chart => {
        if (chart) {
            try {
                chart.destroy();
            } catch (e) { console.warn("Error destruyendo gráfico:", e); }
        }
    });

    // 2. Resetear variables a null para evitar referencias muertas
    conceptosChart = null;
    liquidAssetsChart = null;
    detailInvestmentChart = null;
    informesChart = null;
    assetAllocationChart = null;
    budgetTrendChart = null;
    netWorthChart = null;
    informeActivoChart = null;
    informeChart = null;

    // 3. (AFINADO EXTRA) Buscar cualquier canvas que Chart.js crea que controla y limpiarlo
    // Esto arregla casos donde la variable se perdió pero el Chart sigue vivo en el DOM.
    Chart.helpers.each(Chart.instances, (instance) => {
        if (instance) instance.destroy();
    });
};

const setupTheme = () => { 
    const textColor = '#FFFFFF';
    
    // Configuración Base
    Chart.defaults.color = textColor; 
    Chart.defaults.borderColor = 'transparent'; // Quitamos bordes de contenedores
    
    // Registramos el plugin solo si está disponible
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }

    // --- CORRECCIÓN DEL ERROR: Inicialización segura ---
    
    // 1. Asegurar configuración de escala base (si la librería la usa)
    if (!Chart.defaults.scale) Chart.defaults.scale = {};
    if (!Chart.defaults.scale.grid) Chart.defaults.scale.grid = {};
    if (!Chart.defaults.scale.ticks) Chart.defaults.scale.ticks = {};

    Chart.defaults.scale.grid.display = false;      
    Chart.defaults.scale.grid.drawBorder = false;   
    Chart.defaults.scale.ticks.display = false;     
    
    // 2. Asegurar configuración de escalas cartesianas (Eje X)
    if (!Chart.defaults.scales) Chart.defaults.scales = {};
    if (!Chart.defaults.scales.x) Chart.defaults.scales.x = {};
    if (!Chart.defaults.scales.x.ticks) Chart.defaults.scales.x.ticks = {};
    
    // Ahora es seguro asignar las propiedades
    Chart.defaults.scales.x.ticks.display = true;   
    Chart.defaults.scales.x.ticks.color = 'rgba(255, 255, 255, 0.5)'; 
    
    // 3. Quitar puntos en las líneas
    if (!Chart.defaults.elements.point) Chart.defaults.elements.point = {};
    Chart.defaults.elements.point.radius = 0;
    Chart.defaults.elements.point.hitRadius = 10; 
};

const cleanupObservers = () => {
    // Solo limpiamos el observador de movimientos (scroll infinito del diario)
    if (movementsObserver) {
        movementsObserver.disconnect();
        movementsObserver = null;
    }
};
const navigateTo = async (pageId, isInitial = false) => {
    cleanupObservers();
    const oldView = document.querySelector('.view--active');
    const newView = select(pageId);
    const mainScroller = selectOne('.app-layout__main');

    const menu = select('main-menu-popover');
    if (menu) menu.classList.remove('popover-menu--visible');

    // 1. Guardar scroll
    if (oldView && mainScroller) {
        pageScrollPositions[oldView.id] = mainScroller.scrollTop;
    }

    if (!newView || (oldView && oldView.id === pageId)) return;
    
    destroyAllCharts();
    if (!isInitial) hapticFeedback('light');

    if (!isInitial && window.history.state?.page !== pageId) {
        history.pushState({ page: pageId }, '', `#${pageId}`);
    }

    // Nav Inferior
    const navItems = Array.from(selectAll('.bottom-nav__item'));
    const oldIndex = oldView ? navItems.findIndex(item => item.dataset.page === oldView.id) : -1;
    const newIndex = navItems.findIndex(item => item.dataset.page === newView.id);
    const isForward = newIndex > oldIndex;

    // Barra Superior
    const actionsEl = select('top-bar-actions');
    const leftEl = select('top-bar-left-button');
    
    // Acciones por defecto (Menú de 3 puntos)
    const standardActions = `
        <button data-action="open-external-calculator" class="icon-btn" title="Abrir Calculadora">
            <span class="material-icons">calculate</span>
        </button>
        <button data-action="show-main-menu" class="icon-btn">
            <span class="material-icons">more_vert</span>
        </button>
    `;
    
    if (pageId === PAGE_IDS.PLANIFICAR && !dataLoaded.presupuestos) await loadPresupuestos();
    if (pageId === PAGE_IDS.PATRIMONIO && !dataLoaded.inversiones) await loadInversiones();
	const patrimonioActions = `
    <button data-action="toggle-portfolio-currency" class="icon-btn" title="Cambiar moneda (EUR/BTC)">
        <span class="material-icons" id="currency-toggle-icon">currency_bitcoin</span>
    </button>
    ${standardActions}
`;

const pageRenderers = {
    [PAGE_IDS.PANEL]: { title: 'Panel', render: renderPanelPage, actions: standardActions },
    [PAGE_IDS.DIARIO]: { title: 'Diario', render: renderDiarioPage, actions: standardActions },
    // ▼▼▼ CAMBIO AQUÍ ▼▼▼
    [PAGE_IDS.PATRIMONIO]: { title: 'Patrimonio', render: renderPatrimonioPage, actions: patrimonioActions },
    // ▲▲▲ FIN CAMBIO ▲▲▲
    [PAGE_IDS.PLANIFICAR]: { title: 'Planificar', render: renderPlanificacionPage, actions: standardActions },
    [PAGE_IDS.AJUSTES]: { title: 'Ajustes', render: renderAjustesPage, actions: standardActions },
};

    if (pageRenderers[pageId]) { 
    if (leftEl) {
        // Usamos la función getLedgerName para obtener el texto inicial correcto
        const currentName = getLedgerName(currentLedger);

        // Generamos el botón con el nombre YA puesto
        let leftSideHTML = `
            <button id="ledger-toggle-btn" class="btn btn--secondary" data-action="toggle-ledger" title="Estás en: ${currentName}">
                ${currentName}
            </button>
			<span id="page-title-display" style="text-decoration: none; color: inherit; cursor: default;">${pageRenderers[pageId].title}</span>`;
            
            // CORRECCIÓN: Ya NO añadimos ningún botón extra si es PANEL.
            // Solo añadimos botones si es DIARIO.
            if (pageId === PAGE_IDS.DIARIO) {
                leftSideHTML += `
                    <button data-action="show-diario-filters" class="icon-btn" style="margin-left: 8px;"><span class="material-icons">filter_list</span></button>
                    <button data-action="toggle-diario-view" class="icon-btn"><span class="material-icons">${diarioViewMode === 'list' ? 'calendar_month' : 'list'}</span></button>
                `;
            }
            leftEl.innerHTML = leftSideHTML;
        }
        if (actionsEl) actionsEl.innerHTML = pageRenderers[pageId].actions;
        
        await pageRenderers[pageId].render();
    }
    
    // Animaciones y Clases
    selectAll('.bottom-nav__item').forEach(b => b.classList.toggle('bottom-nav__item--active', b.dataset.page === newView.id));
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

    // Restaurar Scroll
    if (mainScroller) {
        const targetScroll = pageScrollPositions[pageId] || 0;
        mainScroller.scrollTop = targetScroll;
        if (pageId === PAGE_IDS.DIARIO && diarioViewMode === 'list') {
            requestAnimationFrame(() => {
                mainScroller.scrollTop = targetScroll; 
                renderVisibleItems(); 
            });
        }
    }

    if (pageId === PAGE_IDS.PANEL) {
        scheduleDashboardUpdate();
    }
};

const getPendingRecurrents = () => {
    const now = new Date();
    // Creamos "hoy" en UTC a las 00:00 para una comparación precisa y justa.
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    return (db.recurrentes || [])
        .filter(r => {
            const nextDate = parseDateStringAsUTC(r.nextDate);
            if (!nextDate) return false;

            // ¡LA CORRECCIÓN CLAVE! Normalizamos la fecha del recurrente a las 00:00 UTC
            // para compararla directamente con "today".
            const normalizedNextDate = new Date(Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth(), nextDate.getUTCDate()));
            
            // Si la fecha programada es hoy o anterior, está pendiente.
            if (normalizedNextDate > today) {
                return false;
            }
            
            if (r.endDate) {
                const endDate = parseDateStringAsUTC(r.endDate);
                if (endDate && today > endDate) {
                    return false;
                }
            }
            
            return true;
        })
        .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));
};

		
// =================================================================
// === BLOQUE DE FUNCIONES DE CUENTAS (CORREGIDO Y UNIFICADO) ===
// =================================================================

const getVisibleAccounts = () => {
    return (db.cuentas || []).filter(c => {
        // Lógica de compatibilidad:
        // 1. Si la cuenta tiene la propiedad 'ledger', usamos eso.
        // 2. Si no, miramos 'offBalance': true -> 'B', false -> 'A'.
        const accountLedger = c.ledger || (c.offBalance ? 'B' : 'A');
        const badgeColor = accountLedger === 'A' ? 'var(--c-primary)' : (accountLedger === 'B' ? 'var(--c-danger)' : 'var(--c-success)');
        return accountLedger === currentLedger;
    });
};
/**
 * Obtiene las cuentas líquidas de la contabilidad visible actual.
 */
const getLiquidAccounts = () => {
    const visibleAccounts = getVisibleAccounts();
    return visibleAccounts.filter((c) => {
        const tipo = (c.tipo || '').trim().toUpperCase();
        // Incluir BANCOS, EFECTIVO y TARJETA
        return ['BANCO', 'EFECTIVO', 'TARJETA'].includes(tipo);
    });
};

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
const getValorMercadoInversiones = async () => {
    if (!dataLoaded.inversiones) await loadInversiones();
    
    // ← CORREGIR ESTA LÍNEA
    const investmentAccounts = getVisibleAccounts().filter(c => c.esInversion);
    
    let valorMercadoTotal = 0;
    
    for (const cuenta of investmentAccounts) {
        const valoraciones = (db.inversiones_historial || [])
            .filter(v => v.cuentaId === cuenta.id)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const valorActual = valoraciones.length > 0 ? valoraciones[0].valor : 0;
        valorMercadoTotal += valorActual;
    }
    
    return valorMercadoTotal;
};
 const forcePanelRecalculation = async () => {
    const panelPage = select(PAGE_IDS.PANEL);
    if (!panelPage?.classList.contains('view--active')) return;
    
    console.log("Forzando recálculo del panel para contabilidad", isOffBalanceMode ? "B" : "A");
    
    // 1. Limpiar skeletons (quitar efecto de carga)
    const skeletons = panelPage.querySelectorAll('.skeleton');
    skeletons.forEach(s => {
        s.classList.remove('skeleton');
        s.style.backgroundImage = 'none';
    });
    
    // 2. Forzar recálculo de todos los widgets
    await scheduleDashboardUpdate();
    
    // 3. Recalcular específicamente los KPIs del panel
    try {
        // Calcular patrimonio neto con las cuentas visibles
        const saldos = await getSaldos();
        const patrimonioNeto = Object.values(saldos).reduce((sum, s) => sum + s, 0);
        
        // Calcular valor de mercado de inversiones
        const valorMercadoInversiones = await getValorMercadoInversiones();
        
        // Calcular liquidez
        const cuentasLiquidas = getLiquidAccounts();
        const liquidezTotal = cuentasLiquidas.reduce((sum, c) => sum + (c.saldo || 0), 0);
        
        // Actualizar UI directamente
        const patrimonioEl = select('kpi-patrimonio-neto-value');
        const liquidezEl = select('kpi-liquidez-value');
        const inversionEl = select('kpi-inversion-total');
        
        if (patrimonioEl) {
            patrimonioEl.textContent = formatCurrency(patrimonioNeto);
            patrimonioEl.dataset.currentValue = String(patrimonioNeto / 100);
        }
        if (liquidezEl) liquidezEl.textContent = formatCurrency(liquidezTotal);
        if (inversionEl) inversionEl.textContent = formatCurrency(valorMercadoInversiones);
        
    } catch (error) {
        console.error("Error en forcePanelRecalculation:", error);
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
            let guess = 0.1; 
    const maxIterations = 50; // Reducir a 50 es suficiente y más seguro
    const tolerance = 1e-6; // Relajamos un poco la tolerancia (1e-7 es excesivo para UI)

    for (let i = 0; i < maxIterations; i++) {
        const npvValue = npv(guess);
        const derivativeValue = derivative(guess);
        
        // Protección contra división por cero en la derivada
        if (Math.abs(derivativeValue) < 1e-9) break; 

        const newGuess = guess - npvValue / derivativeValue;
        
        if (Math.abs(newGuess - guess) <= tolerance) {
            return newGuess;
        }
        
        // Protección contra resultados absurdos (TIR > 1000% o < -100%)
        if (Math.abs(newGuess) > 10) break; 
        
        guess = newGuess;
    }
    return 0; // Si no converge, devuelve 0 en lugar de colgarse
};
		
const calculatePortfolioPerformance = async (cuentaId = null) => {
    // ... (Inicio de la función idéntico: carga de movimientos y cuentas) ...
    const allMovements = (typeof allDiarioMovementsCache !== 'undefined' && allDiarioMovementsCache.length > 0) 
        ? allDiarioMovementsCache 
        : await fetchAllMovementsForHistory();
    
    if (!dataLoaded.inversiones) await loadInversiones();

    const allInvestmentAccounts = getVisibleAccounts().filter(c => c.esInversion);
    const investmentAccounts = cuentaId ? allInvestmentAccounts.filter(c => c.id === cuentaId) : allInvestmentAccounts;
    
    if (investmentAccounts.length === 0) {
        return { valorActual: 0, capitalInvertido: 0, pnlAbsoluto: 0, pnlPorcentual: 0, irr: 0, daysActive: 0 };
    }
    
    let totalValorActual = 0;
    let totalCapitalInvertido_para_PNL = 0;
    let allIrrCashflows = [];
    let firstMovementDate = new Date(); // Para calcular antigüedad

    for (const cuenta of investmentAccounts) {
        // ... (Lógica de P&L y Filtrado de Movimientos idéntica a la anterior) ...
        const valoraciones = (db.inversiones_historial || [])
            .filter(v => v.cuentaId === cuenta.id)
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        const valorActual = valoraciones.length > 0 ? valoraciones[0].valor : 0;
        const capitalInvertido_para_PNL = cuenta.saldo || 0;
        
        totalValorActual += valorActual;
        totalCapitalInvertido_para_PNL += capitalInvertido_para_PNL;

        const accountMovements = allMovements.filter(m => 
            (m.tipo === 'movimiento' && m.cuentaId === cuenta.id) ||
            (m.tipo === 'traspaso' && (m.cuentaDestinoId === cuenta.id || m.cuentaOrigenId === cuenta.id))
        );

        // Detectar fecha del primer movimiento para antigüedad
        if (accountMovements.length > 0) {
            const firstInAcc = accountMovements.reduce((oldest, current) => 
                new Date(current.fecha) < new Date(oldest.fecha) ? current : oldest
            );
            const mDate = new Date(firstInAcc.fecha);
            if (mDate < firstMovementDate) firstMovementDate = mDate;
        }

        // ... (Lógica de conversión a Cashflows idéntica) ...
        const irrCashflows = accountMovements
            .map(mov => {
                let effectOnAccount = 0;
                if (mov.tipo === 'movimiento') effectOnAccount = mov.cantidad;
                else if (mov.tipo === 'traspaso') {
                    if (mov.cuentaDestinoId === cuenta.id) effectOnAccount = mov.cantidad;
                    else if (mov.cuentaOrigenId === cuenta.id) effectOnAccount = -mov.cantidad;
                }
                
                if (effectOnAccount !== 0) {
                    return { amount: -effectOnAccount, date: new Date(mov.fecha) };
                }
                return null;
            })
            .filter(cf => cf !== null);

        if (valorActual !== 0) {
            irrCashflows.push({ amount: valorActual, date: new Date() });
        }
        allIrrCashflows.push(...irrCashflows);
    }

    const pnlAbsoluto = totalValorActual - totalCapitalInvertido_para_PNL;
    const pnlPorcentual = totalCapitalInvertido_para_PNL !== 0 ? (pnlAbsoluto / totalCapitalInvertido_para_PNL) * 100 : 0;
    const irr = calculateIRR(allIrrCashflows);

    // NUEVO: Calculamos días activos
    const daysActive = (new Date() - firstMovementDate) / (1000 * 60 * 60 * 24);

    return { 
        valorActual: totalValorActual, 
        capitalInvertido: totalCapitalInvertido_para_PNL,
        pnlAbsoluto, 
        pnlPorcentual, 
        irr,
        daysActive // Retornamos la antigüedad
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
    
    populate('movimiento-cuenta', visibleAccounts, 'nombre', 'id', false, true);
    populate('movimiento-concepto', db.conceptos, 'nombre', 'id', false, true);
    populate('movimiento-cuenta-origen', visibleAccounts, 'nombre', 'id', false, true);
    populate('movimiento-cuenta-destino', visibleAccounts, 'nombre', 'id', false, true);
    // ... cualquier otra llamada a 'populate' que tengas se mantiene aquí ...

    // --- ¡AQUÍ ESTÁ LA MAGIA! ---
    // Transformamos los selects del formulario en componentes personalizados.
    setTimeout(() => {
        createCustomSelect(select('movimiento-concepto'));
        createCustomSelect(select('movimiento-cuenta'));
        createCustomSelect(select('movimiento-cuenta-origen'));
        createCustomSelect(select('movimiento-cuenta-destino'));
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
        totalDaysInYear: totalDaysInYear
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
    
    // --- INICIO DE LA SOLUCIÓN DEFINITIVA ---
    // 1. En lugar de hacer una consulta compleja a Firebase, traemos TODOS los movimientos
    //    usando una función que ya sabemos que es fiable y no depende de índices.
    const allMovements = await fetchAllMovementsForHistory();

    // 2. Ahora, filtramos esos movimientos en JavaScript. Es más rápido y 100% seguro.
    //    Nos aseguramos de que el movimiento sea del tipo correcto Y del año seleccionado.
    const movements = allMovements.filter(mov => {
        const movYear = new Date(mov.fecha).getFullYear();
        return mov.tipo === 'movimiento' && movYear === year;
    });
    // --- FIN DE LA SOLUCIÓN DEFINITIVA ---

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
        listHtml += `<h4 style="margin-top: var(--sp-5); margin-bottom: var(--sp-2);">Metas de Ingresos</h4>`;
        listHtml += incomeDetails.sort((a, b) => (a.projected / (a.limit || 1)) - (b.projected / (b.limit || 1))).map(b => {
            const concepto = db.conceptos.find(c => c.id === b.conceptoId);
            const conceptoNombre = (concepto && concepto.nombre) || 'Concepto no encontrado';
            
            // --- HTML MEJORADO CON CLASES RESPONSIVAS ---
            return `
            <div class="card" style="margin-bottom: var(--sp-3);">
                <div class="card__content" style="padding: var(--sp-3);">
                    <div class="budget-card-grid">
                        <div class="budget-chart-wrapper">
                            <canvas id="gauge-chart-${b.id}"></canvas>
                            <div style="position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-weight: 800; font-size: var(--fs-lg); line-height:1;">
                                ${b.pacePercentage.toFixed(0)}<span style="font-size: 0.6em;">%</span>
                            </div>
                        </div>
                        <div class="budget-info-wrapper">
                            <div class="budget-header-row">
                                <h4 class="budget-title">${escapeHTML(conceptoNombre)}</h4>
                                <span class="${b.status.color} budget-status-badge">
                                    <span class="material-icons" style="font-size: 14px;">${b.status.icon}</span>
                                    <span>${b.status.text}</span>
                                </span>
                            </div>
                            <div class="budget-text-line">
                                <strong>Ingresado:</strong> ${formatCurrency(b.actual)} / ${formatCurrency(b.limit)}
                            </div>
                            <div class="budget-text-line" style="font-weight: 600;">
                                <strong>Proyección:</strong> 
                                <span class="${b.projected >= b.limit ? 'text-positive' : 'text-danger'}">${formatCurrency(b.projected)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }
    
    if (expenseDetails.length > 0) {
        listHtml += `<h4 style="margin-top: var(--sp-5); margin-bottom: var(--sp-2);">Límites de Gasto</h4>`;
        listHtml += expenseDetails.sort((a, b) => (b.projected / (b.limit || 1)) - (a.projected / (a.limit || 1))).map(b => {
            const concepto = db.conceptos.find(c => c.id === b.conceptoId);
            const conceptoNombre = (concepto && concepto.nombre) || 'Concepto no encontrado';
            
            // --- HTML MEJORADO CON CLASES RESPONSIVAS ---
            return `
            <div class="card" style="margin-bottom: var(--sp-3);">
                <div class="card__content" style="padding: var(--sp-3);">
                    <div class="budget-card-grid">
                        <div class="budget-chart-wrapper">
                            <canvas id="gauge-chart-${b.id}"></canvas>
                            <div style="position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-weight: 800; font-size: var(--fs-lg); line-height:1;">
                                ${b.pacePercentage.toFixed(0)}<span style="font-size: 0.6em;">%</span>
                            </div>
                        </div>
                        <div class="budget-info-wrapper">
                            <div class="budget-header-row">
                                <h4 class="budget-title">${escapeHTML(conceptoNombre)}</h4>
                                <span class="${b.status.color} budget-status-badge">
                                    <span class="material-icons" style="font-size: 14px;">${b.status.icon}</span> 
                                    <span>${b.status.text}</span>
                                </span>
                            </div>
                            <div class="budget-text-line">
                                <strong>Gastado:</strong> ${formatCurrency(b.actual)} / ${formatCurrency(b.limit)}
                            </div>
                            <div class="budget-text-line" style="font-weight: 600;">
                                <strong>Proyección:</strong> 
                                <span class="${b.projected > b.limit ? 'text-danger' : 'text-positive'}">${formatCurrency(b.projected)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
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

    // ANTES: renderPatrimonioPage(); (o la función inexistente que corregimos antes)
    // AHORA (Correcto): Llamamos a las dos funciones que dependen de este filtro.
    renderPortfolioMainContent('portfolio-main-content');
    renderPortfolioEvolutionChart('portfolio-evolution-container');
};

const renderPortfolioMainContent = async (targetContainerId) => {
    const container = select(targetContainerId);
    if (!container) return;

    const investmentAccounts = getVisibleAccounts().filter((c) => c.esInversion);
    const CHART_COLORS = ['#007AFF', '#30D158', '#FFD60A', '#FF3B30', '#C084FC', '#4ECDC4', '#EF626C', '#A8D58A'];

    if (investmentAccounts.length === 0) {
        container.innerHTML = `<div id="empty-investments" class="empty-state" style="margin-top: 0; border: none; background: transparent;">
                <span class="material-icons">rocket_launch</span>
                <h3>Tu Portafolio empieza aquí</h3>
                <p>Ve a 'Ajustes' > 'Cuentas' y marca una cuenta como 'de inversión'.</p>
            </div>`;
        return;
    }

    // 1. Obtener Datos
    const performanceData = await Promise.all(
        investmentAccounts.map(async (cuenta) => {
            const performance = await calculatePortfolioPerformance(cuenta.id);
            return { ...cuenta, ...performance };
        })
    );

    // 2. Filtrado (igual que antes)
    const displayAssetsData = performanceData.filter(asset => !deselectedInvestmentTypesFilter.has(toSentenceCase(asset.tipo || 'S/T')));

    // 3. Cálculos Totales en EUROS
    let portfolioTotalValorado = displayAssetsData.reduce((sum, cuenta) => sum + cuenta.valorActual, 0);
    let portfolioTotalInvertido = displayAssetsData.reduce((sum, cuenta) => sum + cuenta.capitalInvertido, 0);
    let rentabilidadTotalAbsoluta = portfolioTotalValorado - portfolioTotalInvertido;
    const rentabilidadTotalPorcentual = portfolioTotalInvertido !== 0 ? (rentabilidadTotalAbsoluta / portfolioTotalInvertido) * 100 : 0;

    // --- LÓGICA DE CONVERSIÓN A BITCOIN ---
    let displayTotalValorado = formatCurrency(portfolioTotalValorado);
    let displayTotalInvertido = formatCurrency(portfolioTotalInvertido);
    let displayRentabilidadAbsoluta = formatCurrency(rentabilidadTotalAbsoluta);
    let currencyClass = '';
    let timestampHTML = '';

    if (portfolioViewMode === 'BTC' && btcPriceData.price > 0) {
        // Convertimos céntimos de Euro a Euros, y luego a BTC
        const btcVal = (portfolioTotalValorado / 100) / btcPriceData.price;
        const btcInv = (portfolioTotalInvertido / 100) / btcPriceData.price;
        const btcPnl = (rentabilidadTotalAbsoluta / 100) / btcPriceData.price;

        displayTotalValorado = formatBTC(btcVal);
        displayTotalInvertido = formatBTC(btcInv);
        displayRentabilidadAbsoluta = formatBTC(btcPnl);
        
        currencyClass = 'btc-mode-active'; // Clase CSS para poner el texto naranja/dorado

        // Añadimos el timestamp de actualización
        const timeStr = new Date(btcPriceData.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        timestampHTML = `
            <div class="portfolio-timestamp">
                <div class="dot"></div>
                <span>1 BTC = ${formatCurrency(Math.round(btcPriceData.price * 100))}</span>
                <span style="opacity:0.6">• Actualizado ${timeStr}</span>
            </div>
        `;
    }
    // --------------------------------------

    const rentabilidadClass = rentabilidadTotalAbsoluta >= 0 ? 'text-positive' : 'text-negative';

    // 4. Renderizado HTML
    // Generación de pills (filtros) igual que antes...
    const allInvestmentTypes = [...new Set(performanceData.map(asset => toSentenceCase(asset.tipo || 'S/T')))].sort();
    const colorMap = {};
    allInvestmentTypes.forEach((label, index) => { colorMap[label] = CHART_COLORS[index % CHART_COLORS.length]; });
    const pillsHTML = allInvestmentTypes.map(t => {
        const isActive = !deselectedInvestmentTypesFilter.has(t);
        const color = colorMap[t];
        let style = isActive ? `style="background-color: ${color}; border-color: ${color}; color: #FFFFFF;"` : '';
        return `<button class="filter-pill ${isActive ? 'filter-pill--active' : ''}" data-action="toggle-investment-type-filter" data-type="${t}" ${style}>${t}</button>`;
    }).join('');

    container.innerHTML = `
        ${timestampHTML} <div class="card" style="margin-bottom: var(--sp-4);">
            <div class="card__content" style="display: flex; justify-content: space-around; text-align: center; padding: var(--sp-3);">
                <div>
                    <h4 class="kpi-item__label">Capital Aportado</h4>
                    <strong class="kpi-item__value ${currencyClass}" style="font-size: var(--fs-lg);">${displayTotalInvertido}</strong>
                </div>
                <div>
                    <h4 class="kpi-item__label">Valor de Mercado</h4>
                    <strong class="kpi-item__value ${currencyClass}" style="font-size: var(--fs-lg);">${displayTotalValorado}</strong>
                </div>
                <div>
                    <h4 class="kpi-item__label">Ganancia / Pérdida</h4>
                    <strong class="kpi-item__value ${rentabilidadClass}" style="font-size: var(--fs-lg);">${(portfolioViewMode === 'BTC' && rentabilidadTotalAbsoluta >=0) ? '+' : ''}${displayRentabilidadAbsoluta}</strong>
                    <div class="kpi-item__comparison ${rentabilidadClass}" style="font-weight: 600;">(${rentabilidadTotalPorcentual.toFixed(1)}%)</div>
                </div>
            </div>
        </div>
        
        <details class="accordion" open style="margin-bottom: var(--sp-4);">
            <summary><h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);"><span class="material-icons">pie_chart</span>Asignación y Filtros</h3><span class="material-icons accordion__icon">expand_more</span></summary>
            <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                <div class="filter-pills" style="margin-bottom: var(--sp-2);">${pillsHTML}</div>
                <div class="chart-container" style="height: 250px; margin-bottom: 0;"><canvas id="asset-allocation-chart"></canvas></div>
            </div>
        </details>
        
        <div id="investment-assets-list"></div>`;
    
    // Renderizado del Treemap (siempre se basa en valor relativo, así que funciona igual con los datos base en EUR)
    setTimeout(() => {
        const chartCtx = select('asset-allocation-chart')?.getContext('2d');
        if (chartCtx) {
            if (assetAllocationChart) assetAllocationChart.destroy();
            const treeData = [];
            displayAssetsData.forEach(asset => {
                const valor = asset.valorActual / 100;
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
                            backgroundColor: (ctx) => (ctx.type === 'data' ? colorMap[ctx.raw._data.tipo] || 'grey' : 'transparent'),
                            labels: { display: true, color: '#FFFFFF', font: { size: 11, weight: '600' }, align: 'center', position: 'middle', formatter: (ctx) => (ctx.raw.g.includes(ctx.raw._data.nombre) ? ctx.raw._data.nombre.split(' ') : null) }
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw._data.nombre}: ${formatCurrency(ctx.raw.v * 100)}` } }, datalabels: { display: false } } }
                });
            }
        }
        
        // Renderizado de la lista de activos individuales
        const listContainer = select('investment-assets-list');
        if (listContainer) {
            const listHtml = displayAssetsData
                .sort((a, b) => b.valorActual - a.valorActual)
                .map(cuenta => {
                    const pnlClassPill = cuenta.pnlAbsoluto >= 0 ? 'is-positive' : 'is-negative';
                    const pnlClassText = cuenta.pnlAbsoluto >= 0 ? 'text-positive' : 'text-negative';
                    const tirClassPill = cuenta.irr >= 0 ? 'is-positive' : 'is-negative';

                    // --- CONVERSIÓN INDIVIDUAL A BTC ---
                    let itemValor = formatCurrency(cuenta.valorActual);
                    let itemAportado = formatCurrency(cuenta.capitalInvertido);
                    let itemPnl = formatCurrency(cuenta.pnlAbsoluto);
                    
                    if (portfolioViewMode === 'BTC' && btcPriceData.price > 0) {
                        itemValor = formatBTC((cuenta.valorActual/100) / btcPriceData.price);
                        itemAportado = formatBTC((cuenta.capitalInvertido/100) / btcPriceData.price);
                        itemPnl = formatBTC((cuenta.pnlAbsoluto/100) / btcPriceData.price);
                    }
                    // -----------------------------------

                    // Última valoración (Lógica existente)
                    const ultimaValoracion = (db.inversiones_historial || [])
                        .filter(v => v.cuentaId === cuenta.id)
                        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
                    let fechaUltimaValoracionHTML = '<small class="asset-card__last-valuation-date">Sin valorar</small>';
                    if (ultimaValoracion) {
                        const fecha = new Date(ultimaValoracion.fecha + 'T12:00:00Z');
                        fechaUltimaValoracionHTML = `<small class="asset-card__last-valuation-date">Val. ${fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</small>`;
                    }

                    return `
                    <div class="portfolio-asset-card" data-action="view-account-details" data-id="${cuenta.id}" data-is-investment="true">
                        <div class="asset-card__details">
                            <div class="asset-card__name">${escapeHTML(cuenta.nombre)}</div>
                            <div class="asset-card__allocation">Aportado: ${itemAportado}</div>
                            <div class="asset-card__pnl-absolute ${pnlClassText}" style="font-size: var(--fs-sm); font-weight: 600;">
                                ${(portfolioViewMode === 'BTC' && cuenta.pnlAbsoluto >= 0) ? '+' : ''}${cuenta.pnlAbsoluto >= 0 && portfolioViewMode !== 'BTC' ? '+' : ''}${itemPnl}
                            </div>
                        </div>
                        <div class="asset-card__figures">
                            <div class="asset-card__value ${currencyClass}">${itemValor}</div>
                            <div style="display: flex; gap: var(--sp-2); align-items: center; justify-content: flex-end;">
                                <button class="asset-card__pnl-pill ${pnlClassPill}" style="border:none; cursor:pointer;" data-action="show-pnl-breakdown" data-id="${cuenta.id}">
                                    P&L: ${cuenta.pnlPorcentual.toFixed(1)}%
                                </button>
                                <button class="asset-card__pnl-pill ${tirClassPill}" style="border:none; cursor:pointer;" data-action="show-irr-breakdown" data-id="${cuenta.id}">
                                    TIR: ${!isNaN(cuenta.irr) ? (cuenta.irr * 100).toFixed(1) + '%' : 'N/A'}
                                </button>
                            </div>
                            <div class="asset-card__valuation-area">
                                ${fechaUltimaValoracionHTML}
                                <button class="asset-card__valoracion-btn" data-action="update-asset-value" data-id="${cuenta.id}">
                                    <span class="material-icons" style="font-size: 14px;">add_chart</span> Valorar
                                </button>
                            </div>
                        </div>
                    </div>`;
                }).join('');

            listContainer.innerHTML = listHtml ? `<div class="card fade-in-up"><div class="card__content" style="padding: 0;">${listHtml}</div></div>` : '';
            applyInvestmentItemInteractions(listContainer);
        }
    }, 50);
};


const handleShowPnlBreakdown = async (accountId) => {
    const cuenta = db.cuentas.find(c => c.id === accountId);
    if (!cuenta) return;

    hapticFeedback('light');
    showGenericModal(`Desglose P&L: ${cuenta.nombre}`, `<div style="text-align:center; padding: var(--sp-5);"><span class="spinner"></span></div>`);

    const performanceData = await calculatePortfolioPerformance(accountId, 'MAX');

    const { valorActual, capitalInvertido, pnlAbsoluto } = performanceData;
    
    let modalHtml = `<p class="form-label" style="margin-bottom: var(--sp-3);">
        Tu Ganancia o Pérdida (P&L) se calcula con la fórmula que definiste: <strong>Valor de Mercado - Capital Aportado</strong>. El "Capital Aportado" en tu caso es el Saldo Contable de la cuenta.
        </p>
        <div class="informe-extracto-container" style="font-family: monospace, sans-serif; font-size: 1.1em;">
            
            <div class="informe-linea-movimiento" style="justify-content: space-between;">
                <span>Valor de Mercado</span>
                <span class="text-ingreso">${formatCurrency(valorActual)}</span>
            </div>

            <div class="informe-linea-movimiento" style="justify-content: space-between;">
                <span>Capital Aportado</span>
                <span class="text-gasto">- ${formatCurrency(capitalInvertido)}</span>
            </div>
            
        </div>
        
        <div class="informe-extracto-container" style="margin-top: var(--sp-3); border-top: 2px solid var(--c-primary);">
            <div class="informe-linea-movimiento" style="justify-content: space-between; font-weight: 700;">
                <span>Resultado (P&L)</span>
                <span class="${pnlAbsoluto >= 0 ? 'text-ingreso' : 'text-gasto'}">${formatCurrency(pnlAbsoluto)}</span>
            </div>
        </div>
        `;
    
    showGenericModal(`Desglose P&L: ${cuenta.nombre}`, modalHtml);
};

// ▲▲▲ FIN DEL BLOQUE A REEMPLAZAR ▲▲▲

        const renderVirtualListItem = (item) => {
			if (item.type === 'month-header') {
    const monthName = item.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    
    // --- NUEVO HTML: Solo Título, Estilo Minimalista ---
    return `
        <div class="movimiento-month-header" style="
            height: 40px; 
            display: flex; 
            align-items: center; 
            padding: 0 var(--sp-4); 
            background-color: var(--c-background); /* Fondo sólido para que al hacer sticky tape lo de abajo */
            border-bottom: 1px solid var(--c-outline);
            z-index: 5;
        ">
            <h3 class="movimiento-month-header__title" style="
                font-size: 1rem; 
                margin: 0; 
                color: var(--c-primary); 
                font-weight: 800;
                text-transform: capitalize;
            ">${monthName}</h3>
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
    let label = '';
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    today.setHours(0,0,0,0);
    yesterday.setHours(0,0,0,0);
    
    const itemDate = new Date(dateObj); // Clonamos para no modificar el original
    itemDate.setHours(0,0,0,0);
    
    // Creamos las etiquetas especiales
    if (itemDate.getTime() === today.getTime()) {
        label = "Hoy";
    } else if (itemDate.getTime() === yesterday.getTime()) {
        label = "Ayer";
    } else {
        label = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
    }

    return `
        <div class="movimiento-date-header ${label === 'Hoy' ? 'is-today' : ''}">
            <span style="text-transform: capitalize;">${label}</span>
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
    const pendingRecurrents = getPendingRecurrents();

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

        vList.items.push({ type: 'month-header', date: monthDate, });
        vList.itemMap.push({ height: 40, offset: currentHeight });
        currentHeight += 40;

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
		let safetyCounter = 0; // <--- NUEVO: Contador de seguridad
		const MAX_BATCH_ATTEMPTS = 5; // <--- NUEVO: Máximo 5 llamadas a la base de datos por vez
        while (fetchedFilteredCount < 50 && !allMovementsLoaded) {
            const rawMovsFromDB = await fetchMovementsPage(lastVisibleMovementDoc);
			safetyCounter++; // Incrementamos contador
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
			<button data-action="clear-diario-filters" class="icon-btn" style="width: 24px; height: 24px;">
        <span class="material-icons" style="font-size: 16px;">close</span>
    </button>
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

const renderAjustesPage = () => {
    const container = select(PAGE_IDS.AJUSTES);
    if (!container) return;

    // Estructura HTML de la nueva página de Ajustes, agrupada por temas.
    container.innerHTML = `
        <div style="padding-bottom: var(--sp-4);">

            <!-- Grupo 1: Gestión de Datos -->
            <h3 class="settings-group__title">Gestión de Datos</h3>
            <div class="card">
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
        <div class="card">
            <div class="card__content" style="padding: 0;">
                <button class="settings-item" data-action="export-data">
                    <span class="material-icons text-positive">cloud_upload</span>
                    <span class="settings-item__label">Exportar Copia (JSON)</span>
                    <span class="material-icons">chevron_right</span>
                </button>
                 <button class="settings-item" data-action="export-csv">
                    <span class="material-icons text-positive">description</span>
                    <span class="settings-item__label">Exportar a CSV (Excel)</span>
                    <span class="material-icons">chevron_right</span>
                </button>
                <button class="settings-item" data-action="import-data">
                    <span class="material-icons text-warning">cloud_download</span>
                    <span class="settings-item__label">Importar Copia (JSON)</span>
                    <span class="material-icons">chevron_right</span>
                </button>
                <button class="settings-item" data-action="import-csv">
                     <span class="material-icons text-warning">grid_on</span>
                    <span class="settings-item__label">Importar desde CSV</span>
                    <span class="material-icons">chevron_right</span>
                </button>

                <!-- ===== INICIO DE LA MODIFICACIÓN ===== -->
                <!-- Este es el nuevo botón que hemos añadido -->
                <button class="settings-item text-danger" data-action="recalculate-balances">
                    <span class="material-icons">rule_folder</span>
                    <span class="settings-item__label">Auditar y Corregir Saldos</span>
                    <span class="material-icons">chevron_right</span>
                </button>
                <!-- ===== FIN DE LA MODIFICACIÓN ===== -->
                
            </div>
        </div>
            
            <!-- Grupo 3: Seguridad y Cuenta -->
            <h3 class="settings-group__title">Seguridad y Cuenta</h3>
			
            <div class="card">
                <div class="card__content" style="padding: 0;">
                    <div class="settings-item" style="cursor: default;">
                        <span class="material-icons">alternate_email</span>
                        <span id="config-user-email" class="settings-item__label">Cargando...</span>
                    </div>
                    <button class="settings-item" data-action="set-pin">
                        <span class="material-icons">pin</span>
                        <span class="settings-item__label">Configurar PIN de acceso</span>
                        <span class="material-icons">chevron_right</span>
                    </button>
					<h3 class="settings-group__title">Personalización</h3>
<div class="card">
    <div class="card__content" style="padding: 0;">
        <button class="settings-item" data-action="rename-ledgers">
            <span class="material-icons text-info">edit_square</span>
            <span class="settings-item__label">Renombrar Cajas (A/B/C)</span>
            <span class="material-icons">chevron_right</span>
        </button>
    </div>
</div>
                    <button class="settings-item text-danger" data-action="logout">
                        <span class="material-icons">logout</span>
                        <span class="settings-item__label">Cerrar Sesión</span>
                    </button>
                </div>
            </div>

        </div>
    `;
    
    // Esta función, que ya tienes, se encarga de mostrar tu email en la lista.
    loadConfig();
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
const renderPatrimonioOverviewWidget = async (containerId) => {
    const container = select(containerId);
    if (!container) return;

    container.innerHTML = `<div class="skeleton" style="height: 400px; border-radius: var(--border-radius-lg);"></div>`;

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
    
    const filteredAccounts = visibleAccounts.filter(c => filteredAccountTypes.has(toSentenceCase(c.tipo || 'S/T')));
    const totalFiltrado = filteredAccounts.reduce((sum, c) => sum + (saldos[c.id] || 0), 0);
    
    const treeData = [];
    filteredAccounts.forEach(c => {
        const saldo = saldos[c.id] || 0;
        if (saldo > 0) {
            treeData.push({ tipo: toSentenceCase(c.tipo || 'S/T'), nombre: c.nombre, saldo: saldo / 100 });
        }
    });

    container.innerHTML = `
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

    const chartCtx = select('liquid-assets-chart')?.getContext('2d');
    if (chartCtx) {
        const existingChart = Chart.getChart('liquid-assets-chart');
        if (existingChart) existingChart.destroy();
        if (treeData.length > 0) {
            liquidAssetsChart = new Chart(chartCtx, { type: 'treemap', data: { datasets: [{ tree: treeData, key: 'saldo', groups: ['tipo', 'nombre'], spacing: 0.5, borderWidth: 1.5, borderColor: getComputedStyle(document.body).getPropertyValue('--c-background'), backgroundColor: (ctx) => (ctx.type === 'data' ? colorMap[ctx.raw._data.tipo] || 'grey' : 'transparent'), labels: { display: true, color: '#FFFFFF', font: { size: 11, weight: '600' }, align: 'center', position: 'middle', formatter: (ctx) => (ctx.raw.g.includes(ctx.raw._data.nombre) ? ctx.raw._data.nombre.split(' ') : null) } }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw._data.nombre}: ${formatCurrency(ctx.raw.v * 100)}` } }, datalabels: { display: false } }, onClick: (e) => e.native && e.native.stopPropagation() } });
        } else {
            select('liquid-assets-chart-container').innerHTML = `<div class="empty-state" style="padding:16px 0; background:transparent; border:none;"><p>No hay activos con saldo positivo para mostrar.</p></div>`;
        }
    }
    
    const listaContainer = select('patrimonio-cuentas-lista');
    if (listaContainer) {
        const accountsByType = filteredAccounts.reduce((acc, c) => { 
            const tipo = toSentenceCase(c.tipo || 'S/T'); 
            if (!acc[tipo]) acc[tipo] = []; 
            acc[tipo].push(c); 
            return acc; 
        }, {});

        listaContainer.innerHTML = Object.keys(accountsByType).sort().map(tipo => {
            const accountsInType = accountsByType[tipo];
            const typeBalance = accountsInType.reduce((sum, acc) => sum + (saldos[acc.id] || 0), 0);
            const porcentajeGlobal = totalFiltrado > 0 ? (typeBalance / totalFiltrado) * 100 : 0;
            const accountsHtml = accountsInType.sort((a,b) => a.nombre.localeCompare(b.nombre)).map(c => 
                `<div class="modal__list-item" 
                     data-action="view-account-details" 
                     data-id="${c.id}" 
                     ${c.esInversion ? 'data-is-investment="true"' : ''}
                     style="cursor: pointer; padding: var(--sp-2) 0;">
                    <div>
                        <span style="display: block;">${c.nombre}</span>
                        <small style="color: var(--c-on-surface-secondary);">${(saldos[c.id] || 0) / typeBalance * 100 > 0 ? ((saldos[c.id] || 0) / typeBalance * 100).toFixed(1) + '% de ' + tipo : ''}</small>
                    </div>
                    <div style="display: flex; align-items: center; gap: var(--sp-2);">
                        ${formatCurrency(saldos[c.id] || 0)}
                        <span class="material-icons" style="font-size: 18px;">chevron_right</span>
                    </div>
                </div>`
            ).join('');

            if (!accountsHtml) return '';

            return `
                <details class="accordion" style="margin-bottom: var(--sp-2);">
                    <summary>
                        <span class="account-group__name">${tipo}</span>
                        <div style="display:flex; align-items:center; gap:var(--sp-2);">
                            <small style="color: var(--c-on-surface-tertiary); margin-right: var(--sp-2);">${porcentajeGlobal.toFixed(1)}%</small>
                            <span class="account-group__balance">${formatCurrency(typeBalance)}</span>
                            <span class="material-icons accordion__icon">expand_more</span>
                        </div>
                    </summary>
                    <div class="accordion__content" style="padding: 0 var(--sp-3);">${accountsHtml}</div>
                </details>`;
        }).join('');
		
        const investmentItems = listaContainer.querySelectorAll('[data-is-investment="true"]');
        
        investmentItems.forEach(item => {
            let longPressTimer;
            let startX, startY;
            let longPressTriggered = false;

            const startHandler = (e) => {
                e.stopPropagation(); 
                const point = e.touches ? e.touches[0] : e;
                startX = point.clientX;
                startY = point.clientY;
                longPressTriggered = false;

                longPressTimer = setTimeout(() => {
                    longPressTriggered = true;
                    const accountId = item.dataset.id;
                    handleShowIrrHistory({ accountId: accountId });
                }, 500); 
            };

            const moveHandler = (e) => {
				if (!longPressTimer) return;
				const point = e.type === 'touchmove' ? e.touches[0] : e;
                if (Math.abs(point.clientX - startX) > 10 || Math.abs(point.clientY - startY) > 10) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            };

            const endHandler = (e) => {
                clearTimeout(longPressTimer);
                if (longPressTriggered) {
                    e.preventDefault(); 
                    e.stopPropagation(); // <-- ¡LA CORRECCIÓN MÁGICA!
                }
            };
            
            item.addEventListener('mousedown', startHandler);
            item.addEventListener('touchstart', startHandler, { passive: true });
            item.addEventListener('mousemove', moveHandler);
            item.addEventListener('touchmove', moveHandler, { passive: true });
            item.addEventListener('mouseup', endHandler);
            item.addEventListener('touchend', endHandler);
            item.addEventListener('mouseleave', () => clearTimeout(longPressTimer));
        });
    }
	applyInvestmentItemInteractions(listaContainer);
};

const handleShowIrrHistory = async (options) => {
    hapticFeedback('medium');
    
    const titleEl = select('irr-history-title');
    const bodyEl = select('irr-history-body');
    if(bodyEl) bodyEl.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><span class="spinner" style="width: 48px; height: 48px;"></span></div>`;
    showModal('irr-history-modal');

    let accountIds = [];
    let title = 'Evolución TIR';

    if (options.accountId) {
        accountIds = [options.accountId];
        const account = db.cuentas.find(c => c.id === options.accountId);
        if (account) title = `Evolución TIR: ${account.nombre}`;
    } else if (options.accountType) {
        accountIds = getVisibleAccounts()
            .filter(c => toSentenceCase(c.tipo || 'S/T') === options.accountType && c.esInversion)
            .map(c => c.id);
        title = `Evolución TIR: ${options.accountType}`;
    }

    if(titleEl) titleEl.textContent = title;
        
    const historyData = await calculateHistoricalIrrForGroup(accountIds);

    if (!historyData || historyData.length < 2) {
        if(bodyEl) bodyEl.innerHTML = `<div class="empty-state"><p>No hay suficientes valoraciones para generar un histórico de TIR para este activo.</p></div>`;
        return;
    }

    if(bodyEl) bodyEl.innerHTML = `<div class="chart-container" style="height: 100%;"><canvas id="irr-history-chart"></canvas></div>`;
    const chartCtx = select('irr-history-chart').getContext('2d');
    const existingChart = Chart.getChart(chartCtx);
    if (existingChart) existingChart.destroy();

    new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: historyData.map(d => new Date(d.date)),
            datasets: [{
                label: 'TIR Anualizada',
                data: historyData.map(d => d.irr * 100),
                borderColor: 'var(--c-info)',
                backgroundColor: 'rgba(191, 90, 242, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { ticks: { callback: (value) => `${value.toFixed(1)}%` }, title: { display: true, text: 'TIR Anualizada (%)' } },
                x: { type: 'time', time: { unit: 'month', tooltipFormat: 'dd MMM yyyy' } }
            },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (context) => `TIR: ${context.parsed.y.toFixed(2)}%` } },
                datalabels: { display: false }
            }
        }
    });
};

async function calculateHistoricalIrrForGroup(accountIds) {
    if (!dataLoaded.inversiones) await loadInversiones();
    const allMovements = await fetchAllMovementsForHistory();
    const accountIdSet = new Set(accountIds);
    
    const timeline = [];
    const valuations = (db.inversiones_historial || []).filter(v => accountIdSet.has(v.cuentaId));
    const cashflows = allMovements.filter(m => {
        return (m.tipo === 'movimiento' && accountIdSet.has(m.cuentaId)) ||
               (m.tipo === 'traspaso' && (accountIdSet.has(m.cuentaOrigenId) || accountIdSet.has(m.cuentaDestinoId)));
    });

    cashflows.forEach(m => {
        let amount = 0;
        if (m.tipo === 'movimiento') amount = m.cantidad;
        else if (m.tipo === 'traspaso') {
            const origenEsInversion = accountIdSet.has(m.cuentaOrigenId);
            const destinoEsInversion = accountIdSet.has(m.cuentaDestinoId);
            if (origenEsInversion && !destinoEsInversion) amount = -m.cantidad;
            else if (!origenEsInversion && destinoEsInversion) amount = m.cantidad;
        }
        if (amount !== 0) {
            timeline.push({ date: new Date(m.fecha), amount: -amount });
        }
    });

    const sortedValuations = valuations.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const historicalIrr = [];
    const valuationMap = new Map();

    sortedValuations.forEach(v => {
        const dateKey = v.fecha.slice(0, 10);
        if (!valuationMap.has(dateKey)) valuationMap.set(dateKey, 0);
        valuationMap.set(dateKey, valuationMap.get(dateKey) + v.valor);
    });

    for (const [dateKey, totalValue] of valuationMap.entries()) {
        const currentDate = new Date(dateKey);
        
        const cashflowsUpToDate = timeline
            .filter(cf => cf.date <= currentDate)
            .map(cf => ({...cf})); 

        cashflowsUpToDate.push({ date: currentDate, amount: totalValue });
        
        const irr = calculateIRR(cashflowsUpToDate);
        if (!isNaN(irr)) {
            historicalIrr.push({ date: dateKey, irr: irr });
        }
    }

    return historicalIrr;
}
	 
   
        const loadConfig = () => { 
            const userEmailEl = select('config-user-email'); 
            if (userEmailEl && currentUser) userEmailEl.textContent = currentUser.email;  			
        };
/* EN main.js - REEMPLAZO DE renderPanelPage (SIN SALUDO, SIN GRÁFICOS DE SALUD, CON DRILLDOWN) */

const renderPanelPage = async () => {
    const container = select(PAGE_IDS.PANEL);
    if (!container) return;

    // (Eliminado código del saludo)

    container.innerHTML = `
        <div style="padding: 0 var(--sp-2) var(--sp-4);">
            
            <div style="display: flex; justify-content: flex-end; margin-bottom: var(--sp-3); margin-top: var(--sp-3);">
                <div class="report-filters" style="margin: 0;">
                    <select id="filter-periodo" class="form-select report-period-selector" style="font-size: 0.8rem; padding: 6px 12px; height: auto; width: auto; background-color: var(--c-surface-variant); border: none; border-radius: 99px;">
                        <option value="mes-actual">Este Mes</option>
                        <option value="año-actual">Este Año</option>
                        <option value="custom">Personalizado</option>
                    </select>
                </div>
            </div>

            <div id="custom-date-filters" class="form-grid hidden" style="grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: var(--sp-4);">
                <input type="date" id="filter-fecha-inicio" class="form-input" style="font-size: 0.8rem; padding: 8px;">
                <input type="date" id="filter-fecha-fin" class="form-input" style="font-size: 0.8rem; padding: 8px;">
            </div>

            <div class="hero-card" style="padding: 25px 20px; text-align: center; margin-bottom: var(--sp-3); min-height: auto; border: 1px solid var(--c-primary); box-shadow: 0 4px 20px rgba(0, 179, 77, 0.15);">
                <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--c-on-surface-secondary); letter-spacing: 1.5px; margin-bottom: 4px; display:flex; justify-content:center; align-items:center;">
                    Patrimonio Total 
                    <button class="help-btn" data-action="show-kpi-help" data-kpi="patrimonio" style="margin-left:6px;">?</button>
                </div>
                <div id="kpi-patrimonio-neto-value" class="hero-value kpi-resaltado-azul skeleton" data-current-value="0" style="font-size: 2.6rem; margin-bottom: 0;">0,00 €</div>
            </div>

            <div class="status-grid" style="gap: 8px; margin-bottom: var(--sp-4);">
                
                <div class="status-card" style="padding: 12px 16px; border-radius: 16px;">
                    <div class="status-label" style="margin-bottom: 4px;">
                        <span class="material-icons" style="font-size: 16px; color: var(--c-info);">account_balance_wallet</span> Liquidez
                        <button class="help-btn" data-action="show-kpi-help" data-kpi="liquidez">?</button>
                    </div>
                    <div id="kpi-liquidez-value" class="status-value skeleton" style="font-size: 1.1rem;">0,00 €</div>
                </div>

                <div class="status-card" style="padding: 12px 16px; border-radius: 16px;">
                    <div class="status-label" style="margin-bottom: 4px;">
                        <span class="material-icons" style="font-size: 16px; color: #BF5AF2;">auto_graph</span> Inversiones
                        <button class="help-btn" data-action="show-kpi-help" data-kpi="invertido">?</button>
                    </div>
                    <div id="kpi-inversion-total" class="status-value skeleton" style="font-size: 1.1rem;">0,00 €</div>
                </div>

                <div class="status-card" style="padding: 12px 16px; border-radius: 16px;">
                    <div class="status-label" style="margin-bottom: 4px;">
                         Ganancia <button class="help-btn" data-action="show-kpi-help" data-kpi="pnl">?</button>
                    </div>
                    <div id="kpi-inversion-pnl" class="status-value skeleton" style="font-size: 1.1rem;">+0,00 €</div>
                </div>

                <div class="status-card" style="padding: 12px 16px; border-radius: 16px;">
                    <div class="status-label" style="margin-bottom: 4px;">
                         Rentabilidad <button class="help-btn" data-action="show-kpi-help" data-kpi="rentabilidad">?</button>
                    </div>
                    <div id="kpi-inversion-pct" class="status-value skeleton" style="font-size: 1.1rem;">0.00%</div>
                </div>
            </div>

            <div class="card fade-in-up" style="padding: 16px; border-radius: 20px; margin-bottom: var(--sp-4); border: 1px solid var(--c-outline);">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;">
                    
                    <div class="clickable-kpi" data-action="show-kpi-drilldown" data-type="ingresos" style="cursor: pointer;">
                        <div style="font-size: 0.65rem; font-weight: 700; color: var(--c-on-surface-secondary); text-transform: uppercase; margin-bottom: 4px;">
                            Ingresos <button class="help-btn" data-action="show-kpi-help" data-kpi="ingresos" style="width:12px; height:12px; font-size:9px;">?</button>
                        </div>
                        <div id="kpi-ingresos-value" class="text-positive skeleton" style="font-size: 1rem; font-weight: 800;">+0 €</div>
                    </div>

                    <div class="clickable-kpi" data-action="show-kpi-drilldown" data-type="gastos" style="cursor: pointer; border-left: 1px solid var(--c-outline); border-right: 1px solid var(--c-outline);">
                        <div style="font-size: 0.65rem; font-weight: 700; color: var(--c-on-surface-secondary); text-transform: uppercase; margin-bottom: 4px;">
                            Gastos <button class="help-btn" data-action="show-kpi-help" data-kpi="gastos" style="width:12px; height:12px; font-size:9px;">?</button>
                        </div>
                        <div id="kpi-gastos-value" class="text-negative skeleton" style="font-size: 1rem; font-weight: 800;">-0 €</div>
                    </div>

                    <div class="clickable-kpi" data-action="show-kpi-drilldown" data-type="saldoNeto" style="cursor: pointer;">
                        <div style="font-size: 0.65rem; font-weight: 700; color: var(--c-on-surface-secondary); text-transform: uppercase; margin-bottom: 4px;">
                            Neto <button class="help-btn" data-action="show-kpi-help" data-kpi="neto" style="width:12px; height:12px; font-size:9px;">?</button>
                        </div>
                        <div id="kpi-saldo-neto-value" class="skeleton" style="font-size: 1rem; font-weight: 800;">0 €</div>
                    </div>

                </div>
            </div>

            <div class="section-header">Salud Financiera</div>
            
            <div style="display: flex; flex-direction: column; gap: var(--sp-3); padding-bottom: var(--sp-5);">
                
                <div class="card fade-in-up" style="padding: 16px 20px; border-radius: 20px; border: 1px solid #00E5FF; box-shadow: 0 0 10px rgba(0, 229, 255, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="material-icons" style="font-size: 28px; color: #00E5FF; background: rgba(0, 229, 255, 0.1); padding: 6px; border-radius: 10px;">savings</span>
                            <div>
                                <div style="font-size: 0.8rem; font-weight: 700; color: #00E5FF;">
                                    Ahorro <button class="help-btn" data-action="show-kpi-help" data-kpi="tasa_ahorro" style="color:#00E5FF;">?</button>
                                </div>
                                <div style="font-size: 0.7rem; color: #00E5FF; opacity: 0.8;">De tus ingresos netos</div>
                            </div>
                        </div>
                        <div id="kpi-tasa-ahorro-value" class="skeleton" style="font-size: 1.4rem; font-weight: 800; color: #00E5FF;">0%</div>
                    </div>
                </div>

                <div class="card fade-in-up" style="padding: 16px 20px; border-radius: 20px; border: 1px solid #FFD60A; box-shadow: 0 0 10px rgba(255, 214, 10, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="material-icons" style="font-size: 28px; color: #FFD60A; background: rgba(255, 214, 10, 0.1); padding: 6px; border-radius: 10px;">shield</span>
                            <div>
                                <div style="font-size: 0.8rem; font-weight: 700; color: #FFD60A;">
                                    Cobertura <button class="help-btn" data-action="show-kpi-help" data-kpi="cobertura" style="color:#FFD60A;">?</button>
                                </div>
                                <div style="font-size: 0.7rem; color: #FFD60A; opacity: 0.8;">Meta: 6 meses</div>
                            </div>
                        </div>
                        <div id="health-runway-val" class="skeleton" style="font-size: 1.4rem; font-weight: 800; color: #FFD60A;">0 Meses</div>
                    </div>
                </div>

                <div class="card fade-in-up" style="padding: 16px 20px; border-radius: 20px; border: 1px solid #39FF14; box-shadow: 0 0 10px rgba(57, 255, 20, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="material-icons" style="font-size: 28px; color: #39FF14; background: rgba(57, 255, 20, 0.1); padding: 6px; border-radius: 10px;">flag</span>
                            <div>
                                <div style="font-size: 0.8rem; font-weight: 700; color: #39FF14;">
                                    Libertad <button class="help-btn" data-action="show-kpi-help" data-kpi="libertad" style="color:#39FF14;">?</button>
                                </div>
                                <div style="font-size: 0.7rem; color: #39FF14; opacity: 0.8;">Meta: Vivir de rentas</div>
                            </div>
                        </div>
                        <div id="health-fi-val" class="skeleton" style="font-size: 1.4rem; font-weight: 800; color: #39FF14;">0.0%</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="concepto-totals-list" style="display:none;"></div>
        <canvas id="conceptos-chart" style="display:none;"></canvas>
        <div id="net-worth-chart-container" style="display:none;"><canvas id="net-worth-chart"></canvas></div>
    `;
    
    populateAllDropdowns();
    await Promise.all([loadPresupuestos(), loadInversiones()]);
    scheduleDashboardUpdate(); 
};

 const showEstrategiaTab = (tabName) => {
    // 1. Gestionar el estado activo de los botones de las pestañas
    const tabButton = document.querySelector(`.tab-item[data-tab="${tabName}"]`);
    if (tabButton) {
        selectAll('.tab-item').forEach(btn => btn.classList.remove('tab-item--active'));
        tabButton.classList.add('tab-item--active');
    }

    // 2. Gestionar la visibilidad de los contenedores de contenido
    const contentContainer = select(`estrategia-${tabName}-content`);
    if (contentContainer) {
        selectAll('.tab-content').forEach(content => content.classList.remove('tab-content--active'));
        contentContainer.classList.add('tab-content--active');
    } else {
        // Si el contenedor no existe, no hacemos nada más.
        console.error(`Contenedor de pestaña no encontrado: estrategia-${tabName}-content`);
        return;
    }
    
    // 3. Destruir gráficos anteriores para evitar conflictos
    destroyAllCharts();

    // 4. Llamar a la función de renderizado específica para esa pestaña
    switch (tabName) {
        case 'planificacion':
            renderPlanificacionPage();
            break;
        case 'activos':
            renderPatrimonioPage();
            break;
        case 'informes':
            renderEstrategiaInformes();
            break;
    }
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
    const formattedDate = new Date(m.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); // Fecha más corta y limpia

    let avatarHTML = '';
    let title = '';
    let subtitle = '';
    let amountClass = '';
    let amountSign = '';

    // --- Lógica de Avatar Inteligente ---
    const extractEmoji = (str) => {
        if (!str) return null;
        const match = str.match(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
        return match ? match[0] : null;
    };

    if (m.tipo === 'traspaso') {
        const origen = cuentas.find(c => c.id === m.cuentaOrigenId)?.nombre || '?';
        const destino = cuentas.find(c => c.id === m.cuentaDestinoId)?.nombre || '?';
        
        // Icono de Traspaso
        avatarHTML = `<div class="transaction-avatar avatar--transfer"><span class="material-icons">swap_horiz</span></div>`;
        title = 'Traspaso';
        subtitle = `${origen} ➔ ${destino}`;
        amountClass = 'text-info';
    } else {
        const concepto = conceptos.find(c => c.id === m.conceptoId);
        const cuenta = cuentas.find(c => c.id === m.cuentaId);
        const conceptoNombre = concepto ? toSentenceCase(concepto.nombre) : 'S/C';
        
        // 1. Intentamos sacar el emoji del concepto
        const emoji = extractEmoji(conceptoNombre);
        
        // 2. Si no hay emoji, usamos la inicial
        const content = emoji || conceptoNombre.charAt(0).toUpperCase();
        
        // 3. Determinamos color
        const typeClass = m.cantidad >= 0 ? 'avatar--income' : 'avatar--expense';
        
        avatarHTML = `<div class="transaction-avatar ${typeClass}">${content}</div>`;
        
        // Limpiamos el nombre del concepto para no repetir el emoji en el texto
        title = emoji ? conceptoNombre.replace(emoji, '').trim() : conceptoNombre;
        subtitle = `${formattedDate} • ${escapeHTML(m.descripcion || cuenta?.nombre || '')}`;
        
        amountClass = m.cantidad >= 0 ? 'text-positive' : 'text-negative';
        amountSign = m.cantidad > 0 ? '+' : '';
    }

    return `
    <div class="list-item-animate"> 
        <div class="transaction-card ${highlightClass}" data-id="${m.id}" style="padding-left: var(--sp-2); padding-right: var(--sp-2);">
            
            ${avatarHTML}

            <div class="transaction-card__content">
                <div class="transaction-card__details">
                    <div class="transaction-card__row-1" style="font-size: 1rem; font-weight: 600;">${title}</div>
                    <div class="transaction-card__row-2" style="opacity: 0.7;">${subtitle}</div>
                </div>
                <div class="transaction-card__figures">
                    <div class="transaction-card__amount ${amountClass}" style="font-size: 1rem;">${amountSign}${formatCurrency(m.cantidad)}</div>
                    <div class="transaction-card__balance" style="font-size: 0.75rem; opacity: 0.6;">${formatCurrency(m.runningBalance)}</div>
                </div>
            </div>
        </div>
    </div>`;
};

const createChartGradient = (ctx, colorHex) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400); // Ajusta 400 según altura aprox
    // Convertimos HEX a RGBA para manejar opacidad
    // Truco rápido: Asumimos que el color viene en formato HEX o Var, 
    // pero para simplificar, usaremos un color fijo base o manipularemos el string si es rgba
    // Para tu app, usemos una aproximación visual simple:
    
    gradient.addColorStop(0, colorHex.replace(')', ', 0.6)').replace('rgb', 'rgba')); // 60% opacidad arriba
    gradient.addColorStop(1, colorHex.replace(')', ', 0.0)').replace('rgb', 'rgba')); // 0% opacidad abajo (transparente)
    return gradient;
};

async function renderPortfolioEvolutionChart(targetContainerId) {
    const container = select(targetContainerId);
    if (!container) return;

    container.innerHTML = `<div class="chart-container skeleton" style="height: 220px; border-radius: var(--border-radius-lg);"><canvas id="portfolio-evolution-chart"></canvas></div>`;

    // 1. Obtención de datos (Igual que antes)
    await loadInversiones();
    const allMovements = await fetchAllMovementsForHistory();
    const filteredInvestmentAccounts = getVisibleAccounts().filter(account => !deselectedInvestmentTypesFilter.has(toSentenceCase(account.tipo || 'S/T')) && account.esInversion);
    const filteredAccountIds = new Set(filteredInvestmentAccounts.map(c => c.id));

    if (filteredInvestmentAccounts.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding:16px 0; background:transparent; border:none;"><p>No hay activos seleccionados.</p></div>`;
        return;
    }

    // Procesamiento de datos (Timeline)
    const timeline = [];
    const history = (db.inversiones_historial || []).filter(h => filteredAccountIds.has(h.cuentaId));
    history.forEach(v => timeline.push({ date: v.fecha.slice(0, 10), type: 'valuation', value: v.valor, accountId: v.cuentaId }));
    const cashFlowMovements = allMovements.filter(m => (m.tipo === 'movimiento' && filteredAccountIds.has(m.cuentaId)) || (m.tipo === 'traspaso' && (filteredAccountIds.has(m.cuentaOrigenId) || filteredAccountIds.has(m.cuentaDestinoId))));
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
         container.innerHTML = `<div class="empty-state" style="padding:16px 0; background:transparent; border:none;"><p>Datos insuficientes.</p></div>`;
         return;
    }
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const dailyData = new Map();
    let runningCapital = 0;
    const lastKnownValues = new Map();
    timeline.forEach(event => {
        if (event.type === 'cashflow') { runningCapital += event.value; }
        else if (event.type === 'valuation') { lastKnownValues.set(event.accountId, event.value); }
        let totalValue = 0;
        for (const value of lastKnownValues.values()) { totalValue += value; }
        dailyData.set(event.date, { capital: runningCapital, value: totalValue });
    });

    const sortedDates = [...dailyData.keys()].sort();
    const chartLabels = sortedDates;
    const capitalData = sortedDates.map(date => dailyData.get(date).capital / 100);
    const totalValueData = sortedDates.map(date => dailyData.get(date).value / 100);

    const chartCanvas = select('portfolio-evolution-chart');
    const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;
    if (!chartCtx) return;

    const existingChart = Chart.getChart(chartCanvas);
    if (existingChart) existingChart.destroy();
    
    chartCanvas.closest('.chart-container').classList.remove('skeleton');

    // --- AQUI EMPIEZA LA MAGIA VISUAL "LUJOSA" ---

    // 1. Obtenemos los colores base del CSS
    const colorSuccessHex = getComputedStyle(document.body).getPropertyValue('--c-success').trim();
    const colorDangerHex = getComputedStyle(document.body).getPropertyValue('--c-danger').trim();
    const colorPrimaryHex = getComputedStyle(document.body).getPropertyValue('--c-primary').trim();

    // 2. Determinamos la tendencia global (¿El final es mayor que el principio?)
    //    Si el valor actual es mayor que el capital aportado actual, estamos en GANANCIA (Verde).
    //    Si es menor, estamos en PÉRDIDA (Rojo).
    const currentVal = totalValueData[totalValueData.length - 1] || 0;
    const currentCap = capitalData[capitalData.length - 1] || 0;
    const isProfitable = currentVal >= currentCap;

    const mainColorHex = isProfitable ? colorSuccessHex : colorDangerHex;

    // 3. Creamos el Gradiente Vertical
    // (0,0) es arriba, (0, 300) es abajo.
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, hexToRgba(mainColorHex, 0.4)); // Arriba: Color con 40% de opacidad
    gradient.addColorStop(1, hexToRgba(mainColorHex, 0.0)); // Abajo: Totalmente transparente

    new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Valor Total',
					data: totalValueData,
                    borderColor: mainColorHex, // La línea sólida del color principal
                    backgroundColor: gradient, // El relleno degradado "Lujoso"
                    fill: true,                // ¡Activamos el relleno!
					tension: 0.4,              // Curva suave
					pointRadius: 0,            // Sin puntos para limpieza
                    pointHoverRadius: 6,       // Puntos aparecen al tocar
					borderWidth: 2.5,
				},
                {
                    label: 'Capital Aportado',
                    data: capitalData,
                    borderColor: colorPrimaryHex, // Azul para diferenciar
                    backgroundColor: 'transparent',
                    fill: false, 
                    pointRadius: 0,
                    borderWidth: 2,
                    borderDash: [5, 5], // Línea punteada para diferenciar del valor
                    order: 1 // Asegura que se pinte encima o debajo según se desee
                }
            ]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: false, 
                    ticks: { 
                        callback: value => formatCurrency(value * 100),
                        font: { size: 10, family: 'var(--font-family)' },
                        color: 'rgba(150, 150, 150, 0.5)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        borderDash: [5, 5]
                    }
                },
                x: { 
                    type: 'time', 
                    time: { unit: 'month', tooltipFormat: 'dd MMM yyyy' }, 
                    grid: { display: false },
                    ticks: {
                        font: { size: 10, family: 'var(--font-family)' },
                        color: 'rgba(150, 150, 150, 0.5)'
                    }
                }
            },
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top', 
                    align: 'end', 
                    labels: { 
                        usePointStyle: true, 
                        boxWidth: 8, 
                        padding: 10,
                        font: { size: 11, weight: '600' }
                    }
                },
                datalabels: { display: false },
                tooltip: { 
                    mode: 'index', 
                    intersect: false, 
                    backgroundColor: 'rgba(20, 20, 30, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#eee',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) label += formatCurrency(context.parsed.y * 100);
                            return label;
                        },
                        footer: (tooltipItems) => {
                            const total = tooltipItems.find(i => i.dataset.label === 'Valor Total')?.parsed.y || 0;
                            const capital = tooltipItems.find(i => i.dataset.label === 'Capital Aportado')?.parsed.y || 0;
                            const pnl = total - capital;
                            return `P&L: ${formatCurrency(pnl * 100)}`;
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

    // Limpiamos gráficos previos
    if (informeActivoChart) {
        informeActivoChart.destroy();
        informeActivoChart = null;
    }
    
    // Esqueleto de carga
    container.innerHTML = `<div class="skeleton" style="height: 200px; border-radius: var(--border-radius-lg);"></div>`;

    try {
        const reportRenderers = {
            'extracto_cuenta': () => { 
                // 1. HTML ACTUALIZADO (Con el botón TODO)
                const content = `
                    <div id="informe-cuenta-wrapper">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="informe-cuenta-select" class="form-label">Selecciona una cuenta:</label>
                            
                            <div style="display: flex; gap: 8px; align-items: stretch; width: 100%;">
                                <div class="input-wrapper" style="flex-grow: 1; min-width: 0;">
                                    <select id="informe-cuenta-select" class="form-select"></select>
                                </div>
                                <button id="btn-extracto-todo" class="btn btn--secondary" style="flex-shrink: 0; min-width: auto; padding: 0 16px; font-weight: 700; white-space: nowrap;" title="Ver todo ordenado por fecha">
                                    TODO
                                </button>
                            </div>
                            </div>
                    </div>
                    
                    <div id="informe-resultado-container" style="margin-top: var(--sp-4);">
                        <div class="empty-state" style="background:transparent; padding:var(--sp-2); border:none;">
                            <p style="font-size:0.85rem;">Selecciona una cuenta o pulsa <strong>TODO</strong>.</p>
                        </div>
                    </div>`;
                
                container.innerHTML = content;

                // 2. Lógica de activación
                const selectEl = select('informe-cuenta-select');
                if (selectEl) {
                    const populate = (el, data) => {
                        let opts = '<option value="">Seleccionar cuenta...</option>';
                        [...data].sort((a,b) => a.nombre.localeCompare(b.nombre))
                                 .forEach(cuenta => {
                                     opts += `<option value="${cuenta.id}">${cuenta.nombre}</option>`;
                                 });
                        el.innerHTML = opts;
                    };
                    populate(selectEl, getVisibleAccounts());

                    // Inicializamos el selector visual
                    createCustomSelect(selectEl);

                    // Evento al cambiar selección individual
                    selectEl.addEventListener('change', () => {
                        handleGenerateInformeCuenta(null, null);
                        setTimeout(() => {
                            if (document.activeElement) document.activeElement.blur();
                            const wrapper = selectEl.closest('.custom-select-wrapper');
                            if (wrapper) {
                                wrapper.classList.remove('is-open');
                                const trigger = wrapper.querySelector('.custom-select__trigger');
                                if (trigger) trigger.blur();
                            }
                        }, 50);
                    });
                }

                // 3. Lógica del Botón TODO (Crucial añadirla aquí también)
                const btnTodo = select('btn-extracto-todo');
                if (btnTodo) {
                    // Clonamos para eliminar listeners previos por seguridad
                    const newBtn = btnTodo.cloneNode(true);
                    btnTodo.parentNode.replaceChild(newBtn, btnTodo);
                    
                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.target.blur();
                        // Llamamos a la función global que ordena por fecha
                        if (typeof handleGenerateGlobalExtract === 'function') {
                            handleGenerateGlobalExtract(e.target);
                        }
                    });
                }
            },
            
            // Resto de informes (sin cambios)
            'flujo_caja': () => renderInformeFlujoCaja(container),
            'resumen_ejecutivo': () => renderInformeResumenEjecutivo(container),
            'rendimiento_inversiones': () => renderInformeRendimientoInversiones(container),
            'asignacion_activos': () => renderInformeAsignacionActivos(container)
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

    const pending = getPendingRecurrents();

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
                    <!-- Contenedor de acciones corregido para un mejor wrapping en móviles -->
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
                    <div id="contenedor-recurrentes-vertical">
                        ${itemsHTML}
                    </div>
                </div>
            </details>
        </div>`;
};

const renderPlanificacionPage = () => {
    const container = select(PAGE_IDS.PLANIFICAR);
    if (!container) return;

    // Estructura HTML final
    container.innerHTML = `
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
        
        <div class="card card--no-bg accordion-wrapper">
            <details class="accordion">
                <summary>
                    <h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);"><span class="material-icons">auto_graph</span>Informe Personalizado</h3>
                    <span class="material-icons accordion__icon">expand_more</span>
                </summary>
                <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-3);">
                        <h4 id="informe-widget-title" style="margin: 0; font-size: var(--fs-base); font-weight: 700; color: var(--c-on-surface);">Mi Informe</h4>
                        <button class="btn btn--secondary" data-action="show-informe-builder" style="padding: 4px 10px; font-size: 0.75rem;">
                            <span class="material-icons" style="font-size: 14px;">settings</span> Configurar
                        </button>
                    </div>
                    <div id="informe-widget-content">
                        <div class="skeleton" style="height: 240px; border-radius: var(--border-radius-lg);"></div>
                    </div>
                    </div>
            </details>
        </div>
    `;
    
    // Inicialización del selector de año para presupuestos
    const yearSelect = container.querySelector('#budget-year-selector');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        const years = new Set([currentYear]);
        (db.presupuestos || []).forEach(p => years.add(p.ano));
        
        yearSelect.innerHTML = [...years]
            .sort((a, b) => b - a)
            .map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`)
            .join('');

        yearSelect.addEventListener('change', () => {
            hapticFeedback('light');
            renderBudgetTracking();
        });
    }
    
    populateAllDropdowns();
    renderBudgetTracking();
    renderPendingRecurrents();
    renderRecurrentsListOnPage();

    // Cargamos el contenido del informe personalizado
    renderInformeWidgetContent();
};

const renderPatrimonioPage = () => {
    const container = select(PAGE_IDS.PATRIMONIO);
    if (!container) return;

    // Estructura HTML
    container.innerHTML = `
        <details class="accordion" style="margin-bottom: var(--sp-4);">
            <summary>
                <h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);">
                    <span class="material-icons">account_balance</span>
                    Visión General
                </h3>
                <span class="material-icons accordion__icon">expand_more</span>
            </summary>
            <div class="accordion__content" id="patrimonio-overview-container" style="padding: 0 var(--sp-2);">
                <div class="skeleton" style="height: 400px; border-radius: var(--border-radius-lg);"></div>
            </div>
        </details>

        <details id="acordeon-portafolio" class="accordion" style="margin-bottom: var(--sp-4);">
            <summary>
                <h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);">
                    <span class="material-icons">rocket_launch</span>
                    Portafolio de Inversión
                </h3>
                <span class="material-icons accordion__icon">expand_more</span>
            </summary>
            <div class="accordion__content" style="padding: 0 var(--sp-2);">
                <div id="portfolio-evolution-container">
                     <div class="chart-container skeleton" style="height: 220px; border-radius: var(--border-radius-lg);"></div>
                </div>
                <div id="portfolio-main-content" style="margin-top: var(--sp-4);">
                    <div class="skeleton" style="height: 300px; border-radius: var(--border-radius-lg);"></div>
                </div>
            </div>
        </details>
        
        <div class="card card--no-bg accordion-wrapper">
            <details id="acordeon-extracto_cuenta" class="accordion informe-acordeon">
                <summary id="summary-extracto-trigger" style="user-select: none; -webkit-user-select: none;"> 
                    <h3 class="card__title" style="margin:0; padding: 0; color: var(--c-on-surface);">
                        <span class="material-icons">wysiwyg</span>
                        <span>Extracto de Cuenta</span>
                    </h3>
                    <span class="material-icons accordion__icon">expand_more</span>
                </summary>
                <div class="accordion__content" style="padding: var(--sp-3) var(--sp-4);">
                    <div id="informe-content-extracto_cuenta">
                         <div id="informe-cuenta-wrapper">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label for="informe-cuenta-select" class="form-label">Selecciona una cuenta:</label>
                                
                                <div style="display: flex; gap: 8px; align-items: stretch; width: 100%;">
                                    <div class="input-wrapper" style="flex-grow: 1; min-width: 0;">
                                        <select id="informe-cuenta-select" class="form-select"></select>
                                    </div>
                                    <button id="btn-extracto-todo" class="btn btn--secondary" style="flex-shrink: 0; min-width: auto; padding: 0 16px; font-weight: 700; white-space: nowrap;" title="Ver todo ordenado por fecha">
                                        TODO
                                    </button>
                                </div>
                                </div>
                        </div>
                        <div id="informe-resultado-container" style="margin-top: var(--sp-4);">
                            <div class="empty-state" style="background:transparent; padding:var(--sp-2); border:none;">
                                <p style="font-size:0.85rem;">
                                    Selecciona una cuenta o pulsa <strong>TODO</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </details>
        </div>
    `;

    setTimeout(async () => {
        // Carga Visión General
        await renderPatrimonioOverviewWidget('patrimonio-overview-container');
        
        // --- LÓGICA DEL BOTÓN "TODO" REFORZADA ---
        const btnTodo = select('btn-extracto-todo');
        if (btnTodo) {
            // Eliminamos listeners previos clonando el nodo (truco de seguridad)
            const newBtn = btnTodo.cloneNode(true);
            btnTodo.parentNode.replaceChild(newBtn, btnTodo);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Evitar que cierre el acordeón
                e.target.blur();
                
                // Aseguramos que la función existe antes de llamarla
                if (typeof handleGenerateGlobalExtract === 'function') {
                    handleGenerateGlobalExtract(e.target);
                } else {
                    console.error("La función handleGenerateGlobalExtract no está definida.");
                    showToast("Error interno: función no encontrada.", "danger");
                }
            });
        }
        // ------------------------------

        // Lógica Selector Individual
        const selectCuenta = select('informe-cuenta-select');
        if (selectCuenta) {
            const populate = (el, data) => {
                let opts = '<option value="">Seleccionar cuenta...</option>';
                [...data].sort((a,b) => a.nombre.localeCompare(b.nombre))
                         .forEach(i => opts += `<option value="${i.id}">${i.nombre}</option>`);
                el.innerHTML = opts;
            };
            populate(selectCuenta, getVisibleAccounts());
            createCustomSelect(selectCuenta);

            selectCuenta.addEventListener('change', () => {
                handleGenerateInformeCuenta(null, null);
            });
        }

        // Lógica Portafolio
        const acordeonPortafolio = select('acordeon-portafolio');
        if (acordeonPortafolio) {
            const loadPortfolioData = async () => {
                await renderPortfolioEvolutionChart('portfolio-evolution-container');
                await renderPortfolioMainContent('portfolio-main-content');
            };
            acordeonPortafolio.addEventListener('toggle', async () => {
                if (acordeonPortafolio.open && !acordeonPortafolio.dataset.loaded) {
                    await loadPortfolioData();
                    acordeonPortafolio.dataset.loaded = "true"; 
                }
            });
        }
        
    }, 50);
};

const renderEstrategiaPage = () => {
    const container = select(PAGE_IDS.ESTRATEGIA);
    if (!container) return;

    // Se mantiene igual: dibuja el esqueleto una sola vez.
    container.innerHTML = `
        <div class="tabs">
            <button class="tab-item" data-action="switch-estrategia-tab" data-tab="planificacion">
                <span class="material-icons">edit_calendar</span>
                <span>Planificación</span>
            </button>
            <button class="tab-item" data-action="switch-estrategia-tab" data-tab="activos">
                <span class="material-icons">account_balance</span>
                <span>Activos</span>
            </button>
            <button class="tab-item" data-action="switch-estrategia-tab" data-tab="informes">
                <span class="material-icons">assessment</span>
                <span>Informes</span>
            </button>
        </div>
        
        <div class="tab-content" id="estrategia-planificacion-content"></div>
        <div class="tab-content" id="estrategia-activos-content"></div>
        <div class="tab-content" id="estrategia-informes-content"></div>
    `;

    // AHORA, llamamos a nuestra función controladora para que muestre la pestaña por defecto.
    // Al hacer esto, garantizamos que el HTML ya existe cuando se intente renderizar el contenido.
    showEstrategiaTab('planificacion');
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
            if (!nextDate) return false; 
            
            // ¡LA CORRECCIÓN CLAVE! Hacemos la misma normalización para ser consistentes.
            const normalizedNextDate = new Date(Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth(), nextDate.getUTCDate()));
            
            // Mostramos solo los que son estrictamente futuros (de mañana en adelante).
            return normalizedNextDate > today;
        })
        .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));

    if (upcomingRecurrents.length === 0) {
    container.innerHTML = `
        <div class="empty-state" style="background: transparent; border: none; padding: var(--sp-5) 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">📅</div>
            <h3 style="margin-bottom: 8px;">Agenda vacía</h3>
            <p style="max-width: 250px; margin: 0 auto; line-height: 1.5;">
                No tienes pagos futuros programados. <br>
                Cuando añadas un movimiento, marca la opción <strong>"Repetir"</strong>.
            </p>
        </div>`;
    return;
}

    container.innerHTML = upcomingRecurrents.map(r => {
        const nextDate = parseDateStringAsUTC(r.nextDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        
        const frequencyMap = { once: 'Única vez', daily: 'Diaria', monthly: 'Mensual', yearly: 'Anual' };
        let frequencyText = frequencyMap[r.frequency] || '';
        
        if (r.frequency === 'weekly' && r.weekDays && r.weekDays.length > 0) {
            const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
            frequencyText = `Semanal (${r.weekDays.map(d => dayNames[d]).join(', ')})`;
        }
        
        const amountClass = r.cantidad >= 0 ? 'text-positive' : 'text-negative';
        const icon = r.cantidad >= 0 ? 'south_west' : 'north_east';
        
        return `
        <div class="modal__list-item" id="page-recurrente-item-${r.id}" data-action="edit-recurrente" data-id="${r.id}">
			<div style="display: flex; align-items: center; gap: 12px; flex-grow: 1; min-width: 0;">
				<span class="material-icons ${amountClass}" style="font-size: 20px;">${icon}</span>
				<div style="display: flex; flex-direction: column; min-width: 0;">
					<span style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(r.descripcion)}</span>
				    <small style="color: var(--c-on-surface-secondary); font-size: var(--fs-xs);">Próximo: ${nextDate} (${frequencyText})</small>
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

/* EN main.js - REEMPLAZO DE updateNetWorthChart (LÓGICA CORRECTA) */

const updateNetWorthChart = async (saldos) => {
    const canvasId = 'net-worth-chart';
    const netWorthCanvas = select(canvasId);
    if (!netWorthCanvas) return;
    
    const chartContainer = netWorthCanvas.closest('.chart-container');
    
    // Limpieza
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();

    const allMovements = await fetchAllMovementsForHistory();
    const visibleAccountIds = new Set(Object.keys(saldos));

    // Si no hay datos
    if (allMovements.length === 0 && Object.keys(saldos).length === 0) {
        if (chartContainer) {
            chartContainer.classList.remove('skeleton');
            chartContainer.innerHTML = `<div class="empty-state" style="padding:2rem 0; background:transparent; border:none;"><p>Sin datos suficientes.</p></div>`;
        }
        return;
    }

    // 1. PREPARACIÓN DE DATOS (ORDEN CRONOLÓGICO: ANTIGUO -> NUEVO)
    // Filtramos solo movimientos que afecten a las cuentas visibles
    const relevantMovements = allMovements.filter(m => {
        if (m.tipo === 'traspaso') {
            // Es relevante si entra o sale de mi vista
            return visibleAccountIds.has(m.cuentaOrigenId) !== visibleAccountIds.has(m.cuentaDestinoId);
        }
        return visibleAccountIds.has(m.cuentaId);
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Ordenar: Antiguo a Reciente

    // 2. CALCULAR PUNTO DE PARTIDA
    // Saldo Actual Total
    const currentTotal = Object.values(saldos).reduce((sum, s) => sum + s, 0);
    
    // Calculamos el impacto total acumulado de todos los movimientos de la historia
    let totalHistoryImpact = 0;
    relevantMovements.forEach(m => {
        let impact = 0;
        if (m.tipo === 'traspaso') {
            const origenVis = visibleAccountIds.has(m.cuentaOrigenId);
            // Si sale (origen visible), resta. Si entra (destino visible), suma.
            impact = origenVis ? -m.cantidad : m.cantidad;
        } else {
            // Gasto (negativo) o Ingreso (positivo)
            impact = m.cantidad;
        }
        m.calculatedImpact = impact; // Guardamos esto para el bucle siguiente
        totalHistoryImpact += impact;
    });

    // Saldo Inicial Teórico = Saldo Actual - Todo lo que ha pasado
    let runningBalance = currentTotal - totalHistoryImpact;

    // 3. GENERAR PUNTOS DEL GRÁFICO
    // Empezamos con el punto inicial (antes del primer movimiento)
    const dataPoints = [];
    
    // Si hay movimientos, añadimos un punto inicial un día antes del primer movimiento
    if (relevantMovements.length > 0) {
        const firstDate = new Date(relevantMovements[0].fecha);
        firstDate.setDate(firstDate.getDate() - 1);
        dataPoints.push({ x: firstDate.toISOString().split('T')[0], y: runningBalance / 100 });
    } else {
        // Si no hay movimientos pero hay saldo (ej. saldos iniciales), línea plana
        const today = new Date().toISOString().split('T')[0];
        dataPoints.push({ x: today, y: currentTotal / 100 });
    }

    // Recorremos la historia sumando
    const dailyMap = new Map(); // Para agrupar movimientos del mismo día
    
    relevantMovements.forEach(m => {
        runningBalance += m.calculatedImpact;
        const dateKey = m.fecha.split('T')[0];
        // Guardamos el saldo al final de cada día
        dailyMap.set(dateKey, runningBalance / 100);
    });

    // Convertimos el mapa a puntos ordenados
    dailyMap.forEach((value, key) => {
        dataPoints.push({ x: key, y: value });
    });

    // Aseguramos que el gráfico llegue hasta hoy
    const todayKey = new Date().toISOString().split('T')[0];
    if (!dailyMap.has(todayKey)) {
        dataPoints.push({ x: todayKey, y: currentTotal / 100 });
    }

    // 4. RENDERIZADO
    if(chartContainer) {
        chartContainer.classList.remove('skeleton');
        chartContainer.classList.add('fade-in-up');
    }

    const ctx = netWorthCanvas.getContext('2d');
    
    // Gradiente sutil
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 179, 77, 0.15)'); // Color muy suave
    gradient.addColorStop(1, 'rgba(0, 179, 77, 0.0)');

    netWorthChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Patrimonio',
                data: dataPoints,
                borderColor: '#00B34D', // Verde principal
                borderWidth: 2,
                backgroundColor: gradient,
                fill: true,
                pointRadius: 0, // Línea limpia sin puntos
                pointHoverRadius: 6,
                tension: 0.1 // Línea casi recta para precisión (0.4 es muy curva)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { 
                    type: 'time', 
                    time: { unit: 'month', displayFormats: { month: 'MMM yy' } },
                    grid: { display: false },
                    ticks: { maxTicksLimit: 5, color: '#888', font: { size: 10 } }
                },
                y: { display: false } // Eje Y oculto para limpieza
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyFont: { size: 14, weight: 'bold' },
                    callbacks: {
                        label: (ctx) => formatCurrency(ctx.raw.y * 100)
                    }
                }
            }
        }
    });
};

const getLiquidityAccounts = () => {
    const visibleAccounts = getVisibleAccounts();
    return visibleAccounts.filter((c) => {
        const tipo = (c.tipo || '').trim().toUpperCase();
        // Incluir BANCOS, EFECTIVO y TARJETA
        return ['BANCO', 'EFECTIVO', 'TARJETA'].includes(tipo);
    });
};

const scheduleDashboardUpdate = () => {
    if (dashboardUpdateDebounceTimer) clearTimeout(dashboardUpdateDebounceTimer);
    
    dashboardUpdateDebounceTimer = setTimeout(async () => {
        const activePage = document.querySelector('.view--active');
        if (!activePage || activePage.id !== PAGE_IDS.PANEL) return;

        if (isDashboardRendering) return;
        isDashboardRendering = true;

        try {
            const saldos = await getSaldos();
            const visibleAccounts = getVisibleAccounts();
            
            // 1. Cálculos Patrimoniales
            const patrimonioTotal = visibleAccounts.reduce((sum, c) => sum + (saldos[c.id] || 0), 0);
            const investmentAccounts = visibleAccounts.filter(c => c.esInversion);
            const capitalAportadoTotal = investmentAccounts.reduce((sum, c) => sum + (saldos[c.id] || 0), 0);
            const liquidezTotal = patrimonioTotal - capitalAportadoTotal;
            
            // 2. Cálculos Inversión
            let valorMercadoTotal = 0;
            let pnlTotal = 0;
            if (investmentAccounts.length > 0) {
                for (const cuenta of investmentAccounts) {
                    const valoraciones = (db.inversiones_historial || [])
                        .filter(v => v.cuentaId === cuenta.id)
                        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                    const valorActual = valoraciones.length > 0 ? valoraciones[0].valor : 0;
                    valorMercadoTotal += valorActual;
                    pnlTotal += (valorActual - (saldos[cuenta.id] || 0));
                }
            }
            const portfolioPerf = await calculatePortfolioPerformance();
            
            // 3. Cálculos de Flujo
            const { current: currentMovs } = await getFilteredMovements(false);
            const visibleAccountIds = new Set(visibleAccounts.map(c => c.id));
            const { ingresos, gastos, saldoNeto } = calculateTotals(currentMovs, visibleAccountIds);
            
            // 4. Cálculos Salud
            const efData = calculateEmergencyFund(saldos, db.cuentas, recentMovementsCache);
            const fiData = calculateFinancialIndependence(patrimonioTotal, efData.gastoMensualPromedio);
            const tasaAhorro = (ingresos > 0 && saldoNeto > 0) ? (saldoNeto / ingresos) * 100 : 0;

            // --- ACTUALIZACIÓN UI ---

            // A. Hero (Patrimonio)
            const kpiPatrimonio = select('kpi-patrimonio-neto-value');
            if (kpiPatrimonio) {
                kpiPatrimonio.classList.remove('skeleton');
                animateCountUp(kpiPatrimonio, patrimonioTotal);
            }
            
            // B. Grid de Activos
            const kpiLiq = select('kpi-liquidez-value');
            if(kpiLiq) { kpiLiq.classList.remove('skeleton'); animateCountUp(kpiLiq, liquidezTotal); }
            
            const kpiInvTotal = select('kpi-inversion-total');
            if(kpiInvTotal) { kpiInvTotal.classList.remove('skeleton'); animateCountUp(kpiInvTotal, capitalAportadoTotal); }

            // C. Tarjeta Inversión (P&L y Rentabilidad)
            const kpiPnl = select('kpi-inversion-pnl');
            if (kpiPnl) {
                kpiPnl.classList.remove('skeleton');
                const sign = pnlTotal >= 0 ? '+' : '';
                kpiPnl.textContent = `${sign}${formatCurrency(pnlTotal)}`;
                kpiPnl.className = `status-value ${pnlTotal >= 0 ? 'text-positive' : 'text-negative'}`;
            }

            const kpiTir = select('kpi-inversion-pct');
            if (kpiTir) {
                kpiTir.classList.remove('skeleton');
                const tir = portfolioPerf.pnlPorcentual || 0;
                const signTir = tir >= 0 ? '+' : '';
                kpiTir.textContent = `${signTir}${tir.toFixed(1)}%`;
                kpiTir.className = `status-value ${tir >= 0 ? 'text-positive' : 'text-negative'}`;
            }

            // D. Flujo del Periodo (Solo Texto, SIN barras que causaban error)
            const elIng = select('kpi-ingresos-value');
            if (elIng) {
                [select('kpi-ingresos-value'), select('kpi-gastos-value'), select('kpi-saldo-neto-value')].forEach(el => el?.classList.remove('skeleton'));
                
                select('kpi-ingresos-value').textContent = `+${formatCurrency(ingresos)}`;
                select('kpi-gastos-value').textContent = `-${formatCurrency(Math.abs(gastos))}`;
                
                const elNet = select('kpi-saldo-neto-value');
                elNet.textContent = formatCurrency(saldoNeto);
                elNet.className = `status-value ${saldoNeto >= 0 ? 'text-positive' : 'text-negative'}`;
            }

            // E. Salud Financiera (Carrusel)
            
            // Ahorro
            const elAhorro = select('kpi-tasa-ahorro-value');
            if(elAhorro) {
                elAhorro.classList.remove('skeleton');
                elAhorro.textContent = `${tasaAhorro.toFixed(0)}%`;
                elAhorro.className = tasaAhorro >= 0 ? 'text-positive' : 'text-negative';
                renderSavingsRateGauge('kpi-savings-rate-chart', tasaAhorro);
            }

            // Cobertura
            const elRunway = select('health-runway-val');
            // CORRECCIÓN ID: Antes buscaba 'health-runway-progress', ahora el correcto 'health-runway-progress-bar'
            const barRunway = select('health-runway-progress-bar'); 
            
            if(elRunway) {
                elRunway.classList.remove('skeleton');
                const meses = efData.mesesCobertura;
                elRunway.textContent = isFinite(meses) ? (meses >= 100 ? '∞' : meses.toFixed(1)) : '∞';
                
                if (barRunway) {
                    let percentage = isFinite(meses) ? Math.min((meses / 6) * 100, 100) : 100;
                    barRunway.style.width = `${percentage}%`;
                    
                    if (meses >= 6) barRunway.style.backgroundColor = 'var(--c-success)';
                    else if (meses >= 3) barRunway.style.backgroundColor = 'var(--c-warning)';
                    else barRunway.style.backgroundColor = 'var(--c-danger)';
                }
            }

            // Libertad
            const elFi = select('health-fi-val');
            const barFi = select('health-fi-progress-bar');
            if(elFi) {
                elFi.classList.remove('skeleton');
                elFi.textContent = `${fiData.progresoFI.toFixed(1)}%`;
                if (barFi) {
                    barFi.style.width = `${Math.min(fiData.progresoFI, 100)}%`;
                    barFi.style.backgroundColor = 'var(--c-success)';
                }
            }

        } catch (error) {
            console.error("Error actualizando cockpit:", error);
        } finally {
            isDashboardRendering = false;
        }
    }, 300);
};


/* EN main.js - REEMPLAZO DE updateDashboardData */

const updateDashboardData = async () => {
    const activePage = document.querySelector('.view--active');
    if (!activePage || activePage.id !== PAGE_IDS.PANEL) return;

    if (isDashboardRendering) return;
    isDashboardRendering = true;

    try {
        const { current } = await getFilteredMovements(true);
        const saldos = await getSaldos();
        const visibleAccounts = getVisibleAccounts();
        const visibleAccountIds = new Set(Object.keys(saldos));
        
        // 1. Cálculos de Flujo
        let ingresos = 0, gastos = 0, saldoNeto = 0;
        current.forEach(m => {
            const amount = calculateMovementAmount(m, visibleAccountIds);
            if (amount > 0) ingresos += amount;
            else gastos += amount;
            saldoNeto += amount;
        });
        const tasaAhorroActual = ingresos > 0 ? (saldoNeto / ingresos) * 100 : (saldoNeto < 0 ? -100 : 0);

        // 2. Cálculos de Estado
        let totalLiquidez = 0;
        let patrimonioNeto = 0;
        visibleAccounts.forEach(c => {
            const saldo = saldos[c.id] || 0;
            patrimonioNeto += saldo;
            if (!c.esInversion && !['PRÉSTAMO', 'TARJETA DE CRÉDITO'].includes((c.tipo || '').toUpperCase())) {
                totalLiquidez += saldo;
            }
        });

        // 3. Cálculos Avanzados
        const portfolioPerf = await calculatePortfolioPerformance(); 
        const efData = calculateEmergencyFund(saldos, db.cuentas, recentMovementsCache);
        const fiData = calculateFinancialIndependence(patrimonioNeto, efData.gastoMensualPromedio);

        // --- ACTUALIZACIÓN UI ---

        // Patrimonio
        const kpiPatrimonio = select('kpi-patrimonio-neto-value');
        if (kpiPatrimonio) {
            kpiPatrimonio.classList.remove('skeleton');
            animateCountUp(kpiPatrimonio, patrimonioNeto);
        }

        // Liquidez
        const kpiLiquidez = select('kpi-liquidez-value');
        if (kpiLiquidez) { kpiLiquidez.classList.remove('skeleton'); animateCountUp(kpiLiquidez, totalLiquidez); }
        
        // Inversiones
        const kpiInvTotal = select('kpi-inversion-total');
        if (kpiInvTotal) { kpiInvTotal.classList.remove('skeleton'); animateCountUp(kpiInvTotal, portfolioPerf.valorActual); }
        
        // P&L
        const kpiInvPnl = select('kpi-inversion-pnl');
        if (kpiInvPnl) {
            kpiInvPnl.classList.remove('skeleton');
            const pnl = portfolioPerf.pnlAbsoluto;
            const sign = pnl >= 0 ? '+' : '';
            kpiInvPnl.textContent = `${sign}${formatCurrency(pnl)}`;
            kpiInvPnl.className = `status-value ${pnl >= 0 ? 'text-positive' : 'text-negative'}`;
            kpiInvPnl.style.fontSize = "1.1rem";
        }
        
        // Rentabilidad
        const kpiInvPct = select('kpi-inversion-pct');
        if (kpiInvPct) {
            kpiInvPct.classList.remove('skeleton');
            const pct = portfolioPerf.pnlPorcentual;
            const sign = pct >= 0 ? '+' : '';
            kpiInvPct.textContent = `${sign}${pct.toFixed(2)}%`;
            kpiInvPct.className = `status-value ${pct >= 0 ? 'text-positive' : 'text-negative'}`;
            kpiInvPct.style.fontSize = "1.1rem";
        }

        // Flujo del Periodo
        const elIng = select('kpi-ingresos-value');
        if (elIng) {
            [elIng, select('kpi-gastos-value'), select('kpi-saldo-neto-value')].forEach(el => el.classList.remove('skeleton'));
            animateCountUp(elIng, ingresos);
            animateCountUp(select('kpi-gastos-value'), gastos);
            animateCountUp(select('kpi-saldo-neto-value'), saldoNeto);
            select('kpi-saldo-neto-value').className = `status-value ${saldoNeto >= 0 ? 'text-positive' : 'text-negative'}`;
        }

        // Salud Financiera (Solo Texto)
        
        // Ahorro
        const kpiAhorro = select('kpi-tasa-ahorro-value');
        if (kpiAhorro) {
            kpiAhorro.classList.remove('skeleton');
            kpiAhorro.textContent = `${tasaAhorroActual.toFixed(0)}%`;
        }
        
        // Cobertura
        const kpiRunway = select('health-runway-val');
        if (kpiRunway) {
            kpiRunway.classList.remove('skeleton');
            const meses = efData.mesesCobertura;
            kpiRunway.textContent = isFinite(meses) ? (meses >= 100 ? '∞' : meses.toFixed(1)) : '∞';
        }
        
        // Libertad
        const kpiFi = select('health-fi-val');
        if (kpiFi) {
            kpiFi.classList.remove('skeleton');
            kpiFi.textContent = `${fiData.progresoFI.toFixed(1)}%`;
        }

    } catch (error) {
        console.error("Error en updateDashboardData:", error);
    } finally {
        isDashboardRendering = false;
    }
};


let informeChart = null; // Variable global para el gráfico del informe
let informeBuilderDebounceTimer = null;


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
        

		let suggestionDebounceTimer = null;

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

// En main.js

const showModal = (id) => {
    const m = select(id);
    if (m) {
        // --- NUEVA LÓGICA DE HISTORIAL ---
        // Solo añadimos historia si el modal NO estaba ya abierto (para evitar duplicados)
        if (!m.classList.contains('modal-overlay--active')) {
            // pushState añade una entrada al historial del navegador.
            // 1er param: datos del estado ({ modalId: id })
            // 2do param: título (no se usa mucho hoy día)
            // 3er param: URL visual (añadimos un hash #modal-id para que se vea pro)
            window.history.pushState({ modalId: id }, '', `#modal-${id}`);
        }
        // ---------------------------------

        m.classList.add('modal-overlay--active');
        select('app-root').classList.add('app-layout--transformed-by-modal');

        // (Resto de tu código original para gestos y foco...)
        const modalElement = m.querySelector('.modal');
        if (modalElement) {
            modalElement.addEventListener('mousedown', handleModalDragStart);
            modalElement.addEventListener('touchstart', handleModalDragStart, { passive: true });
        }
        // ... listeners de drag ...
        if (!id.includes('calculator')) {
            const f = m.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (f) f.focus();
        }
    }
};

const hideModal = (id) => {
    if (document.activeElement) document.activeElement.blur(); 
    const m = select(id);
    
    // --- NUEVA LÓGICA DE HISTORIAL ---
    // Verificamos: ¿El estado actual del historial pertenece a ESTE modal?
    if (window.history.state && window.history.state.modalId === id) {
        // Si es así, volvemos atrás en el historial nosotros mismos.
        // Esto disparará el evento 'popstate', pero como ya hemos cerrado visualmente
        // o lo vamos a hacer, el flujo se mantiene correcto.
        window.history.back();
        // Nota: Al hacer history.back(), se disparará el listener de popstate que
        // se encargará de la limpieza visual si aún no se ha hecho.
        // Pero para asegurar una respuesta instantánea (UI Optimista),
        // dejamos el código visual aquí abajo también.
    }
    // ---------------------------------

    if (m) {
        m.classList.remove('modal-overlay--active');
        select('app-root').classList.remove('app-layout--transformed-by-modal');

        const modalElement = m.querySelector('.modal');
        // ... (resto de tu código de limpieza de listeners) ...
        if (modalElement) {
            modalElement.removeEventListener('mousedown', handleModalDragStart);
            modalElement.removeEventListener('touchstart', handleModalDragStart);
            modalElement.style.transform = ''; // Resetear posición
        }
        
        // Limpiar listeners globales de arrastre
        document.removeEventListener('mousemove', handleModalDragMove);
        document.removeEventListener('touchmove', handleModalDragMove);
        document.removeEventListener('mouseup', handleModalDragEnd);
        document.removeEventListener('touchend', handleModalDragEnd);
    }

    // (Resto de tu código de scroll restoration)
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
        
        const showGenericModal=(title,html)=>{const titleEl = select('generic-modal-title'); if (titleEl) titleEl.textContent=title; const bodyEl = select('generic-modal-body'); if(bodyEl) bodyEl.innerHTML=html;showModal('generic-modal');};
	const handleShowIrrBreakdown = async (accountId) => {
    const cuenta = db.cuentas.find(c => c.id === accountId);
    if (!cuenta) return;

    // 1. Damos feedback al usuario y mostramos un modal de carga.
    hapticFeedback('light');
    showGenericModal(`Desglose TIR: ${cuenta.nombre}`, `<div style="text-align:center; padding: var(--sp-5);"><span class="spinner"></span></div>`);

    // 2. Reutilizamos la lógica que ya existe para obtener los datos crudos.
    await loadInversiones(); // Nos aseguramos de tener los datos de inversión
    const allMovements = await fetchAllMovementsForHistory();
    
    // Filtramos solo los movimientos que afectan a ESTA cuenta
    const accountMovements = allMovements.filter(m => 
        (m.tipo === 'movimiento' && m.cuentaId === accountId) ||
        (m.tipo === 'traspaso' && (m.cuentaDestinoId === accountId || m.cuentaOrigenId === accountId))
    );
    
    // Buscamos la última valoración manual para esta cuenta
    const valuations = (db.inversiones_historial || [])
        .filter(v => v.cuentaId === accountId)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    const valorActual = valuations.length > 0 ? valuations[0].valor : 0;
    
    // 3. Convertimos los movimientos en flujos de caja claros (positivo/negativo).
    let cashflows = accountMovements.map(mov => {
        let effectOnAccount = 0; // El impacto real en el saldo de esta cuenta
        if (mov.tipo === 'movimiento') {
            effectOnAccount = mov.cantidad;
        } else if (mov.tipo === 'traspaso') {
            if (mov.cuentaDestinoId === accountId) effectOnAccount = mov.cantidad;
            else if (mov.cuentaOrigenId === accountId) effectOnAccount = -mov.cantidad;
        }

        if (effectOnAccount !== 0) {
            // Un 'effectOnAccount' positivo es una aportación (flujo de caja negativo para la TIR)
            // Un 'effectOnAccount' negativo es una retirada (flujo de caja positivo para la TIR)
            return { 
                date: new Date(mov.fecha), 
                amount: -effectOnAccount, 
                type: -effectOnAccount > 0 ? 'retirada' : 'aportacion' 
            };
        }
        return null;
    }).filter(cf => cf !== null); // Limpiamos los movimientos que no afectaron

    // 4. Añadimos el valor actual como el "desembolso final" positivo del cálculo.
    cashflows.push({ date: new Date(), amount: valorActual, type: 'valoracion' });

    // 5. Ordenamos todo cronológicamente y construimos la tabla HTML.
    cashflows.sort((a, b) => a.date.getTime() - b.date.getTime());

    let modalHtml = `<p class="form-label" style="margin-bottom: var(--sp-3);">Esta es la lista de flujos de caja usados para calcular la Tasa Interna de Retorno (TIR).</p>
        <div class="informe-extracto-container">
            <div class="informe-linea-header">
                <span class="fecha">Fecha</span>
                <span class="descripcion">Tipo</span>
                <span class="importe">Importe</span>
            </div>`;
    
    cashflows.forEach(cf => {
        const date = cf.date.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'});
        const typeLabel = cf.type === 'aportacion' ? 'Aportación (-)' : (cf.type === 'retirada' ? 'Retirada (+)' : 'Valoración Final (+)');
        const colorClass = cf.amount < 0 ? 'text-gasto' : 'text-ingreso'; // Reutilizamos clases de color que ya tienes

        modalHtml += `
            <div class="informe-linea-movimiento">
                <span class="fecha">${date}</span>
                <span class="descripcion">${typeLabel}</span>
                <span class="importe ${colorClass}">${formatCurrency(cf.amount)}</span>
            </div>`;
    });
    
    modalHtml += `</div>`;
    
    // 6. Mostramos el resultado final en el modal.
    showGenericModal(`Desglose TIR: ${cuenta.nombre}`, modalHtml);
};	
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
                // Aplicamos la clase que dispara la animación con un pequeño retardo
                // para cada elemento, creando el efecto cascada.
                setTimeout(() => {
                    item.classList.add('item-enter-active');
                }, index * 40); // 40 milisegundos de retraso entre cada item
            });
        }
    }, 50); // Un pequeño retardo para asegurar que el modal es visible
	setTimeout(() => {
        applyInvestmentItemInteractions(document.getElementById('generic-modal-body'));
    }, 100);
};
        const showConfirmationModal=(msg, onConfirm, title="Confirmar Acción")=>{ hapticFeedback('medium'); const id='confirmation-modal';const existingModal = document.getElementById(id); if(existingModal) existingModal.remove(); const overlay=document.createElement('div');overlay.id=id;overlay.className='modal-overlay modal-overlay--active'; overlay.innerHTML=`<div class="modal" role="alertdialog" style="border-radius:var(--border-radius-lg)"><div class="modal__header"><h3 class="modal__title">${title}</h3></div><div class="modal__body"><p>${msg}</p><div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-4);"><button class="btn btn--secondary btn--full" data-action="close-modal" data-modal-id="confirmation-modal">Cancelar</button><button class="btn btn--danger btn--full" data-action="confirm-action">Sí, continuar</button></div></div></div>`; document.body.appendChild(overlay); (overlay.querySelector('[data-action="confirm-action"]')).onclick=()=>{hapticFeedback('medium');onConfirm();overlay.remove();}; (overlay.querySelector('[data-action="close-modal"]')).onclick=()=>overlay.remove(); };

		
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

    const titleEl = select('form-movimiento-title');
    const amountGroup = select('movimiento-cantidad-form-group');
    const mode = select('movimiento-mode').value;

    select('movimiento-fields').classList.toggle('hidden', isTraspaso);
    select('traspaso-fields').classList.toggle('hidden', !isTraspaso);

    if (titleEl) titleEl.classList.remove('title--gasto', 'title--ingreso', 'title--traspaso');
    if (amountGroup) amountGroup.classList.remove('is-gasto', 'is-ingreso', 'is-traspaso');

    if (titleEl && amountGroup) {
        const isEditing = mode.startsWith('edit');
        let baseTitle = isEditing ? 'Editar' : 'Nuevo';
		// Detectar si venimos de duplicar un movimiento
		if (titleEl.textContent === 'Duplicar Movimiento') {
        baseTitle = 'Duplicar';
		}

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
                // [CAMBIO UX] Si es un nuevo traspaso y la descripción está vacía, la rellenamos.
                if (!isEditing && select('movimiento-descripcion').value.trim() === '') {
                    select('movimiento-descripcion').value = 'Traspaso';
                }
                break;
        }
    }
    
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
/* --- REEMPLAZA TU FUNCIÓN renderQuickAccessChips ACTUAL POR ESTA --- */

const renderQuickAccessChips = () => {
    // Lógica de accesos rápidos inteligentes ELIMINADA.
    const container = document.getElementById('quick-access-chips');
    if (container) {
        container.innerHTML = '';
        container.style.display = 'none';
    }
};


const startMovementForm = async (id = null, isRecurrent = false, initialType = 'gasto') => {
    hapticFeedback('medium');
    const form = select('form-movimiento');
    if (!form) return;
    
    let data = null;
    let mode = 'new';

    form.reset();
    clearAllErrors(form.id);
    
    // Rellenamos los desplegables
    populateAllDropdowns();

    // Resetear selector de días semanal
    selectAll('.day-selector-btn').forEach(btn => btn.classList.remove('active'));
    const weeklySelector = select('weekly-day-selector');
    if (weeklySelector) weeklySelector.classList.add('hidden');
    
    if (id) {
        try {
            const collectionName = isRecurrent ? 'recurrentes' : 'movimientos';
            const doc = await fbDb.collection('users').doc(currentUser.uid).collection(collectionName).doc(id).get();

            if (doc.exists) {
                data = { id: doc.id, ...doc.data() };
                mode = isRecurrent ? 'edit-recurrent' : 'edit-single';
                initialType = data.tipo === 'traspaso' ? 'traspaso' : (data.cantidad < 0 ? 'gasto' : 'ingreso');
            } else {
                showToast("Error: No se encontró el elemento.", "danger");
                id = null;
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            return;
        }
    }

    setMovimientoFormType(initialType);
    select('movimiento-mode').value = mode;
    select('movimiento-id').value = id || '';

    if (data) {
        // --- Lógica de Edición (Cargar datos) ---
        select('movimiento-cantidad').value = `${(Math.abs(data.cantidad) / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, useGrouping: false })}`;
        
        const fechaInput = select('movimiento-fecha');
        const dateStringForInput = isRecurrent ? data.nextDate : data.fecha;
        if (dateStringForInput) {
            const fechaISO = dateStringForInput.includes('T') ? dateStringForInput.split('T')[0] : dateStringForInput;
            if (fechaISO) {
                fechaInput.value = fechaISO;
                updateDateDisplay(fechaInput); 
            }
        }

        select('movimiento-descripcion').value = data.descripcion || '';

        const setSelectValue = (selectId, value) => {
            const el = select(selectId);
            if (el) {
                el.value = value || '';
                el.dispatchEvent(new Event('change')); 
            }
        };

        if (data.tipo === 'traspaso') {
            setSelectValue('movimiento-cuenta-origen', data.cuentaOrigenId);
            setSelectValue('movimiento-cuenta-destino', data.cuentaDestinoId);
        } else {
            setSelectValue('movimiento-cuenta', data.cuentaId);
            setSelectValue('movimiento-concepto', data.conceptoId);
        }

        // Recurrentes
        const recurrenteCheckbox = select('movimiento-recurrente');
        const recurrentOptions = select('recurrent-options');
        
        if (mode === 'edit-recurrent') {
            if (recurrenteCheckbox) recurrenteCheckbox.checked = true;
            setSelectValue('recurrent-frequency', data.frequency);
            if(select('recurrent-next-date')) select('recurrent-next-date').value = data.nextDate;
            if(select('recurrent-end-date')) select('recurrent-end-date').value = data.endDate || '';
            if(recurrentOptions) recurrentOptions.classList.remove('hidden');
            if (data.frequency === 'weekly' && data.weekDays) {
                if(select('weekly-day-selector')) select('weekly-day-selector').classList.remove('hidden');
                data.weekDays.forEach(day => {
                    const btn = document.querySelector(`.day-selector-btn[data-day="${day}"]`);
                    if(btn) btn.classList.add('active');
                });
            }
        } else {
            if (recurrenteCheckbox) recurrenteCheckbox.checked = false;
            if (recurrentOptions) recurrentOptions.classList.add('hidden');
        }

    } else {
        // --- Lógica de Nuevo Movimiento ---
        const fechaInput = select('movimiento-fecha');
        const now = new Date();
        const localIsoDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
        fechaInput.value = localIsoDate;
        updateDateDisplay(fechaInput);
    }
    
    // Gestión de botones
    const deleteBtn = select('delete-movimiento-btn');
    const duplicateBtn = select('duplicate-movimiento-btn'); 
    if (deleteBtn) {
        deleteBtn.classList.toggle('hidden', !id || !data);
        deleteBtn.dataset.isRecurrent = String(isRecurrent);
    }
    if (duplicateBtn) {
        duplicateBtn.classList.toggle('hidden', !(mode === 'edit-single' && data));
    }

    showModal('movimiento-modal');
    
    if (typeof initAmountInput === 'function') initAmountInput(); 
    if (typeof setupFormNavigation === 'function') setupFormNavigation();

    // ▼▼▼ AQUÍ ESTÁ LA MEJORA 1: AUTO-APERTURA INTELIGENTE ▼▼▼
    if (mode === 'new') {
        setTimeout(() => {
            const amountInput = select('movimiento-cantidad');
            if (amountInput) {
                // En lugar de solo focus(), llamamos directamente a la calculadora
                showCalculator(amountInput);
            }
        }, 300); // Un poco más de tiempo para asegurar que el modal terminó de subir
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
            Introduce el valor de mercado actual para <strong>${escapeHTML(cuenta.nombre)}</strong>.
        </p>
        <div class="form-group">
            <label for="valoracion-valor" class="form-label">Nuevo Valor Total</label>
            <input type="text" id="valoracion-valor" class="form-input input-amount-calculator" inputmode="none" required value="${valorActualInput}" placeholder="0,00" autocomplete="off">
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
    
    // IMPORTANTE: Inicializamos el input recién creado para que use la calculadora
    setTimeout(() => initAmountInput(), 50);
};

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
    const fecha = select('valoracion-fecha').value; // 'fecha' ya es un string "YYYY-MM-DD"
    
    if (isNaN(valor) || !fecha || valor < 0) {
        showToast('El valor debe ser un número positivo y la fecha es obligatoria.', "warning");
        setButtonLoading(btn, false);
        return;
    }
    
    // ▼▼▼ ¡ESTA ES LA ÚNICA LÍNEA QUE CAMBIA! ▼▼▼
    // Simplemente usamos la fecha del input directamente. Ya no la convertimos a un timestamp completo.
    const fechaISO = fecha;
    // ▲▲▲ FIN DEL CAMBIO ▲▲▲
    
    const valorEnCentimos = Math.round(valor * 100);

    try {
        const userRef = fbDb.collection('users').doc(currentUser.uid);
        // Ahora la query busca una coincidencia exacta de la cadena "YYYY-MM-DD", que es lo correcto.
        const query = userRef.collection('inversiones_historial').where('cuentaId', '==', cuentaId).where('fecha', '==', fechaISO).limit(1);
        const existingSnapshot = await query.get();

        let docId;
        if (!existingSnapshot.empty) {
            // Si ya existe una valoración para este día, la actualizamos.
            docId = existingSnapshot.docs[0].id;
			await existingSnapshot.docs[0].ref.update({ valor: valorEnCentimos });
        } else {
            // Si no existe, creamos una nueva.
            docId = generateId();
            // Guardamos directamente 'fechaISO' que ahora es "YYYY-MM-DD"
            await saveDoc('inversiones_historial', docId, { id: docId, cuentaId, valor: valorEnCentimos, fecha: fechaISO });
        }

        // --- El resto de la función para la actualización optimista de la UI se mantiene igual ---
        // Buscamos si ya existe una valoración para esta fecha en nuestra memoria local.
        const existingIndex = (db.inversiones_historial || []).findIndex(v => v.cuentaId === cuentaId && v.fecha === fechaISO);

        if (existingIndex > -1) {
            // Si existe, la actualizamos directamente en la memoria.
            db.inversiones_historial[existingIndex].valor = valorEnCentimos;
        } else {
            // Si no existe, la añadimos a la memoria.
            if (!db.inversiones_historial) db.inversiones_historial = [];
            db.inversiones_historial.push({ id: docId, cuentaId, valor: valorEnCentimos, fecha: fechaISO });
        }

        const tipoDeCuenta = toSentenceCase(cuenta.tipo || 'S/T');
        deselectedInvestmentTypesFilter.delete(tipoDeCuenta);
        
        // Llamamos a las funciones que renderizan el portafolio para ver el cambio
        await renderPortfolioMainContent('portfolio-main-content');
        await renderPortfolioEvolutionChart('portfolio-evolution-container');

        // Aplicamos una animación de "destello" para dar feedback visual de la actualización.
		setTimeout(() => {
            const updatedCard = document.querySelector(`.modal__list-item[data-id="${cuentaId}"]`);
            if (updatedCard) {
                updatedCard.classList.add('highlight-animation');
                updatedCard.addEventListener('animationend', () => {
                    updatedCard.classList.remove('highlight-animation');
                }, { once: true });
            }
        }, 50);
        
        setButtonLoading(btn, false);
        hideModal('generic-modal');
        hapticFeedback('success');
        showToast('Valoración guardada y cálculos actualizados.');

    } catch (error) {
        console.error("Error al guardar la valoración:", error);
        showToast("No se pudo guardar la valoración.", "danger");
        setButtonLoading(btn, false);
    }
};

const showHelpModal = () => {
    const titleEl = select('help-modal-title');
    const bodyEl = select('help-modal-body');

    if (titleEl) titleEl.innerHTML = 'Centro de Conocimiento';

    if (bodyEl) {
        bodyEl.innerHTML = `
            <div class="help-tabs">
                <button class="help-tab-btn active" onclick="switchHelpTab('piloto')">
                    <span class="material-icons" style="font-size: 18px;">auto_stories</span> El Cuento
                </button>
                <button class="help-tab-btn" onclick="switchHelpTab('experto')">
                    <span class="material-icons" style="font-size: 18px;">terminal</span> Manual Técnico
                </button>
            </div>

            <div id="help-pane-piloto" class="help-content-pane active">
                <div class="help-hero">
                    <span class="material-icons help-hero__icon">smart_toy</span>
                    <h2 style="margin: 10px 0 5px;">Hola, soy aiDANaI</h2>
                    <p style="color: var(--c-on-surface-secondary); max-width: 90%; margin: 0 auto;">
                        Tu asistente financiero de bolsillo. No soy un banco, soy tu libreta mágica.
                    </p>
                </div>

                <div class="help-card">
                    <div class="help-card__icon" style="background: #e3f2fd; color: #1976d2;"><span class="material-icons">menu_book</span></div>
                    <div class="help-card__content">
                        <h4>Capítulo 1: El Diario</h4>
                        <p>Imagina que cada vez que compras el pan o cobras la nómina, lo apuntas en una hoja. Eso es el <strong>Diario</strong>. Simplemente pulsa el botón <strong>+</strong> y dile a la app lo que ha pasado. Ella lo recordará por ti.</p>
                    </div>
                </div>

                <div class="help-card">
                    <div class="help-card__icon" style="background: #e8f5e9; color: #2e7d32;"><span class="material-icons">speed</span></div>
                    <div class="help-card__content">
                        <h4>Capítulo 2: El Panel</h4>
                        <p>Es tu espejo mágico. Te dice de un vistazo:</p>
                        <ul style="margin-top:4px; padding-left:15px; font-size:0.85rem;">
                            <li><strong>Patrimonio:</strong> Todo lo que tienes menos lo que debes.</li>
                            <li><strong>Liquidez:</strong> El dinero que puedes gastar hoy mismo.</li>
                            <li><strong>Salud:</strong> Barras de colores que te dicen si vas bien.</li>
                        </ul>
                    </div>
                </div>

                <div class="help-card">
    <div class="help-card__icon" style="background: #f3e5f5; color: #7b1fa2;"><span class="material-icons">inventory_2</span></div>
    <div class="help-card__content">
        <h4>Capítulo 3: El Tridente (A, B y C)</h4>
        <p>Ahora tienes tres dimensiones para organizar tu dinero.</p>
        <ul style="margin-top:6px; padding-left:15px; font-size:0.85rem;">
            <li><strong style="color:var(--c-primary)">Caja A (Azul):</strong> Tu economía principal y oficial.</li>
            <li><strong style="color:var(--c-danger)">Caja B (Roja):</strong> Tus ahorros o gastos privados.</li>
            <li><strong style="color:var(--c-success)">Caja C (Verde):</strong> Proyectos especiales, hucha conjunta o lo que tú quieras.</li>
        </ul>
        <p style="margin-top:6px; font-size:0.85rem;">Pulsa el botón de la esquina superior izquierda para rotar entre ellas.</p>
    </div>
</div>
                
                <div class="help-card">
                    <div class="help-card__icon" style="background: #fff3e0; color: #ef6c00;"><span class="material-icons">calculate</span></div>
                    <div class="help-card__content">
                        <h4>Truco Final: Calculadora</h4>
                        <p>¿Cena con amigos? Al poner el importe, puedes escribir <code>20 + 15 / 2</code> y la app calculará el resultado antes de guardarlo. ¡Sin salir de la pantalla!</p>
                    </div>
                </div>
            </div>

            <div id="help-pane-experto" class="help-content-pane">
                
                <p class="form-label" style="margin-bottom:15px;">Documentación técnica de las capacidades avanzadas de DaniCtas.</p>

                <details class="accordion help-accordion">
                    <summary><strong>1. Arquitectura de Datos (PWA)</strong> <span class="material-icons accordion__icon">expand_more</span></summary>
                    <div class="accordion__content">
                        <p><strong>Local-First:</strong> La app utiliza <code>IndexedDB</code> para almacenar todos los datos en el dispositivo. Funciona 100% offline.</p>
                        <p><strong>Sincronización:</strong> Cuando hay red, los cambios se replican asíncronamente a <strong>Firebase Firestore</strong>. El sistema de autenticación mantiene los datos encriptados y aislados por UID de usuario.</p>
                    </div>
                </details>

                <details class="accordion help-accordion" style="margin-top: 8px;">
                    <summary><strong>2. Motor de Inversiones (MWRR & P&L)</strong> <span class="material-icons accordion__icon">expand_more</span></summary>
                    <div class="accordion__content">
                        <p>El cálculo de rendimiento no es una simple resta. Utilizamos algoritmos financieros profesionales:</p>
                        <ul>
                            <li><strong>P&L (Profit & Loss):</strong> Se calcula como <code>Valor Mercado - Capital Aportado Neto</code>. Las aportaciones suman capital, las retiradas restan capital, pero la ganancia se mantiene en el valor de mercado.</li>
                            <li><strong>TIR (XIRR):</strong> Utilizamos el método de Newton-Raphson para resolver la Tasa Interna de Retorno anualizada basada en los flujos de caja irregulares (aportaciones/retiradas) y sus fechas exactas.</li>
                        </ul>
                    </div>
                </details>

                <details class="accordion help-accordion" style="margin-top: 8px;">
                    <summary><strong>3. Sistema de Importación CSV</strong> <span class="material-icons accordion__icon">expand_more</span></summary>
                    <div class="accordion__content">
                        <p>El importador inteligente analiza archivos bancarios y realiza las siguientes operaciones:</p>
                        <ul>
                            <li><strong>Detección de Tipos:</strong> Infiere si una cuenta es de Inversión o Tarjeta basándose en palabras clave en el nombre.</li>
                            <li><strong>Algoritmo de Traspasos:</strong> Busca movimientos con el mismo importe (uno positivo, uno negativo) en la misma fecha y los fusiona automáticamente en un único movimiento de tipo "Traspaso" entre cuentas.</li>
                            <li><strong>Formato:</strong> <code>FECHA;CUENTA;CONCEPTO;IMPORTE;DESCRIPCIÓN</code>.</li>
                        </ul>
                    </div>
                </details>
                
                <details class="accordion help-accordion" style="margin-top: 8px;">
                    <summary><strong>4. Lógica de Planificación (Recurrentes)</strong> <span class="material-icons accordion__icon">expand_more</span></summary>
                    <div class="accordion__content">
                        <p>El sistema de recurrentes no crea movimientos "fantasma".</p>
                        <ul>
                            <li><strong>Proyección:</strong> Calcula las fechas futuras basándose en la frecuencia (mensual, semanal, anual).</li>
                            <li><strong>Ejecución:</strong> Cuando confirmas un recurrente pendiente, se crea un movimiento real en la colección <code>movimientos</code> y se avanza el puntero <code>nextDate</code> del recurrente. Esto mantiene el historial limpio y real.</li>
                        </ul>
                    </div>
                </details>

                <div style="margin-top: 20px; padding: 15px; background: #1e1e1e; border-radius: 12px; border: 1px solid #333;">
                    <h4 style="color: #fff; margin-top: 0;">⌨️ Power User Shortcuts</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: monospace; font-size: 0.8rem; color: #aaa;">
                        <div>Ctrl + K</div><div>Buscador Global</div>
                        <div>Esc</div><div>Cerrar Modales</div>
                        <div>Enter</div><div>Siguiente Campo</div>
                        <div>Long Press</div><div>Menú Contextual (Tarjetas)</div>
                    </div>
                </div>
            </div>
        `;
    }

    showModal('help-modal');
};

// Función global para el cambio de pestañas (necesaria para el onclick en el HTML string)
window.switchHelpTab = (tabName) => {
    document.querySelectorAll('.help-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.help-content-pane').forEach(pane => pane.classList.remove('active'));
    
    const btn = document.querySelector(`.help-tab-btn[onclick="switchHelpTab('${tabName}')"]`);
    const pane = document.getElementById(`help-pane-${tabName}`);
    
    if (btn) btn.classList.add('active');
    if (pane) pane.classList.add('active');
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
            totalDeudaTarjeta += (saldos[c.id] || 0);
        }
    });

    const colchonNeto = totalLiquido + totalDeudaTarjeta; 

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expensesLast3Months = recentMovements
        .filter(m => new Date(m.fecha) >= threeMonthsAgo && m.tipo === 'movimiento' && m.cantidad < 0)
        .reduce((sum, m) => sum + m.cantidad, 0);

    const gastoMensualPromedio = Math.abs(expensesLast3Months / 3);
    const mesesCobertura = (gastoMensualPromedio > 0) ? (colchonNeto / gastoMensualPromedio) : 999;

    return { colchonNeto, gastoMensualPromedio, mesesCobertura };
};

const calculateFinancialIndependence = (patrimonioNeto, gastoMensualPromedio) => {
    const gastoAnualEstimado = gastoMensualPromedio * 12;
    const objetivoFI = gastoAnualEstimado * 30; // Regla del 3.33% o multiplicador de 30 años
    
    let progresoFI = 0;
    if (objetivoFI > 0 && patrimonioNeto > 0) {
        progresoFI = (patrimonioNeto / objetivoFI) * 100;
    }

    return { patrimonioNeto, gastoAnualEstimado, objetivoFI, progresoFI };
};


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
    // Generamos las opciones de tipo de cuenta existentes para el datalist
    const existingAccountTypes = [...new Set((db.cuentas || []).map(c => c.tipo))].sort();
    const datalistOptions = existingAccountTypes.map(type => `<option value="${type}"></option>`).join('');
    
    // HTML del Modal actualizado con selector de Caja (Radio Buttons)
    const html = `
    <div class="form-group" style="margin-bottom: var(--sp-3);">
        <input type="search" id="cuenta-search-input" class="form-input" placeholder="Buscar cuentas..." autocomplete="off">
    </div>
    
    <form id="add-cuenta-form" novalidate style="background: var(--c-surface-variant); padding: 15px; border-radius: 8px; border: 1px solid var(--c-outline);">
        <h4 style="margin-top:0; margin-bottom:10px;">Añadir Nueva Cuenta</h4>
        
        <div class="form-group">
            <label for="new-cuenta-nombre" class="form-label">Nombre</label>
            <input type="text" id="new-cuenta-nombre" class="form-input" placeholder="Ej: Cartera personal" required>
        </div>
        
        <div class="form-group">
            <label for="new-cuenta-tipo" class="form-label">Tipo</label>
            <input type="text" id="new-cuenta-tipo" class="form-input" list="tipos-cuenta-list" placeholder="Ej: Banco, Efectivo..." required>
            <datalist id="tipos-cuenta-list">${datalistOptions}</datalist>
        </div>

        <div class="form-group">
            <label class="form-label">Asignar a Caja:</label>
            <div style="display:flex; gap:15px; margin-top:5px;">
                <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                    <input type="radio" name="new-cuenta-ledger" value="A" checked> 
                    <span style="font-weight:bold; color:#007bff;">A (Azul)</span>
                </label>
                <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                    <input type="radio" name="new-cuenta-ledger" value="B"> 
                    <span style="font-weight:bold; color:#dc3545;">B (Roja)</span>
                </label>
                <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                    <input type="radio" name="new-cuenta-ledger" value="C"> 
                    <span style="font-weight:bold; color:#28a745;">C (Verde)</span>
                </label>
            </div>
        </div>

        <button type="submit" class="btn btn--primary btn--full" style="margin-top: var(--sp-3)">Guardar Cuenta</button>
    </form>
    
    <hr style="margin: var(--sp-4) 0; border-color: var(--c-outline); opacity: 0.5;">
    
    <h4 style="margin-top: var(--sp-4); margin-bottom: var(--sp-2); font-size: var(--fs-base); color: var(--c-on-surface-secondary);">Cuentas Existentes</h4>
    <div id="cuentas-modal-list"></div>`; 
    
    showGenericModal('Gestionar Cuentas', html); 
    renderCuentasModalList(); 
};

/* --- REEMPLAZAR renderCuentasModalList --- */
const renderCuentasModalList = () => {
    const list = select('cuentas-modal-list');
    if (!list) return;
    
    const searchQuery = select('cuenta-search-input')?.value.toLowerCase() || '';
    
    // Filtrar cuentas
    const cuentasFiltradas = (db.cuentas || []).filter(c => 
        c.nombre.toLowerCase().includes(searchQuery) || 
        c.tipo.toLowerCase().includes(searchQuery)
    );

    if (cuentasFiltradas.length === 0) {
        list.innerHTML = `<p style="font-size:var(--fs-sm); color:var(--c-on-surface-secondary); text-align:center; padding: var(--sp-4) 0;">No se encontraron cuentas.</p>`;
        return;
    }

    list.innerHTML = cuentasFiltradas.sort((a,b) => a.nombre.localeCompare(b.nombre)).map((c) => {
        // Determinar Caja
        const ledger = c.ledger || (c.offBalance ? 'B' : 'A');
        
        // Colores para el badge de la caja
        let badgeColor = '#007bff'; // Azul por defecto (A)
        if (ledger === 'B') badgeColor = '#dc3545'; // Rojo
        if (ledger === 'C') badgeColor = '#28a745'; // Verde

        return `
            <div class="modal__list-item" id="cuenta-item-${c.id}">
                <div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">
                    <span style="font-weight: 600; font-size: 1rem; color: var(--c-on-surface);">${escapeHTML(c.nombre)}</span>
                    <div style="display:flex; gap: 8px; align-items:center;">
                        <small style="color: var(--c-on-surface-secondary);">${toSentenceCase(escapeHTML(c.tipo))}</small>
                        <span style="background-color: ${badgeColor}; color: white; padding: 1px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700;">CAJA ${ledger}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--sp-2); flex-shrink: 0;">
                    <button class="icon-btn" data-action="edit-cuenta" data-id="${c.id}" title="Editar Cuenta">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="icon-btn" data-action="delete-cuenta" data-id="${c.id}" title="Eliminar Cuenta">
                        <span class="material-icons text-danger">delete</span>
                    </button>
                </div>
            </div>`;
    }).join('');
};
    
        const showAccountEditForm = (id) => {
    const itemContainer = select(`cuenta-item-${id}`);
    const cuenta = db.cuentas.find(c => c.id === id);
    if (!itemContainer || !cuenta) return;
    
    const currentAccountLedger = cuenta.ledger || (cuenta.offBalance ? 'B' : 'A');

    itemContainer.innerHTML = `
        <form class="inline-edit-form" data-id="${id}" novalidate>
            <div class="form-grid">
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" for="edit-cuenta-nombre-${id}">Nombre</label>
                    <input type="text" id="edit-cuenta-nombre-${id}" class="form-input" value="${escapeHTML(cuenta.nombre)}" required>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" for="edit-cuenta-tipo-${id}">Tipo</label>
                    <input type="text" id="edit-cuenta-tipo-${id}" class="form-input" list="tipos-cuenta-list" value="${escapeHTML(cuenta.tipo)}" required>
                </div>
            </div>
            <div class="form-group" style="margin-top: 10px;">
                <label class="form-label">Pertenece a Caja:</label>
                <div style="display:flex; gap:10px;">
                    <label><input type="radio" name="edit-ledger-${id}" value="A" ${currentAccountLedger === 'A' ? 'checked' : ''}> A (Azul)</label>
                    <label><input type="radio" name="edit-ledger-${id}" value="B" ${currentAccountLedger === 'B' ? 'checked' : ''}> B (Rojo)</label>
                    <label><input type="radio" name="edit-ledger-${id}" value="C" ${currentAccountLedger === 'C' ? 'checked' : ''}> C (Verde)</label>
                </div>
            </div>
            <div style="display:flex; justify-content: flex-end; gap: var(--sp-2); align-items: center; margin-top: var(--sp-2);">
                <button type="button" class="btn btn--secondary" data-action="cancel-edit-cuenta">Cancelar</button>
                <button type="button" class="btn btn--primary" data-action="save-edited-cuenta" data-id="${id}">Guardar</button>
            </div>
        </form>`;
    select(`edit-cuenta-nombre-${id}`).focus();
};
    
        const handleSaveEditedAccount = async (id, btn) => {
            const nombreInput = select(`edit-cuenta-nombre-${id}`);
            const tipoInput = select(`edit-cuenta-tipo-${id}`);
            const nombre = nombreInput.value.trim();
            const tipo = toSentenceCase(tipoInput.value.trim());
        
            if (!nombre || !tipo) { showToast('El nombre y el tipo no pueden estar vacíos.', 'warning'); if (!nombre) nombreInput.classList.add('form-input--invalid'); if (!tipo) tipoInput.classList.add('form-input--invalid'); return; }
            const ledgerSelected = document.querySelector(`input[name="edit-ledger-${id}"]:checked`).value;
            await saveDoc('cuentas', id, { 
        nombre, 
        tipo, 
        ledger: ledgerSelected,
        offBalance: ledgerSelected === 'B' 
    }, btn);
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

    requestAnimationFrame(() => {
        bubble.style.opacity = '1';
        bubble.style.transform = `translate(
            ${endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2)}px, 
            ${endRect.top - (startRect.top + startRect.height / 2)}px
        ) scale(0)`;
    });

    bubble.addEventListener('transitionend', () => bubble.remove(), { once: true });
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
 * Versión mejorada de createCustomSelect.
 * - Soporta iconos en las opciones.
 * - Se abre automáticamente al recibir foco (navegación por teclado/enter).
 */
function createCustomSelect(selectElement) {
    if (!selectElement) return;
    if (selectElement.dataset.hasCustomWrapper === 'true') {
        // Si ya existe, actualizamos opciones y salimos
        const wrapper = selectElement.closest('.custom-select-wrapper');
        if (wrapper) {
            const trigger = wrapper.querySelector('.custom-select__trigger');
            const optionsContainer = wrapper.querySelector('.custom-select__options');
            if (trigger && optionsContainer) populateOptions(selectElement, optionsContainer, trigger, wrapper);
        }
        return;
    }

    selectElement.dataset.hasCustomWrapper = 'true';
    
    let wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    
    const inputWrapper = selectElement.closest('.input-wrapper');
    inputWrapper.parentNode.insertBefore(wrapper, inputWrapper);
    wrapper.appendChild(inputWrapper);
    
    let trigger = document.createElement('div');
    trigger.className = 'custom-select__trigger';
    trigger.tabIndex = 0; // Hace que el div sea "focusable"
    
    let optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select__options';

    inputWrapper.appendChild(trigger);
    wrapper.appendChild(selectElement); // Select original oculto
    wrapper.appendChild(optionsContainer);
    selectElement.classList.add('form-select-hidden');

    const toggleSelect = (forceState = null) => {
        const isOpen = forceState !== null ? forceState : !wrapper.classList.contains('is-open');
        if (isOpen) {
            closeAllCustomSelects(wrapper);
            wrapper.classList.add('is-open');
            // Scroll automático al seleccionado
            const selected = optionsContainer.querySelector('.is-selected');
            if (selected) requestAnimationFrame(() => optionsContainer.scrollTop = selected.offsetTop - 50);
        } else {
            wrapper.classList.remove('is-open');
        }
    };


    // --- 3. Event Listeners (Solo se añaden 1 vez) ---

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSelect();
    });

   // **LA CLAVE DE TU PETICIÓN: AUTO-APERTURA AL ENFOCAR**
    trigger.addEventListener('focus', () => {
        // Usamos un pequeño timeout para no conflictuar con clics
        setTimeout(() => {
            if (document.activeElement === trigger) {
                toggleSelect(true); // Forzamos apertura
                // Hacemos scroll al contenedor para asegurar que se ve en móvil si el teclado está abierto
                trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    });

    // Navegación por teclado (Enter abre/cierra)
    trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSelect();
        }
    });

    selectElement.addEventListener('change', () => populateOptions(selectElement, optionsContainer, trigger, wrapper));
 // Inicializar
    populateOptions(selectElement, optionsContainer, trigger, wrapper);
}

// Helper para poblar opciones SOLO CON TEXTO (Sin Iconos)
function populateOptions(selectElement, optionsContainer, trigger, wrapper) {
    optionsContainer.innerHTML = ''; 
    
    // 1. Lógica del Texto Predictivo
    let placeholderText = 'Seleccionar...';
    const id = selectElement.id;
    
    if (id.includes('concepto')) placeholderText = 'Concepto';
    else if (id.includes('cuenta-origen')) placeholderText = 'Desde cuenta...';
    else if (id.includes('cuenta-destino')) placeholderText = 'Hacia cuenta...';
    else if (id.includes('cuenta')) placeholderText = 'Cuenta';
    
    // Este es el texto gris que se ve cuando no hay nada seleccionado
    let selectedHTML = `<span style="color: var(--c-on-surface-tertiary); opacity: 0.7;">${placeholderText}</span>`; 

    Array.from(selectElement.options).forEach(optionEl => {
        if (optionEl.value === "") return;

        const customOption = document.createElement('div');
        customOption.className = 'custom-select__option';
        
        // Mostramos solo el texto limpio
        customOption.innerHTML = `<span class="option-text">${optionEl.textContent}</span>`;
        customOption.dataset.value = optionEl.value;

        if (optionEl.selected) {
            customOption.classList.add('is-selected');
            // Actualizamos el HTML seleccionado
            selectedHTML = `<span style="font-weight: 600; color: var(--c-on-surface);">${optionEl.textContent}</span>`;
        }

        customOption.addEventListener('click', (e) => {
            e.stopPropagation();
            selectElement.value = optionEl.value;
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            wrapper.classList.remove('is-open');
            trigger.focus(); 

            // ▼▼▼ MEJORA UX: AVANCE AUTOMÁTICO ▼▼▼
            if (selectElement.id === 'movimiento-concepto') {
                setTimeout(() => {
                    const descInput = document.getElementById('movimiento-descripcion');
                    if (descInput) {
                        descInput.focus();
                        descInput.select();
                    }
                }, 50);
            }
            if (selectElement.id === 'movimiento-cuenta-origen') {
                 setTimeout(() => {
                    const destinoSelect = document.getElementById('movimiento-cuenta-destino');
                    const wrapperDest = destinoSelect?.closest('.custom-select-wrapper');
                    const triggerDest = wrapperDest?.querySelector('.custom-select__trigger');
                    if(triggerDest) triggerDest.click();
                }, 50);
            }
            // ▲▲▲ FIN MEJORA ▲▲▲
        });

        // ⚠️ ESTA LÍNEA FALTABA Y ERA CRÍTICA PARA QUE APAREZCAN LAS OPCIONES
        optionsContainer.appendChild(customOption); 
    }); // ⚠️ AQUÍ FALTABA EL CIERRE ); QUE PROVOCABA EL ERROR DE SINTAXIS

    trigger.innerHTML = selectedHTML;
}

/* EN main.js - Reemplaza showCalculator */

const showCalculator = (targetInput) => {
    const calculatorOverlay = select('calculator-overlay');
    const calculatorUi = select('calculator-ui');
    
    if (!calculatorOverlay) return;
    
    // 1. Mostrar la UI (sin bloquear scroll de fondo visualmente)
    calculatorOverlay.classList.add('modal-overlay--active');
    calculatorState.isVisible = true;
    calculatorState.targetInput = targetInput;
    
    // 2. Cargar valor inicial
    const currentValue = parseCurrencyString(targetInput.value);
    calculatorState.displayValue = currentValue ? currentValue.toString().replace('.', ',') : '0';
    calculatorState.waitingForNewValue = true;
    
    updateCalculatorDisplay(); 
    updateCalculatorHistoryDisplay();

    // 3. Gestión de Teclado Físico (PC)
    if (calculatorKeyboardHandler) document.removeEventListener('keydown', calculatorKeyboardHandler);
    calculatorKeyboardHandler = (e) => {
        const key = e.key;
        if (key >= '0' && key <= '9') { e.preventDefault(); handleCalculatorInput(key); }
        else if (key === ',' || key === '.') { e.preventDefault(); handleCalculatorInput('comma'); }
        else if (key === 'Enter') { e.preventDefault(); handleCalculatorInput('done'); }
        else if (key === 'Backspace') { e.preventDefault(); handleCalculatorInput('backspace'); }
        else if (key === 'Escape') { e.preventDefault(); hideCalculator(); }
        else if (key === '+') { e.preventDefault(); handleCalculatorInput('add'); }
        else if (key === '-') { e.preventDefault(); handleCalculatorInput('subtract'); }
        else if (key === '*' || key.toLowerCase() === 'x') { e.preventDefault(); handleCalculatorInput('multiply'); }
        else if (key === '/') { e.preventDefault(); handleCalculatorInput('divide'); }
    };
    document.addEventListener('keydown', calculatorKeyboardHandler);

    // 4. Feedback Visual en el Input
    document.querySelectorAll('.form-input--active-calc').forEach(el => el.classList.remove('form-input--active-calc'));
    targetInput.classList.add('form-input--active-calc');
    
    // 5. === SCROLL INTELIGENTE PARA NO TAPAR ===
    setTimeout(() => {
        // Altura real del teclado (~260px con los nuevos estilos)
        const uiHeight = calculatorUi ? calculatorUi.offsetHeight : 260;
        
        const inputRect = targetInput.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculamos dónde termina el input visualmente
        const inputBottom = inputRect.bottom;
        // Calculamos dónde empieza el teclado
        const keyboardTop = windowHeight - uiHeight;
        
        // Si el input está por debajo del inicio del teclado (tapado)
        if (inputBottom > keyboardTop) {
            // Calculamos cuánto hay que subir (con 20px de margen extra para que respire)
            const scrollAmount = (inputBottom - keyboardTop) + 20;
            
            // Buscamos quién tiene el scroll (el modal o la página principal)
            const scrollContainer = targetInput.closest('.modal__body') || selectOne('.app-layout__main');
            
            if (scrollContainer) {
                scrollContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            }
        }
    }, 250); // Esperamos a que termine la animación de subida del teclado
};

const hideCalculator = () => {
    const calculatorOverlay = select('calculator-overlay');
    if (calculatorOverlay) {
        calculatorOverlay.classList.remove('modal-overlay--active');
    }
    calculatorState.isVisible = false;
    
    // Limpiamos el listener del teclado físico
    if (calculatorKeyboardHandler) {
        document.removeEventListener('keydown', calculatorKeyboardHandler);
        calculatorKeyboardHandler = null;
    }
    
    // Devolvemos el foco al documento para quitarlo de cualquier input residual
    if (document.activeElement) {
        document.activeElement.blur();
    }
	document.querySelectorAll('.form-input--active-calc').forEach(el => el.classList.remove('form-input--active-calc'));
};

// =============================================================
// === LÓGICA DEL BOTÓN FLOTANTE INTELIGENTE (FAB)           ===
// =============================================================
const setupFabInteractions = () => {
    const fab = document.getElementById('bottom-nav-add-btn');
    if (!fab) return;

    let longPressTimer;
    let isLongPress = false;
    // 500ms es un estándar cómodo para pulsación larga
    const LONG_PRESS_DURATION = 500; 

    const startPress = (e) => {
        // Evitamos que el evento se propague si es táctil para no duplicar con el ratón
        if (e.type === 'mousedown' && e.buttons !== 1) return;
        
        isLongPress = false;
        fab.style.transform = "scale(0.90)"; // Efecto visual de presión
        fab.style.transition = "transform 0.1s";

        longPressTimer = setTimeout(() => {
            // ¡BINGO! Se ha mantenido pulsado: Abrimos el menú de selección
            isLongPress = true;
            hapticFeedback('medium');
            fab.style.transform = "scale(1)";
            
            // Estrategia 1 (Pulsación larga): Abrimos el Sheet para elegir (Traspaso, Ingreso, Gasto)
            showModal('main-add-sheet'); 
        }, LONG_PRESS_DURATION);
    };

    const endPress = (e) => {
        clearTimeout(longPressTimer);
        fab.style.transform = "scale(1)";

        // Si NO fue una pulsación larga, es un CLIC normal
        if (!isLongPress) {
            e.preventDefault(); // Evita comportamientos dobles
            
            // Estrategia 1 (Entrada Directa): Abrimos directamente "Nuevo Gasto"
            // Es la opción más común, ahorramos un clic.
            startMovementForm(null, false, 'gasto');
        }
    };

    // Eventos para Móvil (Touch) y Ordenador (Mouse)
    fab.addEventListener('touchstart', startPress, { passive: true });
    fab.addEventListener('touchend', endPress);
    fab.addEventListener('mousedown', startPress);
    fab.addEventListener('mouseup', endPress);
    // Cancelamos si el usuario mueve el dedo fuera del botón o ocurre un error
    fab.addEventListener('mouseleave', () => { clearTimeout(longPressTimer); fab.style.transform = "scale(1)"; });
    fab.addEventListener('touchcancel', () => { clearTimeout(longPressTimer); fab.style.transform = "scale(1)"; });
};

// ▼▼▼ REEMPLAZA ESTA FUNCIÓN EN main.js ▼▼▼
const initAmountInput = () => {
    const amountInputs = document.querySelectorAll('.input-amount-calculator');
    const calculatorToggle = select('calculator-toggle-btn'); 

    if (calculatorToggle) calculatorToggle.style.display = 'none';

    amountInputs.forEach(input => {
        // 1. EL TRUCO MAESTRO: Readonly evita que el teclado móvil se abra
        // Así no tenemos que luchar con focus/blur ni vibraciones fantasma.
        input.readOnly = true; 
        
        // 2. inputmode="none" es una seguridad extra para algunos Androids
        input.setAttribute('inputmode', 'none');
        input.setAttribute('autocomplete', 'off');
        
        // 3. Limpieza total de eventos antiguos
        // Clonamos el nodo para eliminar CUALQUIER event listener "fantasma" anterior
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        // 4. Añadimos UN SOLO evento limpio: Click
        newInput.addEventListener('click', (e) => {
            e.preventDefault(); // Evita comportamientos nativos
            e.stopPropagation(); // Evita que el click atraviese y cierre cosas
            
            // Solo abrimos si no está ya visible para evitar parpadeos
            if (!calculatorState.isVisible || calculatorState.targetInput !== newInput) {
                hapticFeedback('light');
                showCalculator(newInput);
            }
        });
    });
};

// Función auxiliar para manejar el evento de foco/click
const handleInputFocus = (e) => {
    e.preventDefault();
    // Quitamos el foco del input para evitar parpadeos del cursor nativo,
    // pero guardamos la referencia para saber dónde escribir.
    e.target.blur(); 
    hapticFeedback('light');
    showCalculator(e.target);
};
// --- PARCHES DE COMPATIBILIDAD ---
// Añade esto al final de main.js o en el bloque de funciones globales
const renderInversionesView = async () => {
    await navigateTo(PAGE_IDS.PATRIMONIO);
};

const renderInversionesPage = async (containerId) => {
    // Si se llama con un ID específico, ignoramos y renderizamos la página completa de patrimonio
    await renderPatrimonioPage();
};


// ▼▼▼ REEMPLAZA TU FUNCIÓN attachEventListeners CON ESTA VERSIÓN LIMPIA ▼▼▼
const attachEventListeners = () => {
	// --- LÓGICA DE MODO PRIVACIDAD ---
    // Al hacer clic en el valor del Patrimonio Neto (KPI principal), alternamos el modo.
    document.body.addEventListener('click', (e) => {
        // Buscamos si el clic fue en el valor del patrimonio o en su etiqueta
        const kpiPatrimonio = e.target.closest('#kpi-patrimonio-neto-value') || 
                              e.target.closest('#patrimonio-total-balance');
        
        if (kpiPatrimonio) {
            // Alternamos la clase en el body
            document.body.classList.toggle('privacy-mode');
            
            // Feedback táctil para confirmar la acción
            hapticFeedback('medium');
            
            // Opcional: Guardar la preferencia del usuario para la próxima vez
            const isPrivacyActive = document.body.classList.contains('privacy-mode');
            localStorage.setItem('privacyMode', isPrivacyActive);
        }
    });
	// --- INICIO: LÓGICA DE PULSACIÓN PROLONGADA PARA DIARIO ---
    const diarioPage = document.getElementById('diario-page');
    if (diarioPage) {
        let longPressTimer = null;
        let startX = 0;
        let startY = 0;
        const LONG_PRESS_DURATION = 600; // Tiempo en ms para activar (0.6 segundos)

        // Dentro de attachEventListeners...

const handleStart = (e) => {
            const card = e.target.closest('.transaction-card');
            if (!card) return;

            // ▼▼▼ FEEDBACK VISUAL: AÑADIR CLASE ▼▼▼
            card.classList.add('is-pressing'); 

            const point = e.touches ? e.touches[0] : e;
            startX = point.clientX;
            startY = point.clientY;

            longPressTimer = setTimeout(() => {
                // ▼▼▼ FEEDBACK VISUAL: QUITAR CLASE ▼▼▼
                card.classList.remove('is-pressing');
                
                hapticFeedback('medium');
                const id = card.dataset.id;
                startMovementForm(id, false); 
            }, LONG_PRESS_DURATION);
        };

        const handleMove = (e) => {
    // CORRECCIÓN: Detectar si es táctil o ratón para obtener las coordenadas
    const point = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
    
    const moveX = point.clientX;
    const moveY = point.clientY;

    // Si se mueve más de 10px, cancelamos la pulsación larga
    if (Math.abs(startX - moveX) > 10 || Math.abs(startY - moveY) > 10) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        // También quitamos la clase visual si nos movemos
        const card = e.target.closest('.transaction-card');
        if(card) card.classList.remove('is-pressing');
    }
};

        const handleEnd = (e) => {
            // ▼▼▼ CANCELAR SI SE SUELTA ANTES DE TIEMPO ▼▼▼
            const card = e.target.closest('.transaction-card');
            if(card) card.classList.remove('is-pressing');

            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        // Añadimos los escuchadores (soporte para Táctil y Ratón)
        diarioPage.addEventListener('touchstart', handleStart, { passive: true });
        diarioPage.addEventListener('touchmove', handleMove, { passive: true });
        diarioPage.addEventListener('touchend', handleEnd);
        diarioPage.addEventListener('contextmenu', (e) => {
            // Evita que salga el menú del navegador si pulsas mucho rato
            if (e.target.closest('.transaction-card')) {
                e.preventDefault();
            }
        });

        // Soporte para PC (Ratón)
        diarioPage.addEventListener('mousedown', handleStart);
        diarioPage.addEventListener('mousemove', handleMove);
        diarioPage.addEventListener('mouseup', handleEnd);
        diarioPage.addEventListener('mouseleave', handleEnd);
    }
	const diarioContainer = select('diario-page'); 
    if (diarioContainer) { 
        const mainScroller = selectOne('.app-layout__main'); 
        
        diarioContainer.addEventListener('touchstart', (e) => { 
            if (mainScroller.scrollTop > 0) return; 
            ptrState.startY = e.touches[0].clientY; 
            ptrState.isPulling = true; 
                        
        }, { passive: true }); 

        diarioContainer.addEventListener('touchmove', (e) => { 
            if (!ptrState.isPulling) { 
               
                return; 
            } 
            // ... (El resto del código del Pull-to-refresh se mantiene igual) ...
             const currentY = e.touches[0].clientY; 
             ptrState.distance = (currentY - ptrState.startY) * 0.5; // Factor de resistencia simple
             // ... etc ...
        }, { passive: false }); 

        diarioContainer.addEventListener('touchend', async (e) => { 
           
        }); 
      
    }
    // 1. Habilitador de vibración (Haptics)
    const enableHaptics = () => {
        userHasInteracted = true;
        document.body.removeEventListener('touchstart', enableHaptics, { once: true });
        document.body.removeEventListener('click', enableHaptics, { once: true });
    };
    document.body.addEventListener('touchstart', enableHaptics, { once: true, passive: true });
    document.body.addEventListener('click', enableHaptics, { once: true });

    // 2. Gesto Pull-to-Refresh (Diario)
    const ptrElement = select('diario-page');
    const mainScrollerPtr = selectOne('.app-layout__main');
    const ptrIndicator = document.createElement('div');
    ptrIndicator.id = 'pull-to-refresh-indicator';
    ptrIndicator.innerHTML = '<div class="spinner"></div>';
    if (ptrElement) ptrElement.prepend(ptrIndicator);

    let ptrState = { startY: 0, isPulling: false, distance: 0, threshold: 80 };

    if (ptrElement && mainScrollerPtr) {
        ptrElement.addEventListener('touchstart', (e) => {
            if (mainScrollerPtr.scrollTop <= 0) { 
                ptrState.startY = e.touches[0].clientY;
                ptrState.isPulling = true;
            }
        }, { passive: true });

        ptrElement.addEventListener('touchmove', (e) => {
            if (!ptrState.isPulling) return;
			// Si el usuario ha hecho scroll hacia abajo aunque sea 1px, cancelamos el pull
    if (mainScrollerPtr.scrollTop > 0) {
        ptrState.isPulling = false;
        ptrState.distance = 0;
        ptrIndicator.classList.remove('visible');
        return;
    }
            const currentY = e.touches[0].clientY;
            ptrState.distance = (currentY - ptrState.startY) * 0.5; // Factor de resistencia simple
            // Solo activamos el efecto visual si arrastra hacia abajo y estamos en el tope
    if (ptrState.distance > 0 && mainScrollerPtr.scrollTop <= 0) {
        // Solo prevenimos el defecto si realmente estamos "tirando" para refrescar
        if (e.cancelable) e.preventDefault(); 
        
        ptrIndicator.classList.add('visible');
                const rotation = Math.min(ptrState.distance * 2.5, 360);
                ptrIndicator.querySelector('.spinner').style.transform = `rotate(${rotation}deg)`;
                ptrIndicator.style.opacity = Math.min(ptrState.distance / ptrState.threshold, 1);
            }
        }, { passive: false });

        ptrElement.addEventListener('touchend', async () => {
            if (ptrState.isPulling && ptrState.distance > ptrState.threshold) {
                hapticFeedback('medium');
                ptrIndicator.querySelector('.spinner').style.animation = 'spin 1.2s linear infinite';
                await renderDiarioPage();
                setTimeout(() => {
                    ptrIndicator.classList.remove('visible');
                    ptrIndicator.querySelector('.spinner').style.animation = '';
                }, 500);
            } else {
                ptrIndicator.classList.remove('visible');
            }
            ptrState.isPulling = false;
            ptrState.distance = 0;
        });
    }

    // 3. Listener Global para mostrar Modales (Limpio de código legacy)
    document.addEventListener("show-modal", (e) => {
        showModal(e.detail.modalId); // Solo muestra el modal, la inicialización va aparte
    });

    // 4. Navegación del historial (Botón atrás del navegador)
    window.addEventListener('popstate', (event) => {
    // Buscamos si hay algún modal abierto visualmente
    const activeModal = document.querySelector('.modal-overlay--active');
    
    // Si hay un modal abierto Y el nuevo estado ya no tiene 'modalId' 
    // (significa que el usuario ha vuelto atrás al estado base)
    if (activeModal && (!event.state || !event.state.modalId)) {
        
        // Cerramos el modal VISUALMENTE "a mano".
        // NOTA: No llamamos a hideModal(id) aquí porque esa función
        // intentaría manipular el historial de nuevo, creando un bucle.
        
        // 1. Quitar clases de visibilidad
        activeModal.classList.remove('modal-overlay--active');
        select('app-root').classList.remove('app-layout--transformed-by-modal');

        // 2. Limpiar estilos inline del arrastre (si los hubiera)
        const modalElement = activeModal.querySelector('.modal');
        if (modalElement) {
            modalElement.style.transform = '';
            // Limpieza de listeners de arrastre (igual que en hideModal)
            modalElement.removeEventListener('mousedown', handleModalDragStart);
            modalElement.removeEventListener('touchstart', handleModalDragStart);
        }
        
        // 3. Si tienes lógica específica al cerrar (como desenfocar inputs), ponla aquí
        if (document.activeElement) document.activeElement.blur();
        
        return; // Importante: paramos aquí para que no ejecute navegación de páginas
    }
    
    // Si NO era un modal, dejamos que tu lógica de navegación entre páginas (Panel -> Diario) funcione.
    const pageToNavigate = event.state ? event.state.page : PAGE_IDS.PANEL;
    if (pageToNavigate) navigateTo(pageToNavigate, false);
});

    // 5. GESTIÓN DE CLICS (Delegación de eventos)
    document.body.addEventListener('click', async (e) => {
        const target = e.target;

        // Cerrar dropdowns personalizados al hacer clic fuera
        if (!target.closest('.custom-select-wrapper')) {
            closeAllCustomSelects(null);
        }

        // Gestión de acciones [data-action]
        const actionTarget = e.target.closest('[data-action]');
    if (!actionTarget) return;
    
    // MEJORA: Prevención de doble clic si el botón ya está cargando o deshabilitado
    if (actionTarget.classList.contains('btn--loading') || actionTarget.disabled) {
        e.stopImmediatePropagation();
        return;
    }

        const { action, id, page, type, modalId, reportId } = actionTarget.dataset;
        const btn = actionTarget.closest('button');
        
        // Mapa de acciones
        const actions = {
			'toggle-portfolio-currency': async () => {
    hapticFeedback('medium');
    const btnIcon = select('currency-toggle-icon');
    
    if (portfolioViewMode === 'EUR') {
        // Cambiar a BTC
        showToast('Obteniendo precio de Bitcoin...', 'info');
        const price = await fetchBtcPrice();
        if (price > 0) {
            portfolioViewMode = 'BTC';
            if(btnIcon) {
                btnIcon.textContent = 'euro'; // El botón ahora muestra "volver a Euro"
                btnIcon.classList.add('btc-mode-active');
            }
            renderPortfolioMainContent('portfolio-main-content');
        }
    } else {
        // Volver a EUR
        portfolioViewMode = 'EUR';
        if(btnIcon) {
            btnIcon.textContent = 'currency_bitcoin';
            btnIcon.classList.remove('btc-mode-active');
        }
        renderPortfolioMainContent('portfolio-main-content');
    }
},
			'rename-ledgers': showRenameLedgersModal,
            'swipe-show-irr-history': () => handleShowIrrHistory(type),
            'show-main-menu': () => {
                const menu = document.getElementById('main-menu-popover');
                if (!menu) return;
                hapticFeedback('light');
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
			'open-external-calculator': () => {
                // Cierra el menú si estaba abierto
                const menu = document.getElementById('main-menu-popover');
                if (menu) menu.classList.remove('popover-menu--visible');
                
                hapticFeedback('light');
                
                // Lógica de incrustación
                const frame = document.getElementById('calculator-frame');
                if (frame) {
                    // Solo cargamos la fuente si está vacía para no perder el estado si se cierra y abre
                    if (!frame.getAttribute('src')) {
                        frame.src = 'calculadora.html';
                    }
                }
                
                // Abrimos el modal incrustado
                showModal('calculator-iframe-modal');
            },
            'show-main-add-sheet': () => showModal('main-add-sheet'),
            'show-pnl-breakdown': () => handleShowPnlBreakdown(actionTarget.dataset.id),
            'show-irr-breakdown': () => handleShowIrrBreakdown(actionTarget.dataset.id),
            'open-movement-form': (e) => {
                const type = e.target.closest('[data-type]').dataset.type;
                hideModal('main-add-sheet');
                setTimeout(() => startMovementForm(null, false, type), 250);
            },
            'export-filtered-csv': () => handleExportFilteredCsv(btn),
            'show-diario-filters': showDiarioFiltersModal,
            'clear-diario-filters': clearDiarioFilters,
            'toggle-amount-type': () => { /* Ya no se usa botón toggle, pero se mantiene por compatibilidad */ },
            'show-kpi-drilldown': () => handleKpiDrilldown(actionTarget),
			'show-kpi-help': (e) => {
				e.stopPropagation(); 
				const kpiKey = actionTarget.dataset.kpi;
				const info = KPI_EXPLANATIONS[kpiKey];
				if (info) {
				hapticFeedback('light');
				showGenericModal(info.title, `<p class="form-label" style="font-size:1rem; line-height:1.6; color:var(--c-on-surface);">${info.text}</p>`);
				}
				},
            'edit-movement-from-modal': (e) => { const movementId = e.target.closest('[data-id]').dataset.id; hideModal('generic-modal'); startMovementForm(movementId, false); },
            'edit-movement-from-list': (e) => { const movementId = e.target.closest('[data-id]').dataset.id; startMovementForm(movementId, false); },
            'edit-recurrente': () => { hideModal('generic-modal'); startMovementForm(id, true); },
            'view-account-details': (e) => { const accountId = e.target.closest('[data-id]').dataset.id; showAccountMovementsModal(accountId); },
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
                if (!(diarioCalendarDate instanceof Date) || isNaN(diarioCalendarDate)) diarioCalendarDate = new Date();
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
            'toggle-account-type-filter': () => { hapticFeedback('light'); if (deselectedAccountTypesFilter.has(type)) { deselectedAccountTypesFilter.delete(type); } else { deselectedAccountTypesFilter.add(type); } renderPatrimonioOverviewWidget('patrimonio-overview-container'); },
            'switch-estrategia-tab': () => { const tabName = actionTarget.dataset.tab; showEstrategiaTab(tabName); },
            'show-help-topic': () => { /* Lógica de ayuda mantenida */
                const topic = actionTarget.dataset.topic;
                if(topic) {
                    let title, content;
                    // ... (contenido de los temas de ayuda sin cambios) ...
                    if (topic === 'tasa-ahorro') { title = '¿Cómo se calcula la Tasa de Ahorro?'; content = `<p>Mide qué porcentaje de tus ingresos consigues guardar...</p>`; }
                    // ... (resto de casos) ...
                    else if (topic === 'independencia-financiera') { title = 'Independencia Financiera (I.F.)'; content = `<p>Mide tu progreso...</p>`; }
                    
                    const titleEl = select('help-modal-title'); const bodyEl = select('help-modal-body');
                    if(titleEl) titleEl.textContent = title; if(bodyEl) bodyEl.innerHTML = `<div style="padding: 0 var(--sp-2);">${content}</div>`;
                    showModal('help-modal');
                }
            },
            'use-password-instead': () => showPasswordFallback(),
            'toggle-theme': () => { handleToggleTheme(); hapticFeedback('light'); },
            'navigate': () => { hapticFeedback('light'); navigateTo(page); },
            'help': showHelpModal,
            'exit': handleExitApp,
            'forgot-password': (e) => { e.preventDefault(); const email = prompt("Email para recuperar contraseña:"); if (email) { firebase.auth().sendPasswordResetEmail(email).then(() => showToast('Correo enviado.', 'info')).catch(() => showToast('Error al enviar correo.', 'danger')); } },
            'show-register': (e) => { e.preventDefault(); const title = select('login-title'); const mainButton = document.querySelector('#login-form button[data-action="login"]'); const secondaryAction = document.querySelector('.login-view__secondary-action'); if (mainButton.dataset.action === 'login') { title.textContent = 'Crear una Cuenta Nueva'; mainButton.dataset.action = 'register'; mainButton.textContent = 'Registrarse'; secondaryAction.innerHTML = `<span>¿Ya tienes una cuenta?</span> <a href="#" class="login-view__link" data-action="show-login">Inicia sesión</a>`; } else { handleRegister(mainButton); } },
            'show-login': (e) => { e.preventDefault(); const title = select('login-title'); const mainButton = document.querySelector('#login-form button[data-action="register"]'); const secondaryAction = document.querySelector('.login-view__secondary-action'); if (mainButton.dataset.action === 'register') { title.textContent = 'Bienvenido de nuevo'; mainButton.dataset.action = 'login'; mainButton.textContent = 'Iniciar Sesión'; secondaryAction.innerHTML = `<span>¿No tienes una cuenta?</span> <a href="#" class="login-view__link" data-action="show-register">Regístrate aquí</a>`; } },
            'import-csv': showCsvImportWizard,
            'toggle-ledger': async () => {
    hapticFeedback('medium');
    
    // 1. Rotación: A -> B -> C -> A
    if (currentLedger === 'A') currentLedger = 'B';
    else if (currentLedger === 'B') currentLedger = 'C';
    else currentLedger = 'A';
    
    // 2. Limpieza de Cachés
    runningBalancesCache = null;
    allDiarioMovementsCache = []; 
    
    // 3. Actualizar UI Visual
    document.body.dataset.ledgerMode = currentLedger;
    
    // ▼▼▼ AQUÍ ESTABA EL ERROR (CORREGIDO) ▼▼▼
    // Simplemente llamamos a la función auxiliar que ya creamos.
    // Ella se encarga de buscar el botón y cambiar el texto.
    updateLedgerButtonUI(); 
    // ▲▲▲ FIN DE LA CORRECCIÓN ▲▲▲
    
    // Mensaje informativo usando el nombre real
    showToast(`Cambiado a ${getLedgerName(currentLedger)}.`, 'info');

    // 4. Actualizar datos y vistas
    populateAllDropdowns();

    const activePageEl = document.querySelector('.view--active');
    if (activePageEl) {
        if (activePageEl.id === PAGE_IDS.PANEL) scheduleDashboardUpdate();
        else if (activePageEl.id === PAGE_IDS.DIARIO) {
            db.movimientos = [];
            lastVisibleMovementDoc = null;
            allMovementsLoaded = false;
            select('virtual-list-content').innerHTML = '';
            await loadMoreMovements(true);
        }
        else if (activePageEl.id === PAGE_IDS.PATRIMONIO) renderPatrimonioPage();
        else if (activePageEl.id === PAGE_IDS.PLANIFICAR) renderPlanificacionPage();
    }
},
            'toggle-off-balance': async () => { const checkbox = target.closest('input[type="checkbox"]'); if (!checkbox) return; hapticFeedback('light'); await saveDoc('cuentas', checkbox.dataset.id, { offBalance: checkbox.checked }); },
            'apply-filters': () => { hapticFeedback('light'); scheduleDashboardUpdate(); },
            'delete-movement-from-modal': () => { const isRecurrent = (actionTarget.dataset.isRecurrent === 'true'); const idToDelete = select('movimiento-id').value; const message = isRecurrent ? '¿Eliminar operación recurrente?' : '¿Eliminar movimiento?'; showConfirmationModal(message, async () => { hideModal('movimiento-modal'); await deleteMovementAndAdjustBalance(idToDelete, isRecurrent); }); },
			'duplicate-movement-from-modal': () => {
    const id = select('movimiento-id').value;
    // Buscamos el movimiento original en la base de datos local
    const movement = db.movimientos.find(m => m.id === id);
    
    if (movement) {
        // Usamos la función que ya tienes creada
        handleDuplicateMovement(movement);
    } else {
        // Por si acaso es un recurrente o hay un error
        showToast("No se pudo cargar el movimiento original para duplicar.", "warning");
    }
},
            'swipe-delete-movement': () => { const isRecurrent = actionTarget.dataset.isRecurrent === 'true'; showConfirmationModal('¿Eliminar este movimiento?', async () => { await deleteMovementAndAdjustBalance(id, isRecurrent); }); },
            'swipe-duplicate-movement': () => { const movement = db.movimientos.find(m => m.id === id) || recentMovementsCache.find(m => m.id === id); if (movement) handleDuplicateMovement(movement); },
            'search-result-movimiento': (e) => { hideModal('global-search-modal'); startMovementForm(e.target.closest('[data-id]').dataset.id, false); },
            'delete-concepto': async () => { const movsCheck = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos').where('conceptoId', '==', id).limit(1).get(); if(!movsCheck.empty) { showToast("Concepto en uso.","warning"); return; } showConfirmationModal('¿Eliminar concepto?', async () => { await deleteDoc('conceptos', id); hapticFeedback('success'); showToast("Concepto eliminado."); renderConceptosModalList(); }); },
            'delete-cuenta': async () => { const movsCheck = await fbDb.collection('users').doc(currentUser.uid).collection('movimientos').where('cuentaId', '==', id).limit(1).get(); if(!movsCheck.empty) { showToast("Cuenta con movimientos.","warning"); return; } showConfirmationModal('¿Eliminar cuenta?', async () => { await deleteDoc('cuentas', id); hapticFeedback('success'); showToast("Cuenta eliminada."); renderCuentasModalList(); }); },
            'close-modal': () => { 
                const closestOverlay = target.closest('.modal-overlay'); 
                const effectiveModalId = modalId || (closestOverlay ? closestOverlay.id : null); 
                
                // ▼▼▼ SEGURIDAD ▼▼▼
                if (effectiveModalId === 'movimiento-modal') {
                    const cantidad = document.getElementById('movimiento-cantidad').value;
                    // Si hay cantidad (>0) o descripción y no estamos guardando
                    const desc = document.getElementById('movimiento-descripcion').value;
                    if ((cantidad && cantidad !== '0,00') || desc.length > 2) {
                        if (!confirm("¿Descartar los cambios?")) return;
                    }
                }
                // ▲▲▲ FIN SEGURIDAD ▲▲▲

                if (effectiveModalId) hideModal(effectiveModalId); 
            },
            'manage-conceptos': showConceptosModal, 'manage-cuentas': showCuentasModal,
            'save-config': () => handleSaveConfig(btn),
            'export-data': () => handleExportData(btn), 'export-csv': () => handleExportCsv(btn), 'import-data': () => showImportJSONWizard(),
            'clear-data': () => { showConfirmationModal('¿Borrar TODOS tus datos?', async () => { /* Lógica */ }, 'Confirmar'); },
            'update-budgets': handleUpdateBudgets, 'logout': () => fbAuth.signOut(), 'delete-account': () => { showConfirmationModal('¿Eliminar cuenta permanentemente?', async () => { /* Lógica */ }); },
            'manage-investment-accounts': showManageInvestmentAccountsModal, 'update-asset-value': () => showValoracionModal(id),
            'global-search': () => { showGlobalSearchModal(); hapticFeedback('medium'); },
            'edit-concepto': () => showConceptoEditForm(id), 'cancel-edit-concepto': renderConceptosModalList, 'save-edited-concepto': () => handleSaveEditedConcept(id, btn),
            'edit-cuenta': () => showAccountEditForm(id), 'cancel-edit-cuenta': renderCuentasModalList, 'save-edited-cuenta': () => handleSaveEditedAccount(id, btn),
            'duplicate-movement': () => { /* Lógica duplicar */ },
            'save-and-new-movement': () => handleSaveMovement(document.getElementById('form-movimiento'), btn), 'set-movimiento-type': () => setMovimientoFormType(type),
            'recalculate-balances': () => { showConfirmationModal('Se recalcularán todos los saldos. ¿Continuar?', () => auditAndFixAllBalances(btn), 'Confirmar Auditoría'); },
            'json-wizard-back-2': () => goToJSONStep(1), 'json-wizard-import-final': () => handleFinalJsonImport(btn),
            'toggle-traspaso-accounts-filter': () => populateTraspasoDropdowns(), 'set-pin': async () => { /* Lógica PIN */ },
            'edit-recurrente-from-pending': () => startMovementForm(id, true),
            'confirm-recurrent': () => handleConfirmRecurrent(id, btn), 'skip-recurrent': () => handleSkipRecurrent(id, btn),
            'show-informe-builder': showInformeBuilderModal, 'save-informe': () => handleSaveInforme(btn),
        };
        
        if (actions[action]) actions[action](e);
    });

    // 6. Gestión de elementos <details> para informes
    document.body.addEventListener('toggle', (e) => {
        const detailsElement = e.target;
        if (detailsElement.tagName !== 'DETAILS' || !detailsElement.classList.contains('informe-acordeon')) return;
        if (detailsElement.open) {
            const informeId = detailsElement.id.replace('acordeon-', '');
            renderInformeDetallado(informeId);
        }
    }, true);
    
    // 7. Gestión de formularios (Submit)
    document.body.addEventListener('submit', (e) => {
        e.preventDefault();
        const target = e.target;
        const submitter = e.submitter;
        const handlers = {
			'rename-ledgers-form': () => handleSaveLedgerNames(submitter),
            'login-form': () => { const action = submitter ? submitter.dataset.action : 'login'; if (action === 'login') handleLogin(submitter); else handleRegister(submitter); },
            'pin-form': handlePinSubmit,
            'form-movimiento': () => handleSaveMovement(target, submitter),
            'add-concepto-form': () => handleAddConcept(submitter),
            'add-cuenta-form': () => handleAddAccount(submitter),
            'informe-cuenta-form': () => handleGenerateInformeCuenta(target, submitter),
            'manage-investment-accounts-form': () => handleSaveInvestmentAccounts(target, submitter),
            'form-valoracion': () => handleSaveValoracion(target, submitter),
            'diario-filters-form': applyDiarioFilters
        };
        if (handlers[target.id]) handlers[target.id]();
    });
    
    // 8. Eventos de inputs generales
    document.body.addEventListener('input', (e) => { 
        const id = e.target.id; 
        if (id) { 
            clearError(id); 
            if (id === 'movimiento-cantidad') validateField('movimiento-cantidad', true); 
            if (id === 'movimiento-concepto' || id === 'movimiento-cuenta') validateField(id, true); 
            // ... validaciones restantes
            if (id === 'concepto-search-input') { clearTimeout(globalSearchDebounceTimer); globalSearchDebounceTimer = setTimeout(() => renderConceptosModalList(), 200); } 
            if (id === 'cuenta-search-input') { clearTimeout(globalSearchDebounceTimer); globalSearchDebounceTimer = setTimeout(() => renderCuentasModalList(), 200); } 
        } 
    });
    
    document.body.addEventListener('blur', (e) => { 
        const id = e.target.id; 
        if (id && (id === 'movimiento-concepto' || id === 'movimiento-cuenta')) validateField(id); 
    }, true);
    
    document.body.addEventListener('focusin', (e) => { 
        if (e.target.matches('.pin-input')) handlePinInputInteraction(); 
        
    });
    
    // 9. Cambios en filtros y selects
    document.addEventListener('change', e => {
        const target = e.target;
        if (target.id === 'filter-periodo' || target.id === 'filter-fecha-inicio' || target.id === 'filter-fecha-fin') {
            const panelPage = select('panel-page');
            if (!panelPage || !panelPage.classList.contains('view--active')) return;
            if (target.id === 'filter-periodo') {
                const customDateFilters = select('custom-date-filters');
                if (customDateFilters) customDateFilters.classList.toggle('hidden', target.value !== 'custom');
                if (target.value !== 'custom') { hapticFeedback('light'); scheduleDashboardUpdate(); }
            }
            if (target.id === 'filter-fecha-inicio' || target.id === 'filter-fecha-fin') {
                const s = select('filter-fecha-inicio'), en = select('filter-fecha-fin');
                if (s && en && s.value && en.value) { hapticFeedback('light'); scheduleDashboardUpdate(); }
            }
        }
        // Lógica opciones recurrentes
        if (target.id === 'movimiento-recurrente') {
            select('recurrent-options').classList.toggle('hidden', !target.checked);
            if(target.checked && !select('recurrent-next-date').value) select('recurrent-next-date').value = select('movimiento-fecha').value;
        }
        if (target.id === 'recurrent-frequency') {
            const endGroup = select('recurrent-end-date').closest('.form-group');
            if (endGroup) endGroup.classList.toggle('hidden', target.value === 'once');
        }
    });
    
    // 10. Listeners específicos (Importación, Calculadora, Búsqueda)
    const importFileInput = select('import-file-input'); if (importFileInput) importFileInput.addEventListener('change', (e) => { if(e.target.files) handleJSONFileSelect(e.target.files[0]); });
    
    // CALCULADORA: Clics en botones
    const calculatorGrid = select('calculator-grid'); 
    if (calculatorGrid) calculatorGrid.addEventListener('click', (e) => { 
        const btn = e.target.closest('button'); 
        if(btn && btn.dataset.key) handleCalculatorInput(btn.dataset.key); 
    });
    
    const searchInput = select('global-search-input'); if (searchInput) searchInput.addEventListener('input', () => { clearTimeout(globalSearchDebounceTimer); globalSearchDebounceTimer = setTimeout(() => performGlobalSearch(searchInput.value), 250); });
    document.body.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); e.stopPropagation(); showGlobalSearchModal(); } });
    
    // Dropzone JSON y Scroll
    const dropZone = select('json-drop-zone'); if (dropZone) { /* Lógica Dropzone (sin cambios) */ }
        
    // Scroll infinito
    const mainScroller = selectOne('.app-layout__main'); 
    if (mainScroller) { 
        let scrollRAF = null; 
        mainScroller.addEventListener('scroll', () => { 
            if (scrollRAF) window.cancelAnimationFrame(scrollRAF); 
            scrollRAF = window.requestAnimationFrame(() => { 
                if (diarioViewMode === 'list' && select('diario-page')?.classList.contains('view--active')) renderVisibleItems(); 
            }); 
        }, { passive: true }); 
    }

    // Selectores de frecuencia recurrentes
    const frequencySelect = select('recurrent-frequency');
    if (frequencySelect) {
        frequencySelect.addEventListener('change', (e) => {
            const isWeekly = e.target.value === 'weekly';
            const weeklySelector = select('weekly-day-selector');
            const endGroup = select('recurrent-end-date')?.closest('.form-group');
            if (weeklySelector) weeklySelector.classList.toggle('hidden', !isWeekly);
            if (endGroup) endGroup.classList.toggle('hidden', e.target.value === 'once');
        });
    }

    // Selector de Fecha Nativo
    const fechaDisplayButton = select('movimiento-fecha-display'); 
    const fechaRealInput = select('movimiento-fecha'); 
    if (fechaDisplayButton && fechaRealInput) { 
        fechaDisplayButton.addEventListener('click', () => {
            try { fechaRealInput.showPicker(); } catch (error) { fechaRealInput.click(); }
        });
        fechaRealInput.addEventListener('input', () => {
            updateDateDisplay(fechaRealInput);
            const isRecurrent = select('movimiento-recurrente')?.checked;
            if (isRecurrent) {
                const nextDateEl = select('recurrent-next-date');
                if (nextDateEl) nextDateEl.value = fechaRealInput.value;
            }
        }); 
    }
    
    setupFabInteractions();
};
// ▲▲▲ FIN FUNCIÓN attachEventListeners ▲▲▲

// Lógica separada para el selector de días semanales (para que no se duplique)
const daySelector = select('weekly-day-selector-buttons');
if (daySelector) {
    daySelector.addEventListener('click', (e) => {
        // Permite que cualquier parte del botón active la selección (incluido texto)
        const btn = e.target.closest('.day-selector-btn');
        if (btn) {
            e.preventDefault(); // Prevenir envío de formulario si es type="button"
            btn.classList.toggle('active');
            hapticFeedback('light');
        }
    });
}

// =================================================================
// === FIN: BLOQUE DE CÓDIGO CORREGIDO PARA REEMPLAZAR           ===
// =================================================================
           
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
    

const handleConfirmRecurrent = async (id, btn) => {
    if (btn) setButtonLoading(btn, true);

    const recurrenteIndex = db.recurrentes.findIndex(r => r.id === id);
    if (recurrenteIndex === -1) {
        showToast("Error: no se encontró la operación programada.", "danger");
        if (btn) setButtonLoading(btn, false);
        return;
    }
    const recurrente = db.recurrentes[recurrenteIndex];

    // ▼▼▼ CORRECCIÓN CLAVE AQUÍ ▼▼▼
    // Guardamos la fecha original ("Hoy") en una variable separada ANTES de que nada cambie.
    const originalScheduledDate = recurrente.nextDate; 
    // ▲▲▲ FIN CORRECCIÓN ▲▲▲

    try {
        // 1. Efecto visual inmediato (UI Optimista)
        const itemEl = document.getElementById(`pending-recurrente-${id}`);
        if (itemEl) itemEl.classList.add('item-deleting');

        // 2. Cálculo de la nueva fecha (para el futuro)
        // Usamos originalScheduledDate como base para el cálculo
        let newNextDate = calculateNextDueDate(originalScheduledDate, recurrente.frequency, recurrente.weekDays);

        // 3. Preparar el Batch de Firebase (Escritura Atómica)
        const batch = fbDb.batch();
        const userRef = fbDb.collection('users').doc(currentUser.uid);

        // A. ¿Se ha terminado la serie o continúa?
        if (recurrente.frequency === 'once' || (recurrente.endDate && newNextDate > parseDateStringAsUTC(recurrente.endDate))) {
            batch.delete(userRef.collection('recurrentes').doc(id));
            db.recurrentes.splice(recurrenteIndex, 1); 
        } else {
            // Si sigue, actualizamos la próxima fecha en la DB y en local
            const newDateString = newNextDate.toISOString().slice(0, 10);
            batch.update(userRef.collection('recurrentes').doc(id), { nextDate: newDateString });
            db.recurrentes[recurrenteIndex].nextDate = newDateString;
        }
        
        // B. Crear el movimiento real en el historial
        const newMovementId = generateId();
        
        // ▼▼▼ USO DE LA FECHA CORRECTA ▼▼▼
        // Usamos 'originalScheduledDate' (la que tenía la tarjeta al pulsar), forzando mediodía UTC.
        const transactionDateISO = new Date(originalScheduledDate + 'T12:00:00Z').toISOString();

        const newMovementData = {
            id: newMovementId,
            cantidad: recurrente.cantidad,
            descripcion: recurrente.descripcion,
            fecha: transactionDateISO,
            tipo: recurrente.tipo,
            cuentaId: recurrente.cuentaId || null,
            conceptoId: recurrente.conceptoId || null,
            cuentaOrigenId: recurrente.cuentaOrigenId || null,
            cuentaDestinoId: recurrente.cuentaDestinoId || null
        };
        batch.set(userRef.collection('movimientos').doc(newMovementId), newMovementData);

        // C. Actualizar saldos de las cuentas afectadas
        if (recurrente.tipo === 'traspaso') {
            batch.update(userRef.collection('cuentas').doc(recurrente.cuentaOrigenId), { saldo: firebase.firestore.FieldValue.increment(-Math.abs(recurrente.cantidad)) });
            batch.update(userRef.collection('cuentas').doc(recurrente.cuentaDestinoId), { saldo: firebase.firestore.FieldValue.increment(Math.abs(recurrente.cantidad)) });
        } else {
            batch.update(userRef.collection('cuentas').doc(recurrente.cuentaId), { saldo: firebase.firestore.FieldValue.increment(recurrente.cantidad) });
        }

        // 4. ¡FUEGO! (Commit a Firebase)
        await batch.commit();
        
        hapticFeedback('success');
        showToast("Movimiento añadido correctamente.", "info");

    } catch (error) {
        console.error("Error al confirmar recurrente:", error);
        showToast("Error de conexión al procesar.", "danger");
        if (btn) setButtonLoading(btn, false);
        const itemEl = document.getElementById(`pending-recurrente-${id}`);
        if (itemEl) itemEl.classList.remove('item-deleting');
        return; 
    } finally {
        if (btn) setButtonLoading(btn, false);
        
        setTimeout(() => {
            const activePage = document.querySelector('.view--active');
            if (activePage && activePage.id === PAGE_IDS.PLANIFICAR) {
                renderPlanificacionPage();
            }
        }, 450);
    }
};
const handleSkipRecurrent = async (id, btn) => {
    if (btn) setButtonLoading(btn, true);

    const recurrenteIndex = db.recurrentes.findIndex(r => r.id === id);
    if (recurrenteIndex === -1) {
        showToast("Error: recurrente no encontrado.", "danger");
        if (btn) setButtonLoading(btn, false);
        return;
    }
    const recurrente = db.recurrentes[recurrenteIndex];
    
    try {
        // --- ACTUALIZACIÓN OPTIMISTA ---
        // 1. Inicia la animación de borrado en el elemento
        const itemEl = document.getElementById(`pending-recurrente-${id}`);
        if (itemEl) itemEl.classList.add('item-deleting');
        
        let successMessage = "";

        // 2. Preparamos el cambio para la base de datos en segundo plano
        if (recurrente.frequency === 'once') {
            await deleteDoc('recurrentes', id);
            db.recurrentes.splice(recurrenteIndex, 1); // Lo borramos de la memoria local
            successMessage = "Operación programada eliminada.";
        } else {
            const nextDate = calculateNextDueDate(recurrente.nextDate, recurrente.frequency, recurrente.weekDays);
            if (recurrente.endDate && nextDate > parseDateStringAsUTC(recurrente.endDate)) {
                await deleteDoc('recurrentes', id);
                db.recurrentes.splice(recurrenteIndex, 1); // Lo borramos de la memoria local
                successMessage = "Operación recurrente finalizada y eliminada.";
            } else {
                const newNextDateStr = nextDate.toISOString().slice(0, 10);
                await saveDoc('recurrentes', id, { nextDate: newNextDateStr });
                db.recurrentes[recurrenteIndex].nextDate = newNextDateStr; // Actualizamos la memoria local
                successMessage = "Operación omitida. Próxima ejecución reprogramada.";
            }
        }
        
        hapticFeedback('success');
        showToast(successMessage, "info");

    } catch (error) {
        console.error("Error al omitir recurrente:", error);
        showToast("No se pudo omitir la operación.", "danger");
        // Lógica de reversión si fuese necesario
    } finally {
        if (btn) setButtonLoading(btn, false);
        // Refrescamos la UI después de que la animación termine
        setTimeout(() => {
            const activePage = document.querySelector('.view--active');
             if (activePage && (activePage.id === PAGE_IDS.DIARIO || activePage.id === PAGE_IDS.PLANIFICAR)) { // Corregido: Estrategia -> Planificar
                if (activePage.id === PAGE_IDS.DIARIO) renderDiarioPage();
                if (activePage.id === PAGE_IDS.PLANIFICAR) renderPlanificacionPage();
            }
        }, 400);
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
    // --- ⭐ INICIO DE LA CORRECCIÓN: SEGURIDAD ANTE NULOS ⭐ ---
    
    // Revertir el impacto del movimiento antiguo si estamos editando
    if (oldData) {
        if (oldData.tipo === 'traspaso') {
            const origen = db.cuentas.find(c => c.id === oldData.cuentaOrigenId);
            if (origen) origen.saldo += oldData.cantidad; // Solo opera si la cuenta 'origen' existe
            const destino = db.cuentas.find(c => c.id === oldData.cuentaDestinoId);
            if (destino) destino.saldo -= oldData.cantidad; // Solo opera si la cuenta 'destino' existe
        } else {
            const cuenta = db.cuentas.find(c => c.id === oldData.cuentaId);
            if (cuenta) cuenta.saldo -= oldData.cantidad; // Solo opera si la cuenta existe
        }
    }

    // Aplicar el impacto del nuevo movimiento
    if (newData) {
        if (newData.tipo === 'traspaso') {
            const origen = db.cuentas.find(c => c.id === newData.cuentaOrigenId);
            if (origen) origen.saldo -= newData.cantidad; // Solo opera si la cuenta 'origen' existe
            const destino = db.cuentas.find(c => c.id === newData.cuentaDestinoId);
            if (destino) destino.saldo += newData.cantidad; // Solo opera si la cuenta 'destino' existe
        } else {
            const cuenta = db.cuentas.find(c => c.id === newData.cuentaId);
            if (cuenta) cuenta.saldo += newData.cantidad; // Solo opera si la cuenta existe
        }
    }
    // --- ⭐ FIN DE LA CORRECCIÓN ⭐ ---
};
const handleSaveMovement = async (form, btn) => {
    clearAllErrors(form.id);
    if (!validateMovementForm()) {
        hapticFeedback('error');
        showToast('Revisa los campos marcados.', 'warning');
        return false;
    }

    const saveBtn = select('save-movimiento-btn');
    const saveNewBtn = select('save-and-new-movimiento-btn');
    const isSaveAndNew = btn && btn.dataset.action === 'save-and-new-movement';

    if (saveBtn) setButtonLoading(saveBtn, true);
    if (saveNewBtn && isSaveAndNew) setButtonLoading(saveNewBtn, true);

    const releaseButtons = () => {
        if (saveBtn) setButtonLoading(saveBtn, false);
        if (saveNewBtn) setButtonLoading(saveNewBtn, false);
    };

    try {
        // 1. Obtener datos con seguridad (Null Check)
        const getVal = (id) => {
            const el = select(id);
            return el ? el.value : '';
        };

        const mode = getVal('movimiento-mode');
        const id = getVal('movimiento-id') || generateId();
        
        const typePill = document.querySelector('[data-action="set-movimiento-type"].filter-pill--active');
        const tipoMovimiento = typePill ? typePill.dataset.type : 'gasto';
        
        const cantidadPositiva = parseCurrencyString(getVal('movimiento-cantidad'));
        const cantidadEnCentimos = Math.round(cantidadPositiva * 100);
        
        const recurrenteCheck = select('movimiento-recurrente');
        const isRecurrent = recurrenteCheck ? recurrenteCheck.checked : false;

        // Objeto Base
        const baseData = {
            descripcion: getVal('movimiento-descripcion').trim(),
            cantidad: tipoMovimiento === 'gasto' ? -Math.abs(cantidadEnCentimos) : Math.abs(cantidadEnCentimos),
            tipo: tipoMovimiento,
            conceptoId: getVal('movimiento-concepto'),
        };

        // Lógica de Traspasos vs Normal
        if (tipoMovimiento === 'traspaso') {
            baseData.tipo = 'traspaso';
            baseData.cantidad = Math.abs(cantidadEnCentimos);
            baseData.cuentaOrigenId = getVal('movimiento-cuenta-origen');
            baseData.cuentaDestinoId = getVal('movimiento-cuenta-destino');
            baseData.cuentaId = null;
        } else {
            baseData.tipo = 'movimiento';
            baseData.cuentaId = getVal('movimiento-cuenta');
            baseData.cuentaOrigenId = null;
            baseData.cuentaDestinoId = null;
        }

        // --- GUARDADO DE RECURRENTE ---
        if (isRecurrent) {
            const frequency = getVal('recurrent-frequency') || 'monthly';
            
            // Fecha: Si el input de "Próxima fecha" está vacío, usar la fecha principal
            let rawNextDate = getVal('recurrent-next-date');
            if (!rawNextDate) rawNextDate = getVal('movimiento-fecha');
            
            // Validación extra para semanal
            let weekDays = [];
            if (frequency === 'weekly') {
                weekDays = Array.from(document.querySelectorAll('.day-selector-btn.active')).map(b => b.dataset.day);
                if (weekDays.length === 0) throw new Error("Selecciona al menos un día.");
            }

            const recurrentData = {
                id: id,
                ...baseData,
                frequency: frequency,
                nextDate: rawNextDate, 
                endDate: getVal('recurrent-end-date') || null, // Aquí fallaba antes
                weekDays: weekDays,
                active: true
            };

            await saveDoc('recurrentes', id, recurrentData);

            // Actualizar memoria local
            const idx = db.recurrentes.findIndex(r => r.id === id);
            if (idx > -1) db.recurrentes[idx] = recurrentData;
            else db.recurrentes.push(recurrentData);
            db.recurrentes.sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));

            hapticFeedback('success');
            showToast('Recurrente guardado.');
            
            const activePage = document.querySelector('.view--active');
            if (activePage && activePage.id === PAGE_IDS.PLANIFICAR) renderPlanificacionPage();

        } 
        // --- GUARDADO DE MOVIMIENTO NORMAL ---
        else {
            let oldData = null;
            if (mode.startsWith('edit')) {
                const original = db.movimientos.find(m => m.id === id);
                if (original) oldData = { ...original };
            }

            // CORRECCIÓN DE FECHA: Forzamos mediodía UTC para evitar saltos de día
            const rawDate = getVal('movimiento-fecha');
            const safeDateISO = rawDate ? new Date(rawDate + 'T12:00:00Z').toISOString() : new Date().toISOString();

            const dataToSave = {
                id: id,
                fecha: safeDateISO,
                ...baseData
            };

            // Actualizar Memoria Local
            if (oldData) {
                const index = db.movimientos.findIndex(m => m.id === id);
                if (index > -1) db.movimientos[index] = dataToSave;
            } else {
                db.movimientos.unshift(dataToSave);
            }

            // Actualizar Saldos (Optimista)
            applyOptimisticBalanceUpdate(dataToSave, oldData);
            triggerSaveAnimation(btn, dataToSave.cantidad >= 0 ? 'green' : 'red');

            // Batch Write a Firebase
            const batch = fbDb.batch();
            const userRef = fbDb.collection('users').doc(currentUser.uid);

            // Revertir saldo viejo
            if (oldData) {
                if (oldData.tipo === 'traspaso') {
                    batch.update(userRef.collection('cuentas').doc(oldData.cuentaOrigenId), { saldo: firebase.firestore.FieldValue.increment(oldData.cantidad) });
                    batch.update(userRef.collection('cuentas').doc(oldData.cuentaDestinoId), { saldo: firebase.firestore.FieldValue.increment(-oldData.cantidad) });
                } else {
                    batch.update(userRef.collection('cuentas').doc(oldData.cuentaId), { saldo: firebase.firestore.FieldValue.increment(-oldData.cantidad) });
                }
            }

            // Guardar nuevo
            batch.set(userRef.collection('movimientos').doc(id), dataToSave);

            // Aplicar saldo nuevo
            if (dataToSave.tipo === 'traspaso') {
                batch.update(userRef.collection('cuentas').doc(dataToSave.cuentaOrigenId), { saldo: firebase.firestore.FieldValue.increment(-dataToSave.cantidad) });
                batch.update(userRef.collection('cuentas').doc(dataToSave.cuentaDestinoId), { saldo: firebase.firestore.FieldValue.increment(dataToSave.cantidad) });
            } else {
                batch.update(userRef.collection('cuentas').doc(dataToSave.cuentaId), { saldo: firebase.firestore.FieldValue.increment(dataToSave.cantidad) });
            }

            await batch.commit(); // Commit en fondo, la UI ya se actualizó
            
            hapticFeedback('success');
            showToast('Movimiento guardado.', 'info');
			
			if (dataToSave.cantidad > 0 && dataToSave.tipo !== 'traspaso') {
				confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.7 }, // Sale desde la parte baja de la pantalla
				colors: ['#39FF14', '#00B34D', '#FFD60A'], // Verdes y Oro
			disableForReducedMotion: true
			});
		}
            setTimeout(() => updateLocalDataAndRefreshUI(), 50);
        }

        // Limpieza final
        if (!isSaveAndNew) hideModal('movimiento-modal');
        else startMovementForm();

    } catch (error) {
        console.error("Error al guardar:", error);
        showToast(error.message || "Error al guardar.", "danger");
    } finally {
        releaseButtons();
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
 select('form-movimiento-title').textContent = 'Duplicar Movimiento';	
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
const handleAddAccount = async (btn) => {
    const nombreInput = select('new-cuenta-nombre');
    const tipoInput = select('new-cuenta-tipo');
    
    // Obtener la caja seleccionada del formulario
    const ledgerInput = document.querySelector('input[name="new-cuenta-ledger"]:checked');
    const ledger = ledgerInput ? ledgerInput.value : 'A'; // Por defecto A si falla algo

    const nombre = nombreInput.value.trim();
    const tipo = toSentenceCase(tipoInput.value.trim());

    if (!nombre || !tipo) {
        showToast('El nombre y el tipo son obligatorios.', 'warning');
        return;
    }

    if (db.cuentas.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
        showToast(`La cuenta "${nombre}" ya existe.`, 'danger');
        return;
    }

    const newId = generateId();
    const newAccountData = {
        id: newId,
        nombre: nombre,
        tipo: tipo,
        saldo: 0,
        esInversion: false,
        ledger: ledger, // Guardamos explícitamente la caja seleccionada
        offBalance: ledger === 'B', // Compatibilidad legacy
        fechaCreacion: new Date().toISOString()
    };

    await saveDoc('cuentas', newId, newAccountData, btn);
    
    hapticFeedback('success');
    showToast(`Cuenta creada en Caja ${ledger}.`);
    
    // Limpiar formulario y recargar lista
    nombreInput.value = '';
    tipoInput.value = '';
    nombreInput.focus();
    renderCuentasModalList();
};

 const handleSaveConfig = async (btn) => { 
     setButtonLoading(btn, true);
     // Solo guardamos lo que existe, sin referencias a widgets antiguos
     const newConfig = { ...db.config }; 
     await fbDb.collection('users').doc(currentUser.uid).set({ config: newConfig }, { merge: true });
     localStorage.setItem('skipIntro', String(newConfig.skipIntro));
     setButtonLoading(btn, false);
     hapticFeedback('success'); 
     showToast('Configuración guardada.'); 
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
    
    let cleanStr = currencyString.replace(/[€$£\s]/g, ''); // Quitar símbolos
    
    // Detección heurística: Si la última ocurrencia es un punto, es formato US
    const lastDotIndex = cleanStr.lastIndexOf('.');
    const lastCommaIndex = cleanStr.lastIndexOf(',');

    if (lastDotIndex > lastCommaIndex) {
        // Formato US: 1,200.50 -> Quitar comas
        cleanStr = cleanStr.replace(/,/g, ''); 
    } else {
        // Formato ES: 1.200,50 -> Quitar puntos y cambiar coma por punto
        cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
    }

    const number = parseFloat(cleanStr);
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


// =================================================================
// === INICIO: FUNCIÓN DE BORRADO OPTIMIZADA (v2.1 - CON REVERSIÓN) ===
// =================================================================
const deleteMovementAndAdjustBalance = async (id, isRecurrent = false) => {
    const collection = isRecurrent ? 'recurrentes' : 'movimientos';
    const ANIMATION_DURATION = 400; // Debe coincidir con la duración en el CSS

    const itemElement = document.querySelector(`.transaction-card[data-id="${id}"]`)?.closest('.swipe-container');
    
    // 1. PREPARACIÓN PARA REVERSIÓN: Guardamos el estado original
    let itemToDelete;
    let originalIndex; // Guardamos la posición original para poder reinsertarlo
    const dbSource = isRecurrent ? db.recurrentes : db.movimientos;
    
    originalIndex = dbSource.findIndex(item => item.id === id);
    if (originalIndex === -1) {
        showToast("Error: El elemento a borrar no se encontró localmente.", "danger");
        return;
    }
    // Hacemos una copia profunda del objeto para no tener problemas de referencia
    itemToDelete = JSON.parse(JSON.stringify(dbSource[originalIndex])); 

    try {
        // 2. ACTUALIZACIÓN OPTIMISTA (La UI cambia al instante)
        dbSource.splice(originalIndex, 1); // Lo borramos de la memoria local

        if (!isRecurrent) {
            applyOptimisticBalanceUpdate(null, itemToDelete); // Revertimos el saldo en la caché local
        }
    
        if (itemElement) {
            itemElement.classList.add('item-deleting');
        }

        setTimeout(() => {
            updateLocalDataAndRefreshUI(); // Redibuja la lista sin el elemento
            if (isRecurrent) renderPlanificacionPage();
        }, itemElement ? ANIMATION_DURATION : 0);

        // 3. PERSISTENCIA EN SEGUNDO PLANO (El intento de guardado real)
        if (!isRecurrent) {
            const batch = fbDb.batch();
            const userRef = fbDb.collection('users').doc(currentUser.uid);
            if (itemToDelete.tipo === 'traspaso') {
                const origenRef = userRef.collection('cuentas').doc(itemToDelete.cuentaOrigenId);
                const destinoRef = userRef.collection('cuentas').doc(itemToDelete.cuentaDestinoId);
                batch.update(origenRef, { saldo: firebase.firestore.FieldValue.increment(itemToDelete.cantidad) });
                batch.update(destinoRef, { saldo: firebase.firestore.FieldValue.increment(-itemToDelete.cantidad) });
            } else {
                const cuentaRef = userRef.collection('cuentas').doc(itemToDelete.cuentaId);
                batch.update(cuentaRef, { saldo: firebase.firestore.FieldValue.increment(-itemToDelete.cantidad) });
            }
            batch.delete(userRef.collection(collection).doc(id));
            await batch.commit();
        } else {
            await deleteDoc(collection, id);
        }

        hapticFeedback('success');
        showToast("Elemento eliminado.", "info");

    } catch (error) {
        // 4. ¡PLAN B! SI FIREBASE FALLA, REVERTIMOS EL CAMBIO OPTIMISTA
        console.error("Firebase falló. Revirtiendo cambio optimista:", error);
        showToast("Error de red. El borrado no se completó.", "danger");

        // Volvemos a añadir el item que borramos localmente, en su posición original
        dbSource.splice(originalIndex, 0, itemToDelete);
        
        // Recalculamos el saldo con el item restaurado
        if (!isRecurrent) {
            applyOptimisticBalanceUpdate(itemToDelete, null);
        }
        
        // Forzamos un re-renderizado completo para asegurar la consistencia
        updateLocalDataAndRefreshUI();
        if (isRecurrent) renderPlanificacionPage();
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
const applyInvestmentItemInteractions = (containerElement) => {
    if (!containerElement) return;

    const investmentItems = containerElement.querySelectorAll('[data-action="view-account-details"]');

    investmentItems.forEach(item => {
        if (item.dataset.longPressApplied) return;
        item.dataset.longPressApplied = 'true';

        let longPressTimer;
        let startX, startY;
        let longPressTriggered = false;

        const startHandler = (e) => {
            // Soporte híbrido Touch/Mouse
            const point = (e.type.includes('touch') && e.touches && e.touches.length > 0) ? e.touches[0] : e;
            
            startX = point.clientX;
            startY = point.clientY;
            longPressTriggered = false;

            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                const accountId = item.dataset.id;
                hapticFeedback('medium');
                handleShowIrrHistory({ accountId: accountId });
            }, 500); 
        };

        const moveHandler = (e) => {
            if (!longPressTimer) return;
            
            // CORRECCIÓN DEL ERROR: Verificamos tipo de evento antes de buscar touches
            const point = (e.type.includes('touch') && e.touches && e.touches.length > 0) ? e.touches[0] : e;
            
            // Si el dedo se mueve más de 10px, cancelamos la pulsación larga (es un scroll)
            if (Math.abs(point.clientX - startX) > 10 || Math.abs(point.clientY - startY) > 10) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        const endHandler = (e) => {
            clearTimeout(longPressTimer);
            if (longPressTriggered) {
                if (e.cancelable) e.preventDefault();
                e.stopPropagation(); 
            }
        };
        
        // Eventos Táctiles
        item.addEventListener('touchstart', startHandler, { passive: true });
        item.addEventListener('touchmove', moveHandler, { passive: true });
        item.addEventListener('touchend', endHandler);
        
        // Eventos Ratón (PC)
        item.addEventListener('mousedown', startHandler);
        item.addEventListener('mousemove', moveHandler);
        item.addEventListener('mouseup', endHandler);
        item.addEventListener('mouseleave', () => clearTimeout(longPressTimer));
        
        item.addEventListener('contextmenu', e => e.preventDefault());
    });
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
    if (!isValid) { // <-- AÑADE ESTE BLOQUE IF AL FINAL
        hapticFeedback('error'); 
    }
    return isValid;
};
 

// --- REGISTRO DEL SERVICE WORKER ---
// Comprobamos si el navegador soporta Service Workers
// Registro del Service Worker para soporte Offline y PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration.scope);
      })
      .catch(error => {
        console.log('Fallo en el registro del Service Worker:', error);
      });
  });
 }