import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle, signup } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            setError('');
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Failed to sign in with Google.');
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // Navigation will be handled by the auth state change
            navigate('/');
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="bg-gradient"></div>
                <div className="bg-pattern"></div>
            </div>

            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-card">
                    <div className="auth-header">
                        <motion.div
                            className="auth-logo"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <span className="logo-icon">ST</span>
                        </motion.div>
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">Sign in to access SAMY TRENDS</p>
                    </div>

                    {error && (
                        <motion.div
                            className="auth-error"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <motion.button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <span className="button-loader"></span>
                            ) : (
                                <>
                                    Sign In
                                    <FiArrowRight />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="auth-divider">
                        <span>or continue with</span>
                    </div>

                    <button
                        type="button"
                        className="google-btn"
                        onClick={handleGoogleLogin}
                    >
                        <FcGoogle className="google-icon" />
                        Sign in with Google
                    </button>

                    <div className="demo-accounts">
                        <p className="demo-title">Demo Accounts:</p>
                        <div className="demo-list">
                            <button
                                className="demo-btn"
                                onClick={async () => {
                                    const email = 'admin@samytrends.com';
                                    const pass = 'admin123';
                                    setEmail(email);
                                    setPassword(pass);
                                    try {
                                        await login(email, pass);
                                        navigate('/');
                                    } catch (err) {
                                        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                                            try {
                                                await signup(email, pass, 'admin', { name: 'Admin User' });
                                                navigate('/');
                                            } catch (createErr) {
                                                setError('Could not create demo admin. ' + createErr.message);
                                            }
                                        } else {
                                            setError('Login failed: ' + err.message);
                                        }
                                    }
                                }}
                            >
                                Admin
                            </button>
                            <button
                                className="demo-btn"
                                onClick={async () => {
                                    const email = 'cashier@samytrends.com';
                                    const pass = 'cashier123';
                                    setEmail(email);
                                    setPassword(pass);
                                    try {
                                        await login(email, pass);
                                        navigate('/');
                                    } catch (err) {
                                        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                                            try {
                                                await signup(email, pass, 'cashier', { name: 'Cashier User' });
                                                navigate('/');
                                            } catch (createErr) {
                                                setError('Could not create demo cashier. ' + createErr.message);
                                            }
                                        } else {
                                            setError('Login failed: ' + err.message);
                                        }
                                    }
                                }}
                            >
                                Cashier
                            </button>
                            <button
                                className="demo-btn"
                                onClick={async () => {
                                    const email = 'user@samytrends.com';
                                    const pass = 'user123';
                                    setEmail(email);
                                    setPassword(pass);
                                    try {
                                        await login(email, pass);
                                        navigate('/');
                                    } catch (err) {
                                        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                                            try {
                                                await signup(email, pass, 'user', { name: 'Demo User' });
                                                navigate('/');
                                            } catch (createErr) {
                                                setError('Could not create demo user. ' + createErr.message);
                                            }
                                        } else {
                                            setError('Login failed: ' + err.message);
                                        }
                                    }
                                }}
                            >
                                User
                            </button>
                        </div>
                    </div>

                    <p className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/register">Create Account</Link>
                    </p>
                </div>

                <div className="auth-info">
                    <motion.div
                        className="info-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2>SAMY TRENDS</h2>
                        <p className="tagline">Smart Inventory & Billing System</p>
                        <div className="features-list">
                            <div className="feature-item">
                                <span className="feature-icon">📊</span>
                                <span>Real-time Analytics</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💳</span>
                                <span>Fast POS Billing</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🛒</span>
                                <span>E-Commerce Ready</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📦</span>
                                <span>Inventory Management</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
