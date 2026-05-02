function PayGapTimeSeries() {
  this.name = 'Pay gap: 1997-2017';
  this.id = 'pay-gap-timeseries';
  this.title = 'Gender Pay Gap: Average difference between male and female pay.';
  this.xAxisLabel = 'year';
  this.yAxisLabel = '%';
  this.dotSize = 10;

  var marginSize = 35;
  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,
    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },
    grid: true,
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  this.loaded = false;

  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/pay-gap/all-employees-hourly-pay-by-gender-1997-2017.csv',
      'csv',
      'header',
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    textSize(16);
    this.startYear = this.data.getNum(0, 'year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
    this.minPayGap = 0;
    this.maxPayGap = max(this.data.getColumn('pay_gap'));
  };

  this.destroy = function () {};

  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    background(darkMode ? 20 : 255);
    this.drawTitle();

    drawYAxisTickLabels(
      this.minPayGap,
      this.maxPayGap,
      this.layout,
      this.mapPayGapToHeight.bind(this),
      0
    );
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    var previous;
    var numYears = this.endYear - this.startYear;
    var hoveredPoint = null;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var current = {
        year: this.data.getNum(i, 'year'),
        payGap: this.data.getNum(i, 'pay_gap'),
      };

      let x = this.mapYearToWidth(current.year);
      let y = this.mapPayGapToHeight(current.payGap);

      // Draw smooth line
      if (previous != null) {
        strokeWeight(2);
        stroke(100, 100, 255, 180);
        line(
          this.mapYearToWidth(previous.year),
          this.mapPayGapToHeight(previous.payGap),
          x,
          y
        );
      }

      // Hover interaction detection
      let d = dist(mouseX, mouseY, x, y);
      if (d < this.dotSize) {
        hoveredPoint = current;
      }

      // Glowing dot
      noStroke();
      fill(255, 0, 255, 180);
      ellipse(x, y, this.dotSize * 1.2);

      // Soft glow
      fill(255, 0, 255, 50);
      ellipse(x, y, this.dotSize * 2.5);

      // Vertical guide line
      stroke(200, 200, 200, 60);
      strokeWeight(1);
      line(x, this.layout.bottomMargin, x, this.layout.topMargin);

      previous = current;

      // X-axis ticks
      var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);
      if (i % xLabelSkip == 0) {
        drawXAxisTickLabel(
          current.year,
          this.layout,
          this.mapYearToWidth.bind(this)
        );
      }
    }

    // Tooltip
    if (hoveredPoint) {
      this.drawTooltip(hoveredPoint);
    }
  };

  this.drawTooltip = function (point) {
    let x = this.mapYearToWidth(point.year);
    let y = this.mapPayGapToHeight(point.payGap);
    let boxW = 140;
    let boxH = 50;

    fill(0, 0, 0, 180);
    stroke(255);
    rect(x + 10, y - boxH - 10, boxW, boxH, 8);

    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(12);
    text('Year: ' + point.year, x + 18, y - boxH + 2);
    text('Pay Gap: ' + nf(point.payGap, 1, 2) + '%', x + 18, y - boxH + 20);
  };

  this.drawTitle = function () {
    fill(darkMode ? 255 : 0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(
      this.title,
      this.layout.leftMargin + this.layout.plotWidth() / 2,
      this.layout.topMargin - this.layout.marginSize / 2
    );
  };

  this.mapYearToWidth = function (value) {
    return map(
      value,
      this.startYear,
      this.endYear,
      this.layout.leftMargin,
      this.layout.rightMargin
    );
  };

  this.mapPayGapToHeight = function (value) {
    return map(
      value,
      this.minPayGap,
      this.maxPayGap,
      this.layout.bottomMargin,
      this.layout.topMargin
    );
  };
}
