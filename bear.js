var bear_counter=0
var min_bear_size=5
var max_bear_size=150

class Bear {
  constructor(weight) {
    this.weight = weight;
    this.id=bear_counter
    this.falling=false
    this.drowning=false
    this.drown_completion=0
    this.velocity=0.0
    this.xy = {x:50+(Math.random()*300),y:50}
    this.flight={in_flight:false, peak:0, direction:0}
    this.panicking=false

    this.on_the_boat=false
    this.x_position_on_boat=0

    this.animated=false
    this.animation=""
    this.animation_progress=0
    this.animation_xy= {x:0,y:0}

    this.create_html()
    bear_counter++
  }

  create_html() {
    var g = document.getElementById("g")
    this.element = document.createElement("div")
    this.element.innerHTML = "^ o . o ^"
    this.element.classList.add("bear");
    this.element.id = this.id
    this.element.addEventListener("click", bear_click, false);

    this.set_position()
    this.element.style.width = this.weight+"px"
    this.element.style.height = this.weight+"px"
    this.element.style.borderRadius = (this.weight/3)+"px"
    


    g.appendChild(this.element)
  }

  set_position() {
    var ex_x=0,ex_y=0
    if (this.panicking) {
      ex_x = -4 + (Math.random()*8.0)
      ex_y = -4 + (Math.random()*8.0)
    }
    this.element.style.left = (this.xy.x + this.animation_xy.x) + ex_x + "px"
    this.element.style.top = (this.xy.y + this.animation_xy.y) + ex_y + "px"
  }

  pick_up() {
    this.element.innerHTML = "^ > . < ^"
    // if we're falling or something, stop that
    this.stop()
    this.on_the_boat=false
    calculate_cog()
  }

  stop() {
    this.falling=false
    this.velocity=false
    this.flight.in_flight=false
    this.animated=false
    this.drowning=false
    this.panicking=false
    this.animation_xy={x:0,y:0}
  }

  drop() {
    this.element.innerHTML = "^ @ . @ ^"
    this.falling = true
  }

  snap_to_cursor() {
    this.xy.x = (game.mouse.x - game.click_offset.x)
    this.xy.y = (game.mouse.y - game.click_offset.y)
    this.set_position()
  }

  fall() {
    this.xy.y= this.xy.y + this.velocity
    this.set_position()
    this.velocity = this.velocity + 0.05 + (this.velocity*0.05)

    this.check_for_collision()
  }

  check_for_collision() {
    // Is the bottom of the bear in line with the bottom of the boat?
    var bear_location = this.element.getBoundingClientRect()
    var bear_bottom = this.xy.y + bear_location.height
    var bear_waterline = boat_y
    if (bear_bottom >= bear_waterline) {
      // Are we in a boat or not?
      var boat_location = boat.getBoundingClientRect()

      if ( (bear_location.x > boat_location.x - (bear_location.width/3)) && ((bear_location.x + bear_location.width < boat_location.x + boat_location.width + (bear_location.width/3))) ) {
        this.stop()
        this.element.innerHTML = "^ O . O ^"
        this.on_the_boat=true
        calculate_cog()
        return
      } else {
        this.stop()
        this.element.innerHTML = "^ X . X ^"
        this.drowning = true
        this.drown_completion = 0
        // splash
        this.xy.y += (this.weight/2)
        this.set_position()
        return
      }
    }

    // Have we collided WITH ANOTHER BEAR?
    var colliding_with_a_bear=0 // -1 or 1 for our direction
    var this_bear_id = this.id
    // Add some margin..
    bear_location.x += 5
    bear_location.y += 5
    bear_location.width -= 5
    bear_location.height -= 5
    // Check the bears :3
    bears.bears.forEach(function(b) {
      if (b.on_the_boat && b.id !== this_bear_id) {
        var other_bear = b.element.getBoundingClientRect()
        if ( bear_location.y + bear_location.height >= other_bear.y &&  bear_location.x + bear_location.width > other_bear.x && bear_location.x < other_bear.x + other_bear.width ) {
          // To what side do we want to shove the bear?
          if (bear_location.x + (bear_location.width/2) > other_bear.x + (other_bear.width/2)) {
            colliding_with_a_bear=1 // to the right
          } else {
            colliding_with_a_bear=-1
          }          
          // Animate angry bear:
          b.animated=true
          b.animation="hop"
          b.animation_progress=0
          b.animation_xy={x:0,y:0}
        }
      }
    })
    if (colliding_with_a_bear>0||colliding_with_a_bear<0) {
        this.stop()
        this.element.innerHTML=":C"
        // Ping them off
        this.flight.in_flight=true
        this.flight.direction=colliding_with_a_bear
        this.flight.peak=this.xy.y - 65
    }

  }

  move_in_flight() {
    // when we've been kicked by another bear or some other disaster
    this.velocity = 1.5
    this.xy.y -= this.velocity
    if (this.flight.direction==1) {
      this.xy.x += (this.velocity)      
    } else {
      this.xy.x -= (this.velocity)
    }
    this.set_position()
    if (this.xy.y < this.flight.peak) {
      // We can fall now :3
      this.stop()
      this.falling = true
      this.velocity = 0
    }
  }

  drown() {
    // Bob
    var drown_movement = this.drown_completion * 100
    this.drown_completion += 0.001 // << drowning rate
    this.animation_xy.y = 25 - get_wave_bounce_at_x(this.xy.x) + drown_movement
    this.set_position()
    if (this.drown_completion>=1.0) this.die()
  }

  die() {
    this.stop()
  }

  panic() {
    this.element.innerHTML="AAH"
    this.panicking=true
  }

  stop_panicking() {
    this.element.innerHTML=":3"
    this.panicking=false
  }

  animation_step() {
    if (this.animation=="hop") {
      if (this.animation_progress<0.5) {
        this.animation_xy.y = -25 * (this.animation_progress*2)
      } else {
        this.animation_xy.y = -25 * (1.0 - (((this.animation_progress-0.5)*2)) )
      }
      this.animation_progress+=0.05
      if (this.animation_progress>=1.0) { 
        this.animated=false
        this.animation_xy={x:0,y:0}
      }
    }
    this.set_position()
  }

}

class Bears {
  constructor(){
    this.bears = []
  }

  spawn(){
    let b = new Bear(min_bear_size + (Math.random()*(max_bear_size-min_bear_size)))
    this.bears.push(b)
    return b
  }

}

function bear_click(e) {
  var bear_id = e.target.id

  if (game.bear_picked_up == bear_id) {
    // drop
    bears.bears[bear_id].drop()
    game.bear_picked_up=-1
  } else {
    // pick up
    bears.bears[bear_id].pick_up()
    game.bear_picked_up = this.id

    // offset
    var bear_rect = e.target.getBoundingClientRect()
    var game_rect = document.getElementById("g").getBoundingClientRect()
    game.click_offset.x = game.mouse.x - bear_rect.left + game_rect.left
    game.click_offset.y = game.mouse.y - bear_rect.top + game_rect.top
  }
}

function update_bears() {
  bears.bears.forEach(function(b) {
    if (b.falling) b.fall()
    if (b.flight.in_flight) b.move_in_flight()
    if (b.animated) b.animation_step()
    if (b.drowning) b.drown()
  })
}
