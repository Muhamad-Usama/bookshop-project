// Authentication utilities
const auth = {
    getToken: () => localStorage.getItem('token'),
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    isLoggedIn: () => !!localStorage.getItem('token'),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    },
    
    // Add authorization header to requests
    getAuthHeaders: () => {
        const token = auth.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// Update UI based on authentication status
const updateAuthUI = () => {
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const welcomeUser = document.getElementById('welcome-user');
    const addReviewForm = document.getElementById('add-review-form');
    
    if (auth.isLoggedIn()) {
        const user = auth.getUser();
        authLinks.style.display = 'none';
        userInfo.style.display = 'block';
        welcomeUser.textContent = `Welcome, ${user.username}!`;
        
        if (addReviewForm) {
            addReviewForm.style.display = 'block';
        }
    } else {
        authLinks.style.display = 'block';
        userInfo.style.display = 'none';
        
        if (addReviewForm) {
            addReviewForm.style.display = 'none';
        }
    }
};

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', auth.logout);
    }
});