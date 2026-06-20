const DashboardView = {
  async render() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="quick-actions">
        <a href="#billing" class="quick-action-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          <span>New Bill</span>
        </a>
        <a href="#customers" class="quick-action-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          <span>Add Customer</span>
        </a>
        <a href="#payments" class="quick-action-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
          <span>Record Payment</span>
        </a>
        <a href="#reports" class="quick-action-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <span>View Reports</span>
        </a>
      </div>
      <div class="stat-cards" id="stat-cards"></div>
      <div class="card">
        <div class="card-header">
          <h2>Recent Bills</h2>
          <a href="#billing" class="btn btn-sm btn-primary">View All</a>
        </div>
        <div class="card-body" id="recent-bills">
          <div class="loading-screen"><div class="spinner"></div></div>
        </div>
      </div>`;
    await this._loadStats();
    await this._loadRecentBills();
  },

  async _loadStats() {
    const bills = await Store.getAll('bills');
    const customers = await Store.getAll('customers');
    const todayBills = bills.filter(b => {
      const today = new Date().toDateString();
      return new Date(b.createdAt).toDateString() === today;
    });
    const totalIncome = bills.reduce((s, b) => s + (b.status === 'paid' ? b.total : (b.paid || 0)), 0);
    const totalPending = bills.reduce((s, b) => s + (b.due || 0), 0);
    const totalLoss = bills.reduce((s, b) => s + (b.status === 'loss' ? b.total : 0), 0);

    const container = document.getElementById('stat-cards');
    container.innerHTML = `
      ${UI.statCard(
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
        customers.length, 'Total Customers', 'primary'
      )}
      ${UI.statCard(
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        UI.formatCurrency(totalIncome), 'Total Income', 'success'
      )}
      ${UI.statCard(
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
        UI.formatCurrency(totalPending), 'Pending Dues', 'warning'
      )}
      ${UI.statCard(
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        UI.formatCurrency(totalIncome - totalLoss), 'Net Income', 'info'
      )}`;
  },

  async _loadRecentBills() {
    const container = document.getElementById('recent-bills');
    const bills = await Store.getAll('bills');
    if (bills.length === 0) {
      UI.showEmpty(container, {
        title: 'No bills yet',
        message: 'Create your first bill to start tracking income.',
        icon: 'bill',
        action: '<a href="#billing" class="btn btn-primary">Create Bill</a>'
      });
      return;
    }
    const recent = bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const rows = recent.map(b => `
      <tr>
        <td><strong>${b.customerName || 'Unknown'}</strong></td>
        <td>${UI.formatCurrency(b.total)}</td>
        <td>${UI.formatCurrency(b.paid || 0)}</td>
        <td>${UI.formatCurrency(b.due || 0)}</td>
        <td>${UI.badge(b.status)}</td>
        <td>${UI.formatDate(b.createdAt)}</td>
      </tr>`).join('');
    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }
};
