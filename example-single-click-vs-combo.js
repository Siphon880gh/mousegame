// Example usage:
// const mouseGame = new MouseGameAPI({
//    // Overrides console log for LMB→LMB combo and RMB→RMB combo with your own custom handler
//    onLmbToLmbCombo: (time) => console.log(`%cCustom LMB→LMB combo: ${time}ms`, 'color: #00FF00;'),
//    onRmbToRmbCombo: (time) => console.log(`%cCustom RMB→RMB combo: ${time}ms`, 'color: #FF00FF;')
// });
// const mouseGame = new MouseGameAPI({
//     onLmbToLmbCombo: (time) => console.log(`%cCustom LMB→LMB combo: ${time}ms`, 'color: #00FF00;'),
//     onRmbToRmbCombo: (time) => console.log(`%cCustom RMB→RMB combo: ${time}ms`, 'color: #FF00FF;')
// });
// const mouseGame = new MouseGameAPI({
//     enabledLmbToLmbCombo: false,
//     enabledRmbToRmbCombo: false,
// });

window.gameState = {
    isLmbClicked: false,
    isLmbToRmbCombo: false,
}
const clickThreshold = 1000;
const delta = 100;

const mouseGame = new MouseGameAPI({
    onLeftTap: () => { 
        window.gameState.isLmbClicked = true;
        setTimeout(() => {
            if (window.gameState.isLmbClicked) {
                console.log("LMB tapped");
            }
            window.gameState.isLmbClicked = false;
        }, clickThreshold + delta);
    },
    onRightTap: () => { 
        if (window.gameState.isLmbToRmbCombo) {
            window.gameState.isLmbToRmbCombo = false;
        } else {
            console.log("RMB tapped");
        }
    },
    onLmbToRmbCombo: (time) => { 
        if(window.gameState.isLmbClicked) {
            window.gameState.isLmbClicked = false;
        }
        console.log(`%cLMB then RMB combo detected (${time}ms)`, 'color: #0000FF; font-weight:bold;');
        window.gameState.isLmbToRmbCombo = true;
    },

    // Makes the demo's console logs easier to understand if we disable these other console logs
    onRmbToLmbCombo: () => {},
    onLmbToLmbCombo: () => {},
    onRmbToRmbCombo: () => {}
});

// Initialize the game
mouseGame.init();

// To destroy/cleanup:
// mouseGame.destroy();