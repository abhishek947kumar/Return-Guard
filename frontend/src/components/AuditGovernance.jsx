import React, { useState } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Brain,
  CheckCircle2
} from 'lucide-react';

export default function AuditGovernance({ auditLogs }) {
  const [filterType, setFilterType] = useState('ALL');
  const [expandedTraceId, setExpandedTraceId] = useState(null);

  const filteredLogs = auditLogs.filter(log => {
    if (filterType === 'ALL') return true;
    return log.final_resolution === filterType;
  });

  const getResolutionBadge = (res) => {
    switch (res) {
      case 'AUTO_REFUND':
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>AUTO_REFUND</span>;
      case 'POLICY_REJECTION':
        return <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--rose)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>POLICY_REJECTION</span>;
      case 'HUMAN_ESCALATION':
        return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>HUMAN_ESCALATION</span>;
      case 'STORE_CREDIT_OFFER':
        return <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>STORE_CREDIT</span>;
      default:
        return <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>{res || 'PENDING'}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>AI Governance, Guardrails & Compliance Ledger</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Immutable audit record of every ReAct reasoning cycle, policy citation, and safety guardrail check.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'AUTO_REFUND', 'HUMAN_ESCALATION', 'POLICY_REJECTION', 'STORE_CREDIT_OFFER'].map(f => (
            <button
              key={f}
              className={`scenario-chip ${filterType === f ? 'active' : ''}`}
              onClick={() => setFilterType(f)}
              style={{ fontSize: '0.74rem' }}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Governance Summary Grid */}
      <div className="governance-strip" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="gov-card">
          <div className="gov-label">Audited Decisions</div>
          <div className="gov-value" style={{ color: '#FFFFFF' }}>
            {auditLogs.length} Records
          </div>
        </div>

        <div className="gov-card">
          <div className="gov-label">Policy Guardrail Compliance</div>
          <div className="gov-value safe">
            <ShieldCheck size={16} /> 100% Enforced
          </div>
        </div>

        <div className="gov-card">
          <div className="gov-label">Financial Safety Cap</div>
          <div className="gov-value" style={{ color: 'var(--cyan)' }}>
            $500.00 Limit
          </div>
        </div>

        <div className="gov-card">
          <div className="gov-label">Regulatory Audit Status</div>
          <div className="gov-value safe">
            <CheckCircle2 size={16} /> Verified
          </div>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileCheck2 size={36} color="var(--cyan)" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
          <h4 style={{ color: '#FFFFFF', marginBottom: '0.25rem' }}>No Audit Traces Yet</h4>
          <p style={{ fontSize: '0.84rem' }}>Interact with the ReAct concierge agent to generate auditable decision trails.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredLogs.map((log, index) => {
            const isExpanded = expandedTraceId === log.session_id;
            return (
              <div key={log.session_id || index} className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      SID: {log.session_id}
                    </span>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      Order: {log.order_id || 'N/A'}
                    </span>
                    {getResolutionBadge(log.final_resolution)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                      Risk: <strong style={{ color: log.fraud_risk_score > 60 ? 'var(--rose)' : 'var(--emerald)' }}>{log.fraud_risk_score}/100</strong>
                    </span>
                    <span className="step-latency">
                      <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {log.total_duration_ms}ms
                    </span>
                    <button
                      onClick={() => setExpandedTraceId(isExpanded ? null : log.session_id)}
                      className="tab-btn"
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem', border: '1px solid var(--border-subtle)' }}
                    >
                      <span>{isExpanded ? 'Hide Trace' : 'Inspect Steps'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Policy Citations */}
                {log.policy_citations && log.policy_citations.length > 0 && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {log.policy_citations.map((c, i) => (
                      <span key={i} style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.05)', color: '#CBD5E1', padding: '1px 7px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expanded Steps View */}
                {isExpanded && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Brain size={13} /> ReAct Trajectory ({log.steps.length} cycles)
                    </div>
                    {log.steps.map((st) => (
                      <div key={st.step_number} style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.74rem' }}>
                          <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>Step {st.step_number} Thought</span>
                          {st.action && <span style={{ color: '#A5B4FC', fontFamily: 'var(--font-mono)' }}>Dispatched: {st.action}()</span>}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: 0, fontStyle: 'italic' }}>"{st.thought}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
