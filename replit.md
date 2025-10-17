# Stampli AP + Cards - Virtual Card Management Platform

## Overview

Stampli AP + Cards is an invoice-centric Accounts Payable and Virtual Card Management platform. The application enables users to manage virtual cards, approve card requests, track invoices, process payments, and reconcile transactions within a unified workflow. The system emphasizes real-time collaboration, AI assistance integration (Billy bot), and single-screen efficiency with detailed slide-out panels.

The platform is built as a modern, enterprise-grade finance application drawing design inspiration from Stripe Dashboard (clean data hierarchy), Linear (typography-first design), Notion (collaborative features), and Intercom (integrated messaging patterns).

## User Preferences

Preferred communication style: Simple, everyday language.

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
- Custom purple brand theme (#6B46C1) with light/dark mode support
- CSS variables for dynamic theming and color management

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod resolvers for form state and validation
- Local component state for UI interactions
- Mock data patterns for development (to be replaced with API calls)

**Design System:**
- Typography: Inter font family for UI, JetBrains Mono for code/data
- Color palette: Purple primary (#6B46C1), semantic colors for status indicators
- Card-based layouts with soft shadows and generous whitespace
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
- In-memory storage implementation (MemStorage class) for development
- Interface-based storage abstraction (IStorage) for future database integration
- Designed to be replaced with PostgreSQL + Drizzle ORM

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
- Lock/unlock/suspend card operations
- Real-time spend tracking against limits

**Invoice Payment:**
- Pay invoices with existing cards or generate new virtual cards
- MCP (Merchant Category Portal) automation detection
- Multi-payment method support (cards, ACH, wire transfer)

**Approval Workflows:**
- Multi-level approval system for card requests
- Approval queue with filtering and search
- Approve/reject actions with audit trail

**Transaction Reconciliation:**
- GL account and cost center coding
- Receipt upload and attachment
- Sync status tracking for ERP integration
- Transaction filtering and search

**Reporting & Analytics:**
- Spend analytics by category and vendor
- Card utilization metrics
- Month-to-date tracking and trends
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