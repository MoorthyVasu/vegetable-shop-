// ============== DATA MANAGEMENT ==============

// Default vegetables data
const defaultVegetables = [
    { id: 1, name: 'Tomato', price: 40, emoji: '🍅', priceHistory: [35, 38, 42, 40, 40] },
    { id: 2, name: 'Potato', price: 25, emoji: '🥔', priceHistory: [22, 24, 25, 25, 25] },
    { id: 3, name: 'Onion', price: 35, emoji: '🧅', priceHistory: [30, 32, 38, 35, 35] },
    { id: 4, name: 'Carrot', price: 45, emoji: '🥕', priceHistory: [40, 42, 45, 45, 45] },
    { id: 5, name: 'Cabbage', price: 30, emoji: '🥬', priceHistory: [28, 30, 32, 30, 30] },
    { id: 6, name: 'Brinjal', price: 35, emoji: '🍆', priceHistory: [30, 32, 35, 35, 35] },
    { id: 7, name: 'Capsicum', price: 60, emoji: '🫑', priceHistory: [55, 58, 62, 60, 60] },
    { id: 8, name: 'Cucumber', price: 25, emoji: '🥒', priceHistory: [22, 24, 25, 25, 25] },
    { id: 9, name: 'Green Chilli', price: 80, emoji: '🌶️', priceHistory: [70, 75, 85, 80, 80] },
    { id: 10, name: 'Beetroot', price: 40, emoji: '🫒', priceHistory: [35, 38, 40, 40, 40] },
    { id: 11, name: 'Spinach', price: 30, emoji: '🥗', priceHistory: [25, 28, 30, 30, 30] },
    { id: 12, name: 'Pumpkin', price: 25, emoji: '🎃', priceHistory: [20, 22, 25, 25, 25] }
];

// Date labels for price history (last 5 days)
function getDateLabels() {
    const labels = [];
    for (let i = 4; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    }
    return labels;
}

// Get vegetables from localStorage or default
function getVegetables() {
    const stored = localStorage.getItem('vegetables');
    if (stored) {
        return JSON.parse(stored);
    }
    // Initialize with default data
    localStorage.setItem('vegetables', JSON.stringify(defaultVegetables));
    return defaultVegetables;
}

// Save vegetables to localStorage
function saveVegetables(vegetables) {
    localStorage.setItem('vegetables', JSON.stringify(vegetables));
}

// Get next ID for new vegetable
function getNextId() {
    const vegetables = getVegetables();
    if (vegetables.length === 0) return 1;
    return Math.max(...vegetables.map(v => v.id)) + 1;
}

// ============== VISITOR TRACKING ==============

// Generate a unique visitor ID
function getVisitorId() {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
}

// Get device info
function getDeviceInfo() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
}

// Record a visit
function recordVisit(page) {
    const visits = getVisits();
    const visit = {
        id: Date.now(),
        visitorId: getVisitorId(),
        page: page,
        timestamp: new Date().toISOString(),
        device: getDeviceInfo()
    };
    visits.push(visit);
    localStorage.setItem('visits', JSON.stringify(visits));
}

// Get all visits
function getVisits() {
    const stored = localStorage.getItem('visits');
    return stored ? JSON.parse(stored) : [];
}

// Get visit statistics
function getVisitStats() {
    const visits = getVisits();
    const today = new Date().toDateString();
    
    const todayVisits = visits.filter(v => new Date(v.timestamp).toDateString() === today);
    const uniqueVisitors = [...new Set(visits.map(v => v.visitorId))].length;
    
    return {
        total: visits.length,
        today: todayVisits.length,
        unique: uniqueVisitors
    };
}

// Clear all visits
function clearVisits() {
    localStorage.setItem('visits', JSON.stringify([]));
}

// ============== ADMIN AUTHENTICATION ==============

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

function isLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

function setLoggedIn(status) {
    sessionStorage.setItem('adminLoggedIn', status);
}
