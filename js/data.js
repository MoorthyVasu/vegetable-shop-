// ============== DATA MANAGEMENT ==============

// Google Sheets API URL
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyuCu5lLQC_6FqpPi0FSC7I-6NedZM2s2MLfq5n-Ji_8UySGgvRDtYDtxcxDujq2FI6/exec';

// Default vegetables data (fallback)
const defaultVegetables = [
    { id: 1, name: 'Tomato', tamilName: 'தக்காளி', price: 40, emoji: '🍅' },
    { id: 2, name: 'Potato', tamilName: 'உருளைக்கிழங்கு', price: 25, emoji: '🥔' },
    { id: 3, name: 'Onion', tamilName: 'வெங்காயம்', price: 35, emoji: '🧅' },
    { id: 4, name: 'Carrot', tamilName: 'கேரட்', price: 45, emoji: '🥕' },
    { id: 5, name: 'Cabbage', tamilName: 'முட்டைகோஸ்', price: 30, emoji: '🥬' },
    { id: 6, name: 'Brinjal', tamilName: 'கத்திரிக்காய்', price: 35, emoji: '🍆' },
    { id: 7, name: 'Capsicum', tamilName: 'குடைமிளகாய்', price: 60, emoji: '🫑' },
    { id: 8, name: 'Cucumber', tamilName: 'வெள்ளரிக்காய்', price: 25, emoji: '🥒' },
    { id: 9, name: 'Green Chilli', tamilName: 'பச்சை மிளகாய்', price: 80, emoji: '🌶️' },
    { id: 10, name: 'Beetroot', tamilName: 'பீட்ரூட்', price: 40, emoji: '🫒' },
    { id: 11, name: 'Spinach', tamilName: 'கீரை', price: 30, emoji: '🥗' },
    { id: 12, name: 'Pumpkin', tamilName: 'பரங்கிக்காய்', price: 25, emoji: '🎃' },
    { id: 13, name: 'Cauliflower', tamilName: 'காலிஃப்ளவர்', price: 40, emoji: '🥦' },
    { id: 14, name: 'Ladies Finger', tamilName: 'வெண்டைக்காய்', price: 45, emoji: '🥒' },
    { id: 15, name: 'Drumstick', tamilName: 'முருங்கைக்காய்', price: 50, emoji: '🥢' },
    { id: 16, name: 'Bitter Gourd', tamilName: 'பாகற்காய்', price: 55, emoji: '🥬' },
    { id: 17, name: 'Snake Gourd', tamilName: 'புடலங்காய்', price: 35, emoji: '🥒' },
    { id: 18, name: 'Ridge Gourd', tamilName: 'பீர்க்கங்காய்', price: 30, emoji: '🥬' },
    { id: 19, name: 'Bottle Gourd', tamilName: 'சுரைக்காய்', price: 25, emoji: '🍐' },
    { id: 20, name: 'Radish', tamilName: 'முள்ளங்கி', price: 30, emoji: '🥕' },
    { id: 21, name: 'Coriander', tamilName: 'கொத்தமல்லி', price: 20, emoji: '🌿' },
    { id: 22, name: 'Mint', tamilName: 'புதினா', price: 15, emoji: '🌿' },
    { id: 23, name: 'Curry Leaves', tamilName: 'கறிவேப்பிலை', price: 10, emoji: '🍃' },
    { id: 24, name: 'Ginger', tamilName: 'இஞ்சி', price: 120, emoji: '🫚' },
    { id: 25, name: 'Garlic', tamilName: 'பூண்டு', price: 150, emoji: '🧄' },
    { id: 26, name: 'Lemon', tamilName: 'எலுமிச்சை', price: 80, emoji: '🍋' },
    { id: 27, name: 'Raw Banana', tamilName: 'வாழைக்காய்', price: 40, emoji: '🍌' },
    { id: 28, name: 'Beans', tamilName: 'பீன்ஸ்', price: 50, emoji: '🫛' },
    { id: 29, name: 'Green Peas', tamilName: 'பட்டாணி', price: 60, emoji: '🫛' },
    { id: 30, name: 'Corn', tamilName: 'சோளம்', price: 35, emoji: '🌽' }
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

// Fetch vegetables from Google Sheets
async function fetchVegetablesFromSheet() {
    try {
        const response = await fetch(`${SHEET_API_URL}?action=get`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            // Cache in localStorage
            localStorage.setItem('vegetables', JSON.stringify(data));
            return data;
        }
        return defaultVegetables;
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        // Fallback to localStorage or defaults
        const stored = localStorage.getItem('vegetables');
        return stored ? JSON.parse(stored) : defaultVegetables;
    }
}

// Get vegetables from localStorage (sync - for backward compatibility)
function getVegetables() {
    const stored = localStorage.getItem('vegetables');
    return stored ? JSON.parse(stored) : defaultVegetables;
}

// Save vegetable to Google Sheets
async function saveVegetableToSheet(action, vegData) {
    try {
        const params = new URLSearchParams({ action, ...vegData });
        const response = await fetch(`${SHEET_API_URL}?${params.toString()}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

// Add vegetable to Google Sheets
async function addVegetableToSheet(name, tamilName, price, emoji) {
    return await saveVegetableToSheet('add', { name, tamilName, price, emoji });
}

// Update vegetable in Google Sheets
async function updateVegetableInSheet(id, name, tamilName, price, emoji) {
    return await saveVegetableToSheet('update', { id, name, tamilName, price, emoji });
}

// Delete vegetable from Google Sheets
async function deleteVegetableFromSheet(id) {
    return await saveVegetableToSheet('delete', { id });
}

// Save vegetables to localStorage (legacy)
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
