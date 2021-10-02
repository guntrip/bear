function setup_input() {
  document.getElementById("g").addEventListener("mousemove", mouse_movement, false);

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