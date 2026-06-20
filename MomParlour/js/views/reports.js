const ReportsView = {
  render() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="section-header">
        <h2>Financial Reports</h2>
        <button class="btn btn-ghost btn-sm" onclick="ReportsView._refresh()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          Refresh
        </button>
      </div>
      <div class="stat-cards" id="report-stats"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="card">
          <div class="card-header"><h2>Income Overview</h2></div>
          <div class="card-body" id="income-breakdown"></div>
        </div>
        <div class="card">
          <div class="card-header"><h2>Monthly Summary</h2></div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="report-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:20px;">
        <div class="card-header"><h2>Detailed Bill History</h2></div>
        <div class="card-body" id="report-bills"></div>
      </div>`;
    this._loadStats();
    this._loadBreakdown();
    this._loadChart();
    this._loadBills();
  },

  async _loadStats() {
    const bills = await Store.getAll('bills');
    const totalIncome = bills.reduce((s, b) => s + (b.status === 'paid' ? b.total : (b.paid || 0)), 0);
    const totalPending = bills.reduce((s, b) => s + (b.due || 0), 0);
    const totalLoss = bills.reduce((s, b) => s + (b.status === 'loss' ? b.total : 0), 0);
    const netIncome = totalIncome - totalLoss;
    const container = document.getElementById('report-stats');
    container.innerHTML = `
      ${UI.statCard(
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        UI.formatCurrency(totalIncome), 'Total Income', 'success'
      )}
      ${UI.statCard(
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
        UI.formatCurrency(totalPending), 'Total Pending', 'warning'
      )}
      ${UI.statCard(
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        UI.formatCurrency(totalLoss), 'Total Loss', 'danger'
      )}
      ${UI.statCard(
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        UI.formatCurrency(netIncome), 'Net Income', 'info'
      )}`;
  },

  async _loadBreakdown() {
    const container = document.getElementById('income-breakdown');
    const bills = await Store.getAll('bills');
    const income = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.total, 0);
    const pending = bills.reduce((s, b) => s + (b.due || 0), 0);
    const loss = bills.filter(b => b.status === 'loss').reduce((s, b) => s + b.total, 0);
    const total = income + pending + loss || 1;

    container.innerHTML = `
      <div style="margin-bottom:20px;">
        <div style="display:flex;height:12px;border-radius:6px;overflow:hidden;background:var(--border-light);">
          <div style="width:${(income / total * 100).toFixed(1)}%;background:var(--success);transition:width 0.6s ease;"></div>
          <div style="width:${(pending / total * 100).toFixed(1)}%;background:var(--warning);transition:width 0.6s ease;"></div>
          <div style="width:${(loss / total * 100).toFixed(1)}%;background:var(--danger);transition:width 0.6s ease;"></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--success-bg);border-radius:var(--radius-sm);">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--success);"></div>
            <span style="font-weight:600;font-size:0.9rem;">Collected Income</span>
          </div>
          <span style="font-weight:700;color:var(--success);">${UI.formatCurrency(income)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--warning-bg);border-radius:var(--radius-sm);">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--warning);"></div>
            <span style="font-weight:600;font-size:0.9rem;">Pending Collection</span>
          </div>
          <span style="font-weight:700;color:#D97706;">${UI.formatCurrency(pending)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--danger-bg);border-radius:var(--radius-sm);">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--danger);"></div>
            <span style="font-weight:600;font-size:0.9rem;">Loss / Written Off</span>
          </div>
          <span style="font-weight:700;color:var(--danger);">${UI.formatCurrency(loss)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;margin-top:4px;border-top:2px solid var(--border);">
          <span style="font-weight:700;font-size:1rem;">Net Income</span>
          <span style="font-weight:800;font-size:1.2rem;color:var(--primary);">${UI.formatCurrency(income - loss)}</span>
        </div>
      </div>`;
  },

  async _loadChart() {
    const bills = await Store.getAll('bills');
    const monthlyData = {};
    bills.forEach(b => {
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { income: 0, pending: 0, loss: 0 };
      if (b.status === 'paid') monthlyData[key].income += b.total;
      else if (b.status === 'loss') monthlyData[key].loss += b.total;
      monthlyData[key].pending += (b.due || 0);
    });

    const months = Object.keys(monthlyData).sort();
    if (months.length === 0) {
      document.getElementById('report-chart').parentElement.innerHTML = `
        <div class="empty-state" style="padding:30px;">
          <h3>No data yet</h3>
          <p>Generate bills to see monthly trends.</p>
        </div>`;
      return;
    }

    const labels = months.map(m => {
      const [y, mo] = m.split('-');
      const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthsNames[parseInt(mo) - 1]} ${y}`;
    });
    const incomeData = months.map(m => monthlyData[m].income);
    const pendingData = months.map(m => monthlyData[m].pending);
    const lossData = months.map(m => monthlyData[m].loss);

    if (typeof Chart !== 'undefined') {
      const ctx = document.getElementById('report-chart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Income', data: incomeData, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: '#10B981', borderWidth: 2, borderRadius: 4 },
            { label: 'Pending', data: pendingData, backgroundColor: 'rgba(245, 158, 11, 0.7)', borderColor: '#F59E0B', borderWidth: 2, borderRadius: 4 },
            { label: 'Loss', data: lossData, backgroundColor: 'rgba(239, 68, 68, 0.7)', borderColor: '#EF4444', borderWidth: 2, borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 16, usePointStyle: true, font: { family: 'Inter', size: 11 } }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: v => '\u20B9' + v.toFixed(0), font: { family: 'Inter', size: 10 } },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              ticks: { font: { family: 'Inter', size: 10 } },
              grid: { display: false }
            }
          }
        }
      });
    } else {
      document.getElementById('report-chart').parentElement.innerHTML = `
        <div class="empty-state" style="padding:20px;">
          <p style="color:var(--text-muted);">Chart.js library not loaded. <a href="https://cdn.jsdelivr.net/npm/chart.js" target="_blank" style="color:var(--primary);">Load Chart.js</a> for visual charts.</p>
        </div>`;
    }
  },

  async _loadBills() {
    const container = document.getElementById('report-bills');
    const bills = await Store.getAll('bills');
    if (bills.length === 0) {
      UI.showEmpty(container, { title: 'No bills', message: 'Generate bills to see detailed history.', icon: 'bill' });
      return;
    }
    const sorted = bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const rows = sorted.map(b => `
      <tr>
        <td><strong>${b.customerName || 'Unknown'}</strong></td>
        <td>${UI.formatCurrency(b.total)}</td>
        <td>${UI.formatCurrency(b.paid || 0)}</td>
        <td style="color:${(b.due || 0) > 0 ? 'var(--danger)' : 'var(--success)'}">${UI.formatCurrency(b.due || 0)}</td>
        <td>${UI.badge(b.status)}</td>
        <td>${UI.formatDate(b.createdAt)}</td>
      </tr>`).join('');
    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>Customer</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  _refresh() {
    this.render();
    UI.toast('Reports refreshed', 'info');
  }
};
