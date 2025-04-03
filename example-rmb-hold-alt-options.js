window.gameState = {
    isRmbHeld: false,
}

// When user holds RMB, show alternate actions message and also set flag isRmbHeld to true
// On LMB or RMB click, check if isRmbHeld flag is true. 
// - If true, perform alternate action and dismiss the alternate actions message.
// - If false, perform default action.
// If instead, user holds RMB and then releases again, set isRmbHeld to false and dismiss the alternate actions message. This is considered a cancel.
const mouseGame = new MouseGameAPI({
    onLeftTap: () => { 
        if (window.gameState.isRmbHeld) {
            console.log("LMB tapped: Alternate Action 1");
            window.gameState.isRmbHeld = false;
            toggleAlternateActionsHint();
            return;
        }

        console.log("LMB tapped: Default Action");
    },
    onRightTap: () => { 
        if (window.gameState.isRmbHeld) {
            console.log("RMB tapped: Alternate Action 2");
            window.gameState.isRmbHeld = false;
            toggleAlternateActionsHint();
            return;
        }

        console.log("RMB tapped: Default Action");
    },
    onRightHold: () => { 
        if(window.gameState.isRmbHeld) {
            window.gameState.isRmbHeld = false;
        } else {
            window.gameState.isRmbHeld = true;
        }
        toggleAlternateActionsHint();
    },
    // Makes the demo's console logs easier to understand if we disable the hold-then-release events
    onRightRelease: () => {}
});

function toggleAlternateActionsHint() {
    const alternateActionsHintElement = document.getElementById("alternate-actions-hint");
    alternateActionsHintElement.classList.toggle("visible");
}

// Initialize the game
mouseGame.init();

// To destroy/cleanup:
// mouseGame.destroy();