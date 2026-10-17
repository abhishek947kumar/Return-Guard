import React from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  AlertTriangle, 
  Package, 
  Sliders, 
  FileCheck2, 
  BarChart3, 
  RotateCcw,
  Cpu
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, pendingEscalationsCount, onResetData }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon-wrap">
          <ShieldCheck size={24} color="#FFFFFF" />
        </div>
        <div>
          <div className="brand-title">
            ReturnGuard
            <span className="brand-tag">Autonomous ReAct</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="tab-navigation">
        <button 
          id="nav-chat-btn"
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} />
          <span>Concierge & ReAct</span>
        </button>

        <button 
          id="nav-escalations-btn"
          className={`tab-btn ${activeTab === 'escalations' ? 'active' : ''}`}
          onClick={() => setActiveTab('escalations')}
        >
          <AlertTriangle size={16} />
          <span>HITL Review</span>
          {pendingEscalationsCount > 0 && (
            <span className="badge-count">{pendingEscalationsCount}</span>
          )}
        </button>

        <button 
          id="nav-orders-btn"
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={16} />
          <span>Orders Catalog</span>
        </button>

        <button 
          id="nav-policies-btn"
          className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          <Sliders size={16} />
          <span>Policy Engine</span>
        </button>

        <button 
          id="nav-governance-btn"
          className={`tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          <FileCheck2 size={16} />
          <span>AI Governance</span>
        </button>

        <button 
          id="nav-analytics-btn"
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} />
          <span>Analytics</span>
        </button>
      </nav>

      {/* Status & Reset */}
      <div className="nav-status-group">
        <div className="status-indicator online">
          <span className="dot"></span>
          <span>ReAct Engine: Active</span>
        </div>

        <button 
          id="btn-reset-data"
          className="tab-btn" 
          onClick={onResetData}
          title="Reset sample orders, policies, and test cases"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
}
