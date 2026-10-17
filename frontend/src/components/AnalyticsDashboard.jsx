import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Award,
  Users
} from 'lucide-react';

export default function AnalyticsDashboard({ metrics }) {
  if (!metrics) return null;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>ReturnGuard Executive Intelligence & ROI Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
          Real-time KPIs measuring autonomous resolution throughput, anti-fraud savings, and decision latency.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Automation Rate
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="var(--emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
            {metrics.automation_rate_pct}%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--emerald)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <TrendingUp size={13} />
            Autonomous resolution without human touch
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Fraud Dollars Prevented
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="var(--rose)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
            ${metrics.fraud_dollars_prevented.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#FDA4AF', marginTop: '0.35rem' }}>
            Wardrobing, expired & empty box claims stopped
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Total Legitimate Refunds
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="var(--cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
            ${metrics.total_refunded_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--cyan)', marginTop: '0.35rem' }}>
            Disbursed instantly via payment gateway
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Average Decision Latency
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} color="var(--indigo)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
            {metrics.average_latency_ms} ms
          </div>
          <div style={{ fontSize: '0.76rem', color: '#A5B4FC', marginTop: '0.35rem' }}>
            Real-time multi-step ReAct loop
          </div>
        </div>
      </div>

      {/* Operational Breakdown Visual Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Outcome Breakdown Bar */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--cyan)" />
            Decision Distribution ({metrics.total_requests_processed} Total Requests)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>Automated Approvals & RMAs</span>
                <strong>{metrics.automated_resolutions_count} ({Math.round((metrics.automated_resolutions_count / metrics.total_requests_processed) * 100)}%)</strong>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(metrics.automated_resolutions_count / metrics.total_requests_processed) * 100}%`, background: 'var(--emerald)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Tier-2 Human Escalations</span>
                <strong>{metrics.escalations_count} ({Math.round((metrics.escalations_count / metrics.total_requests_processed) * 100)}%)</strong>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(metrics.escalations_count / metrics.total_requests_processed) * 100}%`, background: 'var(--amber)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--rose)', fontWeight: 600 }}>Policy Rejections & Fraud Denials</span>
                <strong>{metrics.policy_rejections_count} ({Math.round((metrics.policy_rejections_count / metrics.total_requests_processed) * 100)}%)</strong>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(metrics.policy_rejections_count / metrics.total_requests_processed) * 100}%`, background: 'var(--rose)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Anti-Fraud Defense Matrix */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--emerald)" />
            Active Anti-Abuse Defenses
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.025)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <span>👗 Wardrobing Heuristic (Occasion wear returned post-event)</span>
              <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>ACTIVE</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.025)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <span>📦 Empty Box / Missing Goods Multi-Claim Detector</span>
              <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>ACTIVE</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.025)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <span>💰 Autonomous Refund Hard Ceiling ($500.00 Max Cap)</span>
              <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>ENFORCED</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.025)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <span>🧴 Hygiene / Personal Care Tamper Barrier</span>
              <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
