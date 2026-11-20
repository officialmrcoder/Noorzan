# 🛍️ Noorzan - Premium Bags E-Commerce Store

A full-stack e-commerce web application for selling premium bags built with modern technologies.

## 🌐 Live Demo
👉 [noorzan-34rf.vercel.app](https://noorzan-34rf.vercel.app)

## ✨ Features
- 🛒 Full shopping cart with localStorage persistence
- 🔐 User authentication (Signup, Login, Password Reset)
- 📦 Product catalog with search, filter & sort
- 💳 Checkout with COD, JazzCash & EasyPaisa
- 👤 User profile with photo upload
- 🛠️ Admin dashboard (manage products & orders)
- 📱 Fully responsive (mobile & desktop)

## 🛠️ Tech Stack
| Technology | Purpose |
|------------|---------|
| Next.js 14 | Frontend Framework |
| React 18 | UI Library |
| Tailwind CSS | Styling |
| Supabase | Database & Authentication |
| PostgreSQL | Database |
| Vercel | Deployment |

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/officialmrcoder/Noorzan.git
cd Noorzan
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create `.env.local` file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email

### 4. Run locally
```bash
npm run dev
```

### 5. Configure Supabase access
Run `schema.sql` in the Supabase SQL Editor to create the tables and profile trigger, then run `migrations/001_add_avatar_url.sql` and `migrations/002_supabase_access_policies.sql`.
The access-policy migration allows signed-in customers to manage only their own profile and orders. To give an account admin access, set `public.users.is_admin` to `true` for that account from the Supabase SQL Editor.

To remove only the sample products inserted by `schema.sql`, first preview the matching rows, then run the delete query in the Supabase SQL Editor:
```sql
SELECT id, name
FROM public.products
WHERE image_url IN (
  'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1577733966973-d680bfa24a06?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=600'
);

DELETE FROM public.products
WHERE image_url IN (
  'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1577733966973-d680bfa24a06?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=600'
);
```
This removes database sample products only. The demo products in `lib/mockData.js` are local fallback data and are not stored in Supabase.

## 📸 Pages
- **Home** - Hero banner & featured products
- **Products** - Full catalog with filters
- **Cart** - Shopping cart
- **Checkout** - Order placement
- **Admin** - Dashboard for managing store
- **Profile** - User profile management

## 👨‍💻 Developer
Made with ❤️ by [officialmrcoder](https://github.com/officialmrcoder)

