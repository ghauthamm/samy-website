import { motion } from 'framer-motion';
import './PageLoader.css';

const PageLoader = () => {
    return (
        <div className="page-loader">
            <motion.div
                className="loader-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="loader-logo">
                    <motion.span
                        className="logo-text"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        SAMY TRENDS
                    </motion.span>
                </div>
                <div className="loader-spinner">
                    <motion.div
                        className="spinner-ring"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="spinner-ring inner"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                </div>
                <motion.p
                    className="loader-text"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Loading...
                </motion.p>
            </motion.div>
        </div>
    );
};

export default PageLoader;
