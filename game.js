let bears = new Bears()
var game_info

var game = {
  bear_picked_up: -1,
  click_offset:{x:0,y:0},
  mouse:{x:0,y:0},
  water_line: 250,
  bear_completed: 0,
  bear_deaths: 0,
  bear_deaths_allowed: 4
}

function setup_game() {

  setup_input()

  setup_river()
  setup_boat()
  add_count()

  bears.queue_up_bears(true)

}

function add_count() {
  var g = document.getElementById("g")
  game_info = document.createElement("div")
  game_info.innerHTML = "beeeaaars"
  game_info.classList.add("status");
  game_info.style.left = ((window.innerWidth / 2)-(150/2))+"px"
  game_info.style.top = "20px"
  game_info.style.width = 150+"px"
  game_info.style.height = "25px"
  g.appendChild(game_info)
  add_to_count(0)
}

function add_to_count(c) {
  game.bear_completed += c
  var s = game.bear_completed + " crossing"
  if (game.bear_completed!=1) s = s + "s"
  s = s + "<br />"
  for (let i = 0; i < game.bear_deaths_allowed; i++) {
    if (game.bear_deaths>i) {
      s += "b "
    } else {
      s += "B "
    }
  }
  game_info.innerHTML = s
}

function game_over() {
  alert("game over")
}