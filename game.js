let bears = new Bears()
var game_info

var game = {
  bear_picked_up: -1,
  click_offset:{x:0,y:0},
  mouse:{x:0,y:0},
  water_line: 250,
  bear_completed: 0,
  bear_deaths: 0,
  bear_deaths_allowed: 5,
  welcome_open:false,
  game_over_open:false,
  restarting:false // to avoid re-binding things
}

function setup_game() {

  setup_input()

  setup_river()
  setup_boat()
  add_count()

  bears.queue_up_bears(true)

  show_welcome()

}

function add_count() {
  var g = document.getElementById("g")
  game_info = document.createElement("div")
  game_info.innerHTML = "beeeaaars"
  game_info.classList.add("status");
  game_info.style.left = ((window.innerWidth / 2)-(250/2))+"px"
  game_info.style.top = "20px"
  game_info.style.width = 250+"px"
  game_info.style.height = "25px"
  g.appendChild(game_info)
  add_to_count(0)
}

function add_to_count(c) {
  game.bear_completed += c
  var s = game.bear_completed + " bear"
  if (game.bear_completed!=1) s = s + "s"
  s = s + " ferried home<br />"
  for (let i = 0; i < game.bear_deaths_allowed; i++) {
    if (game.bear_deaths>i) {
      s += "<div class=\"bear_life death\"></div> "
    } else {
      s += "<div class=\"bear_life\"></div> "
    }
  }
  game_info.innerHTML = s
}

function game_over() {
  show_game_over()
}

function show_welcome() {
  var g = document.getElementById("welcome")
  g.style.width = window.innerWidth / 2+"px"
  g.style.left = (window.innerWidth/2)-(window.innerWidth/4)+"px"
  g.style.top = "75px"
  g.style.display = "block"
  game.welcome_open=true
}
function close_welcome() {
  var g = document.getElementById("welcome")
  g.style.display = "none"
  game.welcome_open=false
}

function show_game_over() {
  var g = document.getElementById("game_over")
  g.style.width = window.innerWidth / 2+"px"
  g.style.left = (window.innerWidth/2)-(window.innerWidth/4)+"px"
  g.style.top = "75px"
  g.style.display = "block"
  game.game_over_open=true
}
function close_game_over() {
  var b = document.getElementById("g")
  b.innerHTML = ''
  bears = new Bears()
  bear_counter=0
  game.restarting=true
  game.bear_completed=0
  game.bear_deaths=0
  wave_height=5
  setup_game()

  var g = document.getElementById("game_over")
  g.style.display = "none"
  game.game_over_open=false
}