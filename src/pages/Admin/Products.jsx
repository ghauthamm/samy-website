import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiMoreVertical,
    FiImage, FiX, FiCheck, FiUpload, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../config/firebase';
import './AdminProducts.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDemo, setIsDemo] = useState(false);
    const [notification, setNotification] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        sku: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const categories = ['Electronics', 'Clothing', 'Accessories', 'Home & Living', 'Sports', 'Beauty'];

    const demoProducts = [
        { id: '1', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2999, stock: 45, sku: 'SKU-001', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop', description: 'Premium wireless earbuds with active noise cancellation' },
        { id: '2', name: 'Smart Watch Elite', category: 'Electronics', price: 8999, stock: 23, sku: 'SKU-002', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', description: 'Advanced smartwatch with health monitoring' },
        { id: '3', name: 'Designer Handbag', category: 'Accessories', price: 4599, stock: 12, sku: 'SKU-003', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop', description: 'Elegant leather handbag for all occasions' },
        { id: '4', name: 'Premium Running Shoes', category: 'Sports', price: 3499, stock: 56, sku: 'SKU-004', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', description: 'Lightweight running shoes with superior cushioning' },
        { id: '5', name: 'Formal Cotton Shirt', category: 'Clothing', price: 1299, stock: 89, sku: 'SKU-005', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop', description: 'Premium cotton formal shirt for professional look' },
        { id: '6', name: 'LED Desk Lamp', category: 'Home & Living', price: 899, stock: 34, sku: 'SKU-006', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop', description: 'Adjustable LED desk lamp with touch controls' },
        { id: '7', name: 'Bluetooth Speaker', category: 'Electronics', price: 1599, stock: 34, sku: 'SKU-007', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', description: 'Portable bluetooth speaker with deep bass' },
        { id: '8', name: 'Leather Wallet', category: 'Accessories', price: 799, stock: 45, sku: 'SKU-008', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop', description: 'Genuine leather wallet with RFID protection' },
        { id: '9', name: 'Bluetooth Headphones', category: 'Electronics', price: 1999, stock: 50, sku: 'SKU-009', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', description: 'Over-ear headphones with premium sound quality' },
        { id: '10', name: 'Cotton T-Shirt', category: 'Clothing', price: 599, stock: 100, sku: 'SKU-010', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', description: 'Comfortable cotton t-shirt for daily wear' },
        { id: '11', name: 'Yoga Mat', category: 'Sports', price: 899, stock: 30, sku: 'SKU-011', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', description: 'Non-slip yoga mat with carrying strap' },
        { id: '12', name: 'Ceramic Vase', category: 'Home & Living', price: 1299, stock: 20, sku: 'SKU-012', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop', description: 'Elegant ceramic vase for home decor' },
        { id: '13', name: 'Lipstick Set', category: 'Beauty', price: 1499, stock: 65, sku: 'SKU-013', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', description: 'Premium lipstick set with 5 shades' },
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
                setIsDemo(false);
            } else {
                setProducts(demoProducts);
                setIsDemo(true);
            }
            setLoading(false);
        }, (error) => {
            console.error('Firebase error:', error);
            setProducts(demoProducts);
            setIsDemo(true);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let imageUrl = editingProduct?.image || '';

            // Handle image upload (for Firebase mode)
            if (imageFile && !isDemo) {
                try {
                    const imageRef = storageRef(storage, `products/${Date.now()}_${imageFile.name}`);
                    await uploadBytes(imageRef, imageFile);
                    imageUrl = await getDownloadURL(imageRef);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    // Use preview as fallback for demo
                    imageUrl = imagePreview || editingProduct?.image || '';
                }
            } else if (imagePreview) {
                imageUrl = imagePreview;
            }

            const productData = {
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                description: formData.description,
                sku: formData.sku,
                image: imageUrl,
                updatedAt: new Date().toISOString()
            };

            if (editingProduct) {
                // UPDATE operation
                if (isDemo) {
                    // Local update for demo mode
                    setProducts(prev => prev.map(p =>
                        p.id === editingProduct.id ? { ...p, ...productData } : p
                    ));
                } else {
                    await update(ref(database, `products/${editingProduct.id}`), productData);
                }
                showNotification('success', `Product "${productData.name}" updated successfully!`);
            } else {
                // CREATE operation
                productData.createdAt = new Date().toISOString();
                if (isDemo) {
                    // Local create for demo mode
                    const newProduct = {
                        ...productData,
                        id: `demo-${Date.now()}`
                    };
                    setProducts(prev => [...prev, newProduct]);
                } else {
                    await push(ref(database, 'products'), productData);
                }
                showNotification('success', `Product "${productData.name}" added successfully!`);
            }

            handleCloseModal();
        } catch (error) {
            console.error('Error saving product:', error);
            showNotification('error', 'Failed to save product. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            stock: product.stock.toString(),
            description: product.description || '',
            sku: product.sku || ''
        });
        setImagePreview(product.image || '');
        setShowModal(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        try {
            if (isDemo) {
                // Local delete for demo mode
                setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
            } else {
                await remove(ref(database, `products/${productToDelete.id}`));
            }
            showNotification('success', `Product "${productToDelete.name}" deleted successfully!`);
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('error', 'Failed to delete product. Please try again.');
        } finally {
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ name: '', category: '', price: '', stock: '', description: '', sku: '' });
        setImageFile(null);
        setImagePreview('');
    };

    const filteredProducts = products.filter(product => {
        const productName = product.name || '';
        const productSku = product.sku || '';
        const productCategory = product.category || '';
        const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            productSku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (stock) => {
        if (stock === 0) return 'out-of-stock';
        if (stock <= 10) return 'low-stock';
        return 'in-stock';
    };

    return (
        <div className="admin-products">
            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        className={`notification ${notification.type}`}
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                    >
                        {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="products-header">
                <div>
                    <h1>Products</h1>
                    <p>Manage your product inventory {isDemo && <span className="demo-badge">Demo Mode</span>}</p>
                </div>
                <motion.button
                    className="add-product-btn"
                    onClick={() => setShowModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FiPlus />
                    Add Product
                </motion.button>
            </div>

            <div className="products-filters">
                <div className="search-filter">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="category-filter">
                    <FiFilter className="filter-icon" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="products-stats">
                <div className="stat-item">
                    <span className="stat-number">{products.length}</span>
                    <span className="stat-label">Total Products</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{products.filter(p => (p.stock || 0) > 10).length}</span>
                    <span className="stat-label">In Stock</span>
                </div>
                <div className="stat-item warning">
                    <span className="stat-number">{products.filter(p => (p.stock || 0) <= 10 && (p.stock || 0) > 0).length}</span>
                    <span className="stat-label">Low Stock</span>
                </div>
                <div className="stat-item danger">
                    <span className="stat-number">{products.filter(p => (p.stock || 0) === 0).length}</span>
                    <span className="stat-label">Out of Stock</span>
                </div>
            </div>

            {loading ? (
                <div className="products-grid loading">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="product-card-skeleton skeleton"></div>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="no-products">
                    <FiImage className="no-products-icon" />
                    <h3>No Products Found</h3>
                    <p>Try adjusting your search or filters, or add a new product.</p>
                    <button className="add-product-btn" onClick={() => setShowModal(true)}>
                        <FiPlus /> Add Product
                    </button>
                </div>
            ) : (
                <motion.div
                    className="products-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            className="product-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="product-image">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} />
                                ) : (
                                    <FiImage className="placeholder-icon" />
                                )}
                                <span className={`stock-badge ${getStockStatus(product.stock || 0)}`}>
                                    {(product.stock || 0) === 0 ? 'Out of Stock' : (product.stock || 0) <= 10 ? 'Low Stock' : 'In Stock'}
                                </span>
                            </div>
                            <div className="product-info">
                                <span className="product-category">{product.category || 'Uncategorized'}</span>
                                <h3 className="product-name">{product.name || 'Untitled Product'}</h3>
                                <div className="product-meta">
                                    <span className="product-price">₹{(product.price || 0).toLocaleString()}</span>
                                    <span className="product-stock">{product.stock || 0} units</span>
                                </div>
                                {product.sku && <span className="product-sku">{product.sku}</span>}
                            </div>
                            <div className="product-actions">
                                <button className="action-btn edit" onClick={() => handleEdit(product)} title="Edit Product">
                                    <FiEdit2 />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDeleteClick(product)} title="Delete Product">
                                    <FiTrash2 />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Add/Edit Product Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                <button className="close-btn" onClick={handleCloseModal}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="product-form">
                                <div className="form-grid">
                                    <div className="image-upload">
                                        <label className="upload-area">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" />
                                            ) : (
                                                <>
                                                    <FiUpload className="upload-icon" />
                                                    <span>Upload Image</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <div className="form-fields">
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
                                                <label>Stock Quantity *</label>
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
                                            <label>Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                                placeholder="Enter product description..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <span className="spinner"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck />
                                                {editingProduct ? 'Update Product' : 'Add Product'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && productToDelete && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            className="modal-content delete-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="delete-modal-content">
                                <div className="delete-icon">
                                    <FiTrash2 />
                                </div>
                                <h3>Delete Product</h3>
                                <p>Are you sure you want to delete <strong>"{productToDelete.name}"</strong>?</p>
                                <p className="warning-text">This action cannot be undone.</p>
                                <div className="delete-modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn-delete" onClick={handleDeleteConfirm}>
                                        <FiTrash2 />
                                        Delete Product
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;
