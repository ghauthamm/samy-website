import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCheckCircle, FiAlertCircle, FiCalendar, FiClock, FiUser,
    FiCheck, FiX, FiSearch
} from 'react-icons/fi';
import { ref, onValue, update, push } from 'firebase/database';
import { database } from '../../config/firebase';
import './Attendance.css';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);
    const [saving, setSaving] = useState(false);
    const [monthData, setMonthData] = useState({});

    // Fetch employees
    useEffect(() => {
        const empRef = ref(database, 'employees');
        const unsubscribe = onValue(empRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([id, emp]) => ({ id, ...emp }));
                setEmployees(list.filter(e => e.status === 'active'));
            } else {
                setEmployees([]);
            }
            setLoading(false);
        }, () => { setEmployees([]); setLoading(false); });
        return () => unsubscribe();
    }, []);

    // Fetch attendance for selected date
    useEffect(() => {
        const dateKey = selectedDate.replace(/-/g, '');
        const attRef = ref(database, `attendance/${dateKey}`);
        const unsubscribe = onValue(attRef, (snapshot) => {
            const data = snapshot.val();
            setAttendance(data || {});
        });
        return () => unsubscribe();
    }, [selectedDate]);

    // Fetch month summary
    useEffect(() => {
        const yearMonth = selectedDate.substring(0, 7).replace('-', '');
        const attRef = ref(database, 'attendance');
        const unsubscribe = onValue(attRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const monthEntries = {};
                Object.entries(data).forEach(([dateKey, records]) => {
                    if (dateKey.startsWith(yearMonth)) {
                        monthEntries[dateKey] = records;
                    }
                });
                setMonthData(monthEntries);
            } else {
                setMonthData({});
            }
        });
        return () => unsubscribe();
    }, [selectedDate]);

    const showNotif = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const markAttendance = async (empId, status) => {
        setSaving(true);
        try {
            const dateKey = selectedDate.replace(/-/g, '');
            await update(ref(database, `attendance/${dateKey}`), {
                [empId]: {
                    status,
                    markedAt: new Date().toISOString(),
                    date: selectedDate
                }
            });
            const emp = employees.find(e => e.id === empId);
            showNotif('success', `${emp?.name} marked as ${status}`);
        } catch {
            showNotif('error', 'Failed to mark attendance.');
        } finally { setSaving(false); }
    };

    const markAllPresent = async () => {
        setSaving(true);
        try {
            const dateKey = selectedDate.replace(/-/g, '');
            const updates = {};
            employees.forEach(emp => {
                if (!attendance[emp.id]) {
                    updates[emp.id] = {
                        status: 'present',
                        markedAt: new Date().toISOString(),
                        date: selectedDate
                    };
                }
            });
            if (Object.keys(updates).length > 0) {
                await update(ref(database, `attendance/${dateKey}`), updates);
                showNotif('success', 'All unmarked employees marked as present!');
            }
        } catch {
            showNotif('error', 'Failed to mark all.');
        } finally { setSaving(false); }
    };

    const getEmpMonthStats = (empId) => {
        let present = 0, absent = 0, halfDay = 0, leave = 0;
        Object.values(monthData).forEach(dayRecords => {
            const rec = dayRecords[empId];
            if (rec) {
                switch (rec.status) {
                    case 'present': present++; break;
                    case 'absent': absent++; break;
                    case 'half-day': halfDay++; break;
                    case 'leave': leave++; break;
                }
            }
        });
        return { present, absent, halfDay, leave };
    };

    const filtered = employees.filter(emp =>
        (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPresent = Object.values(attendance).filter(a => a.status === 'present').length;
    const totalAbsent = Object.values(attendance).filter(a => a.status === 'absent').length;
    const totalHalfDay = Object.values(attendance).filter(a => a.status === 'half-day').length;
    const totalLeave = Object.values(attendance).filter(a => a.status === 'leave').length;
    const totalMarked = Object.keys(attendance).length;

    return (
        <div className="admin-attendance">
            <AnimatePresence>
                {notification && (
                    <motion.div className={`att-notification ${notification.type}`}
                        initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }}>
                        {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="att-header">
                <div>
                    <h1>Attendance</h1>
                    <p>Track daily employee attendance</p>
                </div>
                <div className="att-header-actions">
                    <div className="att-date-picker">
                        <FiCalendar />
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    </div>
                    <motion.button className="att-mark-all-btn" onClick={markAllPresent} disabled={saving}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <FiCheck /> Mark All Present
                    </motion.button>
                </div>
            </div>

            <div className="att-stats">
                <div className="att-stat"><span className="att-stat-num">{employees.length}</span><span className="att-stat-label">Total Employees</span></div>
                <div className="att-stat present"><span className="att-stat-num">{totalPresent}</span><span className="att-stat-label">Present</span></div>
                <div className="att-stat absent"><span className="att-stat-num">{totalAbsent}</span><span className="att-stat-label">Absent</span></div>
                <div className="att-stat halfday"><span className="att-stat-num">{totalHalfDay}</span><span className="att-stat-label">Half Day</span></div>
                <div className="att-stat leave"><span className="att-stat-num">{totalLeave}</span><span className="att-stat-label">On Leave</span></div>
                <div className="att-stat"><span className="att-stat-num">{employees.length - totalMarked}</span><span className="att-stat-label">Unmarked</span></div>
            </div>

            <div className="att-search-bar">
                <FiSearch className="search-icon" />
                <input type="text" placeholder="Search employees..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            {loading ? (
                <div className="att-table-wrap loading">{[1,2,3,4].map(i => <div key={i} className="att-row-skeleton skeleton"></div>)}</div>
            ) : employees.length === 0 ? (
                <div className="att-empty">
                    <FiUser className="att-empty-icon" />
                    <h3>No Active Employees</h3>
                    <p>Add employees first from the Employees section.</p>
                </div>
            ) : (
                <motion.div className="att-table-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="att-table-header">
                        <span>Employee</span>
                        <span>Department</span>
                        <span>Status</span>
                        <span>Month Summary</span>
                        <span>Actions</span>
                    </div>
                    {filtered.map((emp, i) => {
                        const empAtt = attendance[emp.id];
                        const status = empAtt?.status || 'unmarked';
                        const monthStats = getEmpMonthStats(emp.id);
                        return (
                            <motion.div key={emp.id} className={`att-row ${status}`}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <div className="att-cell emp-cell">
                                    <div className="att-avatar">{(emp.name || 'E').charAt(0).toUpperCase()}</div>
                                    <div>
                                        <span className="att-emp-name">{emp.name}</span>
                                        <span className="att-emp-role">{emp.designation || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="att-cell"><span className="att-dept">{emp.department || 'N/A'}</span></div>
                                <div className="att-cell">
                                    <span className={`att-status-badge ${status}`}>
                                        {status === 'unmarked' ? '—' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                </div>
                                <div className="att-cell month-cell">
                                    <span className="month-tag present">{monthStats.present}P</span>
                                    <span className="month-tag absent">{monthStats.absent}A</span>
                                    <span className="month-tag halfday">{monthStats.halfDay}H</span>
                                    <span className="month-tag leave">{monthStats.leave}L</span>
                                </div>
                                <div className="att-cell actions-cell">
                                    <button className={`att-btn present ${status === 'present' ? 'active' : ''}`}
                                        onClick={() => markAttendance(emp.id, 'present')} disabled={saving} title="Present">P</button>
                                    <button className={`att-btn absent ${status === 'absent' ? 'active' : ''}`}
                                        onClick={() => markAttendance(emp.id, 'absent')} disabled={saving} title="Absent">A</button>
                                    <button className={`att-btn halfday ${status === 'half-day' ? 'active' : ''}`}
                                        onClick={() => markAttendance(emp.id, 'half-day')} disabled={saving} title="Half Day">H</button>
                                    <button className={`att-btn leave ${status === 'leave' ? 'active' : ''}`}
                                        onClick={() => markAttendance(emp.id, 'leave')} disabled={saving} title="Leave">L</button>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
};

export default Attendance;
