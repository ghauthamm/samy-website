import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus, FiTrash2, FiArrowRight, FiShoppingBag, FiTag } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import './Cart.css';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

    const subtotal = getCartTotal();
    const shipping = subtotal > 999 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="empty-cart-container">
                    <motion.div
                        className="empty-cart"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon">
                            <FiShoppingBag />
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/shop" className="btn-shop">
                            Continue Shopping <FiArrowRight />
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <span className="item-count">{cartItems.length} items</span>
                </div>

                <div className="cart-content">
                    {/* Cart Items */}
                    <div className="cart-items-section">
                        <div className="cart-items">
                            {cartItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className="cart-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="item-image">
                                        <div className="image-placeholder">📦</div>
                                    </div>
                                    <div className="item-details">
                                        <span className="item-category">{item.category}</span>
                                        <h3 className="item-name">{item.name}</h3>
                                        <span className="item-price">₹{item.price.toLocaleString()}</span>
                                    </div>
                                    <div className="item-quantity">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <FiMinus />
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>
                                    <div className="item-total">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        <div className="cart-actions">
                            <Link to="/shop" className="continue-shopping">
                                ← Continue Shopping
                            </Link>
                            <button className="clear-cart" onClick={clearCart}>
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <motion.div
                        className="order-summary"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2>Order Summary</h2>

                        <div className="coupon-section">
                            <div className="coupon-input">
                                <FiTag className="coupon-icon" />
                                <input type="text" placeholder="Enter coupon code" />
                                <button className="apply-coupon">Apply</button>
                            </div>
                        </div>

                        <div className="summary-rows">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'free' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span>Tax (18% GST)</span>
                                <span>₹{tax.toLocaleString()}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <motion.button
                            className="checkout-btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Proceed to Checkout <FiArrowRight />
                        </motion.button>

                        <div className="payment-methods">
                            <p>We accept:</p>
                            <div className="payment-icons">
                                <span>💳</span>
                                <span>📱</span>
                                <span>🏦</span>
                            </div>
                        </div>

                        {subtotal < 999 && (
                            <div className="free-shipping-alert">
                                Add ₹{999 - subtotal} more for FREE shipping!
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
