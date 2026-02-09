import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Diagnostic = () => {
    const { currentUser, userRole, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const diagnosticInfo = {
        currentPath: location.pathname,
        isLoading: loading,
        isAuthenticated: !!currentUser,
        userEmail: currentUser?.email || 'Not logged in',
        userRole: userRole || 'No role assigned',
        userId: currentUser?.uid || 'N/A',
        timestamp: new Date().toISOString()
    };

    return (
        <div style={{
            padding: '2rem',
            fontFamily: 'monospace',
            maxWidth: '800px',
            margin: '0 auto',
            background: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <h1 style={{ color: '#dc2626' }}>🔍 Admin Panel Diagnostic</h1>

            <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2>Authentication Status</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        {Object.entries(diagnosticInfo).map(([key, value]) => (
                            <tr key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold', width: '200px' }}>
                                    {key}:
                                </td>
                                <td style={{ padding: '12px', color: '#059669' }}>
                                    {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2>Issues & Solutions</h2>

                {!currentUser && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #dc2626',
                        padding: '1rem',
                        borderRadius: '6px',
                        marginBottom: '1rem'
                    }}>
                        <h3 style={{ color: '#dc2626', margin: '0 0 0.5rem 0' }}>
                            ❌ Not Authenticated
                        </h3>
                        <p>You need to log in to access the admin panel.</p>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginTop: '0.5rem'
                            }}
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {currentUser && userRole !== 'admin' && (
                    <div style={{
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        padding: '1rem',
                        borderRadius: '6px',
                        marginBottom: '1rem'
                    }}>
                        <h3 style={{ color: '#d97706', margin: '0 0 0.5rem 0' }}>
                            ⚠️ Insufficient Permissions
                        </h3>
                        <p>Your current role is <strong>"{userRole}"</strong>. You need the <strong>"admin"</strong> role to access the admin panel.</p>
                        <p>Please log in with the admin account:</p>
                        <ul>
                            <li><strong>Email:</strong> admin@samytrends.com</li>
                            <li><strong>Password:</strong> admin123</li>
                        </ul>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                background: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginTop: '0.5rem'
                            }}
                        >
                            Switch to Admin Account
                        </button>
                    </div>
                )}

                {currentUser && userRole === 'admin' && (
                    <div style={{
                        background: '#d1fae5',
                        border: '1px solid #059669',
                        padding: '1rem',
                        borderRadius: '6px',
                        marginBottom: '1rem'
                    }}>
                        <h3 style={{ color: '#059669', margin: '0 0 0.5rem 0' }}>
                            ✅ All Good!
                        </h3>
                        <p>You're logged in as an admin. You should have full access to the admin panel.</p>
                        <button
                            onClick={() => navigate('/admin')}
                            style={{
                                background: '#059669',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginTop: '0.5rem'
                            }}
                        >
                            Go to Admin Panel
                        </button>
                    </div>
                )}
            </div>

            <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate('/admin')}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Admin Panel
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Diagnostic;
