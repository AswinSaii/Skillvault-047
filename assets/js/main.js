/**
 * SkillVault - Main JavaScript
 */

// Document Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeSidebar();
    initializeDropdowns();
    initializeModals();
    initializeAlerts();
    initializeFormValidation();
});

/**
 * Mobile Menu Toggle
 */
function initializeMobileMenu() {
    const toggle = document.querySelector('.navbar-toggle');
    const nav = document.querySelector('.navbar-nav');
    
    if (toggle && nav) {
        toggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.setAttribute('aria-expanded', nav.classList.contains('active'));
        });
    }
}

/**
 * Sidebar Toggle for Mobile
 */
function initializeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const toggle = document.querySelector('.sidebar-toggle');
    
    if (toggle && sidebar) {
        toggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            this.classList.remove('active');
        });
    }
}

/**
 * Dropdown Menus
 */
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                
                dropdown.classList.toggle('active');
            });
        }
    });
    
    // Close on outside click
    document.addEventListener('click', function() {
        dropdowns.forEach(d => d.classList.remove('active'));
    });
}

/**
 * Modal Functions
 */
function initializeModals() {
    // Open modal triggers
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
    
    // Close modal triggers
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) closeModal(modal.id);
        });
    });
    
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) closeModal(activeModal.id);
        }
    });
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Auto-dismiss Alerts
 */
function initializeAlerts() {
    document.querySelectorAll('.alert[data-dismiss]').forEach(alert => {
        const delay = parseInt(alert.getAttribute('data-dismiss')) || 5000;
        
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            setTimeout(() => alert.remove(), 300);
        }, delay);
    });
    
    // Manual dismiss buttons
    document.querySelectorAll('.alert .alert-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const alert = this.closest('.alert');
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        });
    });
}

/**
 * Form Validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Clear previous errors
            form.querySelectorAll('.form-error').forEach(err => err.remove());
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            
            // Validate required fields
            form.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    showFieldError(field, 'This field is required');
                }
            });
            
            // Validate email fields
            form.querySelectorAll('[type="email"]').forEach(field => {
                if (field.value && !isValidEmail(field.value)) {
                    isValid = false;
                    showFieldError(field, 'Please enter a valid email address');
                }
            });
            
            // Validate password match
            const password = form.querySelector('[name="password"]');
            const confirm = form.querySelector('[name="confirm_password"]');
            if (password && confirm && password.value !== confirm.value) {
                isValid = false;
                showFieldError(confirm, 'Passwords do not match');
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = message;
    field.parentNode.appendChild(error);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Password Strength Checker
 */
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength === 3) return 'fair';
    if (strength === 4) return 'good';
    return 'strong';
}

/**
 * AJAX Helper
 */
async function fetchJSON(url, options = {}) {
    const defaults = {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    
    const config = { ...defaults, ...options };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

/**
 * Toast Notifications
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

/**
 * Confirm Dialog
 */
function confirmAction(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Action</h5>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                    <button class="btn btn-primary" data-action="confirm">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="confirm"]')) {
                resolve(true);
                overlay.remove();
            } else if (e.target.matches('[data-action="cancel"]') || e.target === overlay) {
                resolve(false);
                overlay.remove();
            }
        });
    });
}

/**
 * Format Date
 */
function formatDate(date, format = 'short') {
    const d = new Date(date);
    const options = format === 'long' 
        ? { year: 'numeric', month: 'long', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
}

/**
 * Debounce Function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Copy to Clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
    } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!', 'success');
    }
}
