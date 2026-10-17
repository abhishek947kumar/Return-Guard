import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Check, 
  X, 
  Edit3, 
  Save, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { updatePolicy } from '../api';

export default function PolicyMatrix({ policies, onPolicyUpdated }) {
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const startEdit = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      return_window_days: policy.return_window_days,
      allows_opened: policy.allows_opened,
      requires_photos: policy.requires_photos,
      restocking_fee_pct: policy.restocking_fee_pct,
      high_value_escalation_threshold: policy.high_value_escalation_threshold,
      description: policy.description
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingPolicy) return;
    setIsSaving(true);
    try {
      const updated = await updatePolicy(editingPolicy.category, formData);
      if (onPolicyUpdated) onPolicyUpdated(updated);
      setEditingPolicy(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert(`Failed to save policy: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2>Dynamic Merchant Return Policy Engine</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Configure rules, category return windows, restocking fees, and automated escalation thresholds used by the ReAct agent.
          </p>
        </div>
        {saveSuccess && (
          <div className="status-indicator online" style={{ color: 'var(--emerald)', borderColor: 'var(--emerald)' }}>
            <Check size={14} />
            <span>Policy Updated Live!</span>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Policy Clause</th>
              <th>Window (Days)</th>
              <th>Opened Allowed?</th>
              <th>Requires Photos?</th>
              <th>Restocking Fee</th>
              <th>Escalation Threshold</th>
              <th>Rules Summary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.category}>
                <td style={{ fontWeight: 700, color: '#FFFFFF' }}>{p.category}</td>
                <td>
                  <code style={{ fontSize: '0.74rem', background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC', padding: '2px 6px', borderRadius: '4px' }}>
                    {p.policy_code}
                  </code>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                  {p.return_window_days} days
                </td>
                <td>
                  {p.allows_opened ? (
                    <span style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={14} /> Yes
                    </span>
                  ) : (
                    <span style={{ color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <X size={14} /> No (Sealed)
                    </span>
                  )}
                </td>
                <td>
                  {p.requires_photos ? (
                    <span style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={14} /> Mandatory
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)' }}>Optional</span>
                  )}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {p.restocking_fee_pct > 0 ? `${p.restocking_fee_pct}%` : 'Free (0%)'}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#CBD5E1' }}>
                  ${p.high_value_escalation_threshold.toFixed(2)}
                </td>
                <td style={{ fontSize: '0.78rem', color: '#94A3B8', maxWidth: '280px' }}>
                  {p.description}
                </td>
                <td>
                  <button 
                    id={`btn-edit-policy-${p.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="action-btn"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#FFFFFF', border: '1px solid var(--border-subtle)' }}
                    onClick={() => startEdit(p)}
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingPolicy && (
        <div className="modal-overlay" onClick={() => setEditingPolicy(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} color="var(--cyan)" />
                <h3 style={{ margin: 0 }}>Configure Policy: {editingPolicy.category}</h3>
              </div>
              <button 
                onClick={() => setEditingPolicy(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Return Window (Days)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="180"
                    value={formData.return_window_days}
                    onChange={(e) => setFormData({ ...formData, return_window_days: parseInt(e.target.value) || 1 })}
                    className="chat-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Restocking Fee (%)
                  </label>
                  <input 
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={formData.restocking_fee_pct}
                    onChange={(e) => setFormData({ ...formData, restocking_fee_pct: parseFloat(e.target.value) || 0 })}
                    className="chat-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Escalation Threshold ($)
                  </label>
                  <input 
                    type="number"
                    min="50"
                    step="50"
                    value={formData.high_value_escalation_threshold}
                    onChange={(e) => setFormData({ ...formData, high_value_escalation_threshold: parseFloat(e.target.value) || 500 })}
                    className="chat-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={formData.allows_opened}
                      onChange={(e) => setFormData({ ...formData, allows_opened: e.target.checked })}
                    />
                    <span>Allows Opened Items</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={formData.requires_photos}
                      onChange={(e) => setFormData({ ...formData, requires_photos: e.target.checked })}
                    />
                    <span>Requires Transit Photos</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>
                  Policy Rationale / Public Clause
                </label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="chat-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="tab-btn" 
                  onClick={() => setEditingPolicy(null)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  id="btn-save-policy"
                  type="submit" 
                  className="send-btn"
                  disabled={isSaving}
                >
                  <Save size={15} />
                  <span>{isSaving ? 'Updating...' : 'Save Policy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
