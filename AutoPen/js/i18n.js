class I18n {
  constructor() {
    this.currentLang = localStorage.getItem('autokhata-lang') || 'en';
    this.translations = {};
  }

  async init() {
    await this.load(this.currentLang);
  }

  async load(lang) {
    try {
      const res = await fetch(`lang/${lang}.json`);
      this.translations = await res.json();
      this.currentLang = lang;
      localStorage.setItem('autokhata-lang', lang);
    } catch {
      if (lang !== 'en') {
        await this.load('en');
      }
    }
  }

  t(key, params = {}) {
    let str = this.translations[key] || key;
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  }

  async setLang(lang) {
    await this.load(lang);
    document.documentElement.lang = lang;
    this._updateUI();
  }

  _updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = this.t(key);
      } else {
        el.textContent = this.t(key);
      }
    });
  }

  async switchTo(lang) {
    await this.setLang(lang);
  }
}

const i18n = new I18n();
