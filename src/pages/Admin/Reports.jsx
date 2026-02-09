import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiDownload, FiCalendar, FiFileText, FiTrendingUp,
    FiDollarSign, FiShoppingCart, FiUsers, FiPackage
} from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Reports.css';

const Reports = () => {
    const [dateRange, setDateRange] = useState('month');
    const [reportType, setReportType] = useState('sales');

    const salesReport = {
        summary: [
            { label: 'Total Revenue', value: '₹2,45,890', icon: FiDollarSign, color: 'green' },
            { label: 'Total Orders', value: '1,284', icon: FiShoppingCart, color: 'blue' },
            { label: 'New Customers', value: '234', icon: FiUsers, color: 'purple' },
            { label: 'Products Sold', value: '5,892', icon: FiPackage, color: 'orange' }
        ],
        chartData: [
            { date: 'Week 1', revenue: 45000, orders: 234 },
            { date: 'Week 2', revenue: 58000, orders: 312 },
            { date: 'Week 3', revenue: 52000, orders: 289 },
            { date: 'Week 4', revenue: 90890, orders: 449 }
        ]
    };

    const inventoryReport = {
        summary: [
            { label: 'Total Products', value: '342', icon: FiPackage },
            { label: 'Low Stock', value: '23', icon: FiTrendingUp },
            { label: 'Out of Stock', value: '8', icon: FiFileText },
            { label: 'Total Value', value: '₹12.5L', icon: FiDollarSign }
        ],
        categories: [
            { name: 'Electronics', stock: 145, value: 450000 },
            { name: 'Clothing', stock: 234, value: 280000 },
            { name: 'Accessories', stock: 189, value: 175000 },
            { name: 'Sports', stock: 98, value: 125000 }
        ]
    };

    const customerReport = {
        summary: [
            { label: 'Total Customers', value: '3,421', icon: FiUsers },
            { label: 'New This Month', value: '234', icon: FiTrendingUp },
            { label: 'Repeat Customers', value: '1,567', icon: FiShoppingCart },
            { label: 'Avg. Order Value', value: '₹1,915', icon: FiDollarSign }
        ],
        topCustomers: [
            { name: 'Rahul Sharma', orders: 24, spent: 98560 },
            { name: 'Priya Patel', orders: 19, spent: 82340 },
            { name: 'Amit Kumar', orders: 16, spent: 71200 },
            { name: 'Sneha Reddy', orders: 14, spent: 65890 }
        ]
    };

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
        alert('Exporting report as PDF...');
    };

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
                    Export PDF
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
                        </div>
                    </>
                )}

                {reportType === 'inventory' && (
                    <div className="report-table-card">
                        <h3>Stock by Category</h3>
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
                                        <td className="value">₹{cat.value.toLocaleString()}</td>
                                        <td>
                                            <span className="status-badge success">Healthy</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {reportType === 'customers' && (
                    <div className="report-table-card">
                        <h3>Top Customers</h3>
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
                                    <tr key={customer.name}>
                                        <td>
                                            <span className="rank-badge">#{index + 1}</span>
                                        </td>
                                        <td className="customer-name">{customer.name}</td>
                                        <td>{customer.orders}</td>
                                        <td className="value">₹{customer.spent.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    <button className="action-card">
                        <FiFileText />
                        <span>Generate Invoice Report</span>
                    </button>
                    <button className="action-card">
                        <FiDollarSign />
                        <span>Tax Summary</span>
                    </button>
                    <button className="action-card">
                        <FiPackage />
                        <span>Stock Alert Report</span>
                    </button>
                    <button className="action-card">
                        <FiUsers />
                        <span>Customer Insights</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
