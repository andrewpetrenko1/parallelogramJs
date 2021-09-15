
class Circle {
  constructor(x, y, radius, radians) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.radians = radians;
  }

  getArea() {
    return Math.PI * Math.pow(this.radius, 2);
  }

  render(ctx, color = "yellow") {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);
    ctx.strokeStyle = color;
    ctx.stroke();
  };
}

class Parallelogram {
  constructor(pointsArr) {
    this.points = pointsArr;
  }

  addPoint(point) {
    if(this.points >= 4)
      return

    this.points.push(point);
    if(this.points.length === 3) {
      this.points.push({
        x: this.points[0].x + (this.points[2].x - this.points[1].x),
        y: this.points[2].y + (this.points[0].y - this.points[1].y)
      });
    }
    let last = this.points[this.points.length - 1];
    return {x: last.x, y: last.y };
  }

  getArea() {
    if(this.points.length !== 4)
      return 0;
    let ab = {x: this.points[1].x - this.points[0].x, y: this.points[1].y - this.points[0].y};
    let ac = {x: this.points[2].x - this.points[0].x, y: this.points[2].y - this.points[0].y};
    return Math.abs(ab.x * ac.y - ac.x * ab.y);
  }

  render(ctx) {
    if(this.points.length !== 4)
      return
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for(let i = 1; i <= 3; i++) 
      ctx.lineTo(this.points[i].x, this.points[i].y);
    
    ctx.lineTo(this.points[0].x, this.points[0].y);
    ctx.strokeStyle = "blue";
    ctx.stroke();
    ctx.font = "15px arial";
    ctx.fillStyle = "red";
    for(let i = 0; i < this.points.length; i++) 
      ctx.fillText(`${i+1} point: {x: ${this.points[i].x}, y: ${this.points[i].y}}`, 50, 50 + i * 20);
  }

  getCenter() {
    let cx = ((this.points[0].x + this.points[2].x) / 2);
    let cy = ((this.points[0].y + this.points[2].y) / 2);
    return {x: cx, y: cy};
  }
}

function getCoordinates(event) {
  let rect = canvas.getBoundingClientRect();
  
  return { x: event.clientX - rect.left, y: event.clientY - rect.top};
}

function drawClickedCircles(points, ctx) {
  for(let point of points) {
    new Circle(point.x, point.y, circlePointsRadius, Math.PI * 2).render(ctx, "red");
  }
}

function reset() {
  parallgr.points.splice(0, parallgr.points.length);
  $(".alert").css("display", "none");
  resetCanvas();
}

function about() {
  $('#modalAbout').modal();
}

function setInfo() {
  document.getElementById("parallel_area").textContent = `Area of parallelogram: ${parseInt(parallgr.getArea())}`;
  document.getElementById("circle_area").textContent = `Area of circle: ${parseInt(mainCircle.getArea())}`;

  $(".alert").css("display", "block");
}

function resetCanvas() {
  ctx.fillStyle = '#6b6f75';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function redraw() {
  if(parallgr.points.length !== 4)
    return;

  resetCanvas();
  drawClickedCircles(parallgr.points, ctx);
  parallgr.render(ctx);
  let center = parallgr.getCenter();
  mainCircle = new Circle(center.x, center.y, Math.sqrt(parallgr.getArea() / Math.PI), Math.PI * 2);
  mainCircle.render(ctx, "yellow");
  setInfo();
}

function hitCircle(x, y, pointIndex) {
  let circle = parallgr.points[pointIndex];
  return Math.pow(circle.x - x, 2) +  Math.pow(circle.y - y, 2) <= Math.pow(circlePointsRadius, 2);
}

function handleMouseDown(event) {
  if(parallgr.points.length < 3) {
    let newCoord = parallgr.addPoint(getCoordinates(event));
    new Circle(newCoord.x, newCoord.y, 1, Math.PI *2).render(ctx, "white");
    redraw();
  }
  else {
    startDragCoord = getCoordinates(event);

    for (let i = 0; i < parallgr.points.length; i++) {
      if (hitCircle(startDragCoord.x, startDragCoord.y, i)) {
        selectedCircle = i;
      }
    }
    redraw();
  }

}

function handleMouseMove(event) {
  if (selectedCircle < 0)
    return;

  let coord = getCoordinates(event);

  let dx = coord.x - startDragCoord.x;
  let dy = coord.y - startDragCoord.y;

  startDragCoord.x = coord.x;
  startDragCoord.y = coord.y;

  var points = selectedCircle <= 1 ? [selectedCircle, selectedCircle + 2].map(x => parallgr.points[x]) : [selectedCircle, selectedCircle - 2].map(x => parallgr.points[x]);

  points[0].x += dx;
  points[0].y += dy;
  points[1].x -= dx;
  points[1].y -= dy;
  redraw();
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var parallgr = new Parallelogram([]);
var mainCircle = null;
const circlePointsRadius = 22;
var selectedCircle = -1;
var startDragCoord;

function main() {
  canvas.width = window.innerWidth;
  canvas.height = 700;
  resetCanvas();

  canvas.addEventListener('mousedown', event => handleMouseDown(event));
  canvas.addEventListener('mousemove', event => handleMouseMove(event));
  canvas.addEventListener('mouseup', () => {selectedCircle = -1;});
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = 700;
    redraw();
  });
  document.getElementById("reset").addEventListener('click', reset);
  document.getElementById("about").addEventListener('click', about);

  $(".alert").css("display", "none");
}

main()
