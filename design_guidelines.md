# Design Guidelines: Stampli AP + Cards - Clean UI Redesign

## Design Philosophy

**Core Principle**: Clean, calm, and cohesive - emphasizing clarity, whitespace, and visual hierarchy over decoration.

**Inspired By**: Stampli's modern AP aesthetic with professional enterprise finance platform design patterns.

**Key Tenets**:
1. Whitespace as the primary separator (not borders/shadows)
2. Icon-based actions with tooltips for clarity
3. Consistent spacing and alignment
4. Minimal decoration, maximum information
5. Progressive disclosure for complexity
6. Calm control - clear for accountants, friendly for AP clerks, polished for CFOs

---

## Core Design Elements

### A. Color Palette

**Primary Action Color**: Stampli Teal (#00B6C2 / 186 100% 38%)
**Secondary Accent**: Light Blue/Green for success states (#10B981 / 160 84% 39%)

**Light Mode**:
- Primary: 186 100% 38% (Stampli teal #00B6C2)
- Primary Hover: 186 100% 32%
- Primary Light: 186 100% 96% (subtle backgrounds)
- Background: 0 0% 100%
- Background Secondary: 210 20% 98%
- Card Background: 0 0% 100%
- Border (minimal use): 220 13% 91%
- Text Primary: 220 13% 9%
- Text Secondary: 215 16% 47%
- Text Tertiary: 215 10% 60%
- Success: 160 84% 39%
- Warning: 38 92% 50%
- Error: 0 72% 51%

**Dark Mode**:
- Primary: 186 100% 45%
- Primary Hover: 186 100% 52%
- Background: 220 13% 9%
- Background Secondary: 215 20% 12%
- Card Background: 215 18% 15%
- Border: 215 15% 25%
- Text Primary: 210 20% 98%
- Text Secondary: 215 15% 75%
- Text Tertiary: 215 12% 60%

### B. Typography System

**Font Families**:
- Primary: 'Inter', system-ui, sans-serif
- Monospace: 'JetBrains Mono', monospace (amounts, IDs)

**Type Scale (2 sizes maximum)**:
- **Headline**: text-xl (20px) - Page titles, major sections
- **Body**: text-sm (14px) - All other text, labels, buttons
- **Caption**: text-xs (12px) - Only for supplementary info

**Font Weight**:
- Regular (400) for body text
- Medium (500) for headlines and emphasis
- Avoid excessive bolding - use color contrast and spacing for hierarchy

**Line Height**: Generous spacing (1.6-1.8) for readability

### C. Layout & Spacing System

**Spacing Primitives** (Consistent rhythm):
- Small: 12px (gap-3, p-3)
- Medium: 16px (gap-4, p-4)
- Large: 24px (gap-6, p-6)
- Extra Large: 32px (gap-8, p-8)

**Padding Between Interactive Elements**: Minimum 16px, recommended 24px for touch/click clarity

**Card Padding**: p-6 (24px) - consistent across all card elements

**Grid Alignment**:
- All elements aligned to consistent grid
- Equal vertical rhythm between rows
- Icons, buttons, inputs precisely aligned
- Balanced margins across sections

**Container Strategy**:
- Main content: max-w-7xl mx-auto with px-6
- Detail panels: w-full lg:w-[480px]
- Generous outer margins for breathing room

### D. Visual Simplification

**Border Usage** (Minimal):
- Remove redundant borders and dividers
- Use whitespace as primary separator
- Only add borders where absolutely necessary for clarity
- When used: subtle, consistent stroke (1px)

**Shadow Usage** (Sparing):
- Only for floating elements (modals, tooltips, dropdowns)
- Subtle depths: shadow-sm for cards (if needed), shadow-lg for modals
- No drop shadows on static elements

**Icon System**:
- **Consistent**: Same size (h-4 w-4 or h-5 w-5), stroke weight, alignment
- **Intuitive replacements**:
  - ✏️ Edit → Pencil icon
  - 🗑️ Delete → Trash icon  
  - ➕ Add → Plus icon
  - 🔍 Search → Search icon
  - ⚙️ Settings → Cog icon
  - 👁️ View → Eye icon
  - 📎 Attach → Paperclip icon
- **Always include tooltips** on icon-only buttons for accessibility

### E. Component Patterns

**Navigation**:
- Clean sidebar with minimal styling
- Active state: subtle teal background (bg-primary/10) without heavy borders
- Icon + label alignment consistent throughout
- Hover states: very subtle (barely perceptible background shift)

**Cards**:
- Clean backgrounds with ample padding (p-6)
- No heavy borders - rely on subtle background contrast
- Consistent card-to-card spacing (gap-4 or gap-6)
- Avoid nesting cards in cards

**Buttons**:
- Icon + text or icon-only (with tooltip)
- Minimal padding, consistent sizing
- Subtle hover states (use elevation system)
- Primary action in teal, secondary in ghost/outline variants

**Forms & Inputs**:
- Clean inputs with minimal borders
- Labels: text-sm, subtle color (text-secondary)
- Focus states: ring-2 ring-primary/20
- Inline validation with minimal visual weight

**Tables**:
- Clean rows with hover states
- No zebra striping (use whitespace)
- Sticky headers where needed
- Inline editing with clear affordances
- Icon actions aligned right

**Status Indicators**:
- Minimal badge design (rounded-full, small padding)
- Color-coded but not garish
- Consistent sizing across application

**Progressive Disclosure**:
- Hide advanced details until expanded/hovered
- Info icons (ⓘ) with tooltips for inline explanations
- Expandable sections for complex information
- Tooltips on all icon buttons

### F. Interaction Patterns

**Hover States**:
- Consistent and subtle throughout
- Slight background tint or underline
- Use elevation utilities: hover-elevate, active-elevate-2
- Avoid jarring color shifts

**Focus States**:
- Clear but not overwhelming
- ring-2 ring-primary/20 for keyboard navigation
- Consistent across all interactive elements

**Loading States**:
- Minimal spinners or skeleton screens
- Don't block the entire UI
- Show progress where meaningful

**Empty States**:
- Clean centered design
- Subtle icon + clear messaging
- Single clear CTA

### G. Information Density

**Balance**:
- Compact where appropriate (tables, lists)
- Generous where needed (forms, detail views)
- Smart truncation with expand options
- Tooltips for overflow content

**Hierarchy**:
- Use size, color, and spacing (not weight)
- 3 levels of text color: Primary → Secondary → Tertiary
- Whitespace creates visual grouping
- Icons provide visual anchors

### H. Accessibility & Performance

- ARIA labels on all icon buttons
- Keyboard navigation fully supported (Tab, Enter, Esc)
- Tooltips on hover/focus
- High contrast maintained in both light/dark modes
- Reduced motion preferences honored
- Touch targets minimum 44x44px

---

## Design Checklist

✅ **Layout**: Consistent grid, even padding, balanced margins
✅ **Typography**: Max 2 font sizes, minimal bolding, generous line height
✅ **Visual**: Whitespace over borders, icons with tooltips, subtle shadows
✅ **Color**: Single teal primary, neutral grays, sparing highlights  
✅ **Spacing**: 16-24px between interactive elements
✅ **Interaction**: Progressive disclosure, consistent hover states
✅ **Tone**: Lightweight, professional, calm control

---

## Stampli Teal Usage

**Primary Actions**: Teal (#00B6C2)
- Primary buttons
- Active navigation items
- Links and actionable elements
- Focus rings

**Avoid**: Overuse of teal - use sparingly for maximum impact
**Balance**: Neutral grays for 90% of UI, teal for the critical 10%
