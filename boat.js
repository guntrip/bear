var boat
var boat_wave_adjust = 0
var boat_x=0
var boat_y=0
var boat_width=0

var boat_is_sinking=false
var boat_is_rising=false
var sinking_progress=0.0

var boat_is_docked_on_right=true
var boat_is_docked_on_left=false
var boat_direction=true // true: going to the left, false: going to the right
var boat_power=0.0
var boat_powering_up=false

var angle_animate = false
var angle_animate_increment = 0.1
var angle_target = 0

var boat_capacity=100 // max on either side
var sink_angle = 13.5

var cog = 0.5 // center of gravity
var cog_angle_adjust=0.0
var show_cog = false

function setup_boat() {
    boat_width = 150
    boat_x = right_land_edge - boat_width - 10
    boat_y = (game.water_line - 30)

    var g = document.getElementById("g")
    boat = document.createElement("div")
    boat.classList.add("boat");
    boat.style.left = boat_x+"px"
    boat.style.top = boat_y +"px"
    boat.style.width = boat_width+"px"
    boat.style.height = "65px"
    boat.addEventListener("click", boat_click, false);
    g.appendChild(boat)

    if (show_cog) {
      var c = document.createElement("div")
      c.classList.add("cog")
      c.id="cog_disp"
      c.style.left = boat_x + (cog * boat_width) - 5 /*cog width*/ + "px"
      c.style.top = boat_y + 20 + "px"  
      g.appendChild(c) 
    }


}

function move_boat() {
  boat_y = (((game.water_line - 30) - get_wave_bounce_at_x(boat_x+(boat_width/2)))) + (120.0 * sinking_progress)
  boat.style.top = boat_y + "px"
  boat.style.left = boat_x + "px"

  // Shall we rotate it (a bit..), let's see where the wave height is at the extremes and see
  // if we can figure out a direction..
  var left_height = get_wave_bounce_at_x(boat_x)
  var right_height = get_wave_bounce_at_x(boat_x+boat_width)
  /*if (left_height>right_height) {
    boat.style.transform="rotate(20.5deg)"
  } else {
    boat.style.transform="rotate(-20.5deg)"
  }*/
  var rotation = cog_angle_adjust + ((left_height - right_height)*0.3)
  boat.style.transform="rotate("+rotation+"deg)"
  boat_angle_check(rotation)

  move_boat_occupants()

  if (angle_animate) animate_boat_angle()

}

function move_boat_occupants() {
  bears.bears.forEach(function(b) {
    if (b.on_the_boat) {
      b.xy.y = boat_y - (b.weight/2)
      b.xy.x = boat_x + b.x_position_on_boat
      b.set_position()
    }
  })
}

function calculate_cog() {
  var left_lean = 0
  var right_lean = 0
  var bear_count = 0
  var total_bear_weight =0
  var last_bear_pos

  bears.bears.forEach(function(b) {
    if (b.on_the_boat) {
      var bear_centre_on_boat = (b.xy.x + (b.weight/2)) - boat_x
      last_bear_pos = bear_centre_on_boat
      bear_count += 1
      total_bear_weight += b.weight

      if (bear_centre_on_boat > boat_width / 2) {
        //right_lean += ( (bear_centre_on_boat-(boat_width / 2)) / (boat_width / 2) ) * b.weight
        right_lean += b.weight
      } 

      if (bear_centre_on_boat < boat_width / 2) {
        //left_lean += b.weight - ((bear_centre_on_boat / (boat_width / 2)) * b.weight)
        left_lean += b.weight
      }
    }
  })

  if (bear_count==0) {
    cog=0.5
  } else {
    if (bear_count==1) { 
       // cog should be wherever the bear is
       cog = last_bear_pos / boat_width
    } else {
      if (right_lean==left_lean) {
        cog=0.5 // perfectly balanced!
      } else {
        // what's the difference
        var lean = Math.abs(right_lean - left_lean) / (right_lean + left_lean)
        if (right_lean>left_lean) {
          cog = 0.5 + (lean/2)
        } else {
          cog = 0.5 - (lean/2)
        }
        console.log("left:"+left_lean+" / right:"+right_lean+" / cog:"+cog)
      }
    }
  }

  // Adjust rotatation    
  if (cog>0.5) {
    var multiplier = right_lean / boat_capacity
    angle_target = (((cog-0.5)*2) * multiplier) * 30
    angle_animate_increment = ((cog-0.5)*2) * 0.3
  } else {
    var multiplier = left_lean / boat_capacity
    angle_target = 0 - ( (((0.5-cog)*2) * multiplier) * 30 )
    angle_animate_increment = (1.0-((cog)*2)) * 0.3
  }
  angle_animate=true

  if (show_cog) {
      var c = document.getElementById("cog_disp")
      c.style.left = boat_x + (cog * boat_width) - 5 /*cog width*/ + "px"   
    }
}

function animate_boat_angle() {
  if (cog_angle_adjust>angle_target) {
    cog_angle_adjust -= 0.05 + angle_animate_increment
    if (cog_angle_adjust<=angle_target) {
      cog_angle_adjust=angle_target
      angle_animate=false
    }
  }
  if (cog_angle_adjust<angle_target) {
    cog_angle_adjust += 0.05 + angle_animate_increment
    if (cog_angle_adjust>=angle_target) {
      cog_angle_adjust=angle_target
      angle_animate=false
    }
  }
}

function boat_angle_check(rotation) {
  if (rotation>sink_angle || rotation<0-sink_angle) {
    if (!boat_is_sinking) {
      boat_is_sinking=true
      sinking_progress=0.0
      bears.bears.forEach(function(b) {
        if (b.on_the_boat) {
          b.panic()
        }
      })
    }
  } else {
    if (boat_is_sinking) {
      // not anymore!
      boat_is_sinking=false
      boat_is_rising=true
      bears.bears.forEach(function(b) {
        if (b.on_the_boat) {
          b.stop_panicking()
        }
      })
    }
  }
}

function sink() {
  sinking_progress += 0.0025
  if (sinking_progress>=1.0) {
    // Kill everyone onboard, that will potentially end the game too
    bears.bears.forEach(function(b) {
      if (b.on_the_boat) {
        b.on_the_boat=false
        b.die()
        b.sinking_corpse=true
      }
    })
    // Calculate cog, which should rise us back up!
    calculate_cog()
  }
}

function rise() {
  sinking_progress -= 0.01
  if (sinking_progress<=0.0) {
    boat_is_rising=false
    sinking_progress=0
  }
}

function boat_power_apply() {
  // called by loop when we're powering up or there's boat power
  if (boat_powering_up) {
    // Up power
    boat_power += 0.05
    if (boat_power>=1.0) boat_powering_up=false
  } else {
    // Lose power
    boat_power -= 0.01
  }

  if (boat_direction==true) {
    
    boat_x -= (boat_power*2)

    if (boat_x <= left_land_edge + 10) {
      boat_power=0
      boat_powering_up=false
      boat_is_docked_on_left=true
      game.crossings_complete += 1

      // get out bears
      bears.bears.forEach(function(b) {
        if (b.on_the_boat) {
          b.get_out_of_boat()
        }
      })

    }

  } else {
    boat_x += (boat_power*2)

    if (boat_x >= right_land_edge - boat_width - 10) {
      boat_power=0
      boat_powering_up=false
      boat_is_docked_on_right=true
    }

  }
}

function boat_click() {
  var go = true
  // Set direction if we're docked
  if (boat_is_docked_on_right) {
    boat_direction=true
    boat_is_docked_on_right=false
  }

  if (boat_is_docked_on_left) {
    bears.bears.forEach(function(b) {
      if (b.shuffling_off_the_boat) {
        go = false
      }
    })
    if (go) {
      boat_direction=false
      boat_is_docked_on_left=false
    }
  }

  if (game.bear_picked_up>-1) go = false
  if (boat_is_sinking || boat_is_rising) go = false

  if (go) boat_powering_up=true // will quickly ramp up boat-power
}
