/**
 * ============================================================================
 * CAFE TEMPLATE - GALLERY
 * ============================================================================
 * Gallery filtering and lightbox functionality
 * ThemeForest Standard: Premium Cafe & Restaurant Template
 * ============================================================================
 */

(function() {
    'use strict';

    // =============================================================================
    // DOM READY
    // =============================================================================
    document.addEventListener('DOMContentLoaded', function() {
        initGalleryFilter();
        initLightbox();
        
        // Ensure all gallery items are visible initially
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(function(item) {
            item.style.display = 'block';
            item.style.visibility = 'visible';
            item.style.opacity = '1';
        });
    });

    // =============================================================================
    // GALLERY FILTER
    // =============================================================================
    function initGalleryFilter() {
        const filterContainer = document.querySelector('.gallery-filters');
        const galleryContainer = document.querySelector('.gallery-grid');
        
        if (!filterContainer || !galleryContainer) return;

        const filters = filterContainer.querySelectorAll('.gallery-filter');
        const items = galleryContainer.querySelectorAll('.gallery-item');

        filters.forEach(function(filter) {
            filter.addEventListener('click', function() {
                const category = this.dataset.filter;

                // Update active filter
                filters.forEach(function(f) {
                    f.classList.remove('active');
                });
                this.classList.add('active');

                // Filter items
                items.forEach(function(item) {
                    const itemCategory = item.dataset.category;
                    
                    if (category === 'all' || itemCategory === category) {
                        item.style.display = 'block';
                        item.style.visibility = 'visible';
                        item.style.opacity = '1';
                        item.style.animation = 'fadeIn 0.4s ease';
                    } else {
                        item.style.display = 'none';
                        item.style.visibility = 'hidden';
                        item.style.opacity = '0';
                    }
                });
            });
        });
    }

    // =============================================================================
    // LIGHTBOX
    // =============================================================================
    function initLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (galleryItems.length === 0) return;

        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
                <button class="lightbox-prev" aria-label="Previous">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="lightbox-next" aria-label="Next">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="lightbox-image-container">
                    <img src="" alt="" class="lightbox-image">
                    <div class="lightbox-caption"></div>
                </div>
            </div>
        `;

        // Add lightbox styles
        const style = document.createElement('style');
        style.textContent = `
            .lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .lightbox.active {
                display: flex;
                opacity: 1;
            }
            .lightbox-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
            }
            .lightbox-content {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .lightbox-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 20px;
                cursor: pointer;
                z-index: 10;
                transition: all 0.3s ease;
            }
            .lightbox-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }
            .lightbox-prev,
            .lightbox-next {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                z-index: 10;
                transition: all 0.3s ease;
            }
            .lightbox-prev:hover,
            .lightbox-next:hover {
                background: var(--primary);
            }
            .lightbox-prev { left: 20px; }
            .lightbox-next { right: 20px; }
            .lightbox-image-container {
                max-width: 90%;
                max-height: 85vh;
                position: relative;
            }
            .lightbox-image {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
                border-radius: 8px;
            }
            .lightbox-caption {
                position: absolute;
                bottom: -50px;
                left: 0;
                right: 0;
                text-align: center;
                color: white;
                font-size: 18px;
                padding: 10px;
            }
            @media (max-width: 768px) {
                .lightbox-prev,
                .lightbox-next {
                    width: 45px;
                    height: 45px;
                    font-size: 18px;
                }
                .lightbox-prev { left: 10px; }
                .lightbox-next { right: 10px; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(lightbox);

        // Lightbox state
        let currentIndex = 0;
        let visibleItems = [];

        // Update visible items
        function updateVisibleItems() {
            visibleItems = Array.from(document.querySelectorAll('.gallery-item')).filter(function(item) {
                return item.style.display !== 'none';
            });
        }

        // Open lightbox
        function openLightbox(index) {
            updateVisibleItems();
            currentIndex = index;
            updateLightboxImage();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Close lightbox
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Update lightbox image
        function updateLightboxImage() {
            const item = visibleItems[currentIndex];
            if (!item) return;

            const img = item.querySelector('img');
            const title = item.querySelector('.gallery-title')?.textContent || '';
            const category = item.querySelector('.gallery-category')?.textContent || '';

            const lightboxImg = lightbox.querySelector('.lightbox-image');
            const lightboxCaption = lightbox.querySelector('.lightbox-caption');

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = title + (category ? ' - ' + category : '');
        }

        // Navigate to previous image
        function prevImage() {
            currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
            updateLightboxImage();
        }

        // Navigate to next image
        function nextImage() {
            currentIndex = (currentIndex + 1) % visibleItems.length;
            updateLightboxImage();
        }

        // Event listeners
        galleryItems.forEach(function(item, index) {
            item.addEventListener('click', function() {
                updateVisibleItems();
                const visibleIndex = visibleItems.indexOf(item);
                openLightbox(visibleIndex);
            });
        });

        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightbox.querySelector('.lightbox-prev').addEventListener('click', prevImage);
        lightbox.querySelector('.lightbox-next').addEventListener('click', nextImage);
        lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;

            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextImage();
                } else {
                    prevImage();
                }
            }
        }
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================
    window.Gallery = {
        filter: function(category) {
            const filterBtn = document.querySelector('.gallery-filter[data-filter="' + category + '"]');
            if (filterBtn) {
                filterBtn.click();
            }
        }
    };

})();
