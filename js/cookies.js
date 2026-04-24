/* ============================================================
   GOOD TAXI 45 — Gestionnaire de cookies (RGPD / CNIL compliant)
   ============================================================ */

(function () {
  'use strict';

  const CONSENT_KEY = 'goodtaxi_cookie_consent';
  const CONSENT_VERSION = '1';
  const CONSENT_DURATION_DAYS = 180; // 6 mois

  // ---------- Helpers localStorage ----------
  function saveConsent(choice) {
    const data = {
      version: CONSENT_VERSION,
      choice: choice, // 'all' | 'necessary' | 'custom'
      categories: choice === 'all'
        ? { necessary: true, analytics: true }
        : choice === 'necessary'
          ? { necessary: true, analytics: false }
          : choice, // objet personnalisé
      date: Date.now(),
      expires: Date.now() + CONSENT_DURATION_DAYS * 24 * 60 * 60 * 1000,
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    } catch (e) { /* localStorage indisponible */ }
    return data;
  }

  function getConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== CONSENT_VERSION) return null;
      if (data.expires && Date.now() > data.expires) return null;
      return data;
    } catch (e) { return null; }
  }

  function clearConsent() {
    try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
  }

  // ---------- Création de la bannière ----------
  function buildBanner() {
    const existing = document.getElementById('gt-cookie-banner');
    if (existing) return existing;

    const banner = document.createElement('div');
    banner.id = 'gt-cookie-banner';
    banner.className = 'gt-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Gestion des cookies');
    banner.innerHTML = `
      <div class="gt-cookie-inner">
        <div class="gt-cookie-main">
          <div class="gt-cookie-icon" aria-hidden="true">🍪</div>
          <div class="gt-cookie-text">
            <h3>Nous respectons votre vie privée</h3>
            <p>Nous utilisons uniquement les cookies nécessaires au bon fonctionnement du site.
            Aucun cookie publicitaire ou de suivi tiers n'est déposé sans votre consentement.
            <a href="politique-confidentialite.html">En savoir plus</a>.</p>
          </div>
        </div>
        <div class="gt-cookie-actions">
          <button type="button" class="gt-cookie-btn gt-cookie-btn--ghost" data-gt-action="customize">Personnaliser</button>
          <button type="button" class="gt-cookie-btn gt-cookie-btn--ghost" data-gt-action="necessary">Tout refuser</button>
          <button type="button" class="gt-cookie-btn gt-cookie-btn--primary" data-gt-action="all">Tout accepter</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    return banner;
  }

  // ---------- Création de la modale de personnalisation ----------
  function buildModal() {
    const existing = document.getElementById('gt-cookie-modal');
    if (existing) return existing;

    const modal = document.createElement('div');
    modal.id = 'gt-cookie-modal';
    modal.className = 'gt-cookie-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'gt-cookie-modal-title');
    modal.innerHTML = `
      <div class="gt-cookie-modal-overlay" data-gt-action="close-modal"></div>
      <div class="gt-cookie-modal-content">
        <div class="gt-cookie-modal-header">
          <h3 id="gt-cookie-modal-title">Préférences de cookies</h3>
          <button type="button" class="gt-cookie-close" data-gt-action="close-modal" aria-label="Fermer">×</button>
        </div>
        <div class="gt-cookie-modal-body">
          <p>Activez ou désactivez les catégories de cookies selon vos préférences. Les cookies strictement nécessaires ne peuvent pas être désactivés car ils garantissent le bon fonctionnement du site.</p>

          <div class="gt-cookie-category">
            <div class="gt-cookie-cat-head">
              <div>
                <h4>Cookies strictement nécessaires</h4>
                <p>Indispensables au fonctionnement du site (mémorisation de votre choix de cookies).</p>
              </div>
              <label class="gt-cookie-toggle gt-cookie-toggle--disabled">
                <input type="checkbox" checked disabled data-gt-cat="necessary" />
                <span class="gt-cookie-slider"></span>
                <span class="gt-cookie-toggle-label">Toujours actif</span>
              </label>
            </div>
          </div>

          <div class="gt-cookie-category">
            <div class="gt-cookie-cat-head">
              <div>
                <h4>Cookies de mesure d'audience</h4>
                <p>Nous aident à comprendre comment les visiteurs utilisent le site pour l'améliorer. Aucun cookie de ce type n'est actuellement actif.</p>
              </div>
              <label class="gt-cookie-toggle">
                <input type="checkbox" data-gt-cat="analytics" />
                <span class="gt-cookie-slider"></span>
                <span class="gt-cookie-toggle-label">Désactivé</span>
              </label>
            </div>
          </div>

        </div>
        <div class="gt-cookie-modal-footer">
          <button type="button" class="gt-cookie-btn gt-cookie-btn--ghost" data-gt-action="necessary">Tout refuser</button>
          <button type="button" class="gt-cookie-btn gt-cookie-btn--primary" data-gt-action="save">Enregistrer mes choix</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Mise à jour dynamique du label des toggles
    modal.addEventListener('change', function (e) {
      const cb = e.target.closest('input[type="checkbox"][data-gt-cat]');
      if (!cb) return;
      const label = cb.closest('.gt-cookie-toggle')?.querySelector('.gt-cookie-toggle-label');
      if (label && !cb.disabled) {
        label.textContent = cb.checked ? 'Activé' : 'Désactivé';
      }
    });

    return modal;
  }

  // ---------- Actions ----------
  function hideBanner() {
    const b = document.getElementById('gt-cookie-banner');
    if (b) b.classList.remove('is-visible');
  }

  function showBanner() {
    const b = buildBanner();
    // Force reflow pour animation
    requestAnimationFrame(() => b.classList.add('is-visible'));
  }

  function openModal() {
    const m = buildModal();
    // Pré-remplir avec le consentement actuel
    const current = getConsent();
    if (current && current.categories) {
      const cb = m.querySelector('input[data-gt-cat="analytics"]');
      if (cb) {
        cb.checked = !!current.categories.analytics;
        const label = cb.closest('.gt-cookie-toggle')?.querySelector('.gt-cookie-toggle-label');
        if (label) label.textContent = cb.checked ? 'Activé' : 'Désactivé';
      }
    }
    requestAnimationFrame(() => m.classList.add('is-visible'));
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const m = document.getElementById('gt-cookie-modal');
    if (m) m.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  // ---------- Routing des actions ----------
  document.addEventListener('click', function (e) {
    const target = e.target.closest('[data-gt-action]');
    if (!target) return;
    const action = target.getAttribute('data-gt-action');

    if (action === 'all') {
      saveConsent('all');
      hideBanner();
      closeModal();
    } else if (action === 'necessary') {
      saveConsent('necessary');
      hideBanner();
      closeModal();
    } else if (action === 'customize') {
      openModal();
    } else if (action === 'close-modal') {
      closeModal();
    } else if (action === 'save') {
      const modal = document.getElementById('gt-cookie-modal');
      if (!modal) return;
      const categories = { necessary: true };
      modal.querySelectorAll('input[data-gt-cat]').forEach((cb) => {
        if (cb.disabled) return;
        categories[cb.getAttribute('data-gt-cat')] = cb.checked;
      });
      saveConsent(categories);
      hideBanner();
      closeModal();
    }
  });

  // ---------- API publique ----------
  window.GoodTaxiCookies = {
    open: function () { openModal(); },
    reset: function () { clearConsent(); showBanner(); },
    get: getConsent,
  };

  // ---------- Initialisation ----------
  function init() {
    const consent = getConsent();
    if (!consent) {
      // Premier visiteur ou consentement expiré → afficher la bannière
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
