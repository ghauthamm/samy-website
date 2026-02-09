# My Orders Page - User Guide

## 📦 Overview

The My Orders page allows users to view and track all their orders in one beautiful, organized interface.

## ✨ Features

### Main Features:
- **Order Listing**: View all your orders in a card-based grid
- **Order Filtering**: Filter by status (All, Paid, Pending, Processing, Shipped, Delivered)
- **Order Statistics**: See total orders and completed orders at a glance
- **Detailed View**: Click any order to see complete details in a modal
- **Real-time Updates**: Orders sync automatically from Firebase
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

### Order Card Information:
- Order ID
- Order Status with color coding
- Order Date & Time
- Product Images Preview
- Item Count
- Total Amount
- Payment Method (Online/COD)
- Quick "View Details" button

### Order Details Modal:
- Complete order information
- Payment ID (for online payments)
- Order status with badge
- Full delivery address
- Customer contact details
- All ordered items with quantities and prices
- Payment summary
- Total amount breakdown

## 🎨 Design Features

- **Gradient Background**: Beautiful purple gradient matching the app theme
- **Color-Coded Status**: Each status has a unique color
  - ⏰ Pending - Orange
  - ✅ Paid - Green
  - 📦 Processing - Blue
  - 🚚 Shipped - Purple
  - ✅ Delivered - Green
  - ❌ Cancelled - Red

- **Smooth Animations**: Cards animate in with staggered delays
- **Hover Effects**: Cards lift on hover for better interaction
- **Modal Animation**: Smooth scale-in animation for order details

## 🚀 How to Access

### As a User:
1. **From Navigation**: Click "Orders" in the navigation menu
2. **Direct URL**: Navigate to `/orders`
3. **After Checkout**: View your order after successful payment

## 📱 Usage

### Viewing Orders:

1. **Navigate to Orders Page**
   ```
   http://localhost:5173/orders
   ```

2. **Filter Orders**
   - Click filter buttons at the top
   - Options: All, Paid, Pending, Processing, Shipped, Delivered

3. **View Order Details**
   - Click on any order card
   - Modal opens with complete order information
   - Click X or outside modal to close

### Order Information Displayed:

**On Card:**
- Order ID (e.g., `RZP_pay_123abc`)
- Status Badge
- Order Date (e.g., "9 Feb 2026, 11:30 AM")
- Product Images (up to 3, +more indicator)
- Item Count
- Total Amount
- Payment Method Icon

**In Modal:**
- All card information plus:
- Payment ID
- Full customer name
- Complete delivery address
- Phone & Email
- Each ordered item details
- Item-wise pricing
- Payment method details

## 🔐 User Authentication

### Current Behavior:
- **Logged-in Users**: Shows only their orders (filtered by userId)
- **Guest Users**: Shows all orders (for demo purposes)

### For Production:
Update the code to require login:

```javascript
// In MyOrders.jsx
useEffect(() => {
    if (!currentUser) {
        // Redirect to login
        navigate('/login');
        return;
    }
    loadUserOrders();
}, [currentUser]);
```

## 💾 Data Source

Orders are fetched from Firebase Realtime Database:

**Database Path:**
```
firebase
  └── orders/
      └── {orderId}/
          ├── orderId: "RZP_pay_123"
          ├── paymentId: "pay_123abc"
          ├── amount: 2999
          ├── items: [...]
          ├── customerDetails: {...}
          ├── status: "paid"
          ├── paymentMethod: "razorpay"
          ├── createdAt: "2026-02-09T11:30:00.000Z"
          └── userId: "firebase_user_id"
```

## 🎯 Status Flow

Typical order status progression:

```
Pending → Paid → Processing → Shipped → Delivered
          ↓
      Cancelled (if needed)
```

## 🛠️ Customization

### Update Status Colors:

In `MyOrders.jsx`, modify the `getStatusInfo` function:

```javascript
const getStatusInfo = (status) => {
    const statusMap = {
        pending: { label: 'Pending', color: '#f59e0b', icon: FiClock },
        paid: { label: 'Paid', color: '#10b981', icon: FiCheck },
        // Add more statuses or change colors
    };
    return statusMap[status?.toLowerCase()];
};
```

### Add New Filters:

In the filters section, add new status options:

```javascript
{['all', 'paid', 'pending', 'processing', 'shipped', 'delivered', 'your_new_status'].map(...)}
```

### Customize Card Layout:

Edit `MyOrders.css` to modify the card grid:

```css
.orders-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    /* Change minmax values for different card sizes */
}
```

## 📊 Order Statistics

The page automatically calculates and displays:
- **Total Orders**: All orders count
- **Completed Orders**: Orders with "paid" status

Add more statistics by modifying the header-stats section:

```javascript
<div className="stat-card">
    <span className="stat-value">
        {orders.filter(o => o.status === 'shipped').length}
    </span>
    <span className="stat-label">Shipped</span>
</div>
```

## 🔍 Search & Advanced Filtering

### Add Search Functionality:

```javascript
const [searchQuery, setSearchQuery] = useState('');

const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.orderId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
});
```

### Add Date Range Filter:

```javascript
const [dateRange, setDateRange] = useState({ start: null, end: null });

const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const matchesDate = 
        (!dateRange.start || orderDate >= dateRange.start) &&
        (!dateRange.end || orderDate <= dateRange.end);
    return matchesDate;
});
```

## 📱 Mobile Optimization

The page is fully responsive with:
- **Desktop**: Multi-column grid
- **Tablet**: 2 columns
- **Mobile**: Single column with full-width cards
- **Horizontal Scrolling**: Filter buttons scroll on small screens

## ⚡ Performance

- **Lazy Loading**: Orders load from Firebase on mount
- **Real-time Sync**: Uses Firebase onValue for live updates
- **Optimized Rendering**: Uses React keys and memo where needed

## 🚀 Future Enhancements

### Suggested Features:
1. **Export Orders**: Download as PDF or CSV
2. **Order Tracking**: Integration with shipping APIs
3. **Reorder**: Quick reorder from past orders
4. **Invoice Download**: Generate and download invoices
5. **Order Cancellation**: Allow users to cancel pending orders
6. **Filters**: Advanced filtering (date range, amount range)
7. **Pagination**: For users with many orders
8. **Print**: Print order details

### Implementation Example (Reorder):

```javascript
const handleReorder = (order) => {
    order.items.forEach(item => {
        addToCart(item, item.quantity);
    });
    navigate('/cart');
};
```

## 🐛 Troubleshooting

### Orders Not Showing:
- Check Firebase database rules
- Verify `userId` is correctly saved with orders
- Check browser console for errors
- Ensure user is logged in (if authentication is enforced)

### Status Colors Not Showing:
- Ensure status in database matches case-insensitive check
- Verify CSS is loaded
- Check browser developer tools for style conflicts

### Modal Not Opening:
- Check for JavaScript errors
- Verify `selectedOrder` state is updating
- Ensure modal overlay z-index is high enough

## 📝 Code Structure

```
src/pages/Shop/
├── MyOrders.jsx       # Main component
└── MyOrders.css       # Styles
```

**Component Structure:**
```
MyOrders
├── Loading State
├── Orders Header
│   ├── Title
│   └── Statistics
├── Filters
├── Orders Grid / Empty State
│   └── Order Cards
│       ├── Header (ID, Status)
│       ├── Date
│       ├── Items Preview
│       ├── Footer (Amount, Payment)
│       └── View Details Button
└── Order Details Modal
    ├── Order Info
    ├── Customer Details
    ├── Ordered Items
    └── Payment Summary
```

## ✅ Testing Checklist

- [ ] Orders load from Firebase
- [ ] Filters work correctly
- [ ] Order cards display all information
- [ ] Modal opens/closes properly
- [ ] Responsive on mobile
- [ ] Empty state shows when no orders
- [ ] Statistics calculate correctly
- [ ] Status colors display properly
- [ ] Date formatting works
- [ ] Images load or show placeholder

---

**Route**: `/orders`
**Component**: `MyOrders.jsx`
**Styles**: `MyOrders.css`
**Database**: `firebase/orders`

**Last Updated**: February 9, 2026
