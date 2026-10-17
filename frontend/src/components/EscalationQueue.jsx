import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Camera, 
  Gift, 
  ShieldAlert, 
  User, 
  DollarSign, 
  Clock, 
  FileText,
  Check
} from 'lucide-react';
import { reviewEscalation } from '../api';

export default function EscalationQueue({ escalations, onTicketResolved }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleAction = async (ticketId, actionType) => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const notes = reviewerNotes.trim() || `Operator dispatched action: ${actionType}`;
      const updated = await reviewEscalation(ticketId, actionType, notes);
      if (onTicketResolved) {
        onTicketResolved(updated);
      }
      setSelectedTicket(null);
      setReviewerNotes('');
      setStatusMessage({ type: 'success', text: `Ticket #${ticketId} resolved with action ${actionType}!` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Failed to resolve ticket: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--emerald)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>APPROVED</span>;
      case 'REJECTED':
        return <span style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--rose)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>REJECTED</span>;
      case 'PHOTO_REQUESTED':
        return <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--amber)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>PHOTOS REQUESTED</span>;
      default:
        return <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--amber)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>PENDING REVIEW</span>;
    }
  };

  const pendingTickets = escalations.filter(t => t.status === 'PENDING');
  const historyTickets = escalations.filter(t => t.status !== 'PENDING');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2>Human-in-the-Loop (HITL) Escalation Desk</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Operations & Fraud Review console for high-value orders, suspicious return patterns, and customer policy disputes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="status-indicator" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: 'var(--amber)' }}>
            <AlertTriangle size={14} />
            <span>{pendingTickets.length} Pending Review</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div style={{ 
          padding: '0.85rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1rem',
          background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: `1px solid ${statusMessage.type === 'success' ? 'var(--emerald)' : 'var(--rose)'}`,
          color: '#FFFFFF',
          fontSize: '0.85rem'
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Pending Tickets Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#CBD5E1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={16} color="var(--amber)" />
          Active Exception Queue ({pendingTickets.length})
        </h3>

        {pendingTickets.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={36} color="var(--emerald)" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
            <h4 style={{ color: '#FFFFFF', marginBottom: '0.25rem' }}>All Clear! No Pending Escalations</h4>
            <p style={{ fontSize: '0.84rem' }}>ReturnGuard's autonomous ReAct agent has cleared all standard return requests automatically.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingTickets.map((ticket) => (
              <div 
                key={ticket.ticket_id} 
                className={`ticket-card ${ticket.risk_score >= 70 ? 'high-risk' : 'medium-risk'}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                        #{ticket.ticket_id}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Order: <strong>{ticket.order_id}</strong>
                      </span>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#E2E8F0', fontWeight: 600 }}>
                      {ticket.item_name} — ${ticket.amount.toFixed(2)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Fraud Risk</div>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 800, 
                      color: ticket.risk_score >= 70 ? 'var(--rose)' : 'var(--amber)',
                      fontFamily: 'var(--font-mono)' 
                    }}>
                      {ticket.risk_score}/100
                    </div>
                  </div>
                </div>

                {/* Risk Flags List */}
                {ticket.flags && ticket.flags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.75rem 0' }}>
                    {ticket.flags.map((flag, idx) => (
                      <span key={idx} style={{ 
                        fontSize: '0.72rem', 
                        background: 'rgba(244, 63, 94, 0.12)', 
                        border: '1px solid rgba(244, 63, 94, 0.25)', 
                        color: '#FDA4AF', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <ShieldAlert size={11} /> {flag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Agent Dossier */}
                <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.82rem', color: '#CBD5E1', margin: '0.75rem 0' }}>
                  <div style={{ color: 'var(--cyan)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileText size={12} /> AI AGENT AUDIT DOSSIER
                  </div>
                  {ticket.agent_dossier}
                </div>

                {/* Attached Photographic Evidence & Vision AI Inspection */}
                {ticket.photo_evidence_url && (
                  <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', margin: '0.75rem 0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <img 
                      src={ticket.photo_evidence_url} 
                      alt="Customer Defect Evidence" 
                      style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-light)', flexShrink: 0 }} 
                    />
                    <div style={{ flex: 1, fontSize: '0.78rem' }}>
                      <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: '0.2rem' }}>
                        📸 Multimodal Vision Analysis: {ticket.photo_verification?.defect_detected || 'DEFECT_CONFIRMED'}
                      </div>
                      <div style={{ color: '#CBD5E1', marginBottom: '0.35rem' }}>
                        Confidence: <strong style={{ color: 'var(--emerald)' }}>{ticket.photo_verification?.confidence ? Math.round(ticket.photo_verification.confidence * 100) : 92}%</strong>
                      </div>
                      {ticket.photo_verification?.visual_indicators && (
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                          Indicators: {ticket.photo_verification.visual_indicators.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* Operator Decision Actions */}
                <div className="ticket-actions">
                  <button 
                    id={`btn-approve-${ticket.ticket_id}`}
                    className="action-btn approve"
                    onClick={() => handleAction(ticket.ticket_id, 'APPROVE_REFUND')}
                    disabled={isSubmitting}
                  >
                    <CheckCircle size={14} />
                    Approve Full Refund
                  </button>

                  <button 
                    id={`btn-reject-${ticket.ticket_id}`}
                    className="action-btn reject"
                    onClick={() => handleAction(ticket.ticket_id, 'REJECT_REQUEST')}
                    disabled={isSubmitting}
                  >
                    <XCircle size={14} />
                    Reject Claim
                  </button>

                  <button 
                    id={`btn-photo-${ticket.ticket_id}`}
                    className="action-btn evidence"
                    onClick={() => handleAction(ticket.ticket_id, 'REQUEST_PHOTO')}
                    disabled={isSubmitting}
                  >
                    <Camera size={14} />
                    Request Damage Photos
                  </button>

                  <button 
                    id={`btn-credit-${ticket.ticket_id}`}
                    className="action-btn"
                    style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                    onClick={() => handleAction(ticket.ticket_id, 'OFFER_STORE_CREDIT')}
                    disabled={isSubmitting}
                  >
                    <Gift size={14} />
                    Offer 50% Store Credit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Tickets Audit Trail */}
      {historyTickets.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            Resolved Tickets ({historyTickets.length})
          </h3>
          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Outcome</th>
                  <th>Reviewer</th>
                  <th>Resolved At</th>
                </tr>
              </thead>
              <tbody>
                {historyTickets.map((t) => (
                  <tr key={t.ticket_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{t.ticket_id}</td>
                    <td>{t.order_id}</td>
                    <td>{t.customer_name}</td>
                    <td>${t.amount.toFixed(2)}</td>
                    <td>{getStatusBadge(t.status)}</td>
                    <td>{t.resolved_by || 'Tier-2 Desk'}</td>
                    <td style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>{t.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
