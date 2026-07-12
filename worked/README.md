# The Counter - Shopping App (React + Supabase)

A modern point-of-sale (POS) application built with React and TypeScript, powered by Supabase for real-time inventory and order management.

## Features

- **Customer Interface**: Browse menu, add items to cart, place orders
- **Owner Dashboard**: Manage inventory, view incoming orders, track fulfillment
- **Real-time Updates**: Supabase real-time subscriptions for live data synchronization
- **Multi-tenant**: Support for multiple shop owners with scoped data access
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router v7
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Styling**: CSS Grid/Flexbox

## Project Structure

```
worked/
├── src/
│   ├── components/
│   │   ├── Customer/
│   │   │   ├── CustomerPage.tsx      # Customer shopping interface
│   │   │   └── Customer.css
│   │   ├── Owner/
│   │   ���   ├── OwnerDashboard.tsx    # Owner main dashboard
│   │   │   ├── OwnerTickets.tsx      # Incoming orders view
│   │   │   ├── OwnerLedger.tsx       # Inventory management
│   │   │   ├── Receipt.tsx           # Order receipt
│   │   │   └── Owner.css
│   │   └── Auth/
│   │       ├── SignIn.tsx            # Owner sign-in
│   │       └── Auth.css
│   ├── context/
│   │   ├── ShopContext.tsx           # Shop state management
│   │   └── AuthContext.tsx           # Authentication context
│   ├── hooks/
│   │   ├── useShopItems.ts           # Local storage (legacy)
│   │   ├── useShopOrders.ts          # Local storage (legacy)
│   │   ├── useShopItemsSupabase.ts   # Supabase items hook
│   │   ├── useShopOrdersSupabase.ts  # Supabase orders hook
│   │   └── useShopOwner.ts
│   ├── lib/
│   │   └── supabase.ts               # Supabase client configuration
│   ├── types.ts                      # TypeScript interfaces
│   ├── storage.ts                    # Storage utilities
│   ├── App.tsx                       # Main app component with routing
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
├── .env.example                      # Environment variables template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd worked
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up Supabase database**
   
   Execute the SQL schema in your Supabase dashboard:
   ```sql
   -- Create shop_owners table
   CREATE TABLE shop_owners (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create shop_items table
   CREATE TABLE shop_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     owner_id UUID REFERENCES shop_owners(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     price DECIMAL(10, 2) NOT NULL,
     stock INTEGER DEFAULT 0,
     reserved_stock INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create shop_orders table
   CREATE TABLE shop_orders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     owner_id UUID REFERENCES shop_owners(id) ON DELETE CASCADE,
     customer_name TEXT NOT NULL,
     ticket_number INTEGER NOT NULL,
     items JSONB NOT NULL,
     total DECIMAL(10, 2) NOT NULL,
     status TEXT DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create indexes for performance
   CREATE INDEX idx_shop_items_owner ON shop_items(owner_id);
   CREATE INDEX idx_shop_orders_owner ON shop_orders(owner_id);
   CREATE INDEX idx_shop_orders_status ON shop_orders(status);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## Usage

### For Customers

1. Visit the main page (no authentication required)
2. Browse available items in the menu
3. Add items to your cart
4. Enter your name and place an order
5. Receive a ticket number for order pickup

### For Shop Owners

1. Sign in with your credentials (or create an account on first visit)
2. View your **Owner Dashboard** with two tabs:
   - **Incoming Tickets**: See all customer orders
     - Mark orders as fulfilled when complete
     - Clear all tickets at end of day
     - View order details and receipts
   - **Stock Ledger**: Manage your inventory
     - Add new items to sell
     - Edit item names, prices, and stock levels
     - Remove items from inventory

## API/Database Schema

### shop_owners
- `id`: UUID primary key
- `name`: Shop owner name
- `email`: Unique email for sign-in
- `password_hash`: Hashed password
- `created_at`, `updated_at`: Timestamps

### shop_items
- `id`: UUID primary key
- `owner_id`: References shop owner
- `name`: Item name
- `price`: Decimal price
- `stock`: Available quantity
- `reserved_stock`: Quantity in pending orders
- `created_at`, `updated_at`: Timestamps

### shop_orders
- `id`: UUID primary key
- `owner_id`: References shop owner
- `customer_name`: Name entered by customer
- `ticket_number`: Unique ticket for order pickup
- `items`: JSON array of line items
- `total`: Order total amount
- `status`: 'pending' or 'fulfilled'
- `created_at`, `updated_at`: Timestamps

## Real-time Features

The app uses Supabase's PostgreSQL real-time capabilities:

- **Changes to items**: When you edit inventory in one browser tab, other tabs/users see updates instantly
- **New orders**: Orders appear on the owner dashboard as soon as they're placed
- **Status updates**: When an order is marked fulfilled, customers see the update

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with `npm run build`

### Other Platforms

Build the project and deploy the `dist/` folder to any static hosting service (GitHub Pages, Netlify, etc.)

## Development Notes

### Storage Architecture

The app supports two storage backends:

1. **localStorage** (legacy): `useShopItems()` and `useShopOrders()`
2. **Supabase** (recommended): `useShopItemsSupabase()` and `useShopOrdersSupabase()`

Currently using Supabase for production, but localStorage hooks are retained for offline-first PWA capabilities.

### Type Safety

All components are fully typed with TypeScript. Key interfaces:

```typescript
interface ShopItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  reservedStock: number;
}

interface Order {
  id: string;
  customerName: string;
  ticketNumber: number;
  items: LineItem[];
  total: number;
  status: 'pending' | 'fulfilled';
  createdAt: string;
}
```

## Troubleshooting

### "Supabase connection failed"
- Check your environment variables are set correctly
- Verify Supabase project is active
- Check network connectivity

### "Tables not found" error
- Ensure you've run the SQL schema setup in your Supabase dashboard
- Check table names match exactly

### Real-time updates not working
- Enable real-time for the tables in Supabase settings
- Check browser console for subscription errors
- Ensure Supabase URL and key are correct

## Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email receipts for customers
- [ ] Analytics dashboard for owners
- [ ] Barcode scanning for faster checkout
- [ ] Customer loyalty program
- [ ] Admin panel for multiple shop management
- [ ] Mobile app (React Native)
- [ ] Dark mode support

## License

MIT License - feel free to use this project for commercial purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation: https://supabase.com/docs
3. Create an issue on GitHub

---

Built with ❤️ using React + Supabase
