import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiCheck,
    FiAlertCircle, FiCheckCircle, FiTool, FiCalendar, FiDollarSign
} from 'react-icons/fi';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import './Maintenance.css';

const Maintenance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [notification, setNotification] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '', category: '', description: '', priority: 'medium',
        status: 'pending', cost: '', assignedTo: '', scheduledDate: '', completedDate: ''
    });

    const categories = ['Equipment', 'Electrical', 'Plumbing', 'Cleaning', 'IT/Network', 'Furniture', 'HVAC', 'Other'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];

    useEffect(() => {
        const mRef = ref(database, 'maintenance');
        const unsubscribe = onValue(mRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([id, rec]) => ({ id, ...rec }));
                list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                setRecords(list);
            } else {
                setRecords([]);
            }
            setLoading(false);
        }, () => { setRecords([]); setLoading(false); });
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
            const recData = {
                ...formData,
                cost: parseFloat(formData.cost) || 0,
                updatedAt: new Date().toISOString()
            };
            if (editingRecord) {
                await update(ref(database, `maintenance/${editingRecord.id}`), recData);
                showNotif('success', `Record "${recData.title}" updated!`);
            } else {
                recData.createdAt = new Date().toISOString();
                await push(ref(database, 'maintenance'), recData);
                showNotif('success', `Record "${recData.title}" added!`);
            }
            handleCloseModal();
        } catch {
            showNotif('error', 'Failed to save record.');
        } finally { setSaving(false); }
    };

    const handleEdit = (rec) => {
        setEditingRecord(rec);
        setFormData({
            title: rec.title || '', category: rec.category || '', description: rec.description || '',
            priority: rec.priority || 'medium', status: rec.status || 'pending',
            cost: rec.cost?.toString() || '', assignedTo: rec.assignedTo || '',
            scheduledDate: rec.scheduledDate || '', completedDate: rec.completedDate || ''
        });
        setShowModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;
        try {
            await remove(ref(database, `maintenance/${recordToDelete.id}`));
            showNotif('success', `Record "${recordToDelete.title}" deleted!`);
        } catch {
            showNotif('error', 'Failed to delete record.');
        } finally { setShowDeleteModal(false); setRecordToDelete(null); }
    };

    const handleCloseModal = () => {
        setShowModal(false); setEditingRecord(null);
        setFormData({ title: '', category: '', description: '', priority: 'medium', status: 'pending', cost: '', assignedTo: '', scheduledDate: '', completedDate: '' });
    };

    const filtered = records.filter(rec => {
        const matchesSearch = (rec.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (rec.category || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || rec.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getPriorityColor = (p) => {
        switch(p) { case 'urgent': return '#dc2626'; case 'high': return '#f59e0b'; case 'medium': return '#3b82f6'; default: return '#22c55e'; }
    };

    const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

    return (
        <div className="admin-maintenance">
            <AnimatePresence>
                {notification && (
                    <motion.div className={`maint-notification ${notification.type}`}
                        initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }}>
                        {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="maint-header">
                <div>
                    <h1>Maintenance</h1>
                    <p>Track repairs, upkeep and maintenance tasks</p>
                </div>
                <motion.button className="maint-add-btn" onClick={() => setShowModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <FiPlus /> Add Record
                </motion.button>
            </div>

            <div className="maint-filters">
                <div className="maint-search">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search maintenance records..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
            </div>

            <div className="maint-stats">
                <div className="maint-stat"><span className="maint-stat-num">{records.length}</span><span className="maint-stat-label">Total Records</span></div>
                <div className="maint-stat"><span className="maint-stat-num">{records.filter(r => r.status === 'pending').length}</span><span className="maint-stat-label">Pending</span></div>
                <div className="maint-stat warning"><span className="maint-stat-num">{records.filter(r => r.status === 'in-progress').length}</span><span className="maint-stat-label">In Progress</span></div>
                <div className="maint-stat success"><span className="maint-stat-num">{records.filter(r => r.status === 'completed').length}</span><span className="maint-stat-label">Completed</span></div>
                <div className="maint-stat"><span className="maint-stat-num">₹{totalCost.toLocaleString()}</span><span className="maint-stat-label">Total Cost</span></div>
            </div>

            {loading ? (
                <div className="maint-list loading">{[1,2,3].map(i => <div key={i} className="maint-row-skeleton skeleton"></div>)}</div>
            ) : filtered.length === 0 ? (
                <div className="maint-empty"><FiTool className="maint-empty-icon" /><h3>No Maintenance Records</h3><p>Add your first maintenance record to get started.</p></div>
            ) : (
                <motion.div className="maint-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="maint-table-header">
                        <span>Title</span><span>Category</span><span>Priority</span><span>Status</span><span>Cost</span><span>Date</span><span>Actions</span>
                    </div>
                    {filtered.map((rec, i) => (
                        <motion.div key={rec.id} className="maint-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                            <div className="maint-cell title-cell">
                                <FiTool className="maint-row-icon" />
                                <div>
                                    <span className="maint-title">{rec.title}</span>
                                    {rec.assignedTo && <span className="maint-assigned">Assigned: {rec.assignedTo}</span>}
                                </div>
                            </div>
                            <div className="maint-cell"><span className="maint-category-badge">{rec.category || 'N/A'}</span></div>
                            <div className="maint-cell"><span className="maint-priority-badge" style={{ background: `${getPriorityColor(rec.priority)}15`, color: getPriorityColor(rec.priority) }}>{rec.priority || 'medium'}</span></div>
                            <div className="maint-cell"><span className={`maint-status-badge ${rec.status || 'pending'}`}>{rec.status || 'pending'}</span></div>
                            <div className="maint-cell"><span className="maint-cost">₹{(rec.cost || 0).toLocaleString()}</span></div>
                            <div className="maint-cell"><span className="maint-date">{rec.scheduledDate || 'N/A'}</span></div>
                            <div className="maint-cell actions-cell">
                                <button className="maint-action edit" onClick={() => handleEdit(rec)}><FiEdit2 /></button>
                                <button className="maint-action delete" onClick={() => { setRecordToDelete(rec); setShowDeleteModal(true); }}><FiTrash2 /></button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="maint-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal}>
                        <motion.div className="maint-modal" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
                            <div className="maint-modal-header">
                                <h2>{editingRecord ? 'Edit Record' : 'Add Maintenance Record'}</h2>
                                <button className="maint-close-btn" onClick={handleCloseModal}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="maint-form">
                                <div className="maint-form-grid">
                                    <div className="maint-form-group">
                                        <label>Title *</label>
                                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. AC Unit Repair" required />
                                    </div>
                                    <div className="maint-form-group">
                                        <label>Category *</label>
                                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="maint-form-group">
                                        <label>Priority</label>
                                        <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                            {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div className="maint-form-group">
                                        <label>Status</label>
                                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                            {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div className="maint-form-group">
                                        <label>Cost (₹)</label>
                                        <input type="number" min="0" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} placeholder="0" />
                                    </div>
                                    <div className="maint-form-group">
                                        <label>Assigned To</label>
                                        <input type="text" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} placeholder="Person/Vendor name" />
                                    </div>
                                    <div className="maint-form-group">
                                        <label>Scheduled Date</label>
                                        <input type="date" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} />
                                    </div>
                                    <div className="maint-form-group">
                                        <label>Completed Date</label>
                                        <input type="date" value={formData.completedDate} onChange={e => setFormData({...formData, completedDate: e.target.value})} />
                                    </div>
                                    <div className="maint-form-group full-width">
                                        <label>Description</label>
                                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Describe the maintenance task..." />
                                    </div>
                                </div>
                                <div className="maint-modal-footer">
                                    <button type="button" className="maint-btn-cancel" onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" className="maint-btn-submit" disabled={saving}>
                                        {saving ? <><span className="spinner"></span>Saving...</> : <><FiCheck />{editingRecord ? 'Update' : 'Add Record'}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && recordToDelete && (
                    <motion.div className="maint-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)}>
                        <motion.div className="maint-modal maint-delete-modal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="maint-delete-content">
                                <div className="maint-delete-icon"><FiTrash2 /></div>
                                <h3>Delete Record</h3>
                                <p>Are you sure you want to delete <strong>"{recordToDelete.title}"</strong>?</p>
                                <p className="warning-text">This action cannot be undone.</p>
                                <div className="maint-delete-actions">
                                    <button className="maint-btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                    <button className="maint-btn-delete" onClick={handleDeleteConfirm}><FiTrash2 /> Delete</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Maintenance;
