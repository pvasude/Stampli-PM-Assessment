# Stampli AP + Cards - Virtual Card Management Platform

## Overview

Stampli AP + Cards is an invoice-centric Accounts Payable and Virtual Card Management platform. Its core purpose is to streamline financial operations for businesses by enabling users to manage virtual cards, approve requests, track invoices, process payments, and reconcile transactions within a unified workflow. The platform emphasizes real-time collaboration, AI assistance, and single-screen efficiency, drawing design inspiration from modern finance applications like Stripe, Linear, Notion, and Intercom.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React 18 with TypeScript, Vite for building, and Wouter for routing, creating a single-page application. UI components are built with Radix UI primitives and shadcn/ui (New York variant) for a consistent design system, styled using Tailwind CSS with a Stampli teal theme and light/dark mode support. State management relies on TanStack Query for server state, React Hook Form with Zod for form validation, and local component state for UI interactions. The design system features Inter font, generous whitespace, icon-based actions, and card-based layouts for a clean aesthetic.

### Backend Architecture

The backend is built with Express.js on Node.js, utilizing TypeScript for type-safe route handling and custom middleware for logging and error handling. It integrates with Vite for development and serves static files for production.

### Database Design

PostgreSQL is the chosen database, managed with Drizzle ORM and Neon serverless PostgreSQL. Drizzle Kit handles schema migrations. Key data models include:
- **Users:** For authentication and roles.
- **Invoices:** Stores invoice metadata, status (Pending, Approved, Paid, Overdue), and payment associations.
- **Cards:** Manages virtual card details (type, limits, spend, status, approval workflow). Critically, it stores only last4 digits and expiryDate for security.
- **Transactions:** Records transaction details, card/cardholder references, coding, and reconciliation status.
- **Departments:** Separate table for managing department codes and names, linked to cost centers.

### Key Features & Workflows

-   **Card Management:** Request and configure virtual cards (one-time or recurring), set spend limits and merchant restrictions (including MCC), manage card status, and track real-time spend. Invoice-linked cards have specific restrictions, including approval for modifications.
-   **Invoice Payment:** Supports paying invoices using existing cards or generating new virtual cards, with multi-payment method capabilities (card, ACH, check). Includes strict payment method locking after the first successful payment and protection against card creation for invoices pending approval.
-   **Dashboard:** Provides an overview of AP spend, pending invoices, active cards, and approval queues.
-   **Approval Workflows:** Implements multi-level approvals for card requests and modifications, with an audit trail and storage of proposed changes.
-   **Transaction Reconciliation:** A 3-state workflow (Pending Receipt → Pending Coding → Ready to Sync → Synced) for transactions, including GL account coding, receipt uploads, and individual/bulk sync to ERP.
-   **Database-Driven Controls:** Utilizes database-populated dropdowns for entities like departments, GL accounts, and cost centers to ensure data integrity and a consistent user experience.

## External Dependencies

**UI & Component Libraries:**
-   @radix-ui/*
-   cmdk
-   lucide-react
-   embla-carousel-react
-   vaul

**Data & Forms:**
-   @tanstack/react-query
-   react-hook-form
-   @hookform/resolvers
-   zod
-   drizzle-zod

**Database & ORM:**
-   drizzle-orm
-   @neondatabase/serverless
-   drizzle-kit

**Styling:**
-   tailwindcss
-   tailwind-merge (via clsx)
-   class-variance-authority
-   autoprefixer

**Utilities:**
-   date-fns
-   nanoid
-   wouter

**Session Management:**
-   express-session
-   connect-pg-simple