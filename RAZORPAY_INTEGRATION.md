# Razorpay Payment Integration Guide

## 📋 Overview

This document provides comprehensive information about the Razorpay payment gateway integration in Samy Trends e-commerce application.

## 🔑 Credentials

Your Razorpay credentials have been securely stored in the `.env` file:

- **Key ID**: `rzp_test_1DP5mmOlF5G5ag`
- **Key Secret**: `8z6g2V9C8m0u9xTqSAMPLE`

**⚠️ Security Note**: The `.env` file is already included in `.gitignore` and will NOT be committed to your repository.

## 🏗️ Architecture

### Files Created

1. **`.env`** - Environment variables for Razorpay credentials
2. **`src/utils/razorpay.js`** - Razorpay utility functions
3. **`src/pages/Checkout/CheckoutPage.jsx`** - Checkout page component
4. **`src/pages/Checkout/CheckoutPage.css`** - Checkout page styles
5. **`src/pages/OrderSuccess/OrderSuccessPage.jsx`** - Order success page
6. **`src/pages/OrderSuccess/OrderSuccessPage.css`** - Order success styles

### Files Modified

1. **`src/App.jsx`** - Added routes for checkout and order success pages
2. **`src/pages/Shop/Cart.jsx`** - Added checkout navigation

## 🎯 Features Implemented

### 1. **Checkout Page**
- Customer information form with validation
- Shipping address collection
- Payment method selection (Razorpay/COD)
- Order summary with item list
- Tax and shipping calculations
- Secure checkout indicator

### 2. **Payment Integration**
- Razorpay SDK integration
- Support for multiple payment methods:
  - Credit/Debit Cards
  - UPI
  - Net Banking
  - Wallets
- Payment success/failure handling
- Order creation in Firebase database

### 3. **Order Success Page**
- Order confirmation display
- Order timeline visualization
- Order details summary
- Ordered items list
- Navigation options

## 🚀 How It Works

### User Flow

1. **Cart → Checkout**
   - User adds items to cart
   - Clicks "Proceed to Checkout" from cart page
   - Redirected to `/checkout`

2. **Checkout Form**
   - User fills in customer details
   - Enters shipping address
   - Selects payment method

3. **Payment Processing**
   - For Razorpay: Opens Razorpay payment modal
   - For COD: Creates order directly
   - Validates payment/order

4. **Order Confirmation**
   - Order saved to Firebase
   - Cart cleared
   - Redirected to `/order-success`

### Technical Flow

```javascript
// 1. User submits checkout form
handleSubmit() → validateForm()

// 2. For Razorpay payment
createOrderId() → initiatePayment()

// 3. Razorpay modal opens
User completes payment

// 4. Payment callback
handlePaymentSuccess() → saveOrderToDatabase()

// 5. Order confirmation
clearCart() → navigate('/order-success')
```

## 📝 Code Examples

### Initiating Payment

```javascript
import { initiatePayment, createOrderId } from '../utils/razorpay';

const handleCheckout = async () => {
    const orderId = await createOrderId(totalAmount);
    
    await initiatePayment(
        {
            amount: totalAmount,
            orderId: orderId,
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '9876543210'
        },
        handlePaymentSuccess,
        handlePaymentFailure
    );
};
```

### Handling Success

```javascript
const handlePaymentSuccess = async (paymentResponse) => {
    // Save order to database
    const orderData = {
        orderId: paymentResponse.razorpay_order_id,
        paymentId: paymentResponse.razorpay_payment_id,
        amount: total,
        items: cartItems,
        status: 'paid'
    };
    
    await saveOrderToDatabase(orderData);
    clearCart();
    navigate('/order-success');
};
```

## ⚙️ Environment Setup

### Development

The `.env` file is already configured with your test credentials. The application will automatically use these when running locally.

```env
VITE_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
VITE_RAZORPAY_KEY_SECRET=8z6g2V9C8m0u9xTqSAMPLE
```

### Production

For production deployment:

1. Get production keys from Razorpay Dashboard
2. Update environment variables on your hosting platform
3. Never commit production keys to repository

**Vercel/Netlify**:
```bash
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
VITE_RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
```

## 🔐 Security Considerations

### Current Implementation (Test Mode)

✅ **What's Secure:**
- API keys stored in environment variables
- Environment file not committed to Git
- Payment processing via Razorpay's secure modal
- HTTPS enforced (in production)

⚠️ **For Production:**

1. **Backend Order Creation** (Important!)
   ```javascript
   // Currently: Frontend creates order ID (mock)
   const orderId = `order_${Date.now()}`;
   
   // Production: Backend should create order
   const response = await fetch('/api/create-razorpay-order', {
       method: 'POST',
       body: JSON.stringify({ amount, items })
   });
   const { orderId } = await response.json();
   ```

2. **Payment Verification**
   - Current: Basic verification on frontend
   - Production: MUST verify signature on backend
   
   ```javascript
   // Backend verification (Node.js example)
   const crypto = require('crypto');
   
   const verifyPayment = (orderId, paymentId, signature) => {
       const text = orderId + '|' + paymentId;
       const generated = crypto
           .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
           .update(text)
           .digest('hex');
       
       return generated === signature;
   };
   ```

3. **Webhook Setup**
   - Configure Razorpay webhooks to handle payment events
   - Verify webhook signatures
   - Update order status based on webhook events

## 📊 Database Structure

Orders are saved to Firebase with the following structure:

```javascript
{
    orderId: "order_12345_abc",
    paymentId: "pay_xyz789",  // Only for successful Razorpay payments
    amount: 2999,
    items: [
        {
            id: "1",
            name: "Product Name",
            price: 999,
            quantity: 2,
            image: "url"
        }
    ],
    customerDetails: {
        fullName: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
        address: "123 Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
    },
    status: "paid" | "pending",
    paymentMethod: "razorpay" | "cod",
    createdAt: "2026-02-09T11:25:30.000Z",
    userId: "firebase_user_id"
}
```

## 🧪 Testing

### Test Cards

Razorpay provides test cards for testing payments:

**Success:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: 4111 1111 1111 1234
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI

- UPI ID: success@razorpay
- For failed payment: failure@razorpay

### Test Flow

1. Add items to cart
2. Go to checkout (`/checkout`)
3. Fill form with valid details
4. Select Razorpay payment
5. Use test card credentials
6. Complete payment
7. Verify order in Firebase
8. Check order success page

## 🐛 Troubleshooting

### Common Issues

**1. Razorpay SDK not loading**
```javascript
Error: Razorpay is not defined
```
**Solution**: Check internet connection. The SDK is loaded dynamically from CDN.

**2. Payment modal not opening**
```javascript
Error: Invalid API key
```
**Solution**: Verify `.env` file exists and contains correct credentials. Restart dev server.

**3. Environment variables not working**
```javascript
undefined values in import.meta.env
```
**Solution**: 
- Ensure `.env` is in root directory
- Variables must start with `VITE_`
- Restart dev server after adding `.env`

**4. Orders not saving**
```javascript
Error: Permission denied
```
**Solution**: Check Firebase database rules. Ensure write permissions for orders.

## 🔄 Future Enhancements

### Recommended Improvements

1. **Backend Integration**
   - Create Node.js/Express backend for order creation
   - Implement payment verification
   - Add webhook handlers

2. **Advanced Features**
   - Discount/coupon code functionality
   - Partial payments
   - Subscription payments
   - EMI options

3. **User Experience**
   - Save shipping addresses for logged-in users
   - Order tracking page
   - Email notifications
   - Invoice generation

4. **Analytics**
   - Track payment success rate
   - Monitor failed transactions
   - Analyze popular payment methods

## 📚 Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Web Integration Guide](https://razorpay.com/docs/payment-gateway/web-integration/)
- [Test Credentials](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Webhooks](https://razorpay.com/docs/webhooks/)

## 🆘 Support

### Razorpay Support
- Email: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com/

### Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ✅ Integration Checklist

- [x] Environment variables configured
- [x] Razorpay utility functions created
- [x] Checkout page implemented
- [x] Payment form with validation
- [x] Order summary display
- [x] Payment success handling
- [x] Payment failure handling
- [x] Order persistence in Firebase
- [x] Order success page
- [x] Cart integration
- [x] Routes configured
- [ ] Backend order creation (For Production)
- [ ] Backend payment verification (For Production)
- [ ] Webhook setup (For Production)
- [ ] Production credentials (When deploying)

## 📄 License

This integration follows Razorpay's terms of service and your application's license.

---

**Last Updated**: February 9, 2026

For questions or issues, refer to the troubleshooting section or Razorpay's official documentation.
