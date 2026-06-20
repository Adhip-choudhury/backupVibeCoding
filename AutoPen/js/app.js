(function () {
  let currentScreen = 'dashboard';
  let currentCustomerId = null;

  const $ = (id) => document.getElementById(id);
  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => (ctx || document).querySelectorAll(sel);

  async function init() {
    try {
      await DB.ready;
    } catch (e) {
      console.warn('DB init:', e);
    }
    await i18n.init();

    const savedUser = DB.getSavedUser();
    if (savedUser) {
      showApp();
      bindEvents();
      updateOfflineBanner();
      updateLangLabel();
      updateSidebarUser();
      const hash = location.hash.replace('#/', '') || 'dashboard';
      navigate(hash);
    } else {
      showAuth();
      bindAuthEvents();
    }

    window.addEventListener('online', updateOfflineBanner);
    window.addEventListener('offline', updateOfflineBanner);
  }

  function showAuth() { $('auth-screen').classList.remove('hidden'); $('main-app').classList.add('hidden'); }
  function showApp() { $('auth-screen').classList.add('hidden'); $('main-app').classList.remove('hidden'); }

  function bindAuthEvents() {
    $('show-signup').addEventListener('click', (e) => { e.preventDefault(); $('login-form').classList.add('hidden'); $('signup-form').classList.remove('hidden'); });
    $('show-login').addEventListener('click', (e) => { e.preventDefault(); $('signup-form').classList.add('hidden'); $('login-form').classList.remove('hidden'); });

    $('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const phone = $('login-phone').value.trim();
      const password = $('login-password').value.trim();
      if (!phone) { showToast(i18n.t('auth.phoneRequired'), 'error'); return; }
      if (!password) { showToast(i18n.t('auth.passwordRequired'), 'error'); return; }
      try {
        await DB.loginUser(phone, password);
        showToast(i18n.t('auth.loginSuccess'), 'success');
        updateSidebarUser(); showApp(); bindEvents(); updateOfflineBanner(); updateLangLabel();
        navigate('dashboard'); location.hash = '#/dashboard';
      } catch (err) {
        const msg = DB._authErrorToMessage ? DB._authErrorToMessage(err) : err.message;
        showToast(msg, 'error');
      }
    });

    $('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('signup-name').value.trim();
      const phone = $('signup-phone').value.trim();
      const password = $('signup-password').value.trim();
      const confirm = $('signup-confirm').value.trim();
      if (!name) { showToast(i18n.t('auth.nameRequired'), 'error'); return; }
      if (!phone) { showToast(i18n.t('auth.phoneRequired'), 'error'); return; }
      if (!password) { showToast(i18n.t('auth.passwordRequired'), 'error'); return; }
      if (password !== confirm) { showToast(i18n.t('auth.passwordMismatch'), 'error'); return; }
      try {
        await DB.registerUser(name, phone, password);
        showToast(i18n.t('auth.registerSuccess'), 'success');
        updateSidebarUser(); showApp(); bindEvents(); updateOfflineBanner(); updateLangLabel();
        navigate('dashboard'); location.hash = '#/dashboard';
      } catch (err) {
        const msg = DB._authErrorToMessage ? DB._authErrorToMessage(err) : err.message;
        showToast(msg, 'error');
      }
    });
  }

  function updateSidebarUser() {
    if (DB.currentUser) { $('sidebar-user-name').textContent = DB.currentUser.name; $('sidebar-user-avatar').textContent = DB.currentUser.name[0].toUpperCase(); }
  }

  function navigate(screen, params) {
    currentScreen = screen;
    if (params && params.customerId) currentCustomerId = params.customerId;
    qsa('.screen').forEach(s => s.classList.remove('active'));
    const target = qs(`[data-screen="${screen}"]`);
    if (target) target.classList.add('active');
    qsa('.sidebar-item[data-nav]').forEach(item => item.classList.toggle('active', item.dataset.nav === screen));
    qsa('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.nav === screen));
    $('page-title').textContent = i18n.t(`screen.${screen}`);
    closeSidebar();
    switch (screen) {
      case 'dashboard': renderDashboard(); break;
      case 'customers': renderCustomers(); break;
      case 'customer-detail': renderCustomerDetail(currentCustomerId); break;
      case 'add-customer': resetCustomerForm(); break;
      case 'add-transaction': initTransactionForm(params?.customerId); break;
      case 'payments': renderPayments(); break;
    }
  }

  function openSidebar() { $('sidebar').classList.add('open'); $('sidebar-overlay').classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeSidebar() { $('sidebar').classList.remove('open'); $('sidebar-overlay').classList.remove('open'); document.body.style.overflow = ''; }
  function openModal(id) { const m = $(id); if (!m) return; m.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeModal(id) { const m = $(id); if (!m) return; m.classList.remove('active'); document.body.style.overflow = ''; }

  function bindEvents() {
    qsa('.sidebar-item[data-nav]').forEach(btn => { btn.addEventListener('click', () => { location.hash = `#/${btn.dataset.nav}`; }); });
    qsa('.nav-item').forEach(btn => { btn.addEventListener('click', () => { location.hash = `#/${btn.dataset.nav}`; }); });
    window.addEventListener('hashchange', () => { navigate(location.hash.replace('#/', '') || 'dashboard'); });
    $('menu-toggle').addEventListener('click', () => { $('sidebar').classList.contains('open') ? closeSidebar() : openSidebar(); });
    $('sidebar-overlay').addEventListener('click', closeSidebar);
    $('lang-btn').addEventListener('click', () => { updateLangModal(); openModal('lang-modal'); });
    $('sidebar-lang-btn').addEventListener('click', () => { updateLangModal(); openModal('lang-modal'); });
    $('lang-modal-close').addEventListener('click', () => { closeModal('lang-modal'); });
    $('lang-modal').addEventListener('click', (e) => { if (e.target === $('lang-modal')) closeModal('lang-modal'); });
    qsa('.lang-card').forEach(card => { card.addEventListener('click', async () => { await i18n.switchTo(card.dataset.lang); updateLangLabel(); closeModal('lang-modal'); updateTitleForCurrentScreen(); refreshCurrentScreen(); updateLangModal(); }); });
    $('sidebar-logout').addEventListener('click', () => { DB.logoutUser(); showAuth(); bindAuthEvents(); });
    $('add-customer-btn').addEventListener('click', () => { location.hash = '#/add-customer'; });
    $('customer-search').addEventListener('input', renderCustomers);
    $('customer-form').addEventListener('submit', handleCustomerFormSubmit);
    $('cf-cancel').addEventListener('click', () => { location.hash = '#/customers'; });
    $('transaction-form').addEventListener('submit', handleTransactionSubmit);
    $('tf-cancel').addEventListener('click', () => { location.hash = currentCustomerId ? '#/customer-detail' : '#/customers'; });
    qsa('#tf-type-selector .tx-type-option').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('#tf-type-selector .tx-type-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        $('tf-type').value = btn.dataset.value;
        const pmGroup = $('pm-group');
        if (btn.dataset.value === 'received') {
          pmGroup.style.display = 'block';
        } else {
          pmGroup.style.display = 'none';
          $('tf-pm').value = '';
          qsa('.pm-option').forEach(b => b.classList.remove('selected'));
        }
      });
    });
    qsa('.pm-option').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.pm-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        $('tf-pm').value = btn.dataset.value;
      });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if ($('lang-modal').classList.contains('active')) closeModal('lang-modal'); if ($('sidebar').classList.contains('open')) closeSidebar(); } });
  }

  function updateLangLabel() { $('sidebar-lang-label').textContent = { en: 'English', hi: 'Hindi', mr: 'Marathi' }[i18n.currentLang] || 'English'; }
  function updateLangModal() { qsa('.lang-card').forEach(card => card.classList.toggle('active', card.dataset.lang === i18n.currentLang)); }
  function updateTitleForCurrentScreen() { $('page-title').textContent = i18n.t(`screen.${currentScreen}`); }

  // ============ DASHBOARD ============
  async function renderDashboard() {
    const container = $('dashboard-content');
    showLoading(container);
    try {
      const stats = await DB.getDashboardStats();
      const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      container.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card stat-highlight"><div class="stat-icon">T</div><div class="stat-value">Rs${formatNum(stats.todayIncome)}</div><div class="stat-label">${i18n.t('dashboard.todayEarned')}</div><div class="stat-trend">${todayStr}</div></div>
          <div class="stat-card stat-active"><div class="stat-icon">A</div><div class="stat-value">${stats.activeCustomers}</div><div class="stat-label">${i18n.t('dashboard.activeCustomers')}</div></div>
          <div class="stat-card stat-pending"><div class="stat-icon">P</div><div class="stat-value">Rs${formatNum(stats.totalPending)}</div><div class="stat-label">${i18n.t('dashboard.totalPending')}</div></div>
          <div class="stat-card stat-received"><div class="stat-icon">R</div><div class="stat-value">Rs${formatNum(stats.totalReceived)}</div><div class="stat-label">${i18n.t('dashboard.totalReceived')}</div></div>
          <div class="stat-card ${stats.overdueCount > 0 ? 'stat-overdue' : ''}"><div class="stat-icon">O</div><div class="stat-value">${stats.overdueCount}</div><div class="stat-label">${i18n.t('dashboard.overdueCount')}</div></div>
          <div class="stat-card stat-rate"><div class="stat-icon">C</div><div class="stat-value">${stats.collectionRate}%</div><div class="stat-label">${i18n.t('dashboard.collectionRate')}</div></div>
        </div>
        ${stats.overdueCount > 0 ? `<div class="reminder-bar"><span class="reminder-icon">!</span> ${stats.overdueCount} customer${stats.overdueCount > 1 ? 's' : ''} ${stats.overdueCount > 1 ? 'have' : 'has'} unpaid dues</div>` : ''}
        <div class="card"><div class="card-title">${i18n.t('dashboard.quickActions')}</div><div class="quick-actions">
          <button class="quick-action-btn qa-add-customer" onclick="location.hash='#/add-customer'"><div class="qa-icon">+</div><div class="qa-label">${i18n.t('dashboard.addCustomer')}</div></button>
          <button class="quick-action-btn qa-add-payment" onclick="location.hash='#/add-transaction'"><div class="qa-icon">Rs</div><div class="qa-label">${i18n.t('dashboard.addPayment')}</div></button>
          <button class="quick-action-btn qa-insights" onclick="location.hash='#/payments'"><div class="qa-icon">%</div><div class="qa-label">${i18n.t('dashboard.viewPayments')}</div></button>
        </div></div>
        ${stats.todayIncome === 0 && stats.totalPending === 0 ? `<div class="card"><div class="empty-state"><h3>${i18n.t('dashboard.noData')}</h3><p>Start by adding a customer or recording your first payment.</p></div></div>` : ''}`;
    } catch (err) { container.innerHTML = `<div class="card"><div class="empty-state"><p>Error loading dashboard</p></div></div>`; }
  }

  // ============ CUSTOMERS ============
  async function renderCustomers() {
    const container = $('customers-list');
    showLoading(container);
    const query = $('customer-search').value.trim();
    try {
      let customers = query ? await DB.searchCustomers(query) : await DB.getAllCustomers();
      if (customers.length === 0) { container.innerHTML = `<div class="empty-state"><div class="empty-letter">N</div><h3>${i18n.t('customer.noCustomers')}</h3><p>Add your first customer to start tracking dues and payments.</p></div>`; return; }
      customers.sort((a, b) => (b.balance || 0) - (a.balance || 0));
      container.innerHTML = `<div class="customer-list">${customers.map(c => {
        const initial = (c.name || '?')[0].toUpperCase();
        const bal = c.balance || 0;
        const balClass = bal > 0 ? 'positive' : bal < 0 ? 'negative' : 'zero';
        const balLabel = bal > 0 ? `Rs${formatNum(bal)}` : bal < 0 ? `-Rs${formatNum(Math.abs(bal))}` : 'Rs0';
        return `<div class="customer-item" data-id="${c.id}"><div class="ci-left"><div class="ci-avatar">${initial}</div><div class="ci-info"><div class="ci-name">${escHtml(c.name)}</div><div class="ci-sub">${c.location ? escHtml(c.location) : c.phone ? escHtml(c.phone) : ''}</div></div></div><div class="ci-right"><div class="ci-amount ${balClass}">${balLabel}</div><div class="ci-chevron">&gt;</div></div></div>`;
      }).join('')}</div>`;
      qsa('.customer-item').forEach(item => { item.addEventListener('click', () => { currentCustomerId = item.dataset.id; location.hash = '#/customer-detail'; }); });
    } catch (err) { container.innerHTML = `<div class="empty-state"><p>Error loading customers</p></div>`; }
  }

  // ============ CUSTOMER DETAIL ============
  async function renderCustomerDetail(id) {
    const container = $('customer-detail-content');
    showLoading(container);
    try {
      const customer = await DB.getCustomer(id);
      if (!customer) { container.innerHTML = `<div class="empty-state"><p>Customer not found</p></div>`; return; }
      const transactions = await DB.getCustomerTransactions(id);
      const bal = customer.balance || 0;
      const balClass = bal > 0 ? 'positive' : bal < 0 ? 'negative' : 'zero';
      const balLabelText = bal > 0 ? `Rs${formatNum(bal)} ${i18n.t('customer.pending')}` : bal < 0 ? `Rs${formatNum(Math.abs(bal))} ${i18n.t('customer.received')}` : 'Rs0';
      const initial = (customer.name || '?')[0].toUpperCase();
      container.innerHTML = `
        <div class="card customer-header-card">
          <div class="ch-avatar">${initial}</div>
          <div class="ch-info">
            <div class="ch-name">${escHtml(customer.name)}</div>
            ${customer.phone ? `<div class="ch-contact">Phone: ${escHtml(customer.phone)}</div>` : ''}
            ${customer.location ? `<div class="ch-contact">Location: ${escHtml(customer.location)}</div>` : ''}
          </div>
          <div class="ch-right"><div class="balance-badge ${balClass}">${balLabelText}</div></div>
        </div>
        ${bal > 0 ? `<div class="reminder-bar"><span class="reminder-icon">!</span> This customer has unpaid dues of Rs${formatNum(bal)}</div>` : ''}
        <div class="detail-actions mb-16">
          <button class="btn btn-accent flex-1 btn-lg" id="cd-add-tx"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> ${i18n.t('transaction.add')}</button>
          <button class="btn btn-outline flex-1 btn-lg" id="cd-edit-customer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> ${i18n.t('common.edit')}</button>
          <button class="btn btn-outline btn-danger flex-1 btn-lg" id="cd-delete-customer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete</button>
        </div>
        <div class="card"><div class="card-title">${i18n.t('customer.transactions')}</div>
          ${transactions.length === 0
            ? `<div class="empty-state"><p>${i18n.t('transaction.noTransactions')}</p></div>`
            : `<div class="tx-list">${transactions.map(tx => {
                const txClass = tx.type === 'received' ? 'positive' : 'negative';
                const prefix = tx.type === 'received' ? '+' : '-';
                const date = new Date(tx.date);
                const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const pmBadge = tx.paymentMode ? `<span class="pm-badge">${tx.paymentMode === 'upi' ? 'UPI' : 'Cash'}</span>` : '';
                return `<div class="tx-item"><div class="tx-icon ${tx.type}">${tx.type === 'received' ? 'R' : 'P'}</div><div class="tx-info"><div class="tx-type">${i18n.t(`transaction.${tx.type}`)} ${pmBadge}</div><div class="tx-meta"><span>${dateStr}</span><span>${timeStr}</span></div></div><div class="tx-amount ${txClass}">${prefix}Rs${formatNum(tx.amount)}</div></div>`;
              }).join('')}</div>`
          }
        </div>`;
      $('cd-add-tx').addEventListener('click', () => { currentCustomerId = id; location.hash = '#/add-transaction'; });
      $('cd-edit-customer').addEventListener('click', () => { populateCustomerForm(customer); location.hash = '#/add-customer'; });
      const delBtn = $('cd-delete-customer');
      if (delBtn) delBtn.addEventListener('click', async () => {
        if (await confirmAction(i18n.t('customer.deleteConfirm'))) {
          try {
            await DB.deleteCustomer(id);
            showToast('Customer deleted', 'success');
            navigate('customers');
            location.hash = '#/customers';
          } catch (e) { showToast('Error deleting customer', 'error'); }
        }
      });
    } catch (err) { container.innerHTML = `<div class="empty-state"><p>Error loading customer</p></div>`; }
  }

  // ============ CUSTOMER FORM ============
  function resetCustomerForm() {
    $('cf-customer-id').value = ''; $('cf-name').value = ''; $('cf-phone').value = ''; $('cf-location').value = '';
    qs('#customer-form button[type="submit"]').textContent = i18n.t('customer.save');
    qs('.screen-header h3').textContent = i18n.t('customer.add');
  }

  function populateCustomerForm(customer) {
    $('cf-customer-id').value = customer.id; $('cf-name').value = customer.name || '';
    $('cf-phone').value = customer.phone || ''; $('cf-location').value = customer.location || '';
    qs('#customer-form button[type="submit"]').textContent = i18n.t('common.save');
    qs('.screen-header h3').textContent = i18n.t('customer.edit');
  }

  async function handleCustomerFormSubmit(e) {
    e.preventDefault();
    const id = $('cf-customer-id').value;
    const data = { name: $('cf-name').value.trim(), phone: $('cf-phone').value.trim(), location: $('cf-location').value.trim() };
    if (!data.name) { showToast(i18n.t('error.required'), 'error'); return; }
    try {
      if (id) { await DB.updateCustomer(id, data); showToast('Customer updated', 'success'); }
      else { await DB.addCustomer(data); showToast('Customer added', 'success'); }
      navigate('customers'); location.hash = '#/customers';
    } catch (err) { showToast(i18n.t('error.save'), 'error'); }
  }

  // ============ TRANSACTION FORM ============
  async function initTransactionForm(preSelectedCustomerId) {
    $('tf-customer-id').value = ''; $('tf-type').value = ''; $('tf-amount').value = ''; $('tf-pm').value = '';
    qsa('#tf-type-selector .tx-type-option').forEach(b => b.classList.remove('selected'));
    qsa('.pm-option').forEach(b => b.classList.remove('selected'));
    $('pm-group').style.display = 'none';
    const customers = await DB.getAllCustomers();
    const select = $('tf-customer-select');
    select.innerHTML = '<option value="">Choose a customer...</option>' + customers.map(c => `<option value="${c.id}">${escHtml(c.name)}${c.phone ? ` (${escHtml(c.phone)})` : ''}</option>`).join('');
    const cid = preSelectedCustomerId || currentCustomerId;
    if (cid && customers.some(c => c.id === cid)) { select.value = cid; $('tf-customer-id').value = cid; }
  }

  async function handleTransactionSubmit(e) {
    e.preventDefault();
    const customerId = $('tf-customer-id').value || $('tf-customer-select').value;
    const type = $('tf-type').value;
    const amount = parseFloat($('tf-amount').value);
    const paymentMode = type === 'received' ? $('tf-pm').value : null;
    if (!customerId) { showToast(i18n.t('transaction.selectCustomer'), 'error'); return; }
    if (!type) { showToast('Please select a transaction type', 'error'); return; }
    if (!amount || amount <= 0) { showToast(i18n.t('error.amount'), 'error'); return; }
    if (type === 'received' && !paymentMode) { showToast('Select payment mode (Cash or UPI)', 'error'); return; }
    try {
      const txData = { customerId, type, amount, date: new Date().toISOString() };
      if (paymentMode) txData.paymentMode = paymentMode;
      await DB.addTransaction(txData);
      showToast(i18n.t('transaction.updated'), 'success');
      currentCustomerId = customerId;
      navigate('customer-detail', { customerId });
      location.hash = '#/customer-detail';
    } catch (err) { showToast(i18n.t('error.save'), 'error'); }
  }

  // ============ PAYMENTS / ANALYTICS ============
  async function renderPayments() {
    const container = $('payments-content');
    showLoading(container);
    try {
      const a = await DB.getIncomeAnalytics();

      const monthName = new Date().toLocaleDateString('en-IN', { month: 'long' });
      const barMax = a.maxDaily || 1;

      let dailyBars = '';
      for (const d of a.dailyData) {
        const pct = Math.max(2, (d.amount / barMax) * 100);
        const isToday = d.day === new Date().getDate();
        const cls = `chart-bar${isToday ? ' today' : ''}${d.isWeekend ? ' weekend' : ''}${d.amount === 0 ? ' zero' : ''}`;
        dailyBars += `<div class="chart-bar-wrapper"><div class="${cls}" style="height:${pct}%" title="Day ${d.day}: Rs${formatNum(d.amount)}"></div><span class="chart-bar-label">${d.day}</span></div>`;
      }

      let dowBars = '';
      const dowMax = Math.max(...Object.values(a.dayOfWeekAvg), 1);
      for (const [day, avg] of Object.entries(a.dayOfWeekAvg)) {
        const pct = (avg / dowMax) * 100;
        const isBest = day === a.bestDay;
        dowBars += `<div class="dow-row"><span class="dow-label">${day.slice(0, 3)}</span><div class="dow-bar-bg"><div class="dow-bar-fill${isBest ? ' best' : ''}" style="width:${pct}%"></div></div><span class="dow-amount">Rs${formatNum(avg)}</span></div>`;
      }

      const growthSymbol = a.growthRate >= 0 ? '+' : '-';
      const growthClass = a.growthRate >= 0 ? 'up' : 'down';
      const prevMonthStr = new Date(a.daysElapsed > 0 ? Date.now() - 30 * 24 * 60 * 60 * 1000 : Date.now()).toLocaleDateString('en-IN', { month: 'short' });

      container.innerHTML = `
        <div class="analytics-summary">
          <div class="analytics-card ac-primary">
            <div class="ac-label">${monthName} ${i18n.t('payments.totalIncome')}</div>
            <div class="ac-value">Rs${formatNum(a.totalThisMonth)}</div>
            <div class="ac-trend ${growthClass}">${growthSymbol} ${Math.abs(a.growthRate)}% vs last 15 days</div>
          </div>
          <div class="analytics-card ac-project">
            <div class="ac-label">${i18n.t('payments.projectedNext')} ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-IN', { month: 'short' })}</div>
            <div class="ac-value">Rs${formatNum(a.projectedNextMonth)}</div>
            <div class="ac-trend ${a.projectedNextMonth >= a.totalThisMonth ? 'up' : 'down'}">${a.projectedNextMonth >= a.totalThisMonth ? '+' : '-'} based on trend analysis</div>
          </div>
        </div>
        <div class="chart-section">
          <h3>${i18n.t('payments.dailyIncome')} - ${monthName}</h3>
          <div class="daily-chart">${dailyBars}</div>
        </div>
        <div class="chart-section">
          <h3>${i18n.t('payments.dayWiseAvg')} (Last 90 days)</h3>
          <div class="dow-chart">${dowBars}</div>
        </div>
        <div class="chart-section">
          <h3>${i18n.t('payments.insights')}</h3>
          <div class="insights-grid">
            <div class="insight-chip"><div class="ic-icon green">A</div><div class="ic-info"><div class="ic-label">${i18n.t('payments.dailyAvg')}</div><div class="ic-value">Rs${formatNum(a.dailyAvg)} / day</div></div></div>
            <div class="insight-chip"><div class="ic-icon blue">V</div><div class="ic-info"><div class="ic-label">${i18n.t('payments.earningVelocity')}</div><div class="ic-value">Rs${formatNum(a.earningVelocity)} / day</div></div></div>
            <div class="insight-chip"><div class="ic-icon amber">B</div><div class="ic-info"><div class="ic-label">${i18n.t('payments.bestDay')}</div><div class="ic-value">${a.bestDay} - Rs${formatNum(a.bestDayAmount)}</div></div></div>
            <div class="insight-chip"><div class="ic-icon purple">M</div><div class="ic-info"><div class="ic-label">${i18n.t('payments.monthComparison')}</div><div class="ic-value">${prevMonthStr}: Rs${formatNum(a.prevMonthTotal)} | ${monthName}: Rs${formatNum(a.totalThisMonth)}</div></div></div>
            <div class="insight-chip"><div class="ic-icon ${a.activeDays >= a.daysElapsed * 0.7 ? 'green' : 'amber'}">D</div><div class="ic-info"><div class="ic-label">${i18n.t('payments.activeDays')}</div><div class="ic-value">${a.activeDays} / ${a.daysElapsed} days (${Math.round(a.daysElapsed > 0 ? (a.activeDays / a.daysElapsed) * 100 : 0)}%)</div></div></div>
            <div class="insight-chip"><div class="ic-icon blue">N</div><div class="ic-info"><div class="ic-label">${i18n.t('payments.projectedLabel')}</div><div class="ic-value">Rs${formatNum(a.projectedNextMonth)} next month</div></div></div>
          </div>
        </div>`;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><div class="empty-letter">N</div><h3>${i18n.t('payments.noData')}</h3><p>Start recording transactions to see income analytics.</p></div>`;
    }
  }

  // ============ HELPERS ============
  function formatNum(n) { if (isNaN(n)) return '0'; return Number(n).toLocaleString('en-IN'); }
  function escHtml(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
  function showLoading(container) { if (container) container.innerHTML = '<div class="loading-container"><div class="spinner"></div><div class="loading-text">Loading...</div></div>'; }
  function showToast(message, type) { const c = $('toast-container'); const t = document.createElement('div'); t.className = 'toast' + (type ? ' ' + type : ''); t.textContent = message; c.appendChild(t); setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 3000); }
  function confirmAction(msg) { return new Promise((resolve) => { const overlay = document.createElement('div'); overlay.className = 'confirm-overlay'; overlay.innerHTML = `<div class="confirm-dialog"><div class="confirm-title">${escHtml(msg)}</div><div class="confirm-actions"><button class="btn btn-outline" id="confirm-no">Cancel</button><button class="btn btn-danger" id="confirm-yes">Delete</button></div></div>`; document.body.appendChild(overlay); requestAnimationFrame(() => overlay.classList.add('active')); const cleanup = () => { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); }; $('confirm-yes').addEventListener('click', () => { cleanup(); resolve(true); }); $('confirm-no').addEventListener('click', () => { cleanup(); resolve(false); }); overlay.addEventListener('click', (e) => { if (e.target === overlay) { cleanup(); resolve(false); } }); }); }
  function updateOfflineBanner() { $('offline-banner').classList.toggle('show', !navigator.onLine); }
  function refreshCurrentScreen() { navigate(currentScreen); }

  document.addEventListener('DOMContentLoaded', init);
})();
