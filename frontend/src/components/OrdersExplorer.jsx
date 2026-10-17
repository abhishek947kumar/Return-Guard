import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight, 
  Tag, 
  CreditCard,
  Truck
} from 'lucide-react';

export default function OrdersExplorer({ orders, onSelectOrderForReturn }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items[0]?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      categoryFilter === 'ALL' || order.items[0]?.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REFUNDED':
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>REFUNDED</span>;
      case 'ESCALATED':
        return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>ESCALATED</span>;
      case 'RETURN_REQUESTED':
        return <span style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>RETURN AUTHORIZED</span>;
      default:
        return <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>DELIVERED</span>;
    }
  };

  const categories = ['ALL', 'Electronics', 'Fashion & Apparel', 'Beauty & Personal Care', 'Home & Appliances', 'Luxury & Jewelry', 'Footwear'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>E-Commerce Orders & Customer Profiles</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Simulated merchant database of fulfillment records, item categories, and customer risk profiles.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
            <input 
              type="text"
              placeholder="Search order ID, customer or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="chat-input"
              style={{ paddingLeft: '32px', paddingRight: '12px', fontSize: '0.82rem', width: '240px', height: '36px' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="order-select-dropdown"
            style={{ height: '36px' }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Purchased Item</th>
              <th>Category</th>
              <th>Total ($)</th>
              <th>Delivery Date</th>
              <th>Carrier</th>
              <th>Order State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const item = order.items[0];
              return (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#FFFFFF' }}>
                    {order.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {order.customer_id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#E2E8F0' }}>{item?.name}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      SKU: {item?.sku}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.74rem', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>
                      {item?.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {order.delivery_date}
                  </td>
                  <td style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                    {order.shipping_carrier}
                  </td>
                  <td>
                    {getStatusBadge(order.status)}
                  </td>
                  <td>
                    <button 
                      id={`btn-test-order-${order.id}`}
                      className="action-btn"
                      style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                      onClick={() => onSelectOrderForReturn(order.id)}
                      title="Pre-select this order in the live ReAct concierge chat"
                    >
                      <span>Simulate Return</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
