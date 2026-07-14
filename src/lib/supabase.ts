/**
 * ─── IN-MEMORY DEMO BACKEND (Supabase replacement) ─────────────────────────────
 * This module is a drop-in, 100 % offline replacement for the former Supabase
 * client. It exposes the SAME public surface (`supabase`, `db`, `signIn`,
 * `dbInsert`, `subscribeTable`, storage helpers, …) so NOTHING else in the app
 * had to change — but every read/write now targets a constant, in-memory demo
 * dataset (see `demoData.ts`). No network, no credentials, no real database.
 *
 * Mutations made during a session persist in memory (so the UI feels live) and
 * reset back to the rich demo baseline on a full page reload.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { buildSeed, DEMO_ADMIN } from './demoData';

// ─── Mutable in-memory store ────────────────────────────────────────────────────
const store: Record<string, any[]> = buildSeed();

function table(name: string): any[] {
  if (!store[name]) store[name] = [];
  return store[name];
}

// ─── Storage bucket names (unchanged public API) ────────────────────────────────
export const BUCKETS = {
  STATION_LOGOS:   'station-logos',
  PRODUCT_IMAGES:  'product-images',
  WORKER_PHOTOS:   'worker-photos',
  BON_PHOTOS:      'bon-photos',
  DELIVERY_PHOTOS: 'delivery-photos',
  INVOICES:        'invoices',
  EXPENSE_RECEIPTS:'expense-receipts',
  CLIENT_RECEIPTS: 'client-receipts',
} as const;

// ─── Query-builder mock ─────────────────────────────────────────────────────────
// Supports the exact chain the codebase uses:
//   .select().eq().in().match().order().limit().maybeSingle().single()
//   .insert().update().upsert().delete()  (all thenable / awaitable)
type Filter = { kind: 'eq' | 'in' | 'match'; col?: string; val?: any; obj?: Record<string, any> };

class QueryBuilder<T = any> implements PromiseLike<{ data: any; error: any }> {
  private _tableName: string;
  private _op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private _rows: any[] = [];
  private _changes: Record<string, any> = {};
  private _filters: Filter[] = [];
  private _order?: { col: string; ascending: boolean };
  private _limit?: number;
  private _single: 'none' | 'maybe' | 'one' = 'none';
  private _returnAfterWrite = false;

  constructor(tableName: string) { this._tableName = tableName; }

  // ── query kind ──
  select(_cols?: string) {
    if (this._op !== 'select') { this._returnAfterWrite = true; return this; }
    this._op = 'select';
    return this;
  }
  insert(rows: any, _opts?: any) { this._op = 'insert'; this._rows = Array.isArray(rows) ? rows : [rows]; return this; }
  upsert(rows: any, _opts?: any) { this._op = 'upsert'; this._rows = Array.isArray(rows) ? rows : [rows]; return this; }
  update(changes: Record<string, any>) { this._op = 'update'; this._changes = changes; return this; }
  delete() { this._op = 'delete'; return this; }

  // ── filters ──
  eq(col: string, val: any) { this._filters.push({ kind: 'eq', col, val }); return this; }
  in(col: string, val: any[]) { this._filters.push({ kind: 'in', col, val }); return this; }
  match(obj: Record<string, any>) { this._filters.push({ kind: 'match', obj }); return this; }
  // No-op filter helpers occasionally used
  neq(col: string, val: any) { this._filters.push({ kind: 'eq', col, val }); return this; }

  order(col: string, opts?: { ascending?: boolean }) { this._order = { col, ascending: opts?.ascending ?? true }; return this; }
  limit(n: number) { this._limit = n; return this; }
  maybeSingle() { this._single = 'maybe'; return this; }
  single() { this._single = 'one'; return this; }

  // ── execution ──
  private matches(row: any): boolean {
    return this._filters.every(f => {
      if (f.kind === 'eq')  return row[f.col!] === f.val;
      if (f.kind === 'in')  return (f.val as any[]).includes(row[f.col!]);
      if (f.kind === 'match') return Object.entries(f.obj!).every(([k, v]) => row[k] === v);
      return true;
    });
  }

  private run(): { data: any; error: any } {
    const arr = table(this._tableName);

    if (this._op === 'insert') {
      for (const r of this._rows) arr.push({ ...r });
      const data = this._single !== 'none' ? (this._rows[0] ?? null) : this._rows;
      return { data, error: null as any };
    }

    if (this._op === 'upsert') {
      for (const r of this._rows) {
        const idx = arr.findIndex(x => x.id === r.id);
        if (idx >= 0) arr[idx] = { ...arr[idx], ...r };
        else arr.push({ ...r });
      }
      const data = this._single !== 'none' ? (this._rows[0] ?? null) : this._rows;
      return { data, error: null as any };
    }

    if (this._op === 'update') {
      const updated: any[] = [];
      for (const row of arr) {
        if (this.matches(row)) { Object.assign(row, this._changes); updated.push(row); }
      }
      const data = this._single !== 'none' ? (updated[0] ?? null) : updated;
      return { data, error: null as any };
    }

    if (this._op === 'delete') {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (this.matches(arr[i])) arr.splice(i, 1);
      }
      return { data: null, error: null as any };
    }

    // select
    let rows = arr.filter(r => this.matches(r));
    if (this._order) {
      const { col, ascending } = this._order;
      rows = [...rows].sort((a, b) => {
        const av = a[col], bv = b[col];
        if (av === bv) return 0;
        if (av === undefined || av === null) return 1;
        if (bv === undefined || bv === null) return -1;
        return (av < bv ? -1 : 1) * (ascending ? 1 : -1);
      });
    }
    if (this._limit != null) rows = rows.slice(0, this._limit);
    if (this._single === 'maybe' || this._single === 'one') {
      return { data: rows[0] ?? null, error: null as any };
    }
    return { data: rows, error: null as any };
  }

  private exec(): Promise<{ data: any; error: any }> {
    try { return Promise.resolve(this.run()); }
    catch (e) { return Promise.resolve({ data: null, error: null as any }); }
  }

  then<R1 = any, R2 = never>(
    onFulfilled?: ((value: { data: any; error: any }) => R1 | PromiseLike<R1>) | null,
    onRejected?: ((reason: any) => R2 | PromiseLike<R2>) | null
  ): Promise<R1 | R2> {
    return this.exec().then(onFulfilled, onRejected);
  }
  catch<R = never>(onRejected?: ((reason: any) => R | PromiseLike<R>) | null) {
    return this.exec().catch(onRejected);
  }
  finally(onFinally?: (() => void) | null) {
    return this.exec().finally(onFinally);
  }
}

// ─── Auth mock ──────────────────────────────────────────────────────────────────
const SESSION_KEY = 'demo.auth.session';

interface DemoUser { id: string; email: string; user_metadata?: Record<string, any> }
interface DemoSession { access_token: string; refresh_token: string; user: DemoUser }

function makeSession(email = DEMO_ADMIN.email): DemoSession {
  return {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    user: { id: DEMO_ADMIN.id, email, user_metadata: { name: DEMO_ADMIN.name, role: 'admin' } },
  };
}

function loadSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as DemoSession : null;
  } catch { return null; }
}
function saveSession(s: DemoSession | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

let currentSession: DemoSession | null = loadSession();
type AuthListener = (event: string, session: DemoSession | null) => void;
const authListeners: AuthListener[] = [];
function emitAuth(event: string) { authListeners.forEach(cb => { try { cb(event, currentSession); } catch { /* noop */ } }); }

const authApi = {
  getSession: async () => ({ data: { session: currentSession }, error: null as any }),
  onAuthStateChange: (cb: AuthListener) => {
    authListeners.push(cb);
    return { data: { subscription: { unsubscribe: () => {
      const i = authListeners.indexOf(cb); if (i >= 0) authListeners.splice(i, 1);
    } } } };
  },
  signInWithPassword: async ({ email }: { email: string; password: string }) => {
    currentSession = makeSession(email || DEMO_ADMIN.email);
    saveSession(currentSession);
    emitAuth('SIGNED_IN');
    return { data: { user: currentSession.user, session: currentSession }, error: null as any };
  },
  signUp: async ({ email }: { email: string; password: string; options?: any }) => {
    currentSession = makeSession(email || DEMO_ADMIN.email);
    saveSession(currentSession);
    emitAuth('SIGNED_IN');
    return { data: { user: currentSession.user, session: currentSession }, error: null as any };
  },
  signOut: async () => {
    currentSession = null;
    saveSession(null);
    emitAuth('SIGNED_OUT');
    return { error: null as any };
  },
  updateUser: async (_attrs: any) => ({ data: { user: currentSession?.user ?? null }, error: null as any }),
  refreshSession: async () => ({ data: { session: currentSession }, error: null as any }),
};

// ─── RPC mock ───────────────────────────────────────────────────────────────────
async function rpc(fn: string, args?: Record<string, any>) {
  switch (fn) {
    case 'get_my_role':
      return { data: 'admin', error: null as any };
    case 'get_my_worker':
      return { data: null, error: null as any }; // demo admin has no worker row
    case 'provision_worker_account':
      return { data: { ok: true, auth_user_id: `auth-${args?.p_worker_id ?? Date.now()}` }, error: null as any };
    case 'adjust_tank_level': {
      // Best-effort: apply the delta so cuve levels stay consistent in the demo.
      const tankId = args?.p_tank_id ?? args?.tank_id;
      const delta  = args?.p_delta ?? args?.delta_liters ?? 0;
      if (tankId) {
        const t = table('tanks').find(x => x.id === tankId);
        if (t) t.current = Math.max(0, (+t.current || 0) + (+delta || 0));
      }
      return { data: null, error: null as any };
    }
    default:
      return { data: null, error: null as any };
  }
}

// ─── Storage mock ───────────────────────────────────────────────────────────────
const storageApi = {
  from: (_bucket: string) => ({
    upload: async (path: string, file: File) => {
      let publicUrl = path;
      try { publicUrl = URL.createObjectURL(file); } catch { /* ignore */ }
      return { data: { path: publicUrl }, error: null as any };
    },
    getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
    remove: async (_paths: string[]) => ({ data: null, error: null as any }),
  }),
};

// ─── The `supabase` client mock ─────────────────────────────────────────────────
export const supabase = {
  from: <T = any>(name: string) => new QueryBuilder<T>(name),
  auth: authApi,
  rpc,
  storage: storageApi,
  channel: (_name: string) => {
    const ch: any = { on: () => ch, subscribe: () => ch, unsubscribe: () => {} };
    return ch;
  },
  removeChannel: (_ch: any) => {},
};

// ─── File helpers (offline-friendly) ────────────────────────────────────────────
export async function uploadFile(_bucket: string, _path: string, file: File): Promise<string | null> {
  try { return URL.createObjectURL(file); } catch { return null; }
}

export async function uploadBase64(
  _bucket: string,
  _path: string,
  base64: string,
  _mimeType = 'image/jpeg'
): Promise<string | null> {
  // A base64 data-URL is already directly usable as an <img src>, so keep it.
  return base64 || null;
}

export function getPublicUrl(_bucket: string, path: string): string {
  return path;
}

// ─── Auth helpers (public API) ──────────────────────────────────────────────────

/**
 * Demo sign-in. Any credentials succeed and log in as the demo administrator.
 */
export async function signIn(identifier: string, _password: string) {
  const email = (identifier || DEMO_ADMIN.email).trim().toLowerCase();
  await authApi.signInWithPassword({ email, password: _password });
  return { user: currentSession!.user, session: currentSession!, role: 'admin', profile: null };
}

/** One-click demo administrator login (used by the Login page button). */
export async function signInDemoAdmin() {
  await authApi.signInWithPassword({ email: DEMO_ADMIN.email, password: 'demo' });
  return { user: currentSession!.user, session: currentSession!, role: 'admin' as const };
}

export async function signUpAdmin(params: { name: string; username: string; email: string; password: string }) {
  await authApi.signUp({ email: params.email, password: params.password });
  return { user: currentSession!.user, session: currentSession! };
}

export async function signOut() {
  await authApi.signOut();
}

export async function getSession() {
  return currentSession;
}

// ─── Worker account provisioning (no-op in demo) ────────────────────────────────
export type WorkerType = 'pompiste' | 'chef_brigade' | 'gerant' | 'magasin';

export async function provisionWorkerAccount(input: {
  action: 'create' | 'update_password' | 'delete';
  workerType: WorkerType;
  workerId: string;
  username?: string;
  password?: string;
  name?: string;
  email?: string;
}): Promise<{ ok: true; auth_user_id?: string } | { ok: false; error: string }> {
  return { ok: true, auth_user_id: `auth-${input.workerId}` };
}

// ─── Generic DB helpers (operate directly on the in-memory store) ───────────────
export async function dbInsert<T extends object>(tableName: string, row: T): Promise<T> {
  table(tableName).push({ ...(row as any) });
  return row;
}

export async function dbUpsert<T extends object>(tableName: string, row: T): Promise<T> {
  const arr = table(tableName);
  const r = row as any;
  const idx = r.id != null ? arr.findIndex(x => x.id === r.id) : -1;
  if (idx >= 0) arr[idx] = { ...arr[idx], ...r };
  else arr.push({ ...r });
  return row;
}

export async function dbUpdate<T extends object>(
  tableName: string,
  id: string,
  changes: Partial<T>
): Promise<Partial<T>> {
  const arr = table(tableName);
  const row = arr.find(x => x.id === id);
  if (row) Object.assign(row, changes);
  return changes;
}

export async function dbDelete(tableName: string, id: string) {
  const arr = table(tableName);
  const idx = arr.findIndex(x => x.id === id);
  if (idx >= 0) arr.splice(idx, 1);
}

export async function dbSelect<T>(
  tableName: string,
  query?: Record<string, unknown>,
  limit?: number
): Promise<T[]> {
  let rows = table(tableName).slice();
  if (query) {
    rows = rows.filter(r => Object.entries(query).every(([k, v]) => r[k] === v));
  }
  rows.sort((a, b) => {
    const av = a.created_at, bv = b.created_at;
    if (av === bv) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return av < bv ? 1 : -1; // newest first
  });
  if (limit) rows = rows.slice(0, limit);
  return rows as T[];
}

// ─── Specific data loaders (same shape as before) ───────────────────────────────
export const db = {
  // Settings
  getSettings: async () => table('station_settings')[0] ?? null,
  saveSettings: async (settings: Record<string, unknown>) => {
    const arr = table('station_settings');
    if (arr[0]) { Object.assign(arr[0], settings); return { data: arr[0], error: null as any }; }
    arr.push({ id: 'settings-1', ...settings });
    return { data: arr[0], error: null as any };
  },

  // Tanks
  getTanks:   () => dbSelect('tanks'),
  addTank:    (t: object) => dbInsert('tanks', t),
  updateTank: (id: string, t: object) => dbUpdate('tanks', id, t),
  deleteTank: (id: string) => dbDelete('tanks', id),

  // Tracks
  getTracks:   () => dbSelect('tracks'),
  addTrack:    (t: object) => dbInsert('tracks', t),
  updateTrack: (id: string, t: object) => dbUpdate('tracks', id, t),
  deleteTrack: (id: string) => dbDelete('tracks', id),

  // Pumps
  getPumps:   () => dbSelect('pumps'),
  addPump:    (p: object) => dbInsert('pumps', p),
  updatePump: (id: string, p: object) => dbUpdate('pumps', id, p),
  deletePump: (id: string) => dbDelete('pumps', id),

  // Pump Nozzles
  getNozzles:   () => dbSelect('pump_nozzles'),
  addNozzle:    (n: object) => dbInsert('pump_nozzles', n),
  updateNozzle: (id: string, n: object) => dbUpdate('pump_nozzles', id, n),
  deleteNozzle: (id: string) => dbDelete('pump_nozzles', id),

  // Drivers
  getDrivers:   () => dbSelect('drivers'),
  addDriver:    (d: object) => dbInsert('drivers', d),
  deleteDriver: (id: string) => dbDelete('drivers', id),

  // Suppliers
  getSuppliers:   () => dbSelect('suppliers'),
  addSupplier:    (s: object) => dbInsert('suppliers', s),
  updateSupplier: (id: string, s: object) => dbUpdate('suppliers', id, s),
  deleteSupplier: (id: string) => dbDelete('suppliers', id),

  getSupplierAppointments:  (supplierId: string) => dbSelect('supplier_appointments', { supplier_id: supplierId }),
  addSupplierAppointment:   (a: object) => dbInsert('supplier_appointments', a),
  getSupplierDebtPayments:  (supplierId: string) => dbSelect('supplier_debt_payments', { supplier_id: supplierId }),
  addSupplierDebtPayment:   (p: object) => dbInsert('supplier_debt_payments', p),

  // Clients
  getClients:   () => dbSelect('clients'),
  addClient:    (c: object) => dbInsert('clients', c),
  updateClient: (id: string, c: object) => dbUpdate('clients', id, c),
  deleteClient: (id: string) => dbDelete('clients', id),

  getClientTransactions:  (clientId: string) => dbSelect('client_transactions', { client_id: clientId }),
  addClientTransaction:   (t: object) => dbInsert('client_transactions', t),
  getClientAppointments:  (clientId: string) => dbSelect('client_appointments', { client_id: clientId }),
  addClientAppointment:   (a: object) => dbInsert('client_appointments', a),

  // Products
  getProducts:   () => dbSelect('products'),
  addProduct:    (p: object) => dbInsert('products', p),
  updateProduct: (id: string, p: object) => dbUpdate('products', id, p),
  deleteProduct: (id: string) => dbDelete('products', id),

  // Product Brands
  getBrands:   () => dbSelect('product_brands'),
  addBrand:    (b: object) => dbInsert('product_brands', b),
  updateBrand: (id: string, b: object) => dbUpdate('product_brands', id, b),
  deleteBrand: (id: string) => dbDelete('product_brands', id),

  // Pompistes
  getPompistes:   () => dbSelect('pompistes'),
  addPompiste:    (p: object) => dbInsert('pompistes', p),
  updatePompiste: (id: string, p: object) => dbUpdate('pompistes', id, p),
  deletePompiste: (id: string) => dbDelete('pompistes', id),

  // Brigade Chefs
  getBrigadeChefs:   () => dbSelect('brigade_chefs'),
  addBrigadeChef:    (c: object) => dbInsert('brigade_chefs', c),
  updateBrigadeChef: (id: string, c: object) => dbUpdate('brigade_chefs', id, c),
  deleteBrigadeChef: (id: string) => dbDelete('brigade_chefs', id),

  // Gerants
  getGerants:   () => dbSelect('gerants'),
  addGerant:    (g: object) => dbInsert('gerants', g),
  updateGerant: (id: string, g: object) => dbUpdate('gerants', id, g),
  deleteGerant: (id: string) => dbDelete('gerants', id),

  // Magasin Workers
  getMagasinWorkers:   () => dbSelect('magasin_workers'),
  addMagasinWorker:    (m: object) => dbInsert('magasin_workers', m),
  updateMagasinWorker: (id: string, m: object) => dbUpdate('magasin_workers', id, m),
  deleteMagasinWorker: (id: string) => dbDelete('magasin_workers', id),

  // Worker payroll sub-records
  getWorkerAcomptes:       (workerId: string) => dbSelect('worker_acomptes', { worker_id: workerId }),
  addWorkerAcompte:        (a: object) => dbUpsert('worker_acomptes', a),
  getWorkerAbsences:       (workerId: string) => dbSelect('worker_absences', { worker_id: workerId }),
  addWorkerAbsence:        (a: object) => dbUpsert('worker_absences', a),
  getWorkerPaymentRecords: (workerId: string) => dbSelect('worker_payment_records', { worker_id: workerId }),
  addWorkerPaymentRecord:  (p: object) => dbInsert('worker_payment_records', p),
  markPaymentPaid: async (paymentId: string) => dbUpdate('worker_payment_records', paymentId, { is_paid: true }),

  // Brigades
  getBrigades:   () => dbSelect('brigades'),
  addBrigade:    (b: object) => dbInsert('brigades', b),
  updateBrigade: (id: string, b: object) => dbUpdate('brigades', id, b),
  deleteBrigade: (id: string) => dbDelete('brigades', id),

  // Decalage history
  addDecalageHistory: (d: object) => dbInsert('pompiste_decalage_history', d),
  getDecalageHistory: (pompisteId: string) => dbSelect('pompiste_decalage_history', { pompiste_id: pompisteId }),

  // Brigade Accounting
  getBrigadeAccountings: () => dbSelect('brigade_accounting'),
  addBrigadeAccounting: (a: object) => dbInsert('brigade_accounting', a),
  updateBrigadeAccounting: (id: string, a: object) => dbUpdate('brigade_accounting', id, a),
  getBrigadeAccountingJustifications: (accountingId: string) =>
    dbSelect('brigade_accounting_justifications', { accounting_id: accountingId }),
  addBrigadeAccountingJustification: (j: object) => dbInsert('brigade_accounting_justifications', j),

  // Fuel Sales
  getFuelSales:   () => dbSelect('fuel_sales'),
  addFuelSale:    (s: object) => dbInsert('fuel_sales', s),
  updateFuelSale: (id: string, s: object) => dbUpdate('fuel_sales', id, s),
  deleteFuelSale: (id: string) => dbDelete('fuel_sales', id),

  // Shop Sales
  getShopSales:   () => dbSelect('shop_sales'),
  addShopSale:    (s: object) => dbInsert('shop_sales', s),
  updateShopSale: (id: string, s: object) => dbUpdate('shop_sales', id, s),
  deleteShopSale: (id: string) => dbDelete('shop_sales', id),
  addShopSaleItems: (items: object[]) => { items.forEach(i => table('shop_sale_items').push({ ...i })); return Promise.resolve({ error: null as any }); },
  getShopSaleItems: (saleId: string) => dbSelect('shop_sale_items', { sale_id: saleId }),

  // Delivery Notes
  getDeliveryNotes:   () => dbSelect('delivery_notes'),
  addDeliveryNote:    (d: object) => dbInsert('delivery_notes', d),
  updateDeliveryNote: (id: string, d: object) => dbUpdate('delivery_notes', id, d),
  deleteDeliveryNote: (id: string) => dbDelete('delivery_notes', id),
  addDeliveryNotePhoto:   (p: object) => dbInsert('delivery_note_photos', p),
  addDeliveryNotePayment: (p: object) => dbInsert('delivery_note_payments', p),
  getDeliveryNotePhotos:  (noteId: string) => dbSelect('delivery_note_photos', { delivery_note_id: noteId }),
  getDeliveryNotePayments:(noteId: string) => dbSelect('delivery_note_payments', { delivery_note_id: noteId }),

  // Purchases
  getPurchases:   () => dbSelect('purchases'),
  addPurchase:    (p: object) => dbInsert('purchases', p),
  updatePurchase: (id: string, p: object) => dbUpdate('purchases', id, p),
  deletePurchase: (id: string) => dbDelete('purchases', id),
  addPurchaseItems:   (items: object[]) => { items.forEach(i => table('purchase_items').push({ ...i })); return Promise.resolve({ error: null as any }); },
  getPurchaseItems:   (purchaseId: string) => dbSelect('purchase_items', { purchase_id: purchaseId }),
  addPurchasePayment: (p: object) => dbInsert('purchase_payments', p),
  getPurchasePayments:(purchaseId: string) => dbSelect('purchase_payments', { purchase_id: purchaseId }),

  // Expenses
  getExpenses:   () => dbSelect('expenses'),
  addExpense:    (e: object) => dbInsert('expenses', e),
  updateExpense: (id: string, e: object) => dbUpdate('expenses', id, e),
  deleteExpense: (id: string) => dbDelete('expenses', id),

  // Inventories
  getInventories:   () => dbSelect('inventories'),
  addInventory:     (i: object) => dbInsert('inventories', i),
  updateInventory:  (id: string, i: object) => dbUpdate('inventories', id, i),
  deleteInventory:  (id: string) => dbDelete('inventories', id),

  // Daily Reports
  getDailyReports: () => dbSelect('daily_reports'),
  addDailyReport:  (r: object) => dbInsert('daily_reports', r),

  // Permission Templates
  getPermissionTemplates:    () => dbSelect('permission_templates'),
  addPermissionTemplate:     (t: object) => dbInsert('permission_templates', t),
  updatePermissionTemplate:  (id: string, t: object) => dbUpdate('permission_templates', id, t),
  deletePermissionTemplate:  (id: string) => dbDelete('permission_templates', id),

  // Admin Profiles
  getAdminProfiles: () => dbSelect('admin_profiles'),
  getAdminProfile: async (id: string) => table('admin_profiles').find(x => x.id === id) ?? null,
  updateAdminProfile: (id: string, patch: Record<string, unknown>) => dbUpdate('admin_profiles', id, patch),

  // Activity Log
  addActivityLog: (entry: object) => dbInsert('activity_log', { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), ...entry }),
  getActivityLog: () => dbSelect('activity_log', undefined, 200),
};

// ─── Camel ↔ Snake conversion helpers (unchanged) ───────────────────────────────
function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);
}

export function rowToCamel<T extends object>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v;
  return out as T;
}

export function objToSnake<T extends object>(obj: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[toSnake(k)] = v;
  return out as T;
}

export function rowsToCamel<T extends object>(rows: Record<string, unknown>[]): T[] {
  return rows.map(r => rowToCamel<T>(r));
}

// ─── Realtime subscription (no-op in the offline demo) ──────────────────────────
export function subscribeTable(
  _table: string,
  _callback: (payload: { eventType: string; new: unknown; old: unknown }) => void
) {
  return () => { /* nothing to unsubscribe — realtime is disabled in demo mode */ };
}
