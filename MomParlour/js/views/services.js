const ServicesView = {
  _categories: ['hair', 'skin', 'nails', 'spa', 'makeup', 'other'],

  render() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="section-header">
        <h2>Manage Services</h2>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <select id="svc-category-filter" class="form-control" style="width:auto;min-width:140px;padding:7px 30px 7px 12px;font-size:.82rem;" onchange="ServicesView._applyFilter()">
            <option value="">All Categories</option>
            ${this._categories.map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="ServicesView._showAddModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Service
          </button>
        </div>
      </div>
      <div class="card">
        <div class="card-body" id="services-list"></div>
      </div>`;
    this._renderList();
  },

  _getServices() {
    return Store.getAll('services');
  },

  async _renderList(category = '') {
    const container = document.getElementById('services-list');
    let services = await this._getServices();
    if (category) services = services.filter(s => s.category === category);
    services.sort((a, b) => a.name.localeCompare(b.name));

    if (services.length === 0) {
      UI.showEmpty(container, {
        title: category ? 'No services in this category' : 'No services yet',
        message: category ? 'Try a different category filter.' : 'Add your first service to get started.',
        icon: 'folder',
        action: !category ? '<button class="btn btn-primary" onclick="ServicesView._showAddModal()">Add Service</button>' : ''
      });
      return;
    }
    const rows = services.map(s => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:6px;background:var(--accent-light);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;flex-shrink:0;">
              ${(s.category || 'o')[0].toUpperCase()}
            </div>
            <div>
              <div style="font-weight:600;">${s.name}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-neutral">${s.category}</span></td>
        <td style="font-weight:700;font-size:.95rem;">${UI.formatCurrency(s.price)}</td>
        <td>${UI.formatDate(s.createdAt)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn btn-ghost btn-sm" onclick="ServicesView._showEditModal('${s.id}')" title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon btn btn-danger btn-sm" onclick="ServicesView._deleteService('${s.id}')" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`).join('');
    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>Service</th><th>Category</th><th>Price</th><th>Added</th><th>Actions</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  _applyFilter() {
    const cat = document.getElementById('svc-category-filter')?.value || '';
    this._renderList(cat);
  },

  _showAddModal() {
    const { close } = UI.modal('Add Service', `
      <form id="service-form" onsubmit="return false;">
        <div class="form-row">
          ${UI.formField({ name: 'name', label: 'Service Name', placeholder: 'e.g. Haircut', required: true })}
          ${UI.formField({ name: 'price', label: 'Price (₹)', type: 'number', placeholder: 'e.g. 300', required: true })}
        </div>
        ${UI.formField({
          type: 'select', name: 'category', label: 'Category', required: true,
          options: this._categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))
        })}
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-close').click()">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Service</button>
        </div>
      </form>`);
    document.getElementById('service-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const name = data.get('name')?.trim();
      const price = parseFloat(data.get('price'));
      if (!name) return UI.toast('Service name is required', 'danger');
      if (!price || price <= 0) return UI.toast('Enter a valid price', 'danger');
      await Store.add('services', { name, price, category: data.get('category') || 'other' });
      UI.toast('Service added successfully', 'success');
      close();
      this._renderList();
    });
  },

  _showEditModal(id) {
    Store.getById('services', id).then(svc => {
      if (!svc) return UI.toast('Service not found', 'danger');
      const { close } = UI.modal('Edit Service', `
        <form id="service-form" onsubmit="return false;">
          <div class="form-row">
            ${UI.formField({ name: 'name', label: 'Service Name', required: true, value: svc.name })}
            ${UI.formField({ name: 'price', label: 'Price (₹)', type: 'number', required: true, value: svc.price })}
          </div>
          ${UI.formField({
            type: 'select', name: 'category', label: 'Category', required: true,
            options: this._categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
            value: svc.category
          })}
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-close').click()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>`);
      document.getElementById('service-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const name = data.get('name')?.trim();
        const price = parseFloat(data.get('price'));
        if (!name) return UI.toast('Service name is required', 'danger');
        if (!price || price <= 0) return UI.toast('Enter a valid price', 'danger');
        await Store.update('services', id, { name, price, category: data.get('category') || 'other' });
        UI.toast('Service updated successfully', 'success');
        close();
        this._renderList();
      });
    });
  },

  async _deleteService(id) {
    const confirmed = await UI.confirmDialog('Delete this service? It will not affect existing bills.');
    if (!confirmed) return;
    await Store.delete('services', id);
    UI.toast('Service deleted', 'success');
    this._renderList();
  }
};
