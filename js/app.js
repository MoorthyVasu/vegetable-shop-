// ============== USER APP ==============

let priceChart = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Record this visit
    recordVisit('Home');
    
    // Load vegetables from Google Sheets
    await loadVegetables();
    
    // Initialize chart
    initializeChart();
});

// Load and display vegetables
async function loadVegetables() {
    const grid = document.getElementById('vegetablesGrid');
    grid.innerHTML = '<p class="no-data">Loading vegetables...</p>';
    
    // Fetch from Google Sheets
    const vegetables = await fetchVegetablesFromSheet();
    const select = document.getElementById('vegetableSelect');
    
    if (vegetables.length === 0) {
        grid.innerHTML = '<p class="no-data">No vegetables available at the moment. Check back soon!</p>';
        return;
    }
    
    // Clear existing content
    grid.innerHTML = '';
    select.innerHTML = '';
    
    // Add vegetable cards
    vegetables.forEach((veg, index) => {
        // Create card
        const card = document.createElement('div');
        card.className = 'vegetable-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Calculate price change
        const priceChange = getPriceChange(veg);
        
        card.innerHTML = `
            <div class="vegetable-emoji">${veg.emoji}</div>
            <div class="vegetable-name">${veg.name}</div>
            <div class="vegetable-name-tamil">${veg.tamilName || ''}</div>
            <div class="vegetable-price">₹${veg.price} <span>/kg</span></div>
            <div class="price-change ${priceChange.class}">${priceChange.text}</div>
        `;
        
        card.onclick = () => {
            document.getElementById('vegetableSelect').value = veg.id;
            updateChart();
            document.querySelector('.chart-section').scrollIntoView({ behavior: 'smooth' });
        };
        
        grid.appendChild(card);
        
        // Add to select dropdown
        const option = document.createElement('option');
        option.value = veg.id;
        option.textContent = `${veg.emoji} ${veg.name} - ${veg.tamilName || ''}`;
        select.appendChild(option);
    });
}

// Get price change info
function getPriceChange(veg) {
    if (!veg.priceHistory || veg.priceHistory.length < 2) {
        return { text: 'New', class: 'price-same' };
    }
    
    const history = veg.priceHistory;
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    const diff = current - previous;
    
    if (diff > 0) {
        return { text: `↑ ₹${diff}`, class: 'price-up' };
    } else if (diff < 0) {
        return { text: `↓ ₹${Math.abs(diff)}`, class: 'price-down' };
    } else {
        return { text: 'No change', class: 'price-same' };
    }
}

// Filter vegetables by search
function filterVegetables() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const vegetables = getVegetables();
    const grid = document.getElementById('vegetablesGrid');
    
    const filtered = vegetables.filter(veg => 
        veg.name.toLowerCase().includes(searchTerm) ||
        (veg.tamilName && veg.tamilName.includes(searchTerm))
    );
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p class="no-data">No vegetables found matching your search.</p>';
        return;
    }
    
    grid.innerHTML = '';
    filtered.forEach((veg, index) => {
        const card = document.createElement('div');
        card.className = 'vegetable-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        const priceChange = getPriceChange(veg);
        
        card.innerHTML = `
            <div class="vegetable-emoji">${veg.emoji}</div>
            <div class="vegetable-name">${veg.name}</div>
            <div class="vegetable-name-tamil">${veg.tamilName || ''}</div>
            <div class="vegetable-price">₹${veg.price} <span>/kg</span></div>
            <div class="price-change ${priceChange.class}">${priceChange.text}</div>
        `;
        
        card.onclick = () => {
            document.getElementById('vegetableSelect').value = veg.id;
            updateChart();
            document.querySelector('.chart-section').scrollIntoView({ behavior: 'smooth' });
        };
        
        grid.appendChild(card);
    });
}

// Initialize the price chart
function initializeChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const vegetables = getVegetables();
    
    if (vegetables.length === 0) return;
    
    const firstVeg = vegetables[0];
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getDateLabels(),
            datasets: [{
                label: `${firstVeg.emoji} ${firstVeg.name} Price (₹/kg)`,
                data: firstVeg.priceHistory || [firstVeg.price],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2d5a27',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(45, 90, 39, 0.9)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Price: ₹${context.raw}/kg`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        },
                        font: { size: 12 }
                    },
                    title: {
                        display: true,
                        text: 'Price (₹/kg)',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 12 }
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Update chart when vegetable is selected
function updateChart() {
    const vegetables = getVegetables();
    const selectedId = parseInt(document.getElementById('vegetableSelect').value);
    const selectedVeg = vegetables.find(v => v.id === selectedId);
    
    if (!selectedVeg || !priceChart) return;
    
    priceChart.data.labels = getDateLabels();
    priceChart.data.datasets[0].label = `${selectedVeg.emoji} ${selectedVeg.name} Price (₹/kg)`;
    priceChart.data.datasets[0].data = selectedVeg.priceHistory || [selectedVeg.price];
    priceChart.update();
}
