var bear_counter=0
var min_bear_size=10
var max_bear_size=95

class Bear {
  constructor(weight) {
    this.weight = weight;
    this.id=bear_counter
    this.falling=false
    this.drowning=false
    this.sinking_corpse=false
    this.drown_completion=0
    this.velocity=0.0
    this.flight={in_flight:false, peak:0, direction:0}
    this.panicking=false
    this.in_queue=true
    this.complete=false

    // Spawn off screen:
    this.xy = {x:right_land_edge+250,y:land_y-this.weight}

    this.on_the_boat=false
    this.x_position_on_boat=0

    this.animated=false
    this.animation=""
    this.animation_progress=0
    this.animation_xy= {x:0,y:0}

    this.shuffling=false
    this.shuffling_target_x=0
    this.shuffling_off_the_boat=false

    this.lfo_active=false
    this.lfo_dir=true
    this.lfo=0.0

    this.create_html()
    bear_counter++
  }

  create_html() {
    var g = document.getElementById("g")
    this.element = document.createElement("div")
    //this.element.innerHTML = ""
    this.element.classList.add("bear");
    this.element.classList.add("normal");
    this.element.id = this.id
    this.element.addEventListener("click", bear_click, false);

    this.set_position()
    this.element.style.width = this.weight+"px"
    this.element.style.height = this.weight+"px"
    this.element.style.borderRadius = (this.weight/3)+"px"
      
      // Ears
      var ear_size = this.weight/8
      var e1 = document.createElement("div")
      e1.classList.add("ear")
      e1.style.width=(ear_size)+"px"
      e1.style.height=(ear_size)+"px"
      e1.style.top="-"+(ear_size-2)+"px"
      e1.style.left=(this.weight/6)+"px"
      this.element.appendChild(e1)
      var e2 = document.createElement("div")
      e2.classList.add("ear")
      e2.style.width=(ear_size)+"px"
      e2.style.height=(ear_size)+"px"
      e2.style.top="-"+(ear_size-2)+"px"
      e2.style.right=(this.weight/6)+"px"
      this.element.appendChild(e2)

      // Feets
      var foot_size = this.weight/8
      var f1 = document.createElement("div")
      f1.classList.add("foot")
      f1.style.width=(foot_size)+"px"
      f1.style.height=(foot_size)+"px"
      f1.style.bottom="-"+(foot_size-2)+"px"
      f1.style.left=(this.weight/5)+"px"
      this.element.appendChild(f1)
      var f2 = document.createElement("div")
      f2.classList.add("foot")
      f2.style.width=(foot_size)+"px"
      f2.style.height=(foot_size)+"px"
      f2.style.bottom="-"+(foot_size-2)+"px"
      f2.style.right=(this.weight/5)+"px"
      this.element.appendChild(f2)

    g.appendChild(this.element)
  }

  mood(m) {
    this.element.classList.remove("normal");
    this.element.classList.remove("happy");
    this.element.classList.remove("panic");
    this.element.classList.remove("down");
    this.element.classList.remove("dead");
    this.element.classList.add(m);
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
    // if we're falling or something, stop that
    this.stop()
    this.mood("down")
    this.on_the_boat=false
    calculate_cog()

    if (this.in_queue) {
      this.in_queue=false
      bears.queue_up_bears(false)
    }
  }

  stop() {
    this.falling=false
    this.velocity=false
    this.flight.in_flight=false
    this.animated=false
    this.drowning=false
    this.panicking=false
    this.shuffling=false
    this.lfo_active=false
    this.animation_xy={x:0,y:0}
    this.mood("normal")
  }

  drop() {
    this.mood("normal")
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
        this.mood("happy")
        this.on_the_boat=true
        this.x_position_on_boat = bear_location.x - boat_location.x
        calculate_cog()
        return
      } else {
        this.stop()
        this.mood("panic")
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
    // Bob up and down and drown for a while and then just sink >.<
    if (this.drowning) {
      var drown_movement = this.drown_completion * 100
      this.drown_completion += 0.001 // << drowning rate
      this.animation_xy.y = 25 - get_wave_bounce_at_x(this.xy.x) + drown_movement
      this.set_position()
      if (this.drown_completion>=1.0) {
         this.die()
         this.sinking_corpse=true
         this.drowning=false
         this.xy.y += 25 - get_wave_bounce_at_x(this.xy.x) + drown_movement
         this.animation_xy.y = 0
      }
    } else {
      this.xy.y += 0.5
      this.element.style.transform="rotate("+(this.xy.y-game.water_line-100)+"deg)"
      this.set_position()
      if (this.xy.y >= window.innerHeight - this.weight) {
        this.sinking_corpse=false
        this.complete=true
      }
    }
  }

  die() {
    this.stop()
    game.bear_deaths += 1
    add_to_count(0)
    this.mood("dead")
    if (game.bear_deaths == game.bear_deaths_allowed) {
      game_over()
    }
  }

  panic() {
    this.element.classList.add("panic");
    this.panicking=true
  }

  stop_panicking() {
    this.element.classList.add("normal");
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

  lfo_step() {
    if (this.lfo_dir) {
      this.lfo+=0.05
      if (this.lfo>=1.0) this.lfo_dir=false
    } else {
      this.lfo-=0.05
      if (this.lfo<=0.0) this.lfo_dir=true
    }
  }

  shuffle() {
    if (!this.animated) {
      // everyday i'm shuffling :3
      this.animation_xy.y = -10 * this.lfo
      this.xy.x -= 0.3

      if (this.xy.x <= this.shuffling_target_x) {
        this.xy.x = this.shuffling_target_x
        this.shuffling=false
        this.lfo_active=false
        this.animation_xy.y = 0
        if (this.shuffling_off_the_boat) {
          this.shuffling_off_the_boat=false
          add_to_count(1) // score
          update_wave_height()
          this.complete=true
          this.element.remove()
        }
      }

      this.set_position()
    }
  }

  get_out_of_boat() {
    this.stop()
    this.shuffling=true
    this.shuffling_target_x = 0 - this.weight
    this.lfo_active=true
    this.on_the_boat=false
    this.xy.y=land_y-this.weight
    this.shuffling_off_the_boat=true
    this.element.classList.add("happy");
    calculate_cog()
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

  queue_up_bears(on_boot) {
    // Spawns bears and positions them in the queue. We want to see *three* bears at a time in the queue.
    // Once a bear is out of the queue, it's up the player to find a space for it on the boat. It can't go back.
    var bears_in_queue=0
    this.bears.forEach(function(b) {
      if (b.in_queue) bears_in_queue+=1
    })

    // Make sure we have bears in the queue
    for (let i = 0; i < 3 - bears_in_queue; i++) {
      this.spawn()
    }

    // Run through the bears, find those not in a queue, and position them
    var bear_position = right_land_edge + 5
    this.bears.forEach(function(b) {
      if (b.in_queue) {
        b.xy.y = land_y - b.weight

        if (on_boot) {
          // position bears
          b.xy.x = bear_position
        } else {
          // shuffle bears
          b.shuffling=true
          b.shuffling_target_x = bear_position
          b.lfo_active=true
        }

        b.set_position()
        bear_position += b.weight+20
      }
    })

  }

}

function bear_click(e) {
  var bear_id = e.target.id


  if (game.bear_picked_up == bear_id) {
    // drop if we're over the water
    if (bears.bears[bear_id].xy.x > left_land_edge && bears.bears[bear_id].xy.x < right_land_edge - bears.bears[bear_id].weight ) {
      bears.bears[bear_id].drop()
      game.bear_picked_up=-1
    }
  } else {
    // you can still pick up bears on the boat when it's in progress but not land-bears
    if ((boat_is_docked_on_right || (bears.bears[bear_id].on_the_boat) || (bears.bears[bear_id].drowning))&&(!bears.bears[bear_id].sinking_corpse && !bears.bears[bear_id].complete)) {
      bears.bears[bear_id].pick_up()
      game.bear_picked_up = this.id

      // offset
      var bear_rect = e.target.getBoundingClientRect()
      var game_rect = document.getElementById("g").getBoundingClientRect()
      game.click_offset.x = game.mouse.x - bear_rect.left + game_rect.left
      game.click_offset.y = game.mouse.y - bear_rect.top + game_rect.top
    }
  }
}

function update_bears() {
  bears.bears.forEach(function(b) {
    if (b.falling) b.fall()
    if (b.flight.in_flight) b.move_in_flight()
    if (b.animated) b.animation_step()
    if (b.drowning || b.sinking_corpse) b.drown()
    if (b.lfo_active) b.lfo_step()
    if (b.shuffling) b.shuffle()
  })
}
