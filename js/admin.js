// ============== ADMIN APP ==============

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Check authentication status
function checkAuth() {
    if (isLoggedIn()) {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
}

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadAdminData();
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        setLoggedIn('true');
        showAdminPanel();
    } else {
        alert('Invalid credentials! Please try again.');
    }
}

// Logout
function logout() {
    setLoggedIn('false');
    showLoginScreen();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Load all admin data
function loadAdminData() {
    loadVegetablesList();
    loadVisitorStats();
    loadVisitsTable();
}

// Load vegetables list for management
function loadVegetablesList() {
    const vegetables = getVegetables();
    const list = document.getElementById('adminVegetablesList');
    
    if (vegetables.length === 0) {
        list.innerHTML = '<p class="no-data">No vegetables added yet.</p>';
        return;
    }
    
    list.innerHTML = vegetables.map(veg => `
        <div class="admin-veg-item">
            <div class="admin-veg-info">
                <span class="emoji">${veg.emoji}</span>
                <div class="details">
                    <h4>${veg.name}</h4>
                    <p>₹${veg.price}/kg</p>
                </div>
            </div>
            <div class="admin-veg-actions">
                <button class="btn btn-edit" onclick="openEditModal(${veg.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteVegetable(${veg.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Add new vegetable
function addVegetable(event) {
    event.preventDefault();
    
    const name = document.getElementById('vegName').value.trim();
    const price = parseFloat(document.getElementById('vegPrice').value);
    const emoji = document.getElementById('vegEmoji').value.trim();
    
    // Validate
    if (!name || !price || !emoji) {
        alert('Please fill all fields!');
        return;
    }
    
    const vegetables = getVegetables();
    
    // Check for duplicate
    if (vegetables.some(v => v.name.toLowerCase() === name.toLowerCase())) {
        alert('This vegetable already exists!');
        return;
    }
    
    // Create new vegetable
    const newVeg = {
        id: getNextId(),
        name: name,
        price: price,
        emoji: emoji,
        priceHistory: [price, price, price, price, price]
    };
    
    vegetables.push(newVeg);
    saveVegetables(vegetables);
    
    // Reset form
    document.getElementById('addVegetableForm').reset();
    
    // Reload list
    loadVegetablesList();
    
    alert(`${emoji} ${name} added successfully!`);
}

// Open edit modal
function openEditModal(id) {
    const vegetables = getVegetables();
    const veg = vegetables.find(v => v.id === id);
    
    if (!veg) return;
    
    document.getElementById('editVegId').value = veg.id;
    document.getElementById('editVegName').value = veg.name;
    document.getElementById('editVegPrice').value = veg.price;
    document.getElementById('editVegEmoji').value = veg.emoji;
    
    document.getElementById('editModal').style.display = 'flex';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Save edited vegetable
function saveEditedVegetable(event) {
    event.preventDefault();
    
    const id = parseInt(document.getElementById('editVegId').value);
    const name = document.getElementById('editVegName').value.trim();
    const price = parseFloat(document.getElementById('editVegPrice').value);
    const emoji = document.getElementById('editVegEmoji').value.trim();
    
    const vegetables = getVegetables();
    const index = vegetables.findIndex(v => v.id === id);
    
    if (index === -1) return;
    
    const oldPrice = vegetables[index].price;
    
    // Update vegetable
    vegetables[index].name = name;
    vegetables[index].price = price;
    vegetables[index].emoji = emoji;
    
    // Update price history if price changed
    if (oldPrice !== price) {
        if (!vegetables[index].priceHistory) {
            vegetables[index].priceHistory = [oldPrice, oldPrice, oldPrice, oldPrice, price];
        } else {
            vegetables[index].priceHistory.shift();
            vegetables[index].priceHistory.push(price);
        }
    }
    
    saveVegetables(vegetables);
    closeEditModal();
    loadVegetablesList();
    
    alert(`${emoji} ${name} updated successfully!`);
}

// Delete vegetable
function deleteVegetable(id) {
    if (!confirm('Are you sure you want to delete this vegetable?')) {
        return;
    }
    
    let vegetables = getVegetables();
    vegetables = vegetables.filter(v => v.id !== id);
    saveVegetables(vegetables);
    loadVegetablesList();
    
    alert('Vegetable deleted successfully!');
}

// Load visitor statistics
function loadVisitorStats() {
    const stats = getVisitStats();
    
    document.getElementById('totalVisits').textContent = stats.total;
    document.getElementById('todayVisits').textContent = stats.today;
    document.getElementById('uniqueVisitors').textContent = stats.unique;
}

// Load visits table
function loadVisitsTable() {
    const visits = getVisits();
    const tbody = document.getElementById('visitsTableBody');
    
    if (visits.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No visits recorded yet.</td></tr>';
        return;
    }
    
    // Show last 50 visits, newest first
    const recentVisits = visits.slice(-50).reverse();
    
    tbody.innerHTML = recentVisits.map(visit => {
        const date = new Date(visit.timestamp);
        const formattedDate = date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${visit.page}</td>
                <td>${visit.device}</td>
            </tr>
        `;
    }).join('');
}

// Clear visit history
function clearVisitHistory() {
    if (!confirm('Are you sure you want to clear all visit history?')) {
        return;
    }
    
    clearVisits();
    loadVisitorStats();
    loadVisitsTable();
    
    alert('Visit history cleared!');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
};
