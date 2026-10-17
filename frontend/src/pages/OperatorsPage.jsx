import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  KeyRound,
  Lock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api.js';
import { formatDateTime } from '../utils/formatters.js';
import './OperatorsPage.css';

export function OperatorsPage() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create operator modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formUsername, setFormUsername] = useState('');
  const [formOperatorId, setFormOperatorId] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('operator');
  const [formPassword, setFormPassword] = useState('Operator@123');
  const [formMpin, setFormMpin] = useState('1122');
  const [creating, setCreating] = useState(false);

  const fetchOperators = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/operators');
      if (res.data?.success) {
        setOperators(res.data.operators || []);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleCreateOperator = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/operators', {
        username: formUsername.trim().toLowerCase(),
        operatorId: formOperatorId.trim().toUpperCase(),
        name: formName.trim(),
        role: formRole,
        password: formPassword,
        mpin: formMpin
      });

      setShowCreateModal(false);
      // Reset
      setFormUsername('');
      setFormOperatorId('');
      setFormName('');
      fetchOperators();
    } catch (err) {
      alert(`Failed to create operator: ${getErrorMessage(err)}`);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (op) => {
    const newStatus = !op.isActive;
    const confirmMsg = newStatus
      ? `Re-activate operator account ${op.name}?`
      : `Deactivate operator account ${op.name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/operators/${op._id}`, { isActive: newStatus });
      fetchOperators();
    } catch (err) {
      alert(`Operation failed: ${getErrorMessage(err)}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00A884]/10 border border-[#00A884]/30 rounded-full text-[11px] font-bold text-[#00A884] mb-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
            <span>STAFF & ACCESS CONTROL LEDGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
            Booth Operator Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create operator accounts, configure MPIN credentials, and manage POS terminal access
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#00A884] hover:bg-[#008F6F] active:scale-[0.99] text-white rounded-2xl text-xs font-bold transition shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Operator Account</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Operators List Table */}
      <div className="bg-white dark:bg-[#111B21] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
            Registered Staff & Administrators ({operators.length})
          </h2>
          <button onClick={fetchOperators} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Mobile View: Operator Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/5">
          {operators.map(op => (
            <div key={op._id} className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{op.name}</div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ID: {op.operatorId} • @{op.username}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                  op.role === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                    : 'bg-[#00A884]/15 text-[#00A884]'
                }`}>
                  {op.role}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-white/5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  op.isActive
                    ? 'bg-[#00A884]/15 text-[#00A884] border border-[#00A884]/30'
                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                }`}>
                  {op.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                </span>
                <button
                  onClick={() => handleToggleStatus(op)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition ${
                    op.isActive
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30'
                      : 'text-[#00A884] hover:bg-[#00A884]/10 border border-[#00A884]/30'
                  }`}
                >
                  {op.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/10 font-mono">
                <th className="py-3 px-4">Operator ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {operators.map(op => (
                <tr key={op._id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {op.operatorId}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {op.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {op.username}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      op.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                        : 'bg-[#00A884]/15 text-[#00A884]'
                    }`}>
                      {op.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {op.lastLoginAt ? formatDateTime(op.lastLoginAt) : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      op.isActive
                        ? 'bg-[#00A884]/15 text-[#00A884] border border-[#00A884]/30'
                        : 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                    }`}>
                      {op.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(op)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                        op.isActive
                          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30'
                          : 'text-[#00A884] hover:bg-[#00A884]/10 border border-[#00A884]/30'
                      }`}
                    >
                      {op.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Operator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#111B21] rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
            <h3 className="font-black text-lg text-slate-900 dark:text-white font-outfit">
              Create New Operator Account
            </h3>

            <form onSubmit={handleCreateOperator} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
                    Operator ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="OP-003"
                    value={formOperatorId}
                    onChange={(e) => setFormOperatorId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="operator3"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase())}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Patel"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                >
                  <option value="operator" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Parking Operator (Booth Access)</option>
                  <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 font-mono">
                    4-Digit MPIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="1122"
                    value={formMpin}
                    onChange={(e) => setFormMpin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-mono tracking-widest text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#00A884] hover:bg-[#008F6F] active:scale-[0.99] rounded-xl shadow-md"
                >
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
