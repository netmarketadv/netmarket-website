window.nmhc = window.nmhc || {};

(() => {
  const config = window.nmhcAdmin || {};

  function syncRelation(container) {
    const input = container.querySelector('[data-nmhc-relation-input]');
    const ids = Array.from(container.querySelectorAll('.nmhc-chip')).map((chip) => chip.dataset.id);
    input.value = ids.filter(Boolean).join(',');
  }

  function addRelation(container, item) {
    const multiple = container.dataset.multiple === 'true';
    const selected = container.querySelector('[data-nmhc-relation-selected]');
    if (!multiple) selected.innerHTML = '';
    if (selected.querySelector(`[data-id="${item.id}"]`)) return;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'nmhc-chip';
    chip.dataset.id = String(item.id);
    chip.append(document.createTextNode(item.title));
    const close = document.createElement('span');
    close.setAttribute('aria-hidden', 'true');
    close.textContent = '×';
    chip.append(close);
    selected.append(chip);
    syncRelation(container);
  }

  document.querySelectorAll('[data-nmhc-relation]').forEach((container) => {
    const search = container.querySelector('[data-nmhc-relation-search]');
    const results = container.querySelector('[data-nmhc-relation-results]');
    let controller;

    container.addEventListener('click', (event) => {
      const chip = event.target.closest('.nmhc-chip');
      if (chip) {
        chip.remove();
        syncRelation(container);
      }
      const option = event.target.closest('[data-nmhc-relation-option]');
      if (option) {
        addRelation(container, { id: option.dataset.id, title: option.textContent.trim() });
        results.innerHTML = '';
        search.value = '';
      }
    });

    search.addEventListener('input', async () => {
      const query = search.value.trim();
      results.innerHTML = '';
      if (query.length < 2 || !config.relationEndpoint) return;
      if (controller) controller.abort();
      controller = new AbortController();
      const url = new URL(config.relationEndpoint);
      url.searchParams.set('search', query);
      url.searchParams.set('types', container.dataset.targets || 'post');
      const response = await fetch(url, {
        headers: { 'X-WP-Nonce': config.nonce || '' },
        signal: controller.signal
      }).catch(() => null);
      if (!response || !response.ok) return;
      const items = await response.json();
      results.innerHTML = '';
      items.forEach((item) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.dataset.nmhcRelationOption = '';
        option.dataset.id = String(item.id);
        option.textContent = item.title;
        results.append(option);
      });
    });
  });

  document.querySelectorAll('[data-nmhc-media]').forEach((container) => {
    const input = container.querySelector('[data-nmhc-media-input]');
    const preview = container.querySelector('[data-nmhc-media-preview]');
    const choose = container.querySelector('[data-nmhc-media-choose]');
    const remove = container.querySelector('[data-nmhc-media-remove]');

    choose.addEventListener('click', () => {
      const frame = window.wp.media({
        title: config.chooseMedia || 'Scegli media',
        button: { text: config.chooseMedia || 'Scegli media' },
        multiple: false
      });
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        input.value = attachment.id;
        const thumb = attachment.sizes?.thumbnail?.url || attachment.url;
        preview.innerHTML = `<img src="${thumb}" alt="">`;
      });
      frame.open();
    });

    remove.addEventListener('click', () => {
      input.value = '';
      preview.innerHTML = '';
    });
  });

  document.querySelectorAll('[data-nmhc-media-gallery]').forEach((container) => {
    const input = container.querySelector('[data-nmhc-media-gallery-input]');
    const items = container.querySelector('[data-nmhc-media-gallery-items]');
    const choose = container.querySelector('[data-nmhc-media-gallery-choose]');

    const sync = () => {
      input.value = Array.from(items.querySelectorAll('[data-id]'))
        .map((item) => item.dataset.id)
        .filter(Boolean)
        .join(',');
    };
    const append = (attachment) => {
      if (items.querySelector(`[data-id="${attachment.id}"]`)) return;
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'nmhc-media-gallery__item';
      item.dataset.id = String(attachment.id);
      item.setAttribute('aria-label', 'Rimuovi immagine');
      const image = document.createElement('img');
      image.src = attachment.sizes?.thumbnail?.url || attachment.url;
      image.alt = '';
      const remove = document.createElement('span');
      remove.setAttribute('aria-hidden', 'true');
      remove.textContent = '×';
      item.append(image, remove);
      items.append(item);
    };

    items.addEventListener('click', (event) => {
      const item = event.target.closest('[data-id]');
      if (!item) return;
      item.remove();
      sync();
    });
    choose.addEventListener('click', () => {
      const frame = window.wp.media({
        title: config.chooseMedia || 'Scegli media',
        button: { text: config.chooseMedia || 'Scegli media' },
        multiple: true
      });
      frame.on('select', () => {
        frame.state().get('selection').toJSON().forEach(append);
        sync();
      });
      frame.open();
    });
  });
})();
