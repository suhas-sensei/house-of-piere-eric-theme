/* House of Piere Eric — theme.js */
(() => {
  'use strict';

  /* -------- Drawers -------- */
  const drawers = document.querySelectorAll('.drawer');
  const openDrawer = (id) => {
    const d = document.getElementById(id);
    if (!d) return;
    d.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeAll = () => {
    drawers.forEach(d => d.setAttribute('aria-hidden', 'true'));
    document.body.style.overflow = '';
  };

  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-drawer-toggle]');
    if (toggle) {
      e.preventDefault();
      const id = toggle.getAttribute('data-drawer-toggle');
      const d = document.getElementById(id);
      if (d.getAttribute('aria-hidden') === 'false') closeAll();
      else { closeAll(); openDrawer(id); }
      return;
    }
    if (e.target.closest('[data-drawer-close]')) {
      e.preventDefault();
      closeAll();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  /* -------- Quantity steppers -------- */
  document.addEventListener('click', (e) => {
    const step = e.target.closest('[data-qty-step]');
    if (!step) return;
    const wrap = step.closest('.qty');
    if (!wrap) return;
    const input = wrap.querySelector('input');
    const dir = parseInt(step.getAttribute('data-qty-step'), 10);
    const next = Math.max(parseInt(input.min || '0', 10), (parseInt(input.value, 10) || 0) + dir);
    input.value = next;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* -------- Variant pills update hidden id -------- */
  document.querySelectorAll('[data-product-form]').forEach((form) => {
    const variantInput = form.querySelector('[data-variant-id]');
    const radios = form.querySelectorAll('input[type=radio][name^="options"]');
    if (!radios.length) return;
    const update = () => {
      // Build selected option set
      const selected = {};
      radios.forEach(r => { if (r.checked) selected[r.name.match(/\[(.*)\]/)[1]] = r.value; });
      const productJsonEl = form.closest('[data-section-id]')?.querySelector('script[type="application/json"][data-product-json]');
      if (!productJsonEl || !variantInput) return;
      try {
        const data = JSON.parse(productJsonEl.textContent);
        const match = data.variants.find(v => v.options.every((opt, i) => opt === selected[data.options[i]]));
        if (match) variantInput.value = match.id;
      } catch (_) {}
    };
    radios.forEach(r => r.addEventListener('change', update));
  });

  /* -------- Add-to-cart via fetch (drawer reveal) -------- */
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-product-form]');
    if (!form) return;
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const r = await fetch('/cart/add.js', { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
      if (!r.ok) throw new Error('add failed');
      const cart = await fetch('/cart.js').then(x => x.json());
      document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = `(${cart.item_count})`);
      // Re-fetch cart drawer fragment via section render
      try {
        const html = await fetch(window.location.pathname + '?sections=header').then(x => x.json());
        if (html.header) {
          const tmp = document.createElement('div'); tmp.innerHTML = html.header;
          const newDrawer = tmp.querySelector('#CartDrawer');
          if (newDrawer) document.querySelector('#CartDrawer').replaceWith(newDrawer);
        }
      } catch(_) {}
      openDrawer('CartDrawer');
    } catch (err) {
      form.submit();
    }
  });

  /* -------- Reveal on scroll -------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.story, .entry, .note, .card, .index-row, .hero__inner > *').forEach(el => {
    el.classList.add('reveal'); io.observe(el);
  });
})();
