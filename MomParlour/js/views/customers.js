const CustomersView = {
  render() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="section-header">
        <h2>All Customers</h2>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="customer-search" placeholder="Search customers..." oninput="CustomersView._search()">
          </div>
          <button class="btn btn-primary" onclick="CustomersView._showAddModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Customer
          </button>
        </div>
      </div>
      <div id="customers-list"></div>`;
    this._renderList();
  },

  _getCustomers() {
    return Store.getAll('customers');
  },

  async _renderList(filter = '') {
    const container = document.getElementById('customers-list');
    let customers = await this._getCustomers();
    if (filter) {
      const q = filter.toLowerCase();
      customers = customers.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }
    if (customers.length === 0) {
      UI.showEmpty(container, {
        title: filter ? 'No matching customers' : 'No customers yet',
        message: filter ? 'Try a different search term.' : 'Add your first customer to get started.',
        icon: 'users',
        action: !filter ? '<button class="btn btn-primary" onclick="CustomersView._showAddModal()">Add Customer</button>' : ''
      });
      return;
    }
    const bills = await Store.getAll('bills');
    const rows = customers.map(c => {
      const cBills = bills.filter(b => b.customerId === c.id);
      const totalBilled = cBills.reduce((s, b) => s + b.total, 0);
      const totalDue = cBills.reduce((s, b) => s + (b.due || 0), 0);
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--primary-bg);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0;">
                ${(c.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style="font-weight:600;">${c.name || 'Unnamed'}</div>
                ${c.phone ? `<div style="font-size:0.8rem;color:var(--text-muted);">${c.phone}</div>` : ''}
              </div>
            </div>
          </td>
          <td>${c.email || '—'}</td>
          <td>${cBills.length}</td>
          <td>${UI.formatCurrency(totalBilled)}</td>
          <td>${totalDue > 0 ? `<span style="color:var(--danger);font-weight:600;">${UI.formatCurrency(totalDue)}</span>` : '—'}</td>
          <td>${UI.formatDate(c.createdAt)}</td>
          <td>
            <div class="action-btns">
              <button class="btn-icon btn btn-secondary btn-sm" onclick="CustomersView._showEditModal('${c.id}')" title="Edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon btn btn-danger btn-sm" onclick="CustomersView._deleteCustomer('${c.id}')" title="Delete">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Visits</th>
              <th>Total Billed</th>
              <th>Due</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  _search() {
    const q = document.getElementById('customer-search')?.value || '';
    this._renderList(q);
  },

  _showAddModal() {
    const { close } = UI.modal('Add Customer', `
      <form id="customer-form" onsubmit="return false;">
        ${UI.formField({ name: 'name', label: 'Full Name', placeholder: 'e.g. Priya Sharma', required: true })}
        ${UI.formField({ name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. 9876543210' })}
        ${UI.formField({ name: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. priya@example.com' })}
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-close').click()">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Customer</button>
        </div>
      </form>`);
    document.getElementById('customer-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const name = data.get('name')?.trim();
      if (!name) return UI.toast('Name is required', 'danger');
      await Store.add('customers', {
        name,
        phone: data.get('phone')?.trim() || '',
        email: data.get('email')?.trim() || ''
      });
      UI.toast('Customer added successfully', 'success');
      close();
      this._renderList();
    });
  },

  _showEditModal(id) {
    Store.getById('customers', id).then(customer => {
      if (!customer) return UI.toast('Customer not found', 'danger');
      const { close } = UI.modal('Edit Customer', `
        <form id="customer-form" onsubmit="return false;">
          ${UI.formField({ name: 'name', label: 'Full Name', placeholder: 'e.g. Priya Sharma', required: true, value: customer.name || '' })}
          ${UI.formField({ name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. 9876543210', value: customer.phone || '' })}
          ${UI.formField({ name: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. priya@example.com', value: customer.email || '' })}
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-close').click()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>`);
      document.getElementById('customer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const name = data.get('name')?.trim();
        if (!name) return UI.toast('Name is required', 'danger');
        await Store.update('customers', id, {
          name,
          phone: data.get('phone')?.trim() || '',
          email: data.get('email')?.trim() || ''
        });
        UI.toast('Customer updated successfully', 'success');
        close();
        this._renderList();
      });
    });
  },

  async _deleteCustomer(id) {
    const confirmed = await UI.confirmDialog('Are you sure you want to delete this customer? This action cannot be undone.');
    if (!confirmed) return;
    await Store.delete('customers', id);
    UI.toast('Customer deleted', 'success');
    this._renderList();
  }
};
