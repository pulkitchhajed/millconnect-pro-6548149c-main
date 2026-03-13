# MillConnect Pro: Comprehensive System Documentation

## 1. Executive Summary
MillConnect Pro is a B2B SaaS platform tailored for the textile industry. It facilitates seamless transactions between textile mills and garment manufacturers/buyers by providing a digital catalog, real-time order tracking, and a robust quote negotiation system.

## 2. Technical Stack & Governance

### 2.1 Frontend Development
- **Strategic Framework**: React (v18.3.1) with concurrent rendering support.
- **Build & Optimization**: Vite (v5.4.19) for ultra-fast HMR and optimized production bundles.
- **Strict Typing**: TypeScript (v5.8.3) for type safety across components and state.
- **State Management**:
  - **Server State**: [TanStack Query](https://tanstack.com/query/latest) (v5.83) for caching, synchronization, and optimistic updates.
  - **Context API**: Used for global session and authentication management (`AuthProvider`).
- **Styling Architecture**:
  - **Tailwind CSS**: Utility-first CSS for rapid, responsive design.
  - **Shadcn UI**: Accessible, high-quality primitive components built on Radix UI.
  - **Lucide React**: Consistent iconography throughout the interface.
- **Form Management**: React Hook Form combined with Zod for robust client-side validation and schema-based typing.

### 2.2 Backend & Infrastructure (Supabase Ecosystem)
- **Database**: PostgreSQL with Row Level Security (RLS) and Real-time WAL (Write-Ahead Logging).
- **Authentication**: JWT-based session management via Supabase Auth.
- **Storage**: S3-compatible cloud storage for fabric imagery.
- **Edge Computing**: Supabase Edge Functions (Deno deploy) for server-side logic like email notifications.

---

## 3. Architecture & Data Flow

### 3.1 Directory Structure Overview
```text
src/
├── components/     # Atomic & Composite UI elements
│   ├── ui/         # Shadcn base primitives
│   └── Layout/     # Navbar, Footer
├── hooks/          # Domain-specific business logic (useAuth, useFabrics, useAdmin)
├── integrations/   # Supabase client & auto-generated types
├── lib/            # Shared utilities (formatting, API clients)
└── pages/          # Route-level views & business logic concentration
```

### 3.2 Security Model: Row Level Security (RLS)
The system employs a "Secure by Default" approach using PostgreSQL RLS:
- **Profiles**: `auth.uid() = user_id` ensures users only see their own profile.
- **Fabrics**: Public `SELECT` for catalog browsing; `is_admin()` check for `INSERT/UPDATE/DELETE`.
- **Orders**: `auth.uid() = user_id` for buyers; `is_admin()` for sales/logistics staff.
- **User Roles**: Managed via a dedicated `user_roles` table with `app_role` ENUM.

---

## 4. Database Schema Deep Dive

### 4.1 Core Tables & Entity Relationships

#### `fabrics` (The Product Catalog)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique identifier. |
| `name` | TEXT | NOT NULL | Fabric commercial name. |
| `price_per_meter` | NUMERIC | NOT NULL | Base cost per unit. |
| `gsm` | INTEGER | NULL | Technical specification: Grams per Sq Meter. |
| `weave` | TEXT | NULL | Plain, Twill, Satin, etc. |
| `available` | BOOLEAN | DEFAULT true | Inventory toggle. |

#### `orders` (Transaction Record)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | REFERENCES auth.users | Buyer association. |
| `status` | TEXT | DEFAULT 'Pending' | Life cycle: Pending, Confirmed, Shipped, Delivered. |
| `gst_number` | TEXT | NULL | Registered tax ID or 'URD'. |
| `items` | JSONB | NOT NULL | Snapshot of multi-color/quantity items. |
| `total` | NUMERIC | NOT NULL | Calculated transaction value. |

#### `user_roles` (RBAC)
- **Roles**: `admin`, `sales_manager`, `inventory_manager`, `logistics`.
- **Function**: `public.has_role()` and `public.is_admin()` helper functions are used extensively in RLS and UI gating.

---

## 5. Critical Business Logic

### 5.1 Smart Order Configuration
The `OrderPage` implements complex validation logic:
- **Lump Orders**: Minimum 40m per color/item.
- **Cut Pack Orders**: Strictly restricted to multiples of 1.20m (garment length).
- **GST Validation**: Regex-based validation for Indian GST format with simulated legal name fetching for enhanced UX.

### 5.2 Admin Control Center
- **Dynamic Cataloging**: Admins can upload up to 5 images per product directly to Supabase Storage.
- **Real-time Monitoring**: The `AdminDashboard` uses Supabase Realtime to listen for new orders without page refreshes.
- **Shipment Tracking**: Integrated form for courier name, tracking IDs, and dispatch dates.

---

## 6. External Integrations

### 6.1 WhatsApp Business Link
Admins can trigger pre-filled WhatsApp messages to buyers for status updates or notes.
- **Logic**: Sanitizes phone numbers and encodes custom messages with order-specific deep links.

### 6.2 Email Notification (Alpha)
- **Provider**: Resend (via Supabase Edge Functions).
- **Trigger**: Automated emails sent upon order status change or admin note addition.

---

## 7. Development & DevOps Pipeline

### 7.1 Local Setup
1.  **Environment**: Create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2.  **Install**: `npm install`
3.  **Run**: `npm run dev` (Mapped to port 8080 in Vite config).

### 7.2 Migrations
Database changes are versioned in `supabase/migrations/`. 
Always apply migrations in sequential order using the Supabase CLI or the dashboard SQL editor.

### 7.3 Deployment
Production builds are generated via `npm run build` and typically hosted on platforms like Vercel or Netlify, connecting to a production Supabase instance.
