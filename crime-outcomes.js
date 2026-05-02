function CrimeOutcomes() {
  this.name = 'London Crime Outcomes';
  this.id = 'crime-outcomes';
  this.data = [];
  this.crimeCounts = {};
  this.outcomeCounts = {};
  this.width = 1024;
  this.height = 576;
  this.margin = 50;

  this.crimeColors = ['#ff4b5c', '#4b8bbe', '#4daf4a', '#a64ca6', '#ff914d'];
  this.outcomeColors = ['#6ec6ff', '#2979ff', '#81c784', '#388e3c'];

  this.loaded = false;
  this.animationProgress = 0;
  this.stars = [];

  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/crime-type-and-outcome/crime-outcomes.csv',
      'csv',
      'header',
      function (table) {
        self.loaded = true;
        self.processData(table);
      }
    );
  };

  this.setup = function () {
    for (var i = 0; i < 200; i++) {
      this.stars.push({
        x: random(width),
        y: random(height),
        speed: random(0.1, 0.5),
        size: random(1, 2),
        alpha: random(50, 200)
      });
    }
  };

  this.processData = function (table) {
    this.crimeCounts = {};
    this.outcomeCounts = {};

    for (var i = 0; i < table.getRowCount(); i++) {
      var row = table.getRow(i);
      var crimeType = row.get('Crime Type').trim();
      var outcome = row.get('Outcome type').trim();

      if (outcome.includes('Investigation compvare')) {
        outcome = 'No suspect identified';
      } else if (outcome.includes('Unable to prosecute')) {
        outcome = 'Unable to prosecute';
      }

      this.crimeCounts[crimeType] = (this.crimeCounts[crimeType] || 0) + 1;
      this.outcomeCounts[outcome] = (this.outcomeCounts[outcome] || 0) + 1;
    }
  };

  this.draw = function () {
    if (!this.loaded) {
      this.drawLoading();
      return;
    }

    this.drawGalaxyBackground();
    this.animationProgress = min(this.animationProgress + 0.02, 1);

    this.drawChart(
      this.crimeCounts,
      "Crime Type Frequency - May 2022",
      "Crime Types",
      "Number of Incidents",
      50, 50, 400, 300,
      this.crimeColors
    );

    this.drawChart(
      this.outcomeCounts,
      "Investigation Outcomes - May 2022",
      "Outcome Types",
      "Number of Cases",
      550, 50, 400, 300,
      this.outcomeColors
    );

    this.drawSummary();
  };

  this.drawLoading = function () {
    background(0);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Loading crime data...", width / 2, height / 2);
  };

  this.drawGalaxyBackground = function () {
    background(10, 10, 30);
    noStroke();
    for (let s of this.stars) {
      fill(255, s.alpha);
      ellipse(s.x, s.y, s.size, s.size);
      s.y += s.speed;
      if (s.y > height) {
        s.y = 0;
        s.x = random(width);
      }
    }
  };

  this.drawChart = function (data, title, xLabel, yLabel, x, y, w, h, colors) {
    fill(0, 50);
    stroke(100);
    rect(x, y, w, h, 5);

    var labels = Object.keys(data);
    var values = Object.values(data);
    var maxValue = max(values);
    var barWidth = w / (labels.length * 1.5);
    var textCol = 255;

    for (var i = 0; i < labels.length; i++) {
      var rawHeight = map(values[i], 0, maxValue, 0, h * 0.8);
      var barHeight = rawHeight * this.animationProgress + sin(frameCount * 0.05 + i) * 5;
      var barX = x + (i + 0.25) * w / labels.length;
      var barY = y + h - barHeight - 20;

      fill(colors[i % colors.length]);
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = colors[i % colors.length];
      rect(barX, barY, barWidth, barHeight);
      drawingContext.shadowBlur = 0;

      fill(textCol);
      noStroke();
      textSize(10);
      textAlign(CENTER);
      text(values[i], barX + barWidth / 2, barY - 5);

      push();
      translate(barX + barWidth / 2, y + h - 5);
      rotate(-PI / 6);
      textAlign(LEFT);
      text(labels[i], 0, 0);
      pop();
    }

    fill(textCol);
    textSize(14);
    textAlign(CENTER);
    text(title, x + w / 2, y - 10);

    textSize(12);
    text(xLabel, x + w / 2, y + h + 30);

    push();
    translate(x - 30, y + h / 2);
    rotate(-HALF_PI);
    textSize(12);
    textAlign(CENTER);
    text(yLabel, 0, 0);
    pop();
  };

  this.drawSummary = function () {
    var totalCases = 0, murderCases = 0, solvedCases = 0;

    for (var crime in this.crimeCounts) {
      totalCases += this.crimeCounts[crime];
      if (crime === "Murder") {
        murderCases = this.crimeCounts[crime];
      }
    }

    for (var outcome in this.outcomeCounts) {
      if (outcome === "Suspect charged") {
        solvedCases = this.outcomeCounts[outcome];
      }
    }

    var solveRate = (solvedCases / totalCases * 100).toFixed(1);

    var maxCrime = { name: "", count: 0 };
    for (var crime in this.crimeCounts) {
      if (this.crimeCounts[crime] > maxCrime.count) {
        maxCrime = { name: crime, count: this.crimeCounts[crime] };
      }
    }

    fill(255);
    textSize(14);
    textAlign(LEFT);
    text(`Total Cases: ${totalCases}`, 50, 400);
    text(`Murder Cases: ${murderCases} (${(murderCases / totalCases * 100).toFixed(1)}%)`, 50, 420);
    text(`Solved Cases: ${solvedCases} (${solveRate}%)`, 50, 440);
    text(`Most Common Crime: ${maxCrime.name} (${maxCrime.count} cases)`, 50, 460);

    var maxOutcome = { name: "", count: 0 };
    for (var outcome in this.outcomeCounts) {
      if (this.outcomeCounts[outcome] > maxOutcome.count) {
        maxOutcome = { name: outcome, count: this.outcomeCounts[outcome] };
      }
    }
    text(`Most Common Outcome: ${maxOutcome.name}`, 50, 480);
  };
}
