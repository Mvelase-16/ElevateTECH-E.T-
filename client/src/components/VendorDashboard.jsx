import React, { useState } from 'react';
import { 
  ChefHat, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  Search,
  Plus
} from 'lucide-react';

export default function VendorDashboard({ 
  orders = [], 
  menuItems = [], 
  onUpdateStatus, 
  onVerifyPickup, 
  onToggleStock, 
  onAddDish,
  onRefresh 
}) {
  // Main view tabs: 'to_prepare' (orders to prepare), 'processed' (processed & collected), 'menu' (stock)
  const [activeTab, setActiveTab] = useState('to_prepare');
  const [verifyPin, setVerifyPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  // Add Dish state
  const [newDish, setNewDish] = useState({
    category_slug: 'breakfast',
    name: '',
    description: '',
    price: '',
    image_url: ''
  });

  // Filter 1: Orders that need to be prepared alone (received, in_progress)
  const ordersToPrepare = orders.filter(o => ['received', 'in_progress'].includes(o.order_status));

  // Filter 2: Orders that have already been processed and collected individually (ready, completed)
  const processedAndCollectedOrders = orders.filter(o => ['ready', 'completed'].includes(o.order_status));

  // Sub-filter for processed tab: 'all_processed', 'ready_only', 'completed_only'
  const [processedFilter, setProcessedFilter] = useState('all');

  const filteredProcessedOrders = processedAndCollectedOrders.filter(o => {
    if (processedFilter === 'ready') return o.order_status === 'ready';
    if (processedFilter === 'completed') return o.order_status === 'completed';
    return true;
  });

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (!verifyPin.trim()) {
      setPinError('Please enter the student 4-digit Collection PIN.');
      return;
    }

    const cleanPin = verifyPin.trim();
    // Find matching order in ready or active orders
    const target = orders.find(o => o.pickup_pin === cleanPin);

    if (target) {
      if (target.order_status === 'completed') {
        setPinError(`Order #${target.order_number} has already been collected and handed over.`);
        return;
      }
      onVerifyPickup(target.id, target.pickup_pin);
      setPinSuccess(`✅ Verified! Order #${target.order_number} for ${target.customer_name} handed over.`);
      setVerifyPin('');
      setTimeout(() => setPinSuccess(''), 4000);
    } else {
      setPinError(`No order found matching PIN #${cleanPin}. Please verify student screen.`);
    }
  };

  const handleDishSubmit = (e) => {
    e.preventDefault();
    if (!newDish.name || !newDish.price) {
      alert('Please enter dish name and price');
      return;
    }
    onAddDish(newDish);
    setNewDish({ category_slug: 'breakfast', name: '', description: '', price: '', image_url: '' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <ChefHat size={22} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
              Cafeteria Kitchen Operations Portal
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0' }}>
            Manage food preparation queue, Counter 1 student handovers, and menu stock availability
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh Orders</span>
          </button>
        )}
      </div>

      {/* DISTINCT TABS NAVIGATION FOR STAFF */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: '#F3F4F6',
        padding: '6px',
        borderRadius: '14px',
        marginBottom: '26px'
      }}>
        {/* Tab 1: Orders to Prepare Alone */}
        <button
          type="button"
          onClick={() => setActiveTab('to_prepare')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: activeTab === 'to_prepare' ? '800' : '600',
            backgroundColor: activeTab === 'to_prepare' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'to_prepare' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'to_prepare' ? 'var(--shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <span>🍳 Orders to Prepare</span>
          <span style={{
            fontSize: '11px',
            fontWeight: '900',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: ordersToPrepare.length > 0 ? '#DC2626' : '#E5E7EB',
            color: ordersToPrepare.length > 0 ? '#FFFFFF' : 'var(--text-muted)'
          }}>
            {ordersToPrepare.length}
          </span>
        </button>

        {/* Tab 2: Processed & Collected Orders */}
        <button
          type="button"
          onClick={() => setActiveTab('processed')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: activeTab === 'processed' ? '800' : '600',
            backgroundColor: activeTab === 'processed' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'processed' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'processed' ? 'var(--shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <span>✅ Processed & Collected Orders</span>
          <span style={{
            fontSize: '11px',
            fontWeight: '900',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: processedAndCollectedOrders.length > 0 ? '#10B981' : '#E5E7EB',
            color: processedAndCollectedOrders.length > 0 ? '#FFFFFF' : 'var(--text-muted)'
          }}>
            {processedAndCollectedOrders.length}
          </span>
        </button>

        {/* Tab 3: Menu Stock Manager */}
        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: activeTab === 'menu' ? '800' : '600',
            backgroundColor: activeTab === 'menu' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'menu' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'menu' ? 'var(--shadow-sm)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <span>📋 Menu Stock</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORDERS THAT NEED TO BE PREPARED ALONE (received, in_progress) */}
      {/* ========================================================================= */}
      {activeTab === 'to_prepare' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px' }}>
              Kitchen Preparation Queue ({ordersToPrepare.length})
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Orders below require kitchen attention. Start cooking and mark them ready for student collection.
            </p>
          </div>

          {ordersToPrepare.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px dashed var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                Kitchen Queue is Clear!
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                All received orders have been cooked and processed. New student orders will automatically appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {ordersToPrepare.map(order => {
                const isReceived = order.order_status === 'received';

                return (
                  <div 
                    key={order.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '2px solid',
                      borderColor: isReceived ? '#FCD34D' : '#93C5FD',
                      padding: '20px',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>
                            #{order.order_number}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            backgroundColor: isReceived ? '#FEF3C7' : '#DBEAFE',
                            color: isReceived ? '#B45309' : '#1E40AF',
                            border: `1px solid ${isReceived ? '#FDE68A' : '#BFDBFE'}`
                          }}>
                            {isReceived ? '🍳 Needs Cooking' : '🔥 In Preparation'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)' }}>
                          {order.customer_name}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                          📞 {order.customer_phone || 'No phone provided'}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          display: 'inline-block'
                        }}>
                          Slot: {order.pickup_time}
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                          R{parseFloat(order.total_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Meal Items to Cook */}
                    <div style={{
                      backgroundColor: '#F9FAFB',
                      padding: '14px',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      flex: 1,
                      border: '1px solid var(--border)'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Items to Cook:
                      </span>
                      {order.items && order.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                            <span style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '900' }}>{it.quantity}x</span> {it.name || it.item_name}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>R{parseFloat(it.price || it.unit_price || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Kitchen Actions */}
                    <div style={{ marginTop: 'auto' }}>
                      {isReceived ? (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'in_progress')}
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#D97706',
                            color: '#FFFFFF',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '800',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <span>Start Cooking 🍳</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'ready')}
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '800',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <span>Mark Ready for Collection 🔔</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ORDERS ALREADY PROCESSED & COLLECTED INDIVIDUALLY (ready, completed) */}
      {/* ========================================================================= */}
      {activeTab === 'processed' && (
        <div className="animate-fade-in">
          
          {/* Counter Handover PIN Verification Tool */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '22px',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '26px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px' }}>
                  <ShieldCheck size={22} color="var(--primary)" />
                  <span>Counter 1 Collection PIN Verification</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  Enter student's 4-digit Collection PIN to verify and mark the meal as collected.
                </p>
              </div>

              <form onSubmit={handleVerifySubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="PIN e.g. 4821"
                  maxLength={6}
                  value={verifyPin}
                  onChange={(e) => setVerifyPin(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '2px solid var(--border)',
                    fontSize: '18px',
                    fontWeight: '900',
                    letterSpacing: '3px',
                    width: '140px',
                    textAlign: 'center',
                    backgroundColor: '#FAFAFA'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  Verify & Hand Over
                </button>
              </form>
            </div>

            {pinSuccess && (
              <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                {pinSuccess}
              </div>
            )}

            {pinError && (
              <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                {pinError}
              </div>
            )}
          </div>

          {/* Sub-Filters: All, Ready at Counter, Completed/Collected */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setProcessedFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: processedFilter === 'all' ? 'var(--primary)' : '#FFFFFF',
                  color: processedFilter === 'all' ? '#FFFFFF' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                All ({processedAndCollectedOrders.length})
              </button>
              <button
                onClick={() => setProcessedFilter('ready')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: processedFilter === 'ready' ? '#059669' : '#FFFFFF',
                  color: processedFilter === 'ready' ? '#FFFFFF' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                Ready at Counter ({processedAndCollectedOrders.filter(o => o.order_status === 'ready').length})
              </button>
              <button
                onClick={() => setProcessedFilter('completed')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: processedFilter === 'completed' ? '#4B5563' : '#FFFFFF',
                  color: processedFilter === 'completed' ? '#FFFFFF' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                Collected ({processedAndCollectedOrders.filter(o => o.order_status === 'completed').length})
              </button>
            </div>

            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Showing {filteredProcessedOrders.length} processed orders
            </span>
          </div>

          {/* List of Processed Orders */}
          {filteredProcessedOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px dashed var(--border)'
            }}>
              <PackageCheck size={40} color="var(--text-muted)" style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                No orders match this filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredProcessedOrders.map(order => {
                const isReady = order.order_status === 'ready';

                return (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: isReady ? '#A7F3D0' : 'var(--border)',
                      padding: '18px 20px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                          #{order.order_number}
                        </span>
                        
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          backgroundColor: isReady ? '#D1FAE5' : '#F3F4F6',
                          color: isReady ? '#059669' : '#4B5563',
                          border: `1px solid ${isReady ? '#A7F3D0' : '#E5E7EB'}`
                        }}>
                          {isReady ? '🔔 Ready at Counter 1' : '✅ Collected'}
                        </span>

                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', backgroundColor: 'var(--primary-subtle)', padding: '2px 8px', borderRadius: '6px' }}>
                          PIN #{order.pickup_pin}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>
                        {order.customer_name} • 📞 {order.customer_phone || 'No phone'}
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        Meals: {order.items && order.items.map(it => `${it.quantity}x ${it.name || it.item_name}`).join(', ')}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)' }}>
                        R{parseFloat(order.total_amount).toFixed(2)}
                      </span>

                      {isReady ? (
                        <button
                          onClick={() => onVerifyPickup(order.id, order.pickup_pin)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '800',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Hand Over PIN #{order.pickup_pin} ✅
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                          Collected & Handed Over
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MENU STOCK MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'menu' && (
        <div className="animate-fade-in">
          {/* Add Dish Form */}
          <form 
            onSubmit={handleDishSubmit}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border)',
              marginBottom: '26px'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>
              Add New Campus Meal / Special
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Category</label>
                <select 
                  value={newDish.category_slug}
                  onChange={(e) => setNewDish({ ...newDish, category_slug: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px' }}
                >
                  <option value="breakfast">🍳 Breakfast</option>
                  <option value="plate-meals">🍲 Plate Meals</option>
                  <option value="chips">🍟 Chips & Burgers</option>
                  <option value="drinks">🥤 Drinks</option>
                  <option value="extras">💊 Campus Extras</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Meal Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Dagwood Special"
                  value={newDish.name}
                  onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Price in Rand (R)</label>
                <input 
                  type="number"
                  step="0.10"
                  placeholder="e.g. 45.00"
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Description</label>
              <input 
                type="text"
                placeholder="Ingredients, sides, sauces..."
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px' }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '10px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Add Meal to Live Menu
            </button>
          </form>

          {/* Menu Stock Toggles */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: '800', color: 'var(--text-main)' }}>
              Live Menu Stock Availability
            </div>
            {menuItems.map(item => (
              <div 
                key={item.id}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'; }}
                  />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{item.name}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>R{parseFloat(item.price).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleStock(item.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '800',
                    backgroundColor: item.is_available ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: item.is_available ? 'var(--success)' : 'var(--danger)',
                    border: '1px solid',
                    borderColor: item.is_available ? '#A7F3D0' : '#FECACA',
                    cursor: 'pointer'
                  }}
                >
                  {item.is_available ? '🟢 IN STOCK' : '🔴 SOLD OUT'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
