/**
 * ============================================================================
 * CAFE TEMPLATE - INTEGRATED MENU & CART SYSTEM
 * ============================================================================
 * Complete solution with category filtering and full cart functionality
 * ============================================================================
 */

(function() {
    'use strict';

    // =============================================================================
    // CONFIGURATION
    // =============================================================================
    const CONFIG = {
        cartKey: 'cafe-cart-v2',
        ordersKey: 'cafe-orders',
        currency: 'INR',
        taxRate: 0.05,
        deliveryFee: 40,
        freeDeliveryThreshold: 500
    };

    // Category display names
    const CATEGORIES = {
        beverages: { name: 'Beverages', icon: 'fa-mug-hot' },
        breakfast: { name: 'Breakfast', icon: 'fa-egg' },
        mains: { name: 'Main Course', icon: 'fa-utensils' },
        desserts: { name: 'Desserts', icon: 'fa-ice-cream' }
    };

    // =============================================================================
    // STATE
    // =============================================================================
    let cart = [];
    let orders = [];
    let currentFilter = 'all';
    let menuItemsCache = [];

    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    document.addEventListener('DOMContentLoaded', function() {
        initMenuFiltering();
        initCart();
        initEventListeners();
        
        // Ensure all menu items are visible initially
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(function(item) {
            item.style.display = 'block';
            item.style.visibility = 'visible';
            item.style.opacity = '1';
        });
    });

    // =============================================================================
    // MENU FILTERING
    // =============================================================================
    function initMenuFiltering() {
        // Cache menu items for filtering
        const items = document.querySelectorAll('.menu-item');
        menuItemsCache = Array.from(items).map(item => ({
            element: item,
            category: item.dataset.category || 'all',
            name: (item.dataset.name || '').toLowerCase()
        }));

        // Initialize filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Apply filter
                currentFilter = this.dataset.filter;
                applyMenuFilter();
            });
        });

        // Apply initial filter
        applyMenuFilter();
    }

    function applyMenuFilter() {
        menuItemsCache.forEach(item => {
            if (currentFilter === 'all' || item.category === currentFilter) {
                item.element.style.display = 'block';
                item.element.style.visibility = 'visible';
                item.element.style.opacity = '1';
                item.element.classList.add('fade-in');
                setTimeout(() => item.element.classList.remove('fade-in'), 300);
            } else {
                item.element.style.display = 'none';
                item.element.style.visibility = 'hidden';
                item.element.style.opacity = '0';
            }
        });

        // Update count
        const visibleCount = menuItemsCache.filter(i => 
            currentFilter === 'all' || i.category === currentFilter
        ).length;

        const countEl = document.querySelector('.results-count');
        if (countEl) {
            countEl.textContent = `${visibleCount} item${visibleCount !== 1 ? 's' : ''}`;
        }
    }

    // =============================================================================
    // CART INITIALIZATION
    // =============================================================================
    function initCart() {
        loadCart();
        loadOrders();
        updateCartUI();
        initCartDropdown();
    }

    function loadCart() {
        try {
            const stored = localStorage.getItem(CONFIG.cartKey);
            cart = stored ? JSON.parse(stored) : [];
        } catch (e) {
            cart = [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(CONFIG.cartKey, JSON.stringify(cart));
        } catch (e) {
            console.warn('Unable to save cart:', e);
        }
    }

    function loadOrders() {
        try {
            const stored = localStorage.getItem(CONFIG.ordersKey);
            orders = stored ? JSON.parse(stored) : [];
        } catch (e) {
            orders = [];
        }
    }

    function saveOrders() {
        try {
            localStorage.setItem(CONFIG.ordersKey, JSON.stringify(orders));
        } catch (e) {
            console.warn('Unable to save orders:', e);
        }
    }

    // =============================================================================
    // EVENT LISTENERS
    // =============================================================================
    function initEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.add-to-cart');
            if (btn) {
                e.preventDefault();
                
                // Check if user is logged in
                if (typeof Auth !== 'undefined' && !Auth.isLoggedIn()) {
                    if (confirm('You need to login to add items to cart. Would you like to login now?')) {
                        sessionStorage.setItem('redirectAfterLogin', window.location.href);
                        window.location.href = 'login.html';
                    }
                    return;
                }
                
                // Get quantity from nearby input if exists
                const qtyInput = btn.closest('.menu-item')?.querySelector('.qty-input');
                const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

                const item = {
                    id: btn.dataset.id,
                    name: btn.dataset.name,
                    price: parseFloat(btn.dataset.price),
                    image: btn.dataset.image,
                    category: btn.dataset.category || 'uncategorized',
                    quantity: quantity
                };

                addToCart(item);
            }
        });

        // Quantity controls in menu items
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.qty-btn');
            if (!btn) return;

            const input = btn.parentElement.querySelector('.qty-input');
            if (!input) return;

            let val = parseInt(input.value) || 1;
            
            if (btn.dataset.action === 'plus' || btn.textContent === '+') {
                val = Math.min(99, val + 1);
            } else if (btn.dataset.action === 'minus' || btn.textContent === '-') {
                val = Math.max(1, val - 1);
            }
            
            input.value = val;
        });

        // Quantity controls in cart
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.cart-qty-btn');
            if (!btn) return;

            const id = btn.dataset.id;
            const action = btn.dataset.action;
            const item = cart.find(i => i.id === id);
            
            if (!item) return;

            if (action === 'plus') {
                item.quantity = Math.min(99, item.quantity + 1);
            } else if (action === 'minus') {
                if (item.quantity <= 1) {
                    removeFromCart(id);
                    return;
                }
                item.quantity--;
            }

            saveCart();
            updateCartUI();
        });

        // Remove from cart
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.cart-remove');
            if (btn) {
                removeFromCart(btn.dataset.id);
            }
        });

        // Cart quantity input changes
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('cart-qty-input')) {
                const id = e.target.dataset.id;
                let qty = parseInt(e.target.value) || 1;
                qty = Math.max(1, Math.min(99, qty));
                
                const item = cart.find(i => i.id === id);
                if (item) {
                    item.quantity = qty;
                    saveCart();
                    updateCartUI();
                }
            }
        });
    }

    // =============================================================================
    // CART OPERATIONS
    // =============================================================================
    function addToCart(item) {
        const existing = cart.find(i => i.id === item.id);

        if (existing) {
            existing.quantity += item.quantity;
            showToast(`${item.name} quantity updated! (${existing.quantity})`, 'success');
        } else {
            cart.push(item);
            showToast(`${item.name} added to cart!`, 'success');
        }

        saveCart();
        updateCartUI();
        animateCartBadge();
    }

    function removeFromCart(id) {
        const item = cart.find(i => i.id === id);
        cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCartUI();
        if (item) showToast(`${item.name} removed from cart`, 'info');
    }

    function clearCart() {
        cart = [];
        saveCart();
        updateCartUI();
        showToast('Cart cleared', 'info');
    }

    // =============================================================================
    // CALCULATIONS
    // =============================================================================
    function getTotals() {
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * CONFIG.taxRate;
        const delivery = subtotal >= CONFIG.freeDeliveryThreshold ? 0 : CONFIG.deliveryFee;
        const total = subtotal + tax + delivery;

        return { itemCount, subtotal, tax, delivery, total };
    }

    function getCartByCategory() {
        const grouped = {};
        
        Object.keys(CATEGORIES).forEach(cat => {
            grouped[cat] = [];
        });
        grouped['uncategorized'] = [];

        cart.forEach(item => {
            const cat = item.category || 'uncategorized';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });

        return grouped;
    }

    // =============================================================================
    // UI UPDATES
    // =============================================================================
    function updateCartUI() {
        const totals = getTotals();

        // Update navbar badge
        const badge = document.querySelector('.cart-count');
        if (badge) {
            badge.textContent = totals.itemCount;
            badge.style.display = totals.itemCount > 0 ? 'flex' : 'none';
        }

        // Update cart count text
        const countText = document.querySelector('.cart-item-count');
        if (countText) {
            countText.textContent = `${totals.itemCount} item${totals.itemCount !== 1 ? 's' : ''}`;
        }

        // Update cart dropdown
        updateCartDropdown();

        // Update cart page if present
        updateCartPage();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { cart, totals } 
        }));
    }

    function updateCartDropdown() {
        const container = document.querySelector('.cart-items');
        const footer = document.querySelector('.cart-dropdown-footer');
        if (!container) return;

        const totals = getTotals();
        const grouped = getCartByCategory();

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="cart-dropdown-empty">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your cart is empty</p>
                    <a href="menu.html" class="btn btn-outline-primary btn-sm">Start Ordering</a>
                </div>
            `;
            if (footer) {
                footer.innerHTML = `
                    <div class="cart-subtotal">
                        <span>Subtotal:</span>
                        <strong>${formatPrice(0)}</strong>
                    </div>
                    <a href="menu.html" class="btn btn-primary">Browse Menu</a>
                `;
            }
            return;
        }

        // Build HTML with category grouping
        let html = '';
        Object.keys(grouped).forEach(category => {
            const items = grouped[category];
            if (items.length === 0) return;

            const catInfo = CATEGORIES[category] || { name: 'Other', icon: 'fa-utensils' };

            html += `
                <div class="cart-category">
                    <div class="cart-category-header">
                        <i class="fas ${catInfo.icon}"></i>
                        <span>${catInfo.name}</span>
                        <span class="cart-category-count">${items.length}</span>
                    </div>
                    <div class="cart-category-items">
            `;

            items.forEach(item => {
                html += `
                    <div class="cart-dropdown-item" data-id="${item.id}">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60'">
                        </div>
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">${formatPrice(item.price)}</div>
                        </div>
                        <div class="item-quantity">
                            <button class="cart-qty-btn" data-id="${item.id}" data-action="minus" aria-label="Decrease">-</button>
                            <input type="number" class="cart-qty-input" data-id="${item.id}" value="${item.quantity}" min="1" max="99" aria-label="Quantity">
                            <button class="cart-qty-btn" data-id="${item.id}" data-action="plus" aria-label="Increase">+</button>
                        </div>
                        <div class="item-total">${formatPrice(item.price * item.quantity)}</div>
                        <button class="cart-remove" data-id="${item.id}" aria-label="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        container.innerHTML = html;

        // Update footer
        if (footer) {
            footer.innerHTML = `
                <div class="cart-summary-mini">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>${formatPrice(totals.subtotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (5%):</span>
                        <span>${formatPrice(totals.tax)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Delivery:</span>
                        <span>${totals.delivery === 0 ? 'FREE' : formatPrice(totals.delivery)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>${formatPrice(totals.total)}</span>
                    </div>
                </div>
                <div class="cart-actions">
                    <a href="cart.html" class="btn btn-outline-primary">View Cart</a>
                    <a href="checkout.html" class="btn btn-primary">Checkout</a>
                </div>
            `;
        }
    }

    function updateCartPage() {
        const container = document.querySelector('.cart-page-container');
        if (!container) return;

        const totals = getTotals();
        const grouped = getCartByCategory();

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty-state">
                    <div class="cart-empty-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <a href="menu.html" class="btn btn-primary btn-lg">
                        <i class="fas fa-utensils"></i> Browse Menu
                    </a>
                </div>
            `;
            return;
        }

        let itemsHtml = '';
        Object.keys(grouped).forEach(category => {
            const items = grouped[category];
            if (items.length === 0) return;

            const catInfo = CATEGORIES[category] || { name: 'Other', icon: 'fa-utensils' };

            itemsHtml += `
                <div class="cart-category-section">
                    <div class="cart-category-title">
                        <i class="fas ${catInfo.icon}"></i>
                        <span>${catInfo.name}</span>
                    </div>
                    <div class="cart-items-list">
            `;

            items.forEach(item => {
                itemsHtml += `
                    <div class="cart-item-row" data-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100'">
                        </div>
                        <div class="cart-item-info">
                            <h4 class="cart-item-name">${item.name}</h4>
                            <span class="cart-item-category">${catInfo.name}</span>
                            <span class="cart-item-unit-price">${formatPrice(item.price)} each</span>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="cart-qty-btn" data-id="${item.id}" data-action="minus">-</button>
                            <input type="number" class="cart-qty-input" data-id="${item.id}" value="${item.quantity}" min="1" max="99">
                            <button class="cart-qty-btn" data-id="${item.id}" data-action="plus">+</button>
                        </div>
                        <div class="cart-item-total">
                            <span class="total-label">Total:</span>
                            <span class="total-value">${formatPrice(item.price * item.quantity)}</span>
                        </div>
                        <button class="cart-item-remove cart-remove" data-id="${item.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            });

            itemsHtml += `</div></div>`;
        });

        container.innerHTML = `
            <div class="cart-layout">
                <div class="cart-items-section">
                    <div class="cart-header">
                        <h2><i class="fas fa-shopping-cart"></i> Your Cart (${totals.itemCount} items)</h2>
                        <button class="btn btn-text" onclick="window.CafeCart.clear()">
                            <i class="fas fa-trash"></i> Clear Cart
                        </button>
                    </div>
                    ${itemsHtml}
                </div>
                <div class="cart-summary-section">
                    <div class="cart-summary-card">
                        <h3>Order Summary</h3>
                        <div class="summary-rows">
                            <div class="summary-row">
                                <span>Subtotal (${totals.itemCount} items)</span>
                                <span>${formatPrice(totals.subtotal)}</span>
                            </div>
                            <div class="summary-row">
                                <span>Tax (5%)</span>
                                <span>${formatPrice(totals.tax)}</span>
                            </div>
                            <div class="summary-row">
                                <span>Delivery Fee</span>
                                <span class="${totals.delivery === 0 ? 'free-delivery' : ''}">
                                    ${totals.delivery === 0 ? 'FREE' : formatPrice(totals.delivery)}
                                </span>
                            </div>
                            ${totals.delivery === 0 ? '<div class="free-delivery-msg"><i class="fas fa-check-circle"></i> You got free delivery!</div>' : ''}
                        </div>
                        <div class="summary-total">
                            <span>Total Amount</span>
                            <span>${formatPrice(totals.total)}</span>
                        </div>
                        <a href="checkout.html" class="btn btn-primary btn-lg btn-block">
                            <i class="fas fa-credit-card"></i> Proceed to Checkout
                        </a>
                        <a href="menu.html" class="btn btn-outline-primary btn-block">
                            <i class="fas fa-plus"></i> Add More Items
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // =============================================================================
    // CART DROPDOWN
    // =============================================================================
    function initCartDropdown() {
        const toggle = document.querySelector('.cart-btn');
        const dropdown = document.querySelector('.cart-dropdown');

        if (!toggle || !dropdown) return;

        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // =============================================================================
    // CHECKOUT & ORDERS
    // =============================================================================
    function checkout() {
        if (cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }

        const totals = getTotals();
        const orderId = 'ORD-' + Date.now().toString().slice(-8);

        const order = {
            id: orderId,
            items: [...cart],
            totals: totals,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString()
        };

        orders.unshift(order);
        saveOrders();
        clearCart();

        showOrderConfirmation(order);
    }

    function showOrderConfirmation(order) {
        const modal = document.createElement('div');
        modal.className = 'order-confirmation-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Order Confirmed!</h2>
                <p class="order-id">Order ID: <strong>${order.id}</strong></p>
                <p class="order-message">Thank you for your order. Your delicious food will be ready soon.</p>
                <div class="order-summary-mini">
                    <div class="summary-row">
                        <span>Total Amount:</span>
                        <span>${formatPrice(order.totals.total)}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <a href="order-history.html" class="btn btn-primary">View Order History</a>
                    <button class="btn btn-outline-primary" onclick="this.closest('.order-confirmation-modal').remove()">Continue Shopping</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    function formatPrice(price) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: CONFIG.currency,
            minimumFractionDigits: 0
        }).format(price);
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        Object.assign(toast.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            zIndex: '9999',
            padding: '16px 24px',
            background: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideInRight 0.3s ease'
        });

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function animateCartBadge() {
        const badge = document.querySelector('.cart-count');
        if (badge) {
            badge.classList.add('pulse');
            setTimeout(() => badge.classList.remove('pulse'), 500);
        }
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================
    window.CafeCart = {
        add: addToCart,
        remove: removeFromCart,
        clear: clearCart,
        checkout: checkout,
        getItems: () => cart,
        getTotals: getTotals,
        getOrders: () => orders,
        formatPrice: formatPrice
    };

})();
