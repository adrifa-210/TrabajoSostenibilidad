/**
 * sostenibilidad.js
 * Funciones del Simulador InforFix 2030 (Usa datos de un archivo externo JSON)
 **/

let sustainabilityData = null;
let modalChartInstance = null;

// Lugares donde se guardarán los gráficos
let charts = {
    energy: null,    // Gráfico de energía
    circular: null,  // Gráfico de reciclaje
    mobility: null,  // Gráfico de transporte
    cloud: null,     // Gráfico de servidores
    social: null,    // Gráfico de impacto social
    parity: null     // Gráfico de igualdad
};

// Colores principales basados en el diseño de la web
const colors = {
    primary: 'hsl(215, 70%, 45%)', // Azul
    eco: 'hsl(142, 60%, 45%)',     // Verde
    gray: 'hsl(210, 10%, 80%)',    // Gris
    dark: 'hsl(210, 25%, 12%)'     // Oscuro
};

// Cargar el archivo de datos cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    fetch('data/sostenibilidad.json')
        .then(res => res.json())
        .then(data => {
            sustainabilityData = data;
            initDashboard(); // Iniciar todo una vez cargados los datos
        })
        .catch(err => console.error("Error cargando los datos de sostenibilidad:", err));
});

// Funciones auxiliares para trabajar con fechas (Mes y Año)
function getMonthYearFromIndex(index) {
    const year = 2024 + Math.floor(index / 12);
    const month = (index % 12) + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
}

function getDisplayMonthYear(index) {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const year = 2024 + Math.floor(index / 12);
    const month = index % 12;
    return `${months[month]} ${year}`;
}

function initDashboard() {
    initCards();
    initCharts();
    initModal();
    
    const slider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('current-year-display');
    
    // Calcular índice basado en la fecha actual (Ene 2024 es índice 0)
    const now = new Date();
    const startYear = 2024;
    const yearDiff = now.getFullYear() - startYear;
    let currentIndex = (yearDiff * 12) + now.getMonth();
    
    // Asegurar que estamos entre "Ene 2024" (0) y "Dic 2030" (83)
    currentIndex = Math.max(0, Math.min(currentIndex, 83));
    
    slider.value = currentIndex;
    
    // Initial Render
    yearDisplay.textContent = getDisplayMonthYear(slider.value);
    updateDashboard(slider.value);
    
    // Refrescar los efectos de las tarjetas para que funcionen también con el simulador
    if(typeof initCardFlip === 'function') {
        initCardFlip();
    }
    
    // Escuchar cuando el usuario mueve la barra de tiempo
    slider.addEventListener('input', (e) => {
        const index = parseInt(e.target.value, 10);
        yearDisplay.textContent = getDisplayMonthYear(index);
        updateDashboard(index);
    });
}

// Crear las tarjetas de información principales
function initCards() {
    const container = document.getElementById('kpi-cards-container');
    container.innerHTML = '';
    
    sustainabilityData.pillars.forEach((pillar, index) => {
        const card = document.createElement('div');
        card.className = 'card-container kpi-card-wrapper';
        card.id = `card-pillar-${pillar.id}`;
        card.style.height = '230px'; // Aumentado para acomodar el SVG estéticamente
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front glass kpi-front">
                    <div class="card-icon" style="margin-bottom: 0.5rem; transform: scale(0.85);">
                        ${pillar.card_icon}
                    </div>
                    <div class="kpi-title">${pillar.title}</div>
                    <div class="kpi-value-wrapper">
                        <span class="kpi-value" id="kpi-val-${pillar.id}">0</span>
                        <span class="kpi-unit">${pillar.kpi_unit}</span>
                    </div>
                    <div class="kpi-title" style="margin-top: 5px; font-size: 0.8rem">${pillar.kpi_name}</div>
                </div>
                <div class="card-back kpi-back">
                    <div class="card-icon">
                        ${pillar.card_icon}
                    </div>
                    <p style="position: relative; z-index: 2;">${pillar.extra_info}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Actualizar todo el panel según el mes/año seleccionado
function updateDashboard(index) {
    const monthKey = getMonthYearFromIndex(index);

    // Actualizar números de las tarjetas
    sustainabilityData.pillars.forEach(pillar => {
        const valueElement = document.getElementById(`kpi-val-${pillar.id}`);
        if(valueElement) {
            valueElement.textContent = Math.round(pillar.data[monthKey] * 10) / 10;
        }
    });

    // Pequeña animación visual al cambiar
    document.querySelectorAll('.kpi-card-wrapper').forEach(el => {
        el.style.transform = 'scale(1.02)';
        setTimeout(() => el.style.transform = 'none', 150);
    });

    // Actualizar todos los gráficos
    updateEnergyChart(index);
    updateCircularChart(index);
    updateMobilityChart(index);
    updateCloudChart(index);
    updateSocialChart(index);
    updateParityChart(index);
}

// ---------------------------------------------------------
// Creación y configuración inicial de los gráficos
// ---------------------------------------------------------

function getMonthsUpTo(targetIndex) {
    const labels = [];
    for(let i = 0; i <= targetIndex; i++) {
        labels.push(getMonthYearFromIndex(i));
    }
    return labels;
}

function initCharts() {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = 'hsl(210, 10%, 40%)';
    
    const initialLabel = getMonthYearFromIndex(0);
    
    // 1. Energy (Stacked Area)
    const ctxEnergy = document.getElementById('chartEnergy').getContext('2d');
    charts.energy = new Chart(ctxEnergy, {
        type: 'line',
        data: {
            labels: [initialLabel],
            datasets: [{
                label: '% Renovable',
                data: [0],
                borderColor: colors.eco,
                backgroundColor: 'hsla(142, 60%, 45%, 0.5)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            },
            plugins: { legend: { display: false } }
        }
    });

    // 2. Circular (Doughnut)
    const ctxCircular = document.getElementById('chartCircular').getContext('2d');
    charts.circular = new Chart(ctxCircular, {
        type: 'doughnut',
        data: {
            labels: ['Reciclado/Reusado', 'Desecho'],
            datasets: [{
                data: [10, 90],
                backgroundColor: [colors.eco, colors.gray],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 3. Mobility (Bar)
    const ctxMobility = document.getElementById('chartMobility').getContext('2d');
    charts.mobility = new Chart(ctxMobility, {
        type: 'bar',
        data: {
            labels: [initialLabel],
            datasets: [
                {
                    label: '% Flota Cero Emisiones',
                    data: [0],
                    backgroundColor: colors.eco
                },
                {
                    label: '% Ahorro Rutas IA',
                    data: [0],
                    backgroundColor: colors.primary
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });

    // 4. Cloud (Gauge / half doughnut)
    const ctxCloud = document.getElementById('chartCloud').getContext('2d');
    charts.cloud = new Chart(ctxCloud, {
        type: 'doughnut',
        data: {
            labels: ['PUE Actual', 'Margen Mejora'],
            datasets: [{
                data: [1.8, 0.2],
                backgroundColor: [colors.primary, colors.gray],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 180,
            cutout: '75%',
            plugins: {
                legend: { display: false }
            }
        }
    });

    // 5. Social (Bar - % Formación + Horas/Empleado dual axis)
    const ctxSocial = document.getElementById('chartSocial').getContext('2d');
    charts.social = new Chart(ctxSocial, {
        type: 'bar',
        data: {
            labels: [initialLabel],
            datasets: [
                {
                    label: '% Formación',
                    data: [0],
                    backgroundColor: 'hsla(340, 82%, 44%, 0.75)',
                    borderColor: '#C5192D',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'h/empleado',
                    data: [0],
                    backgroundColor: 'hsla(216, 70%, 45%, 0.75)',
                    borderColor: 'hsl(215, 70%, 45%)',
                    borderWidth: 1,
                    yAxisID: 'y1',
                    type: 'line',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    position: 'left',
                    title: { display: true, text: '%' }
                },
                y1: {
                    beginAtZero: true,
                    max: 50,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'h/emp' }
                }
            },
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        }
    });

    // 6. Parity (Line chart with two datasets)
    const ctxParity = document.getElementById('chartParity').getContext('2d');
    charts.parity = new Chart(ctxParity, {
        type: 'line',
        data: {
            labels: [initialLabel],
            datasets: [
                {
                    label: '% Mujeres',
                    data: [0],
                    borderColor: 'hsla(340, 82%, 44%, 1)',
                    backgroundColor: 'hsla(340, 82%, 44%, 0.2)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: '% Hombres',
                    data: [0],
                    borderColor: 'hsl(215, 70%, 45%)',
                    backgroundColor: 'hsla(215, 70%, 45%, 0.2)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: '%' }
                }
            },
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        }
    });
}

// ---------------------------------------------------------
// Funciones para actualizar los datos de cada gráfico específico
// ---------------------------------------------------------
function updateEnergyChart(index) {
    const labels = getMonthsUpTo(index);
    const data = labels.map(key => sustainabilityData.pillars[0].data[key]);
    
    charts.energy.data.labels = labels;
    charts.energy.data.datasets[0].data = data;
    charts.energy.update();
}

function updateCircularChart(index) {
    const key = getMonthYearFromIndex(index);
    const pData = sustainabilityData.pillars[1].data[key];
    charts.circular.data.datasets[0].data = [pData, 100 - pData];
    charts.circular.update();
}

function updateMobilityChart(index) {
    const labels = getMonthsUpTo(index);
    const dataset1 = labels.map(key => sustainabilityData.pillars[2].data[key]);
    const dataset2 = labels.map(key => sustainabilityData.pillars[2].sec_data[key]);

    charts.mobility.data.labels = labels;
    charts.mobility.data.datasets[0].data = dataset1;
    charts.mobility.data.datasets[1].data = dataset2;
    charts.mobility.update();
}

function updateCloudChart(index) {
    const key = getMonthYearFromIndex(index);
    const pueValue = sustainabilityData.pillars[3].sec_data[key];
    const efficiencyTarget = ((2.0 - pueValue) / 1.0) * 100;
    
    let color = colors.primary;
    if (pueValue <= 1.25) color = colors.eco;
    
    charts.cloud.data.datasets[0].backgroundColor = [color, colors.gray];
    charts.cloud.data.datasets[0].data = [efficiencyTarget, 100 - efficiencyTarget];
    charts.cloud.update();
}

function updateSocialChart(index) {
    const labels  = getMonthsUpTo(index);
    const pillar  = sustainabilityData.pillars[4];
    const dataset1 = labels.map(key => pillar.data[key]);
    const dataset2 = labels.map(key => pillar.sec_data[key]);

    charts.social.data.labels = labels;
    charts.social.data.datasets[0].data = dataset1;
    charts.social.data.datasets[1].data = dataset2;
    charts.social.update();
}

function updateParityChart(index) {
    const labels  = getMonthsUpTo(index);
    const pillar  = sustainabilityData.pillars[5];
    const dataset1 = labels.map(key => pillar.data[key]);
    const dataset2 = labels.map(key => pillar.sec_data[key]);

    charts.parity.data.labels = labels;
    charts.parity.data.datasets[0].data = dataset1;
    charts.parity.data.datasets[1].data = dataset2;
    charts.parity.update();
}

// ---------------------------------------------------------
// Modal Logic
// ---------------------------------------------------------
let currentModalChartType = null;

function initModal() {
    const modal = document.getElementById('chart-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const modalSlider = document.getElementById('modal-year-slider');
    const mainSlider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('current-year-display');
    
    document.querySelectorAll('.chart-expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartKey = e.currentTarget.dataset.chart;
            const title = e.currentTarget.closest('.chart-header').querySelector('h4').innerText;
            openChartModal(chartKey, title);
        });
    });
    
    closeBtn.addEventListener('click', closeChartModal);
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeChartModal();
    });
    
    // Sincronizar la barra de tiempo de la ventana con la principal
    modalSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        mainSlider.value = val;
        yearDisplay.textContent = getDisplayMonthYear(val);
        updateDashboard(val);
        
        if (modalChartInstance && currentModalChartType) {
            const originalChart = charts[currentModalChartType];
            modalChartInstance.data = JSON.parse(JSON.stringify(originalChart.data));
            modalChartInstance.update();
        }
    });

    // Eventos para las ventanas de más información (Textos)
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const infoKey = e.currentTarget.dataset.info;
            openInfoModal(infoKey);
        });
    });
    
    document.getElementById('close-info-btn').addEventListener('click', closeInfoModal);
    document.getElementById('info-modal').addEventListener('click', (e) => {
        if(e.target.id === 'info-modal') closeInfoModal();
    });
}

function openChartModal(type, title) {
    currentModalChartType = type;
    const modal = document.getElementById('chart-modal');
    document.getElementById('modal-title').innerText = title;
    
    const mainSlider = document.getElementById('year-slider');
    document.getElementById('modal-year-slider').value = mainSlider.value;
    
    if(modalChartInstance) {
        modalChartInstance.destroy();
    }
    
    const ctx = document.getElementById('modalCanvas').getContext('2d');
    const originalChart = charts[type];
    
    // Deep clone options
    const newConfig = {
        type: originalChart.config.type,
        data: JSON.parse(JSON.stringify(originalChart.config.data)),
        options: JSON.parse(JSON.stringify(originalChart.config.options))
    };
    
    // Override purely visual configurations for modal
    newConfig.options.responsive = true;
    newConfig.options.maintainAspectRatio = false;
    
    if (newConfig.options.plugins && newConfig.options.plugins.legend) {
        newConfig.options.plugins.legend.display = true; 
        newConfig.options.plugins.legend.position = 'bottom';
        newConfig.options.plugins.legend.labels = {
            font: { size: 14 }
        };
    }
    
    if(newConfig.type === 'doughnut') {
        newConfig.options.cutout = '60%'; // Bigger rings in fullscreen
    }

    modalChartInstance = new Chart(ctx, newConfig);
    
    // Mostrar modal con un pequeño retraso para prevenir glitches de canvas
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeChartModal() {
    document.getElementById('chart-modal').classList.remove('active');
    currentModalChartType = null;
}

// ---------------------------------------------------------
// Lógica para las ventanas de información (Textos de ayuda)
// ---------------------------------------------------------
function openInfoModal(type) {
    const p = sustainabilityData.pillars.find(x => x.key === type);
    if(!p) return;
    
    document.getElementById('info-modal-title').innerText = p.modal_title;
    document.getElementById('info-modal-body').innerHTML = p.modal_content;
    
    const modal = document.getElementById('info-modal');
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeInfoModal() {
    document.getElementById('info-modal').classList.remove('active');
}

