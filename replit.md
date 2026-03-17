# ShopNow E-Commerce Application

## Overview

Full-stack production-ready e-commerce web application built with the fullstack_js stack blueprint (MERN-equivalent using PostgreSQL).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI
- **Backend**: Express.js 5 (Node.js)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **State Management**: React Context API (Auth, Cart, Theme)
- **API codegen**: Orval (from OpenAPI spec)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

## Demo Accounts

- **Admin**: admin@shopnow.com / admin123
- **User**: jane@example.com / user123

## Structure

```
artifacts/
├── api-server/          # Express.js REST API backend
│   └── src/
│       ├── routes/      # auth, products, users, orders, wishlist, admin
│       ├── middlewares/  # auth.ts (JWT), errorHandler.ts
│       └── lib/         # jwt.ts
├── ecommerce/           # React + Vite frontend
│   └── src/
│       ├── pages/       # Home, ProductDetails, Cart, Checkout, Login, Register, Profile, Wishlist, AdminDashboard
│       ├── contexts/    # AuthContext, CartContext, ThemeContext
│       ├── components/  # Navbar, Footer, ProductCard, UI components
│       └── lib/         # utils.ts (fetch interceptor, formatPrice)
lib/
├── api-spec/            # OpenAPI 3.1 spec (openapi.yaml)
├── api-client-react/    # Generated React Query hooks
├── api-zod/             # Generated Zod schemas
└── db/
    └── src/schema/      # users, products, orders, wishlist tables
scripts/
└── src/seed.ts          # Database seeder
```

## Features

### User Features
- Browse products with search, filter by category, sort, price range
- Product details with images and ratings
- Shopping cart (persisted to localStorage)
- Checkout with mock payment (credit card / COD)
- User authentication (register/login/logout)
- User profile management
- Order history
- Wishlist (saved to database)
- Dark mode toggle

### Admin Features
- Dashboard with revenue charts, order stats
- Product management (CRUD)
- Order management (status updates)
- User management

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `GET /api/products` - Products (search, filter, sort, paginate)
- `GET /api/products/categories` - All categories
- `GET/POST/PUT/DELETE /api/products/:id` - Product CRUD (admin)
- `GET /api/users` - All users (admin)
- `GET/PUT/DELETE /api/users/:id` - User CRUD
- `GET/POST /api/orders` - Orders
- `PUT /api/orders/:id` - Update order status (admin)
- `GET/POST /api/wishlist` - Wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist
- `GET /api/admin/stats` - Admin dashboard stats

## Running Locally

```bash
# Install dependencies
pnpm install

# Create database
# (set DATABASE_URL env var)

# Push schema
pnpm --filter @workspace/db run push

# Seed data
pnpm --filter @workspace/scripts run seed

# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/ecommerce run dev
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `PORT` - Server port (auto-set by Replit)
- `JWT_SECRET` - JWT signing secret (defaults to dev secret, change in production)
