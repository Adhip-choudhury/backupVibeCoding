const PaymentsView = {
  _filter: 'all',

  render() {
    this._filter = 'all';
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="section-header">
        <h2>Payment Tracking</h2>
        <div class="filters-bar">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="pending">Pending</button>
          <button class="filter-btn" data-filter="paid">Paid</button>
          <button class="filter-btn" data-filter="loss">Loss</button>
        </div>
      </div>
      <div class="stat-cards" id="payment-stats"></div>
      <div class="card">
        <div class="card-header">
          <h2>All Bills</h2>
          <span id="bill-count" style="font-size:.85rem;color:var(--text-muted);"></span>
        </div>
        <div class="card-body" id="payments-list"></div>
      </div>`;
    this._attachEvents();
    this._loadStats();
    this._renderList();
  },

  _attachEvents() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._filter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === this._filter));
        this._renderList();
        this._loadStats();
      });
    });
  },

  async _loadStats() {
    const bills = await Store.getAll('bills');
    const totalIncome = bills.reduce((s, b) => s + (b.status === 'paid' ? b.total : (b.paid || 0)), 0);
    const totalPending = bills.reduce((s, b) => s + (b.due || 0), 0);
    const totalLoss = bills.reduce((s, b) => s + (b.status === 'loss' ? b.total : 0), 0);
    const pendingCount = bills.filter(b => b.status === 'pending').length;
    const container = document.getElementById('payment-stats');
    if (!container) return;
    container.innerHTML = `
      ${UI.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>', UI.formatCurrency(totalIncome), 'Total Collected', 'success')}
      ${UI.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>', `${pendingCount} bills · ${UI.formatCurrency(totalPending)}`, 'Pending Dues', 'warning')}
      ${UI.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', UI.formatCurrency(totalLoss), 'Written Off (Loss)', 'danger')}
      ${UI.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', UI.formatCurrency(totalIncome - totalLoss), 'Net Collected', 'info')}`;
  },

  async _renderList() {
    const container = document.getElementById('payments-list');
    if (!container) return;
    let bills = await Store.getAll('bills');
    if (this._filter !== 'all') bills = bills.filter(b => b.status === this._filter);
    bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const countEl = document.getElementById('bill-count');
    if (countEl) countEl.textContent = `${bills.length} bill${bills.length !== 1 ? 's' : ''}`;

    if (bills.length === 0) {
      UI.showEmpty(container, { title: 'No bills found', message: this._filter !== 'all' ? `No bills with status "${this._filter}".` : 'No bills generated yet.', icon: 'payment', action: '<a href="#billing" class="btn btn-primary">Create Bill</a>' });
      return;
    }

    const rows = bills.map(b => `
      <tr>
        <td><strong>${b.customerName || 'Unknown'}</strong></td>
        <td>${UI.formatCurrency(b.total)}</td>
        <td>${UI.formatCurrency(b.paid || 0)}</td>
        <td style="font-weight:600;color:${(b.due || 0) > 0 ? 'var(--danger)' : 'var(--success)'};">${UI.formatCurrency(b.due || 0)}</td>
        <td>${UI.badge(b.status)}</td>
        <td>${UI.formatDate(b.createdAt)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn btn-ghost btn-sm" data-edit-bill="${b.id}" title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon btn btn-ghost btn-sm" data-view-bill="${b.id}" title="View / Share">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            ${b.status === 'pending' ? `
              <button class="btn btn-sm btn-success" data-pay-bill="${b.id}">Pay</button>
              <button class="btn btn-sm btn-danger" data-loss-bill="${b.id}">Loss</button>
            ` : ''}
            ${b.status === 'paid' ? '<span style="font-size:.78rem;color:var(--text-muted);font-weight:500;">Completed</span>' : ''}
            ${b.status === 'loss' ? '<span style="font-size:.78rem;color:var(--text-muted);font-weight:500;">Written off</span>' : ''}
          </div>
        </td>
      </tr>`).join('');
    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Customer</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    container.querySelectorAll('[data-edit-bill]').forEach(btn => btn.addEventListener('click', () => this._editBill(btn.dataset.editBill)));
    container.querySelectorAll('[data-view-bill]').forEach(btn => btn.addEventListener('click', () => this._viewBill(btn.dataset.viewBill)));
    container.querySelectorAll('[data-pay-bill]').forEach(btn => btn.addEventListener('click', () => this._markPaid(btn.dataset.payBill)));
    container.querySelectorAll('[data-loss-bill]').forEach(btn => btn.addEventListener('click', () => this._markLoss(btn.dataset.lossBill)));
  },

  async _editBill(id) {
    const [bill, services, customers] = await Promise.all([
      Store.getById('bills', id),
      Store.getAll('services'),
      Store.getAll('customers')
    ]);
    if (!bill) return UI.toast('Bill not found', 'danger');
    const custOpts = customers.map(c => `<option value="${c.id}" ${c.id === bill.customerId ? 'selected' : ''}>${c.name}${c.phone ? ' (' + c.phone + ')' : ''}</option>`).join('');
    const svcOpts = services.map(s => `
      <label class="edit-svc-item">
        <input type="checkbox" class="edit-svc-cb" value="${s.id}" ${(bill.items || []).some(i => i.serviceId === s.id) ? 'checked' : ''}>
        <span>${s.name}</span>
        <span class="edit-svc-price">${UI.formatCurrency(s.price)}</span>
      </label>
    `).join('');

    const { close } = UI.modal('Edit Bill', `
      <form id="edit-bill-form">
        <div class="form-group">
          <label>Customer</label>
          <select id="edit-customer" class="form-control">${custOpts}</select>
        </div>
        <div class="form-group">
          <label>Services</label>
          <div id="edit-services" style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px;">${svcOpts}</div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Total</label>
            <input type="number" id="edit-total" class="form-control" value="${bill.total}" readonly style="background:var(--border-light);">
          </div>
          <div class="form-group">
            <label>Paid Amount</label>
            <input type="number" id="edit-paid" class="form-control" value="${bill.paid || 0}">
          </div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="edit-status" class="form-control">
            <option value="paid" ${bill.status === 'paid' ? 'selected' : ''}>Paid</option>
            <option value="pending" ${bill.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="loss" ${bill.status === 'loss' ? 'selected' : ''}>Loss</option>
            <option value="partial" ${bill.status === 'partial' ? 'selected' : ''}>Partial</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" id="edit-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>`, { wide: true });
    document.getElementById('edit-cancel-btn')?.addEventListener('click', () => close());
    document.getElementById('edit-services')?.addEventListener('change', () => {
      const checked = document.querySelectorAll('#edit-services .edit-svc-cb:checked');
      let total = 0;
      checked.forEach(cb => {
        const svc = services.find(s => s.id === cb.value);
        if (svc) total += svc.price;
      });
      document.getElementById('edit-total').value = total;
    });
    document.getElementById('edit-bill-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const customerId = document.getElementById('edit-customer').value;
      const checked = document.querySelectorAll('#edit-services .edit-svc-cb:checked');
      const selectedItems = [];
      checked.forEach(cb => {
        const svc = services.find(s => s.id === cb.value);
        if (svc) selectedItems.push({ serviceId: svc.id, serviceName: svc.name, price: svc.price });
      });
      const total = selectedItems.reduce((s, i) => s + i.price, 0);
      const paid = parseFloat(document.getElementById('edit-paid').value) || 0;
      const status = document.getElementById('edit-status').value;
      const customer = customers.find(c => c.id === customerId);
      await Store.update('bills', id, {
        customerId,
        customerName: customer?.name || 'Unknown',
        items: selectedItems,
        total,
        paid: status === 'loss' ? 0 : Math.min(paid, total),
        due: status === 'paid' ? 0 : (status === 'loss' ? total : total - Math.min(paid, total)),
        status
      });
      UI.toast('Bill updated successfully', 'success');
      close();
      this._renderList();
      this._loadStats();
    });
  },

  async _viewBill(id) {
    const bill = await Store.getById('bills', id);
    if (!bill) return UI.toast('Bill not found', 'danger');
    const user = await Store.getCurrentUser();
    const itemsRows = (bill.items || []).map(i =>
      `<tr><td>${i.serviceName}</td><td style="text-align:right;">${UI.formatCurrency(i.price)}</td></tr>`
    ).join('');
    const { close } = UI.modal(`Invoice — ${bill.customerName}`, `
      <div id="invoice-print">
        <div style="text-align:center;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid var(--border);">
          <div style="font-size:1.1rem;font-weight:800;color:var(--text);">${user?.salonName || 'Glamora'}</div>
          <div style="font-size:.8rem;color:var(--text-muted);">${user?.phone || ''} ${user?.email ? '| ' + user.email : ''}</div>
          <div style="font-size:.8rem;color:var(--text-secondary);margin-top:4px;">Invoice Date: ${UI.formatDateTime(bill.createdAt)}</div>
        </div>
        <div style="margin-bottom:12px;font-size:.85rem;"><strong>Customer:</strong> ${bill.customerName}</div>
        <table class="data-table" style="font-size:.85rem;">
          <thead><tr><th>Service</th><th style="text-align:right;">Price</th></tr></thead>
          <tbody>${itemsRows}
            <tr style="font-weight:700;background:var(--border-light);"><td>Total</td><td style="text-align:right;">${UI.formatCurrency(bill.total)}</td></tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;margin-top:12px;padding:10px 0;border-top:1px solid var(--border);">
          <div><span style="font-size:.82rem;color:var(--text-muted);">Paid:</span> <strong>${UI.formatCurrency(bill.paid || 0)}</strong></div>
          <div><span style="font-size:.82rem;color:var(--text-muted);">Due:</span> <strong style="color:${(bill.due || 0) > 0 ? 'var(--danger)' : 'var(--success)'}">${UI.formatCurrency(bill.due || 0)}</strong></div>
          <div>${UI.badge(bill.status)}</div>
        </div>
        ${bill.note ? `<div style="padding:8px 10px;background:var(--bg);border-radius:var(--radius-sm);font-size:.82rem;color:var(--text-secondary);margin-top:6px;">${bill.note}</div>` : ''}
      </div>
      <div class="form-actions" style="border-top:none;margin-top:14px;padding-top:0;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" id="print-invoice-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Download / Print
        </button>
        <button class="btn btn-accent btn-sm" id="whatsapp-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>
        <button class="btn btn-ghost btn-sm" id="sms-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          SMS
        </button>
        <button class="btn btn-primary btn-sm" id="modal-close-btn">Close</button>
      </div>`, { wide: true });
    document.getElementById('print-invoice-btn')?.addEventListener('click', () => {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(this._printInvoiceHTML(bill, user));
        printWin.document.close();
      }
    });
    document.getElementById('whatsapp-btn')?.addEventListener('click', () => this._shareWhatsApp(bill, user));
    document.getElementById('sms-btn')?.addEventListener('click', () => this._shareSMS(bill, user));
    document.getElementById('modal-close-btn')?.addEventListener('click', () => close());
  },

  _printInvoiceHTML(bill, user) {
    const itemsRows = (bill.items || []).map(i =>
      `<tr><td>${i.serviceName}</td><td style="text-align:right">₹${Number(i.price).toFixed(2)}</td></tr>`
    ).join('');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice - ${bill.customerName}</title>
    <style>
      body{font-family:'Inter',sans-serif;padding:40px;color:#1e293b;max-width:600px;margin:0 auto}
      .header{text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e2e8f0}
      .header h1{font-size:22px;margin:0 0 4px}
      .header p{color:#64748b;font-size:13px;margin:2px 0}
      table{width:100%;border-collapse:collapse;font-size:14px;margin:16px 0}
      th{text-align:left;padding:10px 8px;background:#f1f5f9;font-size:12px;text-transform:uppercase;color:#475569}
      td{padding:8px;border-top:1px solid #e2e8f0}
      .total-row td{font-weight:700;border-top:2px solid #1e293b;padding-top:10px}
      .summary{display:flex;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:14px}
      .footer{text-align:center;margin-top:32px;color:#94a3b8;font-size:12px}
    </style></head><body>
    <div class="header">
      <h1>${user?.salonName || 'Glamora'}</h1>
      <p>${user?.phone || ''}${user?.email ? ' | ' + user.email : ''}</p>
      <p>Invoice Date: ${UI.formatDateTime(bill.createdAt)}</p>
    </div>
    <p><strong>Customer:</strong> ${bill.customerName}</p>
    <table><thead><tr><th>Service</th><th style="text-align:right">Price</th></tr></thead>
    <tbody>${itemsRows}<tr class="total-row"><td>Total</td><td style="text-align:right">₹${Number(bill.total).toFixed(2)}</td></tr></tbody></table>
    <div class="summary">
      <span>Paid: <strong>₹${Number(bill.paid || 0).toFixed(2)}</strong></span>
      <span>Due: <strong>₹${Number(bill.due || 0).toFixed(2)}</strong></span>
      <span>Status: <strong>${(bill.status || '').toUpperCase()}</strong></span>
    </div>
    ${bill.note ? `<p style="margin-top:12px;padding:10px;background:#f8fafc;border-radius:6px;font-size:13px;color:#475569">${bill.note}</p>` : ''}
    <div class="footer">Thank you for visiting ${user?.salonName || 'Glamora'}!</div>
    <script>window.onload=function(){window.print();setTimeout(function(){window.close()},500)}<\/script>
  </body></html>`;
  },

  _shareWhatsApp(bill, user) {
    const customerPromise = Store.getById('customers', bill.customerId);
    customerPromise.then(customer => {
      const phone = customer?.phone;
      if (!phone) return UI.toast('Customer has no phone number', 'danger');
      const items = (bill.items || []).map(i => `• ${i.serviceName}: ₹${Number(i.price).toFixed(2)}`).join('\n');
      const msg = `*${user?.salonName || 'Glamora'}* - Invoice\nCustomer: ${bill.customerName}\n\n${items}\n\nTotal: ₹${Number(bill.total).toFixed(2)}\nPaid: ₹${Number(bill.paid || 0).toFixed(2)}\nDue: ₹${Number(bill.due || 0).toFixed(2)}\nStatus: ${(bill.status || '').toUpperCase()}\n\nThank you for visiting!`;
      const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });
  },

  _shareSMS(bill, user) {
    const customerPromise = Store.getById('customers', bill.customerId);
    customerPromise.then(customer => {
      const phone = customer?.phone;
      if (!phone) return UI.toast('Customer has no phone number', 'danger');
      const items = (bill.items || []).map(i => `• ${i.serviceName}: ₹${Number(i.price).toFixed(2)}`).join('\n');
      const msg = `${user?.salonName || 'Glamora'} - Invoice\nCustomer: ${bill.customerName}\n${items}\nTotal: ₹${Number(bill.total).toFixed(2)}\nPaid: ₹${Number(bill.paid || 0).toFixed(2)}\nDue: ₹${Number(bill.due || 0).toFixed(2)}\nStatus: ${(bill.status || '').toUpperCase()}\nThank you for visiting!`;
      const url = `sms:${phone.replace(/\D/g, '')}?body=${encodeURIComponent(msg)}`;
      try { window.open(url, '_blank'); } catch {
        navigator.clipboard?.writeText(msg).then(() => UI.toast('Bill copied to clipboard', 'success')).catch(() => {});
      }
    });
  },

  _markPaid(id) {
    Store.getById('bills', id).then(bill => {
      if (!bill) return UI.toast('Bill not found', 'danger');
      const { close } = UI.modal('Record Payment', `
        <form id="payment-form">
          <p style="margin-bottom:14px;color:var(--text-secondary);font-size:.9rem;">
            Customer: <strong>${bill.customerName}</strong><br>
            Total: <strong>${UI.formatCurrency(bill.total)}</strong><br>
            Due: <strong style="color:var(--danger);">${UI.formatCurrency(bill.due || bill.total)}</strong>
          </p>
          <div class="form-group">
            <label>Amount Receiving</label>
            <input type="number" id="pay-amount" class="form-control" value="${bill.due || bill.total}" step="0.01" required>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" id="pay-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-success">Confirm Payment</button>
          </div>
        </form>`);
      document.getElementById('pay-cancel-btn')?.addEventListener('click', () => close());
      document.getElementById('payment-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('pay-amount').value) || 0;
        if (amount <= 0) return UI.toast('Enter a valid amount', 'danger');
        const remainingDue = (bill.due || bill.total) - amount;
        if (remainingDue <= 0) {
          await Store.update('bills', id, { paid: (bill.paid || 0) + amount, due: 0, status: 'paid' });
        } else {
          await Store.update('bills', id, { paid: (bill.paid || 0) + amount, due: remainingDue, status: 'partial' });
        }
        UI.toast(`Payment of ${UI.formatCurrency(amount)} recorded`, 'success');
        close();
        this._renderList();
        this._loadStats();
      });
    });
  },

  async _markLoss(id) {
    if (!await UI.confirmDialog('Mark this amount as unrecoverable loss?')) return;
    const bill = await Store.getById('bills', id);
    if (!bill) return UI.toast('Bill not found', 'danger');
    await Store.update('bills', id, { status: 'loss', due: bill.due || bill.total });
    UI.toast('Bill marked as loss', 'warning');
    this._renderList();
    this._loadStats();
  }
};
