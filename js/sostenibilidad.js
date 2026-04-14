/**
 * sustainability.js
 * Lógica interactiva para Simulador InforFix 2030 (Separado en JSON, meses/años)
 */

let sustainabilityData = null;

// Global Chart Instances
let charts = {
    energy: null,
    circular: null,
    mobility: null,
    cloud: null
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
    
    const slider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('current-year-display');
    
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
        "Colaboramos con centros de datos de PUE óptimo y neutros en carbono."
    ];
    
    sustainabilityData.pillars.forEach((pillar, index) => {
        const card = document.createElement('div');
        card.className = 'card-container kpi-card-wrapper';
        card.id = `card-pillar-${pillar.id}`;
        card.style.height = '160px'; // Sobrescribe los 380px de components.css
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front glass kpi-front">
                    <div class="kpi-title">${pillar.title}</div>
                    <div class="kpi-value-wrapper">
                        <span class="kpi-value" id="kpi-val-${pillar.id}">0</span>
                        <span class="kpi-unit">${pillar.kpi_unit}</span>
                    </div>
                    <div class="kpi-title" style="margin-top: 5px; font-size: 0.8rem">${pillar.kpi_name}</div>
                </div>
                <div class="card-back kpi-back">
                    <p>${extraInfo[index]}</p>
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
