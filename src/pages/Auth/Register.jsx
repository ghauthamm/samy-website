import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleRegister = async () => {
        try {
            setError('');
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Failed to sign up with Google.');
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await signup(formData.email, formData.password, 'user', {
                name: formData.name,
                phone: formData.phone
            });
            navigate('/');
        } catch (err) {
            setError('Failed to create account. Please try again.');
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
                <div className="auth-card register-card">
                    <div className="auth-header">
                        <motion.div
                            className="auth-logo"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <span className="logo-icon">ST</span>
                        </motion.div>
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join SAMY TRENDS today</p>
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
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <div className="input-wrapper">
                                    <FiUser className="input-icon" />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <div className="input-wrapper">
                                    <FiPhone className="input-icon" />
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create password"
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

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <label className="checkbox-wrapper terms">
                            <input type="checkbox" required />
                            <span className="checkmark"></span>
                            I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                        </label>

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
                                    Create Account
                                    <FiArrowRight />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="auth-divider">
                        <span>or sign up with</span>
                    </div>

                    <button
                        type="button"
                        className="google-btn"
                        onClick={handleGoogleRegister}
                    >
                        <FcGoogle className="google-icon" />
                        Sign up with Google
                    </button>

                    <p className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login">Sign In</Link>
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
                                <span className="feature-icon">🚀</span>
                                <span>Quick Setup</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🔒</span>
                                <span>Secure Platform</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📱</span>
                                <span>Mobile Friendly</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💡</span>
                                <span>Easy to Use</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
