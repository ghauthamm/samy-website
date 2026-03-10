import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart,
    FiUsers, FiPackage, FiCalendar
} from 'react-icons/fi';
import {
    BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import './Analytics.css';

const CAT_COLORS = {
    'Electronics': '#dc2626', 'Clothing': '#3b82f6', 'Accessories': '#22c55e',
    'Sports': '#f59e0b', 'Home & Living': '#8b5cf6', 'Beauty': '#ec4899',
    'Footwear': '#14b8a6', 'Other': '#6b7280'
};
const COLOR_LIST = Object.values(CAT_COLORS);

const Analytics = () => {
    const [period, setPeriod] = useState('7days');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let loaded = 0;
        const checkDone = () => { loaded++; if (loaded >= 2) setLoading(false); };

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

        return () => { unsub1(); unsub2(); };
    }, []);

    // Period cutoff date
    const periodStart = useMemo(() => {
        const now = new Date();
        const days = { '7days': 7, '30days': 30, '90days': 90, 'year': 365 };
        return new Date(now.getTime() - (days[period] || 7) * 86400000);
    }, [period]);

    // Filtered orders for selected period
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const d = new Date(o.createdAt || o.date || 0);
            return d >= periodStart;
        });
    }, [orders, periodStart]);

    // Previous period orders (for % change calculation)
    const prevOrders = useMemo(() => {
        const days = { '7days': 7, '30days': 30, '90days': 90, 'year': 365 };
        const span = (days[period] || 7) * 86400000;
        const prevStart = new Date(periodStart.getTime() - span);
        return orders.filter(o => {
            const d = new Date(o.createdAt || o.date || 0);
            return d >= prevStart && d < periodStart;
        });
    }, [orders, periodStart, period]);

    const getOrderTotal = (o) => o.totalAmount || o.total || o.amount || 0;

    // Stats
    const totalRevenue = filteredOrders.reduce((s, o) => s + getOrderTotal(o), 0);
    const prevRevenue = prevOrders.reduce((s, o) => s + getOrderTotal(o), 0);
    const revenueChange = prevRevenue > 0 ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : totalRevenue > 0 ? '+100' : '0';

    const totalOrderCount = filteredOrders.length;
    const prevOrderCount = prevOrders.length;
    const orderChange = prevOrderCount > 0 ? (((totalOrderCount - prevOrderCount) / prevOrderCount) * 100).toFixed(1) : totalOrderCount > 0 ? '+100' : '0';

    const uniqueCustomers = new Set(filteredOrders.map(o => o.userId || o.customerDetails?.email || o.customer?.email || 'anon')).size;
    const prevCustomers = new Set(prevOrders.map(o => o.userId || o.customerDetails?.email || o.customer?.email || 'anon')).size;
    const customerChange = prevCustomers > 0 ? (((uniqueCustomers - prevCustomers) / prevCustomers) * 100).toFixed(1) : uniqueCustomers > 0 ? '+100' : '0';

    const productsSold = filteredOrders.reduce((s, o) => s + (o.items ? o.items.reduce((q, i) => q + (i.quantity || 1), 0) : 0), 0);
    const prevProductsSold = prevOrders.reduce((s, o) => s + (o.items ? o.items.reduce((q, i) => q + (i.quantity || 1), 0) : 0), 0);
    const soldChange = prevProductsSold > 0 ? (((productsSold - prevProductsSold) / prevProductsSold) * 100).toFixed(1) : productsSold > 0 ? '+100' : '0';

    const fmt = (v) => `${parseFloat(v) >= 0 ? '+' : ''}${v}%`;

    const stats = [
        { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: fmt(revenueChange), trend: parseFloat(revenueChange) >= 0 ? 'up' : 'down', icon: FiDollarSign, color: 'green' },
        { title: 'Total Orders', value: totalOrderCount.toLocaleString(), change: fmt(orderChange), trend: parseFloat(orderChange) >= 0 ? 'up' : 'down', icon: FiShoppingCart, color: 'blue' },
        { title: 'Customers', value: uniqueCustomers.toLocaleString(), change: fmt(customerChange), trend: parseFloat(customerChange) >= 0 ? 'up' : 'down', icon: FiUsers, color: 'purple' },
        { title: 'Products Sold', value: productsSold.toLocaleString(), change: fmt(soldChange), trend: parseFloat(soldChange) >= 0 ? 'up' : 'down', icon: FiPackage, color: 'orange' },
    ];

    // Sales trend - group by date
    const salesTrend = useMemo(() => {
        const map = {};
        const days = { '7days': 7, '30days': 30, '90days': 90, 'year': 365 };
        const span = days[period] || 7;
        const now = new Date();

        // Pre-fill dates
        for (let i = span - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 86400000);
            const key = d.toISOString().split('T')[0];
            const label = span <= 7
                ? d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                : span <= 30
                    ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            map[key] = { date: label, revenue: 0, orders: 0 };
        }

        filteredOrders.forEach(o => {
            const d = new Date(o.createdAt || o.date || 0);
            const key = d.toISOString().split('T')[0];
            if (map[key]) {
                map[key].revenue += getOrderTotal(o);
                map[key].orders += 1;
            }
        });

        const data = Object.values(map);
        // For large spans, bucket into weeks or months
        if (span > 30) {
            const bucketed = [];
            const bucketSize = span > 90 ? 30 : 7;
            for (let i = 0; i < data.length; i += bucketSize) {
                const chunk = data.slice(i, i + bucketSize);
                bucketed.push({
                    date: chunk[0].date,
                    revenue: chunk.reduce((s, c) => s + c.revenue, 0),
                    orders: chunk.reduce((s, c) => s + c.orders, 0),
                });
            }
            return bucketed;
        }
        return data;
    }, [filteredOrders, period]);

    // Product category lookup
    const productCatMap = useMemo(() => {
        const m = {};
        products.forEach(p => { m[p.id] = p.category || 'Other'; m[p.name?.toLowerCase()] = p.category || 'Other'; });
        return m;
    }, [products]);

    const getItemCategory = (item) => {
        if (item.category) return item.category;
        if (item.productId && productCatMap[item.productId]) return productCatMap[item.productId];
        if (item.name && productCatMap[item.name.toLowerCase()]) return productCatMap[item.name.toLowerCase()];
        return 'Other';
    };

    // Category performance (current + previous for growth)
    const categoryPerformance = useMemo(() => {
        const curr = {};
        filteredOrders.forEach(o => {
            (o.items || []).forEach(i => {
                const cat = getItemCategory(i);
                if (!curr[cat]) curr[cat] = { revenue: 0, orders: 0 };
                curr[cat].revenue += (i.price || 0) * (i.quantity || 1);
                curr[cat].orders += 1;
            });
        });
        const prev = {};
        prevOrders.forEach(o => {
            (o.items || []).forEach(i => {
                const cat = getItemCategory(i);
                if (!prev[cat]) prev[cat] = { revenue: 0, orders: 0 };
                prev[cat].revenue += (i.price || 0) * (i.quantity || 1);
            });
        });
        return Object.entries(curr)
            .map(([category, d]) => {
                const prevRev = prev[category]?.revenue || 0;
                const growth = prevRev > 0 ? Math.round(((d.revenue - prevRev) / prevRev) * 100) : d.revenue > 0 ? 100 : 0;
                return { category, revenue: d.revenue, orders: d.orders, growth };
            })
            .sort((a, b) => b.revenue - a.revenue);
    }, [filteredOrders, prevOrders, productCatMap]);

    // Revenue by category for pie chart
    const revenueByCategory = useMemo(() => {
        const totalCatRevenue = categoryPerformance.reduce((s, c) => s + c.revenue, 0);
        if (totalCatRevenue === 0) return [];
        return categoryPerformance.map((c, i) => ({
            name: c.category,
            value: Math.round((c.revenue / totalCatRevenue) * 100),
            color: CAT_COLORS[c.category] || COLOR_LIST[i % COLOR_LIST.length]
        }));
    }, [categoryPerformance]);

    // Hourly order distribution
    const hourlyTraffic = useMemo(() => {
        const hours = Array.from({ length: 8 }, (_, i) => ({
            hour: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'][i],
            bucket: i * 3,
            orders: 0
        }));
        filteredOrders.forEach(o => {
            const h = new Date(o.createdAt || o.date || 0).getHours();
            const idx = Math.min(Math.floor(h / 3), 7);
            hours[idx].orders += 1;
        });
        return hours;
    }, [filteredOrders]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'revenue' ? '₹' : ''}{entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="admin-analytics">
                <div className="analytics-loading">
                    <div className="skeleton-stats-row">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card skeleton"></div>)}
                    </div>
                    <div className="skeleton-chart skeleton"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-analytics">
            <div className="analytics-header">
                <div>
                    <h1>Analytics</h1>
                    <p>Insights and performance metrics</p>
                </div>
                <div className="period-selector">
                    <FiCalendar />
                    <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="analytics-stats">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        className={`stat-card ${stat.color}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="stat-header">
                            <div className={`stat-icon ${stat.color}`}>
                                <stat.icon />
                            </div>
                            <span className={`stat-trend ${stat.trend}`}>
                                {stat.trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
                                {stat.change}
                            </span>
                        </div>
                        <div className="stat-content">
                            <p className="stat-title">{stat.title}</p>
                            <h3 className="stat-value">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Revenue Trend */}
                <motion.div
                    className="chart-card large"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="chart-header">
                        <h3>Revenue & Orders Trend</h3>
                        <div className="chart-legend">
                            <span className="legend-item">
                                <span className="legend-dot revenue"></span>
                                Revenue
                            </span>
                            <span className="legend-item">
                                <span className="legend-dot orders"></span>
                                Orders
                            </span>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesTrend}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#ordersGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Category Distribution */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="chart-header">
                        <h3>Revenue by Category</h3>
                    </div>
                    <div className="chart-body pie-body">
                        {revenueByCategory.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={revenueByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {revenueByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pie-legend">
                                    {revenueByCategory.map((item) => (
                                        <div key={item.name} className="pie-legend-item">
                                            <span className="pie-dot" style={{ background: item.color }}></span>
                                            <span className="pie-label">{item.name}</span>
                                            <span className="pie-value">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="no-data-text">No category data for this period</p>
                        )}
                    </div>
                </motion.div>

                {/* Hourly Order Pattern */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="chart-header">
                        <h3>Orders by Time of Day</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={hourlyTraffic}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="hour" stroke="#9ca3af" fontSize={11} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="orders" fill="#a855f7" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Category Performance Table */}
                <motion.div
                    className="chart-card large"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="chart-header">
                        <h3>Category Performance</h3>
                    </div>
                    <div className="chart-body">
                        {categoryPerformance.length > 0 ? (
                            <table className="performance-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Revenue</th>
                                        <th>Orders</th>
                                        <th>Growth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryPerformance.map((cat, index) => (
                                        <tr key={cat.category}>
                                            <td>
                                                <div className="category-name">
                                                    <span className="category-rank">#{index + 1}</span>
                                                    {cat.category}
                                                </div>
                                            </td>
                                            <td className="revenue">₹{cat.revenue.toLocaleString('en-IN')}</td>
                                            <td>{cat.orders}</td>
                                            <td>
                                                <span className={`growth-badge ${cat.growth >= 0 ? 'positive' : 'negative'}`}>
                                                    {cat.growth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                                    {cat.growth >= 0 ? '+' : ''}{cat.growth}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data-text">No orders in this period</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;
