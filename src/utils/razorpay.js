/**
 * Razorpay Payment Integration Utility
 * This file handles all Razorpay payment operations
 */

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

/**
 * Initiate Razorpay payment
 * @param {Object} orderDetails - Order details including amount, customer info, etc.
 * @param {Function} onSuccess - Callback on successful payment
 * @param {Function} onFailure - Callback on failed payment
 */
export const initiatePayment = async (orderDetails, onSuccess, onFailure) => {
    try {
        // Load Razorpay script
        const isScriptLoaded = await loadRazorpayScript();

        if (!isScriptLoaded) {
            throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderDetails.amount * 100, // Amount in paise (multiply by 100)
            currency: orderDetails.currency || 'INR',
            name: 'Samy Trends',
            description: orderDetails.description || 'Purchase from Samy Trends',
            image: '/logo.png', // Optional: Add your logo
            handler: function (response) {
                // Payment successful
                onSuccess({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                });
            },
            prefill: {
                name: orderDetails.customerName || '',
                email: orderDetails.customerEmail || '',
                contact: orderDetails.customerPhone || ''
            },
            notes: {
                address: orderDetails.address || '',
                items: JSON.stringify(orderDetails.items || [])
            },
            theme: {
                color: '#6366f1' // Your brand color
            },
            modal: {
                ondismiss: function () {
                    if (onFailure) {
                        onFailure({ error: 'Payment cancelled by user' });
                    }
                }
            }
        };

        // Only add order_id if it's a valid Razorpay order (created from backend)
        // For now, we skip order_id to allow test payments without backend
        if (orderDetails.orderId && orderDetails.orderId.startsWith('order_')) {
            // Only add if it looks like a real Razorpay order ID
            // In production, this should always come from your backend
            console.warn('Using order_id:', orderDetails.orderId);
            options.order_id = orderDetails.orderId;
        }

        const razorpay = new window.Razorpay(options);

        razorpay.on('payment.failed', function (response) {
            onFailure({
                error: response.error.description,
                code: response.error.code,
                metadata: response.error.metadata
            });
        });

        razorpay.open();
    } catch (error) {
        console.error('Payment initiation error:', error);
        if (onFailure) {
            onFailure({ error: error.message });
        }
    }
};

/**
 * Create order ID (This is a mock - In production, this should be from backend)
 * In a real application, you should call your backend API to create an order
 * and get the order_id from Razorpay
 */
export const createOrderId = async (amount) => {
    // This is a mock function
    // In production, implement a backend endpoint that calls Razorpay's Order API
    // Example backend call:
    // const response = await fetch('/api/create-order', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ amount })
    // });
    // const data = await response.json();
    // return data.orderId;

    console.warn('Using mock order ID. Implement backend order creation for production.');
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Verify payment (Should be done on backend for security)
 * This is a placeholder - implement backend verification in production
 */
export const verifyPayment = async (paymentData) => {
    // In production, send this to your backend for verification
    // Your backend should verify the signature using Razorpay's webhook
    console.log('Payment data to verify:', paymentData);

    // Mock verification
    return {
        verified: true,
        message: 'Payment verified successfully (mock)'
    };
};
