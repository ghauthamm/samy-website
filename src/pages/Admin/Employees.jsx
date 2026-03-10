import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiCheck,
    FiAlertCircle, FiCheckCircle, FiUser, FiPhone, FiMail, FiBriefcase
} from 'react-icons/fi';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import './Employees.css';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [notification, setNotification] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', department: '', designation: '',
        salary: '', joinDate: '', address: '', status: 'active'
    });

    const departments = ['Sales', 'Inventory', 'Delivery', 'Marketing', 'Finance', 'Support'];

    useEffect(() => {
        const empRef = ref(database, 'employees');
        const unsubscribe = onValue(empRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([id, emp]) => ({ id, ...emp }));
                setEmployees(list);
            } else {
                setEmployees([]);
            }
            setLoading(false);
        }, () => { setEmployees([]); setLoading(false); });
        return () => unsubscribe();
    }, []);

    const showNotif = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const empData = {
                ...formData,
                salary: parseFloat(formData.salary) || 0,
                updatedAt: new Date().toISOString()
            };
            if (editingEmployee) {
                await update(ref(database, `employees/${editingEmployee.id}`), empData);
                showNotif('success', `Employee "${empData.name}" updated!`);
            } else {
                empData.createdAt = new Date().toISOString();
                await push(ref(database, 'employees'), empData);
                showNotif('success', `Employee "${empData.name}" added!`);
            }
            handleCloseModal();
        } catch {
            showNotif('error', 'Failed to save employee.');
        } finally { setSaving(false); }
    };

    const handleEdit = (emp) => {
        setEditingEmployee(emp);
        setFormData({
            name: emp.name || '', email: emp.email || '', phone: emp.phone || '',
            department: emp.department || '', designation: emp.designation || '',
            salary: emp.salary?.toString() || '', joinDate: emp.joinDate || '',
            address: emp.address || '', status: emp.status || 'active'
        });
        setShowModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!employeeToDelete) return;
        try {
            await remove(ref(database, `employees/${employeeToDelete.id}`));
            showNotif('success', `Employee "${employeeToDelete.name}" deleted!`);
        } catch {
            showNotif('error', 'Failed to delete employee.');
        } finally { setShowDeleteModal(false); setEmployeeToDelete(null); }
    };

    const handleCloseModal = () => {
        setShowModal(false); setEditingEmployee(null);
        setFormData({ name: '', email: '', phone: '', department: '', designation: '', salary: '', joinDate: '', address: '', status: 'active' });
    };

    const filtered = employees.filter(emp => {
        const matchesSearch = (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="admin-employees">
            <AnimatePresence>
                {notification && (
                    <motion.div className={`emp-notification ${notification.type}`}
                        initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }}>
                        {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="emp-header">
                <div>
                    <h1>Employees</h1>
                    <p>Manage employee details and records</p>
                </div>
                <motion.button className="emp-add-btn" onClick={() => setShowModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <FiPlus /> Add Employee
                </motion.button>
            </div>

            <div className="emp-filters">
                <div className="emp-search">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                    <option value="all">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            <div className="emp-stats">
                <div className="emp-stat"><span className="emp-stat-num">{employees.length}</span><span className="emp-stat-label">Total</span></div>
                <div className="emp-stat"><span className="emp-stat-num">{employees.filter(e => e.status === 'active').length}</span><span className="emp-stat-label">Active</span></div>
                <div className="emp-stat warning"><span className="emp-stat-num">{employees.filter(e => e.status === 'inactive').length}</span><span className="emp-stat-label">Inactive</span></div>
            </div>

            {loading ? (
                <div className="emp-grid loading">{[1,2,3].map(i => <div key={i} className="emp-card-skeleton skeleton"></div>)}</div>
            ) : filtered.length === 0 ? (
                <div className="emp-empty"><FiUser className="emp-empty-icon" /><h3>No Employees Found</h3><p>Add your first employee to get started.</p></div>
            ) : (
                <motion.div className="emp-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {filtered.map((emp, i) => (
                        <motion.div key={emp.id} className="emp-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="emp-card-header">
                                <div className="emp-avatar">{(emp.name || 'E').charAt(0).toUpperCase()}</div>
                                <span className={`emp-status-badge ${emp.status || 'active'}`}>{emp.status || 'active'}</span>
                            </div>
                            <div className="emp-card-body">
                                <h3>{emp.name}</h3>
                                <span className="emp-designation">{emp.designation || 'N/A'}</span>
                                <div className="emp-detail"><FiBriefcase /><span>{emp.department || 'N/A'}</span></div>
                                <div className="emp-detail"><FiMail /><span>{emp.email || 'N/A'}</span></div>
                                <div className="emp-detail"><FiPhone /><span>{emp.phone || 'N/A'}</span></div>
                                <div className="emp-salary">₹{(emp.salary || 0).toLocaleString()}/mo</div>
                            </div>
                            <div className="emp-card-actions">
                                <button className="emp-action-btn edit" onClick={() => handleEdit(emp)}><FiEdit2 /><span>Edit</span></button>
                                <button className="emp-action-btn delete" onClick={() => { setEmployeeToDelete(emp); setShowDeleteModal(true); }}><FiTrash2 /><span>Delete</span></button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="emp-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal}>
                        <motion.div className="emp-modal" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
                            <div className="emp-modal-header">
                                <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                                <button className="emp-close-btn" onClick={handleCloseModal}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="emp-form">
                                <div className="emp-form-grid">
                                    <div className="emp-form-group">
                                        <label>Full Name *</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter full name" required />
                                    </div>
                                    <div className="emp-form-group">
                                        <label>Email *</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="employee@email.com" required />
                                    </div>
                                    <div className="emp-form-group">
                                        <label>Phone *</label>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXXXXXXX" required />
                                    </div>
                                    <div className="emp-form-group">
                                        <label>Department *</label>
                                        <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required>
                                            <option value="">Select Department</option>
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="emp-form-group">
                                        <label>Designation *</label>
                                        <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Store Manager" required />
                                    </div>
                                    <div className="emp-form-group">
                                        <label>Salary (₹/month) *</label>
                                        <input type="number" min="0" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="0" required />
                                    </div>
                                    <div className="emp-form-group">
                                        <label>Join Date *</label>
                                        <input type="date" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} required />
                                    </div>
                                    <div className="emp-form-group">
                                        <label>Status</label>
                                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="emp-form-group full-width">
                                        <label>Address</label>
                                        <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} placeholder="Enter address" />
                                    </div>
                                </div>
                                <div className="emp-modal-footer">
                                    <button type="button" className="emp-btn-cancel" onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" className="emp-btn-submit" disabled={saving}>
                                        {saving ? <><span className="spinner"></span>Saving...</> : <><FiCheck />{editingEmployee ? 'Update' : 'Add Employee'}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && employeeToDelete && (
                    <motion.div className="emp-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)}>
                        <motion.div className="emp-modal emp-delete-modal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="emp-delete-content">
                                <div className="emp-delete-icon"><FiTrash2 /></div>
                                <h3>Delete Employee</h3>
                                <p>Are you sure you want to delete <strong>"{employeeToDelete.name}"</strong>?</p>
                                <p className="warning-text">This action cannot be undone.</p>
                                <div className="emp-delete-actions">
                                    <button className="emp-btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                    <button className="emp-btn-delete" onClick={handleDeleteConfirm}><FiTrash2 /> Delete</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Employees;
