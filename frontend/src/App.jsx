import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatConcierge from './components/ChatConcierge';
import EscalationQueue from './components/EscalationQueue';
import OrdersExplorer from './components/OrdersExplorer';
import PolicyMatrix from './components/PolicyMatrix';
import AuditGovernance from './components/AuditGovernance';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import FloatingWidget from './components/FloatingWidget';
import { 
  getOrders, 
  getPolicies, 
  getEscalations, 
  getAnalytics, 
  getAuditLogs, 
  resetSystemStore 
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [orders, setOrders] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = async () => {
    try {
      const [ordRes, polRes, escRes, metRes, audRes] = await Promise.all([
        getOrders(),
        getPolicies(),
        getEscalations(),
        getAnalytics(),
        getAuditLogs()
      ]);
      setOrders(ordRes);
      setPolicies(polRes);
      setEscalations(escRes);
      setMetrics(metRes);
      setAuditLogs(audRes);
    } catch (err) {
      console.error("Error loading ReturnGuard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResetData = async () => {
    try {
      await resetSystemStore();
      await loadAllData();
    } catch (err) {
      alert(`Error resetting demo: ${err.message}`);
    }
  };

  const handleSelectOrderForReturn = (orderId) => {
    setActiveTab('chat');
  };

  const handleTicketResolved = async () => {
    await loadAllData();
  };

  const handleEscalationCreated = async () => {
    await loadAllData();
  };

  const pendingEscalationsCount = escalations.filter(e => e.status === 'PENDING').length;

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-darkest)', color: 'var(--cyan)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="status-indicator online" style={{ marginBottom: '1rem' }}>
            <span className="dot"></span>
            <span>Initializing ReturnGuard Autonomous Agent Engine...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingEscalationsCount={pendingEscalationsCount}
        onResetData={handleResetData}
      />

      <main className="app-container">
        {activeTab === 'chat' && (
          <ChatConcierge 
            orders={orders} 
            onEscalationCreated={handleEscalationCreated} 
          />
        )}

        {activeTab === 'escalations' && (
          <EscalationQueue 
            escalations={escalations} 
            onTicketResolved={handleTicketResolved} 
          />
        )}

        {activeTab === 'orders' && (
          <OrdersExplorer 
            orders={orders} 
            onSelectOrderForReturn={handleSelectOrderForReturn} 
          />
        )}

        {activeTab === 'policies' && (
          <PolicyMatrix 
            policies={policies} 
            onPolicyUpdated={loadAllData} 
          />
        )}

        {activeTab === 'governance' && (
          <AuditGovernance 
            auditLogs={auditLogs} 
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            metrics={metrics} 
          />
        )}
      </main>

      {/* Embeddable Floating Customer Returns Widget */}
      <FloatingWidget orders={orders} />
    </div>
  );
}

