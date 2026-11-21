import {
  ArrowDown, ArrowUp, ArrowUpDown, CheckSquare, Download, Edit2,
  Eye, Plus, Search, Square, Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

type TableRow = {
  id: string;
  status?: string;
  risk?: string;
  toGrade?: number;
} & Record<string, string | number | boolean | null | undefined>;

type TableProps = {
  title: string;
  subtitle?: string;
  data: TableRow[];
  columns: { key: string; label: string; sortable?: boolean; render?: (row: TableRow) => ReactNode }[];
  filterKey?: string;
  filterLabel?: string;
  searchPlaceholder?: string;
  addLabel?: string;
  onAdd?: () => void;
  onEdit?: (row: TableRow) => void;
  onDelete?: (row: TableRow) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkStatus?: (ids: string[], status: string) => void;
  bulkStatusOptions?: string[];
  onView?: (row: TableRow) => void;
  onExportCSV?: (rows: TableRow[]) => void;
  theme: { primary: string };
};

export default function InteractiveDataTable({
  title,
  subtitle,
  data,
  columns,
  filterKey,
  filterLabel = 'Status',
  searchPlaceholder = 'Search records...',
  onAdd,
  addLabel = 'Add New',
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkStatus,
  bulkStatusOptions = [],
  onView,
  onExportCSV,
  theme
}: TableProps) {
  const [search, setSearch] = useState('');
  const [filterVal, setFilterVal] = useState('All');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filterOptions = useMemo(() => {
    if (!filterKey) return [];
    const set = new Set(data.map((row) => row[filterKey]).filter((value): value is string =>
      typeof value === 'string' && value !== '',
    ));
    return ['All', ...Array.from(set)];
  }, [data, filterKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((item) => {
      const matchFilter = !filterKey || filterVal === 'All' || item[filterKey] === filterVal;
      if (!matchFilter) return false;
      if (!q) return true;
      return Object.values(item).some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [data, search, filterKey, filterVal]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''))
        : String(bv ?? '').localeCompare(String(av ?? ''));
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageData = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  useEffect(() => {
    setPage(1);
  }, [search, filterVal, perPage]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => data.some((d) => d.id === id)));
  }, [data]);

  const toggleSort = (key) => {
    if (sortCol === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  };

  const allOnPageSelected = pageData.length > 0 && pageData.every((row) => selectedIds.includes(row.id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageData.some((r) => r.id === id)));
    } else {
      const next = new Set([...selectedIds, ...pageData.map((r) => r.id)]);
      setSelectedIds(Array.from(next));
    }
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const resetFilters = () => {
    setSearch('');
    setFilterVal('All');
    setSortCol(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] overflow-hidden animate-fadeIn">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-400 transition"
            />
          </div>
          {filterKey && filterOptions.length > 1 && (
            <select
              value={filterVal}
              onChange={(e) => setFilterVal(e.target.value)}
              aria-label={filterLabel}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-400"
            >
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'All' ? `All ${filterLabel}` : opt}
                </option>
              ))}
            </select>
          )}
          {onExportCSV && (
            <button
              type="button"
              onClick={() => onExportCSV(sorted)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          )}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              style={{ backgroundColor: theme.primary }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:brightness-110 active:scale-[0.98] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="px-5 py-2.5 bg-indigo-50/90 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span>{selectedIds.length} item(s) selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onBulkStatus &&
              bulkStatusOptions.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    onBulkStatus(selectedIds, st);
                    setSelectedIds([]);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
                >
                  Set {st}
                </button>
              ))}
            {onBulkDelete && (
              <button
                type="button"
                onClick={() => {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-1.5"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[680px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-5 pr-2 w-10">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-indigo-600 flex items-center"
                  aria-label="Select all"
                >
                  {allOnPageSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              {columns.map((col) => (
                <th key={col.key} className="py-3 px-3">
                  {col.sortable !== false ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-800 transition group"
                    >
                      <span>{col.label}</span>
                      {sortCol === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th className="py-3 pl-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No matching records found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try adjusting your search query or clearing active filters.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                    >
                      Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 pl-5 pr-2">
                      <button
                        type="button"
                        onClick={() => toggleRow(row.id)}
                        className="text-slate-400 hover:text-indigo-600 flex items-center"
                        aria-label={`Select ${row.id}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-3 text-slate-700 align-middle">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                    <td className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(row)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>
            Showing{' '}
            <strong className="text-slate-700">
              {sorted.length === 0 ? 0 : (safePage - 1) * perPage + 1}–
              {Math.min(safePage * perPage, sorted.length)}
            </strong>{' '}
            of <strong className="text-slate-700">{sorted.length}</strong> entries
          </span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              style={p === safePage ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined}
              className={`w-7 h-7 rounded-lg text-xs font-semibold border transition ${
                p === safePage
                  ? 'text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
