// Config bits
var engineConfig = {
	interval: 100
}

function loop() {
	// Main game loop.
}

document.addEventListener("DOMContentLoaded", function(event) {
  // Setup the game
  setup_game()  

  // Set the loop
  setInterval(loop, engineConfig.interval)
});

