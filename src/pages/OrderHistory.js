import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/api/orders`)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh when tab regains focus (e.g., after Paystack popup closes)
  useEffect(() => {
    const handleFocus = () => fetchOrders();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchOrders]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data || 'Failed to cancel order');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Remove this order from your history? It will still be visible to the admin.')) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/customer-delete`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data || 'Failed to delete order');
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download invoice.');
      console.error(err);
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'PAID':
      case 'SHIPPING':
      case 'DELIVERED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-warning text-dark';
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Orders</h2>
        <button onClick={fetchOrders} className="btn btn-outline-secondary btn-sm">
          ↻ Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="alert alert-info">
          No orders yet. <Link to="/products">Start shopping</Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Order #{order.id.substring(0, 8)}</span>
              <span className={`badge ${statusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {order.items.map(item => (
                  <li key={item.productId} className="list-group-item d-flex justify-content-between">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <strong>Total: ₦{order.total.toFixed(2)}</strong>
                <div className="d-flex gap-2">
                  {(order.status === 'PENDING' || order.status === 'PENDING_PAYMENT') && (
                    <button onClick={() => cancelOrder(order.id)} className="btn btn-sm btn-outline-danger">
                      Cancel Order
                    </button>
                  )}
                  {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                    <button onClick={() => deleteOrder(order.id)} className="btn btn-sm btn-outline-secondary">
                      Delete from history
                    </button>
                  )}
                  {(order.status === 'PAID' || order.status === 'SHIPPING' || order.status === 'DELIVERED') && (
                    <button onClick={() => downloadInvoice(order.id)} className="btn btn-sm btn-outline-primary">
                      📄 Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}