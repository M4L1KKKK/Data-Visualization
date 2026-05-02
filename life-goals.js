function LifeGoals() {
  this.name = 'Life Goals';
  this.id = 'life-goals';
  this.loaded = false;
  this.breathing = 0;
  this.breathingSpeed = 0.03;
  this.rotation = 0; 


  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/life-goals/life-goals.csv', 'csv', 'header',
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

    this.colors = [
      color(255, 99, 132),
      color(54, 162, 235),
      color(75, 192, 192),
      color(255, 206, 86),
      color(153, 102, 255),
      color(255, 159, 64)
    ];

    this.sunburst = new SunburstChart(width / 2, height / 2, width * 0.4);
    this.processData();
  };

  this.destroy = function () {
    if (this.title) this.title.remove();
  };

  this.processData = function () {
    this.categories = [];

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      var category = row.getString('My Goals');
      var goalsStr = row.getString('What to achieve in it');

      var goals = goalsStr
        ? goalsStr.split('/').map(function (g) { return g.trim(); }).filter(function (g) { return g.length > 0; })
        : [];

      this.categories.push({
        name: category,
        goals: goals,
        color: this.colors[i % this.colors.length]
      });
    }
  };

  this.draw = function () {
  if (!this.loaded) {
    console.log('Data not yet loaded');
    return;
  }

  this.breathing += this.breathingSpeed;
  this.rotation += 0.003; // 🔄 slowly rotate
  var scaleFactor = 1 + 0.008 * Math.sin(this.breathing); // breathing effect

  background(darkMode ? 20 : 245);

  push();
  translate(width / 2, height / 2); // must add for rotation to center
  rotate(this.rotation);            
  scale(scaleFactor);
  this.sunburst.draw(this.categories, frameCount);
  pop();
};
}

// 🌈 Sunburst Chart
function SunburstChart(x, y, diameter) {
  this.x = x;
  this.y = y;
  this.innerDiameter = diameter;
  this.outerDiameter = diameter * 1.35;

  this.draw = function (categories, frameCount) {
    push();
    angleMode(RADIANS);
    textAlign(CENTER, CENTER);
    noStroke();

    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(255, 255, 255, 60); // glow

    var bgText = darkMode ? 255 : 0;
    var categoryAngle = TWO_PI / categories.length;

    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      var startAngle = i * categoryAngle;
      var endAngle = (i + 1) * categoryAngle;

      // Main arc (category)
      fill(category.color);
      arc(0, 0, this.innerDiameter, this.innerDiameter, startAngle, endAngle, PIE);

      // Subgoals (outer ring)
      if (category.goals.length > 0) {
        var goalAngle = categoryAngle / category.goals.length;
        for (var j = 0; j < category.goals.length; j++) {
          var goalStart = startAngle + j * goalAngle;
          var goalEnd = goalStart + goalAngle;

          var pulse = 0.7 + 0.3 * Math.sin(frameCount * 0.05 + j);
          fill(
            red(category.color) * pulse,
            green(category.color) * pulse,
            blue(category.color) * pulse
          );
          arc(0, 0, this.outerDiameter, this.outerDiameter, goalStart, goalEnd, PIE);

          // Subgoal label
          var midAngle = (goalStart + goalEnd) / 2;
          var labelRadius = this.outerDiameter * 0.36;
          var tx = Math.cos(midAngle) * labelRadius;
          var ty = Math.sin(midAngle) * labelRadius;

          push();
          translate(tx, ty);
          if (midAngle > HALF_PI && midAngle < 3 * HALF_PI) {
            rotate(midAngle + PI);
          } else {
            rotate(midAngle);
          }

          fill(bgText);
          textSize(10);
          textAlign(CENTER, CENTER);
          textLeading(10);
          text(category.goals[j], 0, 0, 65);
          pop();
        }
      }

      // Category label
      var midCatAngle = (startAngle + endAngle) / 2;
      var labelRadius = this.innerDiameter * 0.3;
      var tx = Math.cos(midCatAngle) * labelRadius;
      var ty = Math.sin(midCatAngle) * labelRadius;
      fill(bgText);
      textSize(10);
      text(category.name, tx, ty);
    }

    // 🎯 Center circle
    fill(darkMode ? 255 : 255);
    ellipse(0, 0, this.innerDiameter * 0.5);

    // 🎯 Center text
    fill(darkMode ? 0 : 0);
    textSize(14);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Life Goals of an", 0, -5);
    text("average group of teenagers", 0, 15);

    pop();
  };
}
