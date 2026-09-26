import React, { useState } from 'react';
import { 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  QrCode, 
  Star, 
  ShoppingBag, 
  CheckCircle2, 
  ChefHat, 
  PackageCheck,
  AlertCircle
} from 'lucide-react';

export default function OrderTracker({ orders = [], onRefresh, onBrowseMenu, onOpenReview }) {
  const [activeTab, setActiveTab] = useState('in_progress'); // 'in_progress', 'collected', 'all'

  // Categorize orders
  const inProgressOrders = orders.filter(o => ['received', 'in_progress', 'ready'].includes(o.order_status));
  const collectedOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.order_status));

  // Helper to get formatted status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'received':
        return {
          label: 'Pending',
          color: '#D97706',
          bg: '#FEF3C7',
          borderColor: '#FDE68A',
          icon: <Clock size={13} />
        };
      case 'in_progress':
        return {
          label: 'Preparing',
          color: '#2563EB',
          bg: '#DBEAFE',
          borderColor: '#BFDBFE',
          icon: <ChefHat size={13} />
        };
      case 'ready':
        return {
          label: 'Ready for Collection',
          color: '#059669',
          bg: '#D1FAE5',
          borderColor: '#A7F3D0',
          icon: <CheckCircle2 size={13} />
        };
      case 'completed':
        return {
          label: 'Collected',
          color: '#4B5563',
          bg: '#F3F4F6',
          borderColor: '#E5E7EB',
          icon: <PackageCheck size={13} />
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: '#DC2626',
          bg: '#FEE2E2',
          borderColor: '#FECACA',
          icon: <AlertCircle size={13} />
        };
      default:
        return {
          label: status.toUpperCase(),
          color: 'var(--text-muted)',
          bg: '#F3F4F6',
          borderColor: '#E5E7EB',
          icon: null
        };
    }
  };

  const displayedOrders = 
    activeTab === 'in_progress' ? inProgressOrders :
    activeTab === 'collected' ? collectedOrders :
    orders;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
            My Campus Orders
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Track live kitchen progress and review your past collected meal tickets
          </p>
        </div>

        <button 
          onClick={onRefresh}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            fontSize: '13px',
            fontWeight: '700',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* DISTINCT SECTIONS / TABS NAVIGATION */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: '#F3F4F6',
        padding: '6px',
        borderRadius: '14px',
        marginBottom: '24px'
      }}>
        {/* Tab 1: Orders in Progress */}
        <button
          type="button"
          onClick={() => setActiveTab('in_progress')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: activeTab === 'in_progress' ? '800' : '600',
            backgroundColor: activeTab === 'in_progress' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'in_progress' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'in_progress' ? 'var(--shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <span>Orders in Progress</span>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: inProgressOrders.length > 0 ? 'var(--primary)' : '#E5E7EB',
            color: inProgressOrders.length > 0 ? '#FFFFFF' : 'var(--text-muted)'
          }}>
            {inProgressOrders.length}
          </span>
        </button>

        {/* Tab 2: Collected Orders */}
        <button
          type="button"
          onClick={() => setActiveTab('collected')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: activeTab === 'collected' ? '800' : '600',
            backgroundColor: activeTab === 'collected' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'collected' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'collected' ? 'var(--shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <span>Collected Orders</span>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: collectedOrders.length > 0 ? '#10B981' : '#E5E7EB',
            color: collectedOrders.length > 0 ? '#FFFFFF' : 'var(--text-muted)'
          }}>
            {collectedOrders.length}
          </span>
        </button>

        {/* Tab 3: All Orders */}
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: activeTab === 'all' ? '800' : '600',
            backgroundColor: activeTab === 'all' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'all' ? 'var(--shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <span>All ({orders.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* RENDER LIST OF ORDERS ACCORDING TO SELECTED TAB */}
      {/* ========================================================================= */}

      {displayedOrders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px dashed var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <ShoppingBag size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            {activeTab === 'in_progress' ? 'No Orders Currently in Progress' :
             activeTab === 'collected' ? 'No Collected Orders Yet' :
             'No Orders Placed Yet'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto 18px' }}>
            {activeTab === 'in_progress'
              ? 'When you place an order, live preparation and your 4-digit Collection PIN will show here.'
              : 'Past receipts and collected meals will be recorded here for your review.'}
          </p>
          <button
            onClick={onBrowseMenu}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            Browse Campus Menu
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {displayedOrders.map(order => {
            const isCompleted = ['completed', 'cancelled'].includes(order.order_status);
            const badge = getStatusBadge(order.order_status);
            const isReady = order.order_status === 'ready';

            // Active / In-Progress Card
            if (!isCompleted) {
              return (
                <div 
                  key={order.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '2px solid',
                    borderColor: isReady ? '#059669' : 'var(--primary)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-md)',
                    position: 'relative'
                  }}
                  className="animate-fade-in"
                >
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '18px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>
                          Ticket #{order.order_number}
                        </span>

                        {/* Explicit Text Status Badge */}
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.borderColor}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Pickup Window: <strong style={{ color: 'var(--text-main)' }}>{order.pickup_time}</strong> • Counter 1 (Express)
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>
                        R{parseFloat(order.total_amount).toFixed(2)}
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        {order.payment_method}
                      </p>
                    </div>
                  </div>

                  {/* 3-Step Lifecycle Visual Progress */}
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                      {[
                        { key: 'received', title: 'Pending' },
                        { key: 'in_progress', title: 'Preparing' },
                        { key: 'ready', title: 'Ready for Collection' }
                      ].map((step, idx) => {
                        const statusOrder = ['received', 'in_progress', 'ready', 'completed'];
                        const currentIdx = statusOrder.indexOf(order.order_status);
                        const isPastOrCurrent = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div key={step.key} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: isPastOrCurrent ? 'var(--primary)' : '#E5E7EB',
                              color: isPastOrCurrent ? '#FFFFFF' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 6px',
                              fontWeight: '800',
                              fontSize: '13px',
                              boxShadow: isCurrent ? '0 0 0 4px var(--primary-subtle)' : 'none'
                            }}>
                              {idx + 1}
                            </div>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: isPastOrCurrent ? '800' : '600',
                              color: isPastOrCurrent ? 'var(--primary)' : 'var(--text-muted)'
                            }}>
                              {step.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Security Collection PIN Card */}
                  <div style={{
                    backgroundColor: 'var(--primary-subtle)',
                    borderRadius: '16px',
                    border: '1px dashed var(--primary-light)',
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={18} color="var(--primary)" />
                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>
                          4-Digit Collection PIN
                        </span>
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '4px', color: 'var(--primary)', margin: '4px 0' }}>
                        #{order.pickup_pin}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                        Present this PIN to cafeteria staff at Counter 1 to claim your order.
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: '#FFFFFF',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <QrCode size={46} color="var(--primary)" />
                      <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)', marginTop: '2px' }}>Counter QR</span>
                    </div>
                  </div>

                  {/* Order Items Listing */}
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Items: </strong>
                    {order.items && order.items.map((it, idx) => (
                      <span key={idx}>
                        {it.quantity}x {it.name || it.item_name} (R{parseFloat(it.unit_price || it.price || 0).toFixed(2)}){idx < order.items.length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }

            // Collected / Past Order Receipt Card
            return (
              <div 
                key={order.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                      Ticket #{order.order_number}
                    </span>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.borderColor}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 6px' }}>
                    Pickup Slot: {order.pickup_time} • Counter 1 • PIN #{order.pickup_pin}
                  </p>

                  <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: 0 }}>
                    {order.items && order.items.map(it => `${it.quantity}x ${it.name || it.item_name}`).join(', ')}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '17px', fontWeight: '900', color: 'var(--primary)' }}>
                    R{parseFloat(order.total_amount).toFixed(2)}
                  </div>
                  {onOpenReview && (
                    <button
                      onClick={() => onOpenReview(order)}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: '1px solid #FDE68A',
                        cursor: 'pointer'
                      }}
                    >
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      <span>Rate Meal</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
