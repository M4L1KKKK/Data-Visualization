function ClimateChange() {
  this.name = 'Climate Change';
  this.id = 'climate-change';

  this.xAxisLabel = 'Year';
  this.yAxisLabel = '°C';

  const marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,
    grid: false,
    numXTickLabels: 8,
    numYTickLabels: 8,
    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    }
  };

  this.loaded = false;
  this.snowflakes = [];

  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/surface-temperature/surface-temperature.csv',
      'csv', 'header',
      () => self.loaded = true
    );
  };

  this.setup = function () {
    textSize(16);
    textAlign(CENTER, CENTER);

    this.minYear = this.data.getNum(0, 'year');
    this.maxYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
    this.minTemperature = min(this.data.getColumn('temperature'));
    this.maxTemperature = max(this.data.getColumn('temperature'));
    this.meanTemperature = mean(this.data.getColumn('temperature'));
    this.frameCount = 0;

    
    if (this.startSlider) this.startSlider.remove();
    if (this.endSlider) this.endSlider.remove();

    this.startSlider = createSlider(this.minYear, this.maxYear - 1, this.minYear, 1);
    this.startSlider.position(400, 10);
    this.endSlider = createSlider(this.minYear + 1, this.maxYear, this.maxYear, 1);
    this.endSlider.position(600, 10);

    // Generate snowflakes
    for (var i = 0; i < 75; i++) {
      this.snowflakes.push({
        x: random(width),
        y: random(-height, 0),
        radius: random(2, 5),
        speed: random(0.5, 2),
      });
    }
  };

  this.destroy = function () {
    if (this.startSlider) this.startSlider.remove();
    if (this.endSlider) this.endSlider.remove();
  };

  this.draw = function () {
    if (!this.loaded) {
      fill(255);
      text("Loading Climate Data...", width / 2, height / 2);
      return;
    }

    if (this.startSlider.value() >= this.endSlider.value()) {
      this.startSlider.value(this.endSlider.value() - 1);
    }

    this.startYear = this.startSlider.value();
    this.endYear = this.endSlider.value();
    const textColor = darkMode ? 255 : 0;

    fill(textColor);
    noStroke();
    textSize(20);
    text("🌍 Climate Change Visualization", width / 2, 50);

    drawYAxisTickLabels(this.minTemperature,
      this.maxTemperature,
      this.layout,
      this.mapTemperatureToHeight.bind(this),
      1);
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    stroke(180);
    strokeWeight(1);
    line(this.layout.leftMargin,
      this.mapTemperatureToHeight(this.meanTemperature),
      this.layout.rightMargin,
      this.mapTemperatureToHeight(this.meanTemperature));

    var previous = null;
    const numYears = this.endYear - this.startYear;
    const segmentWidth = this.layout.plotWidth() / numYears;
    var yearCount = 0;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      const current = {
        year: this.data.getNum(i, 'year'),
        temperature: this.data.getNum(i, 'temperature')
      };

      if (previous && current.year > this.startYear && current.year <= this.endYear) {
        noStroke();
        fill(this.mapTemperatureToColour(current.temperature));
        rect(this.mapYearToWidth(current.year) - segmentWidth / 2,
          this.layout.topMargin,
          segmentWidth,
          this.layout.plotHeight());

        stroke(textColor);
        strokeWeight(2);
        line(this.mapYearToWidth(previous.year),
          this.mapTemperatureToHeight(previous.temperature),
          this.mapYearToWidth(current.year),
          this.mapTemperatureToHeight(current.temperature));

        const xLabelSkip = ceil(numYears / this.layout.numXTickLabels);
        if (yearCount % xLabelSkip === 0) {
          drawXAxisTickLabel(previous.year, this.layout, this.mapYearToWidth.bind(this));
        }

        if (numYears <= 6 && yearCount === numYears - 1) {
          drawXAxisTickLabel(current.year, this.layout, this.mapYearToWidth.bind(this));
        }

        yearCount++;
      }

      if (yearCount >= this.frameCount) break;
      previous = current;
    }

    if (this.frameCount < numYears) this.frameCount++;

    // 🌡️ Show tooltip near mouse
    if (
      mouseX > this.layout.leftMargin && mouseX < this.layout.rightMargin &&
      mouseY > this.layout.topMargin && mouseY < this.layout.bottomMargin
    ) {
      var hoverYear = floor(map(mouseX, this.layout.leftMargin, this.layout.rightMargin, this.startYear, this.endYear));
      var row = this.data.findRow(str(hoverYear), 'year');
      if (row) {
        var temp = row.getNum('temperature');
        fill(darkMode ? 255 : 0);
        textSize(14);
        textAlign(LEFT);
        text(`Year: ${hoverYear}, Temp: ${temp.toFixed(2)}℃`, mouseX + 10, mouseY - 10);
      }
    }

    // ❄️ Snowfall effect
    noStroke();
    fill(255, 200);
    for (var flake of this.snowflakes) {
      ellipse(flake.x, flake.y, flake.radius);
      flake.y += flake.speed;
      flake.x += sin(flake.y * 0.01); // horizontal drift

      if (flake.y > height) {
        flake.y = random(-50, -10);
        flake.x = random(width);
      }
    }
  };

  this.mapYearToWidth = function (value) {
    return map(value, this.startYear, this.endYear, this.layout.leftMargin, this.layout.rightMargin);
  };

  this.mapTemperatureToHeight = function (value) {
    return map(value, this.minTemperature, this.maxTemperature, this.layout.bottomMargin, this.layout.topMargin);
  };

  this.mapTemperatureToColour = function (value) {
    const red = map(value, this.minTemperature, this.maxTemperature, 0, 255);
    const blue = 255 - red;
    return color(red, 100, blue, 100);
  };
}
