import React, { useState } from 'react';
import { 
  Brain, 
  Wrench, 
  Eye, 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Info,
  Sparkles
} from 'lucide-react';

export default function ReactTraceViewer({ trace }) {
  const [expandedSteps, setExpandedSteps] = useState({});

  if (!trace || !trace.steps || trace.steps.length === 0) {
    return (
      <div className="glass-panel trace-pane">
        <div className="trace-header">
          <div className="trace-title">
            <Brain size={18} color="var(--cyan)" />
            <span>ReAct Reasoning & Acting Inspector</span>
          </div>
          <span className="step-badge thought">Standby</span>
        </div>
        <div className="trace-body" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-dim)', padding: '3rem 1.5rem' }}>
          <Sparkles size={40} color="var(--cyan)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>Autonomous ReAct Engine Ready</h3>
          <p style={{ fontSize: '0.84rem', maxWidth: '340px' }}>
            Submit a return request or select a test scenario to inspect real-time Thoughts, Tool Dispatches, and Observations.
          </p>
        </div>
      </div>
    );
  }

  const toggleStep = (stepNum) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum]
    }));
  };

  const getRiskClass = (score) => {
    if (score >= 70) return 'danger';
    if (score >= 45) return 'warning';
    return 'safe';
  };

  return (
    <div className="glass-panel trace-pane">
      <div className="trace-header">
        <div className="trace-title">
          <Brain size={18} color="var(--cyan)" />
          <span>Autonomous ReAct Execution Trace</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="step-latency">
            <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
            {trace.total_duration_ms}ms
          </span>
          <span className="step-badge thought" style={{ background: 'rgba(6, 182, 212, 0.2)' }}>
            {trace.steps.length} ReAct Cycles
          </span>
        </div>
      </div>

      <div className="trace-body">
        {/* Governance & Anti-Fraud Telemetry Strip */}
        <div className="governance-strip">
          <div className="gov-card">
            <div className="gov-label">Confidence Score</div>
            <div className="gov-value safe">
              <CheckCircle2 size={16} />
              {Math.round(trace.confidence_score * 100)}%
            </div>
          </div>

          <div className="gov-card">
            <div className="gov-label">Fraud Risk Score</div>
            <div className={`gov-value ${getRiskClass(trace.fraud_risk_score)}`}>
              <ShieldCheck size={16} />
              {trace.fraud_risk_score}/100
            </div>
          </div>

          <div className="gov-card">
            <div className="gov-label">Safety Guardrails</div>
            <div className={`gov-value ${trace.guardrails_passed ? 'safe' : 'danger'}`}>
              {trace.guardrails_passed ? <CheckCircle2 size={16} /> : <AlertOctagon size={16} />}
              {trace.guardrails_passed ? 'Enforced & Clean' : 'Violations Caught'}
            </div>
          </div>
        </div>

        {/* Policy Citations Pill Bar */}
        {trace.policy_citations && trace.policy_citations.length > 0 && (
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.7rem', color: '#A5B4FC', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={13} />
              Governed Merchant Policy Citations
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {trace.policy_citations.map((cite, idx) => (
                <span key={idx} style={{ fontSize: '0.74rem', background: 'rgba(99, 102, 241, 0.2)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                  {cite}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ReAct Step-by-Step Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {trace.steps.map((step) => {
            const isExpanded = expandedSteps[step.step_number] !== false; // default open
            return (
              <div key={step.step_number} className="step-card">
                <div className="step-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      #{step.step_number}
                    </span>
                    <span className="step-badge thought">
                      <Brain size={12} /> Thought
                    </span>
                    {step.action && (
                      <span className="step-badge action">
                        <Wrench size={12} /> {step.action}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {step.duration_ms !== null && step.duration_ms !== undefined && (
                      <span className="step-latency">{step.duration_ms}ms</span>
                    )}
                    <button 
                      onClick={() => toggleStep(step.step_number)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Thought Reasoning Monologue */}
                <div className="thought-content">
                  "{step.thought}"
                </div>

                {/* Collapsible Action & Observation */}
                {isExpanded && (
                  <div>
                    {step.action && (
                      <div className="action-row">
                        <span style={{ color: 'var(--text-dim)' }}>DISPATCH:</span>
                        <strong style={{ color: '#E0E7FF' }}>{step.action}</strong>
                        <span style={{ color: 'var(--text-dim)', marginLeft: 'auto', fontSize: '0.7rem' }}>
                          INPUT: {JSON.stringify(step.action_input || {})}
                        </span>
                      </div>
                    )}

                    {step.observation && (
                      <div className="obs-panel">
                        <div style={{ color: 'var(--emerald)', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Eye size={12} /> OBSERVATION PAYLOAD
                        </div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.72rem' }}>
                          {typeof step.observation === 'object' ? JSON.stringify(step.observation, null, 2) : step.observation}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
