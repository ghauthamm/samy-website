import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FiDownload, FiCalendar, FiFileText, FiTrendingUp,
    FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiAlertTriangle
} from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import './Reports.css';

const Reports = () => {
    const [dateRange, setDateRange] = useState('month');
    const [reportType, setReportType] = useState('sales');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let loaded = 0;
        const checkDone = () => { loaded++; if (loaded >= 3) setLoading(false); };

        const unsub1 = onValue(ref(database, 'orders'), (snap) => {
            const data = snap.val();
            setOrders(data ? Object.entries(data).map(([id, o]) => ({ id, ...o })) : []);
            checkDone();
        }, () => checkDone());

        const unsub2 = onValue(ref(database, 'products'), (snap) => {
            const data = snap.val();
            setProducts(data ? Object.entries(data).map(([id, p]) => ({ id, ...p })) : []);
            checkDone();
        }, () => checkDone());

        const unsub3 = onValue(ref(database, 'users'), (snap) => {
            const data = snap.val();
            setUsers(data ? Object.entries(data).map(([id, u]) => ({ id, ...u })) : []);
            checkDone();
        }, () => checkDone());

        return () => { unsub1(); unsub2(); unsub3(); };
    }, []);

    const getOrderTotal = (o) => o.totalAmount || o.total || o.amount || 0;

    // Period cutoff
    const periodStart = useMemo(() => {
        const now = new Date();
        const days = { week: 7, month: 30, quarter: 90, year: 365 };
        return new Date(now.getTime() - (days[dateRange] || 30) * 86400000);
    }, [dateRange]);

    const filteredOrders = useMemo(() =>
        orders.filter(o => new Date(o.createdAt || o.date || 0) >= periodStart),
        [orders, periodStart]
    );

    // ========== SALES REPORT ==========
    const salesReport = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((s, o) => s + getOrderTotal(o), 0);
        const totalOrders = filteredOrders.length;
        const uniqueCustomers = new Set(filteredOrders.map(o => o.userId || o.customerDetails?.email || 'anon')).size;
        const productsSold = filteredOrders.reduce((s, o) => s + (o.items ? o.items.reduce((q, i) => q + (i.quantity || 1), 0) : 0), 0);

        const summary = [
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'green' },
            { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: FiShoppingCart, color: 'blue' },
            { label: 'Customers', value: uniqueCustomers.toLocaleString(), icon: FiUsers, color: 'purple' },
            { label: 'Products Sold', value: productsSold.toLocaleString(), icon: FiPackage, color: 'orange' }
        ];

        // Weekly buckets for chart
        const days = { week: 7, month: 30, quarter: 90, year: 365 };
        const span = days[dateRange] || 30;
        const bucketSize = span <= 7 ? 1 : span <= 30 ? 7 : span <= 90 ? 14 : 30;
        const now = new Date();
        const buckets = [];
        for (let i = Math.ceil(span / bucketSize) - 1; i >= 0; i--) {
            const start = new Date(now.getTime() - (i + 1) * bucketSize * 86400000);
            const end = new Date(now.getTime() - i * bucketSize * 86400000);
            const label = bucketSize === 1
                ? start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
            const bucketOrders = filteredOrders.filter(o => {
                const d = new Date(o.createdAt || o.date || 0);
                return d >= start && d < end;
            });
            buckets.push({
                date: label,
                revenue: bucketOrders.reduce((s, o) => s + getOrderTotal(o), 0),
                orders: bucketOrders.length
            });
        }

        return { summary, chartData: buckets };
    }, [filteredOrders, dateRange]);

    // ========== INVENTORY REPORT ==========
    const inventoryReport = useMemo(() => {
        const totalProducts = products.length;
        const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
        const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
        const totalValue = products.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0);

        const summary = [
            { label: 'Total Products', value: totalProducts.toString(), icon: FiPackage, color: 'blue' },
            { label: 'Low Stock', value: lowStock.toString(), icon: FiAlertTriangle, color: 'orange' },
            { label: 'Out of Stock', value: outOfStock.toString(), icon: FiFileText, color: 'purple' },
            { label: 'Inventory Value', value: `₹${totalValue.toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'green' }
        ];

        // Group by category
        const catMap = {};
        products.forEach(p => {
            const cat = p.category || 'Other';
            if (!catMap[cat]) catMap[cat] = { stock: 0, value: 0, lowCount: 0 };
            catMap[cat].stock += (p.stock || 0);
            catMap[cat].value += (p.price || 0) * (p.stock || 0);
            if ((p.stock || 0) <= 10) catMap[cat].lowCount++;
        });
        const categories = Object.entries(catMap)
            .map(([name, d]) => ({
                name,
                stock: d.stock,
                value: d.value,
                status: d.lowCount > 2 ? 'warning' : 'success',
                statusLabel: d.lowCount > 2 ? 'Low Stock' : 'Healthy'
            }))
            .sort((a, b) => b.value - a.value);

        return { summary, categories };
    }, [products]);

    // ========== CUSTOMER REPORT ==========
    const customerReport = useMemo(() => {
        const totalCustomers = users.length;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = users.filter(u => new Date(u.createdAt || 0) >= monthStart).length;

        // Build per-customer stats from orders
        const customerMap = {};
        orders.forEach(o => {
            const key = o.userId || o.customerDetails?.email || o.customer?.email || null;
            if (!key) return;
            if (!customerMap[key]) customerMap[key] = { orders: 0, spent: 0, name: '' };
            customerMap[key].orders += 1;
            customerMap[key].spent += getOrderTotal(o);
            customerMap[key].name = o.customerName || o.customerDetails?.fullName || o.shippingAddress?.name || o.customer?.name || customerMap[key].name || key;
        });

        const customerList = Object.values(customerMap);
        const repeatCustomers = customerList.filter(c => c.orders > 1).length;
        const totalSpent = customerList.reduce((s, c) => s + c.spent, 0);
        const avgOrderValue = customerList.length > 0 ? Math.round(totalSpent / orders.length) : 0;

        const summary = [
            { label: 'Total Customers', value: totalCustomers.toLocaleString(), icon: FiUsers, color: 'blue' },
            { label: 'New This Month', value: newThisMonth.toLocaleString(), icon: FiTrendingUp, color: 'green' },
            { label: 'Repeat Customers', value: repeatCustomers.toLocaleString(), icon: FiShoppingCart, color: 'purple' },
            { label: 'Avg. Order Value', value: `₹${avgOrderValue.toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'orange' }
        ];

        const topCustomers = customerList
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 10)
            .map(c => ({ name: c.name || 'Customer', orders: c.orders, spent: c.spent }));

        return { summary, topCustomers };
    }, [users, orders]);

    const reportsMenu = [
        { id: 'sales', label: 'Sales Report', icon: FiDollarSign },
        { id: 'inventory', label: 'Inventory Report', icon: FiPackage },
        { id: 'customers', label: 'Customer Report', icon: FiUsers }
    ];

    const getCurrentReport = () => {
        switch (reportType) {
            case 'sales': return salesReport;
            case 'inventory': return inventoryReport;
            case 'customers': return customerReport;
            default: return salesReport;
        }
    };

    const currentReport = getCurrentReport();

    const handleExport = () => {
        // Build CSV data based on report type
        let csv = '';
        if (reportType === 'sales') {
            csv = 'Date,Revenue,Orders\n';
            salesReport.chartData.forEach(r => {
                csv += `${r.date},${r.revenue},${r.orders}\n`;
            });
        } else if (reportType === 'inventory') {
            csv = 'Category,Stock,Value,Status\n';
            inventoryReport.categories.forEach(c => {
                csv += `${c.name},${c.stock},${c.value},${c.statusLabel}\n`;
            });
        } else {
            csv = 'Customer,Orders,Total Spent\n';
            customerReport.topCustomers.forEach(c => {
                csv += `${c.name},${c.orders},${c.spent}\n`;
            });
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="admin-reports">
                <div className="reports-loading">
                    <div className="report-summary">
                        {[1, 2, 3, 4].map(i => <div key={i} className="summary-card skeleton" style={{ height: 80 }}></div>)}
                    </div>
                    <div className="skeleton" style={{ height: 300, borderRadius: '0.75rem' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-reports">
            <div className="reports-header">
                <div>
                    <h1>Reports</h1>
                    <p>Generate and download business reports</p>
                </div>
                <motion.button
                    className="export-btn"
                    onClick={handleExport}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FiDownload />
                    Export CSV
                </motion.button>
            </div>

            <div className="reports-controls">
                <div className="report-types">
                    {reportsMenu.map((report) => (
                        <button
                            key={report.id}
                            className={`report-type-btn ${reportType === report.id ? 'active' : ''}`}
                            onClick={() => setReportType(report.id)}
                        >
                            <report.icon />
                            {report.label}
                        </button>
                    ))}
                </div>
                <div className="date-range-selector">
                    <FiCalendar />
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="quarter">Last 3 Months</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>

            {/* Report Summary Cards */}
            <div className="report-summary">
                {currentReport.summary.map((item, index) => (
                    <motion.div
                        key={item.label}
                        className="summary-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className={`summary-icon ${item.color || 'blue'}`}>
                            <item.icon />
                        </div>
                        <div className="summary-content">
                            <span className="summary-label">{item.label}</span>
                            <span className="summary-value">{item.value}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Report Content */}
            <motion.div
                className="report-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {reportType === 'sales' && (
                    <>
                        <div className="report-chart-card">
                            <h3>Revenue & Orders Trend</h3>
                            {salesReport.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={salesReport.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#dc2626"
                                            strokeWidth={2}
                                            name="Revenue"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="orders"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            name="Orders"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="no-data-msg">No sales data for this period</p>
                            )}
                        </div>
                    </>
                )}

                {reportType === 'inventory' && (
                    <div className="report-table-card">
                        <h3>Stock by Category</h3>
                        {inventoryReport.categories.length > 0 ? (
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Items in Stock</th>
                                        <th>Total Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventoryReport.categories.map((cat) => (
                                        <tr key={cat.name}>
                                            <td className="category-name">{cat.name}</td>
                                            <td>{cat.stock} units</td>
                                            <td className="value">₹{cat.value.toLocaleString('en-IN')}</td>
                                            <td>
                                                <span className={`status-badge ${cat.status}`}>{cat.statusLabel}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data-msg">No products in inventory</p>
                        )}
                    </div>
                )}

                {reportType === 'customers' && (
                    <div className="report-table-card">
                        <h3>Top Customers</h3>
                        {customerReport.topCustomers.length > 0 ? (
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Customer Name</th>
                                        <th>Total Orders</th>
                                        <th>Total Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerReport.topCustomers.map((customer, index) => (
                                        <tr key={index}>
                                            <td>
                                                <span className="rank-badge">#{index + 1}</span>
                                            </td>
                                            <td className="customer-name">{customer.name}</td>
                                            <td>{customer.orders}</td>
                                            <td className="value">₹{customer.spent.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data-msg">No customer orders yet</p>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    <button className="action-card" onClick={() => { setReportType('sales'); handleExport(); }}>
                        <FiFileText />
                        <span>Export Sales Report</span>
                    </button>
                    <button className="action-card" onClick={() => { setReportType('inventory'); handleExport(); }}>
                        <FiPackage />
                        <span>Export Inventory Report</span>
                    </button>
                    <button className="action-card" onClick={() => { setReportType('customers'); handleExport(); }}>
                        <FiUsers />
                        <span>Export Customer Report</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
