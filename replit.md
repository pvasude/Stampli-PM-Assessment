# Stampli AP + Cards - Virtual Card Management Platform

## Overview

Stampli AP + Cards is an invoice-centric Accounts Payable and Virtual Card Management platform. It enables users to manage virtual cards, approve requests, track invoices, process payments, and reconcile transactions within a unified workflow. The platform emphasizes real-time collaboration, AI assistance, and single-screen efficiency, drawing design inspiration from modern finance applications like Stripe, Linear, Notion, and Intercom. Its core purpose is to streamline financial operations for businesses.

## Recent Changes

**October 17, 2025 - Transaction Records for All Payment Methods:**
- **Requirements:**
  - Transactions should only appear when payments are actually made (for the paid amount)
  - All payment methods (card, ACH wallet/bank, check wallet/bank) should create transaction records
  - For "Pay via Stampli", card is created immediately but transaction attempt is separate and can be declined
  - If transaction is declined, card remains linked to invoice for retry

- **Schema Changes:**
  - Made `cardId` optional in transactions table (was required, now nullable)
  - Added `merchantName`, `description`, `department`, `paymentId`, `paymentMethod` fields to transactions
  - Transactions can now be created for ACH and Check payments without cards

- **Payment Flow Updates:**
  - **Pay via Stampli (Card):**
    1. Card created immediately and linked to invoice (lockedCardId)
    2. Transaction attempt made separately with wallet validation
    3. If declined: Card remains parked with invoice, toast shows "Card created but charge failed. You can retry once wallet is funded."
    4. If approved: Transaction record created, invoice status updated
  
  - **ACH Payment (Wallet/Bank):**
    1. If "Wallet" selected: Checks wallet balance, deducts if sufficient
    2. If "Bank" selected: No wallet deduction
    3. Creates payment record with appropriate method label ("ach-wallet" or "ach-bank")
    4. Creates transaction record showing the paid amount
    5. Marks invoice as paid
  
  - **Check Payment (Wallet/Bank):**
    1. If "Wallet" selected: Checks wallet balance, deducts if sufficient
    2. If "Bank" selected: No wallet deduction
    3. Creates payment record with appropriate method label ("check-wallet" or "check-bank")
    4. Creates transaction record showing the paid amount
    5. Marks invoice as paid

- **Key Behaviors:**
  - Transaction records only created for successfully paid amounts
  - Multiple payments to same invoice create multiple transaction records
  - Card creation decoupled from transaction charging - card can exist without successful transaction
  - Until first payment is approved, user can change payment method

**October 18, 2025 - Strict Payment Method Locking:**
- **Requirements:**
  - Once first payment is made, all subsequent payments must use the same method type
  - If first payment by card, all payments must use that specific card
  - If first payment by ACH/check, all payments must use ACH/check respectively
  - Card-invoice linkage must be visible on Cards and Invoices pages
  - Users can unlink payment method only if no successful payments made yet

- **Schema Changes:**
  - Added `firstPaymentMethod` field to invoices table (nullable text field)
  - Tracks the method type of the first successful payment ("card", "ach", or "check")

- **Backend Updates:**
  - `/api/simulate/transaction`: Sets `firstPaymentMethod = "card"` on invoice after first successful card transaction
  - `/api/payments`: Sets `firstPaymentMethod` based on payment method type after first successful payment
  - Unlink endpoint: Allows clearing `lockedCardId` and `paymentMethod` when `firstPaymentMethod` is null

- **Payment Workflow Changes:**
  - **Card Already Linked (lockedCardId exists):**
    1. PayInvoiceDialog shows "Retry Payment" button instead of new card creation
    2. Hides "Share card with vendor" option - only "Pay via Stampli" available
    3. If no successful payment yet (`firstPaymentMethod` is null), shows "Unlink Payment Method" button
    4. Uses existing linked card for retry attempts
  
  - **First Payment Made (firstPaymentMethod set):**
    1. Payment method tabs are disabled based on locked method:
       - If `firstPaymentMethod = "card"`, ACH and Check tabs disabled
       - If `firstPaymentMethod = "ach"`, Card and Check tabs disabled
       - If `firstPaymentMethod = "check"`, Card and ACH tabs disabled
    2. Alert shows which method is locked
    3. All future payments must use the same method type
  
  - **Unlink Functionality:**
    - Only available when `lockedCardId` exists but `firstPaymentMethod` is null
    - Clears card linkage and allows choosing different payment method
    - Not available after first successful payment

- **UI Indicators:**
  - **Cards Page:**
    - Shows invoice number for cards linked to invoices
    - "Invoice Payment" badge on linked cards
  
  - **Invoices Page:**
    - "[METHOD] Locked" badge when `firstPaymentMethod` is set (amber colored with lock icon)
    - "Card Linked" badge when `lockedCardId` exists but no payment made yet (blue colored)
    - Badges display in invoice header next to status badge

**October 17, 2025 - Card Modification Approval Workflow (Bug Fix):**
- **Issue:** When users edited card limits and submitted for approval, nothing appeared on the Approvals page
- **Root Causes:**
  1. handleSubmitChanges only displayed toast message, didn't create approval request in database
  2. Edited values persisted across card switches (stale state bug)
  3. Approvals page displayed current card values instead of proposed changes
- **Implementation:**
  - Added `proposedChanges` text field to card_approvals schema to store JSON of modifications
  - Created createApprovalMutation in CardDetailSheet to POST approval with serialized changes
  - Added useEffect to reset edited values when card.id changes (prevents stale state)
  - Modified Approvals page to parse proposedChanges JSON and display proposed values
- **Complete Workflow:**
  1. User opens card detail sheet and clicks "Manage Card Limit"
  2. Edit spend limit (or other fields) → state updates correctly
  3. Click "Submit for Approval" → approval created with proposedChanges JSON
  4. Approvals page parses proposedChanges and displays proposed values (not current card values)
  5. Approver sees what changes are being requested before approving
- **Testing:** E2E test validated full workflow from edit to approval display

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React 18 with TypeScript, Vite for building, and Wouter for routing, creating a single-page application. UI components are built with Radix UI primitives and shadcn/ui (New York variant) for a consistent design system, styled using Tailwind CSS with a Stampli teal theme and light/dark mode support. State management relies on TanStack Query for server state, React Hook Form with Zod for form validation, and local component state for UI interactions. The design system features Inter font, generous whitespace, icon-based actions, and card-based layouts for a clean aesthetic.

### Backend Architecture

The backend is built with Express.js on Node.js, utilizing TypeScript for type-safe route handling and custom middleware for logging and error handling. It integrates with Vite for development and serves static files for production.

### Database Design

PostgreSQL is the chosen database, managed with Drizzle ORM and Neon serverless PostgreSQL. Drizzle Kit handles schema migrations. Key data models include:
- **Users:** For authentication and roles (expandable).
- **Invoices:** Stores invoice metadata, status (Pending, Approved, Paid, Overdue), and payment associations.
- **Cards:** Manages virtual card details (type, limits, spend, status, approval workflow). Critically, it only stores last4 digits and expiryDate for security.
- **Transactions:** Records transaction details, card/cardholder references, coding, and reconciliation status.

### Key Features & Workflows

-   **Card Management:** Request and configure virtual cards (one-time or recurring), set spend limits and merchant restrictions, manage card status (lock/unlock/suspend), and track real-time spend. Invoice-linked cards have specific restrictions.
-   **Card Controls & Editing:** Provides a section for modifying card settings, with an approval workflow for changes. Invoice-linked and suspended cards have edit restrictions.
-   **Invoice Payment:** Supports paying invoices using existing cards or generating new virtual cards, with multi-payment method capabilities and coding template inheritance.
-   **Dashboard:** Offers an overview of AP spend, pending invoices, active cards, and approval queues, with quick navigation to detailed sections.
-   **Approval Workflows:** Implements multi-level approvals for card requests and modifications, with an audit trail.
-   **Transaction Reconciliation:** A 3-state workflow (Pending Receipt → Pending Coding → Ready to Sync → Synced) for transactions, including GL account coding, receipt uploads, and individual/bulk sync to ERP.
-   **Reporting & Analytics:** Provides spend analytics, card utilization metrics, and export capabilities.

## External Dependencies

**UI & Component Libraries:**
-   @radix-ui/*: Accessible component primitives.
-   cmdk: Command palette.
-   lucide-react: Icon system.
-   embla-carousel-react: Carousel functionality.
-   vaul: Drawer components.

**Data & Forms:**
-   @tanstack/react-query: Server state management.
-   react-hook-form: Form state management.
-   @hookform/resolvers: Form validation integration.
-   zod: Runtime schema validation.
-   drizzle-zod: ORM-to-Zod schema conversion.

**Database & ORM:**
-   drizzle-orm: TypeScript ORM.
-   @neondatabase/serverless: Neon PostgreSQL driver.
-   drizzle-kit: Migration and schema management.

**Styling:**
-   tailwindcss: Utility-first CSS framework.
-   tailwind-merge (via clsx): Conditional class merging.
-   class-variance-authority: Component variant management.
-   autoprefixer: CSS vendor prefixing.

**Utilities:**
-   date-fns: Date manipulation.
-   nanoid: Unique ID generation.
-   wouter: Lightweight routing.

**Development Tools:**
-   @replit/vite-plugin-*: Replit-specific tooling.
-   vite: Build tool and dev server.
-   tsx: TypeScript execution.
-   esbuild: Production build bundler.

**Session Management:**
-   express-session: Session middleware.
-   connect-pg-simple: PostgreSQL session store.