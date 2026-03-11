/**
 * ============================================================================
 * CAFE TEMPLATE - MAIN JAVASCRIPT
 * ============================================================================
 * Core functionality: Bootstrap init, AOS, smooth scroll, header effects
 * ThemeForest Standard: Premium Cafe & Restaurant Template
 * ============================================================================
 */

(function() {
    'use strict';

    // =============================================================================
    // DOM READY
    // =============================================================================
    document.addEventListener('DOMContentLoaded', function() {
        initHeader();
        initMobileMenu();
        initSmoothScroll();
        initBackToTop();
        initAOS();
        initTestimonialSlider();
    });

    // =============================================================================
    // HEADER SCROLL EFFECT
    // =============================================================================
    function initHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        const scrollThreshold = 100;
        let lastScroll = 0;

        function updateHeader() {
            const currentScroll = window.pageYOffset;
            
            // Add/remove scrolled class
            if (currentScroll > scrollThreshold) {
                header.classList.add('header-scrolled');
                header.classList.remove('header-transparent');
            } else {
                header.classList.remove('header-scrolled');
                // Only add transparent if on hero section
                if (document.querySelector('.hero')) {
                    header.classList.add('header-transparent');
                }
            }

            lastScroll = currentScroll;
        }

        // Initial check
        updateHeader();

        // Throttled scroll listener
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateHeader();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // =============================================================================
    // MOBILE MENU
    // =============================================================================
    function initMobileMenu() {
        const toggle = document.querySelector('.header-toggle');
        const nav = document.querySelector('.header-nav');
        
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function() {
            toggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking on a link
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                toggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target) && !nav.contains(e.target)) {
                toggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // =============================================================================
    // SMOOTH SCROLL
    // =============================================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;

                e.preventDefault();

                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    // =============================================================================
    // BACK TO TOP
    // =============================================================================
    function initBackToTop() {
        const backToTop = document.querySelector('.back-to-top');
        if (!backToTop) return;

        const scrollThreshold = 500;

        function toggleVisibility() {
            if (window.pageYOffset > scrollThreshold) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();

        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =============================================================================
    // AOS (Animate On Scroll) INITIALIZATION
    // =============================================================================
    function initAOS() {
        // Check if AOS library is loaded
        if (typeof AOS === 'undefined') {
            // Fallback: Add simple fade-in animation on scroll
            initFallbackAnimations();
            return;
        }

        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            delay: 0,
            disable: function() {
                // Disable on mobile for better performance
                return window.innerWidth < 768;
            }
        });
    }

    // Fallback animations if AOS is not loaded
    function initFallbackAnimations() {
        const animatedElements = document.querySelectorAll('[data-aos]');
        
        if (animatedElements.length === 0) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const animation = el.getAttribute('data-aos') || 'fade-up';
                    el.classList.add('aos-animate', 'animate-' + animation.replace('-up', 'Up'));
                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(function(el) {
            el.classList.add('aos-init');
            observer.observe(el);
        });
    }

    // =============================================================================
    // TESTIMONIAL SLIDER
    // =============================================================================
    function initTestimonialSlider() {
        const slider = document.querySelector('.testimonial-slider');
        if (!slider) return;

        const items = slider.querySelectorAll('.testimonial-item');
        const dots = slider.querySelectorAll('.slider-dots .dot');
        const prevBtn = slider.querySelector('.slider-prev');
        const nextBtn = slider.querySelector('.slider-next');
        
        if (items.length === 0) return;

        let currentIndex = 0;
        let autoplayInterval;

        function showSlide(index) {
            // Hide all items
            items.forEach(function(item) {
                item.style.display = 'none';
                item.classList.remove('active');
            });

            // Remove active class from all dots
            dots.forEach(function(dot) {
                dot.classList.remove('active');
            });

            // Show current item
            items[index].style.display = 'block';
            items[index].classList.add('active');

            // Activate current dot
            if (dots[index]) {
                dots[index].classList.add('active');
            }

            currentIndex = index;
        }

        function nextSlide() {
            const nextIndex = (currentIndex + 1) % items.length;
            showSlide(nextIndex);
        }

        function prevSlide() {
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            showSlide(prevIndex);
        }

        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }

        // Event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                prevSlide();
                stopAutoplay();
                startAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                nextSlide();
                stopAutoplay();
                startAutoplay();
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
                stopAutoplay();
                startAutoplay();
            });
        });

        // Initialize
        showSlide(0);
        startAutoplay();

        // Pause on hover
        slider.addEventListener('mouseenter', stopAutoplay);
        slider.addEventListener('mouseleave', startAutoplay);
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    // Debounce function
    window.debounce = function(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Throttle function
    window.throttle = function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    };

    // Format currency
    window.formatCurrency = function(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Show toast notification
    window.showToast = function(message, type = 'info', duration = 3000) {
        // Remove existing toasts
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-notification toast-' + type;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            padding: 16px 24px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: ${type === 'warning' ? '#333' : '#fff'};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Remove after duration
        setTimeout(function() {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, duration);
    };

})();
