const Store = {
  _db: null,
  _ready: false,
  _readyQueue: [],

  init(config) {
    firebase.initializeApp(config);
    this._db = firebase.firestore();
    try {
      firebase.firestore().enablePersistence();
    } catch (e) {
      // offline persistence not supported
    }
    return new Promise(resolve => {
      firebase.auth().onAuthStateChanged(() => {
        if (!this._ready) {
          this._ready = true;
          this._readyQueue.forEach(fn => fn());
          this._readyQueue = [];
          resolve();
        }
      });
    });
  },

  _whenReady() {
    if (this._ready) return Promise.resolve();
    return new Promise(resolve => this._readyQueue.push(resolve));
  },

  _ref(collection) {
    return this._db.collection(collection);
  },

  _doc(collection, id) {
    return this._db.collection(collection).doc(id);
  },

  _plainData(data) {
    const plain = { ...data };
    for (const key of Object.keys(plain)) {
      if (plain[key] && typeof plain[key] === 'object' && typeof plain[key].toDate === 'function') {
        plain[key] = plain[key].toDate().toISOString();
      }
    }
    return plain;
  },

  _snapToData(snap) {
    if (!snap.exists) return null;
    return { id: snap.id, ...this._plainData(snap.data()) };
  },

  _snapToArray(snap) {
    const arr = [];
    snap.forEach(doc => arr.push({ id: doc.id, ...this._plainData(doc.data()) }));
    return arr;
  },

  async getAll(collection) {
    await this._whenReady();
    const snap = await this._ref(collection).get();
    return this._snapToArray(snap);
  },

  async getById(collection, id) {
    await this._whenReady();
    const snap = await this._doc(collection, id).get();
    return this._snapToData(snap);
  },

  async add(collection, item) {
    await this._whenReady();
    const data = { ...item, createdAt: new Date().toISOString() };
    const ref = await this._ref(collection).add(data);
    return { id: ref.id, ...data };
  },

  async update(collection, id, updates) {
    await this._whenReady();
    const data = { ...updates, updatedAt: new Date().toISOString() };
    await this._doc(collection, id).update(data);
    const snap = await this._doc(collection, id).get();
    return this._snapToData(snap);
  },

  async delete(collection, id) {
    await this._whenReady();
    await this._doc(collection, id).delete();
  },

  async filter(collection, predicate) {
    const all = await this.getAll(collection);
    return all.filter(predicate);
  },

  async sumBy(collection, field) {
    const all = await this.getAll(collection);
    return all.reduce((s, item) => s + (Number(item[field]) || 0), 0);
  },

  async count(collection) {
    const all = await this.getAll(collection);
    return all.length;
  },

  async seed(collection, items) {
    const snap = await this._ref(collection).get();
    if (snap.empty) {
      const batch = this._db.batch();
      items.forEach(item => {
        const ref = this._ref(collection).doc();
        batch.set(ref, { ...item, createdAt: new Date().toISOString() });
      });
      await batch.commit();
    }
  },

  async registerAccount(data) {
    const { email, password, ...profile } = data;
    try {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;
      await this._doc('accounts', uid).set({
        ...profile,
        email,
        createdAt: new Date().toISOString()
      });
      return { account: { id: uid, ...profile, email } };
    } catch (err) {
      return { error: err.message };
    }
  },

  async login(email, password) {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      return this.getCurrentUser();
    } catch {
      return null;
    }
  },

  logout() {
    firebase.auth().signOut();
  },

  isLoggedIn() {
    return !!firebase.auth().currentUser;
  },

  async getCurrentUser() {
    const fbUser = firebase.auth().currentUser;
    if (!fbUser) return null;
    const snap = await this._doc('accounts', fbUser.uid).get();
    if (!snap.exists) return null;
    const data = this._plainData(snap.data());
    return { id: snap.id, ...data, email: fbUser.email };
  },

  hasAccounts() {
    return true;
  }
};
