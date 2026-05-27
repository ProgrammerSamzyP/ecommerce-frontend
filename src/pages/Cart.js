import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PaystackPop from '@paystack/inline-js';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  // Shipping state
  const [shippingLocation, setShippingLocation] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [locations, setLocations] = useState([]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // Processing lock – prevents double clicks
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);   // also a ref for instant lock

  // Fetch available locations
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/shipping/locations`)
      .then(res => setLocations(res.data))
      .catch(() => {});
  }, []);

  const handleLocationChange = async (e) => {
    const loc = e.target.value;
    setShippingLocation(loc);
    if (!loc) {
      setShippingCost(0);
      return;
    }
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/shipping/cost?location=${loc}`);
      setShippingCost(res.data);
    } catch {
      setShippingCost(0);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/coupons/validate`, { code: couponCode });
      setDiscount(res.data.discount);
      setAppliedCoupon(res.data.code);
      alert('Coupon applied!');
    } catch (err) {
      alert(err.response?.data || 'Invalid coupon');
      setDiscount(0);
      setAppliedCoupon('');
    }
  };

  const finalTotal = totalPrice + shippingCost - (totalPrice * discount / 100);

  const handleCheckout = async () => {
    // Prevent double clicks
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);

    if (!user) {
      alert('Please login to checkout.');
      processingRef.current = false;
      setProcessing(false);
      return;
    }
    if (!shippingLocation) {
      alert('Please select a shipping location.');
      processingRef.current = false;
      setProcessing(false);
      return;
    }

    try {
      // 1. Generate a brand‑new reference (timestamp + random)
      const uniqueRef = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
      console.log('Generated reference:', uniqueRef);   // see it in the browser console

      // 2. Create the order with the reference and status PENDING_PAYMENT
      const order = {
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: totalPrice,
        shippingCost: shippingCost,
        shippingLocation: shippingLocation,
        couponCode: appliedCoupon,
        discountPercentage: discount,
        paymentReference: uniqueRef,
        status: 'PENDING_PAYMENT'
      };

      const resOrder = await axios.post(`${process.env.REACT_APP_API_URL}/api/orders`, order);
      const orderId = resOrder.data.id;
      console.log('Order created:', orderId);

      // 3. Open Paystack popup directly – no backend initialize call
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: 'pk_test_f14733726a194d1b8db219e2b8eb59455c0699c6',
        email: user.email,
        amount: Math.round(finalTotal * 100),
        ref: uniqueRef,
        onSuccess: async (transaction) => {
          console.log('Paystack onSuccess, verifying...');
          try {
            await axios.get(`${process.env.REACT_APP_API_URL}/api/paystack/verify/${transaction.reference}`);
            alert('Payment successful!');
            clearCart();
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            alert('Payment was successful, but we could not confirm it. Your order will be processed shortly.');
            clearCart();
          } finally {
            processingRef.current = false;
            setProcessing(false);
          }
        },
        onCancel: () => {
          alert('Payment cancelled.');
          processingRef.current = false;
          setProcessing(false);
        }
      });
    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment.');
      processingRef.current = false;
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container text-center mt-5">
        <h2>Your cart is empty</h2>
        <Link to="/products" className="btn btn-primary mt-3">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-4">Your Cart</h2>
      <div className="list-group mb-4">
        {cartItems.map(item => (
          <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{item.name}</h5>
              <p className="mb-0 text-muted">₦{item.price.toFixed(2)} each</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn btn-sm btn-outline-secondary">−</button>
              <span className="mx-2">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn btn-sm btn-outline-secondary">+</button>
            </div>
            <div>
              <strong>₦{(item.price * item.quantity).toFixed(2)}</strong>
              <button onClick={() => removeFromCart(item.id)} className="btn btn-sm btn-danger ms-3">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping */}
      <div className="mb-3">
        <label className="form-label">Shipping Location</label>
        <select className="form-select" value={shippingLocation} onChange={handleLocationChange}>
          <option value="">Select location...</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        {shippingCost > 0 && <p className="mt-1">Shipping: ₦{shippingCost.toFixed(2)}</p>}
      </div>

      {/* Coupon */}
      <div className="mb-3">
        <label className="form-label">Coupon Code</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter code"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
          />
          <button onClick={applyCoupon} className="btn btn-outline-primary">Apply</button>
        </div>
        {discount > 0 && <p className="mt-1 text-success">Coupon {appliedCoupon} applied: -{discount}%</p>}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Total: ₦{finalTotal.toFixed(2)}</h4>
        <div>
          <button
            onClick={handleCheckout}
            className="btn btn-success me-2"
            disabled={processing}
          >
            {processing ? 'Processing…' : 'Pay with Paystack'}
          </button>
          <button onClick={clearCart} className="btn btn-outline-danger">Clear Cart</button>
        </div>
      </div>
    </div>
  );
}