
// Note - No simultaneous LMB and RMB detection because MacOS doesn't support it
/**
 * @typedef {Object} MouseGameAPIOptions
 * @property {boolean} [enableDoubleLmb=true] - Enable double left mouse button detection
 * @property {boolean} [enableDoubleRmb=true] - Enable double right mouse button detection
 * @property {function} [onLeftTap] - Handler for left mouse button tap
 * @property {function} [onRightTap] - Handler for right mouse button tap
 * @property {function} [onLeftHold] - Handler for left mouse button hold (1 second)
 * @property {function} [onRightHold] - Handler for right mouse button hold (1 second)
 * @property {function} [onBothHold] - Handler for both mouse buttons held (1 second)
 * @property {function} [onLeftRelease] - Handler for left mouse button release after hold
 * @property {function} [onRightRelease] - Handler for right mouse button release after hold
 * @property {function} [onBothRelease] - Handler for both buttons release after hold
 * @property {function} [onRmbToLmbCombo] - Handler for right-to-left mouse button combo
 * @property {function} [onLmbToRmbCombo] - Handler for left-to-right mouse button combo
 * @property {function} [onLmbToLmbCombo] - Handler for double left mouse button combo
 * @property {function} [onRmbToRmbCombo] - Handler for double right mouse button combo
 */
class MouseGameAPI {
    constructor(options = {}) {
        // Configuration options
        this.config = {
            enableDoubleLmb: options.enableDoubleLmb || true,
            enableDoubleRmb: options.enableDoubleRmb || true
        };

        // Default callbacks
        this.callbacks = {
            onLeftTap: options.onLeftTap || (() => console.log('LMB tapped')),
            onRightTap: options.onRightTap || (() => console.log('RMB tapped')),
            onLeftHold: options.onLeftHold || (() => console.log('LMB held for 1 second')),
            onRightHold: options.onRightHold || (() => console.log('RMB held for 1 second')),
            onBothHold: options.onBothHold || (() => console.log('Both buttons held for 1 second')),
            onLeftRelease: options.onLeftRelease || (() => console.log('LMB released after 1 second')),
            onRightRelease: options.onRightRelease || (() => console.log('RMB released after 1 second')),
            onBothRelease: options.onBothRelease || (() => console.log('Both buttons released after 1 second')),
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
        this.COMBO_WINDOW = 400;

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
            // Check for LMB -> LMB combo (double click)
            else if (this.config.enableDoubleLmb && 
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
            else if (this.config.enableDoubleRmb && 
                    this.lastButtonPressed === 'right' && 
                    currentTime - this.lastButtonPressTime < this.COMBO_WINDOW) {
                this.callbacks.onRmbToRmbCombo(currentTime - this.lastButtonPressTime);
            }
            this.lastButtonPressed = 'right';
            this.lastButtonPressTime = currentTime;
        }
    }

    handleMouseUp(event) {
        const currentTime = Date.now();
        
        if (event.button === 0) { // Left mouse button
            this.isLeftMouseDown = false;
            if (!this.hasLoggedLeftHold && currentTime - this.leftMouseDownTime < 150) {
                this.callbacks.onLeftTap();
            }
            if (currentTime - this.leftMouseDownTime >= 1000 && this.hasLoggedLeftHold) {
                this.callbacks.onLeftRelease();
            }
        } else if (event.button === 2) { // Right mouse button
            this.isRightMouseDown = false;
            if (!this.hasLoggedRightHold && currentTime - this.rightMouseDownTime < 150) {
                this.callbacks.onRightTap();
            }
            if (currentTime - this.rightMouseDownTime >= 1000 && this.hasLoggedRightHold) {
                this.callbacks.onRightRelease();
            }
        }
        
        if (!this.isLeftMouseDown && !this.isRightMouseDown) {
            this.hasLoggedBothHold = false;
            if (currentTime - this.bothMouseDownTime >= 1000 && this.hasLoggedBothHold) {
                this.callbacks.onBothRelease();
            }
        }
    }

    checkHolds() {
        const currentTime = Date.now();
        
        if (this.isLeftMouseDown && !this.isRightMouseDown && 
            currentTime - this.leftMouseDownTime >= 1000 && !this.hasLoggedLeftHold) {
            this.callbacks.onLeftHold();
            this.hasLoggedLeftHold = true;
        }
        
        if (this.isRightMouseDown && !this.isLeftMouseDown && 
            currentTime - this.rightMouseDownTime >= 1000 && !this.hasLoggedRightHold) {
            this.callbacks.onRightHold();
            this.hasLoggedRightHold = true;
        }
        
        if (this.isLeftMouseDown && this.isRightMouseDown && 
            currentTime - this.bothMouseDownTime >= 1000 && !this.hasLoggedBothHold) {
            this.callbacks.onBothHold();
            this.hasLoggedBothHold = true;
        }
    }
}

// Example usage:
// const mouseGame = new MouseGameAPI({
//     enableDoubleLmb: true,
//     enableDoubleRmb: true,
//     onLmbToLmbCombo: (time) => console.log(`%cCustom LMB→LMB combo: ${time}ms`, 'color: #00FF00;'),
//     onRmbToRmbCombo: (time) => console.log(`%cCustom RMB→RMB combo: ${time}ms`, 'color: #FF00FF;')
// });
const mouseGame = new MouseGameAPI({
    // enableDoubleLmb: false,
    // enableDoubleRmb: false,
    // onLmbToLmbCombo: (time) => console.log(`%cCustom LMB→LMB combo: ${time}ms`, 'color: #00FF00;'),
    // onRmbToRmbCombo: (time) => console.log(`%cCustom RMB→RMB combo: ${time}ms`, 'color: #FF00FF;')
});

// Initialize the game
mouseGame.init();

// To destroy/cleanup:
// mouseGame.destroy();
