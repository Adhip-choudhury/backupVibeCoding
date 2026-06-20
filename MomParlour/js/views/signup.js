const SignupView = {
  render() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-brand">
            <div class="brand-icon" style="width:48px;height:48px;border-radius:12px;font-size:1.2rem;">GL</div>
            <h1>Create Account</h1>
            <p>Register your salon or parlour</p>
          </div>
          <form id="signup-form">
            <div class="form-row">
              <div class="form-group">
                <label for="sup-salon">Salon Name <span style="color:var(--danger)">*</span></label>
                <input type="text" id="sup-salon" class="form-control" placeholder="e.g. Glow Salon" required>
              </div>
              <div class="form-group">
                <label for="sup-owner">Owner Name <span style="color:var(--danger)">*</span></label>
                <input type="text" id="sup-owner" class="form-control" placeholder="e.g. Rajib" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="sup-email">Email <span style="color:var(--danger)">*</span></label>
                <input type="email" id="sup-email" class="form-control" placeholder="e.g. owner@example.com" required>
              </div>
              <div class="form-group">
                <label for="sup-phone">Phone <span style="color:var(--danger)">*</span></label>
                <input type="tel" id="sup-phone" class="form-control" placeholder="e.g. 9876543210" required>
              </div>
            </div>
            <div class="form-group">
              <label for="sup-password">Password <span style="color:var(--danger)">*</span></label>
              <input type="password" id="sup-password" class="form-control" placeholder="Create a password (min 6 chars)" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Create Account
            </button>
          </form>
          <p class="auth-alt">Already have an account? <a href="#login" class="auth-link">Sign in</a></p>
        </div>
      </div>`;
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const salonName = document.getElementById('sup-salon').value.trim();
      const ownerName = document.getElementById('sup-owner').value.trim();
      const email = document.getElementById('sup-email').value.trim();
      const phone = document.getElementById('sup-phone').value.trim();
      const password = document.getElementById('sup-password').value;
      if (!salonName) return UI.toast('Salon name is required', 'danger');
      if (!ownerName) return UI.toast('Owner name is required', 'danger');
      if (!email) return UI.toast('Email is required', 'danger');
      if (!phone) return UI.toast('Phone number is required', 'danger');
      if (!password || password.length < 6) return UI.toast('Password must be at least 6 characters', 'danger');
      const result = await Store.registerAccount({ salonName, ownerName, phone, email, password });
      if (result.error) return UI.toast(result.error, 'danger');
      UI.toast('Account created! Welcome to Glamora.', 'success');
      App.afterLogin();
    });
  }
};
