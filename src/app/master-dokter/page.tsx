'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X, CheckCircle2, Trash2, Edit, Search, Plus, ChevronDown
} from 'lucide-react';
import { initStore, doctorStore, idr, uid } from '@/lib/store';
import type { Doctor } from '@/lib/types';

function emptyDoctor() {
  return { id: '', name: '', role: '', sip: '', phone: '', poli: '' };
}

export default function MasterDokterPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(() => doctorStore.getAll());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyDoctor());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  // Load data on mount
  useEffect(() => {
    initStore();
    setDoctors(doctorStore.getAll());
  }, []);

  // Derived
  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.role && d.role.toLowerCase().includes(search.toLowerCase())) ||
    (d.poli && d.poli.toLowerCase().includes(search.toLowerCase()))
  );

  // Form validation
  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nama dokter wajib diisi';
    if (!form.role) errs.role = 'Role wajib diisi';
    return errs;
  }

  function handleAdd() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    const newDoc: Doctor = {
      ...form,
      id: uid(),
      name: form.name.trim(),
    };
    doctorStore.add(newDoc);
    setDoctors(doctorStore.getAll());
    setShowModal(false);
    setForm(emptyDoctor());
    setFormErrors({});
    showToast('Dokter baru berhasil ditambahkan');
  }

  function handleEdit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    doctorStore.update({
      ...form,
      name: form.name.trim(),
    });
    setDoctors(doctorStore.getAll());
    setShowModal(false);
    setIsEditing(false);
    setForm(emptyDoctor());
    setFormErrors({});
    showToast('Data dokter berhasil diperbarui');
  }

  function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus dokter ini?')) {
      doctorStore.delete(id);
      setDoctors(doctorStore.getAll());
      showToast('Dokter berhasil dihapus');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Dokter / Pemeriksa</h1>
          <p className="text-sm text-slate-500">Daftar lengkap dokter dan pemeriksa klinik</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyDoctor());
            setFormErrors({});
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Tambah Dokter
        </button>
      </div>

      {/* Search filter */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama dokter atau peran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 py-2 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">SIP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">No. Telepon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Poli</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    <Search size={32} className="mx-auto mb-2 opacity-30" />
                    <p>Dokter tidak ditemukan</p>
                  </td>
                </tr>
              )}
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{doc.name}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{doc.role}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{doc.sip || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{doc.phone || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{doc.poli || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setForm({ ...doc, sip: doc.sip || '', phone: doc.phone || '', poli: doc.poli || '' });
                          setShowModal(true);
                        }}
                        className="p-1.5 text-teal-600 hover:text-teal-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-3 rounded-2xl bg-teal-600 px-5 py-3 text-white shadow-xl animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg p-6 sm:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                {form.id ? 'Edit Dokter' : 'Tambah Dokter'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form className="space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white border-slate-200"
                />
                {formErrors.name && (
                  <p className="mt-0.5 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white border-slate-200"
                >
                  <option value="Sp.PD">Sp.PD</option>
                  <option value="Sp.OG">Sp.OG</option>
                  <option value="Sp.A">Sp.A</option>
                  <option value="S.Tr.Keb">S.Tr.Keb</option>
                  <option value="Umum">Umum</option>
                </select>
                {formErrors.role && (
                  <p className="mt-0.5 text-xs text-red-500">{formErrors.role}</p>
                )}
              </div>

              {/* SIP */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nomor SIP
                </label>
                <input
                  value={form.sip || ''}
                  onChange={(e) =>
                    setForm({ ...form, sip: e.target.value })
                  }
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white border-slate-200"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  No. Telepon
                </label>
                <input
                  value={form.phone || ''}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white border-slate-200"
                />
              </div>

              {/* Poli */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Poli
                </label>
                <select
                  value={form.poli || ''}
                  onChange={(e) =>
                    setForm({ ...form, poli: e.target.value })
                  }
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white border-slate-200"
                >
                  <option value="">-- Pilih Poli --</option>
                  <option value="Umum">Umum</option>
                  <option value="Ibu">Ibu</option>
                  <option value="Anak">Anak</option>
                  <option value="Mom and Baby Spa">Mom and Baby Spa</option>
                </select>
              </div>

              {/* Modal actions */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={form.id ? handleEdit : handleAdd}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 transition-colors shadow-sm"
                >
                  {form.id ? 'Simpan Perubahan' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}