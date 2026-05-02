function TumorResponse() {
  this.name = 'Tumor Response by Week';
  this.id = 'tumor-response';
  this.loaded = false;

  // animation
  this.currentWeek = 0;        
  this.revealSpeed = 1;         

  // layout
  this.margin = { left: 80, right: 40, top: 60, bottom: 70 };
  this.yMin = -90;   // % change from baseline
  this.yMax = 80;

  // colors
  this.colComplete = color(40, 180, 60);   // green
  this.colPartial  = color(245, 180, 35);  // yellow
  this.colProg     = color(220, 50, 50);   // red

  this.series = { weeks: [], complete: [], partial: [], progressive: [] };

  this.preload = function () {
    var self = this;
    this.table = loadTable(
      './data/tumor_response/tumor_response.csv',
      'csv', 'header',
      function (t) {
        // parse
        for (var i = 0; i < t.getRowCount(); i++) {
          var r = t.getRow(i);
          self.series.weeks.push(int(r.get('week')));
          self.series.complete.push(float(r.get('complete')));
          self.series.partial.push(float(r.get('partial')));
          self.series.progressive.push(float(r.get('progressive')));
        }
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    frameRate(30);
    textFont('Helvetica');
  };

  this.destroy = function () {};

  this.xScale = function (w) {
    var w0 = 0;
    var w1 = this.series.weeks[this.series.weeks.length - 1] || 60;
    var x0 = this.margin.left;
    var x1 = width - this.margin.right;
    return map(w, w0, w1, x0, x1);
  };

  this.yScale = function (val) {
    var y0 = height - this.margin.bottom;
    var y1 = this.margin.top;
    return map(val, this.yMin, this.yMax, y0, y1);
  };

  this.drawAxes = function () {
    var axisCol = darkMode ? 160 : 60;
    var gridCol = darkMode ? 60 : 220;

    // base
    stroke(axisCol);
    strokeWeight(1);
    line(this.margin.left, this.margin.top, this.margin.left, height - this.margin.bottom);
    line(this.margin.left, height - this.margin.bottom, width - this.margin.right, height - this.margin.bottom);

    // ticks & grid
    var yStep = 20;
    textSize(12);
    textAlign(RIGHT, CENTER);
    for (var y = this.yMin; y <= this.yMax; y += yStep) {
      var yy = this.yScale(y);
      stroke(gridCol);
      if (y !== 0) line(this.margin.left, yy, width - this.margin.right, yy);
      noStroke();
      fill(darkMode ? 220 : 40);
      text(y + ' %', this.margin.left - 10, yy);
    }

    // x ticks (weeks)
    var maxW = this.series.weeks[this.series.weeks.length - 1] || 60;
    textAlign(CENTER, TOP);
    for (var w = 0; w <= maxW; w += 10) {
      var xx = this.xScale(w);
      stroke(gridCol);
      line(xx, this.margin.top, xx, height - this.margin.bottom);
      noStroke();
      fill(darkMode ? 220 : 40);
      text(w, xx, height - this.margin.bottom + 8);
    }

    // axis labels + title
    noStroke();
    fill(darkMode ? 255 : 0);
    textAlign(CENTER, TOP);
    textSize(20);
    text('Tumor Response by Week', width / 2, 20);

    textSize(14);
    textAlign(CENTER, TOP);
    text('Week', width / 2, height - this.margin.bottom + 34);

    push();
    translate(this.margin.left - 50, height / 2);
    rotate(-HALF_PI);
    textAlign(CENTER, CENTER);
    text('Change From Baseline, %', 0, 0);
    pop();

    // baseline (0%)
    stroke(darkMode ? 180 : 120);
    strokeWeight(1.2);
    drawingContext.setLineDash([6, 6]);
    line(this.margin.left, this.yScale(0), width - this.margin.right, this.yScale(0));
    drawingContext.setLineDash([]);
  };

  this.drawLegend = function () {
  var x = width - this.margin.right - 180;
  var y = this.margin.top - 50;
  var sw = 14;   // square size
  var gapY = 24; // vertical spacing between entries
  var padding = 10;
  var legendW = 170;
  var legendH = gapY * 3 + padding * 2 - 6; // 3 items

  // background
  noStroke();
  fill(darkMode ? 30 : 255);
  rect(x - padding, y - padding, legendW, legendH, 6);

  // border
  stroke(darkMode ? 120 : 180);
  noFill();
  rect(x - padding, y - padding, legendW, legendH, 6);

  // entries
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(12);
  fill(this.colComplete);
  rect(x, y, sw, sw, 3);
  fill(darkMode ? 230 : 30);
  text('Complete Response', x + sw + 8, y + sw / 2);

  fill(this.colPartial);
  rect(x, y + gapY, sw, sw, 3);
  fill(darkMode ? 230 : 30);
  text('Partial Response', x + sw + 8, y + gapY + sw / 2);

  fill(this.colProg);
  rect(x, y + gapY * 2, sw, sw, 3);
  fill(darkMode ? 230 : 30);
  text('Progressive Disease', x + sw + 8, y + gapY * 2 + sw / 2);
};


  this.drawSeries = function (label, arr, col) {
    var maxWeekIndex = 0;
    while (maxWeekIndex < this.series.weeks.length &&
           this.series.weeks[maxWeekIndex] <= this.currentWeek) {
      maxWeekIndex++;
    }
    if (maxWeekIndex < 2) return;

    stroke(col);
    strokeWeight(2.5);
    noFill();
    beginShape();
    for (var i = 0; i < maxWeekIndex; i++) {
      var w = this.series.weeks[i];
      var x = this.xScale(w);
      var y = this.yScale(arr[i]);
      vertex(x, y);
    }
    endShape();

    // points + hover tooltip
    var hoverIndex = -1;
    for (var j = 0; j < maxWeekIndex; j++) {
      var w2 = this.series.weeks[j];
      var x2 = this.xScale(w2);
      var y2 = this.yScale(arr[j]);
      noStroke();
      fill(col);
      ellipse(x2, y2, 6, 6);

      if (dist(mouseX, mouseY, x2, y2) < 8) hoverIndex = j;
    }

    if (hoverIndex >= 0) {
      var w3 = this.series.weeks[hoverIndex];
      var x3 = this.xScale(w3);
      var y3 = this.yScale(arr[hoverIndex]);

      // tooltip
      var boxW = 150, boxH = 48, bx = x3 + 12, by = y3 - boxH - 8;
      if (bx + boxW > width - this.margin.right) bx = x3 - boxW - 12;
      if (by < this.margin.top) by = y3 + 12;

      noStroke();
      fill(0, 0, 0, 200);
      rect(bx, by, boxW, boxH, 6);

      fill(255);
      textAlign(LEFT, TOP);
      textSize(12);
      text(label, bx + 8, by + 6);
      text('Week: ' + w3, bx + 8, by + 22);
      text('Change: ' + nf(arr[hoverIndex], 1, 1) + '%', bx + 8, by + 36);
    }
  };

  this.draw = function () {
    if (!this.loaded) {
      background(darkMode ? 20 : 245);
      fill(darkMode ? 255 : 0);
      textAlign(CENTER, CENTER);
      textSize(16);
      text('Loading tumor response data...', width / 2, height / 2);
      return;
    }

    background(darkMode ? 12 : 250);

    this.drawAxes();

    // series lines (order = green, yellow, red)
    this.drawSeries('Complete Response', this.series.complete, this.colComplete);
    this.drawSeries('Partial Response',  this.series.partial,  this.colPartial);
    this.drawSeries('Progressive Disease', this.series.progressive, this.colProg);

    this.drawLegend();

    // footer note
    noStroke();
    fill(darkMode ? 170 : 90);
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text('Dotted line shows baseline (0%). Values are percent change from baseline.', this.margin.left, height - 16);

    // advance animation
    if (frameCount % int(30 / max(0.01, this.revealSpeed)) === 0) {
      var lastWeek = this.series.weeks[this.series.weeks.length - 1] || 60;
      if (this.currentWeek < lastWeek) this.currentWeek++;
    }
  };
}
