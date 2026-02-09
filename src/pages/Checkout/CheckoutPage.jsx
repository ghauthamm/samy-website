import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiCreditCard, FiCheck, FiX, FiTruck, FiLock } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { initiatePayment } from '../../utils/razorpay';
import { ref, push, set } from 'firebase/database';
import { database } from '../../config/firebase';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'razorpay'
    });

    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const subtotal = getCartTotal();
    const shipping = subtotal > 0 ? (subtotal > 1000 ? 0 : 100) : 0;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;

    useEffect(() => {
        if (cartItems.length === 0 && !paymentStatus) {
            navigate('/shop');
        }
    }, [cartItems, navigate, paymentStatus]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveOrderToDatabase = async (orderData) => {
        try {
            const ordersRef = ref(database, 'orders');
            const newOrderRef = push(ordersRef);
            await set(newOrderRef, {
                ...orderData,
                createdAt: new Date().toISOString(),
                userId: currentUser?.uid || 'guest'
            });
            return newOrderRef.key;
        } catch (error) {
            console.error('Error saving order:', error);
            throw error;
        }
    };

    const handlePaymentSuccess = async (paymentResponse) => {
        try {
            // Save order to database
            const orderData = {
                orderId: paymentResponse.razorpay_order_id || `RZP_${paymentResponse.razorpay_payment_id}`,
                paymentId: paymentResponse.razorpay_payment_id,
                amount: total,
                items: cartItems,
                customerDetails: formData,
                status: 'paid',
                paymentMethod: 'razorpay'
            };

            await saveOrderToDatabase(orderData);

            // Clear cart
            clearCart();

            // Show success message
            setPaymentStatus('success');
            setProcessing(false);

            // Redirect to success page after 2 seconds
            setTimeout(() => {
                navigate('/order-success', { state: { orderData } });
            }, 2000);
        } catch (error) {
            console.error('Error processing successful payment:', error);
            setPaymentStatus('error');
            setProcessing(false);
        }
    };

    const handlePaymentFailure = (error) => {
        console.error('Payment failed:', error);
        setPaymentStatus('failed');
        setProcessing(false);
        alert(`Payment failed: ${error.error || 'Unknown error'}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (formData.paymentMethod === 'razorpay') {
            setProcessing(true);

            try {
                // Initiate Razorpay payment without order_id (for test mode)
                // In production, create order via backend API first
                await initiatePayment(
                    {
                        amount: total,
                        customerName: formData.fullName,
                        customerEmail: formData.email,
                        customerPhone: formData.phone,
                        address: formData.address,
                        items: cartItems,
                        description: `Payment for ${cartItems.length} items from Samy Trends`
                    },
                    handlePaymentSuccess,
                    handlePaymentFailure
                );
            } catch (error) {
                console.error('Error initiating payment:', error);
                setProcessing(false);
                alert('Failed to initiate payment. Please try again.');
            }
        } else {
            // Handle COD or other payment methods
            handleCODOrder();
        }
    };

    const handleCODOrder = async () => {
        setProcessing(true);
        try {
            const orderData = {
                orderId: `COD_${Date.now()}`,
                amount: total,
                items: cartItems,
                customerDetails: formData,
                status: 'pending',
                paymentMethod: 'cod'
            };

            await saveOrderToDatabase(orderData);
            clearCart();
            setPaymentStatus('success');

            setTimeout(() => {
                navigate('/order-success', { state: { orderData } });
            }, 2000);
        } catch (error) {
            console.error('Error placing COD order:', error);
            setProcessing(false);
            alert('Failed to place order. Please try again.');
        }
    };

    if (paymentStatus === 'success') {
        return (
            <div className="checkout-page">
                <motion.div
                    className="payment-status success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <FiCheck className="status-icon" />
                    <h2>Payment Successful!</h2>
                    <p>Redirecting to order confirmation...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <span onClick={() => navigate('/')}>Home</span> /
                    <span onClick={() => navigate('/cart')}>Cart</span> /
                    <span className="current">Checkout</span>
                </div>

                <h1 className="checkout-title">
                    <FiShoppingBag /> Checkout
                </h1>

                <div className="checkout-grid">
                    {/* Checkout Form */}
                    <div className="checkout-form-section">
                        <form onSubmit={handleSubmit}>
                            {/* Customer Details */}
                            <div className="form-section">
                                <h2>Customer Details</h2>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className={errors.fullName ? 'error' : ''}
                                        />
                                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={errors.email ? 'error' : ''}
                                        />
                                        {errors.email && <span className="error-message">{errors.email}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={errors.phone ? 'error' : ''}
                                            placeholder="10 digit number"
                                        />
                                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="form-section">
                                <h2><FiTruck /> Shipping Address</h2>
                                <div className="form-group">
                                    <label>Address *</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className={errors.address ? 'error' : ''}
                                        rows="3"
                                    />
                                    {errors.address && <span className="error-message">{errors.address}</span>}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className={errors.city ? 'error' : ''}
                                        />
                                        {errors.city && <span className="error-message">{errors.city}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className={errors.state ? 'error' : ''}
                                        />
                                        {errors.state && <span className="error-message">{errors.state}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode *</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className={errors.pincode ? 'error' : ''}
                                            placeholder="6 digits"
                                        />
                                        {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="form-section">
                                <h2><FiCreditCard /> Payment Method</h2>
                                <div className="payment-methods">
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="razorpay"
                                            checked={formData.paymentMethod === 'razorpay'}
                                            onChange={handleInputChange}
                                        />
                                        <div className="payment-card">
                                            <FiCreditCard />
                                            <div>
                                                <strong>Razorpay</strong>
                                                <small>Credit/Debit Card, UPI, Net Banking</small>
                                            </div>
                                            <FiLock className="secure-icon" />
                                        </div>
                                    </label>

                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleInputChange}
                                        />
                                        <div className="payment-card">
                                            <FiTruck />
                                            <div>
                                                <strong>Cash on Delivery</strong>
                                                <small>Pay when you receive</small>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                className="place-order-btn"
                                disabled={processing}
                                whileHover={{ scale: processing ? 1 : 1.02 }}
                                whileTap={{ scale: processing ? 1 : 0.98 }}
                            >
                                {processing ? 'Processing...' : `Place Order - ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                            </motion.button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h2>Order Summary</h2>

                        <div className="summary-items">
                            {cartItems.map((item) => (
                                <div key={item.id} className="summary-item">
                                    <img src={item.image || '/placeholder.png'} alt={item.name} />
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <p>Qty: {item.quantity}</p>
                                    </div>
                                    <span className="item-price">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-breakdown">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'free' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span>Tax (GST 18%)</span>
                                <span>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="secure-checkout">
                            <FiLock />
                            <span>Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
