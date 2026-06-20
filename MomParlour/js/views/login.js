const LoginView = {
  render() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-brand">
            <div class="brand-icon" style="width:48px;height:48px;border-radius:12px;font-size:1.2rem;">GL</div>
            <h1>Glamora</h1>
            <p>Sign in to your account</p>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label for="login-email">Email <span style="color:var(--danger)">*</span></label>
              <input type="email" id="login-email" class="form-control" placeholder="e.g. owner@example.com" required autocomplete="email">
            </div>
            <div class="form-group">
              <label for="login-password">Password <span style="color:var(--danger)">*</span></label>
              <input type="password" id="login-password" class="form-control" placeholder="Enter password" required>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Sign In
            </button>
          </form>
          <p class="auth-alt">Don't have an account? <a href="#signup" class="auth-link">Create one</a></p>
        </div>
      </div>`;
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      if (!email || !password) return UI.toast('Please fill in all fields', 'danger');
      const account = await Store.login(email, password);
      if (!account) return UI.toast('Invalid email or password', 'danger');
      UI.toast(`Welcome back, ${account.ownerName}!`, 'success');
      App.afterLogin();
    });
  }
};
