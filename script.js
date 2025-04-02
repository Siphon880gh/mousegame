// Track mouse button states
let isLeftMouseDown = false;
let isRightMouseDown = false;
let leftMouseDownTime = 0;
let rightMouseDownTime = 0;
let bothMouseDownTime = 0;

// Track if we've already logged for simultaneous press
let hasLoggedSimultaneousPress = false;

// Track if we've already logged hold/release for each case
let hasLoggedLeftHold = false;
let hasLoggedRightHold = false;
let hasLoggedBothHold = false;

// Track last button press for combo detection
let lastButtonPressed = null;
let lastButtonPressTime = 0;
const COMBO_WINDOW = 400; // Time window for combo detection in milliseconds

// Track pending press events
let leftPressTimeout = null;
let rightPressTimeout = null;

// Handle mouse down events
document.addEventListener('mousedown', (event) => {
    const currentTime = Date.now();
    
    if (event.button === 0) { // Left mouse button
        isLeftMouseDown = true;
        leftMouseDownTime = currentTime;
        hasLoggedLeftHold = false;

        // Check for RMB -> LMB combo
        if (lastButtonPressed === 'right' && 
            currentTime - lastButtonPressTime < COMBO_WINDOW) {
            console.log(`%cRMB then LMB combo detected (${currentTime - lastButtonPressTime}ms)`, 'color: #0000FF;');
            hasLoggedSimultaneousPress = true;
            bothMouseDownTime = currentTime;
        }
        lastButtonPressed = 'left';
        lastButtonPressTime = currentTime;
        console.log('LMB pressed, waiting for possible combo...');
    } else if (event.button === 2) { // Right mouse button
        isRightMouseDown = true;
        rightMouseDownTime = currentTime;
        hasLoggedRightHold = false;

        // Check for LMB -> RMB combo
        if (lastButtonPressed === 'left' && 
            currentTime - lastButtonPressTime < COMBO_WINDOW) {
            console.log(`%cLMB then RMB combo detected (${currentTime - lastButtonPressTime}ms)`, 'color: #FF0000;' );
            hasLoggedSimultaneousPress = true;
            bothMouseDownTime = currentTime;
        }
        lastButtonPressed = 'right';
        lastButtonPressTime = currentTime;
        console.log('RMB pressed, waiting for possible combo...');
    }
});

// Handle mouse up events
document.addEventListener('mouseup', (event) => {
    const currentTime = Date.now();
    
    if (event.button === 0) { // Left mouse button
        isLeftMouseDown = false;
        // Check if it was a quick press
        if (!hasLoggedLeftHold && currentTime - leftMouseDownTime < 150) {
            console.log('LMB tapped');
        }
        if (currentTime - leftMouseDownTime >= 1000 && hasLoggedLeftHold) {
            console.log('LMB released after 1 second');
        }
    } else if (event.button === 2) { // Right mouse button
        isRightMouseDown = false;
        // Check if it was a quick press
        if (!hasLoggedRightHold && currentTime - rightMouseDownTime < 150) {
            console.log('RMB tapped');
        }
        if (currentTime - rightMouseDownTime >= 1000 && hasLoggedRightHold) {
            console.log('RMB released after 1 second');
        }
    }
    
    // Only reset combo tracking if both buttons are released
    if (!isLeftMouseDown && !isRightMouseDown) {
        hasLoggedSimultaneousPress = false;
        hasLoggedBothHold = false;
        // Don't reset lastButtonPressed and lastButtonPressTime here
        if (currentTime - bothMouseDownTime >= 1000 && hasLoggedBothHold) {
            console.log('Both buttons released after 1 second');
        }
    }
});

// Check for holds every 100ms
setInterval(() => {
    const currentTime = Date.now();
    
    // Check LMB hold
    if (isLeftMouseDown && !isRightMouseDown && 
        currentTime - leftMouseDownTime >= 1000 && !hasLoggedLeftHold) {
        console.log('LMB held for 1 second');
        hasLoggedLeftHold = true;
    }
    
    // Check RMB hold
    if (isRightMouseDown && !isLeftMouseDown && 
        currentTime - rightMouseDownTime >= 1000 && !hasLoggedRightHold) {
        console.log('RMB held for 1 second');
        hasLoggedRightHold = true;
    }
    
    // Check simultaneous hold
    if (isLeftMouseDown && isRightMouseDown && 
        currentTime - bothMouseDownTime >= 1000 && !hasLoggedBothHold) {
        console.log('Both buttons held for 1 second');
        hasLoggedBothHold = true;
    }
}, 100);

// Prevent context menu on right click
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});
