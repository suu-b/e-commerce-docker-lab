import { useState, useEffect } from 'react';
import { paymentsApi } from '../api/paymentsApi';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../context/AuthContext';
import './Payments.css';

function Payments() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [token]);

  const loadOrders = async () => {
    try {
      const response = await ordersApi.list(token);
      if (response.orders) {
        setOrders(response.orders.filter((order) => order.status === 'pending'));
      }
    } catch (err) {
      setError('Failed to load orders');
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setError('');
    setPaymentResult(null);
    setLoading(true);

    try {
      const orderResponse = await ordersApi.get(token, selectedOrder.id);
      const order = orderResponse.order;

      const totalAmount = order.items.reduce(
        (sum, item) => sum + item.quantity * parseFloat(item.unit_price),
        0
      );

      const response = await paymentsApi.create(
        token,
        selectedOrder.id,
        totalAmount,
        paymentMethod
      );

      if (response.error) {
        setError(response.error);
      } else {
        setPaymentResult(response);
        await loadOrders();
      }
    } catch (err) {
      setError('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to refund this payment?')) return;

    try {
      const response = await paymentsApi.refund(token, paymentId);
      if (response.error) {
        setError(response.error);
      } else {
        setPaymentResult({ ...paymentResult, status: 'refunded' });
      }
    } catch (err) {
      setError('Refund failed');
    }
  };

  return (
    <div className="payments-container">
      <h2>Payments</h2>

      {error && <div className="error">{error}</div>}

      {paymentResult && (
        <div className="payment-result">
          <h3>Payment {paymentResult.status === 'completed' ? 'Successful' : 'Refunded'}</h3>
          <p>
            <strong>Payment ID:</strong> {paymentResult.payment_id}
          </p>
          <p>
            <strong>Transaction ID:</strong> {paymentResult.transaction_id}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`status ${paymentResult.status}`}>
              {paymentResult.status}
            </span>
          </p>
          {paymentResult.status === 'completed' && (
            <button onClick={() => handleRefund(paymentResult.payment_id)} className="refund-button">
              Request Refund
            </button>
          )}
          <button onClick={() => setPaymentResult(null)} className="close-button">
            Close
          </button>
        </div>
      )}

      {!paymentResult && (
        <>
          <div className="payment-form-section">
            <h3>Create Payment</h3>
            <form onSubmit={handleCreatePayment}>
              <div className="form-group">
                <label>Select Order:</label>
                <select
                  value={selectedOrder?.id || ''}
                  onChange={(e) => {
                    const order = orders.find((o) => o.id === e.target.value);
                    setSelectedOrder(order);
                  }}
                  required
                >
                  <option value="">Select an order</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      Order #{order.id.slice(0, 8)} - {new Date(order.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {selectedOrder && (
                <div className="order-summary">
                  <h4>Order Summary</h4>
                  <p>
                    <strong>Order ID:</strong> {selectedOrder.id}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedOrder.status}
                  </p>
                </div>
              )}

              <button type="submit" disabled={loading || !selectedOrder}>
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </form>
          </div>

          <div className="info-section">
            <h3>Payment Information</h3>
            <p>
              This is a dummy payment system. All payments will be processed successfully
              regardless of the payment method or amount.
            </p>
            <p>
              You can request refunds for completed payments through the payment result
              section.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Payments;
