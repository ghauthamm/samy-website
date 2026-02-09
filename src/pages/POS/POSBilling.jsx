import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiPlus, FiMinus, FiTrash2, FiCreditCard, FiDollarSign,
    FiSmartphone, FiPrinter, FiX, FiCheck, FiPercent, FiShoppingCart
} from 'react-icons/fi';
import { ref, onValue, push } from 'firebase/database';
import { database } from '../../config/firebase';
import './POSBilling.css';

const POSBilling = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const searchRef = useRef(null);

    // Demo products
    const demoProducts = [
        { id: '1', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2999, stock: 45, barcode: '8901234567890' },
        { id: '2', name: 'Smart Watch Elite', category: 'Electronics', price: 8999, stock: 23, barcode: '8901234567891' },
        { id: '3', name: 'Designer Handbag', category: 'Accessories', price: 4599, stock: 12, barcode: '8901234567892' },
        { id: '4', name: 'Premium Running Shoes', category: 'Sports', price: 3499, stock: 56, barcode: '8901234567893' },
        { id: '5', name: 'Formal Cotton Shirt', category: 'Clothing', price: 1299, stock: 89, barcode: '8901234567894' },
        { id: '6', name: 'LED Desk Lamp', category: 'Home & Living', price: 899, stock: 34, barcode: '8901234567895' },
        { id: '7', name: 'Bluetooth Speaker', category: 'Electronics', price: 1599, stock: 67, barcode: '8901234567896' },
        { id: '8', name: 'Leather Wallet', category: 'Accessories', price: 799, stock: 45, barcode: '8901234567897' },
        { id: '9', name: 'Yoga Mat Premium', category: 'Sports', price: 999, stock: 28, barcode: '8901234567898' },
        { id: '10', name: 'Casual Polo T-Shirt', category: 'Clothing', price: 699, stock: 112, barcode: '8901234567899' },
    ];

    useEffect(() => {
        const productsRef = ref(database, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productList = Object.entries(data).map(([id, product]) => ({
                    id,
                    ...product
                }));
                setProducts(productList);
            } else {
                setProducts(demoProducts);
            }
        });

        // Focus search on mount
        searchRef.current?.focus();

        return () => unsubscribe();
    }, []);

    const filteredProducts = products.filter(product =>
        (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        product.barcode?.includes(searchQuery)
    );

    const addToCart = (product) => {
        const existingItem = cartItems.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCartItems(cartItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            }
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, delta) => {
        setCartItems(cartItems.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) return null;
                if (newQuantity > item.stock) return item;
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(Boolean));
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.id !== productId));
    };

    const getSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTax = () => {
        return Math.round(getSubtotal() * 0.18);
    };

    const getDiscountAmount = () => {
        return Math.round(getSubtotal() * (discount / 100));
    };

    const getTotal = () => {
        return getSubtotal() + getTax() - getDiscountAmount();
    };

    const handlePayment = async () => {
        if (!paymentMethod) return;

        const invoice = `INV-${Date.now().toString().slice(-6)}`;
        setInvoiceNumber(invoice);

        // Save order to Firebase
        try {
            await push(ref(database, 'orders'), {
                invoiceNumber: invoice,
                items: cartItems,
                subtotal: getSubtotal(),
                tax: getTax(),
                discount: getDiscountAmount(),
                total: getTotal(),
                paymentMethod,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving order:', error);
        }

        setShowPaymentModal(false);
        setShowSuccessModal(true);
    };

    const handleNewSale = () => {
        setCartItems([]);
        setDiscount(0);
        setPaymentMethod(null);
        setShowSuccessModal(false);
        searchRef.current?.focus();
    };

    return (
        <div className="pos-billing">
            {/* Products Panel */}
            <div className="products-panel">
                <div className="panel-header">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search products or scan barcode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="quick-categories">
                    {['All', 'Electronics', 'Clothing', 'Accessories', 'Sports'].map((cat) => (
                        <button key={cat} className="category-btn">
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="products-grid">
                    {filteredProducts.map((product) => (
                        <motion.button
                            key={product.id}
                            className={`product-tile ${product.stock === 0 ? 'out-of-stock' : ''}`}
                            onClick={() => product.stock > 0 && addToCart(product)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={product.stock === 0}
                        >
                            <div className="product-thumb">
                                {product.image ? (
                                    <img src={product.image} alt={product.name || 'Product'} />
                                ) : (
                                    <span className="thumb-text">{(product.name || '?').charAt(0)}</span>
                                )}
                            </div>
                            <div className="product-details">
                                <span className="product-name">{product.name || 'Unknown Product'}</span>
                                <div className="product-meta">
                                    <span className="product-price">₹{(product.price || 0).toLocaleString()}</span>
                                    <span className={`stock-info ${(product.stock || 0) <= 5 ? 'low' : ''}`}>
                                        {product.stock || 0} left
                                    </span>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Cart Panel */}
            <div className="cart-panel">
                <div className="cart-header">
                    <h2>Current Sale</h2>
                    <span className="item-count">{cartItems.length} items</span>
                </div>

                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <FiShoppingCart size={48} />
                            <p>No items in cart</p>
                            <span>Search or select products to add</span>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <motion.div
                                key={item.id}
                                className="cart-item"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="item-info">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-price">₹{item.price.toLocaleString()}</span>
                                </div>
                                <div className="item-controls">
                                    <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                                        <FiMinus />
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                                        <FiPlus />
                                    </button>
                                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <span className="item-total">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="discount-input">
                        <FiPercent className="discount-icon" />
                        <input
                            type="number"
                            placeholder="Discount %"
                            value={discount || ''}
                            onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                            min="0"
                            max="100"
                        />
                    </div>

                    <div className="totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>₹{getSubtotal().toLocaleString()}</span>
                        </div>
                        <div className="total-row">
                            <span>Tax (18% GST)</span>
                            <span>₹{getTax().toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                            <div className="total-row discount">
                                <span>Discount ({discount}%)</span>
                                <span>-₹{getDiscountAmount().toLocaleString()}</span>
                            </div>
                        )}
                        <div className="total-row grand">
                            <span>Total</span>
                            <span>₹{getTotal().toLocaleString()}</span>
                        </div>
                    </div>

                    <motion.button
                        className="checkout-btn"
                        onClick={() => setShowPaymentModal(true)}
                        disabled={cartItems.length === 0}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiCreditCard />
                        Proceed to Payment
                    </motion.button>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="payment-modal"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="modal-header">
                                <h2>Select Payment Method</h2>
                                <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <div className="payment-amount">
                                <span className="label">Amount Due</span>
                                <span className="amount">₹{getTotal().toLocaleString()}</span>
                            </div>

                            <div className="payment-methods">
                                <motion.button
                                    className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('cash')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiDollarSign className="payment-icon" />
                                    <span>Cash</span>
                                </motion.button>
                                <motion.button
                                    className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('upi')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiSmartphone className="payment-icon" />
                                    <span>UPI</span>
                                </motion.button>
                                <motion.button
                                    className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiCreditCard className="payment-icon" />
                                    <span>Card</span>
                                </motion.button>
                            </div>

                            <motion.button
                                className="confirm-payment-btn"
                                onClick={handlePayment}
                                disabled={!paymentMethod}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FiCheck />
                                Complete Payment
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="success-modal"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <motion.div
                                className="success-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            >
                                <FiCheck />
                            </motion.div>
                            <h2>Payment Successful!</h2>
                            <p>Invoice: {invoiceNumber}</p>
                            <span className="success-amount">₹{getTotal().toLocaleString()}</span>

                            <div className="success-actions">
                                <motion.button
                                    className="print-btn"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiPrinter />
                                    Print Invoice
                                </motion.button>
                                <motion.button
                                    className="new-sale-btn"
                                    onClick={handleNewSale}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    New Sale
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default POSBilling;

// Add FiShoppingCart to imports for empty cart display
