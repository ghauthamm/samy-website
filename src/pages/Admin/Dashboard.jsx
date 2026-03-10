import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiDollarSign, FiShoppingBag, FiAlertTriangle, FiUsers,
    FiTrendingUp, FiTrendingDown, FiMoreVertical, FiArrowUpRight,
    FiPackage, FiUserCheck
} from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState({});

    useEffect(() => {
        let loaded = 0;
        const checkDone = () => { loaded++; if (loaded >= 4) setLoading(false); };

        const unsub1 = onValue(ref(database, 'products'), (snap) => {
            const data = snap.val();
            setProducts(data ? Object.entries(data).map(([id, p]) => ({ id, ...p })) : []);
            checkDone();
        }, () => checkDone());

        const unsub2 = onValue(ref(database, 'orders'), (snap) => {
            const data = snap.val();
            setOrders(data ? Object.entries(data).map(([id, o]) => ({ id, ...o })) : []);
            checkDone();
        }, () => checkDone());

        const unsub3 = onValue(ref(database, 'employees'), (snap) => {
            const data = snap.val();
            setEmployees(data ? Object.entries(data).map(([id, e]) => ({ id, ...e })) : []);
            checkDone();
        }, () => checkDone());

        const unsub4 = onValue(ref(database, 'attendance'), (snap) => {
            setAttendance(snap.val() || {});
            checkDone();
        }, () => checkDone());

        return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
    }, []);

    // Computed stats
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
    const totalOrders = orders.length;
    const lowStockItems = products.filter(p => (p.stock || 0) <= 10).length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const totalProducts = products.length;

    // Today's attendance
    const todayKey = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const todayAtt = attendance[todayKey] || {};
    const presentToday = Object.values(todayAtt).filter(a => a.status === 'present').length;

    const stats = [
        {
            title: 'Total Sales',
            value: `₹${totalSales.toLocaleString()}`,
            change: `${totalOrders} orders`,
            trend: 'up',
            icon: FiDollarSign,
            color: 'green'
        },
        {
            title: 'Total Products',
            value: totalProducts.toString(),
            change: `${lowStockItems} low stock`,
            trend: lowStockItems > 5 ? 'down' : 'up',
            icon: FiPackage,
            color: 'blue'
        },
        {
            title: 'Low Stock Items',
            value: lowStockItems.toString(),
            change: lowStockItems === 0 ? 'All stocked' : 'Needs attention',
            trend: lowStockItems > 0 ? 'down' : 'up',
            icon: FiAlertTriangle,
            color: 'orange'
        },
        {
            title: 'Employees',
            value: activeEmployees.toString(),
            change: `${presentToday} present today`,
            trend: 'up',
            icon: FiUserCheck,
            color: 'purple'
        },
    ];

    // Category breakdown from products
    const catCounts = {};
    products.forEach(p => {
        const cat = p.category || 'Other';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const catColors = { 'Electronics': '#dc2626', 'Clothing': '#3b82f6', 'Accessories': '#22c55e', 'Sports': '#f59e0b', 'Home & Living': '#8b5cf6', 'Beauty': '#ec4899' };
    const categoryData = Object.entries(catCounts).map(([name, count]) => ({
        name,
        value: totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0,
        color: catColors[name] || '#6b7280'
    }));

    // Sales data by month from orders
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesByMonth = {};
    orders.forEach(o => {
        const d = new Date(o.createdAt || o.date || Date.now());
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!salesByMonth[key]) salesByMonth[key] = { sales: 0, orders: 0, month: d.getMonth(), year: d.getFullYear() };
        salesByMonth[key].sales += (o.totalAmount || o.total || 0);
        salesByMonth[key].orders += 1;
    });
    const salesData = Object.values(salesByMonth)
        .sort((a, b) => a.year - b.year || a.month - b.month)
        .slice(-7)
        .map(m => ({ name: monthNames[m.month], sales: m.sales, orders: m.orders }));

    // Top products by stock (or could be by orders if tracked)
    const topProducts = [...products]
        .sort((a, b) => (b.price || 0) * (b.stock || 0) - (a.price || 0) * (a.stock || 0))
        .slice(0, 5)
        .map(p => ({
            id: p.id,
            name: p.name || 'Untitled',
            image: p.image || '',
            stock: p.stock || 0,
            revenue: `₹${((p.price || 0) * (p.stock || 0)).toLocaleString()}`,
            price: `₹${(p.price || 0).toLocaleString()}`
        }));

    // Recent orders (newest first)
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)
        .map(o => ({
            id: o.orderId || `#${o.id.slice(-6).toUpperCase()}`,
            customer: o.customerName || o.shippingAddress?.name || 'Customer',
            amount: `₹${(o.totalAmount || o.total || 0).toLocaleString()}`,
            status: o.status || 'Pending',
            date: o.createdAt ? getTimeAgo(o.createdAt) : 'N/A'
        }));

    function getTimeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} min ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }

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
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.length > 0 ? topProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="product-cell">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="product-thumb-img" />
                                            ) : (
                                                <div className="product-thumb"></div>
                                            )}
                                            <span>{product.name}</span>
                                        </td>
                                        <td>{product.price}</td>
                                        <td>{product.stock}</td>
                                        <td className="revenue">{product.revenue}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No products yet</td></tr>
                                )}
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
                                {recentOrders.length > 0 ? recentOrders.map((order) => (
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
                                )) : (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No orders yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
