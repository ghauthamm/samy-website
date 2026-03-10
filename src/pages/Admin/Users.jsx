import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiFilter, FiUserPlus, FiEdit2, FiTrash2, FiMail,
    FiPhone, FiMapPin, FiShield, FiUser, FiX, FiCheck
} from 'react-icons/fi';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import './Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        address: '',
        status: 'active'
    });

    useEffect(() => {
        let loaded = 0;
        const checkDone = () => { loaded++; if (loaded >= 2) setLoading(false); };

        const unsub1 = onValue(ref(database, 'users'), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userList = Object.entries(data).map(([id, user]) => ({
                    id,
                    ...user
                }));
                setUsers(userList);
            } else {
                setUsers([]);
            }
            checkDone();
        }, () => checkDone());

        const unsub2 = onValue(ref(database, 'orders'), (snapshot) => {
            const data = snapshot.val();
            setOrders(data ? Object.entries(data).map(([id, o]) => ({ id, ...o })) : []);
            checkDone();
        }, () => checkDone());

        return () => { unsub1(); unsub2(); };
    }, []);

    // Compute per-user order stats from real orders
    const userOrderStats = useMemo(() => {
        const map = {};
        orders.forEach(o => {
            const uid = o.userId;
            if (!uid) return;
            if (!map[uid]) map[uid] = { totalOrders: 0, totalSpent: 0 };
            map[uid].totalOrders += 1;
            map[uid].totalSpent += (o.totalAmount || o.total || o.amount || 0);
        });
        return map;
    }, [orders]);

    // Enrich users with computed order stats
    const enrichedUsers = useMemo(() =>
        users.map(u => ({
            ...u,
            totalOrders: userOrderStats[u.id]?.totalOrders || 0,
            totalSpent: userOrderStats[u.id]?.totalSpent || 0
        })),
        [users, userOrderStats]
    );

    const filteredUsers = enrichedUsers.filter(user => {
        const matchesSearch =
            (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.phone && user.phone.includes(searchQuery));
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userData = {
            ...formData,
            updatedAt: new Date().toISOString()
        };

        if (editingUser) {
            await update(ref(database, `users/${editingUser.id}`), userData);
        } else {
            userData.createdAt = new Date().toISOString();
            userData.totalOrders = 0;
            userData.totalSpent = 0;
            await push(ref(database, 'users'), userData);
        }

        handleCloseModal();
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            address: user.address || '',
            status: user.status || 'active'
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await remove(ref(database, `users/${userId}`));
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'user',
            address: '',
            status: 'active'
        });
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'danger';
            case 'cashier': return 'warning';
            case 'user': return 'primary';
            default: return 'default';
        }
    };

    const activeUsers = enrichedUsers.filter(u => u.status !== 'inactive').length;
    const stats = [
        { label: 'Total Users', value: enrichedUsers.length, color: 'blue' },
        { label: 'Active', value: activeUsers, color: 'green' },
        { label: 'Admins', value: enrichedUsers.filter(u => u.role === 'admin').length, color: 'red' },
        { label: 'Customers', value: enrichedUsers.filter(u => u.role === 'user').length, color: 'orange' }
    ];

    return (
        <div className="admin-users">
            <div className="users-header">
                <div>
                    <h1>Users</h1>
                    <p>Manage user accounts and permissions</p>
                </div>
                <motion.button
                    className="add-user-btn"
                    onClick={() => setShowModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FiUserPlus />
                    Add User
                </motion.button>
            </div>

            <div className="users-stats">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className={`stat-item ${stat.color}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value">{stat.value}</span>
                    </motion.div>
                ))}
            </div>

            <div className="users-filters">
                <div className="search-filter">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="role-filter">
                    <FiFilter className="filter-icon" />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="cashier">Cashier</option>
                        <option value="user">Customer</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-skeleton">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton-row skeleton"></div>
                    ))}
                </div>
            ) : (
                <div className="users-grid">
                    {filteredUsers.map((user, index) => (
                        <motion.div
                            key={user.id}
                            className="user-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="user-card-header">
                                <div className="user-avatar">
                                    <FiUser />
                                </div>
                                <span className={`role-badge ${getRoleBadgeColor(user.role)}`}>
                                    <FiShield />
                                    {user.role}
                                </span>
                            </div>
                            <div className="user-card-body">
                                <h3>{user.name}</h3>
                                <div className="user-details">
                                    <div className="detail-item">
                                        <FiMail />
                                        <span>{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="detail-item">
                                            <FiPhone />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                    {user.address && (
                                        <div className="detail-item">
                                            <FiMapPin />
                                            <span>{user.address}</span>
                                        </div>
                                    )}
                                </div>
                                {user.role === 'user' && (
                                    <div className="user-stats">
                                        <div className="user-stat">
                                            <span className="stat-label">Orders</span>
                                            <span className="stat-value">{user.totalOrders || 0}</span>
                                        </div>
                                        <div className="user-stat">
                                            <span className="stat-label">Spent</span>
                                            <span className="stat-value">₹{(user.totalSpent || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="user-card-footer">
                                <button className="action-btn edit" onClick={() => handleEdit(user)}>
                                    <FiEdit2 />
                                    Edit
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(user.id)}>
                                    <FiTrash2 />
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="no-results">
                            <p>No users found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit User Modal */}
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
                            className="modal-content user-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                                <button className="close-btn" onClick={handleCloseModal}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="user-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            required
                                        >
                                            <option value="user">Customer</option>
                                            <option value="cashier">Cashier</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        <FiCheck />
                                        {editingUser ? 'Update User' : 'Add User'}
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

export default Users;
