function TechDiversityRace() {
  this.name = 'Tech Diversity: Race';
  this.id = 'tech-diversity-race';
  this.loaded = false;

  this.canvasWidth = 1024;
  this.canvasHeight = 576;
  this.centerX = this.canvasWidth / 2;
  this.centerY = this.canvasHeight / 2;

  this.bubbles = [];
  this.breathing = 0;
  this.breathingSpeed = 0.02;

  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/tech-diversity/race-2018.csv',
      'csv',
      'header',
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.select = createSelect();
    this.select.position(500, 10);

    for (var i = 1; i < this.data.getColumnCount(); i++) {
      this.select.option(this.data.columns[i]);
    }

    this.select.selected(this.data.columns[1]);
    this.select.changed(() => this.draw());

    // Create floating bubbles
    for (var i = 0; i < 50; i++) {
      this.bubbles.push({
        x: random(this.canvasWidth),
        y: random(this.canvasHeight),
        r: random(5, 25),
        speed: random(0.2, 1),
        alpha: random(50, 150)
      });
    }

    this.pie = new PieChart(this.canvasWidth / 2 - 570, this.canvasHeight / 2 - 240, this.canvasWidth * 0.4);
  };

  this.destroy = function () {
    this.select.remove();
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    background(darkMode ? 20 : 245);
    this.drawBackground();

    this.breathing += this.breathingSpeed;
    var pulse = 1 + 0.03 * sin(this.breathing);

    var companyName = this.select.value();
    var col = stringsToNumbers(this.data.getColumn(companyName));
    var labels = this.data.getColumn(0);
    var colours = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9B59B6', '#F39C12'];
    var title = 'Employee Diversity at ' + companyName;

    push();
    translate(this.centerX, this.centerY);
    scale(pulse);
    this.pie.draw(col, labels, colours, title);
    pop();
  };

  this.drawBackground = function () {
    noStroke();
    for (var i = 0; i < this.bubbles.length; i++) {
      var b = this.bubbles[i];
      fill(200, 200, 255, b.alpha);
      ellipse(b.x, b.y, b.r);

      b.y -= b.speed;
      if (b.y < -b.r) {
        b.y = this.canvasHeight + b.r;
        b.x = random(this.canvasWidth);
      }
    }
  };
}
