'use client';

import { useEffect, useState, useRef } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Package,
  PackagePlus,
  TrendingDown,
  Clock,
  Search,
  Plus,
  X,
  ChevronDown,
  RefreshCw,
  Pill,
} from 'lucide-react';
import { initStore, drugStore, idr, uid } from '@/lib/store';

interface Drug {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  expiryDate: string;
}

const CATEGORIES = [
  'Analgesik/Antipiretik',
  'Antibiotik',
  'Antasida',
  'Antihistamin',
  'Antihipertensi',
  'Antidiabetik',
  'Vitamin & Suplemen',
  'Kortikosteroid',
  'Bronkodilator',
  'Antasida/PPI',
  'Lainnya',
];

type FilterTab = 'Semua' | 'Stok Kritis' | 'Mendekati Expired';

const TABS: FilterTab[] = ['Semua', 'Stok Kritis', 'Mendekati Expired'];

function daysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtDateShort(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}

// ── Stock progress bar ───────────────────────────────────────────────────────
function StockBar({ stock, minStock }: { stock: number; minStock: number }) {
  const ratio = minStock > 0 ? stock / (minStock * 3) : 1;
  const pct = Math.min(100, Math.round(ratio * 100));
  let barColor = 'bg-emerald-400';
  if (stock <= minStock) barColor = 'bg-red-400';
  else if (stock <= minStock * 1.5) barColor = 'bg-amber-400';

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-slate-800">{stock.toLocaleString('id-ID')}</span>
      <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Expiry badge ─────────────────────────────────────────────────────────────
function ExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const days = daysUntilExpiry(expiryDate);
  let cls = 'bg-emerald-50 text-emerald-700';
  if (days < 30) cls = 'bg-red-50 text-red-700';
  else if (days < 60) cls = 'bg-amber-50 text-amber-700';

  return (
    <span className={`inline-flex flex-col items-start gap-0 text-xs font-medium`}>
      <span className={`inline rounded-lg px-2 py-0.5 ${cls}`}>{fmtDateShort(expiryDate)}</span>
      {days < 60 && (
        <span className="text-[10px] text-slate-400 pl-1 mt-0.5">
          {days < 0 ? 'Kadaluarsa!' : `${days} hari lagi`}
        </span>
      )}
    </span>
  );
}

// ── Inline restock popover ───────────────────────────────────────────────────
function RestockCell({
  drug,
  onRestock,
}: {
  drug: Drug;
  onRestock: (id: string, qty: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleOpen() {
    setOpen(true);
    setQty('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleConfirm() {
    const n = parseInt(qty, 10);
    if (!n || n <= 0) return;
    onRestock(drug.id, n);
    setOpen(false);
    setQty('');
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        title="Tambah stok"
        className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100 transition-colors"
      >
        <Plus size={12} />
        Restock
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleConfirm();
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="Jumlah"
        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <button
        onClick={handleConfirm}
        className="rounded-lg bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
      >
        ✓
      </button>
      <button
        onClick={() => setOpen(false)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

// ── Empty drug form ──────────────────────────────────────────────────────────
function emptyForm() {
  return {
    name: '',
    category: CATEGORIES[0],
    stock: '',
    minStock: '',
    unit: 'tablet',
    buyPrice: '',
    sellPrice: '',
    expiryDate: '',
  };
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ApotekPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('Semua');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load data
  function load() {
    initStore();
    setDrugs(drugStore.getAll());
  }

  useEffect(() => {
    load();
  }, []);

  // Derived stats
  const lowStock = drugs.filter((d) => d.stock <= d.minStock);
  const nearExpiry = drugs.filter((d) => daysUntilExpiry(d.expiryDate) < 60);
  const totalStockValue = drugs.reduce((s, d) => s + d.stock * d.buyPrice, 0);

  // Filtered list
  const filtered = drugs.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (activeTab === 'Stok Kritis') return d.stock <= d.minStock;
    if (activeTab === 'Mendekati Expired') return daysUntilExpiry(d.expiryDate) < 60;
    return true;
  });

  // Restock handler
  function handleRestock(id: string, qty: number) {
    const drug = drugStore.get(id);
    if (!drug) return;
    drugStore.update({ ...drug, stock: drug.stock + qty });
    load();
  }

  // Form validation
  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nama obat wajib diisi';
    if (!form.category) errs.category = 'Pilih kategori';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) errs.stock = 'Stok tidak valid';
    if (!form.minStock || isNaN(Number(form.minStock)) || Number(form.minStock) < 0) errs.minStock = 'Min stok tidak valid';
    if (!form.unit.trim()) errs.unit = 'Satuan wajib diisi';
    if (!form.buyPrice || isNaN(Number(form.buyPrice)) || Number(form.buyPrice) < 0) errs.buyPrice = 'Harga beli tidak valid';
    if (!form.sellPrice || isNaN(Number(form.sellPrice)) || Number(form.sellPrice) < 0) errs.sellPrice = 'Harga jual tidak valid';
    if (!form.expiryDate) errs.expiryDate = 'Tanggal expired wajib diisi';
    return errs;
  }

  function handleAddDrug() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    const newDrug: Drug = {
      id: uid(),
      name: form.name.trim(),
      category: form.category,
      stock: Number(form.stock),
      minStock: Number(form.minStock),
      unit: form.unit.trim(),
      buyPrice: Number(form.buyPrice),
      sellPrice: Number(form.sellPrice),
      expiryDate: form.expiryDate,
    };
    drugStore.add(newDrug);
    load();
    setShowModal(false);
    setForm(emptyForm());
    setFormErrors({});
  }

  function handleModalClose() {
    setShowModal(false);
    setForm(emptyForm());
    setFormErrors({});
  }

  // Input helper
  const inp = (field: keyof ReturnType<typeof emptyForm>) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (formErrors[field]) setFormErrors((fe) => ({ ...fe, [field]: '' }));
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
            <Pill size={20} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Apotek & Obat</h1>
            <p className="text-sm text-slate-500">Manajemen stok dan inventaris obat klinik</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors shadow-sm"
        >
          <PackagePlus size={16} />
          Tambah Obat
        </button>
      </div>

      {/* ── Alert banners ── */}
      <div className="mb-5 flex flex-col gap-3">
        {lowStock.length > 0 && (
          <button
            onClick={() => setActiveTab('Stok Kritis')}
            className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-left transition-colors hover:bg-red-100"
          >
            <AlertTriangle size={18} className="flex-shrink-0 text-red-600" />
            <span className="text-sm font-semibold text-red-800">
              {lowStock.length} item stok kritis (di bawah minimum)
            </span>
            <span className="ml-auto text-xs font-medium text-red-600 underline underline-offset-2">
              Lihat semua →
            </span>
          </button>
        )}
        {nearExpiry.length > 0 && (
          <button
            onClick={() => setActiveTab('Mendekati Expired')}
            className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-left transition-colors hover:bg-amber-100"
          >
            <Clock size={18} className="flex-shrink-0 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">
              {nearExpiry.length} item mendekati kadaluarsa (&lt; 60 hari)
            </span>
            <span className="ml-auto text-xs font-medium text-amber-600 underline underline-offset-2">
              Lihat semua →
            </span>
          </button>
        )}
      </div>

      {/* ── Stats cards ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50">
            <Package size={18} className="text-teal-600" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Item Obat</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{drugs.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
            <TrendingDown size={18} className="text-emerald-600" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Nilai Stok</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{idr(totalStockValue)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Stok Kritis</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{lowStock.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
            <AlertCircle size={18} className="text-amber-500" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Near Expiry</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{nearExpiry.length}</p>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
              {tab === 'Stok Kritis' && lowStock.length > 0 && (
                <span className={`ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${activeTab === tab ? 'bg-white text-teal-600' : 'bg-red-100 text-red-600'}`}>
                  {lowStock.length}
                </span>
              )}
              {tab === 'Mendekati Expired' && nearExpiry.length > 0 && (
                <span className={`ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${activeTab === tab ? 'bg-white text-teal-600' : 'bg-amber-100 text-amber-600'}`}>
                  {nearExpiry.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama obat atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Drug Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Nama Obat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Stok</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Min Stok</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Satuan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Harga Beli</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Harga Jual</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Expired</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    Tidak ada obat ditemukan
                  </td>
                </tr>
              )}
              {filtered.map((drug) => {
                const isLow = drug.stock <= drug.minStock;
                const days = daysUntilExpiry(drug.expiryDate);

                return (
                  <tr
                    key={drug.id}
                    className={`transition-colors hover:bg-slate-50/60 ${isLow ? 'bg-red-50/30' : ''}`}
                  >
                    {/* Nama */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isLow && (
                          <span title="Stok kritis">
                            <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
                          </span>
                        )}
                        {days < 60 && !isLow && (
                          <span title="Mendekati expired">
                            <Clock size={13} className="text-amber-500 flex-shrink-0" />
                          </span>
                        )}
                        <span className="font-medium text-slate-800">{drug.name}</span>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {drug.category}
                      </span>
                    </td>

                    {/* Stok */}
                    <td className="px-4 py-3">
                      <StockBar stock={drug.stock} minStock={drug.minStock} />
                    </td>

                    {/* Min Stok */}
                    <td className="px-4 py-3 text-slate-600">{drug.minStock}</td>

                    {/* Satuan */}
                    <td className="px-4 py-3 text-slate-600">{drug.unit}</td>

                    {/* Harga Beli */}
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{idr(drug.buyPrice)}</td>

                    {/* Harga Jual */}
                    <td className="px-4 py-3 font-medium text-teal-700 whitespace-nowrap">{idr(drug.sellPrice)}</td>

                    {/* Expired */}
                    <td className="px-4 py-3">
                      <ExpiryBadge expiryDate={drug.expiryDate} />
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3">
                      <RestockCell drug={drug} onRestock={handleRestock} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
            Menampilkan {filtered.length} dari {drugs.length} item obat
          </div>
        )}
      </div>

      {/* ── Add Drug Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Tambah Obat Baru</h2>
                <p className="text-xs text-slate-500">Isi data obat yang akan ditambahkan ke inventaris</p>
              </div>
              <button
                onClick={handleModalClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Nama */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Nama Obat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 500mg"
                  {...inp('name')}
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                />
                {formErrors.name && <p className="mt-0.5 text-xs text-red-500">{formErrors.name}</p>}
              </div>

              {/* Kategori */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...inp('category')}
                    className={`w-full appearance-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-8 ${formErrors.category ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                {formErrors.category && <p className="mt-0.5 text-xs text-red-500">{formErrors.category}</p>}
              </div>

              {/* Stok & Min Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Stok Awal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...inp('stock')}
                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.stock ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {formErrors.stock && <p className="mt-0.5 text-xs text-red-500">{formErrors.stock}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Min Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...inp('minStock')}
                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.minStock ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {formErrors.minStock && <p className="mt-0.5 text-xs text-red-500">{formErrors.minStock}</p>}
                </div>
              </div>

              {/* Satuan */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. tablet, kapsul, botol, ampul"
                  {...inp('unit')}
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.unit ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                />
                {formErrors.unit && <p className="mt-0.5 text-xs text-red-500">{formErrors.unit}</p>}
              </div>

              {/* Harga Beli & Jual */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Harga Beli (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...inp('buyPrice')}
                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.buyPrice ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {formErrors.buyPrice && <p className="mt-0.5 text-xs text-red-500">{formErrors.buyPrice}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Harga Jual (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...inp('sellPrice')}
                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.sellPrice ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {formErrors.sellPrice && <p className="mt-0.5 text-xs text-red-500">{formErrors.sellPrice}</p>}
                </div>
              </div>

              {/* Tanggal Expired */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tanggal Expired <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...inp('expiryDate')}
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${formErrors.expiryDate ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                />
                {formErrors.expiryDate && <p className="mt-0.5 text-xs text-red-500">{formErrors.expiryDate}</p>}
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddDrug}
                className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors shadow-sm"
              >
                <Plus size={15} />
                Simpan Obat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
