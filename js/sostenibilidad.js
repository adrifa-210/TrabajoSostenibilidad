/**
 * sustainability.js
 * Lógica interactiva para Simulador InforFix 2030 (Separado en JSON, meses/años)
 */

let sustainabilityData = null;
let modalChartInstance = null;

// Global Chart Instances
let charts = {
    energy: null,
    circular: null,
    mobility: null,
    cloud: null,
    social: null,
    parity: null
};

// Global Colors based on CSS variables
const colors = {
    primary: 'hsl(215, 70%, 45%)',
    eco: 'hsl(142, 60%, 45%)',
    gray: 'hsl(210, 10%, 80%)',
    dark: 'hsl(210, 25%, 12%)'
};

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/sostenibilidad.json')
        .then(res => res.json())
        .then(data => {
            sustainabilityData = data;
            initDashboard();
        })
        .catch(err => console.error("Error loading sustainability data:", err));
});

// Helper to get Year-Month from index (0 to 83)
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
    
    // Refresh mobile flip observers for newly injected cards
    if(typeof initCardFlip === 'function') {
        initCardFlip();
    }
    
    // Listen for slider changes
    slider.addEventListener('input', (e) => {
        const index = parseInt(e.target.value, 10);
        yearDisplay.textContent = getDisplayMonthYear(index);
        updateDashboard(index);
    });
}

function initCards() {
    const container = document.getElementById('kpi-cards-container');
    container.innerHTML = '';
    
    const extraInfo = [
        "Avanzamos hacia el autoconsumo total y una máxima eficiencia energética.",
        "Apostamos por extender la vida útil tecnológica y potenciar el reciclaje.",
        "Transformamos la logística con flota verde y rutas optimizadas por IA.",
        "Colaboramos con centros de datos de PUE óptimo y neutros en carbono.",
        "Promovemos la igualdad, conciliación y alfabetización digital en Granada.",
        "Apostamos firmemente por la igualdad y paridad de género en la empresa."
    ];
    
    const cardIcons = [
        `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke-width="1.5" stroke="currentColor" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
        `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke-width="1.5" stroke="currentColor" fill="none"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>`,
        `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke-width="1.5" stroke="currentColor" fill="none"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
        `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke-width="1.5" stroke="currentColor" fill="none"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
        `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke-width="1.5" stroke="currentColor" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" stroke-width="1.5" stroke="currentColor" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
    ];
    
    sustainabilityData.pillars.forEach((pillar, index) => {
        const card = document.createElement('div');
        card.className = 'card-container kpi-card-wrapper';
        card.id = `card-pillar-${pillar.id}`;
        card.style.height = '230px'; // Aumentado para acomodar el SVG estéticamente
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front glass kpi-front">
                    <div class="card-icon" style="margin-bottom: 0.5rem; transform: scale(0.85);">
                        ${cardIcons[index]}
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
                        ${cardIcons[index]}
                    </div>
                    <p style="position: relative; z-index: 2;">${extraInfo[index]}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateDashboard(index) {
    const monthKey = getMonthYearFromIndex(index);

    // Update Cards
    sustainabilityData.pillars.forEach(pillar => {
        const valueElement = document.getElementById(`kpi-val-${pillar.id}`);
        if(valueElement) {
            valueElement.textContent = Math.round(pillar.data[monthKey] * 10) / 10;
        }
    });

    // Animate Cards
    document.querySelectorAll('.kpi-card-wrapper').forEach(el => {
        el.style.transform = 'scale(1.02)';
        setTimeout(() => el.style.transform = 'none', 150);
    });

    // Update Charts
    updateEnergyChart(index);
    updateCircularChart(index);
    updateMobilityChart(index);
    updateCloudChart(index);
    updateSocialChart(index);
    updateParityChart(index);
}

// ---------------------------------------------------------
// Chart Inicializations & Updates
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
// Dynamic Data Injectors per Chart
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
    
    // Sincronizar slider modal con slider principal
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
