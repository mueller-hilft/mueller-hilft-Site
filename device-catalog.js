(() => {
  const grid = document.getElementById('device-grid');
  const filters = document.getElementById('catalog-filters');
  const count = document.getElementById('device-count');
  if (!grid || !filters || !count) return;

  const cards = Array.from(grid.querySelectorAll('[data-category]'));
  const buttons = Array.from(filters.querySelectorAll('[data-filter]'));
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      let visible = 0;
      cards.forEach((card) => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
        if (!card.hidden) visible += 1;
      });
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      const label = category === 'all' ? 'Alle Kategorien' : button.textContent.trim();
      count.textContent = `${visible} ${visible === 1 ? 'Gerät' : 'Geräte'} · ${label}`;
    });
  });
  filters.hidden = false;
})();
