'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Service, Staff } from '@/types';
import ServiceModal from '@/components/modals/ServiceModal';
import ConfirmDialog from '@/components/ConfirmDialog';

const CATEGORIES = ['Yoga', 'Cardio', 'Strength', 'Pilates', 'Swimming', 'Martial Arts', 'Dance', 'Nutrition', 'Other'];
const PAGE_SIZE_OPTIONS = [10, 50, 100, 500];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.services.listPaged({ search, category: categoryFilter, page, limit });
      setServices(res.services);
      setTotal(res.total);
      setPages(res.pages);
    } catch {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page, limit]);

  useEffect(() => {
    const t = setTimeout(fetchServices, 300);
    return () => clearTimeout(t);
  }, [fetchServices]);

  const handleSearchChange = (val: string) => { setSearch(val); setPage(1); };
  const handleCategoryFilter = (c: string) => { setCategoryFilter(c); setPage(1); };
  const handleLimitChange = (l: number) => { setLimit(l); setPage(1); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.services.delete(deleteTarget._id);
      setDeleteTarget(null);
      const newPage = services.length === 1 && page > 1 ? page - 1 : page;
      if (newPage !== page) setPage(newPage); else fetchServices();
    } catch {
      setError('Failed to delete service');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = () => { setModalOpen(false); fetchServices(); };

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-gray-500 text-sm mt-0.5">{total} services available</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => { setSelected(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Service</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search services..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />
          </div>
          <select className="input sm:w-48" value={categoryFilter} onChange={(e) => handleCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
          <span className="hidden sm:inline">Show</span>
          <div className="flex gap-1">
            {PAGE_SIZE_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => handleLimitChange(n)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  limit === n ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="hidden sm:inline">per page</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No services found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.map((s) => {
              const instructor = s.instructor as Staff | undefined;
              return (
                <div key={s._id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {s.category}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-2">{s.name}</h3>
                    </div>
                    <span className={s.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                      {s.status}
                    </span>
                  </div>

                  {s.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>
                  )}

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price</span>
                      <span className="font-medium text-gray-900">₹{s.price.toLocaleString()}</span>
                    </div>
                    {s.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span className="text-gray-700">{s.duration} month{s.duration > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {s.schedule && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Schedule</span>
                        <span className="text-gray-700 text-right max-w-[60%]">{s.schedule}</span>
                      </div>
                    )}
                    {instructor && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Instructor</span>
                        <span className="text-gray-700 font-medium">{instructor.name}</span>
                      </div>
                    )}
                    {s.maxCapacity && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Capacity</span>
                        <span className="text-gray-700">{s.maxCapacity} members</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => { setSelected(s); setModalOpen(true); }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="card flex items-center justify-between px-4 py-3">
            <p className="text-xs text-gray-500">{from}–{to} of {total}</p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700 px-2">{page} / {pages}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pages}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {modalOpen && (
        <ServiceModal
          service={selected}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Service"
          message={`Are you sure you want to delete "${deleteTarget.name}"? It will be removed from all members.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
