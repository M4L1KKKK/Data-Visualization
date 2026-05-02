function PayGapByJob2017() {
  this.name = 'Pay gap by job: 2017';
  this.id = 'pay-gap-by-job-2017';
  this.loaded = false;

  this.pad = 40;
  this.dotSizeMin = 15;
  this.dotSizeMax = 40;

  this.hoverIndex = -1;
  this.bounceOffsets = [];

  this.preload = function () {
    let self = this;
    this.data = loadTable(
      './data/pay-gap/occupation-hourly-pay-by-gender-2017.csv',
      'csv',
      'header',
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    for (let i = 0; i < 100; i++) {
      this.bounceOffsets.push(random(TWO_PI));
    }
  };

  this.destroy = function () {};

  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    background(245);
    this.drawGrid();

    this.addAxes();

    let jobs = this.data.getColumn('job_subtype');
    let propFemale = stringsToNumbers(this.data.getColumn('proportion_female'));
    let payGap = stringsToNumbers(this.data.getColumn('pay_gap'));
    let numJobs = stringsToNumbers(this.data.getColumn('num_jobs'));

    let propFemaleMin = 0, propFemaleMax = 100;
    let payGapMin = -20, payGapMax = 20;
    let numJobsMin = min(numJobs), numJobsMax = max(numJobs);

    let hoverDetected = false;
    let bounceSpeed = 0.05;

    for (let i = 0; i < this.data.getRowCount(); i++) {
      let x = map(propFemale[i], propFemaleMin, propFemaleMax, this.pad, width - this.pad);
      let y = map(payGap[i], payGapMin, payGapMax, height - this.pad, this.pad);

      // Animate bouncing
      let bounce = sin(frameCount * bounceSpeed + this.bounceOffsets[i]) * 3;
      y += bounce;

      let size = map(numJobs[i], numJobsMin, numJobsMax, this.dotSizeMin, this.dotSizeMax);
      let d = dist(mouseX, mouseY, x, y);

      // Color gradient: red (negative gap) to green (positive)
      let col = lerpColor(color(255, 80, 100), color(80, 255, 120), map(payGap[i], payGapMin, payGapMax, 0, 1));
      fill(col);
      stroke(50, 50, 50, 100);
      strokeWeight(1);
      ellipse(x, y, size, size);

      // Glowing effect
      noFill();
      stroke(col.levels[0], col.levels[1], col.levels[2], 40);
      strokeWeight(8);
      ellipse(x, y, size + 8);

      if (d < size / 2) {
        this.hoverIndex = i;
        hoverDetected = true;
      }
    }

    if (!hoverDetected) {
      this.hoverIndex = -1;
    }

    if (this.hoverIndex >= 0) {
      this.showTooltip(
        jobs[this.hoverIndex],
        payGap[this.hoverIndex],
        numJobs[this.hoverIndex]
      );
    }
  };

  this.drawGrid = function () {
    stroke(230);
    strokeWeight(1);
    for (let i = this.pad; i < width; i += 50) {
      line(i, this.pad, i, height - this.pad);
    }
    for (let j = this.pad; j < height; j += 50) {
      line(this.pad, j, width - this.pad, j);
    }
  };

  this.addAxes = function () {
    stroke(100);
    strokeWeight(1.5);
    line(width / 2, this.pad, width / 2, height - this.pad); // Vertical (pay gap = 0)
    line(this.pad, height / 2, width - this.pad, height / 2); // Horizontal (50% women)

    fill(0);
    noStroke();
    textSize(14);
    textAlign(LEFT, BOTTOM);
    text("Higher Male Pay →", width / 2 + 10, this.pad + 5);
    text("← Higher Female Pay", width / 2 - 180, this.pad + 5);
    textAlign(CENTER);
    text("Proportion Female (%) →", width / 2, height - 10);
  };

  this.showTooltip = function (job, gap, jobsCount) {
    fill(50, 50, 50, 240);
    stroke(255);
    strokeWeight(1);
    rect(mouseX + 10, mouseY, 220, 65, 10);

    fill(255);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text("Job: " + job, mouseX + 15, mouseY + 5);
    text("Pay Gap: " + nf(gap, 1, 2) + "%", mouseX + 15, mouseY + 25);
    text("# of Jobs: " + jobsCount, mouseX + 15, mouseY + 45);
  };
}
