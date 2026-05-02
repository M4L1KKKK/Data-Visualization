function YoutubeUsers() {
  this.name = 'Monthly Youtube users';
  this.id = 'youtube-users';
  this.data = [];
  this.loaded = false;

  this.animatedProgress = 0;
  this.chartType = 'lollipop';
  this.snowflakes = [];

  this.preload = function () {
    const self = this;
    this.data = loadTable(
      'data/monthly-youtube-users/monthly-youtube-users.csv',
      'csv',
      'header',
      function (table) {
        self.loaded = true;
        self.processData(table);
      }
    );
  };

  this.processData = function (table) {
    this.data = [];
    for (let i = 0; i < table.getRowCount(); i++) {
      const country = table.getString(i, 'Countries').trim();
      const population = parseInt(table.getString(i, 'Population').replace(/,/g, ''));
      this.data.push({ country, population });
    }
    this.data.sort((a, b) => b.population - a.population);

    for (let i = 0; i < 60; i++) {
      this.snowflakes.push({
        x: random(width),
        y: random(-height, 0),
        size: random(2, 6),
        speed: random(0.5, 2)
      });
    }
  };


  this.draw = function () {
    if (!this.loaded) {
      background(darkMode ? 30 : 255);
      fill(darkMode ? 255 : 0);
      textAlign(CENTER, CENTER);
      textSize(24);
      text("Loading data...", width / 2, height / 2);
      return;
    }

    background(darkMode ? 30 : 240);
    textAlign(CENTER);
    textSize(14);

    const margin = 60;
    const chartWidth = width - margin * 2;
    const maxPopulation = Math.max(...this.data.map(d => d.population));
    const spacing = chartWidth / this.data.length;

    const pulse = sin(frameCount * 0.1) * 2;
    this.animatedProgress = constrain(this.animatedProgress + 0.02, 0, 1);

    let prevX = null, prevY = null;

    for (let i = 0; i < this.data.length; i++) {
      const x = margin + i * spacing + spacing / 2;
      const finalY = map(this.data[i].population, 0, maxPopulation, height - margin, margin + 100);
      const animatedY = lerp(height - margin, finalY, this.animatedProgress);

      if (this.chartType === 'lollipop') {
        stroke(darkMode ? 200 : 100);
        line(x, height - margin, x, animatedY);
        fill('#1f78b4');
        noStroke();
        ellipse(x, animatedY, 12 + pulse, 12 + pulse);
      } else {
        stroke('#1f78b4');
        strokeWeight(2);
        if (prevX !== null && prevY !== null) {
          line(prevX, prevY, x, animatedY);
        }
        prevX = x;
        prevY = animatedY;

        fill('#1f78b4');
        noStroke();
        ellipse(x, animatedY, 8, 8);
      }

      fill(darkMode ? 255 : 0);
      textSize(10);
      text(this.data[i].country, x, height - margin + 15);

      if (dist(mouseX, mouseY, x, animatedY) < 10) {
        let txt = `${this.data[i].country}: ${nf(this.data[i].population)}`;
        let w = textWidth(txt) + 12;
        fill(darkMode ? 255 : 30);
        stroke(150);
        rect(mouseX + 10, mouseY - 30, w, 26, 5);
        noStroke();
        fill(darkMode ? 30 : 255);
        textAlign(LEFT, CENTER);
        textSize(12);
        text(txt, mouseX + 16, mouseY - 17);
      }
    }

    fill(darkMode ? 255 : 0);
    textSize(18);
    text("Early 2025 Monthly YouTube Users by Country", width / 2, margin / 2);
    

    for (let snow of this.snowflakes) {
      fill(255, 150);
      noStroke();
      ellipse(snow.x, snow.y, snow.size);
      snow.y += snow.speed;
      if (snow.y > height) {
        snow.y = random(-20, -100);
        snow.x = random(width);
      }
    }
  };
}
