function CovidVaccination() {
  this.name = 'Pakistan COVID Vaccination Data';
  this.id = 'covid-vaccination';
  this.loaded = false;
  this.loadError = false;

  this.gridSize = 10;
  this.squareSize = 25;
  this.padding = 2;
  this.breathing = 0;
  this.breathingSpeed = 0.03;

  this.colors = {
    none: color(255, 99, 132),
    single: color(54, 162, 235),
    double: color(75, 192, 192),
    booster: color(153, 102, 255)
  };

  this.preload = function () {
    var self = this;
    this.data = loadTable(
      'data/covid-vaccination/covid-vaccination.csv',
      'csv',
      'header',
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    if (this.loadError) {
      this.showLoadError();
      return;
    }

    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.processData();

    // Galaxy star setup
    this.stars = [];
    for (var i = 0; i < 150; i++) {
      this.stars.push({
        x: random(width),
        y: random(height),
        size: random(0.5, 2.5),
        brightness: random(100, 255),
        twinkleSpeed: random(0.01, 0.05),
        phase: random(TWO_PI)
      });
    }

    this.shootingStar = null;
  };

  this.processData = function () {
    this.vaccinationData = {};

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      var type = row.getString('Vaccination').trim();
      var percentage = parseInt(row.getString('Percentage').replace('%', '').trim());

      var key = type.includes('No') ? 'none' :
        type.includes('Single') ? 'single' :
          type.includes('Two') ? 'double' : 'booster';

      this.vaccinationData[key] = percentage;
    }
  };

  this.draw = function () {
    if (this.loadError || !this.loaded) return;

    this.drawGalaxyBackground();

    // Animate breathing
    this.breathing += this.breathingSpeed;
    var scaleFactor = 1 + 0.02 * sin(this.breathing);

    push();
    translate(width / 2, height / 2);
    scale(scaleFactor);
    this.drawWaffleChart();
    pop();

    this.drawLegend();
  };

  this.drawGalaxyBackground = function () {
    this.drawGalaxyBackground = function () {
     if (!this.stars) return; // Prevent error if stars aren't initialized yet

    var driftX = sin(frameCount * 0.001) * 10;
    var driftY = cos(frameCount * 0.0015) * 5;

    background(5, 5, 20);
    noStroke();
    for (var i = 0; i < this.stars.length; i++) {
      var star = this.stars[i];
      var twinkle = sin(frameCount * star.twinkleSpeed + star.phase);
      var alpha = map(twinkle, -1, 1, 100, star.brightness);

      var zoom = 1 + 0.001 * sin(frameCount * 0.002);
      var starX = star.x * zoom + driftX;
      var starY = star.y * zoom + driftY;

      fill(255, alpha);
      ellipse(starX, starY, star.size);
    }
    }

    // Nebula clouds
    for (var j = 0; j < 5; j++) {
      var cx = width / 2 + 200 * sin(frameCount * 0.001 + j);
      var cy = height / 2 + 150 * cos(frameCount * 0.0015 + j);
      var r = 200 + 20 * sin(frameCount * 0.002 + j);
      var fade = 20 + 10 * sin(frameCount * 0.005 + j);

      fill(150, 50, 200, fade);
      ellipse(cx, cy, r, r * 0.7);
    }

    // Shooting star logic
    if (frameCount % 300 === 0) {
      this.shootingStar = {
        x: random(width),
        y: random(height / 2),
        dx: random(5, 10),
        dy: random(1, 3),
        life: 60
      };
    }

    if (this.shootingStar && this.shootingStar.life > 0) {
      var s = this.shootingStar;
      stroke(255, 255, 255, s.life * 4);
      strokeWeight(2);
      line(s.x, s.y, s.x - 10, s.y - 5);
      noStroke();

      s.x += s.dx;
      s.y += s.dy;
      s.life--;
    }
  };

  this.drawWaffleChart = function () {
    push();
    translate(-this.gridSize * this.squareSize / 4,
      -this.gridSize * this.squareSize / 2);

    var count = 0;
    var thresholds = {
      none: this.vaccinationData.none,
      single: this.vaccinationData.none + this.vaccinationData.single,
      double: this.vaccinationData.none + this.vaccinationData.single + this.vaccinationData.double
    };

    for (var y = 0; y < this.gridSize; y++) {
      for (var x = 0; x < this.gridSize; x++) {
        count++;

        var fillColor;
        if (count <= thresholds.none) {
          fillColor = this.colors.none;
        } else if (count <= thresholds.single) {
          fillColor = this.colors.single;
        } else if (count <= thresholds.double) {
          fillColor = this.colors.double;
        } else {
          fillColor = this.colors.booster;
        }

        fill(fillColor);
        noStroke();
        rect(x * this.squareSize, y * this.squareSize,
          this.squareSize - this.padding, this.squareSize - this.padding, 2);
      }
    }
    pop();
  };

  this.drawLegend = function () {
    push();
    var legendX = 50;
    var legendY = height / 2 - 80;
    var itemSpacing = 30;
    var squareSize = 18;
    var textOffset = 30;

    textAlign(LEFT, CENTER);
    textSize(14);
    textStyle(BOLD);
    fill(255);
    text('Vaccination Status:', legendX, legendY);
    textStyle(NORMAL);

    var entries = [
      { key: 'none', label: 'No dose' },
      { key: 'single', label: 'Single dose' },
      { key: 'double', label: 'Two doses' },
      { key: 'booster', label: 'Booster dose' },
    ];

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var y = legendY + itemSpacing * (i + 1);

      fill(this.colors[entry.key]);
      stroke(255);
      rect(legendX, y, squareSize, squareSize, 3);

      noStroke();
      fill(255);
      textAlign(LEFT, CENTER);
      text(`${entry.label}: ${this.vaccinationData[entry.key]}%`, legendX + textOffset, y + squareSize / 2);
    }

    pop();
  };
}
