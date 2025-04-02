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

// Track pending press events
let leftPressTimeout = null;
let rightPressTimeout = null;

// Handle mouse down events
document.addEventListener('mousedown', (event) => {
    const currentTime = Date.now();
    
    if (event.button === 0) { // Left mouse button
        isLeftMouseDown = true;
        leftMouseDownTime = currentTime;
        
        // Check for simultaneous press
        if (isRightMouseDown && !hasLoggedSimultaneousPress) {
            console.log('LMB and RMB pressed simultaneously');
            hasLoggedSimultaneousPress = true;
            bothMouseDownTime = currentTime;
        }
    } else if (event.button === 2) { // Right mouse button
        isRightMouseDown = true;
        rightMouseDownTime = currentTime;
        
        // Check for simultaneous press
        if (isLeftMouseDown && !hasLoggedSimultaneousPress) {
            console.log('LMB and RMB pressed simultaneously');
            hasLoggedSimultaneousPress = true;
            bothMouseDownTime = currentTime;
        }
    }
});

// Handle mouse up events
document.addEventListener('mouseup', (event) => {
    const currentTime = Date.now();
    
    if (event.button === 0) { // Left mouse button
        isLeftMouseDown = false;
        // Check if it was a quick press
        if (!hasLoggedLeftHold && currentTime - leftMouseDownTime < 150) {
            console.log('LMB pressed');
        }
        if (currentTime - leftMouseDownTime >= 1000 && hasLoggedLeftHold) {
            console.log('LMB released after 1 second');
        }
    } else if (event.button === 2) { // Right mouse button
        isRightMouseDown = false;
        // Check if it was a quick press
        if (!hasLoggedRightHold && currentTime - rightMouseDownTime < 150) {
            console.log('RMB pressed');
        }
        if (currentTime - rightMouseDownTime >= 1000 && hasLoggedRightHold) {
            console.log('RMB released after 1 second');
        }
    }
    
    // Reset simultaneous press flag if both buttons are released
    if (!isLeftMouseDown && !isRightMouseDown) {
        hasLoggedSimultaneousPress = false;
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
