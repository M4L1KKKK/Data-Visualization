function TechDiversityGender() {

  this.name = 'Tech Diversity: Gender';
  this.id = 'tech-diversity-gender';

  this.layout = {
    leftMargin: 130,
    rightMargin: width,
    topMargin: 30,
    bottomMargin: height,
    pad: 5,
    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;

  this.loaded = false;
  this.breathing = 0;
  this.breathingSpeed = 0.02;

  this.bokehBubbles = [];

  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/tech-diversity/gender-2018.csv', 'csv', 'header',
      function (table) {
        self.loaded = true;
      });
  };

  this.setup = function () {
    textSize(16);
    // Create bokeh background particles
    for (var i = 0; i < 50; i++) {
      this.bokehBubbles.push({
        x: random(width),
        y: random(height),
        r: random(5, 25),
        alpha: random(30, 80),
        speed: random(0.3, 1)
      });
    }
  };

  this.destroy = function () { };

  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    background(darkMode ? 20 : 245);
    this.drawBokehBackground();

    this.breathing += this.breathingSpeed;
    var pulse = 1 + 0.02 * sin(this.breathing);

    this.drawCategoryLabels();

    var lineHeight = (height - this.layout.topMargin) / this.data.getRowCount();
    var mx = mouseX;
    var my = mouseY;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var lineY = (lineHeight * i) + this.layout.topMargin;

      var company = {
        name: this.data.getString(i, 'company'),
        female: this.data.getNum(i, 'female'),
        male: this.data.getNum(i, 'male')
      };

      var femaleWidth = this.mapPercentToWidth(company.female);
      var maleWidth = this.mapPercentToWidth(company.male);

      var isHovering = (my > lineY && my < lineY + lineHeight);

      // Labels
      fill(50);
      noStroke();
      textAlign('right', 'top');
      text(company.name, this.layout.leftMargin - this.layout.pad, lineY);

      // Female Bar (Gradient + breathing + glow)
      var fx = this.layout.leftMargin;
      var fy = lineY;
      var fh = lineHeight - this.layout.pad;
      var fw = femaleWidth;

      if (isHovering) {
        fill(255, 100, 150, 180);
        rect(fx, fy, fw, fh);
        fill(255);
        textAlign('left', 'top');
        text(company.female + '%', fx + 5, fy + 2);
      } else {
        this.drawGradientBar(fx, fy, fw, fh, color(255, 102, 178), color(255, 153, 204));
      }

      // Male Bar (Gradient + breathing + glow)
      var mxStart = this.layout.leftMargin + femaleWidth;
      var mw = maleWidth;

      if (isHovering) {
        fill(100, 200, 255, 180);
        rect(mxStart, fy, mw, fh);
        fill(255);
        textAlign('right', 'top');
        text(company.male + '%', mxStart + mw - 5, fy + 2);
      } else {
        this.drawGradientBar(mxStart, fy, mw, fh, color(0, 180, 255), color(0, 102, 204));
      }
    }

    // 50% Line
    stroke(150);
    strokeWeight(1);
    line(this.midX, this.layout.topMargin, this.midX, this.layout.bottomMargin);
  };

  this.drawCategoryLabels = function () {
    fill(0);
    noStroke();
    textAlign('left', 'top');
    text('Female', this.layout.leftMargin, this.layout.pad);
    textAlign('center', 'top');
    text('50%', this.midX, this.layout.pad);
    textAlign('right', 'top');
    text('Male', this.layout.rightMargin, this.layout.pad);
  };

  this.mapPercentToWidth = function (percent) {
    return map(percent, 0, 100, 0, this.layout.plotWidth());
  };

  this.drawGradientBar = function (x, y, w, h, c1, c2) {
    noFill();
    for (var i = 0; i < h; i++) {
      var inter = map(i, 0, h, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, y + i, x + w, y + i);
    }

    // Optional depth effect
    stroke(0, 20);
    line(x + w, y, x + w, y + h);
  };

  this.drawBokehBackground = function () {
    noStroke();
    for (var i = 0; i < this.bokehBubbles.length; i++) {
      var b = this.bokehBubbles[i];
      fill(180, 220, 255, b.alpha);
      ellipse(b.x, b.y, b.r);
      b.y -= b.speed;
      if (b.y < -b.r) {
        b.y = height + b.r;
        b.x = random(width);
      }
    }
  };
}
