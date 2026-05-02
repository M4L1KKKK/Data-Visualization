function LiveGDPChart() {
  this.name = 'Live GDP Chart';
  this.id = 'gdp-live-bar';

  this.loaded = false;
  this.data = [];
  this.currentYear = 2000;
  this.maxYear = 2025;
  this.minYear = 2000;
  this.margin = 80;
  this.barHeight = 40;
  this.yearInterval = 180; // ~6 secs per year transition
  this.transitionProgress = 0;

  this.barStates = {}; // Holds animated states for each country

  this.preload = function () {
    var self = this;
    this.table = loadTable('/data/country_gdp/country_gdp.csv', 'csv', 'header', function (table) {
      self.loaded = true;
      self.data = table.getRows();
    });
  };

  this.setup = function () {
    frameRate(60);
    textFont('Helvetica');
  };

  this.destroy = function () {};

  this.draw = function () {
    if (!this.loaded) {
      background(10, 10, 20);
      fill(255);
      textAlign(CENTER, CENTER);
      text('Loading GDP data...', width / 2, height / 2);
      return;
    }

    background(10, 10, 20);
    textAlign(CENTER, TOP);
    textSize(20);
    fill(255);
    text('Top 10 Country Economies by GDP (2000–2025)', width / 2, 20);

    var yearData = this.data.filter(r => int(r.get('year')) === this.currentYear);
    yearData.sort((a, b) => float(b.get('gdp')) - float(a.get('gdp')));
    var top10 = yearData.slice(0, 10);

    if (top10.length === 0) {
      fill(255, 100, 100);
      textSize(18);
      text(`No data for year ${this.currentYear}`, width / 2, height / 2);
      return;
    }

    var maxGDP = float(top10[0].get('gdp'));
    var barWidth = width - this.margin * 2 - 150;

    for (var i = 0; i < top10.length; i++) {
      var row = top10[i];
      var country = row.get('country');
      var gdp = float(row.get('gdp'));
      var yTarget = this.margin + i * this.barHeight + 60;
      var wTarget = map(gdp, 0, maxGDP, 0, barWidth);

      if (!this.barStates[country]) {
        this.barStates[country] = { y: yTarget, w: wTarget, gdp: gdp };
      }

      // Smooth transition
      var s = this.barStates[country];
      s.y += (yTarget - s.y) * 0.1;
      s.w += (wTarget - s.w) * 0.1;
      s.gdp += (gdp - s.gdp) * 0.1;

      // Draw bar
      fill(50, 180, 255, 220);
      noStroke();
      rect(this.margin, s.y, s.w, this.barHeight * 0.6, 5);

      // Country name
      fill(255);
      textSize(14);
      textAlign(LEFT, CENTER);
      text(`${country}`, this.margin + 10, s.y + this.barHeight * 0.3);

      // GDP Value
      textAlign(RIGHT, CENTER);
      var formatted = s.gdp >= 1000
        ? `${nf(s.gdp / 1000, 1, 2)}T`
        : `${nf(s.gdp, 1, 2)}B`;
      text(formatted, this.margin + s.w + 120, s.y + this.barHeight * 0.3);
    }

    // Year label
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(255, 100);
    text(this.currentYear, width - this.margin, height - this.margin);

    // Update year every interval
    if (frameCount % this.yearInterval === 0 && this.currentYear < this.maxYear) {
      this.currentYear++;
    }
  };
}
