// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    updateAuthUI();
    setupEventListeners();
    loadAllBooks(); // Load books on page load
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Search forms
    document.getElementById('isbn-search').addEventListener('submit', handleISBNSearch);