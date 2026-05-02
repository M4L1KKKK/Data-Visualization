function Gallery() {
  this.visuals = [];
  this.selectedVisual = null;
  const self = this;

  // Add a new visualisation to the gallery + sidebar
  this.addVisual = function(vis) {
    if (!vis.hasOwnProperty('id') || !vis.hasOwnProperty('name')) {
      alert('Visualisation must have both id and name!');
      return;
    }
    if (this.findVisIndex(vis.id) !== null) {
      alert(`Duplicate ID '${vis.id}' found in: ${vis.name}`);
      return;
    }

    this.visuals.push(vis);

    // Build card
    const li = createElement('li');
    li.addClass('menu-item');
    li.id(vis.id);

    // Per-item accent hue 
    const hue = Math.floor((this.visuals.length * 47) % 360);
    li.elt.style.setProperty('--h', hue);

    // Icon + labels + dot
    const icon = createElement('div', vis.icon ? vis.icon : '•');
    icon.addClass('mi-icon');

    const textWrap = createElement('div');
    const title = createElement('div', vis.name);
    title.addClass('mi-title');
    textWrap.child(title);

    if (vis.subtitle) {
      const sub = createElement('div', vis.subtitle);
      sub.addClass('mi-sub');
      textWrap.child(sub);
    }

    const dot = createElement('div');
    dot.addClass('mi-dot');
    li.child(dot);

    li.child(icon);
    li.child(textWrap);
    li.child(dot);

    // Hover effects 
    li.mouseOver(e => select(`#${li.id()}`).addClass("hover"));
    li.mouseOut(e => select(`#${li.id()}`).removeClass("hover"));

    // Click to switch
    li.mouseClicked(e => {
      const id = e.srcElement.closest('li') ? e.srcElement.closest('li').id : e.srcElement.id;

      // clear previous selections
      const menuItems = selectAll('.menu-item');
      for (var i = 0; i < menuItems.length; i++) menuItems[i].removeClass('selected');

      // set selected class
      select(`#${id}`).addClass('selected');

      // sync dropdown if you use one
      if (typeof dropdown !== 'undefined' && dropdown) {
        const idx = this.findVisIndex(id);
        if (idx !== null) dropdown.value(this.visuals[idx].name);
      }

      // Switch visual
      self.selectVisual(id);
    });

    
    const visMenu = select('#visuals-menu');
    visMenu.child(li);

    // Preload if provided
    if (vis.preload) vis.preload();

    if (!this.selectedVisual && this.visuals.length > 0) {
    setTimeout(() => {
      this.selectVisual(this.visuals[0].id);
      select('#visuals-menu').addClass('ready');
    }, 50); // Small delay to ensure DOM is ready
  }
  };

  // Get index by id
  this.findVisIndex = function(visId) {
    for (var i = 0; i < this.visuals.length; i++) {
      if (this.visuals[i].id === visId) return i;
    }
    return null;
  };

  // Switch selected visual
  this.selectVisual = function(visId) {
    const visIndex = this.findVisIndex(visId);
    if (visIndex !== null) {
      // Clean up old one
      if (this.selectedVisual && this.selectedVisual.destroy) {
        this.selectedVisual.destroy();
      }

      this.selectedVisual = this.visuals[visIndex];

      if (this.selectedVisual.setup) this.selectedVisual.setup();

      // Mark active card (in case selectVisual called programmatically)
      const menuItems = selectAll('.menu-item');
      for (var i = 0; i < menuItems.length; i++) {
        const el = menuItems[i];
        if (el.elt.id === visId) el.addClass('selected'); else el.removeClass('selected');
      }

      // Keep body theme in sync if you use global darkMode
      if (typeof darkMode !== 'undefined') {
        document.body.classList.toggle('dark', !!darkMode);
      }

      loop(); // Resume draw loop
    }
  };
}
