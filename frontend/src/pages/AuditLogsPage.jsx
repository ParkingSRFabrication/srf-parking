import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { formatDateTime } from '../utils/formatters.js';
import './AuditLogsPage.css';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(actionFilter && { action: actionFilter }),
        ...(entityFilter && { entityType: entityFilter }),
        ...(search && { search })
      });

      const res = await api.get(`/audit-logs?${params.toString()}`);
      if (res.data?.success) {
        setLogs(res.data.logs || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter, entityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAuditLogs();
  };

  return (
    <div className="space-y-6 animate-fade-in audit-logs-page">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-[#00A884]" />
            Security & Operational Audit Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable system audit trail tracking operator actions, financial transactions, and configuration changes ({totalCount} entries)
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="p-2.5 bg-white dark:bg-[#111B21] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition shadow-xs self-start"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-slate-200/90 dark:border-white/10 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Actor Name or Entity Identifier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
          >
            <option value="">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="TOKEN_CREATED">TOKEN_CREATED</option>
            <option value="EXIT_PROCESSED">EXIT_PROCESSED</option>
            <option value="TOKEN_CANCELLED">TOKEN_CANCELLED</option>
            <option value="PASS_CREATED">PASS_CREATED</option>
            <option value="PASS_RENEWED">PASS_RENEWED</option>
            <option value="TARIFF_CREATED">TARIFF_CREATED</option>
            <option value="TARIFF_UPDATED">TARIFF_UPDATED</option>
            <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
            <option value="DATA_EXPORTED">DATA_EXPORTED</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A884]"
          >
            <option value="">All Entity Types</option>
            <option value="ParkingToken">ParkingToken</option>
            <option value="MonthlyPass">MonthlyPass</option>
            <option value="Tariff">Tariff</option>
            <option value="User">User</option>
            <option value="Settings">Settings</option>
            <option value="Auth">Auth</option>
            <option value="Database">Database</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-[#00A884] hover:bg-[#008F6F] text-white font-bold text-xs rounded-xl transition shadow-sm active:scale-[0.98]"
          >
            Filter
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Logs Table Card */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs overflow-hidden">
        {/* Mobile View: Audit Log Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/10">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-[#00A884] rounded-full animate-spin mx-auto mb-2" />
              <span>Loading audit records...</span>
            </div>
          ) : logs.length > 0 ? (
            logs.map(log => (
              <div key={log._id} className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    log.action.includes('FAILED') || log.action.includes('CANCELLED')
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      : log.action.includes('CREATED') || log.action.includes('SUCCESS')
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                  }`}>
                    {log.action}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{formatDateTime(log.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>By: <strong className="text-slate-900 dark:text-white">{log.actorName}</strong> ({log.actorRole})</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">{log.entityType}</span>
                </div>
                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-white/5 truncate">
                    {JSON.stringify(log.details)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No audit log events match your filter.
            </div>
          )}
        </div>

        {/* Desktop View: Full Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/90 dark:border-white/10 font-mono text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-[#00A884] rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.actorRole}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        log.action.includes('FAILED') || log.action.includes('CANCELLED')
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : log.action.includes('CREATED') || log.action.includes('SUCCESS')
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {log.entityId || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit log events match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div>
              Page <strong className="text-slate-800 dark:text-slate-200">{page}</strong> of <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
