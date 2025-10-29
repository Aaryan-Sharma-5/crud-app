import { useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Cart({ onCartUpdate }) {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`);
      setCartItems(response.data);
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      showAlert('Failed to load cart items', 'error');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 3000);
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.put(`${API_URL}/api/cart/${id}`, { quantity: newQuantity });
      fetchCartItems();
      showAlert('Quantity updated', 'success');
    } catch (error) {
      showAlert('Failed to update quantity', 'error');
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/cart/${id}`);
      fetchCartItems();
      showAlert('Item removed from cart', 'success');
    } catch (error) {
      showAlert('Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear the cart?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/cart`);
      fetchCartItems();
      showAlert('Cart cleared', 'success');
    } catch (error) {
      showAlert('Failed to clear cart', 'error');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/cart/checkout`, {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email
      });
      setOrderDetails(response.data);
      setShowCheckout(false);
      setShowReceipt(true);
      setCustomerInfo({ name: '', email: '' });
      showAlert('Order placed successfully!', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Checkout failed', 'error');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setOrderDetails(null);
  };

  return (
    <div className="cart-container">
      {alert.show && (
        <div className={`alert ${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="cart-header">
        <h2>Shopping Cart</h2>
        {cartItems.length > 0 && (
          <button onClick={clearCart} className="btn-clear">
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <p className="empty-subtitle">Add some products to get started!</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="item-image" />
                )}
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="item-controls">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <p className="item-subtotal">
                    Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button 
                    onClick={() => removeItem(item._id)} 
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Total Items:</span>
              <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{calculateTotal()}</span>
            </div>
            <button 
              onClick={() => setShowCheckout(true)} 
              className="btn-checkout"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Checkout</h2>
            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  required
                />
              </div>
              <div className="checkout-summary">
                <p>Total: <strong>₹{calculateTotal()}</strong></p>
                <p className="payment-note">Mock payment - no charges will be made</p>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  Place Order
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCheckout(false)} 
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && orderDetails && (
        <div className="modal-overlay" onClick={closeReceipt}>
          <div className="modal-content receipt" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <h2>Order Confirmed!</h2>
              <p className="order-number">Order #{orderDetails.orderNumber}</p>
            </div>
            
            <div className="receipt-details">
              <div className="detail-row">
                <span>Customer:</span>
                <span>{orderDetails.customerName}</span>
              </div>
              <div className="detail-row">
                <span>Email:</span>
                <span>{orderDetails.customerEmail}</span>
              </div>
              <div className="detail-row">
                <span>Date:</span>
                <span>{new Date(orderDetails.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="receipt-items">
              <h3>Items:</h3>
              {orderDetails.items.map((item, index) => (
                <div key={index} className="receipt-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-total">
              <strong>Total: ₹{orderDetails.totalAmount.toFixed(2)}</strong>
            </div>

            <button onClick={closeReceipt} className="btn-close-receipt">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
