# 🎒 E-Commerce Bags - Complete Developer Manual

## 📋 Project Overview

**Project Name:** BagHaven - E-Commerce Platform  
**Type:** Full-stack e-commerce web application  
**Built For:** Selling premium bags (backpacks, laptop bags, travel bags, etc.)  
**Live URL:** http://localhost:3000

---

## 🛠️ Tools & Technologies Used

### **Frontend**
- **Next.js 14** - React framework for building web app
- **React 18** - UI library for components
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Beautiful SVG icons
- **Context API** - State management for auth, cart, toast notifications

### **Backend/Database**
- **Supabase** - Backend-as-a-Service (database + authentication + storage)
- **PostgreSQL** - Database (hosted in Supabase)
- **JavaScript/Node.js** - Runtime environment

### **Authentication**
- **Supabase Auth** - User registration, login, password reset
- **JWT Tokens** - Secure user sessions

### **Storage**
- **Supabase Storage** - Profile photos and images
- **Cloudinary/Unsplash** - Sample product images

### **Development Tools**
- **Git** - Version control
- **Visual Studio Code** - Code editor
- **npm/yarn** - Package manager
- **PostCSS** - CSS processing

---

## 📁 Project Structure Explained

```
E-Commerce-Bags/
│
├── app/                          # Main Next.js app directory
│   ├── layout.js                 # Root layout for entire app
│   ├── page.js                   # Homepage
│   ├── globals.css               # Global styles
│   │
│   ├── about/
│   │   └── page.js               # About Us page
│   │
│   ├── admin/                    # Admin dashboard (only for admins)
│   │   ├── page.js               # Admin home
│   │   ├── products/
│   │   │   └── page.js           # Manage products
│   │   └── orders/
│   │       └── page.js           # View all orders
│   │
│   ├── api/                      # Backend API routes
│   │   ├── products/
│   │   │   └── route.js          # Get/create products
│   │   └── orders/
│   │       └── route.js          # Get/create orders
│   │
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.js         # User login
│   │   ├── signup/page.js        # User registration
│   │   ├── forgot-password/page.js
│   │   ├── reset-password/page.js
│   │   └── reset-callback/page.js
│   │
│   ├── cart/
│   │   └── page.js               # Shopping cart
│   │
│   ├── checkout/
│   │   └── page.js               # Checkout & payment
│   │
│   ├── contact/
│   │   └── page.js               # Contact Us form
│   │
│   ├── dashboard/
│   │   └── page.js               # User dashboard
│   │
│   ├── profile/
│   │   └── page.js               # User profile (edit name, phone, photo)
│   │
│   └── products/
│       ├── page.js               # All products page
│       └── [id]/page.js          # Single product details
│
├── components/                   # Reusable React components
│   ├── Navbar.js                 # Navigation bar
│   ├── Footer.js                 # Footer
│   ├── ProductCard.js            # Product display card
│   └── Providers.js              # Context providers wrapper
│
├── context/                      # Global state management
│   ├── AuthContext.js            # User authentication state
│   ├── CartContext.js            # Shopping cart state
│   └── ToastContext.js           # Notification messages
│
├── lib/                          # Helper functions & utilities
│   ├── supabase.js               # Supabase client setup
│   ├── mockData.js               # Sample product data
│   └── (utility functions)
│
├── public/                       # Static files (images, icons)
│
├── package.json                  # Project dependencies
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.mjs            # PostCSS config
├── jsconfig.json                 # JavaScript path aliases
│
└── schema.sql                    # Database schema (Supabase)
```

---

## 🔐 Key Features & How They Work

### **1. User Authentication (Login/Signup)**
**Files:**
- `app/auth/login/page.js` - Login form
- `app/auth/signup/page.js` - Registration form
- `context/AuthContext.js` - Auth state management

**How it works:**
1. User enters email & password in signup form
2. Data sent to Supabase authentication service
3. User profile automatically created in `public.users` table
4. JWT token stored in browser (secure cookie)
5. User logged in and redirected to homepage

---

### **2. User Profile (Edit Name, Phone, Photo)**
**Files:**
- `app/profile/page.js` - Profile page
- `schema.sql` - Users table

**How it works:**
1. User visits `/profile` page
2. Profile data loaded from Supabase `users` table
3. User can edit name, phone, and upload profile photo
4. Photo stored in Supabase Storage (`avatars` bucket)
5. Photo URL saved in database
6. Changes saved and displayed immediately

**Important:** Make sure `avatar_url` column exists in database. Run SQL if needed:
```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

---

### **3. Product Catalog**
**Files:**
- `app/products/page.js` - All products
- `app/products/[id]/page.js` - Product details
- `components/ProductCard.js` - Product card component
- `schema.sql` - Products table

**How it works:**
1. Homepage loads featured products from database
2. Products page shows all products with filters
3. Click product → view details page
4. Products fetched from Supabase `products` table
5. Product images from Unsplash (free service)

---

### **4. Shopping Cart**
**Files:**
- `app/cart/page.js` - Cart page
- `context/CartContext.js` - Cart state

**How it works:**
1. "Add to Cart" button stores product in browser context
2. Cart count shown in navbar badge
3. Cart persists in localStorage (survives page refresh)
4. Cart cleared after successful checkout

---

### **5. Checkout & Orders**
**Files:**
- `app/checkout/page.js` - Checkout form
- `app/api/orders/route.js` - Create order API
- `schema.sql` - Orders & order_items tables

**How it works:**
1. User fills checkout form (name, address, city, phone)
2. Selects payment method (COD or JazzCash/EasyPaisa)
3. Order saved to database with order items
4. Order confirmation page shown
5. Admin can view all orders in dashboard

---

### **6. Contact Form**
**Files:**
- `app/contact/page.js` - Contact page

**How it works:**
1. User fills contact form (name, email, phone, message)
2. Form validates required fields
3. Shows success toast notification
4. (In real implementation, send email to support)

---

### **7. Admin Dashboard**
**Files:**
- `app/admin/page.js` - Admin home
- `app/admin/products/page.js` - Manage products
- `app/admin/orders/page.js` - View orders

**How it works:**
1. Only users with `is_admin = true` can access
2. Admin can add/edit/delete products
3. Admin can view all customer orders
4. Admin can change order status

---

## 💾 Database Schema (Supabase)

### **1. Users Table**
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY,                    -- User ID from auth
    full_name TEXT,                         -- User's name
    email TEXT,                             -- User's email
    phone TEXT,                             -- User's phone
    avatar_url TEXT,                        -- Profile photo URL
    is_admin BOOLEAN DEFAULT false,         -- Admin flag
    created_at TIMESTAMP                    -- Account creation date
);
```

### **2. Products Table**
```sql
CREATE TABLE public.products (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,                     -- Product name
    price NUMERIC(10,2) NOT NULL,          -- Price
    description TEXT,                       -- Product description
    category TEXT NOT NULL,                 -- Category (backpack, laptop_bag, etc)
    image_url TEXT,                        -- Product image
    stock INTEGER DEFAULT 0,               -- Available quantity
    is_featured BOOLEAN DEFAULT false,     -- Show on homepage?
    display_order INTEGER,                 -- Sort order
    created_at TIMESTAMP
);
```

### **3. Orders Table**
```sql
CREATE TABLE public.orders (
    id UUID PRIMARY KEY,
    user_id UUID,                          -- Customer who placed order
    order_number TEXT UNIQUE,              -- Unique order ID
    total_amount NUMERIC(10,2),           -- Total price
    status TEXT DEFAULT 'Pending',         -- Pending/Confirmed/Shipped/Delivered
    shipping_address TEXT,                 -- Delivery address
    city TEXT,                             -- City
    phone TEXT,                            -- Contact phone
    payment_method TEXT,                   -- COD/JazzCash/EasyPaisa
    created_at TIMESTAMP
);
```

### **4. Order Items Table**
```sql
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY,
    order_id UUID,                         -- Which order?
    product_id UUID,                       -- Which product?
    quantity INTEGER,                      -- How many?
    price NUMERIC(10,2)                   -- Price per item
);
```

---

## 🔄 Context Management (State Management)

### **AuthContext** (`context/AuthContext.js`)
Manages user authentication state

```javascript
const { 
  user,                    // Current logged-in user
  profile,                 // User profile data
  isAdmin,                 // Is admin?
  loading,                 // Loading state
  login,                   // Function to login
  signup,                  // Function to signup
  logout                   // Function to logout
} = useAuth();
```

**Usage in component:**
```javascript
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <p>Please login first</p>;
  }
  
  return <button onClick={logout}>Logout</button>;
}
```

---

### **CartContext** (`context/CartContext.js`)
Manages shopping cart

```javascript
const {
  cart,              // Array of items in cart
  cartCount,         // Total items in cart
  addToCart,         // Add product to cart
  removeFromCart,    // Remove product from cart
  updateQuantity,    // Change quantity
  clearCart          // Empty cart
} = useCart();
```

---

### **ToastContext** (`context/ToastContext.js`)
Shows notification messages

```javascript
const { showToast } = useToast();

// Show success message
showToast('Profile updated!', 'success');

// Show error message
showToast('Something went wrong', 'error');

// Show info message
showToast('Please wait...', 'info');
```

---

## 📝 How to Make Common Changes

### **Adding a New Product**
1. Go to Supabase Dashboard
2. Click "Products" table
3. Click "Insert row"
4. Fill in: name, price, description, category, image_url, stock
5. Product appears on website automatically

### **Editing a Product**
1. Go to Supabase → Products table
2. Click on product row
3. Edit any field
4. Click "Save"
5. Changes appear on website in real-time

### **Changing Product Price**
File: `schema.sql` line 17
- Edit directly in Supabase or update schema

### **Adding a New Page**
1. Create folder in `app/` directory
2. Create `page.js` file inside
3. Write React component
4. Next.js automatically creates route

Example: New "Blog" page
```
app/blog/page.js → Website URL: /blog
```

### **Editing Homepage**
File: `app/page.js`
- Change hero title
- Edit featured products section
- Modify categories
- Update company info

### **Editing About Page**
File: `app/about/page.js`
- Change mission statement
- Edit company values
- Update stats/numbers
- Modify images

### **Editing Contact Page**
File: `app/contact/page.js`
- Change email/phone
- Edit business hours
- Add new contact methods
- Modify form fields

### **Changing Navigation**
File: `components/Navbar.js` line 30
```javascript
const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  // Add new link here:
  { name: 'Blog', path: '/blog' },
];
```

### **Changing Colors/Branding**
File: `tailwind.config.js`
- Change color scheme
- Modify spacing
- Update font

File: `app/globals.css`
- Global CSS changes

---

## 🚀 Running the Project Locally

### **Prerequisites**
- Node.js installed (v16+)
- npm or yarn
- Supabase account

### **Installation Steps**

1. **Clone project**
```bash
cd c:\Users\User\Desktop\E-Commerce-Bags
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env.local file** with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 🧪 Testing Checklist

- [ ] Signup with new email
- [ ] Login with credentials
- [ ] Edit profile (name, phone, photo)
- [ ] Add product to cart
- [ ] View cart
- [ ] Proceed to checkout
- [ ] Submit order
- [ ] Verify email received
- [ ] Admin can see order
- [ ] Admin can add product
- [ ] Product appears on website
- [ ] Contact form works
- [ ] Logout works

---

## 🐛 Common Issues & Solutions

### **Issue: "Could not find avatar_url column"**
**Solution:** Run this SQL in Supabase:
```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

### **Issue: Products not showing**
**Solution:** 
- Check if products exist in database
- Check Supabase connection in `lib/supabase.js`
- Verify `NEXT_PUBLIC_SUPABASE_URL` and key in `.env.local`

### **Issue: Login not working**
**Solution:**
- Verify email in Supabase Auth Users
- Check password is correct
- Check `.env.local` has correct credentials

### **Issue: Images not loading**
**Solution:**
- Check image URL is correct
- Verify Supabase Storage bucket is public
- Use valid image URLs

### **Issue: Cart empty after refresh**
**Solution:**
- This is normal (localStorage cleared)
- To persist: implement Redux or database storage

---

## 📊 Deployment (to Vercel)

1. Push code to GitHub
2. Go to vercel.com
3. Import GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy
6. Website goes live! 🎉

---

## 👨‍💻 Developer References

### **Important Files at a Glance**

| Task | File |
|------|------|
| Add new page | `app/[pagename]/page.js` |
| Change colors | `tailwind.config.js` |
| Add navigation link | `components/Navbar.js` |
| Change database | `schema.sql` |
| Fix auth issues | `context/AuthContext.js` |
| Add API endpoint | `app/api/[route]/route.js` |
| Global styles | `app/globals.css` |
| Settings | `.env.local` |

---

## 📞 Support & Documentation

- **Next.js Docs:** nextjs.org/docs
- **Tailwind CSS:** tailwindcss.com/docs
- **Supabase:** supabase.com/docs
- **React:** react.dev

---

## 📝 Version History

- **v1.0** (May 2026)
  - Basic e-commerce functionality
  - Product catalog
  - User authentication
  - Shopping cart
  - Order management
  - Admin dashboard
  - Profile management
  - Contact form

---

## ✅ Checklist for Future Developers

Before making changes:
- [ ] Read this manual
- [ ] Understand project structure
- [ ] Know which file to edit
- [ ] Check database schema
- [ ] Test changes locally
- [ ] Use git for version control
- [ ] Document your changes

After making changes:
- [ ] Test thoroughly
- [ ] Check for errors in console
- [ ] Verify database connections
- [ ] Update this manual if needed
- [ ] Push to GitHub

---

**Happy coding! 🚀**
