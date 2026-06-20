const BillingView = {
  _selectedServices: [],

  async render() {
    this._selectedServices = [];
    const content = document.getElementById('content');
    content.innerHTML = await this._renderForm();
    this._attachEvents();
    await this._loadRecent();
    this._updateUI();
  },

  async _renderForm() {
    const [customers, services] = await Promise.all([
      Store.getAll('customers'),
      Store.getAll('services')
    ]);
    const custOpts = customers.map(c =>
      `<option value="${c.id}">${c.name}${c.phone ? ' (' + c.phone + ')' : ''}</option>`
    ).join('');
    const svcOpts = services.map(s => `
      <div class="multiselect-option" data-id="${s.id}">
        <div class="multiselect-option-check">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="multiselect-option-info">
          <div class="multiselect-option-name">${s.name}</div>
          <div class="multiselect-option-price">${UI.formatCurrency(s.price)}</div>
        </div>
        <span class="multiselect-option-category">${s.category}</span>
      </div>
    `).join('') || '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:.85rem;">No services found.</div>';

    return `
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h2>New Bill</h2></div>
          <div class="card-body">
            <form id="bill-form">
              <div class="form-group">
                <label for="customerId">Customer <span style="color:var(--danger)">*</span></label>
                <select id="customerId" name="customerId" class="form-control" required>
                  <option value="">— Select Customer —</option>
                  ${custOpts}
                </select>
              </div>
              <div class="form-group">
                <label>Services <span style="color:var(--danger)">*</span></label>
                <div class="multiselect" id="service-multiselect">
                  <button type="button" class="multiselect-btn" id="ms-toggle">
                    <span class="multiselect-placeholder" id="ms-placeholder">Select services...</span>
                    <span class="multiselect-badge" id="ms-badge">0</span>
                    <svg class="multiselect-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="multiselect-menu">
                    <div class="multiselect-search">
                      <input type="text" id="ms-search" placeholder="Search services...">
                    </div>
                    <div class="multiselect-options" id="ms-options">${svcOpts}</div>
                  </div>
                </div>
                <div class="selected-tags" id="selected-tags"></div>
              </div>
              <div class="form-check">
                <input type="checkbox" id="mark-paid" name="markPaid" checked>
                <label for="mark-paid">Mark as paid</label>
              </div>
              <div class="form-group">
                <label for="note">Note</label>
                <textarea id="note" name="note" class="form-control" placeholder="Optional note..." rows="2"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:8px;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Generate Bill
              </button>
            </form>
          </div>
        </div>
        <div>
          <div class="card" style="margin-bottom:20px;">
            <div class="card-header"><h2>Bill Preview</h2></div>
            <div class="card-body" id="bill-preview">
              <div class="empty-state" style="padding:30px 20px;">
                <div class="empty-state-icon" style="width:56px;height:56px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3>No items selected</h3>
                <p>Select a customer and services to preview the bill.</p>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h2>Recent Bills</h2>
              <a href="#payments" class="btn btn-sm btn-ghost">View All</a>
            </div>
            <div class="card-body" id="recent-bills-list"></div>
          </div>
        </div>
      </div>`;
  },

  _attachEvents() {
    if (this._oldHandler) document.removeEventListener('click', this._oldHandler);
    document.getElementById('ms-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleDropdown();
    });
    document.getElementById('ms-search').addEventListener('input', (e) => {
      this._filterServices(e.target.value);
    });
    document.getElementById('ms-options').addEventListener('click', (e) => {
      const opt = e.target.closest('.multiselect-option');
      if (opt) this._toggleService(opt.dataset.id);
    });
    document.getElementById('selected-tags').addEventListener('click', (e) => {
      const remove = e.target.closest('.service-tag-remove');
      if (remove) {
        const tag = remove.closest('.service-tag');
        if (tag) this._toggleService(tag.dataset.id);
      }
    });
    document.getElementById('bill-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._saveBill();
    });
    const handler = (e) => {
      const ms = document.getElementById('service-multiselect');
      if (ms && !ms.contains(e.target) && !e.target.closest('#modal-overlay')) {
        ms.classList.remove('open');
      }
    };
    this._oldHandler = handler;
    document.addEventListener('click', handler);
  },

  _toggleDropdown() {
    const ms = document.getElementById('service-multiselect');
    ms.classList.toggle('open');
    const input = document.getElementById('ms-search');
    if (ms.classList.contains('open')) {
      input.value = '';
      input.focus();
      document.querySelectorAll('#ms-options .multiselect-option').forEach(el => el.style.display = 'flex');
    }
  },

  _filterServices(q) {
    const term = q.toLowerCase();
    document.querySelectorAll('#ms-options .multiselect-option').forEach(el => {
      const name = el.querySelector('.multiselect-option-name')?.textContent?.toLowerCase() || '';
      const cat = el.querySelector('.multiselect-option-category')?.textContent?.toLowerCase() || '';
      el.style.display = name.includes(term) || cat.includes(term) ? 'flex' : 'none';
    });
  },

  _toggleService(id) {
    const idx = this._selectedServices.indexOf(id);
    if (idx === -1) this._selectedServices.push(id);
    else this._selectedServices.splice(idx, 1);
    const opt = document.querySelector(`.multiselect-option[data-id="${id}"]`);
    if (opt) opt.classList.toggle('selected');
    this._updateUI();
  },

  _updateUI() {
    const count = this._selectedServices.length;
    const placeholder = document.getElementById('ms-placeholder');
    const badge = document.getElementById('ms-badge');
    if (count > 0) {
      placeholder.textContent = `${count} service${count > 1 ? 's' : ''} selected`;
      placeholder.classList.add('has-value');
      badge.textContent = count;
      badge.classList.add('show');
    } else {
      placeholder.textContent = 'Select services...';
      placeholder.classList.remove('has-value');
      badge.classList.remove('show');
    }
    this._renderTags();
    this._updatePreview();
  },

  async _renderTags() {
    const container = document.getElementById('selected-tags');
    const services = await Store.getAll('services');
    const selected = services.filter(s => this._selectedServices.includes(s.id));
    if (selected.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = selected.map(s =>
      `<span class="service-tag" data-id="${s.id}">
        ${s.name}
        <span class="service-tag-remove">&times;</span>
      </span>`
    ).join('');
  },

  async _updatePreview() {
    const container = document.getElementById('bill-preview');
    const services = await Store.getAll('services');
    const selected = services.filter(s => this._selectedServices.includes(s.id));
    if (selected.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:30px 20px;">
          <div class="empty-state-icon" style="width:56px;height:56px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h3>No items selected</h3>
          <p>Select services to see the bill preview.</p>
        </div>`;
      return;
    }
    const total = selected.reduce((s, svc) => s + svc.price, 0);
    const rows = selected.map(s => `
      <tr><td>${s.name}</td><td style="text-align:right;">${UI.formatCurrency(s.price)}</td></tr>
    `).join('');
    container.innerHTML = `
      <div class="bill-preview">
        <div class="bill-preview-header">
          <span class="bill-preview-title">Invoice Summary</span>
          <span class="bill-preview-total">${UI.formatCurrency(total)}</span>
        </div>
        <table class="bill-preview-table">
          <thead><tr><th>Service</th><th style="text-align:right;">Price</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  async _saveBill() {
    const customerId = document.getElementById('customerId')?.value;
    if (!customerId) return UI.toast('Please select a customer', 'danger');
    if (this._selectedServices.length === 0) return UI.toast('Please select at least one service', 'danger');

    const [services, customer] = await Promise.all([
      Store.getAll('services'),
      Store.getById('customers', customerId)
    ]);
    const selected = services.filter(s => this._selectedServices.includes(s.id));
    const total = selected.reduce((s, svc) => s + svc.price, 0);
    const markPaid = document.getElementById('mark-paid')?.checked || false;
    const note = document.getElementById('note')?.value?.trim() || '';

    await Store.add('bills', {
      customerId,
      customerName: customer?.name || 'Unknown',
      items: selected.map(s => ({ serviceId: s.id, serviceName: s.name, price: s.price })),
      total,
      paid: markPaid ? total : 0,
      due: markPaid ? 0 : total,
      status: markPaid ? 'paid' : 'pending',
      note
    });

    UI.toast(`Bill generated for ${UI.formatCurrency(total)}`, 'success');
    this._selectedServices = [];
    document.getElementById('bill-form').reset();
    document.querySelectorAll('.multiselect-option').forEach(el => el.classList.remove('selected'));
    const ms = document.getElementById('service-multiselect');
    if (ms) ms.classList.remove('open');
    this._updateUI();
    await this._loadRecent();
  },

  async _loadRecent() {
    const container = document.getElementById('recent-bills-list');
    if (!container) return;
    const bills = await Store.getAll('bills');
    if (bills.length === 0) {
      UI.showEmpty(container, { title: 'No bills yet', message: 'Generate your first bill above.', icon: 'bill' });
      return;
    }
    const recent = bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const rows = recent.map(b => `
      <tr>
        <td><strong>${b.customerName}</strong></td>
        <td>${UI.formatCurrency(b.total)}</td>
        <td>${UI.badge(b.status)}</td>
        <td>${UI.formatDate(b.createdAt)}</td>
        <td>
          <button class="btn-icon btn btn-ghost btn-sm" data-view-bill="${b.id}" title="View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </td>
      </tr>
    `).join('');
    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    container.querySelectorAll('[data-view-bill]').forEach(btn => {
      btn.addEventListener('click', () => this._viewBill(btn.dataset.viewBill));
    });
  },

  async _viewBill(id) {
    const bill = await Store.getById('bills', id);
    if (!bill) return UI.toast('Bill not found', 'danger');
    const itemsRows = (bill.items || []).map(i => `
      <tr><td>${i.serviceName}</td><td style="text-align:right;">${UI.formatCurrency(i.price)}</td></tr>
    `).join('');
    const { close } = UI.modal(`Invoice — ${bill.customerName}`, `
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:2px;">Date</div>
        <div style="font-weight:600;">${UI.formatDate(bill.createdAt)}</div>
      </div>
      <table class="data-table" style="font-size:.85rem;">
        <thead><tr><th>Service</th><th style="text-align:right;">Price</th></tr></thead>
        <tbody>${itemsRows}
          <tr style="font-weight:700;background:var(--border-light);">
            <td>Total</td><td style="text-align:right;">${UI.formatCurrency(bill.total)}</td>
          </tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:space-between;margin-top:14px;padding:12px 0;border-top:1px solid var(--border);">
        <div><span style="font-size:.82rem;color:var(--text-muted);">Paid:</span> <strong>${UI.formatCurrency(bill.paid || 0)}</strong></div>
        <div><span style="font-size:.82rem;color:var(--text-muted);">Due:</span> <strong style="color:${(bill.due || 0) > 0 ? 'var(--danger)' : 'var(--success)'}">${UI.formatCurrency(bill.due || 0)}</strong></div>
        <div>${UI.badge(bill.status)}</div>
      </div>
      ${bill.note ? `<div style="padding:10px;background:var(--bg);border-radius:var(--radius-sm);font-size:.84rem;color:var(--text-secondary);margin-top:4px;">${bill.note}</div>` : ''}
      <div class="form-actions" style="border-top:none;margin-top:14px;padding-top:0;">
        <button class="btn btn-ghost btn-sm" id="print-bill-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print
        </button>
        <button class="btn btn-primary btn-sm" id="modal-close-btn">Close</button>
      </div>`, { wide: true });
    document.getElementById('modal-close-btn')?.addEventListener('click', () => close());
    document.getElementById('print-bill-btn')?.addEventListener('click', () => window.print());
  }
};
