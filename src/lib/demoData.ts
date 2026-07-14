/**
 * ─── DEMO SEED DATA ────────────────────────────────────────────────────────────
 * Constant, in-memory demo dataset that fully replaces the Supabase database.
 * Every row uses snake_case column names so the existing mappers in
 * `store/AppContext.tsx` consume it exactly like real Supabase rows.
 *
 * `buildSeed()` returns a fresh deep-clone each time so the in-memory store can
 * be reset cleanly (e.g. on a full page reload) back to this rich baseline.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const NOW = '2026-07-15T08:00:00.000Z';
const iso = (d: string) => `${d}T08:00:00.000Z`;

// ─── Demo admin identity ───────────────────────────────────────────────────────
export const DEMO_ADMIN = {
  id: 'admin-demo',
  email: 'admin@stationpro.dz',
  name: 'Administrateur Démo',
  username: 'admin',
  role: 'admin',
};

// Default permission set (all modules fully enabled) — handy for demo workers.
const FULL_PERM = {
  voir: true, creer: true, modifier: true, supprimer: true,
  imprimer: true, exporter: true, scanner: true, generer: true,
};
const fullPermissions = () => ({
  Brigades: { ...FULL_PERM }, 'Ventes Carburant': { ...FULL_PERM }, Magasin: { ...FULL_PERM },
  Cuves: { ...FULL_PERM }, Pompes: { ...FULL_PERM }, Pistes: { ...FULL_PERM },
  Produits: { ...FULL_PERM }, Clients: { ...FULL_PERM }, Fournisseurs: { ...FULL_PERM },
  Dépenses: { ...FULL_PERM }, 'Fiche Journalière': { ...FULL_PERM }, Statistiques: { ...FULL_PERM },
  Rapports: { ...FULL_PERM },
});

// ─── Seed factory ──────────────────────────────────────────────────────────────
export function buildSeed(): Record<string, any[]> {
  const seed: Record<string, any[]> = {

    // ── Station settings (single row) ──────────────────────────────────────────
    station_settings: [{
      id: 'settings-1',
      name: 'Station Naftal Centre',
      logo_url: null,
      address: '12 Avenue Mohammed V, Casablanca',
      phone: '+212 522 45 67 89',
      email: 'contact@stationnaftal.ma',
      fiscal_id: 'IF-4589217',
      rc: 'RC-128456',
      fuel_prices:     { SUPER: 14.80, DIESEL: 12.50, ESSENCE: 14.80, GASOIL: 12.50, GPL: 8.50 },
      fuel_buy_prices: { SUPER: 13.20, DIESEL: 11.10, ESSENCE: 13.20, GASOIL: 11.10, GPL: 7.20 },
      conversion_tables: {},
      product_categories: ['Lubrifiants', 'Accessoires', 'Lavage', 'Magasin', 'Boissons'],
      expense_categories: ['Salaires', 'Entretien', 'Électricité', 'Eau', 'Loyer', 'Impôts', 'Divers'],
      product_units: ['Pièce', 'Litre', 'Kg', 'Carton', 'Pack', 'Bidon'],
      decalage_positif_actif: true,
      decalage_negatif_actif: true,
      decalage_positif_seuil: 50,
      decalage_negatif_seuil: 50,
      created_at: NOW,
    }],

    // ── Admin profile (logged-in demo admin) ───────────────────────────────────
    admin_profiles: [{
      id: DEMO_ADMIN.id,
      name: DEMO_ADMIN.name,
      username: DEMO_ADMIN.username,
      email: DEMO_ADMIN.email,
      role: 'admin',
      avatar_url: null,
      created_at: NOW,
    }],

    // ── Tracks (pistes) ────────────────────────────────────────────────────────
    tracks: [
      { id: 'trk-1', name: 'Piste 1', created_at: NOW },
      { id: 'trk-2', name: 'Piste 2', created_at: NOW },
      { id: 'trk-3', name: 'Piste 3', created_at: NOW },
      { id: 'trk-4', name: 'Piste GPL', created_at: NOW },
    ],

    // ── Tanks (cuves) ──────────────────────────────────────────────────────────
    tanks: [
      { id: 'tank-1', name: 'GASOIL-1',  type: 'GASOIL',  capacity: 30000, current: 21500, degrees: 172, alert_threshold: 5000, notes: 'Cuve principale gasoil', created_at: NOW },
      { id: 'tank-2', name: 'GASOIL-2',  type: 'GASOIL',  capacity: 30000, current: 8400,  degrees: 67,  alert_threshold: 5000, notes: '', created_at: NOW },
      { id: 'tank-3', name: 'ESSENCE-3', type: 'ESSENCE', capacity: 20000, current: 14200, degrees: 142, alert_threshold: 4000, notes: '', created_at: NOW },
      { id: 'tank-4', name: 'ESSENCE-4', type: 'ESSENCE', capacity: 20000, current: 3200,  degrees: 32,  alert_threshold: 4000, notes: 'Niveau bas', created_at: NOW },
      { id: 'tank-5', name: 'GPL-1',     type: 'GPL',     capacity: 15000, current: 9600,  degrees: 96,  alert_threshold: 3000, notes: '', created_at: NOW },
    ],

    // ── Pumps + nozzles ────────────────────────────────────────────────────────
    pumps: [
      { id: 'pump-1', number: '1', name: 'POMPE-GASOIL-1',  tank_id: 'tank-1', track_id: 'trk-1', type: 'GASOIL',  last_index: 458200, status: 'Actif', current_brigade_start_index: null, created_at: NOW },
      { id: 'pump-2', number: '2', name: 'POMPE-GASOIL-2',  tank_id: 'tank-2', track_id: 'trk-1', type: 'GASOIL',  last_index: 331050, status: 'Actif', current_brigade_start_index: null, created_at: NOW },
      { id: 'pump-3', number: '3', name: 'POMPE-ESSENCE-1', tank_id: 'tank-3', track_id: 'trk-2', type: 'ESSENCE', last_index: 289640, status: 'Actif', current_brigade_start_index: null, created_at: NOW },
      { id: 'pump-4', number: '4', name: 'POMPE-ESSENCE-2', tank_id: 'tank-4', track_id: 'trk-2', type: 'ESSENCE', last_index: 156700, status: 'Actif', current_brigade_start_index: null, created_at: NOW },
      { id: 'pump-5', number: '5', name: 'POMPE-GPL-1',     tank_id: 'tank-5', track_id: 'trk-4', type: 'GPL',     last_index: 98450,  status: 'Maintenance', current_brigade_start_index: null, created_at: NOW },
    ],
    pump_nozzles: [
      { id: 'noz-1a', pump_id: 'pump-1', name: 'P1', last_index: 229100, start_index: 229100, status: 'Actif' },
      { id: 'noz-1b', pump_id: 'pump-1', name: 'P2', last_index: 229100, start_index: 229100, status: 'Actif' },
      { id: 'noz-2a', pump_id: 'pump-2', name: 'P1', last_index: 165500, start_index: 165500, status: 'Actif' },
      { id: 'noz-2b', pump_id: 'pump-2', name: 'P2', last_index: 165550, start_index: 165550, status: 'Actif' },
      { id: 'noz-3a', pump_id: 'pump-3', name: 'P1', last_index: 144820, start_index: 144820, status: 'Actif' },
      { id: 'noz-3b', pump_id: 'pump-3', name: 'P2', last_index: 144820, start_index: 144820, status: 'Actif' },
      { id: 'noz-4a', pump_id: 'pump-4', name: 'P1', last_index: 78350,  start_index: 78350,  status: 'Actif' },
      { id: 'noz-5a', pump_id: 'pump-5', name: 'P1', last_index: 98450,  start_index: 98450,  status: 'Inactif' },
    ],

    // ── Drivers (chauffeurs) ───────────────────────────────────────────────────
    drivers: [
      { id: 'drv-1', name: 'Rachid Alaoui',  status: 'Actif', phone: '+212 661 22 33 44', email: null, address: null, created_at: NOW },
      { id: 'drv-2', name: 'Karim Bennani',  status: 'Actif', phone: '+212 662 55 66 77', email: null, address: null, created_at: NOW },
    ],

    // ── Product brands ─────────────────────────────────────────────────────────
    product_brands: [
      { id: 'brand-1', name: 'Total' },
      { id: 'brand-2', name: 'Shell' },
      { id: 'brand-3', name: 'Mobil' },
      { id: 'brand-4', name: 'Générique' },
    ],

    // ── Products (magasin) ─────────────────────────────────────────────────────
    products: [
      { id: 'prod-1',  ref: 'LUB-001', name: 'Huile moteur 5W40 5L',   category: 'Lubrifiants', buy_price: 180, selling_price: 240, stock: 48, min_stock: 10, barcode: '6111000000011', image_url: null, unit: 'Bidon',  brand: 'Total',  brand_id: 'brand-1', last_selling_price: 240, tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
      { id: 'prod-2',  ref: 'LUB-002', name: 'Huile moteur 10W40 5L',  category: 'Lubrifiants', buy_price: 150, selling_price: 210, stock: 32, min_stock: 10, barcode: '6111000000028', image_url: null, unit: 'Bidon',  brand: 'Shell',  brand_id: 'brand-2', last_selling_price: 210, tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
      { id: 'prod-3',  ref: 'ACC-001', name: 'Filtre à huile',         category: 'Accessoires', buy_price: 35,  selling_price: 60,  stock: 60, min_stock: 15, barcode: '6111000000035', image_url: null, unit: 'Pièce',  brand: 'Mobil',  brand_id: 'brand-3', last_selling_price: 60,  tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
      { id: 'prod-4',  ref: 'ACC-002', name: 'Balai essuie-glace',     category: 'Accessoires', buy_price: 40,  selling_price: 75,  stock: 8,  min_stock: 12, barcode: '6111000000042', image_url: null, unit: 'Pièce',  brand: 'Générique', brand_id: 'brand-4', last_selling_price: 75, tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
      { id: 'prod-5',  ref: 'LAV-001', name: 'Lavage voiture complet',  category: 'Lavage',      buy_price: 0,   selling_price: 50,  stock: 999, min_stock: 0, barcode: '6111000000059', image_url: null, unit: 'Pièce',  brand: 'Générique', brand_id: 'brand-4', last_selling_price: 50, tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
      { id: 'prod-6',  ref: 'BOI-001', name: 'Eau minérale 1.5L',       category: 'Boissons',    buy_price: 4,   selling_price: 8,   stock: 120, min_stock: 24, barcode: '6111000000066', image_url: null, unit: 'Pièce',  brand: 'Générique', brand_id: 'brand-4', last_selling_price: 8, tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
      { id: 'prod-7',  ref: 'BOI-002', name: 'Café expresso',           category: 'Boissons',    buy_price: 3,   selling_price: 10,  stock: 200, min_stock: 30, barcode: '6111000000073', image_url: null, unit: 'Pièce',  brand: 'Générique', brand_id: 'brand-4', last_selling_price: 10, tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
      { id: 'prod-8',  ref: 'ACC-003', name: 'Liquide de refroidissement 5L', category: 'Accessoires', buy_price: 55, selling_price: 90, stock: 25, min_stock: 8, barcode: '6111000000080', image_url: null, unit: 'Bidon', brand: 'Total', brand_id: 'brand-1', last_selling_price: 90, tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
      { id: 'prod-9',  ref: 'ACC-004', name: 'Ampoule H7',              category: 'Accessoires', buy_price: 20,  selling_price: 45,  stock: 40, min_stock: 10, barcode: '6111000000097', image_url: null, unit: 'Pièce', brand: 'Mobil', brand_id: 'brand-3', last_selling_price: 45, tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
      { id: 'prod-10', ref: 'MAG-001', name: 'Lave-glace 2L',           category: 'Magasin',     buy_price: 12,  selling_price: 25,  stock: 5,  min_stock: 15, barcode: '6111000000103', image_url: null, unit: 'Bidon', brand: 'Générique', brand_id: 'brand-4', last_selling_price: 25, tva_rate: 20, sell_by_details: false, detail_capacity: null, detail_unit: null, created_at: NOW },
    ],

    // ── Pompistes ──────────────────────────────────────────────────────────────
    pompistes: [
      { id: 'pmp-1', name: 'Youssef Amrani',  phone: '+212 600 11 22 33', email: 'y.amrani@demo.ma',  cin: 'BE123456', address: 'Casablanca', photo_url: null, status: 'Actif',   track_id: 'trk-1', chef_id: 'chef-1', base_salary: 3500, has_access: true,  username: 'youssef',  auth_user_id: 'auth-pmp-1', permissions: {}, hire_date: '2024-02-10', created_at: NOW },
      { id: 'pmp-2', name: 'Hamid Ouazzani',  phone: '+212 600 22 33 44', email: 'h.ouazzani@demo.ma', cin: 'BE223344', address: 'Casablanca', photo_url: null, status: 'Actif',   track_id: 'trk-1', chef_id: 'chef-1', base_salary: 3400, has_access: true,  username: 'hamid',    auth_user_id: 'auth-pmp-2', permissions: {}, hire_date: '2024-05-01', created_at: NOW },
      { id: 'pmp-3', name: 'Bouziane Fassi',  phone: '+212 600 33 44 55', email: 'b.fassi@demo.ma',   cin: 'BE334455', address: 'Mohammedia', photo_url: null, status: 'Actif',   track_id: 'trk-2', chef_id: 'chef-1', base_salary: 3400, has_access: false, username: null,       auth_user_id: null,        permissions: {}, hire_date: '2023-11-15', created_at: NOW },
      { id: 'pmp-4', name: 'Said Berrada',    phone: '+212 600 44 55 66', email: 's.berrada@demo.ma', cin: 'BE445566', address: 'Casablanca', photo_url: null, status: 'Actif',   track_id: 'trk-2', chef_id: 'chef-2', base_salary: 3600, has_access: false, username: null,       auth_user_id: null,        permissions: {}, hire_date: '2022-08-20', created_at: NOW },
      { id: 'pmp-5', name: 'Nabil Cherkaoui', phone: '+212 600 55 66 77', email: 'n.cherkaoui@demo.ma',cin: 'BE556677', address: 'Casablanca', photo_url: null, status: 'Actif',   track_id: 'trk-3', chef_id: 'chef-2', base_salary: 3500, has_access: false, username: null,       auth_user_id: null,        permissions: {}, hire_date: '2024-01-05', created_at: NOW },
      { id: 'pmp-6', name: 'Omar Tazi',       phone: '+212 600 66 77 88', email: 'o.tazi@demo.ma',    cin: 'BE667788', address: 'Bouskoura', photo_url: null, status: 'Inactif', track_id: 'trk-3', chef_id: 'chef-2', base_salary: 3300, has_access: false, username: null,       auth_user_id: null,        permissions: {}, hire_date: '2023-03-12', created_at: NOW },
    ],

    // ── Brigade chefs ──────────────────────────────────────────────────────────
    brigade_chefs: [
      { id: 'chef-1', name: 'Mohamed Slaoui',  phone: '+212 611 11 11 11', email: 'm.slaoui@demo.ma',  cin: 'C1122334', address: 'Casablanca', photo_url: null, status: 'Actif', base_salary: 5200, has_access: true,  username: 'mslaoui', auth_user_id: 'auth-chef-1', permissions: fullPermissions(), hire_date: '2021-06-01', created_at: NOW },
      { id: 'chef-2', name: 'Abdelaziz Kabbaj', phone: '+212 611 22 22 22', email: 'a.kabbaj@demo.ma', cin: 'C2233445', address: 'Mohammedia', photo_url: null, status: 'Actif', base_salary: 5000, has_access: true,  username: 'akabbaj', auth_user_id: 'auth-chef-2', permissions: fullPermissions(), hire_date: '2022-01-15', created_at: NOW },
    ],

    // ── Gerants ────────────────────────────────────────────────────────────────
    gerants: [
      { id: 'ger-1', name: 'Fatima Zahra Idrissi', phone: '+212 622 33 44 55', email: 'fz.idrissi@demo.ma', cin: 'G1234567', address: 'Casablanca', photo_url: null, status: 'Actif', base_salary: 7000, has_access: true, username: 'fzidrissi', auth_user_id: 'auth-ger-1', permissions: fullPermissions(), hire_date: '2020-09-01', created_at: NOW },
    ],

    // ── Magasin workers ────────────────────────────────────────────────────────
    magasin_workers: [
      { id: 'mag-1', name: 'Salma Bennis',   phone: '+212 633 44 55 66', email: 's.bennis@demo.ma',  cin: 'M1234567', address: 'Casablanca', photo_url: null, status: 'Actif', base_salary: 3200, has_access: true,  username: 'sbennis', auth_user_id: 'auth-mag-1', permissions: fullPermissions(), hire_date: '2023-07-10', created_at: NOW },
      { id: 'mag-2', name: 'Yassine Mansouri',phone: '+212 633 55 66 77', email: 'y.mansouri@demo.ma',cin: 'M2345678', address: 'Casablanca', photo_url: null, status: 'Actif', base_salary: 3100, has_access: false, username: null,      auth_user_id: null,         permissions: {}, hire_date: '2024-04-02', created_at: NOW },
    ],

    // ── Chef ↔ pompiste assignments ────────────────────────────────────────────
    chef_pompiste_assignments: [
      { chef_id: 'chef-1', pompiste_id: 'pmp-1' },
      { chef_id: 'chef-1', pompiste_id: 'pmp-2' },
      { chef_id: 'chef-1', pompiste_id: 'pmp-3' },
      { chef_id: 'chef-2', pompiste_id: 'pmp-4' },
      { chef_id: 'chef-2', pompiste_id: 'pmp-5' },
      { chef_id: 'chef-2', pompiste_id: 'pmp-6' },
    ],

    // ── Clients ────────────────────────────────────────────────────────────────
    clients: [
      { id: 'cli-1', name: 'Société TransMaroc', phone: '+212 522 11 22 33', cin: null, email: 'contact@transmaroc.ma', address: 'Zone Ind. Ain Sebaa', contact_person: 'M. Alami', balance: 0, debt: 12400, credit_limit: 50000, payment_delay: 30, type: 'ENTREPRISE', payment_mode: 'CREDIT', nif: 'NIF-778812', nis: 'NIS-4412', article: 'ART-90', rc: 'RC-33221', advance_balance: 0, created_at: NOW },
      { id: 'cli-2', name: 'Taxi Coopérative Al Baraka', phone: '+212 661 44 55 66', cin: null, email: null, address: 'Derb Ghallef', contact_person: 'M. Ziani', balance: 0, debt: 3200, credit_limit: 15000, payment_delay: 15, type: 'ENTREPRISE', payment_mode: 'CREDIT', nif: 'NIF-112233', nis: null, article: null, rc: 'RC-11223', advance_balance: 0, created_at: NOW },
      { id: 'cli-3', name: 'Ahmed Particulier', phone: '+212 662 77 88 99', cin: 'BK998877', email: null, address: 'Maarif', contact_person: null, balance: 0, debt: 0, credit_limit: 5000, payment_delay: 0, type: 'PARTICULIER', payment_mode: 'CASH', nif: null, nis: null, article: null, rc: null, advance_balance: 500, created_at: NOW },
      { id: 'cli-4', name: 'Commune Urbaine', phone: '+212 522 99 00 11', cin: null, email: 'marchespublics@commune.ma', address: 'Centre Ville', contact_person: 'Service Achats', balance: 0, debt: 28900, credit_limit: 100000, payment_delay: 60, type: 'GOUVERNEMENT', payment_mode: 'CREDIT', nif: 'NIF-556677', nis: 'NIS-8899', article: 'ART-12', rc: null, advance_balance: 0, created_at: NOW },
      { id: 'cli-5', name: 'Logistique Atlas', phone: '+212 663 22 33 44', cin: null, email: 'info@atlaslog.ma', address: 'Sidi Maarouf', contact_person: 'Mme Radi', balance: 0, debt: 0, credit_limit: 40000, payment_delay: 30, type: 'ENTREPRISE', payment_mode: 'CREDIT', nif: 'NIF-334455', nis: null, article: null, rc: 'RC-55667', advance_balance: 1500, created_at: NOW },
    ],
    client_transactions: [
      { id: 'ctx-1', client_id: 'cli-1', date: '2026-07-02', type: 'SALE',    amount: 8400,  mode: 'CREDIT',  receipt_number: null,     receipt_photo_url: null, notes: 'Plein flotte camions', created_at: iso('2026-07-02') },
      { id: 'ctx-2', client_id: 'cli-1', date: '2026-07-10', type: 'PAYMENT',  amount: 5000,  mode: 'VIREMENT', receipt_number: 'VIR-1120',receipt_photo_url: null, notes: 'Acompte', created_at: iso('2026-07-10') },
      { id: 'ctx-3', client_id: 'cli-3', date: '2026-07-05', type: 'RECHARGE', amount: 500,   mode: 'ESPECES', receipt_number: null,     receipt_photo_url: null, notes: 'Avance', created_at: iso('2026-07-05') },
      { id: 'ctx-4', client_id: 'cli-4', date: '2026-06-28', type: 'SALE',     amount: 28900, mode: 'CREDIT',  receipt_number: null,     receipt_photo_url: null, notes: 'Bon de commande public', created_at: iso('2026-06-28') },
    ],
    client_appointments: [
      { id: 'capp-1', client_id: 'cli-1', sale_id: null, date: '2026-07-25', amount: 7400,  notes: 'Échéance facture', is_paid: false },
      { id: 'capp-2', client_id: 'cli-4', sale_id: null, date: '2026-08-15', amount: 28900, notes: 'Paiement mandat', is_paid: false },
    ],

    // ── Suppliers ──────────────────────────────────────────────────────────────
    suppliers: [
      { id: 'sup-1', ref: 'FRN-001', name: 'Naftal Distribution', contact: 'M. Berrada', phone: '+212 522 30 40 50', email: 'commandes@naftal.ma', address: 'Dépôt Mohammedia', balance: 145000, total_purchases: 980000, nif: 'NIF-1', nis: 'NIS-1', article: 'ART-1', rc: 'RC-1', type: 'Carburant', created_at: NOW },
      { id: 'sup-2', ref: 'FRN-002', name: 'Lubrifiants Maroc SARL', contact: 'Mme Haddad', phone: '+212 522 60 70 80', email: 'ventes@lubmaroc.ma', address: 'Ain Sebaa', balance: 12500, total_purchases: 156000, nif: 'NIF-2', nis: 'NIS-2', article: 'ART-2', rc: 'RC-2', type: 'Magasin', created_at: NOW },
      { id: 'sup-3', ref: 'FRN-003', name: 'AccessoAuto Grossiste', contact: 'M. Ouali', phone: '+212 522 90 10 20', email: 'contact@accessoauto.ma', address: 'Derb Omar', balance: 0, total_purchases: 64000, nif: 'NIF-3', nis: null, article: null, rc: 'RC-3', type: 'Magasin', created_at: NOW },
    ],
    supplier_appointments: [
      { id: 'sapp-1', supplier_id: 'sup-1', purchase_id: null, date: '2026-07-20', amount: 145000, notes: 'Échéance livraison gasoil', is_paid: false },
    ],
    supplier_debt_payments: [
      { id: 'sdp-1', supplier_id: 'sup-2', purchase_id: null, delivery_note_id: null, date: '2026-07-08', amount: 8000, total_due: 20500, rest: 12500, payment_mode: 'CHEQUE', cheque_number: 'CHQ-5521', notes: 'Règlement partiel' },
    ],

    // ── Brigades (with payroll & accounting) ────────────────────────────────────
    brigades: [
      {
        id: 'brig-1', date: '2026-07-14', shift: 'Matin', chef_id: 'chef-1', status: 'Clôturée',
        start_timestamp: iso('2026-07-14'), end_timestamp: iso('2026-07-14'),
        start_time: '06:00', end_time: '14:00',
        start_datetime: '2026-07-14T06:00:00.000Z', end_datetime: '2026-07-14T14:00:00.000Z',
        is_active: false, notes: 'Brigade du matin', printed_at: null,
        start_indices: {}, end_indices: {}, start_tank_levels: {}, end_tank_levels: {},
        pompiste_data: {}, pompiste_assignments: [], start_nozzle_indices: {}, end_nozzle_indices: {},
        active_nozzle_ids: [], can_reactivate: false, created_at: iso('2026-07-14'),
      },
      {
        id: 'brig-2', date: '2026-07-14', shift: 'Soir', chef_id: 'chef-2', status: 'Clôturée',
        start_timestamp: iso('2026-07-14'), end_timestamp: iso('2026-07-14'),
        start_time: '14:00', end_time: '22:00',
        start_datetime: '2026-07-14T14:00:00.000Z', end_datetime: '2026-07-14T22:00:00.000Z',
        is_active: false, notes: '', printed_at: null,
        start_indices: {}, end_indices: {}, start_tank_levels: {}, end_tank_levels: {},
        pompiste_data: {}, pompiste_assignments: [], start_nozzle_indices: {}, end_nozzle_indices: {},
        active_nozzle_ids: [], can_reactivate: false, created_at: iso('2026-07-14'),
      },
      {
        id: 'brig-3', date: '2026-07-15', shift: 'Matin', chef_id: 'chef-1', status: 'Ouverte',
        start_timestamp: iso('2026-07-15'), end_timestamp: null,
        start_time: '06:00', end_time: null,
        start_datetime: '2026-07-15T06:00:00.000Z', end_datetime: null,
        is_active: true, notes: 'Brigade en cours', printed_at: null,
        start_indices: {}, end_indices: {}, start_tank_levels: {}, end_tank_levels: {},
        pompiste_data: {}, pompiste_assignments: [], start_nozzle_indices: {}, end_nozzle_indices: {},
        active_nozzle_ids: [], can_reactivate: false, created_at: iso('2026-07-15'),
      },
    ],
    brigade_pompiste_assignments: [
      { brigade_id: 'brig-1', pompiste_id: 'pmp-1' },
      { brigade_id: 'brig-1', pompiste_id: 'pmp-2' },
      { brigade_id: 'brig-1', pompiste_id: 'pmp-3' },
      { brigade_id: 'brig-2', pompiste_id: 'pmp-4' },
      { brigade_id: 'brig-2', pompiste_id: 'pmp-5' },
      { brigade_id: 'brig-3', pompiste_id: 'pmp-1' },
      { brigade_id: 'brig-3', pompiste_id: 'pmp-2' },
    ],
    brigade_accounting: [
      {
        id: 'acc-1', brigade_id: 'brig-1', total_due: 33400, cash_received: 33000, rest: 400,
        tank_summary: [], nozzle_summary: [], decalage_summary: {}, pompiste_summary: {},
        cuve_verifications: {}, nozzle_verifications: {},
        rest_assigned_worker_type: 'pompiste', rest_assigned_worker_id: 'pmp-3', rest_assigned_amount: 400,
        status: 'completed', created_by: 'Administrateur Démo', created_at: iso('2026-07-14'),
      },
      {
        id: 'acc-2', brigade_id: 'brig-2', total_due: 41250, cash_received: 41250, rest: 0,
        tank_summary: [], nozzle_summary: [], decalage_summary: {}, pompiste_summary: {},
        cuve_verifications: {}, nozzle_verifications: {},
        rest_assigned_worker_type: null, rest_assigned_worker_id: null, rest_assigned_amount: 0,
        status: 'completed', created_by: 'Administrateur Démo', created_at: iso('2026-07-14'),
      },
    ],
    brigade_accounting_justifications: [
      { id: 'jus-1', accounting_id: 'acc-1', client_id: 'cli-2', amount: 3200, client_type: 'ENTREPRISE', payment_mode: 'CREDIT', notes: 'Taxi coopérative', justification_type: 'CLIENT', client_name: null, fuel_type: 'GASOIL', liters: 256, price_per_liter: 12.50, track_id: 'trk-1', pompiste_id: 'pmp-1' },
      { id: 'jus-2', accounting_id: 'acc-1', client_id: null, amount: 1500, client_type: null, payment_mode: 'TPE', notes: 'Paiement carte', justification_type: 'TPE', client_name: 'Client TPE', fuel_type: 'ESSENCE', liters: 101, price_per_liter: 14.80, track_id: 'trk-2', pompiste_id: 'pmp-2' },
    ],

    // ── Worker payroll sub-records ──────────────────────────────────────────────
    worker_acomptes: [
      { id: 'acp-1', worker_type: 'pompiste', worker_id: 'pmp-1', date: '2026-07-05', amount: 500, description: 'Avance', is_paid: false, month_paid: null },
      { id: 'acp-2', worker_type: 'pompiste', worker_id: 'pmp-2', date: '2026-07-08', amount: 300, description: 'Avance', is_paid: false, month_paid: null },
      { id: 'acp-3', worker_type: 'chef_brigade', worker_id: 'chef-1', date: '2026-07-03', amount: 1000, description: 'Avance', is_paid: false, month_paid: null },
    ],
    worker_absences: [
      { id: 'abs-1', worker_type: 'pompiste', worker_id: 'pmp-3', date: '2026-07-09', cost: 150, description: 'Absence non justifiée', is_paid: false, month_paid: null },
    ],
    worker_payment_records: [
      { id: 'pay-1', worker_type: 'pompiste', worker_id: 'pmp-1', month: '2026-06', base_salary: 3500, total_acomptes: 500, total_absences: 0, bonus_decalage: 0, retenue_decalage: 0, net_salary: 3000, payment_date: '2026-06-30', payment_mode: 'ESPECES', cheque_number: null, notes: '', is_paid: true },
      { id: 'pay-2', worker_type: 'chef_brigade', worker_id: 'chef-1', month: '2026-06', base_salary: 5200, total_acomptes: 0, total_absences: 0, bonus_decalage: 200, retenue_decalage: 0, net_salary: 5400, payment_date: '2026-06-30', payment_mode: 'VIREMENT', cheque_number: null, notes: 'Prime décalage', is_paid: true },
    ],
    pompiste_decalage_history: [
      { id: 'dec-1', pompiste_id: 'pmp-3', brigade_id: 'brig-1', date: '2026-07-14', amount: 400, type: 'RETENUE' },
      { id: 'dec-2', pompiste_id: 'pmp-1', brigade_id: 'brig-2', date: '2026-07-14', amount: 120, type: 'BONUS' },
    ],

    // ── Fuel sales ─────────────────────────────────────────────────────────────
    fuel_sales: [
      { id: 'fs-1', date: '2026-07-14', pump_id: 'pump-1', liters: 45.2, price_per_liter: 12.50, total: 565,  payment_mode: 'ESPECES', client_id: null, bon_number: null, bon_photo_url: null, pompiste_id: 'pmp-1', brigade_id: 'brig-1', created_at: iso('2026-07-14') },
      { id: 'fs-2', date: '2026-07-14', pump_id: 'pump-3', liters: 30.0, price_per_liter: 14.80, total: 444,  payment_mode: 'ESPECES', client_id: null, bon_number: null, bon_photo_url: null, pompiste_id: 'pmp-2', brigade_id: 'brig-1', created_at: iso('2026-07-14') },
      { id: 'fs-3', date: '2026-07-14', pump_id: 'pump-1', liters: 256,  price_per_liter: 12.50, total: 3200, payment_mode: 'CREDIT',  client_id: 'cli-2', bon_number: 'BON-778', bon_photo_url: null, pompiste_id: 'pmp-1', brigade_id: 'brig-1', created_at: iso('2026-07-14') },
      { id: 'fs-4', date: '2026-07-14', pump_id: 'pump-2', liters: 80.5, price_per_liter: 12.50, total: 1006, payment_mode: 'ESPECES', client_id: null, bon_number: null, bon_photo_url: null, pompiste_id: 'pmp-4', brigade_id: 'brig-2', created_at: iso('2026-07-14') },
      { id: 'fs-5', date: '2026-07-15', pump_id: 'pump-3', liters: 40.0, price_per_liter: 14.80, total: 592,  payment_mode: 'ESPECES', client_id: null, bon_number: null, bon_photo_url: null, pompiste_id: 'pmp-1', brigade_id: 'brig-3', created_at: iso('2026-07-15') },
    ],

    // ── Shop sales ─────────────────────────────────────────────────────────────
    shop_sales: [
      { id: 'ss-1', date: '2026-07-14', client_id: null, seller_id: 'mag-1', subtotal: 240, tva_amount: 48, total: 288, payment_mode: 'ESPECES', cheque_number: null, bon_number: null, bon_photo_url: null, amount_paid: 288, rest: 0, status: 'Payé', notes: '', printed_at: null, invoice_image_url: null, created_at: iso('2026-07-14') },
      { id: 'ss-2', date: '2026-07-14', client_id: 'cli-3', seller_id: 'mag-1', subtotal: 120, tva_amount: 24, total: 144, payment_mode: 'ESPECES', cheque_number: null, bon_number: null, bon_photo_url: null, amount_paid: 144, rest: 0, status: 'Payé', notes: '', printed_at: null, invoice_image_url: null, created_at: iso('2026-07-14') },
      { id: 'ss-3', date: '2026-07-15', client_id: null, seller_id: 'mag-2', subtotal: 50, tva_amount: 10, total: 60, payment_mode: 'ESPECES', cheque_number: null, bon_number: null, bon_photo_url: null, amount_paid: 60, rest: 0, status: 'Payé', notes: 'Lavage', printed_at: null, invoice_image_url: null, created_at: iso('2026-07-15') },
    ],
    shop_sale_items: [
      { id: 'ssi-1', sale_id: 'ss-1', product_id: 'prod-1', product_name: 'Huile moteur 5W40 5L', quantity: 1, price: 240, tva: 20 },
      { id: 'ssi-2', sale_id: 'ss-2', product_id: 'prod-3', product_name: 'Filtre à huile', quantity: 2, price: 60, tva: 20 },
      { id: 'ssi-3', sale_id: 'ss-3', product_id: 'prod-5', product_name: 'Lavage voiture complet', quantity: 1, price: 50, tva: 20 },
    ],

    // ── Expenses ───────────────────────────────────────────────────────────────
    expenses: [
      { id: 'exp-1', date: '2026-07-01', category: 'Loyer', amount: 8000, description: 'Loyer mensuel', payment_mode: 'VIREMENT', cheque_number: null, paid_by: 'Administrateur Démo', recipient: 'Propriétaire', status: 'Payé', receipt_url: null, created_by: 'admin-demo', created_at: iso('2026-07-01') },
      { id: 'exp-2', date: '2026-07-05', category: 'Électricité', amount: 2400, description: 'Facture LYDEC', payment_mode: 'ESPECES', cheque_number: null, paid_by: 'Administrateur Démo', recipient: 'LYDEC', status: 'Payé', receipt_url: null, created_by: 'admin-demo', created_at: iso('2026-07-05') },
      { id: 'exp-3', date: '2026-07-10', category: 'Entretien', amount: 1200, description: 'Réparation pompe 5', payment_mode: 'ESPECES', cheque_number: null, paid_by: 'Administrateur Démo', recipient: 'Technicien', status: 'Payé', receipt_url: null, created_by: 'admin-demo', created_at: iso('2026-07-10') },
      { id: 'exp-4', date: '2026-07-12', category: 'Eau', amount: 600, description: 'Facture eau', payment_mode: 'ESPECES', cheque_number: null, paid_by: 'Administrateur Démo', recipient: 'ONEE', status: 'À payer', receipt_url: null, created_by: 'admin-demo', created_at: iso('2026-07-12') },
    ],

    // ── Purchases (magasin) ────────────────────────────────────────────────────
    purchases: [
      { id: 'pur-1', date: '2026-07-03', supplier_id: 'sup-2', invoice_number: 'FCT-2201', due_date: '2026-08-03', driver_id: null, total: 20500, amount_paid: 8000, rest: 12500, status: 'Partiel', payment_mode: 'CHEQUE', cheque_number: 'CHQ-5521', linked_delivery_note_id: null, notes: 'Réappro lubrifiants', type: 'RECEPTION', tva_rate: 20, tva_active: true, tank_id: null, receipt_photo_url: null, created_at: iso('2026-07-03') },
      { id: 'pur-2', date: '2026-07-09', supplier_id: 'sup-3', invoice_number: 'FCT-3305', due_date: '2026-07-09', driver_id: null, total: 6400, amount_paid: 6400, rest: 0, status: 'Payé', payment_mode: 'ESPECES', cheque_number: null, linked_delivery_note_id: null, notes: 'Accessoires', type: 'RECEPTION', tva_rate: 20, tva_active: true, tank_id: null, receipt_photo_url: null, created_at: iso('2026-07-09') },
    ],
    purchase_items: [
      { id: 'pit-1', purchase_id: 'pur-1', product_id: 'prod-1', product_name: 'Huile moteur 5W40 5L', quantity: 50, buy_price: 180, selling_price: 240, min_stock: 10, unit: 'Bidon', total: 9000, tank_id: null, tva_active: true, tva_rate: 20 },
      { id: 'pit-2', purchase_id: 'pur-1', product_id: 'prod-2', product_name: 'Huile moteur 10W40 5L', quantity: 40, buy_price: 150, selling_price: 210, min_stock: 10, unit: 'Bidon', total: 6000, tank_id: null, tva_active: true, tva_rate: 20 },
      { id: 'pit-3', purchase_id: 'pur-2', product_id: 'prod-3', product_name: 'Filtre à huile', quantity: 60, buy_price: 35, selling_price: 60, min_stock: 15, unit: 'Pièce', total: 2100, tank_id: null, tva_active: true, tva_rate: 20 },
    ],
    purchase_payments: [
      { id: 'ppy-1', purchase_id: 'pur-1', date: '2026-07-08', amount: 8000, mode: 'CHEQUE', cheque_number: 'CHQ-5521', notes: 'Acompte' },
      { id: 'ppy-2', purchase_id: 'pur-2', date: '2026-07-09', amount: 6400, mode: 'ESPECES', cheque_number: null, notes: 'Réglé' },
    ],

    // ── Delivery notes (bons de livraison carburant) ────────────────────────────
    delivery_notes: [
      { id: 'dn-1', date: '2026-07-11', supplier_id: 'sup-1', tank_id: 'tank-1', liters: 15000, price_per_liter: 11.10, status: 'Reçu', total: 166500, expiry_date: null, bl_number: 'BL-9901', bl_date: '2026-07-11', creation_date: '2026-07-11', immatriculation: '12345-A-6', driver_id: 'drv-1', created_at: iso('2026-07-11') },
      { id: 'dn-2', date: '2026-07-13', supplier_id: 'sup-1', tank_id: 'tank-3', liters: 10000, price_per_liter: 13.20, status: 'Reçu', total: 132000, expiry_date: null, bl_number: 'BL-9915', bl_date: '2026-07-13', creation_date: '2026-07-13', immatriculation: '67890-B-6', driver_id: 'drv-2', created_at: iso('2026-07-13') },
    ],
    delivery_note_items: [
      { id: 'dni-1', delivery_note_id: 'dn-1', tank_id: 'tank-1', liters: 15000, price_per_liter: 11.10, total: 166500 },
      { id: 'dni-2', delivery_note_id: 'dn-2', tank_id: 'tank-3', liters: 10000, price_per_liter: 13.20, total: 132000 },
    ],
    delivery_note_photos: [],
    delivery_note_payments: [
      { id: 'dnp-1', delivery_note_id: 'dn-1', date: '2026-07-11', amount: 100000, mode: 'VIREMENT', receipt_number: 'VIR-8801', receipt_photo_url: null },
    ],

    // ── Inventories ────────────────────────────────────────────────────────────
    inventories: [
      { id: 'inv-1', name: 'Inventaire Magasin Juillet', description: 'Contrôle mensuel', date: '2026-07-01', user_name: 'Administrateur Démo', type: 'Magasin', status: 'Validé', fuel_gaps: [], pump_index_gaps: [], product_gaps: [ { product_id: 'prod-4', system_qty: 12, actual_qty: 8, gap: -4, value: -160 } ], adjustment_reason: 'Casse', adjusted_at: iso('2026-07-01'), created_at: iso('2026-07-01') },
      { id: 'inv-2', name: 'Inventaire Cuves Juillet', description: 'Jaugeage cuves', date: '2026-07-14', user_name: 'Administrateur Démo', type: 'Carburant', status: 'En cours', fuel_gaps: [ { tank_id: 'tank-1', system_qty: 21600, actual_qty: 21500, degrees: 172, gap: -100, value: -1110 } ], pump_index_gaps: [], product_gaps: [], adjustment_reason: null, adjusted_at: null, created_at: iso('2026-07-14') },
    ],

    // ── Daily reports ──────────────────────────────────────────────────────────
    daily_reports: [
      { id: 'rep-1', date: '2026-07-14', fuel_revenue: 74650, shop_revenue: 432, total_expenses: 1200, cash_to_deposit: 73882, tank_variations: [], brigade_ids: ['brig-1', 'brig-2'] },
    ],

    // ── Permission templates ────────────────────────────────────────────────────
    permission_templates: [
      { id: 'tpl-1', name: 'Chef complet', role: 'chef_brigade', permissions: fullPermissions(), created_at: NOW },
      { id: 'tpl-2', name: 'Magasinier standard', role: 'magasin', permissions: { Magasin: { ...FULL_PERM }, Produits: { ...FULL_PERM }, Clients: { ...FULL_PERM } }, created_at: NOW },
    ],

    // ── Activity log ───────────────────────────────────────────────────────────
    activity_log: [
      { id: 'log-1', timestamp: iso('2026-07-14'), user_id: 'admin-demo', action: 'Clôture brigade', details: 'Brigade Matin clôturée' },
      { id: 'log-2', timestamp: iso('2026-07-14'), user_id: 'admin-demo', action: 'Comptabilité', details: 'Comptabilité brigade validée' },
      { id: 'log-3', timestamp: iso('2026-07-11'), user_id: 'admin-demo', action: 'Livraison', details: 'Réception 15000 L gasoil' },
    ],

    // ── Tables kept empty (no demo rows needed, app handles gracefully) ─────────
    tpe_transactions: [],
    brigade_decalage_alerts: [],
    fuel_invoices: [],
    fuel_invoice_bls: [],
    fuel_receipts: [],
    fuel_receipt_invoices: [],
  };

  // Deep clone so callers can freely mutate the working store without touching
  // this template (enables a clean reset on reload).
  return JSON.parse(JSON.stringify(seed));
}
