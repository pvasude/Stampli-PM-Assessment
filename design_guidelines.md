# Design Guidelines: Stampli AP + Cards Prototype

## Design Approach

**Selected Approach**: Design System (Enterprise Dashboard)

**Justification**: This is a utility-focused, information-dense enterprise finance tool where clarity, efficiency, and data visualization are paramount. Drawing inspiration from:
- **Stripe Dashboard**: Clean financial data presentation, card-based layouts, subtle interactions
- **Linear**: Typography-first design, efficient workflows, minimal chrome
- **Material Design**: Structured information hierarchy, consistent component patterns

**Key Design Principles**:
1. Information clarity over visual flair
2. Workflow efficiency through consistent patterns
3. Trust through professional, polished execution
4. Progressive disclosure for complex financial data

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary Brand: 182 100% 38% (Stampli blue-green #00B6C2)
- Primary Hover: 182 100% 32%
- Background Primary: 0 0% 100% (white)
- Background Secondary: 210 17% 98% (light gray)
- Background Card: 0 0% 100% with subtle shadow
- Border Default: 214 15% 91%
- Text Primary: 222 47% 11%
- Text Secondary: 215 14% 34%
- Text Muted: 215 10% 55%
- Success: 142 76% 36%
- Warning: 38 92% 50%
- Error: 0 84% 60%
- Info: 199 89% 48%

**Dark Mode**:
- Primary Brand: 182 100% 45%
- Primary Hover: 182 100% 52%
- Background Primary: 222 47% 11%
- Background Secondary: 217 33% 17%
- Background Card: 217 33% 19%
- Border Default: 215 20% 27%
- Text Primary: 210 40% 98%
- Text Secondary: 214 15% 75%
- Text Muted: 215 10% 55%

### B. Typography

**Font Families**:
- Primary: 'Inter', system-ui, -apple-system, sans-serif (via Google Fonts)
- Monospace: 'JetBrains Mono', 'Courier New', monospace (for transaction IDs, amounts)

**Type Scale**:
- Display (Dashboard Headers): text-3xl font-semibold (30px)
- Page Title: text-2xl font-semibold (24px)
- Section Header: text-xl font-semibold (20px)
- Card Title: text-lg font-medium (18px)
- Body Large: text-base font-normal (16px)
- Body: text-sm font-normal (14px)
- Caption: text-xs font-normal (12px)
- Financial Data: text-sm font-mono (tabular-nums for alignment)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4, p-6
- Card spacing: p-6, p-8
- Section gaps: gap-4, gap-6, gap-8
- Page margins: px-6 md:px-8 lg:px-12

**Container Strategy**:
- Dashboard width: max-w-7xl mx-auto
- Modal/Drawer width: max-w-2xl for forms, max-w-4xl for detailed views
- Card max-width: Individual cards naturally size within grid

**Grid Patterns**:
- Cards Dashboard: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Transaction Table: Full-width responsive table
- Detail View: Two-column layout (Details left, Actions right) on lg+ breakpoints

### D. Component Library

**Navigation**:
- Top bar with app logo, breadcrumbs, user profile (h-16, border-b)
- Left sidebar navigation with icons + labels (w-64, collapsible to w-16 icon-only on mobile)
- Active state: bg-primary/10 with left border-l-4 border-primary

**Cards (Primary Building Block)**:
- Base: bg-card rounded-lg border shadow-sm p-6
- Interactive: hover:shadow-md transition-shadow cursor-pointer
- Status indicators: Top-right badge (Approved, Pending, Active)
- Header with icon + title + action button
- Divider: border-t my-4 for section separation within cards

**Data Display**:
- Tables: Striped rows (even:bg-gray-50), sticky header, responsive overflow-x-auto
- Key-Value Pairs: dl grid (dt font-medium text-muted, dd text-primary)
- Status Badges: Inline-flex rounded-full px-3 py-1 text-xs font-medium (green for success, yellow for pending, gray for inactive)
- Financial Amounts: Font-mono text-right with currency symbol, color-coded (positive: text-success, negative: text-error)

**Forms**:
- Input fields: border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary
- Labels: text-sm font-medium mb-2 block
- Dropdowns: Custom styled select with chevron icon
- Radio/Checkbox: Accent color matching primary brand
- Form sections: Space-y-6 for field groups

**Buttons**:
- Primary: bg-primary text-white hover:bg-primary-hover rounded-md px-4 py-2
- Secondary: border border-gray-300 bg-white hover:bg-gray-50
- Danger: bg-error text-white hover:bg-error/90
- Icon-only: p-2 rounded-md with hover:bg-gray-100

**Modals/Drawers**:
- Overlay: Fixed inset-0 bg-black/50 backdrop-blur-sm
- Content: Slide-in from right (drawer) or center (modal) with rounded-lg bg-card
- Header: px-6 py-4 border-b with title and close button
- Footer: px-6 py-4 border-t with action buttons (right-aligned)

**Empty States**:
- Centered icon (text-6xl text-gray-300) + heading + description + CTA button
- Use for "No cards yet", "No transactions", etc.

### E. Dashboard-Specific Patterns

**Metrics Summary Row**:
- Grid of 3-4 stat cards at page top (Total Spend, Active Cards, Pending Approvals)
- Large number (text-3xl font-bold) with label below, trend indicator optional

**Card Request Flow**:
- Multi-step form with progress indicator (step 1/3)
- Each step in separate card with clear next/back actions
- Invoice vs Expense card type selection with radio cards (visual selection)

**Transaction List**:
- Table with columns: Date, Vendor, Amount, Cardholder, Status, GL Code, Actions
- Inline edit for GL coding (dropdown appears on click)
- Quick actions menu (three-dot icon) for receipt upload, view details

**Approval Workflow**:
- Timeline component showing request → approval → issuance flow
- Approver avatar + name + timestamp for each step
- Pending state with action buttons (Approve/Reject) for approvers

**Receipt Upload**:
- Drag-drop zone with dashed border
- Thumbnail preview after upload with remove option
- Required indicator before sync to ERP

**No Images Required**: This is a dashboard application - all visuals are data-driven UI components, icons from Heroicons, and user avatars (initials in colored circles if no photo).