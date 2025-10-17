# Stampli AP + Cards - Virtual Card Management Platform

## Overview

Stampli AP + Cards is an invoice-centric Accounts Payable and Virtual Card Management platform. The application enables users to manage virtual cards, approve card requests, track invoices, process payments, and reconcile transactions within a unified workflow. The system emphasizes real-time collaboration, AI assistance integration (Billy bot), and single-screen efficiency with detailed slide-out panels.

The platform is built as a modern, enterprise-grade finance application drawing design inspiration from Stripe Dashboard (clean data hierarchy), Linear (typography-first design), Notion (collaborative features), and Intercom (integrated messaging patterns).

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 17, 2025 - UI/UX Cleanup (Feature Visibility):**
- Moved Simulate feature from side navigation to Dashboard header button
- Added "Testing Only" label and flask icon to Simulate button for clarity
- Greyed out "View Invoices" button on Dashboard with tooltip "Feature not implemented in this demo"
- Removed Simulate from main navigation menu to emphasize it's a testing tool, not a product feature

**October 17, 2025 - Critical Security Fix (Card Data Protection):**
- Removed sensitive card data from database schema (full PAN and CVV)
- Cards table now stores only last4 digits and expiryDate for display purposes
- Updated card approval workflow to generate only safe display fields
- Updated pay-invoice simulation to avoid storing full card details
- Removed cardNumber references from frontend (Dashboard, etc.)
- Validated: No sensitive card data is stored or exposed via API
- Database schema pushed successfully with --force flag to remove sensitive columns

**October 17, 2025 - Database Integration Complete:**
- Migrated from in-memory mock data to PostgreSQL with Drizzle ORM
- Implemented complete DatabaseStorage class with CRUD operations
- Added RESTful API routes for all entities (cards, invoices, transactions, approvals)
- Updated all frontend pages to use real data from API
- Added foreign key constraints for data integrity (cards ↔ invoices, transactions ↔ cards/invoices, approvals ↔ cards)
- Seeded database with initial test data
- Application now persists all data to PostgreSQL database

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR support
- Wouter for lightweight client-side routing
- Single-page application (SPA) architecture with route-based code organization

**UI Component System:**
- Radix UI primitives for accessible, unstyled component foundation
- shadcn/ui component library (New York variant) for consistent design system
- Tailwind CSS for utility-first styling with custom design tokens
- Stampli teal brand theme (#00B6C2) with light/dark mode support
- CSS variables for dynamic theming and color management
- Clean, calm aesthetic with generous whitespace and icon-based actions

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod resolvers for form state and validation
- Local component state for UI interactions
- Real-time data fetching from PostgreSQL database via RESTful API

**Design System:**
- Typography: Inter font family for UI, JetBrains Mono for code/data
- Color palette: Teal primary (#00B6C2), semantic colors for status indicators
- Stampli clean aesthetic: generous whitespace (16-24px), max 2 font sizes, minimal borders
- Icon-based actions with tooltips (Eye, Lock, RefreshCw icons) replacing text-heavy buttons
- Page layout: text-xl headlines, p-8 containers, space-y-8 sections, p-4 table cells
- Card-based layouts with subtle shadows and simplified visual design
- Consistent spacing and elevation system using CSS custom properties

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server framework
- Node.js runtime with ES modules
- Type-safe route handling with TypeScript
- Custom middleware for request logging and error handling

**Development Setup:**
- Vite middleware integration for dev mode with HMR
- Custom logging system with formatted timestamps
- Static file serving for production builds
- Runtime error overlay for development (Replit-specific tooling)

**Storage Layer:**
- PostgreSQL database with Drizzle ORM for data persistence
- DatabaseStorage class implementing IStorage interface
- Neon serverless PostgreSQL as the database provider
- Full CRUD operations for all entities with type safety

### Database Design

**ORM & Schema Management:**
- Drizzle ORM configured for PostgreSQL
- Neon serverless PostgreSQL as the target database
- Drizzle Kit for schema migrations and database push operations
- Zod schema integration for runtime validation

**Core Data Models:**

1. **Users Table:**
   - UUID primary key with auto-generation
   - Username/password authentication fields
   - Designed for expansion with roles and permissions

2. **Invoices Table:**
   - Invoice metadata (number, vendor, amount, due date)
   - Status tracking (Pending, Approved, Paid, Overdue)
   - Payment method association
   - Description and audit fields

3. **Cards Table:**
   - Virtual card details (type, cardholder, limits)
   - Spend tracking (limit vs. current spend)
   - Status management (Active, Locked, Suspended, Pending Approval)
   - Invoice association for invoice-specific cards
   - Approval workflow fields (requested by, approved by)
   - Validity period and merchant restrictions
   - Security: Stores only last4 digits and expiryDate (no full PAN or CVV)

4. **Transactions Table:**
   - Transaction details (amount, date, merchant)
   - Card and cardholder references
   - GL account and cost center coding
   - Receipt attachment tracking
   - Reconciliation status (Coded, Pending Receipt, Ready to Sync, Synced)

### Key Features & Workflows

**Card Management:**
- Request new virtual cards (invoice-specific or expense cards)
- Configure spend limits, validity periods, and merchant restrictions
- Card type selection: One-time cards (single or unlimited transactions) vs Recurring cards (monthly/quarterly/yearly reset)
- Multi-select merchant and MCC code restrictions
- Mandatory coding templates (GL Account, Department, Cost Center)
- Lock/unlock/suspend card operations with proper state management
- Real-time spend tracking against limits
- Card type filtering on Cards page (one-time vs recurring)
- Invoice-linked cards with edit prevention and visual indicators

**Card Controls & Editing:**
- Manage Card section for modifying card settings
- Approval workflow for card modifications (spend limit, merchants, MCC codes, coding)
- Invoice-linked cards cannot be edited
- Suspended cards cannot be shared or modified
- Locked cards can only be unlocked

**Invoice Payment:**
- Pay invoices with existing cards or generate new virtual cards
- MCP (Merchant Category Portal) automation detection
- Multi-payment method support (cards, ACH, wire transfer)
- Coding template inheritance from invoice to card

**Dashboard:**
- Overview of total AP spend with card and invoice breakdown
- Pending invoices count and total value
- Active cards count by type (invoice vs expense cards)
- Card approval queue summary
- Recent cards section with quick navigation to Cards page
- Pending invoices section with "View Invoices" button (disabled when on invoices page)
- Click on card Eye icon to navigate to Cards page
- "View All Cards" button for quick access to card management

**Approval Workflows:**
- Multi-level approval system for card requests
- Approval workflow for card modifications
- Approval queue with filtering and search
- Approve/reject actions with audit trail

**Transaction Reconciliation:**
- 3-state transaction workflow: Pending Receipt → Pending Coding → Ready to Sync → Synced
- GL account, department, and cost center coding (editable for any transaction)
- Receipt upload and attachment
- Conditional Sync to ERP button (enabled only for Ready to Sync transactions)
- Individual and bulk transaction sync
- Transaction filtering and search
- Tabbed interface: "All Transactions" and "Synced Transactions"
- Synced transactions are automatically moved to the Synced Transactions tab after ERP sync
- Tab count displays number of synced transactions

**Reporting & Analytics:**
- Spend analytics by category and vendor
- Card utilization metrics
- Month-to-date tracking and trends with visual graphs
- Export capabilities for external analysis

## External Dependencies

**UI & Component Libraries:**
- @radix-ui/* (v1.x) - Accessible component primitives
- cmdk (v1.1.1) - Command palette component
- lucide-react - Icon system
- embla-carousel-react - Carousel/slider functionality
- vaul - Drawer component primitives

**Data & Forms:**
- @tanstack/react-query (v5.60.5) - Server state management
- react-hook-form - Form state management
- @hookform/resolvers (v3.10.0) - Form validation integration
- zod - Runtime schema validation
- drizzle-zod (v0.7.0) - ORM-to-Zod schema conversion

**Database & ORM:**
- drizzle-orm (v0.39.1) - TypeScript ORM
- @neondatabase/serverless (v0.10.4) - Neon PostgreSQL driver
- drizzle-kit - Migration and schema management tooling

**Styling:**
- tailwindcss - Utility-first CSS framework
- tailwind-merge (via clsx) - Conditional class merging
- class-variance-authority (v0.7.1) - Component variant management
- autoprefixer - CSS vendor prefixing

**Utilities:**
- date-fns (v3.6.0) - Date manipulation and formatting
- nanoid - Unique ID generation
- wouter - Lightweight routing

**Development Tools:**
- @replit/vite-plugin-* - Replit-specific development tooling
- vite - Build tool and dev server
- tsx - TypeScript execution for development
- esbuild - Production build bundler

**Session Management (Configured but not fully implemented):**
- express-session - Session middleware
- connect-pg-simple (v10.0.0) - PostgreSQL session store

**Future Integration Points:**
- Authentication system (users table exists, auth flow needs implementation)
- ERP/accounting system sync (transaction sync status prepared)
- Receipt OCR/parsing (upload infrastructure in place)
- Billy bot AI assistant (UI references present, backend integration pending)