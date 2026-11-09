import { useState, useEffect } from 'react';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [newOrderItems, setNewOrderItems] = useState([
    { product_id: '', quantity: 1, unit_price: '' },
  ]);

  useEffect(() => {
    loadOrders();
  }, [token]);

  const loadOrders = async () => {
    try {
      const response = await ordersApi.list(token);
      if (response.orders) {
        setOrders(response.orders);
      }
    } catch (err) {
      setError('Failed to load orders');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validItems = newOrderItems.filter(
        (item) => item.product_id && item.quantity > 0 && item.unit_price
      );

      if (validItems.length === 0) {
        setError('Please add at least one valid item');
        setLoading(false);
        return;
      }

      await ordersApi.create(token, validItems);
      await loadOrders();
      setShowCreateForm(false);
      setNewOrderItems([{ product_id: '', quantity: 1, unit_price: '' }]);
    } catch (err) {
      setError('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await ordersApi.get(token, orderId);
      if (response.order) {
        setSelectedOrder(response.order);
      }
    } catch (err) {
      setError('Failed to load order details');
    }
  };

  const handleAddItem = () => {
    setNewOrderItems([
      ...newOrderItems,
      { product_id: '', quantity: 1, unit_price: '' },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (newOrderItems.length > 1) {
      setNewOrderItems(newOrderItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrderItems];
    updatedItems[index][field] = value;
    setNewOrderItems(updatedItems);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(token, orderId, newStatus);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        await handleViewOrder(orderId);
      }
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>My Orders</h2>
        <button onClick={() => setShowCreateForm(true)} className="add-button primary">
          Create New Order
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showCreateForm && (
        <div className="order-form-overlay">
          <div className="order-form">
            <h3>Create New Order</h3>
            <form onSubmit={handleCreateOrder}>
              <div className="order-items">
                <h4>Order Items</h4>
                {newOrderItems.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <div className="form-group">
                      <label>Product ID:</label>
                      <input
                        type="text"
                        value={item.product_id}
                        onChange={(e) =>
                          handleItemChange(index, 'product_id', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseInt(e.target.value))
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit Price:</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(index, 'unit_price', e.target.value)
                        }
                        required
                      />
                    </div>
                    {newOrderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="remove-item"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddItem} className="add-item">
                  + Add Item
                </button>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading} className="primary">
                  {loading ? 'Creating...' : 'Create Order'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="order-details-overlay">
          <div className="order-details">
            <div className="order-details-header">
              <h3>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="close-button">
                ×
              </button>
            </div>
            <div className="order-info">
              <p>
                <strong>Order ID:</strong> {selectedOrder.id}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status ${selectedOrder.status}`}>
                  {selectedOrder.status}
                </span>
              </p>
              <p>
                <strong>Created:</strong>{' '}
                {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>
            <div className="order-items-list">
              <h4>Items</h4>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="order-item-detail">
                  <p>
                    <strong>Product ID:</strong> {item.product_id}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {item.quantity}
                  </p>
                  <p>
                    <strong>Unit Price:</strong> ${item.unit_price}
                  </p>
                  <p>
                    <strong>Total:</strong> ${(item.quantity * item.unit_price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="order-status-update">
              <label>Update Status:</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="orders-list">
        {orders.length === 0 ? (
          <p className="no-orders">No orders found. Create your first order!</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>Order #{order.id.slice(0, 8)}</h3>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status ${order.status}`}>{order.status}</span>
              </p>
              <p>
                <strong>Created:</strong>{' '}
                {new Date(order.created_at).toLocaleString()}
              </p>
              <button onClick={() => handleViewOrder(order.id)}>View Details</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Orders;
