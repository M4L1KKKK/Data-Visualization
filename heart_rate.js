function HeartRate() {
  this.name = 'Live Heart Rate Graph';
  this.id = 'heart-rate-live';

  this.loaded = false;
  this.data = [];
  this.visiblePoints = 60; // show last 60 seconds
  this.currentIndex = 0;

  this.margin = 70;
  this.maxBPM = 120;
  this.minBPM = 50;

  this.preload = function () {
    var self = this;
    this.table = loadTable(
      './data/heart_rate/heart_rate_3min.csv',
      'csv',
      'header',
      function (table) {
        self.loaded = true;
        self.data = table.getRows();
      }
    );
  };

  this.setup = function () {
    frameRate(30);
  };

  this.destroy = function () {};

  this.draw = function () {
    if (!this.loaded || this.data.length === 0) {
      console.log('Heart rate data not yet loaded.');
      return;
    }

    background(10, 10, 20);

    var graphWidth = width - this.margin * 2;
    var graphHeight = height - this.margin * 2;

    // TITLE 
    textAlign(CENTER, TOP);
    textSize(20);
    fill(255);
    noStroke();
    text("Monitoring a patient's heart rate for 3 minutes", width / 2, 20);

    // Border
    noFill();
    stroke(255, 80);
    strokeWeight(1.5);
    rect(this.margin, this.margin, graphWidth, graphHeight);

    // Grid lines
    stroke(50);
    for (var y = this.minBPM; y <= this.maxBPM; y += 10) {
      var yPos = map(y, this.minBPM, this.maxBPM, graphHeight + this.margin, this.margin);
      line(this.margin, yPos, width - this.margin, yPos);
      noStroke();
      fill(180);
      textSize(12);
      textAlign(RIGHT, CENTER);
      text(y + ' bpm', this.margin - 10, yPos);
      stroke(50);
    }

    var startIndex = max(0, this.currentIndex - this.visiblePoints);
    var endIndex = min(this.data.length - 1, this.currentIndex);
    var xStep = graphWidth / this.visiblePoints;

    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(255, 0, 0);

    beginShape();
    for (var i = startIndex; i <= endIndex; i++) {
      var bpm = parseInt(this.data[i].get('bpm'));
      var x = this.margin + (i - startIndex) * xStep;
      var y = map(bpm, this.minBPM, this.maxBPM, graphHeight + this.margin, this.margin);
      curveVertex(x, y);
    }
    endShape();

    drawingContext.shadowBlur = 0;

    if (endIndex > startIndex) {
      var bpm = parseInt(this.data[endIndex].get('bpm'));
      var x = this.margin + (endIndex - startIndex) * xStep;
      var y = map(bpm, this.minBPM, this.maxBPM, graphHeight + this.margin, this.margin);
      fill(255, 0, 0, 180);
      noStroke();
      ellipse(x, y, 12 + sin(frameCount * 0.3) * 3);
    }

    if (endIndex > startIndex) {
      var x = this.margin + (endIndex - startIndex) * xStep;
      stroke(255, 50);
      line(x, this.margin, x, this.margin + graphHeight);
    }

    // Interactive tooltip
    for (var i = startIndex; i <= endIndex; i++) {
      var bpm = parseInt(this.data[i].get('bpm'));
      var x = this.margin + (i - startIndex) * xStep;
      var y = map(bpm, this.minBPM, this.maxBPM, graphHeight + this.margin, this.margin);

      if (dist(mouseX, mouseY, x, y) < 8) {
        fill(0, 0, 0, 200);
        stroke(255);
        strokeWeight(1);
        rectMode(CORNER);
        rect(x + 10, y - 30, 120, 40, 5);

        noStroke();
        fill(255);
        textAlign(LEFT, TOP);
        textSize(12);
        var timestamp = this.data[i].get('timestamp');
        text('BPM: ' + bpm, x + 15, y - 28);
        text('Time: ' + timestamp, x + 15, y - 12);

        fill(255, 0, 0);
        noStroke();
        ellipse(x, y, 8);
      }
    }

    // Advance
    if (frameCount % 30 === 0 && this.currentIndex < this.data.length - 1) {
      this.currentIndex++;
    }
  };
}
