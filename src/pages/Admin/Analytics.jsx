import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart,
    FiUsers, FiPackage, FiCalendar
} from 'react-icons/fi';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
    const [period, setPeriod] = useState('7days');

    const salesTrend = [
        { date: 'Feb 1', revenue: 12000, orders: 45, customers: 38 },
        { date: 'Feb 2', revenue: 15000, orders: 52, customers: 44 },
        { date: 'Feb 3', revenue: 13500, orders: 48, customers: 41 },
        { date: 'Feb 4', revenue: 18000, orders: 65, customers: 55 },
        { date: 'Feb 5', revenue: 16500, orders: 58, customers: 49 },
        { date: 'Feb 6', revenue: 20000, orders: 72, customers: 61 },
        { date: 'Feb 7', revenue: 22000, orders: 78, customers: 66 }
    ];

    const categoryPerformance = [
        { category: 'Electronics', revenue: 45000, orders: 234, growth: 23 },
        { category: 'Clothing', revenue: 38000, orders: 312, growth: 18 },
        { category: 'Accessories', revenue: 28000, orders: 189, growth: 15 },
        { category: 'Sports', revenue: 22000, orders: 156, growth: 12 },
        { category: 'Home & Living', revenue: 18000, orders: 98, growth: 8 },
        { category: 'Beauty', revenue: 15000, orders: 145, growth: 5 }
    ];

    const revenueByCategory = [
        { name: 'Electronics', value: 35, color: '#dc2626' },
        { name: 'Clothing', value: 28, color: '#3b82f6' },
        { name: 'Accessories', value: 18, color: '#22c55e' },
        { name: 'Sports', value: 12, color: '#f59e0b' },
        { name: 'Others', value: 7, color: '#a855f7' }
    ];

    const hourlyTraffic = [
        { hour: '12 AM', visitors: 45 },
        { hour: '3 AM', visitors: 20 },
        { hour: '6 AM', visitors: 35 },
        { hour: '9 AM', visitors: 120 },
        { hour: '12 PM', visitors: 180 },
        { hour: '3 PM', visitors: 210 },
        { hour: '6 PM', visitors: 250 },
        { hour: '9 PM', visitors: 195 }
    ];

    const stats = [
        {
            title: 'Total Revenue',
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
            icon: FiShoppingCart,
            color: 'blue'
        },
        {
            title: 'Active Customers',
            value: '3,421',
            change: '+15.3%',
            trend: 'up',
            icon: FiUsers,
            color: 'purple'
        },
        {
            title: 'Products Sold',
            value: '5,892',
            change: '-3.1%',
            trend: 'down',
            icon: FiPackage,
            color: 'orange'
        }
    ];

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
                    </div>
                </motion.div>

                {/* Hourly Traffic */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="chart-header">
                        <h3>Hourly Traffic Pattern</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={hourlyTraffic}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="hour" stroke="#9ca3af" fontSize={11} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="visitors" fill="#a855f7" radius={[8, 8, 0, 0]} />
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
                                        <td className="revenue">₹{cat.revenue.toLocaleString()}</td>
                                        <td>{cat.orders}</td>
                                        <td>
                                            <span className="growth-badge positive">
                                                <FiTrendingUp />
                                                +{cat.growth}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;
