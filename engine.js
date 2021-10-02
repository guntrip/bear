// Config bits
var engineConfig = {
	interval: 10,
  wave_interval: 10
}

function loop() {
	// Main game loop.

  // Do we need to snap any bears?
  if (game.bear_picked_up>-1) {
    bears.bears[game.bear_picked_up].snap_to_cursor()
  }

  // Update bear positions
  update_bears()

  move_boat()
}

document.addEventListener("DOMContentLoaded", function(event) {
  // Setup the game
  setup_game()  

  // Set the loop
  setInterval(loop, engineConfig.interval)
  setInterval(update_waves, engineConfig.wave_interval)
});

