import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../services/authService';
import { deletePermit, getPermits, updatePermit } from '../services/permitService';

// Number of rows shown per page (keeps the DOM small and fast)
const PAGE_SIZE = 20;

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

// Shared button styles
const btnBase =
  'inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
const btnPrimary = `${btnBase} bg-indigo-600 text-white shadow-sm hover:bg-indigo-700`;
const btnGhost = `${btnBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
const rowAction =
  'cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

// Single table row. React.memo prevents re-rendering unchanged rows
// when the user types in the search box or another row changes.
const PermitRow = memo(function PermitRow({ permit, onView, onEdit, onToggle, onDelete }) {
  const initial = (permit.worker_name || '?').trim().charAt(0).toUpperCase();

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 font-mono text-[13px] font-medium text-slate-900">{permit.permit_no}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
            {initial}
          </span>
          <span className="text-sm font-medium text-slate-800">{permit.worker_name}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-[13px] text-slate-500">{permit.iqama_no}</td>
      <td className="px-4 py-3 text-sm text-slate-500">{permit.gender || '—'}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            permit.status ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${permit.status ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {permit.status ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center justify-end gap-1">
          <button className={rowAction} onClick={() => onView(permit)}>View</button>
          <button className={rowAction} onClick={() => onEdit(permit)}>Edit</button>
          <button className={rowAction} onClick={() => onToggle(permit)}>
            {permit.status ? 'Deactivate' : 'Activate'}
          </button>
          <button
            className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            onClick={() => onDelete(permit)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
});

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [page, setPage] = useState(1);

  // Search text is deferred so typing stays smooth even with many records
  const deferredQuery = useDeferredValue(query);

  const loadPermits = useCallback(async () => {
    setLoading(true);
    try {
      setPermits(await getPermits());
      setError('');
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Could not load permits.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load once on mount only (no focus listener = no repeated server calls)
  useEffect(() => {
    loadPermits();
  }, [loadPermits]);

  const handleView = useCallback(
    (permit) => window.open(`/Verification_Portal/${permit._id}`, '_blank', 'noopener,noreferrer'),
    []
  );

  const handleEdit = useCallback((permit) => navigate(`/permit-form/${permit._id}`), [navigate]);

  // Optimistic toggle: update UI immediately, roll back if the server fails
  const handleToggle = useCallback(async (permit) => {
    const nextStatus = !permit.status;
    setPermits((prev) => prev.map((p) => (p._id === permit._id ? { ...p, status: nextStatus } : p)));
    try {
      await updatePermit(permit._id, { status: nextStatus });
    } catch (toggleError) {
      setPermits((prev) => prev.map((p) => (p._id === permit._id ? { ...p, status: permit.status } : p)));
      setError(toggleError.response?.data?.message || 'Could not update permit status.');
    }
  }, []);

  // Delete on the server, then remove from local state (no full reload)
  const handleDelete = useCallback(async (permit) => {
    if (!window.confirm(`Delete permit ${permit.permit_no}?`)) return;
    try {
      await deletePermit(permit._id);
      setPermits((prev) => prev.filter((p) => p._id !== permit._id));
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Could not delete permit.');
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  // Summary counts in a single pass
  const { activeCount, inactiveCount } = useMemo(() => {
    let active = 0;
    for (const p of permits) if (p.status) active += 1;
    return { activeCount: active, inactiveCount: permits.length - active };
  }, [permits]);

  // Client-side search + status filter
  const filteredPermits = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return permits.filter((p) => {
      if (statusFilter === 'active' && !p.status) return false;
      if (statusFilter === 'inactive' && p.status) return false;
      if (!q) return true;
      return [p.permit_no, p.worker_name, p.iqama_no]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [permits, deferredQuery, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPermits.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagePermits = useMemo(
    () => filteredPermits.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredPermits, pageStart]
  );

  const stats = [
    { label: 'Total permits', value: permits.length, color: 'bg-indigo-500' },
    { label: 'Active', value: activeCount, color: 'bg-emerald-500' },
    { label: 'Inactive', value: inactiveCount, color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Top bar (no blur effect, much lighter to render) */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">A</span>
            <span className="text-sm font-semibold text-slate-900">Ajeer</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-500">Permits</span>
          </div>
          <button className={btnGhost} onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Title + primary action */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900">Permit dashboard</h1>
            <p className="mb-0 mt-1 text-sm text-slate-500">Manage worker permits and their verification status.</p>
          </div>
          <button className={btnPrimary} onClick={() => navigate('/permit-form')}>
            <span aria-hidden="true" className="text-lg leading-none">+</span> Add permit
          </button>
        </div>

        {/* Stat cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <span className={`h-2 w-2 rounded-full ${stat.color}`} />
                {stat.label}
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{stat.value}</div>
            </div>
          ))}
        </section>

        {/* Table card */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"
              >
                <circle cx="9" cy="9" r="5.5" />
                <path d="M13.5 13.5L17 17" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search permit, worker, iqama..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Segmented status filter */}
              <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => {
                      setStatusFilter(filter.key);
                      setPage(1);
                    }}
                    className={`h-9 cursor-pointer px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                      statusFilter === filter.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <button className={btnGhost} onClick={loadPermits} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {error && (
            <p className="m-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Permit no.</th>
                  <th className="px-4 py-3 font-semibold">Worker</th>
                  <th className="px-4 py-3 font-semibold">Iqama / ID</th>
                  <th className="px-4 py-3 font-semibold">Gender</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagePermits.map((permit) => (
                  <PermitRow
                    key={permit._id}
                    permit={permit}
                    onView={handleView}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}

                {pagePermits.length === 0 && !error && (
                  <tr>
                    <td className="px-6 py-14 text-center text-sm text-slate-500" colSpan="6">
                      {loading
                        ? 'Loading permits...'
                        : permits.length === 0
                          ? 'No permits yet. Click "Add permit" to create the first one.'
                          : 'No permits match your search or filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row">
            <span>
              Showing {filteredPermits.length === 0 ? 0 : pageStart + 1}–{pageStart + pagePermits.length} of{' '}
              {filteredPermits.length} records
              {filteredPermits.length !== permits.length && ` (${permits.length} total)`}
            </span>
            <div className="flex items-center gap-2">
              <button
                className={`${btnGhost} !h-8 !px-3 !text-xs`}
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </button>
              <span className="tabular-nums">
                Page {currentPage} / {totalPages}
              </span>
              <button
                className={`${btnGhost} !h-8 !px-3 !text-xs`}
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;