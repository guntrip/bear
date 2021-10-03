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

  if (boat_powering_up || boat_power>0.0) boat_power_apply()

  move_boat()


  if (boat_is_sinking) sink()
  if (boat_is_rising) rise()

}

document.addEventListener("DOMContentLoaded", function(event) {
  // Setup the game
  setup_game()  

  // Set the loop
  setInterval(loop, engineConfig.interval)
  setInterval(update_waves, engineConfig.wave_interval)

});

