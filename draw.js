$(document).ready(function () {
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
    drawing.width = window.innerWidth;
    drawing.height = window.innerHeight;

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
  drawing.addEventListener('mousemove', function(e) {
    mousePosition = e.clientX

    target = e.clientX === pivot ? 0 : (e.clientX > pivot ? 10 : -10)

    window.requestAnimationFrame(draw)
  })

  const context = drawing.getContext("2d")

  function draw() {
    context.clearRect(0, 0, drawing.width, drawing.height);

    context.lineWidth = 7;
    context.strokeStyle = 'black';

    const limit = rodLeft + 10
    let x = mousePosition < limit
        ? limit
        : (mousePosition > drawing.width - limit
           ? drawing.width - limit
           : mousePosition)

    const speed = (Math.abs(x - pivot) * 2) / rodWidth

    console.log("speed is " + speed)

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

    context.fillStyle = 'green';
    context.beginPath()
    context.moveTo(pivot, rodTop + (rodHeight/2));
    context.lineTo(pivot + (triangleWidth/2), rodTop + (rodHeight/2) + triangleWidth);
    context.lineTo(pivot - (triangleWidth/2), rodTop + (rodHeight/2) + triangleWidth);
    context.lineTo(pivot, rodTop + (rodHeight/2));
    context.fill();
    context.stroke();

    context.save()
    context.translate(pivot, rodTop + (rodHeight/2))
    context.rotate((Math.PI / 180) * rotation)

    context.fillStyle = 'brown';
    context.beginPath()
    context.rect(rodLeft - pivot, -(rodHeight/2), rodWidth, rodHeight);
    context.fill();
    context.stroke();

    context.fillStyle = 'yellow';
    context.beginPath()
    context.rect(x - pivot - (boxHeight/2), -(boxHeight + (rodHeight/2)), boxWidth, boxHeight);
    context.fill();
    context.stroke();

    context.restore()

    if (rotation !== target) {
      window.setTimeout(function() {
        window.requestAnimationFrame(draw)
      }, 10)
    }
  }

  resize();
})
