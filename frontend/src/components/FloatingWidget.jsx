import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, ShieldCheck, Sparkles, Printer, Receipt } from 'lucide-react';
import { sendChatMessage } from '../api';

export default function FloatingWidget({ orders }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: "👋 Hi! Need to return an item? Enter your Order ID (e.g. `ORD-7821`) to get an instant refund or prepaid return label."
    }
  ]);
  const [input, setInput] = useState('');
  const [orderId, setOrderId] = useState('ORD-7821');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const res = await sendChatMessage(userText, orderId);
      setMessages(prev => [...prev, {
        sender: 'agent',
        text: res.reply,
        rma: res.rma_label,
        refund: res.refund_receipt
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'agent', text: "Error processing request. Please retry." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {!isOpen ? (
        <button
          id="btn-open-widget"
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #06B6D4)',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
            transition: 'transform 0.2s ease',
          }}
          title="Preview Embeddable Customer Returns Widget"
        >
          <MessageSquare size={26} />
        </button>
      ) : (
        <div
          style={{
            width: '380px',
            height: '520px',
            background: 'var(--bg-darker)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.1))',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} color="#000" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem' }}>ReturnGuard Assistant</h4>
                <span style={{ fontSize: '0.68rem', color: 'var(--emerald)' }}>● Instant Resolution Active</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Order Picker in Widget */}
          <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Order:</span>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="order-select-dropdown"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.74rem', width: '100%' }}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} ({o.items[0]?.name.slice(0, 20)}...)
                </option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '0.85rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.sender === 'user' ? 'linear-gradient(135deg, #4F46E5, #6366F1)' : 'rgba(15, 23, 42, 0.9)',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  border: m.sender === 'agent' ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                {m.rma && (
                  <div style={{ marginTop: '0.5rem', background: '#fff', color: '#000', padding: '0.5rem', borderRadius: '6px', fontSize: '0.72rem' }}>
                    <strong>RMA Code: {m.rma.rma_code}</strong> ({m.rma.carrier})<br />
                    Tracking: {m.rma.tracking_number}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--cyan)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} />
                <span>ReturnGuard is reasoning...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '0.65rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.4rem' }}>
            <input
              type="text"
              placeholder="Type return reason..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
            />
            <button type="submit" className="send-btn" style={{ padding: '0.5rem 0.85rem' }} disabled={isTyping || !input.trim()}>
              <Send size={13} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
