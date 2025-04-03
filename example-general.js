
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

// const mouseGame = new MouseGameAPI({
//     comboThreshold: 2000,
//     holdThreshold: 3000
// });

// Initialize the game
const mouseGame = new MouseGameAPI();
mouseGame.init();

// To destroy/cleanup:
// mouseGame.destroy();