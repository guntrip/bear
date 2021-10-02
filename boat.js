var boat
var boat_wave_adjust = 0
var boat_x=0
var boat_y=0
var boat_width=0

var angle_animate = false
var angle_animate_increment = 0.1
var angle_target = 0

var boat_capacity=250 // 

var cog = 0.5 // center of gravity
var cog_angle_adjust=0.0
var show_cog = true

function setup_boat() {
    boat_width = 400
    boat_x = 200
    boat_y = (game.water_line - 30)

    var g = document.getElementById("g")
    boat = document.createElement("div")
    boat.innerHTML = "i'm a boat"
    boat.classList.add("boat");
    boat.style.left = boat_x+"px"
    boat.style.top = boat_y +"px"
    boat.style.width = boat_width+"px"
    boat.style.height = "65px"
    boat.addEventListener("click", general_click, false);
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
  boat_y = ((game.water_line - 30) - get_wave_bounce_at_x(boat_x+(boat_width/2)))
  boat.style.top = boat_y + "px"

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

  move_boat_occupants()

  if (angle_animate) animate_boat_angle()
}

function move_boat_occupants() {
  bears.bears.forEach(function(b) {
    if (b.on_the_boat) {
      b.xy.y = boat_y - 45
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
  if (cog!=0.5) {      
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
  }

  // 0.5 for l==r..
  /*if (right_lean>left_lean) {
    cog = 0.5 + ((left_lean/right_lean)/2)
    console.log((left_lean/right_lean))
  }
  if (right_lean==left_lean) {
    cog=0.5
  }
  if (left_lean>right_lean) {
    cog = ((right_lean/left_lean)/2)
  }*/

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
