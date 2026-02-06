import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiDollarSign, FiShoppingBag, FiAlertTriangle, FiUsers,
    FiTrendingUp, FiTrendingDown, FiMoreVertical, FiArrowUpRight
} from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 1000);
    }, []);

    const stats = [
        {
            title: 'Total Sales',
            value: '₹2,45,890',
            change: '+12.5%',
            trend: 'up',
            icon: FiDollarSign,
            color: 'green'
        },
        {
            title: 'Total Orders',
            value: '1,284',
            change: '+8.2%',
            trend: 'up',
            icon: FiShoppingBag,
            color: 'blue'
        },
        {
            title: 'Low Stock Items',
            value: '23',
            change: '-5%',
            trend: 'down',
            icon: FiAlertTriangle,
            color: 'orange'
        },
        {
            title: 'Active Users',
            value: '3,421',
            change: '+15.3%',
            trend: 'up',
            icon: FiUsers,
            color: 'purple'
        },
    ];

    const salesData = [
        { name: 'Jan', sales: 12000, orders: 120 },
        { name: 'Feb', sales: 19000, orders: 180 },
        { name: 'Mar', sales: 15000, orders: 150 },
        { name: 'Apr', sales: 25000, orders: 230 },
        { name: 'May', sales: 22000, orders: 210 },
        { name: 'Jun', sales: 30000, orders: 280 },
        { name: 'Jul', sales: 28000, orders: 260 },
    ];

    const categoryData = [
        { name: 'Electronics', value: 35, color: '#dc2626' },
        { name: 'Clothing', value: 30, color: '#3b82f6' },
        { name: 'Accessories', value: 20, color: '#22c55e' },
        { name: 'Home & Living', value: 15, color: '#f59e0b' },
    ];

    const topProducts = [
        { id: 1, name: 'Wireless Earbuds Pro', sales: 234, revenue: '₹46,800', growth: '+23%' },
        { id: 2, name: 'Smart Watch Elite', sales: 189, revenue: '₹75,600', growth: '+18%' },
        { id: 3, name: 'Designer Handbag', sales: 156, revenue: '₹93,600', growth: '+12%' },
        { id: 4, name: 'Running Shoes Max', sales: 145, revenue: '₹43,500', growth: '+8%' },
        { id: 5, name: 'Premium Sunglasses', sales: 132, revenue: '₹39,600', growth: '+5%' },
    ];

    const recentOrders = [
        { id: '#ORD-2847', customer: 'Rahul Sharma', amount: '₹2,450', status: 'Completed', date: '10 min ago' },
        { id: '#ORD-2846', customer: 'Priya Patel', amount: '₹1,890', status: 'Processing', date: '25 min ago' },
        { id: '#ORD-2845', customer: 'Amit Kumar', amount: '₹3,220', status: 'Pending', date: '1 hour ago' },
        { id: '#ORD-2844', customer: 'Sneha Reddy', amount: '₹5,670', status: 'Completed', date: '2 hours ago' },
        { id: '#ORD-2843', customer: 'Vikash Singh', amount: '₹890', status: 'Shipped', date: '3 hours ago' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-skeleton">
                    <div className="skeleton-stats">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="skeleton-card skeleton"></div>
                        ))}
                    </div>
                    <div className="skeleton-charts">
                        <div className="skeleton-chart skeleton"></div>
                        <div className="skeleton-chart skeleton"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="admin-dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's what's happening with your store.</p>
                </div>
                <div className="header-actions">
                    <select className="period-select">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <motion.div className="stats-grid" variants={itemVariants}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        className={`stat-card ${stat.color}`}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="stat-header">
                            <div className={`stat-icon ${stat.color}`}>
                                <stat.icon />
                            </div>
                            <button className="stat-menu">
                                <FiMoreVertical />
                            </button>
                        </div>
                        <div className="stat-content">
                            <p className="stat-title">{stat.title}</p>
                            <h3 className="stat-value">{stat.value}</h3>
                            <div className={`stat-change ${stat.trend}`}>
                                {stat.trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
                                <span>{stat.change}</span>
                                <span className="change-period">vs last month</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Section */}
            <div className="charts-section">
                <motion.div className="chart-card main-chart" variants={itemVariants}>
                    <div className="chart-header">
                        <h3>Sales Overview</h3>
                        <div className="chart-legend">
                            <span className="legend-item sales">
                                <span className="legend-dot"></span>
                                Sales
                            </span>
                            <span className="legend-item orders">
                                <span className="legend-dot"></span>
                                Orders
                            </span>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                    fill="url(#salesGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div className="chart-card pie-chart" variants={itemVariants}>
                    <div className="chart-header">
                        <h3>Sales by Category</h3>
                    </div>
                    <div className="chart-body pie-body">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-legend">
                            {categoryData.map((item) => (
                                <div key={item.name} className="pie-legend-item">
                                    <span className="pie-dot" style={{ background: item.color }}></span>
                                    <span className="pie-label">{item.name}</span>
                                    <span className="pie-value">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tables Section */}
            <div className="tables-section">
                <motion.div className="table-card" variants={itemVariants}>
                    <div className="table-header">
                        <h3>Top Selling Products</h3>
                        <a href="/admin/products" className="view-all">
                            View All <FiArrowUpRight />
                        </a>
                    </div>
                    <div className="table-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Sales</th>
                                    <th>Revenue</th>
                                    <th>Growth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="product-cell">
                                            <div className="product-thumb"></div>
                                            <span>{product.name}</span>
                                        </td>
                                        <td>{product.sales}</td>
                                        <td className="revenue">{product.revenue}</td>
                                        <td>
                                            <span className="growth-badge positive">{product.growth}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <motion.div className="table-card" variants={itemVariants}>
                    <div className="table-header">
                        <h3>Recent Orders</h3>
                        <a href="/admin/orders" className="view-all">
                            View All <FiArrowUpRight />
                        </a>
                    </div>
                    <div className="table-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="order-id">{order.id}</td>
                                        <td>{order.customer}</td>
                                        <td className="amount">{order.amount}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
