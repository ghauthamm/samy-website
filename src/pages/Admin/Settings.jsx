import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiSave, FiUpload, FiMail, FiPhone, FiMapPin, FiGlobe,
    FiDollarSign, FiPercent, FiBell, FiLock, FiUser, FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './Settings.css';

const Settings = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [saved, setSaved] = useState(false);

    const [generalSettings, setGeneralSettings] = useState({
        shopName: 'SAMY TRENDS',
        email: 'contact@samytrends.com',
        phone: '+91 98765 43210',
        address: '123 Shopping Street, Bangalore, Karnataka 560001',
        website: 'www.samytrends.com',
        description: 'Your one-stop shop for quality products'
    });

    const [paymentSettings, setPaymentSettings] = useState({
        currency: 'INR',
        taxRate: 18,
        allowCash: true,
        allowCard: true,
        allowUPI: true,
        bankName: 'HDFC Bank',
        accountNumber: 'XXXX XXXX XXXX 1234',
        ifscCode: 'HDFC0001234',
        upiId: 'samytrends@upi'
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        orderAlerts: true,
        lowStockAlerts: true,
        newCustomerAlerts: true,
        dailyReports: true
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        ipWhitelist: ''
    });

    const tabs = [
        { id: 'general', label: 'General', icon: FiSettings },
        { id: 'payment', label: 'Payment', icon: FiDollarSign },
        { id: 'notifications', label: 'Notifications', icon: FiBell },
        { id: 'security', label: 'Security', icon: FiLock }
    ];

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        alert('Settings saved successfully!');
    };

    return (
        <div className="admin-settings">
            <div className="settings-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your store configuration</p>
                </div>
                <motion.button
                    className="save-btn"
                    onClick={handleSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FiSave />
                    {saved ? 'Saved!' : 'Save Changes'}
                </motion.button>
            </div>

            <div className="settings-container">
                {/* Sidebar */}
                <div className="settings-sidebar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="settings-content">
                    {activeTab === 'general' && (
                        <motion.div
                            className="settings-section"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="section-header">
                                <h2>General Settings</h2>
                                <p>Basic information about your store</p>
                            </div>

                            <div className="settings-form">
                                <div className="form-group">
                                    <label>Shop Name</label>
                                    <input
                                        type="text"
                                        value={generalSettings.shopName}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, shopName: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            <FiMail />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={generalSettings.email}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            <FiPhone />
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={generalSettings.phone}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <FiMapPin />
                                        Address
                                    </label>
                                    <textarea
                                        value={generalSettings.address}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <FiGlobe />
                                        Website
                                    </label>
                                    <input
                                        type="text"
                                        value={generalSettings.website}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, website: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={generalSettings.description}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Logo</label>
                                    <div className="file-upload">
                                        <button className="upload-btn">
                                            <FiUpload />
                                            Upload Logo
                                        </button>
                                        <span className="file-info">Recommended size: 200x200px</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'payment' && (
                        <motion.div
                            className="settings-section"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="section-header">
                                <h2>Payment Settings</h2>
                                <p>Configure payment methods and tax settings</p>
                            </div>

                            <div className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Currency</label>
                                        <select
                                            value={paymentSettings.currency}
                                            onChange={(e) => setPaymentSettings({ ...paymentSettings, currency: e.target.value })}
                                        >
                                            <option value="INR">INR - Indian Rupee (₹)</option>
                                            <option value="USD">USD - US Dollar ($)</option>
                                            <option value="EUR">EUR - Euro (€)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            <FiPercent />
                                            Tax Rate (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={paymentSettings.taxRate}
                                            onChange={(e) => setPaymentSettings({ ...paymentSettings, taxRate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="settings-group">
                                    <h3>Payment Methods</h3>
                                    <div className="toggle-options">
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.allowCash}
                                                onChange={(e) => setPaymentSettings({ ...paymentSettings, allowCash: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>Accept Cash</span>
                                        </label>
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.allowCard}
                                                onChange={(e) => setPaymentSettings({ ...paymentSettings, allowCard: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>Accept Card</span>
                                        </label>
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.allowUPI}
                                                onChange={(e) => setPaymentSettings({ ...paymentSettings, allowUPI: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>Accept UPI</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-group">
                                    <h3>Bank Details</h3>
                                    <div className="form-group">
                                        <label>Bank Name</label>
                                        <input
                                            type="text"
                                            value={paymentSettings.bankName}
                                            onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Account Number</label>
                                            <input
                                                type="text"
                                                value={paymentSettings.accountNumber}
                                                onChange={(e) => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>IFSC Code</label>
                                            <input
                                                type="text"
                                                value={paymentSettings.ifscCode}
                                                onChange={(e) => setPaymentSettings({ ...paymentSettings, ifscCode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>UPI ID</label>
                                        <input
                                            type="text"
                                            value={paymentSettings.upiId}
                                            onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            className="settings-section"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="section-header">
                                <h2>Notification Settings</h2>
                                <p>Manage how you receive notifications</p>
                            </div>

                            <div className="settings-form">
                                <div className="settings-group">
                                    <h3>Communication Preferences</h3>
                                    <div className="toggle-options">
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.emailNotifications}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>Email Notifications</span>
                                        </label>
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.smsNotifications}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>SMS Notifications</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-group">
                                    <h3>Alert Preferences</h3>
                                    <div className="toggle-options">
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.orderAlerts}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, orderAlerts: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>New Order Alerts</span>
                                        </label>
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.lowStockAlerts}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>Low Stock Alerts</span>
                                        </label>
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.newCustomerAlerts}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, newCustomerAlerts: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>New Customer Alerts</span>
                                        </label>
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.dailyReports}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, dailyReports: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>Daily Reports</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            className="settings-section"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="section-header">
                                <h2>Security Settings</h2>
                                <p>Keep your account secure</p>
                            </div>

                            <div className="settings-form">
                                <div className="settings-group">
                                    <h3>Account Security</h3>
                                    <div className="toggle-options">
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={securitySettings.twoFactorAuth}
                                                onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span>Enable Two-Factor Authentication</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Session Timeout (minutes)</label>
                                        <input
                                            type="number"
                                            value={securitySettings.sessionTimeout}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password Expiry (days)</label>
                                        <input
                                            type="number"
                                            value={securitySettings.passwordExpiry}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Change Password</label>
                                    <button className="secondary-btn">
                                        <FiLock />
                                        Update Password
                                    </button>
                                </div>

                                <div className="info-card">
                                    <FiUser />
                                    <div>
                                        <strong>Current User</strong>
                                        <p>{currentUser?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
