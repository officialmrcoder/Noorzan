# 🚀 Quick Reference Guide - E-Commerce Bags Project

## مختصر گائیڈ (Quick Guide)

### **Project Name:** BagHaven
### **Type:** Selling Premium Bags
### **Technology:** Next.js + Supabase

---

## 🔧 Tools Used

```
Frontend:    Next.js, React, Tailwind CSS, Lucide Icons
Backend:     Supabase (PostgreSQL Database)
Auth:        Supabase Authentication
Storage:     Supabase Storage (for photos)
```

---

## 📁 Where to Find What?

| What | File |
|------|------|
| **Homepage** | `app/page.js` |
| **About Us** | `app/about/page.js` |
| **Products List** | `app/products/page.js` |
| **Single Product** | `app/products/[id]/page.js` |
| **User Login** | `app/auth/login/page.js` |
| **User Signup** | `app/auth/signup/page.js` |
| **User Profile** | `app/profile/page.js` |
| **Shopping Cart** | `app/cart/page.js` |
| **Checkout** | `app/checkout/page.js` |
| **Contact Us** | `app/contact/page.js` |
| **Admin Dashboard** | `app/admin/page.js` |
| **Navigation Bar** | `components/Navbar.js` |
| **Database Schema** | `schema.sql` |
| **User Auth Logic** | `context/AuthContext.js` |
| **Cart Logic** | `context/CartContext.js` |

---

## 💾 Database Tables

```
1. users          → Customer profiles
2. products       → All bags/items
3. orders         → Customer orders
4. order_items    → Items in each order
```

---

## ⚡ Quick Changes

### **Change Homepage Title**
File: `app/page.js`
Find: `Carry Your World in Premium Style`
Replace with: Your new title

### **Change Contact Email**
File: `app/contact/page.js`
Find: `support@baghaven.pk`
Replace with: Your email

### **Change About Company Info**
File: `app/about/page.js`
Edit: Mission, vision, values sections

### **Add New Navigation Link**
File: `components/Navbar.js`
Add line:
```javascript
{ name: 'Blog', path: '/blog' },
```

### **Change Website Colors**
File: `tailwind.config.js`
Look for color definitions

---

## 🎨 Styling System

**Tailwind CSS classes used:**
- `bg-indigo-600` - Blue color
- `text-white` - White text
- `rounded-xl` - Rounded corners
- `px-4 py-3` - Padding
- `w-full h-32` - Size
- `flex items-center justify-center` - Alignment

To change color: Replace `indigo` with `blue`, `violet`, `rose`, etc.

---

## 🔐 Authentication Flow

```
User Signup
    ↓
Supabase creates auth user
    ↓
Automatically creates profile in users table
    ↓
User logged in
    ↓
JWT token stored (secure)
```

---

## 📦 Adding a Product

**Option 1: Via Supabase Dashboard**
1. Open Supabase project
2. Go to `products` table
3. Click "Insert row"
4. Fill: name, price, category, image_url, stock
5. Done! ✓

**Option 2: Via Admin Page**
1. Login as admin
2. Go to `/admin/products`
3. Fill form and submit
4. Product added to database

---

## 🛒 How Shopping Works

```
Customer views product
    ↓
Clicks "Add to Cart"
    ↓
Product saved in cart (browser)
    ↓
Cart count appears in navbar
    ↓
Go to checkout page
    ↓
Enter delivery details
    ↓
Select payment method
    ↓
Submit order
    ↓
Order saved in database
    ↓
Admin can view order
```

---

## 📝 Common File Edits

### **To add a new page:**
Create folder and file:
```
app/blog/page.js      → Creates /blog page
app/faq/page.js       → Creates /faq page
app/services/page.js  → Creates /services page
```

### **To change email settings:**
File: `app/api/orders/route.js`
(Find email sending code and modify)

### **To add new product fields:**
1. Update `schema.sql` (add column)
2. Update `app/admin/products/page.js` (add form field)
3. Update `components/ProductCard.js` (display field)

---

## 🐛 Fixing Errors

### **Error: "Could not find avatar_url column"**
```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```
Run in Supabase → SQL Editor

### **Error: "Supabase not configured"**
Check `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=xxxxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

### **Error: "Product image not showing"**
- Check image URL is valid
- Check Supabase Storage bucket is public
- Try different image URL

---

## ⌨️ Terminal Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Install dependencies
npm install

# Format code
npm run format
```

---

## 🌐 URLs in Project

```
Home:              http://localhost:3000/
About:             http://localhost:3000/about
Products:          http://localhost:3000/products
Product Detail:    http://localhost:3000/products/[id]
Contact:           http://localhost:3000/contact
Profile:           http://localhost:3000/profile
Cart:              http://localhost:3000/cart
Checkout:          http://localhost:3000/checkout
Admin:             http://localhost:3000/admin
Login:             http://localhost:3000/auth/login
Signup:            http://localhost:3000/auth/signup
```

---

## 📋 Important Folders

```
app/              → Website pages & routes
components/       → Reusable parts (Navbar, Footer, etc)
context/          → Shared state management
lib/              → Helper functions
public/           → Images & static files
```

---

## ✅ Deployment Checklist

Before going live:
- [ ] All pages working
- [ ] Database connected
- [ ] Images loading
- [ ] Forms submitting
- [ ] Authentication working
- [ ] Admin can manage products
- [ ] Orders being saved
- [ ] No console errors
- [ ] Mobile responsive

---

## 🔗 Resources

- **Next.js:** https://nextjs.org/docs
- **Tailwind:** https://tailwindcss.com/docs
- **Supabase:** https://supabase.com/docs
- **React:** https://react.dev

---

## 👨‍💻 For Future Developers

1. **Read DEVELOPER_MANUAL.md first** (detailed guide)
2. Understand folder structure
3. Find the file you need to edit
4. Make changes
5. Test locally
6. Commit to git
7. Deploy

---

**Questions? Check DEVELOPER_MANUAL.md or AVATAR_URL_FIX.md**
