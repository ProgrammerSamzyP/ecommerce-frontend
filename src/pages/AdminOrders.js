import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchOrders = useCallback(() => {
    const url = showDeleted
      ? `${process.env.REACT_APP_API_URL}/api/orders/admin/deleted`
      : `${process.env.REACT_APP_API_URL}/api/orders/admin`;
    axios.get(url)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, [showDeleted]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/admin/${orderId}/status`, {
        status: newStatus
      });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const softDelete = async (orderId) => {
    if (!window.confirm('Move this order to trash?')) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/admin/${orderId}/soft-delete`);
      fetchOrders();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const restoreOrder = async (orderId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/admin/${orderId}/restore`);
      fetchOrders();
    } catch (err) {
      alert('Failed to restore');
    }
  };

  const permanentDelete = async (orderId) => {
    if (!window.confirm('Permanently delete this order? This cannot be undone.')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/orders/admin/${orderId}/permanent`);
      fetchOrders();
    } catch (err) {
      alert('Failed to delete');
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

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Orders (Admin)</h2>
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className="btn btn-outline-secondary"
        >
          {showDeleted ? 'Show Active Orders' : 'Show Trash'}
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="alert alert-info">No orders found.</div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>
                Order #{order.id.substring(0, 8)} — <strong>{order.userEmail}</strong>
              </span>
              <span className={`badge ${statusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="card-body">
              <p className="mb-2"><strong>Total:</strong> ₦{order.total.toFixed(2)}</p>
              <ul className="list-group list-group-flush mb-3">
                {order.items.map(item => (
                  <li key={item.productId} className="list-group-item d-flex justify-content-between">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              {!showDeleted ? (
                <div className="d-flex flex-wrap gap-2">
                  {order.status === 'PAID' && (
                    <button
                      onClick={() => updateStatus(order.id, 'SHIPPING')}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Mark as Shipping
                    </button>
                  )}
                  {order.status === 'SHIPPING' && (
                    <button
                      onClick={() => updateStatus(order.id, 'DELIVERED')}
                      className="btn btn-sm btn-outline-success"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {(order.status === 'PENDING' || order.status === 'PENDING_PAYMENT') && (
                    <button
                      onClick={() => updateStatus(order.id, 'CANCELLED')}
                      className="btn btn-sm btn-outline-danger"
                    >
                      Cancel
                    </button>
                  )}
                  {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                    <button
                      onClick={() => softDelete(order.id)}
                      className="btn btn-sm btn-outline-warning"
                    >
                      Move to Trash
                    </button>
                  )}
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  <button
                    onClick={() => restoreOrder(order.id)}
                    className="btn btn-sm btn-outline-success"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => permanentDelete(order.id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    Delete Forever
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}