/* Lumen & Loom theme JS. Vanilla, no dependencies. */
(function () {
  'use strict';

  var T = window.theme || { routes: {}, strings: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var nf;
  try {
    nf = new Intl.NumberFormat(T.locale || undefined, { style: 'currency', currency: T.currency || 'USD' });
  } catch (e) {
    nf = { format: function (n) { return n.toFixed(2); } };
  }
  function money(cents) { return nf.format(cents / 100); }

  var toastTimer;
  function toast(msg) {
    var t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  function setCartCount(n) {
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  /* Mobile menu */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-menu-toggle]');
    if (!btn) return;
    var nav = $('#mobile-nav');
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  /* Quantity +/- on the product page */
  document.addEventListener('click', function (e) {
    var minus = e.target.closest('[data-qty-minus]');
    var plus = e.target.closest('[data-qty-plus]');
    if (!minus && !plus) return;
    var input = $('input[name="quantity"]', (minus || plus).parentNode);
    var n = parseInt(input.value, 10) || 1;
    input.value = Math.max(1, n + (plus ? 1 : -1));
  });

  /* Gallery thumbnails */
  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('[data-thumb]');
    if (!thumb) return;
    var img = $('[data-main-image]');
    if (!img) return;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = thumb.dataset.thumb;
    img.alt = thumb.dataset.alt || '';
  });

  /* Variant selector: update price, availability and URL */
  $$('[data-variant-select]').forEach(function (sel) {
    var scope = sel.closest('.container');
    var priceEl = $('[data-price]', scope);
    var btn = $('[data-add-button]', scope);
    function update() {
      var o = sel.options[sel.selectedIndex];
      var price = Number(o.dataset.price);
      var cmp = Number(o.dataset.compare) || 0;
      var available = o.dataset.available === 'true';
      priceEl.innerHTML = '<span class="price-now">' + money(price) + '</span>' +
        (cmp > price ? ' <s>' + money(cmp) + '</s>' : '');
      btn.disabled = !available;
      btn.dataset.soldOut = String(!available);
      btn.textContent = available ? T.strings.addToCart : T.strings.soldOut;
      try { history.replaceState(null, '', location.pathname + '?variant=' + sel.value); } catch (err) { /* ignore */ }
    }
    sel.addEventListener('change', update);
  });

  /* Ajax add to cart (works for product page and quick-add buttons) */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches || !form.matches('[data-product-form]')) return;
    if (!window.fetch || !T.routes.cartAdd) return; // fall back to normal form post
    e.preventDefault();

    var btn = $('[type="submit"]', form);
    var errEl = $('[data-form-error]', form);
    if (errEl) errEl.textContent = '';
    if (btn) btn.disabled = true;

    fetch(T.routes.cartAdd + '.js', {
      method: 'POST',
      body: new FormData(form),
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.data.description || res.data.message || T.strings.error);
        toast(T.strings.added);
        return fetch(T.routes.cartJs, { headers: { 'Accept': 'application/json' } })
          .then(function (r) { return r.json(); })
          .then(function (cart) { setCartCount(cart.item_count); });
      })
      .catch(function (err) {
        var msg = err && err.message ? err.message : T.strings.error;
        if (errEl) errEl.textContent = msg; else toast(msg);
      })
      .then(function () {
        if (btn) btn.disabled = btn.dataset.soldOut === 'true';
      });
  });

  /* Cart: submit when a quantity changes */
  document.addEventListener('change', function (e) {
    if (!e.target.matches || !e.target.matches('[data-line-qty]')) return;
    var form = e.target.form;
    var hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'update';
    hidden.value = 'Update';
    form.appendChild(hidden);
    form.submit();
  });

  /* Collection filters: submit when anything changes */
  $$('[data-auto-submit]').forEach(function (form) {
    form.addEventListener('change', function () {
      if (form.requestSubmit) form.requestSubmit(); else form.submit();
    });
  });

  /* Related products (Product Recommendations API) */
  $$('[data-recommendations]').forEach(function (el) {
    if (el.children.length) return; // already rendered server-side
    var url = el.dataset.url;
    if (!url || !window.fetch) return;
    fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.querySelector('[data-recommendations]');
        if (fresh && fresh.innerHTML.trim()) el.innerHTML = fresh.innerHTML;
      })
      .catch(function () { /* related products are optional */ });
  });
})();
