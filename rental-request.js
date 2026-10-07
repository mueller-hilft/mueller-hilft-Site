(() => {
  const validDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value ? value : '';
  };
  const displayDate = (value) => value.split('-').reverse().join('.');
  const periodText = (start, end) => {
    if (start && end) return start === end ? displayDate(start) : `${displayDate(start)}–${displayDate(end)}`;
    if (start) return `ab ${displayDate(start)}`;
    if (end) return `bis ${displayDate(end)}`;
    return '';
  };
  const formHref = (device, start, end) => {
    const params = new URLSearchParams({geraet: device});
    if (start) params.set('von', start);
    if (end) params.set('bis', end);
    return `/?${params}#kontakt`;
  };
  const whatsappHref = (device, start, end) => {
    const text = `Hallo, ich möchte folgendes Gerät mieten:\n${device}\n\nMietzeitraum: ${periodText(start,end) || 'noch offen'}\n\nIst das Gerät verfügbar?`;
    return `https://wa.me/4915785678698?${new URLSearchParams({text})}`;
  };

  const device = document.body.dataset.rentalDevice;
  if (device) {
    const startInput = document.getElementById('rental-start');
    const endInput = document.getElementById('rental-end');
    const links = Array.from(document.querySelectorAll('[data-rental-form], [data-rental-whatsapp]'));
    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    const updateLinks = () => {
      const start = validDate(startInput?.value || '');
      const end = validDate(endInput?.value || '');
      if (startInput) startInput.min = todayISO;
      if (endInput) {
        endInput.min = start && start > todayISO ? start : todayISO;
        endInput.setCustomValidity(start && end && end < start ? 'Die Rückgabe muss am oder nach dem Mietbeginn liegen.' : '');
      }
      links.forEach((link) => {
        const selectedDevice = link.dataset.rentalDevice || device;
        link.href = link.hasAttribute('data-rental-whatsapp')
          ? whatsappHref(selectedDevice, start, end)
          : formHref(selectedDevice, start, end);
      });
    };
    [startInput,endInput].filter(Boolean).forEach((input) => {
      input.addEventListener('input', updateLinks);
      input.addEventListener('change', updateLinks);
    });
    links.forEach((link) => link.addEventListener('click', (event) => {
      updateLinks();
      const invalid = [startInput,endInput].filter(Boolean).find((input) => !input.checkValidity());
      if (invalid) {
        event.preventDefault();
        invalid.reportValidity();
      }
    }));
    updateLinks();
  }

  const params = new URLSearchParams(location.search);
  const selectedDevice = (params.get('geraet') || '').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,180);
  const form = document.querySelector('#kontakt form');
  if (selectedDevice && form) {
    const message = form.querySelector('textarea[name="message"]');
    const dates = form.querySelector('input[name="dates"]');
    const start = validDate(params.get('von') || '');
    const parsedEnd = validDate(params.get('bis') || '');
    const end = start && parsedEnd < start ? '' : parsedEnd;
    if (message && !message.value) message.value = `Mietanfrage: ${selectedDevice}\n\n`;
    if (dates && !dates.value) dates.value = periodText(start,end);
    const updateWhatsApp = () => {
      const request = message?.value.trim() || `Mietanfrage: ${selectedDevice}`;
      const dateText = dates?.value.trim() || 'noch offen';
      const text = `Hallo,\n${request}\n\nMietzeitraum: ${dateText}`;
      document.querySelectorAll('a[href^="https://wa.me/4915785678698"]').forEach((link) => {
        link.href = `https://wa.me/4915785678698?${new URLSearchParams({text})}`;
      });
    };
    [message,dates].filter(Boolean).forEach((input) => input.addEventListener('input', updateWhatsApp));
    updateWhatsApp();
  }
})();
