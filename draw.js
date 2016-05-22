$(document).ready(function () {
  const useFirebase = false

  const drawing = $("#drawing")[0]

  let rodWidth
  let rodHeight
  let rodLeft
  let rodTop

  let boxWidth
  let boxHeight

  let triangleWidth

  let pivot

  function resize() {
    drawing.width = window.innerWidth
    drawing.height = window.innerHeight

    rodWidth = drawing.width * 0.9
    rodHeight = drawing.width * 0.05
    rodLeft = (drawing.width - rodWidth) / 2
    rodTop = drawing.height * 0.6

    boxWidth = drawing.width * 0.1
    boxHeight = boxWidth

    triangleWidth = drawing.width * 0.1

    pivot = drawing.width / 2

    draw()
  }

  let rotation = 0
  let target = 0
  let mousePosition = 0
  let speed = 0

  let boxes = [-1, -1]

  let state = { value: 0, version: 0 }

  function update(position) {
    mousePosition = position

    const limit = rodLeft + 10
    let x = mousePosition < limit
        ? limit
        : (mousePosition > drawing.width - limit
           ? drawing.width - limit
           : mousePosition)

    boxes[0] = x
    boxes[1] = -1//pivot + 200

    let center = 0
    let count = 0
    for (let i = 0; i < boxes.length; ++i) {
      if (boxes[i] >= 0) {
        center += boxes[i]
        ++ count
      }
    }
    center /= count

    target = center === pivot ? 0 : (center > pivot ? 10 : -10)

    speed = (Math.abs(center - pivot) * 2) / rodWidth

    window.requestAnimationFrame(draw)
  }

  drawing.addEventListener('mousemove', function(e) {
    update(e.clientX)

    if (useFirebase) {
      firebase.database().ref('position').set(mousePosition / drawing.width)
    } else {
      console.log("post " + (mousePosition / drawing.width))

      state = { value: mousePosition / drawing.width,
                version: ++ state.version }

      $.ajax({ url: 'http://concelo.io:8080/',
               type: 'POST',
               data: JSON.stringify(state) })
    }
  })

  function get() {
    if (useFirebase) {
      firebase.auth().signInAnonymously().catch(function(error) {
        console.log("auth error " + error.code + ": " + error.message)
      })

      firebase.database().ref('position').on('value', function(data) {
        update(drawing.width * data.val())
      })
    } else {
      $.ajax({ url: 'http://concelo.io:8080/',
               type: 'POST',
               data: JSON.stringify({ version: state.version })
             })
        .done(function(body) {
          console.log("get " + body)

          newState = JSON.parse(body)

          if (newState.version !== state.version) {
            state = newState
            update(drawing.width * state.value)
          }

          setTimeout(get, 10)
        })
    }
  }

  const context = drawing.getContext("2d")

  function draw() {
    context.clearRect(0, 0, drawing.width, drawing.height)

    context.lineWidth = 7
    context.strokeStyle = 'black'

    // if (speed < 0 || speed > 1) throw new Error("oops")

    if (Math.abs(rotation - target) < speed) {
      rotation = target
    } else {
      if (rotation > target) {
        rotation -= speed
      } else if (rotation < target) {
        rotation += speed
      }
    }

    context.fillStyle = 'green'
    context.beginPath()
    context.moveTo(pivot, rodTop + (rodHeight/2))
    context.lineTo(pivot + (triangleWidth/2), rodTop + (rodHeight/2) + triangleWidth)
    context.lineTo(pivot - (triangleWidth/2), rodTop + (rodHeight/2) + triangleWidth)
    context.lineTo(pivot, rodTop + (rodHeight/2))
    context.fill()
    context.stroke()

    context.save()
    context.translate(pivot, rodTop + (rodHeight/2))
    context.rotate((Math.PI / 180) * rotation)

    context.fillStyle = 'brown'
    context.beginPath()
    context.rect(rodLeft - pivot, -(rodHeight/2), rodWidth, rodHeight)
    context.fill()
    context.stroke()

    context.fillStyle = 'yellow'
    for (let i = 0; i < boxes.length; ++i) {
      if (boxes[i] >= 0) {
        context.beginPath()
        context.rect(boxes[i] - pivot - (boxHeight/2), -(boxHeight + (rodHeight/2)), boxWidth, boxHeight)
        context.fill()
        context.stroke()
      }
    }

    context.restore()

    if (rotation !== target) {
      window.setTimeout(function() {
        window.requestAnimationFrame(draw)
      }, 10)
    }
  }

  resize()

  get()
})
