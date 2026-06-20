const UI = {
  showLoading(container) {
    container.innerHTML = `
      <div class="loading-screen">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>`;
  },

  showError(container, message) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3>Something went wrong</h3>
        <p>${message}</p>
      </div>`;
  },

  showEmpty(container, { title = 'No data found', message = 'Add your first entry to get started.', icon = 'folder', action } = {}) {
    const icons = {
      folder: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
      users: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
      bill: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      payment: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      chart: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
    };
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${icons[icon] || icons.folder}</div>
        <h3>${title}</h3>
        <p>${message}</p>
        ${action || ''}
      </div>`;
  },

  statCard(iconSvg, value, label, color) {
    return `
      <div class="stat-card">
        <div class="stat-icon ${color}">${iconSvg}</div>
        <div class="stat-info">
          <h3>${value}</h3>
          <p>${label}</p>
        </div>
      </div>`;
  },

  badge(status) {
    const map = {
      paid: '<span class="badge badge-success">Paid</span>',
      pending: '<span class="badge badge-warning">Pending</span>',
      loss: '<span class="badge badge-danger">Loss</span>',
      partial: '<span class="badge badge-info">Partial</span>'
    };
    return map[status] || `<span class="badge badge-info">${status}</span>`;
  },

  formatCurrency(amount) {
    return `\u20B9${Number(amount).toFixed(2)}`;
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      danger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `${icons[type] || icons.info} ${message}`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-removing');
      setTimeout(() => el.remove(), 300);
    }, 3000);
  },

  modal(title, bodyHtml, { wide = false, onClose } = {}) {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const container = document.getElementById('modal-container');
    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    container.style.maxWidth = wide ? '700px' : '520px';
    overlay.classList.remove('hidden');
    const closeModal = () => {
      overlay.classList.add('hidden');
      if (onClose) onClose();
    };
    const closeBtn = document.getElementById('modal-close');
    const newClose = closeBtn.cloneNode(true);
    closeBtn.replaceWith(newClose);
    newClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    return { close: closeModal, overlay, body: bodyEl };
  },

  formField({ type = 'text', name, label, placeholder, required = false, options, value = '' } = {}) {
    if (type === 'select') {
      const opts = (options || []).map(o =>
        `<option value="${o.value}" ${o.value === value ? 'selected' : ''}>${o.label}</option>`
      ).join('');
      return `
        <div class="form-group">
          <label for="${name}">${label}${required ? ' <span style="color:var(--danger)">*</span>' : ''}</label>
          <select id="${name}" name="${name}" class="form-control" ${required ? 'required' : ''}>${opts}</select>
        </div>`;
    }
    if (type === 'textarea') {
      return `
        <div class="form-group">
          <label for="${name}">${label}${required ? ' <span style="color:var(--danger)">*</span>' : ''}</label>
          <textarea id="${name}" name="${name}" class="form-control" placeholder="${placeholder || ''}" ${required ? 'required' : ''}>${value}</textarea>
        </div>`;
    }
    if (type === 'checkbox') {
      return `
        <div class="form-check">
          <input type="checkbox" id="${name}" name="${name}" ${value ? 'checked' : ''}>
          <label for="${name}">${label}</label>
        </div>`;
    }
    return `
      <div class="form-group">
        <label for="${name}">${label}${required ? ' <span style="color:var(--danger)">*</span>' : ''}</label>
        <input type="${type}" id="${name}" name="${name}" class="form-control" placeholder="${placeholder || ''}" value="${value}" ${required ? 'required' : ''}>
      </div>`;
  },

  confirmDialog(message) {
    return new Promise((resolve) => {
      const { close } = UI.modal('Confirm', `
        <p style="margin-bottom:20px;color:var(--text-secondary);">${message}</p>
        <div class="form-actions" style="border-top:none;margin-top:0;padding-top:0;">
          <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="confirm-ok">Delete</button>
        </div>`);
      document.getElementById('confirm-cancel').addEventListener('click', () => { close(); resolve(false); });
      document.getElementById('confirm-ok').addEventListener('click', () => { close(); resolve(true); });
    });
  }
};
