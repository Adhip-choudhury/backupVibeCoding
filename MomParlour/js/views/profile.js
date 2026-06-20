const ProfileView = {
  async render() {
    const user = await Store.getCurrentUser();
    if (!user) { window.location.hash = '#login'; return; }
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="section-header"><h2>Profile</h2></div>
      <div style="max-width:560px;margin:0 auto;">
        <div class="card" style="text-align:center;margin-bottom:20px;">
          <div class="card-body">
            <div style="width:72px;height:72px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;margin:0 auto 16px;">
              ${(user.salonName || 'GL')[0].toUpperCase()}
            </div>
            <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px;">${user.salonName}</h2>
            <p style="color:var(--text-muted);font-size:.88rem;">${user.ownerName}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body" style="padding:0;">
            <div class="profile-row">
              <span class="profile-label">Salon Name</span>
              <span class="profile-value">${user.salonName}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Owner</span>
              <span class="profile-value">${user.ownerName}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Email</span>
              <span class="profile-value">${user.email || '—'}</span>
            </div>
            <div class="profile-row">
              <span class="profile-label">Phone</span>
              <span class="profile-value">${user.phone}</span>
            </div>
            <div class="profile-row" style="border-bottom:none;">
              <span class="profile-label">Member Since</span>
              <span class="profile-value">${UI.formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
        <button class="btn btn-danger btn-lg" style="width:100%;margin-top:20px;" id="logout-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>`;
    document.getElementById('logout-btn').addEventListener('click', () => {
      Store.logout();
      UI.toast('Signed out successfully', 'info');
      App.afterLogout();
    });
  }
};
