import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Package, 
  Printer, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle,
  Receipt,
  Ticket,
  ShieldAlert,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  X,
  ScanEye,
  CheckCircle2
} from 'lucide-react';
import ReactTraceViewer from './ReactTraceViewer';
import { sendChatMessage } from '../api';

const SAMPLE_PHOTOS = {
  cracked_screen: {
    label: "📺 Cracked TV Display",
    url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=80"
  },
  opened_cosmetic: {
    label: "🧴 Unsealed Cream Foil",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80"
  },
  torn_garment: {
    label: "👗 Severed Security Tag",
    url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&auto=format&fit=crop&q=80"
  }
};

const SCENARIOS = [
  {
    id: 'airpods',
    title: '⚡ AirPods Pro 2 (Instant Refund)',
    orderId: 'ORD-7821',
    message: 'I want to return my AirPods Pro because the left earbud keeps disconnecting.',
    category: 'Auto-Clear',
    image: null
  },
  {
    id: 'tv',
    title: '📸 65" OLED TV (Photo-Verified HITL)',
    orderId: 'ORD-5102',
    message: 'The freight delivery just arrived and the TV screen has a huge crack down the middle. Photo attached.',
    category: 'Multimodal Escalation',
    image: SAMPLE_PHOTOS.cracked_screen.url
  },
  {
    id: 'dress',
    title: '🛑 Silk Gown 42-Days Late (Denial)',
    orderId: 'ORD-9430',
    message: 'I wore this evening gown to a charity gala last month and now need to return it.',
    category: 'Wardrobing Prevention',
    image: SAMPLE_PHOTOS.torn_garment.url
  },
  {
    id: 'cream',
    title: '🧴 Opened Face Cream (Store Credit)',
    orderId: 'ORD-3318',
    message: 'I opened the moisturizer and tried a little, but it caused mild redness.',
    category: 'Hygiene Safe-Concession',
    image: SAMPLE_PHOTOS.opened_cosmetic.url
  },
  {
    id: 'shoes',
    title: '👟 Nike Pegasus (Size Exchange)',
    orderId: 'ORD-6241',
    message: 'You sent size 10 instead of size 11. I need an exchange.',
    category: 'Merchant Error',
    image: null
  },
  {
    id: 'jewelry',
    title: '💎 Diamond Pendant (Empty Box Claim)',
    orderId: 'ORD-8852',
    message: 'The package arrived yesterday but the jewelry box inside was completely empty.',
    category: 'Fraud Risk Flag',
    image: null
  }
];

export default function ChatConcierge({ orders, onEscalationCreated }) {
  const [selectedOrderId, setSelectedOrderId] = useState('ORD-7821');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: "👋 Welcome to **ReturnGuard**! I am your autonomous returns & refunds agent.\n\nI verify order states against real-time merchant policies, analyze visual defect photos with Multimodal Vision AI, calculate fraud risks, and automatically authorize refunds or route exceptions to our specialist desk.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTrace, setActiveTrace] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (msgText, orderIdOverride = null, imageOverride = undefined) => {
    const textToSend = msgText || inputMessage;
    const imgToSend = imageOverride !== undefined ? imageOverride : attachedImage;
    if (!textToSend.trim() || isProcessing) return;

    const currentOrderId = orderIdOverride || selectedOrderId;

    // Append User Message
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      orderId: currentOrderId,
      imageData: imgToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setAttachedImage(null);
    setIsProcessing(true);

    try {
      const response = await sendChatMessage(textToSend, currentOrderId, null, imgToSend);

      // Append Agent Response
      const agentMsg = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: response.reply,
        trace: response.trace,
        rma_label: response.rma_label,
        refund_receipt: response.refund_receipt,
        escalation_ticket: response.escalation_ticket,
        photo_verification: response.trace?.photo_verification,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);
      setActiveTrace(response.trace);

      if (response.escalation_ticket && onEscalationCreated) {
        onEscalationCreated(response.escalation_ticket);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: `⚠️ **System Exception**: Failed to process return request. ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadScenario = (scenario) => {
    setSelectedOrderId(scenario.orderId);
    setInputMessage(scenario.message);
    setAttachedImage(scenario.image || null);
    handleSendMessage(scenario.message, scenario.orderId, scenario.image || null);
  };

  const printLabel = (rmaCode) => {
    window.print();
  };

  return (
    <div>
      {/* Scenario Presets Bar */}
      <div className="scenarios-strip">
        <span className="scenarios-title">
          <Sparkles size={14} color="var(--emerald)" />
          Test Scenarios:
        </span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            id={`scenario-${s.id}`}
            className={`scenario-chip ${selectedOrderId === s.orderId ? 'active' : ''}`}
            onClick={() => loadScenario(s)}
            disabled={isProcessing}
          >
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Main Split Grid: Chat on Left, ReAct Inspector on Right */}
      <div className="workspace-grid">
        {/* Chat Pane */}
        <div className="glass-panel chat-pane">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="avatar agent-avatar" style={{ width: '28px', height: '28px' }}>
                <Bot size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', margin: 0 }}>ReturnGuard Concierge</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  Autonomous ReAct + Vision Proof Verification
                </span>
              </div>
            </div>

            {/* Active Order Selector */}
            <div className="order-selector-wrap">
              <Package size={14} color="var(--text-muted)" />
              <select
                id="order-select"
                className="order-select-dropdown"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                disabled={isProcessing}
              >
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    {ord.id} — {ord.items[0]?.name || 'Item'} (${ord.total_amount.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="chat-messages">
            {messages.map((m) => (
              <div key={m.id} className={`message-row ${m.sender}`}>
                <div className={`avatar ${m.sender === 'user' ? 'user-avatar' : 'agent-avatar'}`}>
                  {m.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>

                <div style={{ maxWidth: '85%' }}>
                  <div className="message-bubble">
                    {/* User Attached Photo Thumbnail */}
                    {m.imageData && (
                      <div style={{ marginBottom: '0.65rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#CBD5E1', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Camera size={12} /> Customer Photographic Evidence:
                        </div>
                        <img 
                          src={m.imageData} 
                          alt="Customer Defect Evidence" 
                          style={{ maxWidth: '240px', maxHeight: '160px', borderRadius: '8px', border: '1px solid var(--border-light)', objectFit: 'cover' }} 
                        />
                      </div>
                    )}

                    <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>

                    {/* AI Multimodal Vision Defect Inspection Card */}
                    {m.photo_verification && m.photo_verification.is_verified && (
                      <div style={{ marginTop: '0.85rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyan)', fontWeight: 700, fontSize: '0.82rem' }}>
                            <ScanEye size={16} />
                            AI Computer Vision Inspection
                          </div>
                          <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.2)', color: '#A5F3FC', padding: '1px 7px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            {Math.round(m.photo_verification.confidence * 100)}% CONFIDENCE
                          </span>

                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '0.35rem' }}>
                          Classified Defect: <code style={{ color: 'var(--cyan)' }}>{m.photo_verification.defect_detected}</code>
                        </div>

                        <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.74rem', color: '#94A3B8' }}>
                          {m.photo_verification.visual_indicators.map((ind, i) => (
                            <li key={i}>{ind}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Embedded RMA Printable Return Label */}
                    {m.rma_label && (
                      <div className="rma-shipping-label">
                        <div className="label-top">
                          <div>
                            <div className="carrier-logo">{m.rma_label.carrier.toUpperCase()}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                              AUTHORIZED PREPAID RETURN SERVICE
                            </div>
                          </div>
                          <div className="rma-tag">
                            {m.rma_label.rma_code}
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div>
                            <strong>SHIP TO:</strong> ReturnGuard Logistics Center<br />
                            Dock 4B, 100 Fulfillment Way, KY 40201
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong>DROP-OFF:</strong><br />
                            {m.rma_label.dropoff_location}
                          </div>
                        </div>

                        {/* Simulated Barcode */}
                        <div className="barcode-svg-sim">
                          <div className="barcode-lines"></div>
                          {m.rma_label.tracking_number}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            Expires: {m.rma_label.expires_at}
                          </span>
                          <button 
                            id="btn-print-rma"
                            onClick={() => printLabel(m.rma_label.rma_code)}
                            className="action-btn approve"
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.74rem' }}
                          >
                            <Printer size={13} />
                            Print Shipping Label
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Embedded Refund Receipt */}
                    {m.refund_receipt && (
                      <div className="refund-receipt-card">
                        <div className="receipt-title">
                          <Receipt size={16} />
                          Automated Refund Issued — {m.refund_receipt.refund_id}
                        </div>
                        <div className="receipt-grid">
                          <div>
                            <span style={{ color: 'var(--text-dim)' }}>Net Refunded:</span><br />
                            <strong style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>
                              ${m.refund_receipt.net_refunded.toFixed(2)}
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-dim)' }}>Method:</span><br />
                            <span style={{ color: '#E2E8F0' }}>{m.refund_receipt.payment_method}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-dim)' }}>Restocking Fee:</span><br />
                            <span style={{ color: '#E2E8F0' }}>${m.refund_receipt.restocking_fee_deducted.toFixed(2)}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-dim)' }}>Gateway Ref:</span><br />
                            <code style={{ fontSize: '0.7rem', color: 'var(--cyan)' }}>{m.refund_receipt.transaction_ref}</code>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Embedded Escalation Ticket Status */}
                    {m.escalation_ticket && (
                      <div style={{ marginTop: '0.85rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--amber)', fontWeight: 700, fontSize: '0.85rem' }}>
                            <Ticket size={16} />
                            Escalated to Tier-2 Review: #{m.escalation_ticket.ticket_id}
                          </div>
                          <span style={{ fontSize: '0.7rem', background: 'var(--amber)', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            PENDING REVIEW
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: 0 }}>
                          High priority ticket created with risk score {m.escalation_ticket.risk_score}/100. Check the "HITL Review" tab to see operator actions.
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="message-row agent">
                <div className="avatar agent-avatar">
                  <Bot size={18} />
                </div>
                <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)' }}>
                  <Sparkles size={16} className="pulse-dot" />
                  <span>ReturnGuard is reasoning (Executing Vision Inspection & ReAct loop)...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached Image Preview Strip */}
          {attachedImage && (
            <div style={{ padding: '0.5rem 1.4rem', background: 'rgba(0, 0, 0, 0.4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img 
                src={attachedImage} 
                alt="Upload preview" 
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--emerald)' }} 
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} /> Photo proof attached for Vision AI analysis
              </span>
              <button 
                onClick={() => setAttachedImage(null)}
                style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Quick Photo Evidence Injector Bar */}
          <div style={{ padding: '0.35rem 1.4rem', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Camera size={12} /> Sample Photo Proof:
            </span>
            {Object.entries(SAMPLE_PHOTOS).map(([k, p]) => (
              <button
                key={k}
                type="button"
                className="action-btn"
                style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#CBD5E1', border: '1px solid var(--border-subtle)', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                onClick={() => setAttachedImage(p.url)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form 
            className="chat-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            {/* Hidden file input */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />

            <button
              type="button"
              id="btn-upload-photo"
              className="tab-btn"
              style={{ padding: '0.65rem 0.85rem', border: '1px solid var(--border-subtle)' }}
              onClick={() => fileInputRef.current?.click()}
              title="Upload damage photo from device"
            >
              <Camera size={16} color={attachedImage ? 'var(--emerald)' : 'var(--text-muted)'} />
            </button>

            <input 
              id="chat-user-input"
              className="chat-input"
              type="text"
              placeholder={`Ask to return or refund items from ${selectedOrderId}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isProcessing}
            />
            <button 
              id="chat-send-btn"
              type="submit" 
              className="send-btn"
              disabled={isProcessing || !inputMessage.trim()}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* ReAct Trace Pane on the Right */}
        <ReactTraceViewer trace={activeTrace} />
      </div>
    </div>
  );
}
