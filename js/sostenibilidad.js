/**
 * sustainability.js
 * Lógica interactiva para Simulador InforFix 2030
 */

const sustainabilityData = {
    "company": "InforFix",
    "location": "Granada, España",
    "baseline_year": 2024,
    "target_year": 2030,
    "pillars": [
        {
            "id": 1,
            "title": "Energía",
            "kpi_name": "Consumo Renovable",
            "kpi_unit": "%",
            "data": { "2024": 0, "2025": 15, "2026": 30, "2027": 45, "2028": 60, "2029": 80, "2030": 100 },
            "sec_name": "Emisiones Alcance 2",
            "sec_unit": "tCO2e",
            "sec_data": { "2024": 120, "2025": 105, "2026": 85, "2027": 65, "2028": 40, "2029": 20, "2030": 0 }
        },
        {
            "id": 2,
            "title": "Economía Circular",
            "kpi_name": "Tasa de Reciclaje",
            "kpi_unit": "%",
            "data": { "2024": 10, "2025": 25, "2026": 45, "2027": 60, "2028": 75, "2029": 85, "2030": 95 },
            "sec_name": "Equipos Reacondicionados",
            "sec_unit": "ud/año",
            "sec_data": { "2024": 50, "2025": 150, "2026": 300, "2027": 500, "2028": 750, "2029": 1000, "2030": 1500 }
        },
        {
            "id": 3,
            "title": "Movilidad",
            "kpi_name": "Cero Emisiones",
            "kpi_unit": "%",
            "data": { "2024": 0, "2025": 10, "2026": 25, "2027": 35, "2028": 50, "2029": 75, "2030": 100 },
            "sec_name": "Ahorro por IA",
            "sec_unit": "%",
            "sec_data": { "2024": 0, "2025": 5, "2026": 12, "2027": 18, "2028": 25, "2029": 30, "2030": 35 }
        },
        {
            "id": 4,
            "title": "Green Cloud",
            "kpi_name": "Proveedores Verdes",
            "kpi_unit": "%",
            "data": { "2024": 0, "2025": 20, "2026": 40, "2027": 60, "2028": 80, "2029": 90, "2030": 100 },
            "sec_name": "PUE Medio",
            "sec_unit": "ratio",
            "sec_data": { "2024": 1.80, "2025": 1.65, "2026": 1.40, "2027": 1.35, "2028": 1.25, "2029": 1.20, "2030": 1.15 }
        }
    ]
};

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
    initDashboard();
});

function initDashboard() {
    initCards();
    initCharts();
    
    const slider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('current-year-display');
    
    // Initial Render
    updateDashboard(slider.value);
    
    // Listen for slider changes
    slider.addEventListener('input', (e) => {
        const year = e.target.value;
        yearDisplay.textContent = year;
        updateDashboard(year);
    });
}

function initCards() {
    const container = document.getElementById('kpi-cards-container');
    container.innerHTML = '';
    
    sustainabilityData.pillars.forEach(pillar => {
        const card = document.createElement('div');
        card.className = 'kpi-card';
        card.id = `card-pillar-${pillar.id}`;
        card.innerHTML = `
            <div class="kpi-title">${pillar.title}</div>
            <div class="kpi-value-wrapper">
                <span class="kpi-value" id="kpi-val-${pillar.id}">0</span>
                <span class="kpi-unit">${pillar.kpi_unit}</span>
            </div>
            <div class="kpi-title" style="margin-top: 5px; font-size: 0.8rem">${pillar.kpi_name}</div>
        `;
        container.appendChild(card);
    });
}

function updateDashboard(year) {
    // Update Cards
    sustainabilityData.pillars.forEach(pillar => {
        const valueElement = document.getElementById(`kpi-val-${pillar.id}`);
        if(valueElement) {
            valueElement.textContent = pillar.data[year];
        }
    });

    // Animate Cards by removing and adding a subtle class (optional trick for number jump)
    document.querySelectorAll('.kpi-card').forEach(el => {
        el.style.transform = 'scale(1.02)';
        setTimeout(() => el.style.transform = 'none', 150);
    });

    // Update Charts
    updateEnergyChart(year);
    updateCircularChart(year);
    updateMobilityChart(year);
    updateCloudChart(year);
}

// ---------------------------------------------------------
// Chart Inicializations & Updates
// ---------------------------------------------------------

function getYearsUpTo(targetYear) {
    const years = [];
    for(let y = 2024; y <= targetYear; y++) years.push(y.toString());
    return years;
}

function initCharts() {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = 'hsl(210, 10%, 40%)';
    
    // 1. Energy (Stacked Area)
    const ctxEnergy = document.getElementById('chartEnergy').getContext('2d');
    charts.energy = new Chart(ctxEnergy, {
        type: 'line',
        data: {
            labels: ['2024'],
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
            labels: ['2024'],
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
                data: [1.8, 0.2], // PUE ranges from 1 to ~2 basically, we map it visually
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
function updateEnergyChart(year) {
    const labels = getYearsUpTo(year);
    const data = labels.map(y => sustainabilityData.pillars[0].data[y]);
    
    charts.energy.data.labels = labels;
    charts.energy.data.datasets[0].data = data;
    charts.energy.update();
}

function updateCircularChart(year) {
    const pData = sustainabilityData.pillars[1].data[year];
    charts.circular.data.datasets[0].data = [pData, 100 - pData];
    charts.circular.update();
}

function updateMobilityChart(year) {
    const labels = getYearsUpTo(year);
    const dataset1 = labels.map(y => sustainabilityData.pillars[2].data[y]);
    const dataset2 = labels.map(y => sustainabilityData.pillars[2].sec_data[y]);

    charts.mobility.data.labels = labels;
    charts.mobility.data.datasets[0].data = dataset1;
    charts.mobility.data.datasets[1].data = dataset2;
    charts.mobility.update();
}

function updateCloudChart(year) {
    const pueValue = sustainabilityData.pillars[3].sec_data[year];
    // Map PUE (1.0 to 2.0) to a percentage for visual representation
    // Assuming ideal PUE is 1.0 (100% efficient), and worst is 2.0.
    // Progress towards 1.0 = (2.0 - PUE) / 1.0 * 100
    const efficiencyTarget = ((2.0 - pueValue) / 1.0) * 100;
    
    // Update chart colors dynamically: Red if bad, yellow if OK, green if good
    let color = colors.primary;
    if (pueValue <= 1.25) color = colors.eco;
    
    charts.cloud.data.datasets[0].backgroundColor = [color, colors.gray];
    charts.cloud.data.datasets[0].data = [efficiencyTarget, 100 - efficiencyTarget];
    charts.cloud.update();
}
