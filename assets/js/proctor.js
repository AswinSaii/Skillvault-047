/**
 * SkillVault - Anti-Cheating & Proctoring Module
 */

class Proctor {
    constructor(options = {}) {
        this.options = {
            fullscreenRequired: true,
            disableRightClick: true,
            disableCopyPaste: true,
            disableTextSelection: true,
            tabSwitchLimit: 3,
            autoSubmitOnViolation: true,
            onViolation: null,
            onTabSwitch: null,
            onFullscreenExit: null,
            ...options
        };
        
        this.violations = [];
        this.tabSwitches = 0;
        this.isActive = false;
        this.fullscreenElement = null;
    }
    
    /**
     * Start proctoring
     */
    start(element = document.documentElement) {
        this.fullscreenElement = element;
        this.isActive = true;
        
        // Request fullscreen
        if (this.options.fullscreenRequired) {
            this.enterFullscreen();
        }
        
        // Disable right-click
        if (this.options.disableRightClick) {
            document.addEventListener('contextmenu', this.handleContextMenu);
        }
        
        // Disable copy/paste/cut
        if (this.options.disableCopyPaste) {
            document.addEventListener('copy', this.handleCopyPaste);
            document.addEventListener('paste', this.handleCopyPaste);
            document.addEventListener('cut', this.handleCopyPaste);
        }
        
        // Disable text selection
        if (this.options.disableTextSelection) {
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
        }
        
        // Disable keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown);
        
        // Monitor visibility/tab changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('blur', this.handleBlur);
        
        // Monitor fullscreen changes
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
        
        // Warn before leaving
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        
        console.log('Proctoring started');
    }
    
    /**
     * Stop proctoring
     */
    stop() {
        this.isActive = false;
        
        document.removeEventListener('contextmenu', this.handleContextMenu);
        document.removeEventListener('copy', this.handleCopyPaste);
        document.removeEventListener('paste', this.handleCopyPaste);
        document.removeEventListener('cut', this.handleCopyPaste);
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
        window.removeEventListener('blur', this.handleBlur);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        
        this.exitFullscreen();
        
        console.log('Proctoring stopped');
    }
    
    /**
     * Enter fullscreen mode
     */
    enterFullscreen() {
        const element = this.fullscreenElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    
    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
    
    /**
     * Check if fullscreen
     */
    isFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }
    
    /**
     * Record violation
     */
    recordViolation(type, details = '') {
        const violation = {
            type,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.violations.push(violation);
        
        if (this.options.onViolation) {
            this.options.onViolation(violation);
        }
        
        console.warn('Proctoring violation:', violation);
    }
    
    /**
     * Event Handlers
     */
    handleContextMenu = (e) => {
        if (!this.isActive) return;
        e.preventDefault();
        this.recordViolation('right_click', 'Right-click attempted');
        this.showWarning('Right-click is disabled during the assessment.');
    }
    
    handleCopyPaste = (e) => {
        if (!this.isActive) return;
        e.preventDefault();
        this.recordViolation('copy_paste', `${e.type} attempted`);
        this.showWarning('Copy/Paste is disabled during the assessment.');
    }
    
    handleKeydown = (e) => {
        if (!this.isActive) return;
        
        // Disable common shortcuts
        const blockedKeys = [
            { ctrl: true, key: 'c' },  // Copy
            { ctrl: true, key: 'v' },  // Paste
            { ctrl: true, key: 'x' },  // Cut
            { ctrl: true, key: 'a' },  // Select all
            { ctrl: true, key: 'u' },  // View source
            { ctrl: true, key: 's' },  // Save
            { ctrl: true, key: 'p' },  // Print
            { ctrl: true, shift: true, key: 'i' },  // DevTools
            { ctrl: true, shift: true, key: 'j' },  // DevTools Console
            { ctrl: true, shift: true, key: 'c' },  // DevTools Elements
            { key: 'F12' },  // DevTools
            { key: 'F5' },   // Refresh
            { ctrl: true, key: 'r' },  // Refresh
            { key: 'Escape' }  // Exit fullscreen
        ];
        
        for (const combo of blockedKeys) {
            const match = (
                (!combo.ctrl || e.ctrlKey || e.metaKey) &&
                (!combo.shift || e.shiftKey) &&
                (!combo.alt || e.altKey) &&
                (e.key.toLowerCase() === combo.key?.toLowerCase() || e.key === combo.key)
            );
            
            if (match && (combo.ctrl === e.ctrlKey || combo.ctrl === e.metaKey) && 
                combo.shift === (e.shiftKey || false)) {
                e.preventDefault();
                this.recordViolation('keyboard_shortcut', `Blocked: ${e.key}`);
                this.showWarning('This keyboard shortcut is disabled.');
                return;
            }
        }
    }
    
    handleVisibilityChange = () => {
        if (!this.isActive) return;
        
        if (document.hidden) {
            this.tabSwitches++;
            this.recordViolation('tab_switch', `Tab switch #${this.tabSwitches}`);
            
            if (this.options.onTabSwitch) {
                this.options.onTabSwitch(this.tabSwitches);
            }
            
            if (this.tabSwitches >= this.options.tabSwitchLimit && this.options.autoSubmitOnViolation) {
                this.showWarning('Too many tab switches. Your assessment will be auto-submitted.', true);
                // Trigger auto-submit after delay
                setTimeout(() => {
                    if (typeof window.autoSubmitAssessment === 'function') {
                        window.autoSubmitAssessment();
                    }
                }, 2000);
            } else {
                const remaining = this.options.tabSwitchLimit - this.tabSwitches;
                this.showWarning(`Warning: Tab switch detected! ${remaining} more will auto-submit your test.`);
            }
        }
    }
    
    handleBlur = () => {
        if (!this.isActive) return;
        // Additional check for window blur
        console.log('Window lost focus');
    }
    
    handleFullscreenChange = () => {
        if (!this.isActive) return;
        
        if (!this.isFullscreen() && this.options.fullscreenRequired) {
            this.recordViolation('fullscreen_exit', 'Exited fullscreen mode');
            
            if (this.options.onFullscreenExit) {
                this.options.onFullscreenExit();
            }
            
            this.showWarning('Please stay in fullscreen mode during the assessment.');
            
            // Re-request fullscreen after a brief delay
            setTimeout(() => {
                if (this.isActive && !this.isFullscreen()) {
                    this.enterFullscreen();
                }
            }, 1000);
        }
    }
    
    handleBeforeUnload = (e) => {
        if (!this.isActive) return;
        
        e.preventDefault();
        e.returnValue = 'Your assessment is in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
    
    /**
     * Show warning message
     */
    showWarning(message, isError = false) {
        // Create warning overlay
        const existing = document.getElementById('proctor-warning');
        if (existing) existing.remove();
        
        const warning = document.createElement('div');
        warning.id = 'proctor-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isError ? '#ef4444' : '#f59e0b'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideDown 0.3s ease;
        `;
        warning.textContent = message;
        
        document.body.appendChild(warning);
        
        // Auto-remove after delay
        setTimeout(() => {
            if (warning.parentNode) {
                warning.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => warning.remove(), 300);
            }
        }, isError ? 5000 : 3000);
    }
    
    /**
     * Get violation summary
     */
    getViolationSummary() {
        return {
            total: this.violations.length,
            tabSwitches: this.tabSwitches,
            violations: this.violations
        };
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);

// Export for use
window.Proctor = Proctor;
