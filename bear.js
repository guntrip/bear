var bear_counter=0

class Bear {
  constructor(weight) {
    this.weight = weight;
    this.id=bear_counter

    this.create_html()
    bear_counter++
  }

  create_html() {
    var g = document.getElementById("g")
    this.element = document.createElement("div")
    this.element.innerHTML = "^ O . O ^"
    this.element.classList.add("bear");

    g.appendChild(this.element)
  }
}

class Bears {
  constructor(){
    this.bears = []
  }

  spawn(){
    let b = new Bear(100)
    this.bears.push(b)
    return b
  }

}
