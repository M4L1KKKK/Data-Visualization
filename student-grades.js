function Grades() {
  this.name = 'University Student Grades ';
  this.id = 'student-grades';
  this.loaded = false;
  this.loadError = false;

  // 🔁 Interaction state
  this.rotation = 0;
  this.autoSpin = false;
  this.isDragging = false;
  this.lastMouseAngle = null;

  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/student-grades/student-grades.csv',
      'csv',
      'header',
      function () {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    if (this.loadError) return this.showLoadError();
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    var fillColor   = color(54, 162, 235, 90); // semi-transparent fill for glow
    var strokeColor = color(54, 162, 235);
    var textColor   = darkMode ? color(255) : color(0);

    this.colors = { fill: fillColor, stroke: strokeColor, text: textColor };

    this.radar = new RadarChart(width / 2, height / 2, min(width, height) * 0.4);
    this.processData();

    // 🖱️ Mouse handlers for rotation
    let self = this;
    window.mousePressed = function () {
      // Start drag only if inside chart area
      let dx = mouseX - width / 2;
      let dy = mouseY - height / 2;
      if (dx * dx + dy * dy <= self.radar.radius * self.radar.radius * 1.5) {
        self.isDragging = true;
        self.lastMouseAngle = atan2(dy, dx);
      }
    };
    window.mouseReleased = function () {
      self.isDragging = false;
      self.lastMouseAngle = null;
    };

    // ⌨️ Toggle auto spin
    window.keyPressed = function () {
      if (key === 'S' || key === 's') self.autoSpin = !self.autoSpin;
    };
  };

  this.showLoadError = function () {
    background(darkMode ? 20 : 240);
    fill(200, 0, 0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text('Error: Could not load student-grades.csv file', width / 2, height / 2);
    text('Make sure the file exists in the data folder', width / 2, height / 2 + 30);
  };

  this.processData = function () {
    this.labels = [];
    this.values = [];
    this.maxValues = [];

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      var label = row.getString('Grades and Performance');
      var value = row.getString('Achieved').trim();
      var maxMatch = label.match(/\((\d+)-(\d+)\)/);
      var maxValue = maxMatch ? parseInt(maxMatch[2]) : 100;

      this.labels.push(label.split('(')[0].trim());
      this.values.push(parseFloat(value));
      this.maxValues.push(maxValue);
    }
  };

  this.draw = function () {
    if (!this.loaded || this.loadError) return;

    background(darkMode ? 20 : 245);

    // ✨ Static subtle rings (no breathing)
    noFill();
    stroke(darkMode ? 60 : 230);
    strokeWeight(1);
    for (var i = 1; i <= 4; i++) {
      ellipse(width / 2, height / 2, (i * this.radar.radius * 0.5) * 2);
    }

    // 🔁 Update rotation (drag or auto)
    if (this.isDragging) {
      let dx = mouseX - width / 2;
      let dy = mouseY - height / 2;
      let ang = atan2(dy, dx);
      if (this.lastMouseAngle != null) {
        this.rotation += ang - this.lastMouseAngle;
      }
      this.lastMouseAngle = ang;
    } else if (this.autoSpin) {
      this.rotation += 0.005; // slow, smooth spin
    }

    push();
    translate(width / 2, height / 2);
    rotate(this.rotation);
    this.radar.draw(this.labels, this.values, this.maxValues, this.colors);
    pop();

    // 🛈 Tiny hint
    push();
    noStroke();
    fill(darkMode ? 180 : 80);
    textAlign(CENTER);
    textSize(12);
    text('Drag to rotate • Press S to toggle auto-spin', width / 2, height - 16);
    pop();
  };
}

// 🌈 Shiny Radar Chart (no breathing, no reveal growth)
function RadarChart(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;

  this.draw = function (labels, values, maxValues, colors) {
    push();
    translate(0, 0);

    var numItems = labels.length;
    var angle = TWO_PI / numItems;

    // Grid circles (static)
    noFill();
    stroke(darkMode ? 90 : 210);
    strokeWeight(1);
    for (var r = this.radius / 5; r <= this.radius; r += this.radius / 5) {
      ellipse(0, 0, r * 2);
    }

    // Axis lines
    stroke(darkMode ? 120 : 160);
    for (var i = 0; i < numItems; i++) {
      var a = i * angle - HALF_PI;
      line(0, 0, cos(a) * this.radius, sin(a) * this.radius);
    }

    // Data polygon (full size, no reveal)
    // 🔆 Make it shiny: glow + additive blend + white highlight
    let ctx = drawingContext;
    push();
    blendMode(ADD);
    ctx.shadowBlur = 28;
    ctx.shadowColor = 'rgba(54,162,235,0.85)';

    // Base filled polygon with glow
    fill(colors.fill);
    stroke(colors.stroke);
    strokeWeight(2);
    beginShape();
    for (var j = 0; j < numItems; j++) {
      var aj = j * angle - HALF_PI;
      var ratio = constrain(values[j] / maxValues[j], 0, 1);
      var rj = ratio * this.radius;
      vertex(cos(aj) * rj, sin(aj) * rj);
    }
    endShape(CLOSE);

    // Thin white edge highlight for extra “shine”
    stroke(255, 220);
    strokeWeight(1);
    noFill();
    beginShape();
    for (var k = 0; k < numItems; k++) {
      var ak = k * angle - HALF_PI;
      var rk = constrain(values[k] / maxValues[k], 0, 1) * this.radius;
      vertex(cos(ak) * rk, sin(ak) * rk);
    }
    endShape(CLOSE);
    pop();

    // Vertex dots with glow
    push();
    blendMode(ADD);
    noStroke();
    ctx.shadowBlur = 16;
    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    fill(255, 240);
    for (var p = 0; p < numItems; p++) {
      var ap = p * angle - HALF_PI;
      var rp = constrain(values[p] / maxValues[p], 0, 1) * this.radius;
      circle(cos(ap) * rp, sin(ap) * rp, 6);
    }
    pop();

    // Labels
    textSize(12);
    fill(colors.text);
    noStroke();
    for (var i = 0; i < numItems; i++) {
      var a = i * angle - HALF_PI;
      var r = this.radius * 1.1;
      var lx = cos(a) * r;
      var ly = sin(a) * r;

      if (abs(lx) > abs(ly)) {
        textAlign(lx > 0 ? LEFT : RIGHT, CENTER);
      } else {
        textAlign(CENTER, ly > 0 ? TOP : BOTTOM);
      }
      text(labels[i] + '\n' + values[i] + '/' + maxValues[i], lx, ly);
    }

    pop();
  };
}
