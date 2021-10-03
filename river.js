
var river_width = 0
var river_bits = 100 // TODO: figure this out by width
var wave_height_adjust = []

var left_land_edge=0
var right_land_edge=0
var land_y=0

var wave_speed = 0.5
var wave_height = 5//60
var wave_width = 30
var waves = [-30,10,50,90]

function setup_river() {
  var g = document.getElementById("g")
  var r = document.createElement("div")
  r.classList.add("river");
  r.addEventListener("click", general_click, false);

  var w = window.innerWidth
  r.style.width = (w - 200) + "px"
  r.style.left = "50px"


  for (let i = 0; i < river_bits; i++) {
    var s = document.createElement("div")
    var inner = document.createElement("div")
    inner.innerHTML="&nbsp;"
    s.appendChild(inner)
    r.appendChild(s)
    wave_height_adjust.push(0)
  } 

  g.appendChild(r)

  river_width = r.getBoundingClientRect().width

  // Add land :3
  var left_land = document.createElement("div")
  left_land.classList.add("land")
  left_land.classList.add("left")
  left_land.style.left="0px"
  left_land.style.width="50px"
  g.appendChild(left_land)

  var right_land = document.createElement("div")
  right_land.classList.add("land")
  right_land.classList.add("right")
  right_land.style.left=(w - 150)+"px"
  right_land.width="150px"
  g.appendChild(right_land)

  left_land_edge=50
  right_land_edge = (w-150)
  land_y = 250

  // Add background elements (extends colours down to the bottom of the window
  var bgwater = document.createElement("div")
  bgwater.classList.add("background_water")
  bgwater.style.left=left_land_edge+"px"
  bgwater.style.width=(w-50-150)+"px"
  g.appendChild(bgwater)
}

function update_waves() {

  boat_is_on_wave_peak=false
  var boat_rect = boat.getBoundingClientRect()


  // Set adjusts to 0
  for (let r = 0; r < river_bits; r++) {
    wave_height_adjust[r]=0
  }

  for(var i = 0; i < waves.length; i++) {
    // Progress the waves
    waves[i] += wave_speed
    if (waves[i] > (river_bits+wave_width)) waves[i] = 0 - wave_width

   // make it an int so we can access the array
   var wave_int = parseInt(waves[i])

   // make a wave shape either side
    if (wave_int<=river_bits) wave_height_adjust[wave_int] += wave_height
    for(var w = 1; w < wave_width; w++) {
      var adj = wave_height * (1.0 - (w / wave_width)) * (1.0 - (w / wave_width))
      if (wave_int-w >= 0) wave_height_adjust[wave_int-w] += adj
      if (wave_int+w <= river_bits) wave_height_adjust[wave_int+w] += adj
    }

  }


  var wave_div = document.querySelectorAll(".river>div>div");
  boat_wave_adjust = 0
  for(var i = 0; i < wave_div.length; i++) {
    wave_div[i].style.height = (50+(wave_height_adjust[i]))+"px"

    // Is this under the boat?
    var approx_x = (i / wave_div.length) * river_width
    if (approx_x > boat_rect.x && approx_x < boat_rect.x + boat_rect.width) {
      if (wave_height_adjust[i] > boat_wave_adjust) boat_wave_adjust = wave_height_adjust[i]
    }

  }

}

function get_wave_bounce_at_x(x) {
    x -= left_land_edge
    var approx_x = parseInt((x / river_width) * river_bits)
    if (approx_x <= wave_height_adjust.length) {
      return wave_height_adjust[approx_x]
    } else {
      return 0
    }
}

function update_wave_height() {
  if (game.bear_completed<5) {
    wave_height = 5
  } else {
    wave_height = 5 + ((game.bear_completed/50) * 65)
    if (wave_height>70) wave_height = 70
  }
}