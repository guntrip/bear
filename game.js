let bears = new Bears()

var game = {
  bear_picked_up: -1,
  click_offset:{x:0,y:0},
  mouse:{x:0,y:0},
  water_line: 250
}

function setup_game() {

  setup_input()

  setup_river()
  setup_boat()

  bears.queue_up_bears(true)

}
