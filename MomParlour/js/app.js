const firebaseConfig = {
  apiKey: "AIzaSyDvwMNzx1NjO0xMsvWjXOgfs1YtMWX8jnc",
  authDomain: "glamora-146d3.firebaseapp.com",
  projectId: "glamora-146d3",
  storageBucket: "glamora-146d3.firebasestorage.app",
  messagingSenderId: "453524875950",
  appId: "1:453524875950:web:56d886f6d95bd6f6de1b3f",
  measurementId: "G-XJKF0HKRJW"
};

const App = {
  async init() {
    await Store.init(firebaseConfig);

    const DEFAULT_SERVICES = [
      { name: 'Haircut', price: 300, category: 'hair' },
      { name: 'Hair Styling', price: 500, category: 'hair' },
      { name: 'Hair Color', price: 800, category: 'hair' },
      { name: 'Facial', price: 400, category: 'skin' },
      { name: 'Bleach', price: 600, category: 'skin' },
      { name: 'Manicure', price: 250, category: 'nails' },
      { name: 'Pedicure', price: 300, category: 'nails' },
      { name: 'Waxing', price: 200, category: 'hair' },
      { name: 'Threading', price: 50, category: 'hair' },
      { name: 'Massage', price: 600, category: 'spa' },
      { name: 'Body Scrub', price: 500, category: 'spa' },
      { name: 'Bridal Makeup', price: 2500, category: 'makeup' },
    ];
    await Store.seed('services', DEFAULT_SERVICES);

    Router.register('dashboard', () => DashboardView.render());
    Router.register('customers', () => CustomersView.render());
    Router.register('services', () => ServicesView.render());
    Router.register('billing', () => BillingView.render());
    Router.register('payments', () => PaymentsView.render());
    Router.register('reports', () => ReportsView.render());
    Router.register('profile', () => ProfileView.render());
    Router.register('login', () => LoginView.render());
    Router.register('signup', () => SignupView.render());

    Router.addGuard((route) => {
      const publicRoutes = ['login', 'signup'];
      if (publicRoutes.includes(route)) return true;
      if (!Store.isLoggedIn()) {
        window.location.hash = '#login';
        return false;
      }
      return true;
    });

    this._setupShell();
    Router.init();
  },

  afterLogin() {
    this._showApp();
    window.location.hash = '#dashboard';
  },

  afterLogout() {
    this._hideApp();
    window.location.hash = '#login';
  },

  _showApp() {
    document.getElementById('sidebar').style.display = 'flex';
    document.getElementById('main-content').style.display = 'flex';
    document.getElementById('bottom-nav').style.display = 'none';
    document.querySelector('.sidebar-footer').style.display = 'flex';
    const profileNav = document.querySelector('.nav-item[data-route="profile"]');
    if (profileNav) profileNav.style.display = 'flex';
  },

  _hideApp() {
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('bottom-nav').style.display = 'none';
  },

  _setupShell() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
    document.getElementById('sidebar-close').addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });

    function updateClock() {
      const now = new Date();
      const clock = document.getElementById('live-clock');
      if (clock) clock.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const dateEl = document.getElementById('topbar-date');
      if (dateEl) dateEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    updateClock();
    setInterval(updateClock, 10000);

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[onclick]');
      if (btn) {
        const attr = btn.getAttribute('onclick');
        if (attr) {
          try {
            (new Function(attr))();
          } catch (err) {
            console.warn('onclick eval failed:', attr, err);
          }
        }
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
