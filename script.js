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
        } else if (!isRightMouseDown) {
            // Set a timeout to check if it's a quick press
            leftPressTimeout = setTimeout(() => {
                // Only log if it's a quick press (button released within 150ms)
                if (!isLeftMouseDown && !hasLoggedLeftHold) {
                    console.log('LMB pressed');
                }
            }, 150); // Wait 150ms to see if it's a quick press
        }
    } else if (event.button === 2) { // Right mouse button
        isRightMouseDown = true;
        rightMouseDownTime = currentTime;
        
        // Check for simultaneous press
        if (isLeftMouseDown && !hasLoggedSimultaneousPress) {
            console.log('LMB and RMB pressed simultaneously');
            hasLoggedSimultaneousPress = true;
            bothMouseDownTime = currentTime;
        } else if (!isLeftMouseDown) {
            // Set a timeout to check if it's a quick press
            rightPressTimeout = setTimeout(() => {
                // Only log if it's a quick press (button released within 150ms)
                if (!isRightMouseDown && !hasLoggedRightHold) {
                    console.log('RMB pressed');
                }
            }, 150); // Wait 150ms to see if it's a quick press
        }
    }
});

// Handle mouse up events
document.addEventListener('mouseup', (event) => {
    const currentTime = Date.now();
    
    if (event.button === 0) { // Left mouse button
        isLeftMouseDown = false;
        // Clear the press timeout if it exists
        if (leftPressTimeout) {
            clearTimeout(leftPressTimeout);
            leftPressTimeout = null;
        }
        if (currentTime - leftMouseDownTime >= 1000 && hasLoggedLeftHold) {
            console.log('LMB released after 1 second');
        }
    } else if (event.button === 2) { // Right mouse button
        isRightMouseDown = false;
        // Clear the press timeout if it exists
        if (rightPressTimeout) {
            clearTimeout(rightPressTimeout);
            rightPressTimeout = null;
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
        // Clear the press timeout if it exists
        if (leftPressTimeout) {
            clearTimeout(leftPressTimeout);
            leftPressTimeout = null;
        }
    }
    
    // Check RMB hold
    if (isRightMouseDown && !isLeftMouseDown && 
        currentTime - rightMouseDownTime >= 1000 && !hasLoggedRightHold) {
        console.log('RMB held for 1 second');
        hasLoggedRightHold = true;
        // Clear the press timeout if it exists
        if (rightPressTimeout) {
            clearTimeout(rightPressTimeout);
            rightPressTimeout = null;
        }
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
