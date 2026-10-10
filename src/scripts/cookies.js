/**
 * .1VOYSY — Cookie Consent & Data Protection Module
 * Implements compliant, accessible cookie management with granular categories:
 * - Necessary (Необходимые)
 * - Functional (Функциональные)
 * - Analytics (Аналитические)
 * - Marketing (Маркетинговые)
 */

const STORAGE_KEY = 'voysy_cookie_consent';
const CONSENT_VERSION = '1.0';

const DEFAULT_CONSENT = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: null,
  version: CONSENT_VERSION
};

/**
 * Get stored consent or null if not yet decided
 */
export function getSavedConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === CONSENT_VERSION) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Save consent preferences and notify listeners
 */
export function saveConsent(preferences) {
  const consent = {
    necessary: true,
    functional: Boolean(preferences.functional),
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch (e) {
    console.warn('Unable to persist cookie consent to localStorage', e);
  }

  window.voysyConsent = consent;
  window.dispatchEvent(new CustomEvent('voysy:consent-changed', { detail: consent }));

  // Handle optional analytics initialization if consent is given
  applyConsentState(consent);

  return consent;
}

/**
 * Check if a specific category is consented
 */
export function hasConsent(category) {
  if (category === 'necessary') return true;
  const current = getSavedConsent();
  return Boolean(current && current[category]);
}

/**
 * Handle runtime script gating based on consent
 */
function applyConsentState(consent) {
  if (consent.analytics) {
    // If analytics integration is registered, activate it
    if (typeof window.voysyActivateAnalytics === 'function') {
      window.voysyActivateAnalytics();
    }
  }
}

/**
 * Initialize Cookie Banner and Preferences Modal
 */
export function initCookieConsent() {
  // If already initialized on DOM, do not duplicate
  if (document.getElementById('voysy-cookie-banner')) return;

  renderMarkup();
  bindEvents();

  const saved = getSavedConsent();
  if (saved) {
    window.voysyConsent = saved;
    applyConsentState(saved);
  } else {
    // Show banner on first visit
    showBanner();
  }
}

function renderMarkup() {
  // 1. Floating Banner
  const banner = document.createElement('aside');
  banner.id = 'voysy-cookie-banner';
  banner.className = 'voysy-cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Настройки использования cookies');
  banner.innerHTML = `
    <div class="cookie-banner-header">
      <span class="cookie-banner-tag">[ ПРИВАТНОСТЬ И COOKIES ]</span>
    </div>
    <h3 class="cookie-banner-title">Мы используем cookies</h3>
    <p class="cookie-banner-text">
      Мы используем cookies и аналогичные технологии для обеспечения работы сайта и сохранения настроек. Если на сайте используются дополнительные аналитические или маркетинговые технологии, они применяются в соответствии с вашим выбором и действующими правилами обработки данных. Вы можете принять все cookies, отклонить необязательные или настроить свой выбор.
      <br><a href="/privacy" class="cookie-policy-link">Подробнее в Политике конфиденциальности &rarr;</a>
    </p>
    <div class="cookie-banner-actions">
      <div class="cookie-banner-btn-group">
        <button type="button" id="cookie-accept-all" class="cookie-btn cookie-btn-primary">Принять все</button>
        <button type="button" id="cookie-reject-optional" class="cookie-btn cookie-btn-secondary">Отклонить необязательные</button>
      </div>
      <button type="button" id="cookie-open-settings" class="cookie-btn cookie-btn-tertiary">Настроить выбор &rarr;</button>
    </div>
  `;
  document.body.appendChild(banner);

  // 2. Preferences Modal
  const modalBackdrop = document.createElement('div');
  modalBackdrop.id = 'voysy-cookie-modal-backdrop';
  modalBackdrop.className = 'voysy-cookie-modal-backdrop';
  modalBackdrop.setAttribute('aria-hidden', 'true');
  modalBackdrop.innerHTML = `
    <div class="voysy-cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
      <div class="cookie-modal-header">
        <h3 id="cookie-modal-title" class="cookie-modal-title">Настройки cookies</h3>
        <button type="button" id="cookie-modal-close" class="cookie-modal-close" aria-label="Закрыть настройки">&times;</button>
      </div>
      <div class="cookie-modal-body">
        <p class="cookie-modal-lead">
          Управляйте категориями файлов cookie и аналогичных технологий. Необходимые технологии требуются для стабильной и безопасной работы сайта и не могут быть отключены.
        </p>

        <!-- Category: Necessary -->
        <div class="cookie-category-card">
          <div class="cookie-category-header">
            <div class="cookie-category-label-wrap">
              <span class="cookie-category-name">Необходимые</span>
              <span class="cookie-category-badge is-mandatory">Всегда активны</span>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" checked disabled aria-label="Необходимые cookies всегда активны">
              <span class="cookie-switch-slider"></span>
            </label>
          </div>
          <p class="cookie-category-desc">
            Технологии, без которых сайт не может корректно работать: базовые функции навигации, безопасность, отображение интерфейса и сохранение выбранных вами параметров согласия.
          </p>
        </div>

        <!-- Category: Functional -->
        <div class="cookie-category-card">
          <div class="cookie-category-header">
            <div class="cookie-category-label-wrap">
              <span class="cookie-category-name">Функциональные</span>
              <span class="cookie-category-badge">По выбору</span>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" id="cookie-pref-functional">
              <span class="cookie-switch-slider"></span>
            </label>
          </div>
          <p class="cookie-category-desc">
            Дополнительные функции и сохранение предпочтений пользователя (сохранение индивидуальных настроек интерфейса, тем или локальных параметров взаимодействия).
          </p>
        </div>

        <!-- Category: Analytics -->
        <div class="cookie-category-card">
          <div class="cookie-category-header">
            <div class="cookie-category-label-wrap">
              <span class="cookie-category-name">Аналитические</span>
              <span class="cookie-category-badge">По выбору</span>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" id="cookie-pref-analytics">
              <span class="cookie-switch-slider"></span>
            </label>
          </div>
          <p class="cookie-category-desc">
            Измерение посещаемости, источников трафика и поведения пользователей для улучшения архитектуры сайта, скорости загрузки и удобства страниц.
          </p>
        </div>

        <!-- Category: Marketing -->
        <div class="cookie-category-card">
          <div class="cookie-category-header">
            <div class="cookie-category-label-wrap">
              <span class="cookie-category-name">Маркетинговые</span>
              <span class="cookie-category-badge">По выбору</span>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" id="cookie-pref-marketing">
              <span class="cookie-switch-slider"></span>
            </label>
          </div>
          <p class="cookie-category-desc">
            Рекламные и маркетинговые технологии для оценки эффективности кампаний и персонализации предложений. На сайте .1VOYSY сторонние рекламные сети не подключаются без вашего согласия.
          </p>
        </div>
      </div>
      <div class="cookie-modal-footer">
        <button type="button" id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">Сохранить выбор</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalBackdrop);
}

function bindEvents() {
  const banner = document.getElementById('voysy-cookie-banner');
  const modalBackdrop = document.getElementById('voysy-cookie-modal-backdrop');

  const btnAcceptAll = document.getElementById('cookie-accept-all');
  const btnRejectOptional = document.getElementById('cookie-reject-optional');
  const btnOpenSettings = document.getElementById('cookie-open-settings');
  const btnCloseModal = document.getElementById('cookie-modal-close');
  const btnSavePrefs = document.getElementById('cookie-save-preferences');

  if (btnAcceptAll) {
    btnAcceptAll.addEventListener('click', () => {
      saveConsent({ functional: true, analytics: true, marketing: true });
      hideBanner();
      hideModal();
    });
  }

  if (btnRejectOptional) {
    btnRejectOptional.addEventListener('click', () => {
      saveConsent({ functional: false, analytics: false, marketing: false });
      hideBanner();
      hideModal();
    });
  }

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      openCookieSettings();
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      hideModal();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        hideModal();
      }
    });
  }

  if (btnSavePrefs) {
    btnSavePrefs.addEventListener('click', () => {
      const functional = Boolean(document.getElementById('cookie-pref-functional')?.checked);
      const analytics = Boolean(document.getElementById('cookie-pref-analytics')?.checked);
      const marketing = Boolean(document.getElementById('cookie-pref-marketing')?.checked);

      saveConsent({ functional, analytics, marketing });
      hideModal();
      hideBanner();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop?.classList.contains('is-active')) {
      hideModal();
    }
  });

  // Global listeners for buttons requesting settings panel
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-cookie-settings]');
    if (trigger) {
      e.preventDefault();
      openCookieSettings();
    }
  });
}

export function showBanner() {
  const banner = document.getElementById('voysy-cookie-banner');
  if (banner) {
    banner.classList.add('is-active');
  }
}

export function hideBanner() {
  const banner = document.getElementById('voysy-cookie-banner');
  if (banner) {
    banner.classList.remove('is-active');
  }
}

export function openCookieSettings() {
  const modalBackdrop = document.getElementById('voysy-cookie-modal-backdrop');
  if (!modalBackdrop) return;

  const current = getSavedConsent() || DEFAULT_CONSENT;

  const funcInput = document.getElementById('cookie-pref-functional');
  const analInput = document.getElementById('cookie-pref-analytics');
  const markInput = document.getElementById('cookie-pref-marketing');

  if (funcInput) funcInput.checked = Boolean(current.functional);
  if (analInput) analInput.checked = Boolean(current.analytics);
  if (markInput) markInput.checked = Boolean(current.marketing);

  modalBackdrop.classList.add('is-active');
  modalBackdrop.setAttribute('aria-hidden', 'false');

  const closeBtn = document.getElementById('cookie-modal-close');
  if (closeBtn) closeBtn.focus();
}

export function hideModal() {
  const modalBackdrop = document.getElementById('voysy-cookie-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('is-active');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }
}
