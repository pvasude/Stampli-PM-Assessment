# Design Guidelines: Stampli AP + Cards - Purple Brand Variant

## Design Approach

**Selected Approach**: Design System (Enterprise Finance Platform)

**Justification**: Information-dense invoice management platform requiring clarity, efficiency, and seamless collaboration. Drawing inspiration from:
- **Stripe Dashboard**: Clean data hierarchy, card-based layouts
- **Linear**: Typography-first design, efficient workflows
- **Notion**: Collaborative features, inline commenting
- **Intercom**: Integrated messaging patterns

**Key Design Principles**:
1. Invoice workflows as primary focus
2. Real-time collaboration embedded throughout
3. AI assistance (Billy bot) contextually integrated
4. Single-screen efficiency with slide-out details
5. Information density with visual breathing room

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary Brand: 258 59% 51% (#6B46C1 - Stampli purple)
- Primary Hover: 258 59% 43%
- Primary Light: 258 59% 96% (subtle backgrounds)
- Background Primary: 0 0% 100%
- Background Secondary: 252 6% 97%
- Background Card: 0 0% 100%
- Border: 240 6% 90%
- Text Primary: 222 47% 11%
- Text Secondary: 215 14% 34%
- Text Muted: 215 10% 55%
- Success: 142 76% 36%
- Warning: 38 92% 50%
- Error: 0 84% 60%
- AI Accent: 280 70% 60% (Billy bot interactions)

**Dark Mode**:
- Primary Brand: 258 59% 58%
- Primary Hover: 258 59% 65%
- Background Primary: 222 47% 11%
- Background Secondary: 217 33% 17%
- Background Card: 217 33% 19%
- Border: 215 20% 27%
- Text Primary: 210 40% 98%
- Text Secondary: 214 15% 75%

### B. Typography

**Font Families**:
- Primary: 'Inter', system-ui, sans-serif (Google Fonts)
- Monospace: 'JetBrains Mono', monospace (amounts, invoice IDs)

**Type Scale**:
- Page Title: text-2xl font-semibold
- Section Header: text-lg font-semibold
- Card Title: text-base font-medium
- Body: text-sm
- Caption/Labels: text-xs
- Financial Data: text-sm font-mono tabular-nums

### C. Layout System

**Spacing Primitives**: Tailwind units **2, 4, 6, 8, 12** for consistent rhythm
- Card padding: p-6
- Component spacing: gap-4, gap-6
- Page margins: px-6 lg:px-8

**Container Strategy**:
- Main content: max-w-7xl mx-auto
- Slide-out panels: w-full lg:w-[480px] for detail views
- Modals: max-w-2xl for forms, max-w-4xl for invoice details

**Grid Patterns**:
- Dashboard KPIs: grid-cols-2 lg:grid-cols-4 gap-4
- Invoice table: Full-width with sticky columns
- Split view: 60/40 ratio (list/detail) on lg+ breakpoints

### D. Component Library

**Navigation**:
- Top bar (h-16): Logo, global search, Billy AI chat trigger, notifications, profile
- Left sidebar (w-64, collapsible): Main nav with purple active states (bg-primary/10 border-l-4)
- Breadcrumbs below top bar for context

**Dashboard KPIs**:
- Stat cards: Large metric (text-3xl font-bold) + label + trend arrow
- Color-coded borders (left-4): Purple for totals, green for approved, amber for pending
- Compact layout with icons (Heroicons) aligned right

**Invoice-Centric Cards**:
- Primary layout: Invoice header (vendor, amount, status badge) + expandable details
- Status badges: rounded-full px-3 py-1 text-xs font-medium (Pending Approval: amber, Approved: green, Coding: blue, Synced: purple)
- Quick actions menu (three-dots) always visible on hover
- Inline GL coding with dropdown + autocomplete

**Messaging & Collaboration**:
- Threaded comments embedded in invoice cards (expandable section)
- @mentions with purple highlight, avatar chips
- Billy AI responses: Distinct container with gradient background (purple-to-violet) + bot avatar
- Typing indicators for active collaborators
- Unread message count badges on invoices

**Billy AI Integration**:
- Floating chat button (bottom-right, purple gradient)
- Slide-in chat panel with conversation history
- AI suggestions inline: "Billy suggests coding to: [GL Code]" with one-click apply
- Context-aware: Knows current invoice, suggests approvers, flags anomalies

**Data Tables**:
- Sticky header with column sorting
- Zebra striping (even:bg-gray-50/50)
- Expandable rows for invoice line items
- Inline editing with focus:ring-2 ring-primary
- Multi-select checkboxes for bulk actions

**Forms & Inputs**:
- Labels: text-sm font-medium text-secondary mb-1
- Inputs: border-gray-300 focus:border-primary focus:ring-2 ring-primary/20 rounded-md
- Validation: Inline error messages (text-error text-xs mt-1)
- Auto-save indicators: Small checkmark with "Saved" text

**Slide-Out Panels**:
- Invoice detail drawer: Slide from right, full height, shadow-2xl
- Header: Invoice # + vendor + close button (X)
- Tabbed sections: Details | Line Items | Activity | Messages
- Footer: Action buttons (Approve, Reject, Request Changes)

**Approval Workflows**:
- Horizontal timeline: Circles connected by lines, current step highlighted purple
- Approver cards: Avatar + name + timestamp + action taken
- Pending approver: Pulsing purple ring, action buttons visible

**Empty States**:
- Centered icon (text-gray-300) + heading + description
- Billy AI suggestion: "Need help? Ask Billy to find invoices for you"
- CTA button to trigger relevant action

**Status Indicators**:
- Real-time sync status: Small animated icon (syncing) or checkmark (synced)
- Approval progress: Linear progress bar (purple gradient)
- GL coding completion: Percentage badge with color transition (red→amber→green)

### E. Dashboard-Specific Patterns

**Single-Screen Workflow**:
- Master-detail layout: Invoice list left (40%), detail panel right (60%) on desktop
- Mobile: Stack with slide-over detail view
- Persistent filters/search at top, results update live
- Keyboard shortcuts overlay (Command+K menu)

**Information Density**:
- Compact row height in tables (h-12) with clear hover states
- Condensed card layouts with strategic use of dividers
- Expandable sections to reveal complexity on demand
- Smart truncation with tooltips on hover

**Collaboration Hub**:
- Activity feed sidebar: Recent comments, approvals, Billy actions
- Live presence indicators: Small colored dots on avatars
- Notification center: Grouped by type (Mentions, Approvals, AI Suggestions)

**No Images Required**: Enterprise dashboard with data-driven UI, Heroicons for all icons, user avatars (initials in purple gradients if no photo), Billy AI bot avatar (distinct bot icon in gradient circle).

---

## Accessibility & Performance

- Consistent dark mode across all components including form inputs
- ARIA labels for icon buttons, screen reader announcements for AI suggestions
- Keyboard navigation for all workflows (Tab, Enter, Esc)
- Reduced motion preferences honored (prefers-reduced-motion)
- Lazy load invoice details, virtual scrolling for large tables