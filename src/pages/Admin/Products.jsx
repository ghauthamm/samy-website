import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiMoreVertical,
    FiImage, FiX, FiCheck, FiUpload
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
                // Demo products for display
                setProducts([
                    { id: '1', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2999, stock: 45, sku: 'SKU-001', image: '' },
                    { id: '2', name: 'Smart Watch Elite', category: 'Electronics', price: 8999, stock: 23, sku: 'SKU-002', image: '' },
                    { id: '3', name: 'Designer Handbag', category: 'Accessories', price: 4599, stock: 12, sku: 'SKU-003', image: '' },
                    { id: '4', name: 'Premium Running Shoes', category: 'Sports', price: 3499, stock: 56, sku: 'SKU-004', image: '' },
                    { id: '5', name: 'Formal Cotton Shirt', category: 'Clothing', price: 1299, stock: 89, sku: 'SKU-005', image: '' },
                    { id: '6', name: 'LED Desk Lamp', category: 'Home & Living', price: 899, stock: 34, sku: 'SKU-006', image: '' },
                ]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
        let imageUrl = editingProduct?.image || '';

        if (imageFile) {
            const imageRef = storageRef(storage, `products/${Date.now()}_${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(imageRef);
        }

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            image: imageUrl,
            updatedAt: new Date().toISOString()
        };

        if (editingProduct) {
            await update(ref(database, `products/${editingProduct.id}`), productData);
        } else {
            productData.createdAt = new Date().toISOString();
            await push(ref(database, 'products'), productData);
        }

        handleCloseModal();
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

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await remove(ref(database, `products/${productId}`));
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
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (stock) => {
        if (stock === 0) return 'out-of-stock';
        if (stock <= 10) return 'low-stock';
        return 'in-stock';
    };

    return (
        <div className="admin-products">
            <div className="products-header">
                <div>
                    <h1>Products</h1>
                    <p>Manage your product inventory</p>
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
                        placeholder="Search products..."
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
                    <span className="stat-number">{products.filter(p => p.stock > 10).length}</span>
                    <span className="stat-label">In Stock</span>
                </div>
                <div className="stat-item warning">
                    <span className="stat-number">{products.filter(p => p.stock <= 10 && p.stock > 0).length}</span>
                    <span className="stat-label">Low Stock</span>
                </div>
                <div className="stat-item danger">
                    <span className="stat-number">{products.filter(p => p.stock === 0).length}</span>
                    <span className="stat-label">Out of Stock</span>
                </div>
            </div>

            {loading ? (
                <div className="products-grid loading">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="product-card-skeleton skeleton"></div>
                    ))}
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
                                <span className={`stock-badge ${getStockStatus(product.stock)}`}>
                                    {product.stock === 0 ? 'Out of Stock' : product.stock <= 10 ? 'Low Stock' : 'In Stock'}
                                </span>
                            </div>
                            <div className="product-info">
                                <span className="product-category">{product.category}</span>
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-meta">
                                    <span className="product-price">₹{product.price.toLocaleString()}</span>
                                    <span className="product-stock">{product.stock} units</span>
                                </div>
                                <span className="product-sku">{product.sku}</span>
                            </div>
                            <div className="product-actions">
                                <button className="action-btn edit" onClick={() => handleEdit(product)}>
                                    <FiEdit2 />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(product.id)}>
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
                                            <label>Product Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Category</label>
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
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Stock Quantity</label>
                                                <input
                                                    type="number"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        <FiCheck />
                                        {editingProduct ? 'Update Product' : 'Add Product'}
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

export default Products;
