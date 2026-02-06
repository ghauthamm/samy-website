# SAMY TRENDS - Smart Inventory & E-Commerce System

Professional retail management system consisting of three integrated modules:
1. **Admin Panel**: For store management, analytics, and inventory control.
2. **POS (Billing) Panel**: For fast, efficient counter checkout.
3. **E-Commerce Shop**: For customers to browse and purchase online.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:5173`

## 🔑 Access Credentials (Demo)

The application comes with 3 preset roles. You can use these credentials to log in:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@samytrends.com` | `admin123` | Full access to Admin Dashboard |
| **Cashier** | `cashier@samytrends.com` | `cashier123` | Access to POS System only |
| **User** | `user@samytrends.com` | `user123` | Access to E-Commerce Store |

## 📦 Features

### 1. Admin Dashboard (`/admin`)
- **Real-time Analytics**: Sales, Orders, and revenue charts using Recharts.
- **Product Management**: Add, edit, delete products with image support.
- **Inventory Tracking**: Visual indicators for low stock and out-of-stock items.
- **Responsive Sidebar**: Collapsible navigation for better screen space.

### 2. POS System (`/pos`)
- **Fast Billing**: Quick product search and barcode simulation.
- **Cart Management**: Adjust quantities, remove items, clear cart.
- **Calculation**: Automatic Subtotal, Tax (18% GST), and Discount math.
- **Payment Types**: Cash, Card, UPI payment simulation.
- **Invoice Generation**: Generates unique invoice numbers.

### 3. E-Commerce Store (`/`)
- **Modern UI**: Hero section, featured products, and newsletter signup.
- **Shop Page**: Advanced filtering, sorting, and view toggles (Grid/List).
- **Cart & Wishlist**: Persistent cart using LocalStorage.
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite
- **Styling**: Vanilla CSS with comprehensive Design System (Variables)
- **State Management**: React Context API
- **Backend/Auth**: Firebase (Auth, Realtime Database, Storage)
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: React Icons (Feather)
- **Charts**: Recharts

## 🎨 Design System

The application uses a cohesive **Red & White** retail theme with:
- **Primary Color**: Red (`#ef4444`, `#dc2626`)
- **Typography**: Inter (UI) and Poppins (Headings)
- **Glassmorphism**: Subtle glass effects on cards and modals
- **Micro-interactions**: Hover effects, button animations, page transitions

## 📂 Project Structure

```
src/
├── components/     # Global reusable components (Loader, etc.)
├── config/         # Firebase configuration
├── contexts/       # Global state (Auth, Cart)
├── layouts/        # Layout wrappers for Admin, POS, and Shop
├── pages/
│   ├── Admin/      # Admin dashboard and product management
│   ├── Auth/       # Login and Register pages
│   ├── POS/        # Billing interface
│   └── Shop/       # E-Commerce pages (Home, Shop, Cart)
└── index.css       # Global variables and resets
```

## ⚠️ Notes

- **Firebase**: The project is connected to a live Firebase demo project (`samy-website`). Data changes will persist.
- **LocalStorage**: Cart data is saved in the browser's LocalStorage, so it persists across reloads.
