// Global variable to store the gallery object.
var gallery;
var dropdown;
var saveButton;
var darkMode = true;

function setup() {
  // Create canvas and attach to #app
  let c = createCanvas(1024, 576);
  c.parent('app');

  // Create dropdown
  dropdown = createSelect();
  dropdown.position(1500, 10);
  dropdown.option('Select Visualization');

  // Screenshot button
  saveButton = createButton('📸 Save Image');
  saveButton.position(1740, 10);
  saveButton.mousePressed(() => saveCanvas('chart', 'png'));

  // Init gallery and visualizations
  gallery = new Gallery();

  // Define and register visuals
  const visuals = [
    new TechDiversityRace(),
    new TechDiversityGender(),
    new PayGapByJob2017(),
    new PayGapTimeSeries(),
    new ClimateChange(),
    new CrimeOutcomes(),
    new YoutubeUsers(),
    new LifeGoals(),
    new Grades(),
    new CovidVaccination(),
    new HeartRate(),
    new LiveGDPChart(),
    new TumorResponse()
  ];

  for (let vis of visuals) {
    gallery.addVisual(vis);
    dropdown.option(vis.name);
  }

  // When dropdown changes
  dropdown.changed(() => {
    const selectedName = dropdown.value();
    for (let vis of gallery.visuals) {
      if (vis.name === selectedName) {
        gallery.selectVisual(vis.id);
        break;
      }
    }

    // Sync sidebar menu highlight
    const menuItems = selectAll('.menu-item');
    for (let i = 0; i < menuItems.length; i++) {
      menuItems[i].removeClass('selected');
      if (menuItems[i].elt.innerText === selectedName) {
        menuItems[i].addClass('selected');
      }
    }
  });
}

function draw() {
  background(darkMode ? 20 : 255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
   if (gallery.selectedVisual?.id === "climate-change") {
    fill(darkMode ? 255 : 0);
    textSize(12);
    textAlign(LEFT);
    let cc = gallery.selectedVisual;
    text("Start: " + cc.startSlider.value(), cc.startSlider.x * 1.2, cc.startSlider.y + 15);
    text("End: " + cc.endSlider.value(), cc.endSlider.x * 1.2, cc.endSlider.y + 15);
  }
}

function keyPressed() {
  if (key === 'd' || key === 'D') {
    darkMode = !darkMode;
  }
}
