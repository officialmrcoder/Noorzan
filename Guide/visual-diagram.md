# 🗺️ Project Visual Map & Diagrams

## 1️⃣ User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER USER JOURNEY                         │
└─────────────────────────────────────────────────────────────────┘

START
  │
  └─► Visit Website (/)
      │
      └─► See Products
          │
          ├─► Click Product → View Details (/products/[id])
          │
          └─► Click "Add to Cart"
              │
              ├─► Cart Updated
              │   (context/CartContext.js saves)
              │
              └─► Continue Shopping
                  │
                  └─► Review Cart (/cart)
                      │
                      ├─► Update Quantities
                      │
                      └─► Proceed to Checkout (/checkout)
                          │
                          └─► Enter Delivery Info
                              │
                              └─► Select Payment
                                  │
                                  └─► Submit Order
                                      │
                                      ├─► Order saved to DB
                                      │   (schema.sql → orders table)
                                      │
                                      └─► Confirmation Page (/order-success)
                                          │
                                          └─► END
```

---

## 2️⃣ User Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│              USER AUTHENTICATION SYSTEM                       │
└──────────────────────────────────────────────────────────────┘

NEW USER:
  │
  └─► Signup Form (/auth/signup)
      │
      └─► Enter Email & Password
          │
          └─► Supabase Auth (app/auth/signup/page.js)
              │
              ├─► User created in Supabase Auth
              │
              ├─► Trigger: Auto creates users table row
              │   (schema.sql trigger function)
              │
              ├─► Context updated (context/AuthContext.js)
              │
              └─► JWT token stored
                  │
                  └─► Redirected to /dashboard
                      │
                      └─► User logged in ✓


EXISTING USER:
  │
  └─► Login Form (/auth/login)
      │
      └─► Enter Email & Password
          │
          └─► Verify with Supabase
              │
              ├─► Credentials checked
              │
              ├─► JWT token created
              │
              ├─► Profile loaded (context/AuthContext.js)
              │
              └─► User logged in ✓
```

---

## 3️⃣ File Edit Impact Map

```
╔════════════════════════════════════════════════════════════╗
║         WHICH FILE AFFECTS WHAT ON WEBSITE                ║
╚════════════════════════════════════════════════════════════╝

components/Navbar.js
    ├─► Affects: Top menu bar on EVERY page
    ├─► Edit to: Add navigation links, change logo
    └─► Test on: Every page

app/globals.css
    ├─► Affects: ALL colors and global styles
    ├─► Edit to: Change theme, global fonts
    └─► Test on: Check entire website

tailwind.config.js
    ├─► Affects: All Tailwind classes
    ├─► Edit to: Change color palette, spacing
    └─► Test on: Visual elements

app/page.js (HOMEPAGE)
    ├─► Affects: Only "/" page
    ├─► Edit to: Change hero, sections
    └─► Test on: Homepage

app/about/page.js
    ├─► Affects: Only "/about" page
    ├─► Edit to: Change company info
    └─► Test on: About page

app/products/page.js
    ├─► Affects: "/products" page
    ├─► Edit to: Change filters, layout
    └─► Test on: Products page

context/AuthContext.js
    ├─► Affects: All auth-related pages
    ├─► Edit to: Change login logic
    └─► Test on: Login, signup, profile

schema.sql
    ├─► Affects: What data is stored
    ├─► Edit to: Add database fields
    └─► Test on: Run SQL in Supabase
```

---

## 4️⃣ Database Relationships

```
┌───────────────────────────────────────────────────────────┐
│              DATABASE RELATIONSHIPS                       │
└───────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │     USERS       │
    ├─────────────────┤
    │ id (PK)        │◄────┐
    │ full_name      │     │
    │ email          │     │
    │ phone          │     │
    │ avatar_url     │     │
    │ is_admin       │     │
    └─────────────────┘     │
            │               │
            │ (user_id FK)  │
            │               │
            ▼               │
    ┌─────────────────┐     │
    │    ORDERS       │     │
    ├─────────────────┤     │
    │ id (PK)        │     │
    │ user_id (FK) ──┘     │
    │ order_number   │     │
    │ total_amount   │     │
    │ status         │     │
    │ created_at     │     │
    └──────┬──────────┘     │
           │                │
           │ (order_id FK)  │
           │                │
           ▼                │
    ┌──────────────────┐   │
    │  ORDER_ITEMS     │   │
    ├──────────────────┤   │
    │ id (PK)         │   │
    │ order_id (FK) ──┘   │
    │ product_id ──────┐  │
    │ quantity         │  │
    │ price            │  │
    └──────────────────┘  │
                          │
    ┌─────────────────┐   │
    │   PRODUCTS      │   │
    ├─────────────────┤   │
    │ id (PK) ────────┼───┘
    │ name           │
    │ price          │
    │ description    │
    │ category       │
    │ image_url      │
    │ stock          │
    │ is_featured    │
    └─────────────────┘
```

**Relationships:**
- User → Many Orders (1-to-Many)
- Order → Many Order Items (1-to-Many)
- Order Item → One Product (Many-to-1)

---

## 5️⃣ Component Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│                   COMPONENT TREE                         │
└──────────────────────────────────────────────────────────┘

<Providers>
    (context/Providers.js - wraps all contexts)
    │
    ├─ <AuthProvider>
    ├─ <CartProvider>
    └─ <ToastProvider>
        │
        └─ <Layout>
            (app/layout.js)
            │
            ├─ <Navbar />
            │  (components/Navbar.js)
            │
            ├─ <main>
            │  (Page content changes here)
            │
            └─ <Footer />
               (components/Footer.js)


EXAMPLES OF PAGES:

Homepage (app/page.js)
    └─ <Layout>
        ├─ Hero Section
        ├─ Categories
        ├─ Featured Products
        │  └─ <ProductCard /> (multiple)
        └─ CTAs

Products Page (app/products/page.js)
    └─ <Layout>
        ├─ Filters
        └─ Product Grid
            └─ <ProductCard /> (many)

Product Detail (app/products/[id]/page.js)
    └─ <Layout>
        ├─ Product Image
        ├─ Product Info
        └─ Add to Cart Button
```

---

## 6️⃣ Page Structure Diagram

```
╔════════════════════════════════════════════════════════════╗
║                     PAGE STRUCTURE                         ║
╚════════════════════════════════════════════════════════════╝

EVERY PAGE HAS THIS STRUCTURE:

┌─────────────────────────────────────────┐
│          NAVBAR (fixed top)             │
│  Home | Products | About | Contact      │
├─────────────────────────────────────────┤
│                                         │
│          PAGE CONTENT                   │
│                                         │
│      (changes per page)                 │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│          FOOTER                         │
│  Company © 2026 | Follow Us | Contact   │
└─────────────────────────────────────────┘

FILES:
- Navbar: components/Navbar.js
- Content: app/[page]/page.js
- Footer: components/Footer.js
```

---

## 7️⃣ State Management Flow

```
┌────────────────────────────────────────────────────┐
│         GLOBAL STATE MANAGEMENT                    │
└────────────────────────────────────────────────────┘

USER LOGS IN
    │
    ▼
context/AuthContext.js
    ├─► user object (email, id)
    ├─► profile object (name, phone, avatar)
    ├─► isAdmin boolean
    ├─► login() function
    ├─► logout() function
    └─► refreshProfile() function
        │
        ├─► Used in: Any component checking auth
        ├─► Example: app/profile/page.js
        └─► Example: components/Navbar.js


USER ADDS TO CART
    │
    ▼
context/CartContext.js
    ├─► cart array (products in cart)
    ├─► cartCount number (how many items)
    ├─► addToCart() function
    ├─► removeFromCart() function
    ├─► updateQuantity() function
    └─► clearCart() function
        │
        ├─► Saved in: localStorage (browser storage)
        ├─► Persists even after: Page refresh
        ├─► Used in: Cart page, checkout
        └─► Example: app/cart/page.js


SHOW NOTIFICATION
    │
    ▼
context/ToastContext.js
    ├─► showToast(message, type)
    │   ├─► type: 'success' (green)
    │   ├─► type: 'error' (red)
    │   └─► type: 'info' (blue)
    │
    └─► Used after: Form submission
        ├─► "Profile updated successfully!"
        ├─► "Order placed!"
        └─► "Error: Please try again"
```

---

## 8️⃣ API Request Flow

```
┌────────────────────────────────────────────────────┐
│            HOW REQUESTS WORK                       │
└────────────────────────────────────────────────────┘

EXAMPLE: User places an order

1. User fills checkout form
    ↓
2. Clicks "Place Order" button
    ↓
3. React sends POST request to /api/orders
    │
    │ REQUEST BODY:
    │ {
    │   user_id: "123",
    │   items: [{product_id, quantity}],
    │   total: 5000,
    │   address: "...",
    │   city: "Lahore",
    │   phone: "03001234567"
    │ }
    │
    ▼
4. Backend receives request (app/api/orders/route.js)
    ↓
5. Validates data
    ↓
6. Calculates total
    ↓
7. Creates order in database
    ├─► Insert into orders table
    ├─► Insert into order_items table
    └─► Update product stock
    ↓
8. Sends response back to React
    │
    │ RESPONSE:
    │ {
    │   success: true,
    │   order_id: "abc123",
    │   message: "Order placed successfully"
    │ }
    │
    ▼
9. Frontend receives response
    ↓
10. Shows success toast
    ↓
11. Redirects to /order-success page
    ↓
12. Cart cleared
    ↓
13. Done! ✓
```

---

## 9️⃣ File Modification Quick Guide

```
┌────────────────────────────────────────────────────┐
│      WHAT TO EDIT FOR COMMON CHANGES              │
└────────────────────────────────────────────────────┘

🎯 WANT TO:                    📝 EDIT FILE:
────────────────────────────────────────────────────
Change website title          app/layout.js
Change hero text              app/page.js
Add new page                  app/[newpage]/page.js
Change colors                 tailwind.config.js
Add menu item                 components/Navbar.js
Change contact info           app/contact/page.js
Change about text             app/about/page.js
Add product field             schema.sql + app/admin/
Fix database                  Supabase dashboard
Change auth flow              context/AuthContext.js
Add toast message             context/ToastContext.js
Change cart behavior          context/CartContext.js
Update product display        components/ProductCard.js
Change footer                 components/Footer.js
```

---

## 🔟 Troubleshooting Map

```
┌────────────────────────────────────────────────────┐
│         PROBLEM → SOLUTION FINDER                 │
└────────────────────────────────────────────────────┘

PAGE NOT LOADING
    ├─ Check console (F12)
    ├─ Check file exists: app/[page]/page.js
    ├─ Check syntax errors
    └─ Restart: npm run dev

DATA NOT SHOWING
    ├─ Check Supabase connection
    ├─ Verify table exists in database
    ├─ Check .env.local keys
    └─ Check browser network tab

LOGIN NOT WORKING
    ├─ Verify email in Supabase Auth
    ├─ Check password correct
    ├─ Clear browser cookies
    └─ Check context/AuthContext.js

IMAGE NOT DISPLAYING
    ├─ Verify image URL valid
    ├─ Check Supabase storage public
    ├─ Check image format supported
    └─ Check browser console errors

STYLING LOOKS WRONG
    ├─ Check Tailwind classes
    ├─ Check tailwind.config.js
    ├─ Check app/globals.css
    └─ Rebuild: npm run build

CART NOT WORKING
    ├─ Check context/CartContext.js
    ├─ Check localStorage enabled
    ├─ Check browser console errors
    └─ Check component using useCart()
```

---

## 📊 Technology Decision Tree

```
NEED TO...                      USE THIS:
────────────────────────────────────────────────────
Make a page                  →  Next.js (app/page.js)
Style something              →  Tailwind CSS
Share data                   →  React Context
Get from database            →  Supabase
Store file                   →  Supabase Storage
Show message                 →  Toast context
Handle errors                →  Try/catch + toast
Get user info                →  Auth context
Loop/list items              →  Array.map() + component
Conditional render           →  if/else + JSX
Update data real-time        →  Supabase subscriptions
Send email                   →  SendGrid/Resend API
```

---

**Ready to code? Pick a task and find the right file! 🚀**
