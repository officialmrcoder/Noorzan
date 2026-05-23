# BagHaven E-Commerce Bag Store

A complete, premium, responsive e-commerce web application for selling bags (backpacks, laptop bags, messenger bags, travel bags, and women's handbags) built with **Next.js 14 (App Router)**, **Supabase (Postgres & Auth)**, and **Tailwind CSS**.

## Features

- **Hero & Category Banners**: Aesthetically pleasing home banner, interactive category links, and featured items cards.
- **Dynamic Catalog**: Full product listing with live search, category filtering, sorting (low to high, high to low, newest first), and price range sliders.
- **Product Details**: Multi-image thumbnail gallery, size selectors, quantity controls, and direct "Buy Now" checkout routes.
- **Shopping Cart**: Fully functional checkout cart persisted via LocalStorage with real-time tax/subtotal calculation and quantities updates.
- **Checkout & Payment**: Customer shipping logs, COD options, and manual confirmations for EasyPaisa/JazzCash transfers.
- **Authentication**: Fully integrated Supabase Auth (Sign up, Log in, Password reset, and Account verification callbacks).
- **Admin Panel**: Statistics view (total sales, orders, products count), order management (Pending, Confirmed, Shipped, Delivered status dropdowns), and full catalog CRUD (Create, Read, Update, Delete bags).

---

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database/Auth**: Supabase (PostgreSQL & Supabase Auth)
- **Deployment**: Vercel ready

---

## Local Setup & Installation

### 1. Clone the project and install dependencies

```bash
# Install packages
npm install
```

### 2. Configure Database (Supabase)

1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** in the Supabase Dashboard.
4. Open the `schema.sql` file in this repository, copy its contents, paste them into the SQL editor, and run/execute it. This creates:
   - `products`, `users`, `orders`, and `order_items` tables.
   - An auth registration trigger that syncs Supabase Auth sign-ups into the custom `users` profile table.
   - 8 starter product bags with description data and premium Unsplash media.

### 3. Setup Environment Variables

Create a `.env.local` file in the root folder of the project with the following keys (copy keys from your Supabase Project Settings > API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-api-key

# (Optional) Configurable Admin Email - Defaults to admin@example.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Admin Dashboard Credentials

To sign in as an Administrator:
1. Register a new account via the Sign Up form with the email `admin@example.com` (or the email configured in your `NEXT_PUBLIC_ADMIN_EMAIL` environment variable).
2. Once registered and logged in, you will see the **Admin Dashboard** option appear in the navigation bar.

---

## Deployment to Vercel

1. Push your project code to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAIL` (optional)
5. Click **Deploy**. Vercel will automatically build and publish your Next.js application.
