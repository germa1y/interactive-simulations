// Inject CSS to hide Orbie Touch slider
const hideOrbieStyle = document.createElement('style');
hideOrbieStyle.textContent = '#forcesParams .control-group:nth-child(3) { display: none !important; }';
document.head.appendChild(hideOrbieStyle);
