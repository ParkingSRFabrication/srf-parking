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
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">
            Booth Operator Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create operator accounts, configure MPIN credentials, and manage POS terminal access
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#142B4A] hover:bg-[#2457A7] text-white rounded-xl text-xs font-bold transition shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Operator Account</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Operators List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Registered Staff & Administrators ({operators.length})
          </h2>
          <button onClick={fetchOperators} className="p-1 text-slate-400 hover:text-slate-600">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Mobile View: Operator Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {operators.map(op => (
            <div key={op._id} className="p-3.5 hover:bg-slate-50 transition space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{op.name}</div>
                  <div className="text-[11px] font-mono text-slate-500">ID: {op.operatorId} • @{op.username}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                  op.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {op.role}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  op.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {op.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                </span>
                <button
                  onClick={() => handleToggleStatus(op)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition ${
                    op.isActive
                      ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                      : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
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
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Operator ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {operators.map(op => (
                <tr key={op._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#142B4A]">
                    {op.operatorId}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {op.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {op.username}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      op.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {op.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {op.lastLoginAt ? formatDateTime(op.lastLoginAt) : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      op.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {op.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(op)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                        op.isActive
                          ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                          : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <h3 className="font-black text-lg text-[#142B4A]">
              Create New Operator Account
            </h3>

            <form onSubmit={handleCreateOperator} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Operator ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="OP-003"
                    value={formOperatorId}
                    onChange={(e) => setFormOperatorId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="operator3"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase())}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Patel"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="operator">Parking Operator (Booth Access)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    4-Digit MPIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="1122"
                    value={formMpin}
                    onChange={(e) => setFormMpin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-mono tracking-widest text-center bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#142B4A] hover:bg-[#2457A7] rounded-xl"
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
