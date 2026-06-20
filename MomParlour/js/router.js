const Router = {
  routes: {},
  currentRoute: null,
  guards: [],

  register(name, handler) {
    this.routes[name] = handler;
  },

  navigate(hash) {
    const route = hash.replace(/^#/, '') || 'dashboard';
    for (const guard of this.guards) {
      const result = guard(route);
      if (result === false) return;
    }
    if (this.routes[route]) {
      this.currentRoute = route;
      this.routes[route]();
      this._updateNav(route);
      this._updateTitle(route);
    } else if (route === 'login' || route === 'signup') {
      this.currentRoute = route;
      this.routes[route]();
      this._updateNav(route);
      this._updateTitle(route);
    } else {
      window.location.hash = '#dashboard';
    }
  },

  _updateNav(route) {
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === route);
    });
  },

  _updateTitle(route) {
    const titles = {
      dashboard: 'Dashboard', customers: 'Customers', services: 'Services',
      billing: 'Billing', payments: 'Payments', reports: 'Reports',
      profile: 'Profile', login: 'Sign In', signup: 'Create Account'
    };
    const titleEl = document.querySelector('#page-title h1');
    if (titleEl && titles[route]) titleEl.textContent = titles[route];
    document.title = `${titles[route] || 'Dashboard'} — Glamora`;
  },

  addGuard(fn) {
    this.guards.push(fn);
  },

  init() {
    window.addEventListener('hashchange', () => this.navigate(window.location.hash));
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#dashboard';
    } else {
      this.navigate(window.location.hash);
    }
  }
};
