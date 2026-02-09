import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiFilter, FiAlertTriangle, FiPackage, FiTrendingUp,
    FiTrendingDown, FiPlus, FiMinus, FiX, FiCheck, FiRefreshCw,
    FiDownload, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { ref, onValue, update, push } from 'firebase/database';
import { database } from '../../config/firebase';
import './Stock.css';

const Stock = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState('add');
    const [adjustmentQty, setAdjustmentQty] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [stockHistory, setStockHistory] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        minStock: '',
        sku: '',
        image: ''
    });

    const categories = ['Electronics', 'Clothing', 'Accessories', 'Home & Living', 'Sports', 'Beauty'];


    const demoProducts = [
        { id: '1', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2999, stock: 45, minStock: 10, sku: 'SKU-001', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop' },
        { id: '2', name: 'Smart Watch Elite', category: 'Electronics', price: 8999, stock: 8, minStock: 15, sku: 'SKU-002', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
        { id: '3', name: 'Designer Handbag', category: 'Accessories', price: 4599, stock: 0, minStock: 5, sku: 'SKU-003', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop' },
        { id: '4', name: 'Premium Running Shoes', category: 'Sports', price: 3499, stock: 56, minStock: 20, sku: 'SKU-004', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
        { id: '5', name: 'Formal Cotton Shirt', category: 'Clothing', price: 1299, stock: 89, minStock: 30, sku: 'SKU-005', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop' },
        { id: '6', name: 'LED Desk Lamp', category: 'Home & Living', price: 899, stock: 5, minStock: 10, sku: 'SKU-006', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop' },
        { id: '7', name: 'Bluetooth Speaker', category: 'Electronics', price: 1599, stock: 34, minStock: 15, sku: 'SKU-007', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' },
        { id: '8', name: 'Leather Wallet', category: 'Accessories', price: 799, stock: 0, minStock: 10, sku: 'SKU-008', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop' },
        { id: '9', name: 'Bluetooth Headphones', category: 'Electronics', price: 1999, stock: 50, minStock: 15, sku: 'SKU-009', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
        { id: '10', name: 'Cotton T-Shirt', category: 'Clothing', price: 599, stock: 100, minStock: 25, sku: 'SKU-010', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
        { id: '11', name: 'Yoga Mat', category: 'Sports', price: 899, stock: 30, minStock: 10, sku: 'SKU-011', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop' },
        { id: '12', name: 'Ceramic Vase', category: 'Home & Living', price: 1299, stock: 20, minStock: 8, sku: 'SKU-012', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop' },
        { id: '13', name: 'Lipstick Set', category: 'Beauty', price: 1499, stock: 65, minStock: 20, sku: 'SKU-013', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop' },
    ];

    const demoHistory = [
        { id: 1, productId: '1', productName: 'Wireless Earbuds Pro', type: 'add', quantity: 50, reason: 'New shipment received', date: '2026-02-09T08:30:00', user: 'Admin' },
        { id: 2, productId: '2', productName: 'Smart Watch Elite', type: 'remove', quantity: 5, reason: 'Damaged items', date: '2026-02-08T14:20:00', user: 'Admin' },
        { id: 3, productId: '3', productName: 'Designer Handbag', type: 'remove', quantity: 12, reason: 'Sold out - awaiting restock', date: '2026-02-07T10:15:00', user: 'Manager' },
        { id: 4, productId: '4', productName: 'Premium Running Shoes', type: 'add', quantity: 30, reason: 'Supplier delivery', date: '2026-02-06T09:00:00', user: 'Admin' },
    ];

    useEffect(() => {
        const productsRef = ref(database, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productList = Object.entries(data).map(([id, product]) => ({
                    id,
                    minStock: product.minStock || 10,
                    ...product
                }));
                setProducts(productList);
            } else {
                setProducts(demoProducts);
            }
            setLoading(false);
        });

        // Load stock history
        const historyRef = ref(database, 'stockHistory');
        onValue(historyRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const historyList = Object.entries(data).map(([id, entry]) => ({
                    id,
                    ...entry
                })).sort((a, b) => new Date(b.date) - new Date(a.date));
                setStockHistory(historyList);
            } else {
                setStockHistory(demoHistory);
            }
        });

        return () => unsubscribe();
    }, []);

    const getStockStatus = (product) => {
        const stock = product.stock || 0;
        const minStock = product.minStock || 10;
        if (stock === 0) return 'out-of-stock';
        if (stock <= minStock) return 'low-stock';
        return 'in-stock';
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'out-of-stock': return 'Out of Stock';
            case 'low-stock': return 'Low Stock';
            default: return 'In Stock';
        }
    };

    const filteredProducts = products.filter(product => {
        const productName = product.name || '';
        const productSku = product.sku || '';
        const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            productSku.toLowerCase().includes(searchQuery.toLowerCase());
        const status = getStockStatus(product);
        const matchesFilter = stockFilter === 'all' ||
            (stockFilter === 'low' && status === 'low-stock') ||
            (stockFilter === 'out' && status === 'out-of-stock') ||
            (stockFilter === 'in' && status === 'in-stock');
        return matchesSearch && matchesFilter;
    });

    const stats = {
        totalProducts: products.length,
        totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
        lowStock: products.filter(p => getStockStatus(p) === 'low-stock').length,
        outOfStock: products.filter(p => getStockStatus(p) === 'out-of-stock').length
    };

    const handleAdjustStock = (product) => {
        setSelectedProduct(product);
        setAdjustmentType('add');
        setAdjustmentQty('');
        setAdjustmentReason('');
        setShowAdjustModal(true);
    };

    const handleSaveAdjustment = async () => {
        if (!adjustmentQty || parseInt(adjustmentQty) <= 0) return;

        const qty = parseInt(adjustmentQty);
        const currentStock = selectedProduct.stock || 0;
        const newStock = adjustmentType === 'add'
            ? currentStock + qty
            : Math.max(0, currentStock - qty);

        try {
            // Update product stock
            await update(ref(database, `products/${selectedProduct.id}`), {
                stock: newStock,
                lastUpdated: new Date().toISOString()
            });

            // Add to stock history
            const historyEntry = {
                productId: selectedProduct.id,
                productName: selectedProduct.name || 'Unknown Product',
                type: adjustmentType,
                quantity: qty,
                previousStock: currentStock,
                newStock: newStock,
                reason: adjustmentReason || (adjustmentType === 'add' ? 'Stock added' : 'Stock removed'),
                date: new Date().toISOString(),
                user: 'Admin'
            };

            // In demo mode, just update local state
            setProducts(prev => prev.map(p =>
                p.id === selectedProduct.id ? { ...p, stock: newStock } : p
            ));

            setStockHistory(prev => [historyEntry, ...prev]);
            setShowAdjustModal(false);
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    const handleQuickUpdate = async (productId, change) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const currentStock = product.stock || 0;
        const newStock = Math.max(0, currentStock + change);

        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, stock: newStock } : p
        ));

        try {
            await update(ref(database, `products/${productId}`), {
                stock: newStock,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const productData = {
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                minStock: parseInt(formData.minStock) || 10,
                sku: formData.sku || `SKU-${Date.now()}`,
                image: formData.image || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Try to add to Firebase
            try {
                await push(ref(database, 'products'), productData);
            } catch (firebaseError) {
                // In demo mode, add to local state
                const newProduct = {
                    ...productData,
                    id: `demo-${Date.now()}`
                };
                setProducts(prev => [...prev, newProduct]);
            }

            handleCloseAddModal();
        } catch (error) {
            console.error('Error adding product:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setFormData({
            name: '',
            category: '',
            price: '',
            stock: '',
            minStock: '',
            sku: '',
            image: ''
        });
    };

    return (
        <div className="admin-stock">
            <div className="stock-header">
                <div>
                    <h1>Stock Management</h1>
                    <p>Monitor and manage your inventory levels</p>
                </div>
                <div className="header-actions">
                    <motion.button
                        className="add-product-btn"
                        onClick={() => setShowAddModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiPlus />
                        Add Product
                    </motion.button>
                    <motion.button
                        className="export-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiDownload />
                        Export Report
                    </motion.button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stock-stats">
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <div className="stat-icon blue">
                        <FiPackage />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalProducts}</span>
                        <span className="stat-label">Total Products</span>
                    </div>
                </motion.div>
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon green">
                        <FiTrendingUp />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalStock.toLocaleString()}</span>
                        <span className="stat-label">Total Stock Units</span>
                    </div>
                </motion.div>
                <motion.div
                    className="stat-card warning"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon orange">
                        <FiAlertTriangle />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.lowStock}</span>
                        <span className="stat-label">Low Stock Items</span>
                    </div>
                </motion.div>
                <motion.div
                    className="stat-card danger"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon red">
                        <FiAlertCircle />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.outOfStock}</span>
                        <span className="stat-label">Out of Stock</span>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="stock-filters">
                <div className="search-filter">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by product name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="status-filter">
                    <FiFilter className="filter-icon" />
                    <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                        <option value="all">All Stock Status</option>
                        <option value="in">In Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
            </div>

            {/* Stock Table */}
            <div className="stock-content">
                <div className="stock-table-container">
                    <h3>Inventory Overview</h3>
                    {loading ? (
                        <div className="loading-skeleton">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="skeleton-row skeleton"></div>
                            ))}
                        </div>
                    ) : (
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Min. Stock</th>
                                    <th>Status</th>
                                    <th>Quick Update</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product, index) => {
                                    const status = getStockStatus(product);
                                    return (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={status}
                                        >
                                            <td>
                                                <div className="product-cell">
                                                    <div className="product-image">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name || 'Product'} />
                                                        ) : (
                                                            <FiPackage />
                                                        )}
                                                    </div>
                                                    <span className="product-name">{product.name || 'Untitled'}</span>
                                                </div>
                                            </td>
                                            <td className="sku">{product.sku || '-'}</td>
                                            <td>{product.category || '-'}</td>
                                            <td>
                                                <span className={`stock-qty ${status}`}>
                                                    {product.stock || 0}
                                                </span>
                                            </td>
                                            <td>{product.minStock || 10}</td>
                                            <td>
                                                <span className={`status-badge ${status}`}>
                                                    {status === 'in-stock' && <FiCheckCircle />}
                                                    {status === 'low-stock' && <FiAlertTriangle />}
                                                    {status === 'out-of-stock' && <FiAlertCircle />}
                                                    {getStatusLabel(status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="quick-update">
                                                    <button
                                                        className="qty-btn minus"
                                                        onClick={() => handleQuickUpdate(product.id, -1)}
                                                        disabled={(product.stock || 0) === 0}
                                                    >
                                                        <FiMinus />
                                                    </button>
                                                    <span className="qty-value">{product.stock || 0}</span>
                                                    <button
                                                        className="qty-btn plus"
                                                        onClick={() => handleQuickUpdate(product.id, 1)}
                                                    >
                                                        <FiPlus />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className="adjust-btn"
                                                    onClick={() => handleAdjustStock(product)}
                                                >
                                                    <FiRefreshCw />
                                                    Adjust
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {!loading && filteredProducts.length === 0 && (
                        <div className="no-results">
                            <FiPackage className="no-results-icon" />
                            <p>No products found</p>
                        </div>
                    )}
                </div>

                {/* Stock History */}
                <div className="stock-history">
                    <h3>Recent Stock Changes</h3>
                    <div className="history-list">
                        {stockHistory.slice(0, 10).map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                className={`history-item ${entry.type}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className={`history-icon ${entry.type}`}>
                                    {entry.type === 'add' ? <FiTrendingUp /> : <FiTrendingDown />}
                                </div>
                                <div className="history-details">
                                    <span className="history-product">{entry.productName}</span>
                                    <span className="history-change">
                                        {entry.type === 'add' ? '+' : '-'}{entry.quantity} units
                                    </span>
                                    <span className="history-reason">{entry.reason}</span>
                                    <span className="history-date">
                                        {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Adjust Stock Modal */}
            <AnimatePresence>
                {showAdjustModal && selectedProduct && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAdjustModal(false)}
                    >
                        <motion.div
                            className="modal-content adjust-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Adjust Stock</h2>
                                <button className="close-btn" onClick={() => setShowAdjustModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="product-preview">
                                    <div className="preview-image">
                                        {selectedProduct.image ? (
                                            <img src={selectedProduct.image} alt={selectedProduct.name || 'Product'} />
                                        ) : (
                                            <FiPackage />
                                        )}
                                    </div>
                                    <div className="preview-info">
                                        <h4>{selectedProduct.name || 'Untitled Product'}</h4>
                                        <p>SKU: {selectedProduct.sku || '-'}</p>
                                        <p className="current-stock">Current Stock: <strong>{selectedProduct.stock || 0}</strong> units</p>
                                    </div>
                                </div>

                                <div className="adjustment-type">
                                    <button
                                        className={`type-btn ${adjustmentType === 'add' ? 'active' : ''}`}
                                        onClick={() => setAdjustmentType('add')}
                                    >
                                        <FiPlus />
                                        Add Stock
                                    </button>
                                    <button
                                        className={`type-btn ${adjustmentType === 'remove' ? 'active' : ''}`}
                                        onClick={() => setAdjustmentType('remove')}
                                    >
                                        <FiMinus />
                                        Remove Stock
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={adjustmentQty}
                                        onChange={(e) => setAdjustmentQty(e.target.value)}
                                        placeholder="Enter quantity"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Reason (Optional)</label>
                                    <select
                                        value={adjustmentReason}
                                        onChange={(e) => setAdjustmentReason(e.target.value)}
                                    >
                                        <option value="">Select a reason</option>
                                        {adjustmentType === 'add' ? (
                                            <>
                                                <option value="New shipment received">New shipment received</option>
                                                <option value="Supplier delivery">Supplier delivery</option>
                                                <option value="Stock correction">Stock correction</option>
                                                <option value="Return from customer">Return from customer</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Damaged items">Damaged items</option>
                                                <option value="Lost or stolen">Lost or stolen</option>
                                                <option value="Stock correction">Stock correction</option>
                                                <option value="Expired items">Expired items</option>
                                                <option value="Sample/Display">Sample/Display</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                {adjustmentQty && parseInt(adjustmentQty) > 0 && (
                                    <div className="stock-preview">
                                        <span>New Stock Level:</span>
                                        <span className="new-stock">
                                            {adjustmentType === 'add'
                                                ? (selectedProduct.stock || 0) + parseInt(adjustmentQty)
                                                : Math.max(0, (selectedProduct.stock || 0) - parseInt(adjustmentQty))}
                                            {' '}units
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={() => setShowAdjustModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn-submit"
                                    onClick={handleSaveAdjustment}
                                    disabled={!adjustmentQty || parseInt(adjustmentQty) <= 0}
                                >
                                    <FiCheck />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseAddModal}
                    >
                        <motion.div
                            className="modal-content add-product-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Add New Product</h2>
                                <button className="close-btn" onClick={handleCloseAddModal}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleAddProduct}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter product name"
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Category *</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>SKU</label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                placeholder="SKU-XXX"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price (₹) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Initial Stock *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Minimum Stock Level</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.minStock}
                                            onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                            placeholder="10"
                                        />
                                        <span className="form-hint">Alert will show when stock falls below this level</span>
                                    </div>
                                    <div className="form-group">
                                        <label>Product Image URL</label>
                                        <input
                                            type="url"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {formData.image && (
                                            <div className="image-preview">
                                                <img
                                                    src={formData.image}
                                                    alt="Preview"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                    onLoad={(e) => e.target.style.display = 'block'}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={handleCloseAddModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <span className="spinner"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck />
                                                Add Product
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Stock;
