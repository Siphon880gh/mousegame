class MouseGameAPI {
    constructor(options = {}) {
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
            onRmbToLmbCombo: options.onRmbToLmbCombo || ((time) => console.log(`%cRMB then LMB combo detected (${time}ms)`, 'color: #FF0000;')),
            onLmbToRmbCombo: options.onLmbToRmbCombo || ((time) => console.log(`%cLMB then RMB combo detected (${time}ms)`, 'color: #0000FF;'))
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
const mouseGame = new MouseGameAPI();
// const mouseGame = new MouseGameAPI({
//     onLeftTap: () => console.log('Custom left tap handler'),
//     onRmbToLmbCombo: (time) => console.log(`Custom RMB→LMB combo: ${time}ms`),
//     onLmbToRmbCombo: (time) => console.log(`Custom LMB→RMB combo: ${time}ms`)
// });

// Initialize the game
mouseGame.init();

// To destroy/cleanup:
// mouseGame.destroy();
