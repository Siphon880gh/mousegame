// Note - No simultaneous LMB and RMB detection because MacOS doesn't support it
/**
 * @typedef {Object} MouseGameAPIOptions
 * @property {boolean} [enabledLmbToLmbCombo=true] - Enable double left mouse button detection
 * @property {boolean} [enabledRmbToRmbCombo=true] - Enable double right mouse button detection
 * @property {number} [comboThreshold=350] - Time window for combo detection (ms)
 * @property {number} [holdThreshold=1000] - Time window for hold or hold-then-release detection (ms)
 * 
 * @property {() => boolean} [checkEnabled] - Optional function that runs before processing any mouse event. If false, no mouse events will be processed.
 * 
 * @property {() => void} [onLeftTap] - Handler for left mouse button tap
 * @property {() => void} [onRightTap] - Handler for right mouse button tap
 * @property {() => void} [onLeftHold] - Handler for left mouse button hold (1 second)
 * @property {() => void} [onRightHold] - Handler for right mouse button hold (1 second)
 * @property {() => void} [onLeftRelease] - Handler for left mouse button release after hold
 * @property {() => void} [onRightRelease] - Handler for right mouse button release after hold
 * @property {() => void} [onRmbToLmbCombo] - Handler for right-to-left mouse button combo
 * @property {() => void} [onLmbToRmbCombo] - Handler for left-to-right mouse button combo
 * @property {() => void} [onLmbToLmbCombo] - Handler for double left mouse button combo
 * @property {() => void} [onRmbToRmbCombo] - Handler for double right mouse button combo
 */

class MouseGameAPI {
    constructor(options = {}) {
        // Configuration options
        this.config = {
            enabledLmbToLmbCombo: options.enabledLmbToLmbCombo || true,
            enabledRmbToRmbCombo: options.enabledRmbToRmbCombo || true,
            checkEnabled: options.checkEnabled || (() => true)
        };

        // Default callbacks
        this.callbacks = {
            onLeftTap: options.onLeftTap || (() => console.log('LMB tapped')),
            onRightTap: options.onRightTap || (() => console.log('RMB tapped')),
            onLeftHold: options.onLeftHold || (() => console.log(`LMB held for ${(this.HOLD_WINDOW/1000).toFixed(2)} second`)),
            onRightHold: options.onRightHold || (() => console.log(`RMB held for ${(this.HOLD_WINDOW/1000).toFixed(2)} second`)),
            onLeftRelease: options.onLeftRelease || (() => console.log(`LMB released after ${(this.HOLD_WINDOW/1000).toFixed(2)} second`)),
            onRightRelease: options.onRightRelease || (() => console.log(`RMB released after ${(this.HOLD_WINDOW/1000).toFixed(2)} second`)),
            onRmbToLmbCombo: options.onRmbToLmbCombo || ((time) => console.log(`%cRMB then LMB combo detected (${time}ms)`, 'color: #FF0000; font-weight:bold;')),
            onLmbToRmbCombo: options.onLmbToRmbCombo || ((time) => console.log(`%cLMB then RMB combo detected (${time}ms)`, 'color: #0000FF; font-weight:bold;')),
            onLmbToLmbCombo: options.onLmbToLmbCombo || ((time) => console.log(`%cLMB then LMB combo detected (${time}ms)`, 'color: #000000; background-color: #FFFFFF; font-weight:bold;')),
            onRmbToRmbCombo: options.onRmbToRmbCombo || ((time) => console.log(`%cRMB then RMB combo detected (${time}ms)`, 'color: #FFFFFF; background-color: #000000; font-weight:bold;'))
        };

        // State tracking
        this.isLeftMouseDown = false;
        this.isRightMouseDown = false;
        this.leftMouseDownTime = 0;
        this.rightMouseDownTime = 0;
        this.bothMouseDownTime = 0;
        this.hasLoggedLeftHold = false;
        this.hasLoggedRightHold = false;
        this.hasLoggedBothHold = false;
        this.lastButtonPressed = null;
        this.lastButtonPressTime = 0;
        this.COMBO_WINDOW = options.comboThreshold || 350;
        this.HOLD_WINDOW = options.holdThreshold || 1000;

        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.checkHolds = this.checkHolds.bind(this);
        this.holdInterval = null;
    }

    init() {
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        this.holdInterval = setInterval(this.checkHolds, 100);
        return true;
    }

    destroy() {
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        if (this.holdInterval) {
            clearInterval(this.holdInterval);
        }
        return true;
    }

    handleMouseDown(event) {
        // Run checkEnabled before processing any mouse events
        if (!this.config.checkEnabled()) {
            return;
        }

        const currentTime = Date.now();
        
        if (event.button === 0) { // Left mouse button
            this.isLeftMouseDown = true;
            this.leftMouseDownTime = currentTime;
            this.hasLoggedLeftHold = false;

            // Check for RMB -> LMB combo
            if (this.lastButtonPressed === 'right' && 
                currentTime - this.lastButtonPressTime < this.COMBO_WINDOW) {
                this.callbacks.onRmbToLmbCombo(currentTime - this.lastButtonPressTime);
                this.bothMouseDownTime = currentTime;
            }
            // Check for LMB -> LMB combo
            else if (this.config.enabledLmbToLmbCombo && 
                    this.lastButtonPressed === 'left' && 
                    currentTime - this.lastButtonPressTime < this.COMBO_WINDOW) {
                this.callbacks.onLmbToLmbCombo(currentTime - this.lastButtonPressTime);
            }
            this.lastButtonPressed = 'left';
            this.lastButtonPressTime = currentTime;
        } else if (event.button === 2) { // Right mouse button
            this.isRightMouseDown = true;
            this.rightMouseDownTime = currentTime;
            this.hasLoggedRightHold = false;

            // Check for LMB -> RMB combo
            if (this.lastButtonPressed === 'left' && 
                currentTime - this.lastButtonPressTime < this.COMBO_WINDOW) {
                this.callbacks.onLmbToRmbCombo(currentTime - this.lastButtonPressTime);
                this.bothMouseDownTime = currentTime;
            }
            // Check for RMB -> RMB combo (double click)
            else if (this.config.enabledRmbToRmbCombo && 
                    this.lastButtonPressed === 'right' && 
                    currentTime - this.lastButtonPressTime < this.COMBO_WINDOW) {
                this.callbacks.onRmbToRmbCombo(currentTime - this.lastButtonPressTime);
            }
            this.lastButtonPressed = 'right';
            this.lastButtonPressTime = currentTime;
        }
    }

    handleMouseUp(event) {
        // Run checkEnabled before processing any mouse events
        if (!this.config.checkEnabled()) {
            return;
        }

        const currentTime = Date.now();
        
        if (event.button === 0) { // Left mouse button
            this.isLeftMouseDown = false;
            if (!this.hasLoggedLeftHold && currentTime - this.leftMouseDownTime < 150) {
                this.callbacks.onLeftTap();
            }
            if (currentTime - this.leftMouseDownTime >= this.HOLD_WINDOW && this.hasLoggedLeftHold) {
                this.callbacks.onLeftRelease();
            }
        } else if (event.button === 2) { // Right mouse button
            this.isRightMouseDown = false;
            if (!this.hasLoggedRightHold && currentTime - this.rightMouseDownTime < 150) {
                this.callbacks.onRightTap();
            }
            if (currentTime - this.rightMouseDownTime >= this.HOLD_WINDOW && this.hasLoggedRightHold) {
                this.callbacks.onRightRelease();
            }
        }
    }

    checkHolds() {
        // Run checkEnabled before processing any mouse events
        if (!this.config.checkEnabled()) {
            return;
        }

        const currentTime = Date.now();
        
        if (this.isLeftMouseDown && !this.isRightMouseDown && 
            currentTime - this.leftMouseDownTime >= this.HOLD_WINDOW && !this.hasLoggedLeftHold) {
            this.callbacks.onLeftHold();
            this.hasLoggedLeftHold = true;
        }
        
        if (this.isRightMouseDown && !this.isLeftMouseDown && 
            currentTime - this.rightMouseDownTime >= this.HOLD_WINDOW && !this.hasLoggedRightHold) {
            this.callbacks.onRightHold();
            this.hasLoggedRightHold = true;
        }
        
    }
}

