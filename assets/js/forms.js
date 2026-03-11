/**
 * ============================================================================
 * CAFE TEMPLATE - FORM VALIDATION & HANDLING
 * ============================================================================
 * Form validation, AJAX submission, and toast notifications
 * ThemeForest Standard: Premium Cafe & Restaurant Template
 * ============================================================================
 */

(function() {
    'use strict';

    // =============================================================================
    // DOM READY
    // =============================================================================
    document.addEventListener('DOMContentLoaded', function() {
        initFormValidation();
        initContactForm();
        initReservationForm();
    });

    // =============================================================================
    // FORM VALIDATION
    // =============================================================================
    function initFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                if (!validateForm(form)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                form.classList.add('was-validated');
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(function(input) {
                input.addEventListener('blur', function() {
                    validateField(input);
                });

                input.addEventListener('input', function() {
                    if (form.classList.contains('was-validated')) {
                        validateField(input);
                    }
                });
            });
        });
    }

    // =============================================================================
    // VALIDATE FORM
    // =============================================================================
    function validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, textarea, select');

        fields.forEach(function(field) {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // =============================================================================
    // VALIDATE SINGLE FIELD
    // =============================================================================
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation - must be Gmail
        if (isValid && field.type === 'email' && value) {
            if (!value.endsWith('@gmail.com')) {
                isValid = false;
                errorMessage = 'Please enter a valid Gmail address (must end with @gmail.com)';
            }
        }

        // Phone validation - must be exactly 10 digits
        if (isValid && field.type === 'tel' && value) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter exactly 10 digits';
            }
        }

        // Min length validation
        if (isValid && field.minLength && value.length < field.minLength) {
            isValid = false;
            errorMessage = 'Minimum ' + field.minLength + ' characters required';
        }

        // Pattern validation
        if (isValid && field.pattern && value) {
            const pattern = new RegExp(field.pattern);
            if (!pattern.test(value)) {
                isValid = false;
                errorMessage = field.dataset.errorMessage || 'Please match the requested format';
            }
        }

        // Update field UI
        updateFieldUI(field, isValid, errorMessage);

        return isValid;
    }

    // =============================================================================
    // UPDATE FIELD UI
    // =============================================================================
    function updateFieldUI(field, isValid, errorMessage) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove existing feedback
        const existingFeedback = formGroup.querySelector('.form-error');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Update field classes
        field.classList.remove('is-valid', 'is-invalid');
        field.classList.add(isValid ? 'is-valid' : 'is-invalid');

        // Add error message
        if (!isValid && errorMessage) {
            const error = document.createElement('div');
            error.className = 'form-error';
            error.textContent = errorMessage;
            formGroup.appendChild(error);
        }
    }

    // =============================================================================
    // CONTACT FORM
    // =============================================================================
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateForm(form)) {
                showToast('Please fix the errors in the form', 'error');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Sending...';

            // Simulate form submission (replace with actual AJAX call)
            setTimeout(function() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                showToast('Message sent successfully!', 'success');
                form.reset();
                form.classList.remove('was-validated');
                
                // Remove validation classes
                form.querySelectorAll('.is-valid, .is-invalid').forEach(function(field) {
                    field.classList.remove('is-valid', 'is-invalid');
                });
            }, 1500);

            /*
            // Actual AJAX submission example:
            const formData = new FormData(form);
            
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                if (data.success) {
                    showToast(data.message || 'Message sent successfully!', 'success');
                    form.reset();
                } else {
                    showToast(data.message || 'Something went wrong', 'error');
                }
            })
            .catch(error => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                showToast('Network error. Please try again.', 'error');
            });
            */
        });
    }

    // =============================================================================
    // RESERVATION FORM
    // =============================================================================
    function initReservationForm() {
        const form = document.getElementById('reservationForm');
        if (!form) return;

        // Initialize date picker if Flatpickr is available
        const dateInput = form.querySelector('input[name="date"]');
        if (dateInput && typeof flatpickr !== 'undefined') {
            flatpickr(dateInput, {
                minDate: 'today',
                maxDate: new Date().fp_incr(90),
                disable: [
                    function(date) {
                        // Disable Sundays
                        return date.getDay() === 0;
                    }
                ],
                dateFormat: 'Y-m-d'
            });
        }

        // Initialize time picker
        const timeInput = form.querySelector('input[name="time"]');
        if (timeInput && typeof flatpickr !== 'undefined') {
            flatpickr(timeInput, {
                enableTime: true,
                noCalendar: true,
                dateFormat: 'H:i',
                minTime: '09:00',
                maxTime: '22:00',
                minuteIncrement: 30
            });
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateForm(form)) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Processing...';

            // Simulate form submission
            setTimeout(function() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                showToast('Reservation request submitted! We will contact you shortly.', 'success');
                form.reset();
                form.classList.remove('was-validated');
                
                // Remove validation classes
                form.querySelectorAll('.is-valid, .is-invalid').forEach(function(field) {
                    field.classList.remove('is-valid', 'is-invalid');
                });
            }, 1500);
        });
    }

    // =============================================================================
    // SHOW TOAST NOTIFICATION
    // =============================================================================
    function showToast(message, type) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            // Fallback toast
            const toast = document.createElement('div');
            toast.className = 'toast-notification toast-' + type;
            toast.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            `;
            toast.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 9999;
                padding: 16px 24px;
                background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideInRight 0.3s ease;
            `;

            document.body.appendChild(toast);

            setTimeout(function() {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(function() {
                    toast.remove();
                }, 300);
            }, 3000);
        }
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================
    window.Forms = {
        validate: validateForm,
        validateField: validateField,
        showToast: showToast
    };

})();
