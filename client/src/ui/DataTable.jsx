import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

import { EmptyState, StatusBadge } from './Primitives.jsx';

export default function DataTable({
  title,
  description,
  data = [],
  columns = [],
  searchableKeys = [],
  pageSize = 6,
  emptyTitle = 'Nothing to show',
  emptyDescription = 'No rows matched the current view.',
  rowKey,
  onRowSelect,
  accentColumn,
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(columns.find(column => column.sortable)?.key || columns[0]?.key || '');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const searched = normalized
      ? data.filter(row => searchableKeys.some(key => String(row?.[key] ?? '').toLowerCase().includes(normalized)))
      : data;

    if (!sortKey) return searched;

    return [...searched].sort((left, right) => {
      const leftValue = left?.[sortKey];
      const rightValue = right?.[sortKey];
      if (leftValue === rightValue) return 0;

      const compare = typeof leftValue === 'number' && typeof rightValue === 'number'
        ? leftValue - rightValue
        : String(leftValue ?? '').localeCompare(String(rightValue ?? ''), undefined, { numeric: true, sensitivity: 'base' });

      return sortDir === 'asc' ? compare : -compare;
    });
  }, [data, query, searchableKeys, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = column => {
    if (!column.sortable) return;
    if (column.key === sortKey) {
      setSortDir(direction => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(column.key);
      setSortDir('asc');
    }
  };

  return (
    <div className="surface rounded-[var(--radius-xl)] overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-base px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-serif text-base-strong">{title}</h3>
          {description ? <p className="mt-1 text-sm text-base-muted font-sans">{description}</p> : null}
        </div>
        <label className="flex w-full items-center gap-3 rounded-2xl border border-base bg-[var(--bg-inset)] px-4 py-3 md:max-w-sm">
          <Search className="h-4 w-4 text-base-soft" />
          <input
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search records"
            className="w-full bg-transparent text-sm outline-none placeholder:text-base-soft"
          />
        </label>
      </div>

      {pageRows.length === 0 ? (
        <div className="p-5 md:p-8">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[var(--bg-inset)] text-[10px] uppercase tracking-[0.24em] text-base-soft">
              <tr>
                {columns.map(column => (
                  <th key={column.key} className="px-5 py-4 font-semibold">
                    <button type="button" onClick={() => toggleSort(column)} className={`inline-flex items-center gap-2 ${column.sortable ? 'cursor-pointer hover:text-base-strong' : 'cursor-default'}`}>
                      <span>{column.label}</span>
                      {column.sortable ? (
                        sortKey === column.key ? (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />) : <ChevronDown className="h-3.5 w-3.5 opacity-30" />
                      ) : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => {
                const key = rowKey ? rowKey(row, index) : index;
                return (
                  <tr
                    key={key}
                    onClick={onRowSelect ? () => onRowSelect(row) : undefined}
                    className={`border-t border-base transition-colors ${onRowSelect ? 'cursor-pointer hover:bg-[rgba(148,163,184,0.05)]' : ''}`}
                  >
                    {columns.map(column => {
                      const value = typeof column.render === 'function' ? column.render(row, index) : row?.[column.key];
                      return (
                        <td key={column.key} className={`px-5 py-4 align-top text-sm ${column.key === accentColumn ? 'font-semibold text-[var(--accent)]' : 'text-base-muted'}`}>
                          {column.badge ? <StatusBadge tone={column.badge(row)}>{value}</StatusBadge> : value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-base px-5 py-4 text-sm text-base-muted md:flex-row md:items-center md:justify-between">
        <p>
          Showing {pageRows.length} of {filtered.length} records
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(current => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-full border border-base px-3 py-1.5 transition-theme hover:bg-[var(--bg-inset)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <span className="rounded-full border border-base bg-[var(--bg-inset)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-base-strong">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(current => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="rounded-full border border-base px-3 py-1.5 transition-theme hover:bg-[var(--bg-inset)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}