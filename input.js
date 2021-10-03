function setup_input() {

  if (!game.restarting) document.getElementById("g").addEventListener("mousemove", mouse_movement, false);

  document.addEventListener('click', function (event) {
    if (game.welcome_open) {
      close_welcome()
    }
    if (game.game_over_open) {
      close_game_over()
    }
  })

}


function mouse_movement(e) {
  game.mouse = {x:e.clientX, y:e.clientY}
}

function general_click(e) {

  if (game.bear_picked_up >-1) {
    // drop
    bears.bears[game.bear_picked_up].drop()
    game.bear_picked_up=-1
  }

}