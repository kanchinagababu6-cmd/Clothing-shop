# THREADLY — Simple Clothing Shop

A simple Next.js + Firebase clothing store with Google customer login, cart, checkout, and an admin dashboard.

## 1. Install

```bash
npm install
npm run dev
```

## 2. Create Firebase project

In Firebase Console:
1. Create a project.
2. Add a Web App and copy its config.
3. Authentication → Sign-in method → enable **Google**.
4. Firestore Database → create database.
5. Storage → enable Storage if you later add image uploads.

Copy `.env.example` to `.env.local` and fill in the Firebase values.

Set:
`NEXT_PUBLIC_ADMIN_EMAIL=your-admin@gmail.com`

The admin email must be the same Google account you use to sign in to the admin dashboard.

## 3. Firestore security

Open Firestore Rules and paste `firestore.rules`.

IMPORTANT: Replace `REPLACE_WITH_ADMIN_EMAIL` with your real admin email before publishing the rules.

The rules allow:
- Anyone to view products.
- Only the admin to create/update/delete products.
- Logged-in customers to create orders for themselves.
- Customers to read only their own orders.
- Admin to read/update all orders.

## 4. Add products

The included admin page can add products using image URLs. Example:
- Name: Classic T-Shirt
- Description: Cotton everyday t-shirt
- Price: 799
- Image: https://images.unsplash.com/...
- Sizes: S,M,L,XL
- Colors: Black,White
- Stock: 20

For production, replace URL entry with Firebase Storage image upload.

## 5. Deploy

Build:
```bash
npm run build
```

Then deploy the project to your preferred Next.js host, such as Vercel, and add the same environment variables there.

## Important privacy/security note

Customer address, phone, email and order information is private data. Do not expose it in public product pages or client-side public collections. Keep Firestore rules enabled and restrict admin access to the intended administrator.

## Recommended production upgrades

- Firebase Storage image upload
- Product editing
- Stock reduction when orders are placed
- Order confirmation emails
- Payment gateway
- Customer order-history page
- Admin role via Firebase custom claims rather than an email-only frontend check
- Server-side validation/API route for checkout
- Rate limiting and stronger abuse protection
