class AutoKhataDB {
  constructor() {
    this.currentUserId = null;
    this.currentUser = null;
    this._db = firebase.firestore();
    this.ready = this._init();
  }

  async _init() {
    try {
      await this._db.enablePersistence({ synchronizeTabs: true });
    } catch { }
  }

  _collection(name) {
    return this._db.collection(name);
  }

  _mapDoc(doc) {
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  _mapDocs(snap) {
    return snap.docs.map(d => this._mapDoc(d));
  }

  _authErrorToMessage(err) {
    const code = err.code || '';
    if (code.includes('user-not-found') || code.includes('invalid-credential')) return 'Phone not registered';
    if (code.includes('wrong-password')) return 'Wrong password';
    if (code.includes('email-already-in-use')) return 'Phone already registered';
    if (code.includes('weak-password')) return 'Password too weak (min 6 chars)';
    if (code.includes('network-request-failed')) return 'No internet connection';
    return err.message || 'Something went wrong';
  }

  // ============ AUTH ============

  async registerUser(name, phone, password) {
    const email = `${phone}@autokhata.app`;
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;
    await this._collection('users').doc(uid).set({
      name, phone, createdAt: new Date().toISOString()
    });
    this.currentUserId = uid;
    this.currentUser = { id: uid, name, phone };
    localStorage.setItem('autokhata-user', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  async loginUser(phone, password) {
    const email = `${phone}@autokhata.app`;
    const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
    const uid = cred.user.uid;
    const doc = await this._collection('users').doc(uid).get();
    if (!doc.exists) throw new Error('User not found');
    const data = doc.data();
    this.currentUserId = uid;
    this.currentUser = { id: uid, name: data.name, phone: data.phone };
    localStorage.setItem('autokhata-user', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  logoutUser() {
    firebase.auth().signOut().catch(() => {});
    this.currentUserId = null;
    this.currentUser = null;
    localStorage.removeItem('autokhata-user');
  }

  getSavedUser() {
    try {
      const data = localStorage.getItem('autokhata-user');
      if (data) {
        const user = JSON.parse(data);
        this.currentUserId = user.id;
        this.currentUser = user;
        return user;
      }
    } catch { }
    return null;
  }

  // ============ CUSTOMERS ============

  async addCustomer(customer) {
    customer.userId = this.currentUserId;
    customer.balance = 0;
    customer.totalPending = 0;
    customer.totalReceived = 0;
    customer.createdAt = new Date().toISOString();
    const ref = await this._collection('customers').add(customer);
    return ref.id;
  }

  async updateCustomer(id, data) {
    await this._collection('customers').doc(id).update(data);
  }

  async getCustomer(id) {
    const doc = await this._collection('customers').doc(id).get();
    return this._mapDoc(doc);
  }

  async getAllCustomers() {
    const snap = await this._collection('customers')
      .where('userId', '==', this.currentUserId)
      .get();
    return this._mapDocs(snap);
  }

  async deleteCustomer(id) {
    await this._collection('customers').doc(id).delete();
  }

  async searchCustomers(query) {
    const all = await this.getAllCustomers();
    const q = query.toLowerCase();
    return all.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q))
    );
  }

  // ============ TRANSACTIONS ============

  async addTransaction(tx) {
    tx.userId = this.currentUserId;
    tx.date = tx.date || new Date().toISOString();
    tx.createdAt = new Date().toISOString();
    const ref = await this._collection('transactions').add(tx);

    const customer = await this.getCustomer(tx.customerId);
    if (customer) {
      if (tx.type === 'pending') {
        customer.totalPending = (customer.totalPending || 0) + tx.amount;
        customer.balance = (customer.balance || 0) + tx.amount;
      } else if (tx.type === 'received') {
        customer.totalReceived = (customer.totalReceived || 0) + tx.amount;
        customer.balance = (customer.balance || 0) - tx.amount;
      }
      await this._collection('customers').doc(tx.customerId).update({
        totalPending: customer.totalPending,
        totalReceived: customer.totalReceived,
        balance: customer.balance
      });
    }

    await this._updateDailySummary(tx);
    return ref.id;
  }

  async getCustomerTransactions(customerId) {
    const all = await this.getAllTransactions();
    return all.filter(t => t.customerId === customerId);
  }

  async getAllTransactions() {
    const snap = await this._collection('transactions')
      .where('userId', '==', this.currentUserId)
      .get();
    return this._mapDocs(snap)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getTodayTransactions() {
    const all = await this.getAllTransactions();
    const today = new Date().toDateString();
    return all.filter(t => new Date(t.date).toDateString() === today);
  }

  async getTransactionsInRange(start, end) {
    const all = await this.getAllTransactions();
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return all.filter(t => {
      const d = new Date(t.date).getTime();
      return d >= s && d <= e;
    });
  }

  async _updateDailySummary(tx) {
    const dateKey = new Date(tx.date).toDateString();
    const docId = `${this.currentUserId}_${dateKey}`;
    const ref = this._collection('dailySummaries').doc(docId);
    const doc = await ref.get();
    let summary;
    if (doc.exists) {
      summary = doc.data();
    } else {
      summary = { userId: this.currentUserId, dateKey, totalReceived: 0, totalPendingAdded: 0, totalCleared: 0, finalNetIncome: 0 };
    }
    if (tx.type === 'pending') {
      summary.totalPendingAdded += tx.amount;
    } else if (tx.type === 'received') {
      summary.totalReceived += tx.amount;
      summary.totalCleared += tx.amount;
    }
    summary.finalNetIncome = summary.totalReceived - summary.totalPendingAdded;
    await ref.set(summary);
  }

  // ============ DASHBOARD ============

  async getDashboardStats() {
    const customers = await this.getAllCustomers();
    const todayTx = await this.getTodayTransactions();

    const totalPending = customers.reduce((s, c) => s + Math.max(0, c.balance || 0), 0);
    const totalReceived = customers.reduce((s, c) => s + (c.totalReceived || 0), 0);
    const activeCustomers = customers.filter(c => (c.totalReceived || 0) > 0 || (c.totalPending || 0) > 0).length;
    const overdueCount = customers.filter(c => (c.balance || 0) > 0).length;

    let todayIncome = 0;
    for (const tx of todayTx) {
      if (tx.type === 'received') todayIncome += tx.amount;
      if (tx.type === 'pending') todayIncome -= tx.amount;
    }

    const totalCollected = customers.reduce((s, c) => s + (c.totalReceived || 0), 0);
    const totalBilled = totalCollected + totalPending;
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    return { todayIncome, totalPending, totalReceived, activeCustomers, overdueCount, collectionRate };
  }

  // ============ INCOME ANALYTICS ============

  async getIncomeAnalytics() {
    const transactions = await this.getAllTransactions();
    const incomeTx = transactions.filter(t => t.type === 'received');

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const dailyData = [];
    for (let d = 1; d <= 31; d++) {
      const date = new Date(currentYear, currentMonth, d);
      if (date.getMonth() !== currentMonth) break;
      dailyData.push({ day: d, dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }), amount: 0, isWeekend: date.getDay() === 0 || date.getDay() === 6 });
    }

    for (const tx of incomeTx) {
      const d = new Date(tx.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const entry = dailyData.find(x => x.day === d.getDate());
        if (entry) entry.amount += tx.amount;
      }
    }

    const daysWithData = dailyData.filter(x => x.amount > 0);
    const totalThisMonth = dailyData.reduce((s, d) => s + d.amount, 0);
    const daysElapsed = dailyData.filter(d => d.day <= now.getDate()).length;
    const dailyAvg = daysElapsed > 0 ? totalThisMonth / daysElapsed : 0;

    const dayOfWeekTotals = {};
    const dayOfWeekCounts = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    for (const tx of incomeTx) {
      const d = new Date(tx.date);
      if (d >= ninetyDaysAgo) {
        const dn = d.getDay();
        dayOfWeekTotals[dn] = (dayOfWeekTotals[dn] || 0) + tx.amount;
        dayOfWeekCounts[dn] = (dayOfWeekCounts[dn] || 0) + 1;
      }
    }
    const dayOfWeekAvg = {};
    let bestDay = '', bestDayAmount = 0;
    for (let i = 0; i < 7; i++) {
      const avg = (dayOfWeekCounts[i] || 0) > 0 ? (dayOfWeekTotals[i] || 0) / (dayOfWeekCounts[i] || 1) : 0;
      dayOfWeekAvg[dayNames[i]] = Math.round(avg);
      if (avg > bestDayAmount) { bestDayAmount = Math.round(avg); bestDay = dayNames[i]; }
    }

    let growthRate = 0, projectedNextMonth = 0, trend = 0;
    if (daysWithData.length >= 2) {
      const pts = daysWithData.map(d => ({ x: d.day, y: d.amount }));
      const n = pts.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (const p of pts) { sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumX2 += p.x * p.x; }
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      trend = Math.round(slope * 100) / 100;

      for (let d = 1; d <= 30; d++) {
        projectedNextMonth += Math.max(0, slope * (now.getDate() + d) + intercept);
      }
      projectedNextMonth = Math.round(projectedNextMonth);

      const mid = Math.floor(pts.length / 2);
      const firstHalf = pts.slice(0, mid).reduce((s, p) => s + p.y, 0);
      const secondHalf = pts.slice(mid).reduce((s, p) => s + p.y, 0);
      growthRate = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0;
    }

    let prevMonthTotal = 0;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    for (const tx of incomeTx) {
      const d = new Date(tx.date);
      if (d.getFullYear() === prevYear && d.getMonth() === prevMonth) {
        prevMonthTotal += tx.amount;
      }
    }

    const maxDaily = Math.max(...dailyData.map(d => d.amount), 1);
    const activeDays = daysWithData.length;
    const earningVelocity = daysElapsed > 0 ? Math.round(totalThisMonth / daysElapsed) : 0;

    return {
      dailyData, dayOfWeekAvg, bestDay, bestDayAmount, totalThisMonth,
      prevMonthTotal, projectedNextMonth, growthRate, trend,
      dailyAvg: Math.round(dailyAvg), daysElapsed, activeDays,
      daysInMonth: dailyData.length, maxDaily, earningVelocity
    };
  }
}

const DB = new AutoKhataDB();
