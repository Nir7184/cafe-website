/**
 * ============================================================================
 * CAFE TEMPLATE - AUTHENTICATION SYSTEM
 * ============================================================================
 * Login/Register functionality and protected route handling
 * ============================================================================
 */

(function() {
    'use strict';

    const AUTH_KEY = 'cafe-user';
    const SESSION_KEY = 'cafe-user-session';

    // =============================================================================
    // CHECK AUTHENTICATION STATUS
    // =============================================================================
    function isLoggedIn() {
        const user = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(SESSION_KEY) || sessionStorage.getItem('cafe-user');
        return !!user;
    }

    // =============================================================================
    // GET CURRENT USER
    // =============================================================================
    function getCurrentUser() {
        const userData = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(SESSION_KEY) || sessionStorage.getItem('cafe-user');
        return userData ? JSON.parse(userData) : null;
    }

    // =============================================================================
    // REQUIRE LOGIN FOR PROTECTED PAGES
    // =============================================================================
    function requireLogin() {
        if (!isLoggedIn()) {
            // Store intended URL for redirect after login
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            
            // Show message and redirect
            alert('Please login or register to continue.');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // =============================================================================
    // CHECK LOGIN BEFORE ADDING TO CART
    // =============================================================================
    function checkLoginBeforeAddToCart(callback) {
        if (!isLoggedIn()) {
            if (confirm('You need to login to add items to cart. Would you like to login now?')) {
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'login.html';
            }
            return false;
        }
        
        if (callback && typeof callback === 'function') {
            callback();
        }
        return true;
    }

    // =============================================================================
    // LOGOUT FUNCTION
    // =============================================================================
    function logout() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem('cafe-user');
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem('cafe-user');
        sessionStorage.removeItem('redirectAfterLogin');
        
        // Clear any cart data if needed (optional - keep cart for convenience)
        // localStorage.removeItem('cafe-cart-v2');
        
        showToast('Logged out successfully');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
    
    // Show toast notification
    function showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: #28a745;
            color: white;
            border-radius: 10px;
            font-weight: 500;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // =============================================================================
    // UPDATE UI BASED ON AUTH STATUS
    // =============================================================================
    function updateAuthUI() {
        const user = getCurrentUser();
        const authLinks = document.querySelectorAll('.auth-link');
        const userNameElements = document.querySelectorAll('.user-name');
        
        if (user) {
            // User is logged in
            authLinks.forEach(link => {
                link.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                link.href = '#';
                link.onclick = function(e) {
                    e.preventDefault();
                    logout();
                };
            });
            
            userNameElements.forEach(el => {
                el.textContent = user.name || user.email;
            });
        } else {
            // User is not logged in
            authLinks.forEach(link => {
                link.innerHTML = '<i class="fas fa-user"></i> Login';
                link.href = 'login.html';
                link.onclick = null;
            });
            
            userNameElements.forEach(el => {
                el.textContent = '';
            });
        }
    }

    // =============================================================================
    // PROTECT CHECKOUT PAGES
    // =============================================================================
    function protectCheckoutPages() {
        const protectedPages = ['checkout.html', 'cart.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            // For cart.html, we'll check at checkout time, not on page load
            if (currentPage === 'checkout.html') {
                requireLogin();
            }
        }
    }

    // =============================================================================
    // INITIALIZE
    // =============================================================================
    document.addEventListener('DOMContentLoaded', function() {
        updateAuthUI();
        protectCheckoutPages();
    });

    // =============================================================================
    // EXPOSE FUNCTIONS GLOBALLY
    // =============================================================================
    window.Auth = {
        isLoggedIn,
        getCurrentUser,
        requireLogin,
        checkLoginBeforeAddToCart,
        logout,
        updateAuthUI
    };

})();
