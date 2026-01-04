# CredSetu UI/UX Documentation

> Comprehensive design system and screen-by-screen analysis for the CredSetu ZK verification application.

---

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Typography](#typography)
3. [Color Palette](#color-palette)
4. [Effects & Animations](#effects--animations)
5. [Component Library](#component-library)
6. [Screen-by-Screen Analysis](#screen-by-screen-analysis)
   - [Login Page](#1-login-page)
   - [Dashboard](#2-dashboard)
   - [NITW Verification Page](#3-nitw-verification-page)
   - [Verified Profile Page](#4-verified-profile-page)

---

## Design System Overview

### Design Philosophy

CredSetu follows a **dark-first, glassmorphic** design philosophy emphasizing:

- **Trust & Security**: Dark themes with accent colors that convey reliability
- **Modern Minimalism**: Clean layouts with generous whitespace
- **Visual Hierarchy**: Clear distinction between primary and secondary elements
- **Gradient Accents**: Blue-to-teal gradients as the primary brand identity

### Framework & Technologies

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework |
| **Tailwind CSS** | Utility-first styling |
| **Geist Font Family** | Typography (Google Fonts) |
| **Socket.io** | Real-time communication |
| **QRCode.react** | QR code generation |

---

## Typography

### Font Families

| Font | CSS Variable | Usage |
|------|--------------|-------|
| **Geist Sans** | `--font-geist-sans` | Primary body text, headings, UI elements |
| **Geist Mono** | `--font-geist-mono` | Code, transaction hashes, activity logs |
| **Arial, Helvetica, sans-serif** | Fallback | System fallback |

### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| Regular (400) | `font-normal` | Body text, descriptions |
| Medium (500) | `font-medium` | Navigation items, labels |
| Bold (700) | `font-bold` | Headings, buttons, emphasis |

### Font Sizes

| Size | Tailwind Class | Usage |
|------|----------------|-------|
| **4xl** | `text-4xl` | Main hero title (Login page: "CredSetu") |
| **3xl** | `text-3xl` | Section headers (Dashboard: "Available Services") |
| **2xl** | `text-2xl` | Page titles (Verify: "Verify CGPA", Profile: "Verified Student") |
| **xl** | `text-xl` | Sidebar brand, card titles, success states |
| **lg** | `text-lg` | Card headings, descriptions |
| **sm** | `text-sm` | Subtitles, secondary text, descriptions |
| **xs** | `text-xs` | Labels, badges, metadata, timestamps |
| **[10px]** | `text-[10px]` | LIVE badge, transaction hash preview |

### Text Styles

| Style | Classes | Example |
|-------|---------|---------|
| **Gradient Text** | `bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent` | "Verify CGPA" heading |
| **Uppercase Labels** | `text-xs text-slate-500 uppercase tracking-wider` | Form labels ("PORTAL CREDENTIALS") |
| **Monospace** | `font-mono` | Activity logs, transaction hashes |

---

## Color Palette

### Background Colors

| Color | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| **Primary Background** | `#020617` | `bg-slate-950` | Main page backgrounds |
| **Secondary Background** | `#0f172a` | `bg-slate-900` | Cards, sidebar, containers |
| **Tertiary Background** | `#0a0a0a` | `--background` (dark mode) | CSS variable fallback |
| **Input Background** | `#020617` | `bg-slate-950` | Form inputs |
| **Light Background** | `#f8fafc` | `bg-slate-50` | Verified profile page |
| **White** | `#ffffff` | `bg-white` | QR code container, verified profile card |

### Text Colors

| Color | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| **Primary Text** | `#ffffff` | `text-white` | Headings, primary content |
| **Secondary Text** | `#94a3b8` | `text-slate-400` | Descriptions, subtitles |
| **Muted Text** | `#64748b` | `text-slate-500` | Labels, placeholders, secondary info |
| **Disabled Text** | `#475569` | `text-slate-600` | Disabled states, waiting states |
| **Dark Text** | `#0f172a` | `text-slate-900` | Light theme text (verified profile) |

### Accent Colors

| Color | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| **Blue Primary** | `#2563eb` | `bg-blue-600` | Primary buttons, gradients |
| **Blue Light** | `#3b82f6` | `from-blue-500` | Logo gradient start |
| **Blue Accent** | `#60a5fa` | `text-blue-400` | Links, status text, gradient text |
| **Teal Primary** | `#14b8a6` | `to-teal-500` | Primary button gradient end |
| **Teal Light** | `#2dd4bf` | `to-teal-400` | Logo gradient, hover states |

### Status Colors

| Status | Background | Text | Border | Usage |
|--------|------------|------|--------|-------|
| **Success** | `bg-green-900/20`, `bg-green-100` | `text-green-400`, `text-green-600` | `border-green-500/50`, `border-green-500` | Verified badges, success states |
| **Error** | `bg-red-900` | `text-red-400`, `text-red-500` | — | Disconnected badge, error messages |
| **Warning** | — | — | — | Coming soon indicators (`bg-yellow-500` dot) |
| **Live** | `bg-red-600` | `text-white` | — | LIVE streaming badge |
| **Active** | — | — | — | Service status (`bg-green-500` dot) |

### Border Colors

| Color | Tailwind Class | Usage |
|-------|----------------|-------|
| **Primary Border** | `border-slate-800` | Card borders, dividers, containers |
| **Secondary Border** | `border-slate-700` | Input field borders |
| **Focus Border** | `border-blue-500` | Input focus state |
| **Hover Border** | `border-blue-500/50` | Card hover state |

### Gradient Definitions

| Gradient | Classes | Usage |
|----------|---------|-------|
| **Brand Gradient** | `bg-gradient-to-r from-blue-600 to-teal-500` | Primary CTA buttons |
| **Brand Gradient Hover** | `hover:from-blue-500 hover:to-teal-400` | Button hover state |
| **Logo Gradient** | `bg-gradient-to-tr from-blue-500 to-teal-400` | Logo icon background |
| **Text Gradient** | `bg-gradient-to-r from-blue-400 to-teal-400` | Gradient text headings |
| **Disabled Gradient** | `disabled:from-slate-700 disabled:to-slate-700` | Disabled buttons |

### Opacity & Alpha Values

| Pattern | Usage |
|---------|-------|
| `/20` | Background blobs, subtle overlays |
| `/30` | Success overlay on video canvas |
| `/50` | Backdrop blur containers, semi-transparent borders |
| `opacity-50` | Inactive elements, arrow icons |
| `opacity-60` | Coming soon cards |

---

## Effects & Animations

### CSS Animations

#### Fade In Animation
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
```

#### Spin Animation (Tailwind Built-in)
```
animate-spin - Loading spinner rotation
```

#### Pulse Animation (Tailwind Built-in)
```
animate-pulse - LIVE streaming indicator
```

### Glassmorphism Effects

| Effect | Classes | Usage |
|--------|---------|-------|
| **Backdrop Blur** | `backdrop-blur-xl` | Login container overlay |
| **Blur Effect** | `blur-3xl` | Background blobs |
| **Semi-transparent BG** | `bg-slate-900/50` | Glassmorphic containers |

### Shadow Effects

| Shadow | Classes | Usage |
|--------|---------|-------|
| **Extra Large Shadow** | `shadow-2xl` | Cards, video container, profile photos |
| **Extra Large Shadow** | `shadow-xl` | QR code container |
| **Colored Shadow** | `shadow-lg shadow-blue-500/20` | Logo icon glow |

### Transition Effects

| Transition | Classes | Usage |
|------------|---------|-------|
| **All Properties** | `transition-all` | Buttons, cards, interactive elements |
| **Colors Only** | `transition-colors` | Text hover effects, inputs |
| **Opacity Only** | `transition-opacity` | Arrow icon visibility |

### Hover Effects

| Element | Hover Effect |
|---------|--------------|
| **Primary Buttons** | Lighter gradient colors |
| **Service Cards** | Border color change, background darken |
| **Nav Buttons** | Background highlight |
| **Text Links** | Color change, underline |
| **Card Arrows** | Opacity increase (50% → 100%) |

---

## Component Library

### Buttons

#### Primary CTA Button (Gradient)
```html
<button class="w-full bg-gradient-to-r from-blue-600 to-teal-500 
               hover:from-blue-500 hover:to-teal-400 
               disabled:from-slate-700 disabled:to-slate-700 
               disabled:cursor-not-allowed text-white 
               disabled:text-slate-500 font-bold py-3 
               rounded-xl transition-all">
  Start Verification
</button>
```

#### Google Auth Button
```html
<button class="w-full flex items-center justify-center gap-3 
               bg-white text-slate-900 hover:bg-slate-200 
               transition-all font-bold py-4 rounded-xl 
               disabled:opacity-50">
  Continue with Google
</button>
```

#### Navigation Button (Active)
```html
<button class="w-full text-left px-4 py-3 
               bg-slate-800 rounded-lg text-white font-medium">
  Dashboard
</button>
```

#### Navigation Button (Inactive)
```html
<button class="w-full text-left px-4 py-3 text-slate-400 
               hover:bg-slate-800/50 rounded-lg transition-colors">
  My Proofs
</button>
```

#### Back Button
```html
<button class="text-sm text-slate-500 hover:text-white 
               flex items-center gap-2 transition-colors">
  ← Back to Dashboard
</button>
```

### Status Badges

#### Connected Badge
```html
<span class="text-xs px-2 py-1 rounded-full 
             bg-green-900 text-green-400">
  Connected
</span>
```

#### Disconnected Badge
```html
<span class="text-xs px-2 py-1 rounded-full 
             bg-red-900 text-red-400">
  Disconnected
</span>
```

#### Verified User Badge
```html
<div class="px-3 py-1 bg-green-900/30 border border-green-600/50 
            rounded-full text-xs text-green-400">
  Verified User
</div>
```

#### Live Badge
```html
<div class="bg-red-600 text-white text-[10px] font-bold 
            px-2 py-1 rounded animate-pulse">
  ● LIVE SERVER VIEW
</div>
```

#### Service Status Indicator
```html
<!-- Live -->
<div class="flex items-center gap-2 text-xs text-slate-500">
  <span class="w-2 h-2 rounded-full bg-green-500"></span> Live
</div>

<!-- Coming Soon -->
<div class="flex items-center gap-2 text-xs text-slate-600">
  <span class="w-2 h-2 rounded-full bg-yellow-500"></span> Coming Soon
</div>
```

### Cards

#### Service Card (Active)
```html
<div class="group relative bg-slate-900 border border-slate-800 
            rounded-2xl p-6 hover:border-blue-500/50 
            hover:bg-slate-800 transition-all cursor-pointer overflow-hidden">
  <!-- Arrow icon (top right) -->
  <!-- Icon container -->
  <!-- Title -->
  <!-- Description -->
  <!-- Status indicator -->
</div>
```

#### Service Card (Disabled)
```html
<div class="opacity-60 bg-slate-900/50 border border-slate-800 
            rounded-2xl p-6 cursor-not-allowed">
  <!-- Content -->
</div>
```

#### Form Container Card
```html
<div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
  <!-- Form elements -->
</div>
```

#### Status Card
```html
<div class="bg-slate-900 rounded-xl border border-slate-800 p-4">
  <label class="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
    Status
  </label>
  <p class="text-sm text-blue-400">{status}</p>
</div>
```

#### Success Card
```html
<div class="bg-green-900/20 border border-green-500/50 
            p-6 rounded-xl flex flex-col items-center">
  <!-- Success content -->
</div>
```

### Form Elements

#### Text Input
```html
<input 
  class="w-full bg-slate-950 border border-slate-700 p-3 mb-4 
         rounded-lg focus:border-blue-500 focus:outline-none 
         transition-colors"
  placeholder="Registration Number"
/>
```

#### Password Input
```html
<input 
  type="password"
  class="w-full bg-slate-950 border border-slate-700 p-3 mb-6 
         rounded-lg focus:border-blue-500 focus:outline-none 
         transition-colors"
  placeholder="Password"
/>
```

### Layout Components

#### Sidebar
```html
<aside class="w-80 bg-slate-900 border-r border-slate-800 p-8 flex flex-col">
  <!-- Logo -->
  <!-- User profile -->
  <!-- Navigation -->
  <!-- Sign out -->
</aside>
```

#### Video/Stream Container
```html
<div class="relative w-full aspect-video bg-slate-900 rounded-2xl 
            border-2 border-slate-800 overflow-hidden shadow-2xl">
  <!-- Canvas element -->
  <!-- Overlay states -->
</div>
```

### Icons Used

All icons are inline SVGs with `stroke="currentColor"`:

| Icon | Path | Usage |
|------|------|-------|
| **Checkmark Circle** | `M9 12l2 2 4-4m6 2a9 9 0 11-18 0...` | Logo, verified badge |
| **Chevron Left** | `M15 19l-7-7 7-7` | Back button |
| **Chevron Right** | `M9 5l7 7-7 7` | Card arrow |
| **Logout** | `M17 16l4-4m0 0l-4-4m4 4H7m6 4v1...` | Sign out button |
| **Checkmark** | `M5 13l4 4L19 7` | Success icon (profile page) |
| **Google Logo** | Multi-path colored | Google auth button |

---

## Screen-by-Screen Analysis

---

### 1. Login Page

**Route**: `/` (app/page.tsx)

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     ┌─ Blue Blob (top-left, blurred) ─┐                    │
│     │                                  │                    │
│                                                             │
│            ┌────────────────────────┐                       │
│            │   [Logo Icon]          │                       │
│            │                        │                       │
│            │   CredSetu             │                       │
│            │   Bridging Trust...    │                       │
│            │                        │                       │
│            │ [Continue with Google] │                       │
│            │                        │                       │
│            │   Secured by zkVerify  │                       │
│            └────────────────────────┘                       │
│                                                             │
│                    ┌─ Purple Blob (bottom-right, blurred) ─┐│
│                    │                                        ││
└─────────────────────────────────────────────────────────────┘
```

#### Components Used

| Component | Description |
|-----------|-------------|
| **Background Blobs** | Two 96×96 blurred circles for depth |
| **Container Card** | Glassmorphic card with backdrop blur |
| **Logo Icon** | 80×80 gradient rounded square with checkmark |
| **Title** | 4xl bold, white |
| **Subtitle** | sm, slate-400 |
| **Google Button** | Full-width white button with Google logo |
| **Footer Text** | xs, slate-500, centered |

#### Styling Details

| Element | Styles |
|---------|--------|
| **Page Background** | `bg-slate-950`, `min-h-screen`, `overflow-hidden` |
| **Blue Blob** | `w-96 h-96 bg-blue-600/20 rounded-full blur-3xl` positioned top-left |
| **Purple Blob** | `w-96 h-96 bg-purple-600/20 rounded-full blur-3xl` positioned bottom-right |
| **Card Container** | `bg-slate-900/50 backdrop-blur-xl border-slate-800 rounded-2xl shadow-2xl max-w-md` |
| **Logo Container** | `w-20 h-20 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-xl shadow-lg shadow-blue-500/20` |

#### States

| State | Behavior |
|-------|----------|
| **Default** | Button shows "Continue with Google" |
| **Loading** | Button shows "Signing in...", disabled with 50% opacity |
| **Error** | Browser alert "Login failed" |

---

### 2. Dashboard

**Route**: `/dashboard` (app/dashboard/page.tsx)

#### Layout Structure

```
┌──────────────┬──────────────────────────────────────────────┐
│              │                                              │
│  [Logo]      │  Available Services                          │
│  CredSetu    │  Select a provider to verify your...         │
│              │                                              │
│  ┌────────┐  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Photo  │  │  │ Verify   │ │ Verify   │ │ Work     │     │
│  │        │  │  │ CGPA     │ │ Salary   │ │ History  │     │
│  │ Name   │  │  │ NITW     │ │ Payroll  │ │ LinkedIn │     │
│  │ Email  │  │  │ ● Live   │ │ ● Soon   │ │ ● Soon   │     │
│  │[Badge] │  │  └──────────┘ └──────────┘ └──────────┘     │
│  └────────┘  │                                              │
│              │                                              │
│  Dashboard   │                                              │
│  My Proofs   │                                              │
│  Settings    │                                              │
│              │                                              │
│  [Sign Out]  │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

#### Components Used

| Component | Description |
|-----------|-------------|
| **Sidebar** | 320px fixed sidebar with user profile |
| **Logo** | 32×32 gradient square + brand text |
| **Profile Section** | Photo, name, email, verified badge |
| **Navigation** | Dashboard, My Proofs, Settings buttons |
| **Sign Out** | Bottom-aligned logout button |
| **Service Cards** | 3-column grid of verification services |

#### Sidebar Styling

| Element | Styles |
|---------|--------|
| **Container** | `w-80 bg-slate-900 border-r border-slate-800 p-8 flex-col` |
| **Logo** | `w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg` |
| **Brand Text** | `font-bold text-xl tracking-tight` |
| **Profile Photo** | `w-24 h-24 rounded-full border-4 border-slate-800 shadow-xl` |
| **User Name** | `text-lg font-bold` |
| **Email** | `text-xs text-slate-500` |
| **Verified Badge** | `bg-green-900/30 border-green-600/50 rounded-full text-xs text-green-400` |

#### Service Card Variations

| Card Type | Characteristics |
|-----------|-----------------|
| **Active (NITW)** | Full opacity, cursor-pointer, hover effects, green "Live" indicator |
| **Coming Soon** | 60% opacity, cursor-not-allowed, yellow "Coming Soon" indicator |

#### Loading State

```html
<div class="min-h-screen bg-slate-950 flex items-center justify-center">
  <div class="text-slate-500 flex items-center gap-3">
    <div class="w-5 h-5 border-2 border-slate-500 
                border-t-transparent rounded-full animate-spin"></div>
    Loading CredSetu...
  </div>
</div>
```

---

### 3. NITW Verification Page

**Route**: `/verify/nitw` (app/verify/nitw/page.tsx)

#### Layout Structure

```
← Back to Dashboard

┌──────────────────────┬─────────────────────────────────────────┐
│                      │                                         │
│ Verify CGPA [Badge]  │  ┌───────────────────────────────────┐  │
│ NIT Warangal Portal  │  │                                   │  │
│                      │  │     [● LIVE SERVER VIEW]          │  │
│ ┌──────────────────┐ │  │                                   │  │
│ │ PORTAL CREDS     │ │  │     Enter credentials and        │  │
│ │ [Registration #] │ │  │     start verification            │  │
│ │ [Password      ] │ │  │                                   │  │
│ │ [Start Button  ] │ │  │     The browser session will      │  │
│ └──────────────────┘ │  │     stream here live               │  │
│                      │  │                                   │  │
│ ┌──────────────────┐ │  │     <Canvas element>              │  │
│ │ STATUS           │ │  │                                   │  │
│ │ Idle             │ │  └───────────────────────────────────┘  │
│ └──────────────────┘ │                                         │
│                      │                                         │
│ ┌──────────────────┐ │                                         │
│ │ ACTIVITY LOG     │ │                                         │
│ │ Waiting for...   │ │                                         │
│ └──────────────────┘ │                                         │
└──────────────────────┴─────────────────────────────────────────┘
```

#### Layout Split

| Section | Width | Content |
|---------|-------|---------|
| **Left Panel** | `w-1/3` | Controls, status, logs |
| **Right Panel** | `w-2/3` | Live stream canvas |

#### Left Panel Components

| Component | Description |
|-----------|-------------|
| **Header** | Gradient title + connection badge |
| **Credentials Form** | Registration number + password inputs |
| **Start Button** | Gradient CTA, conditional disabled state |
| **Status Card** | Current verification status |
| **Activity Log** | Scrollable log with timestamps |

#### Right Panel Components

| Component | Description |
|-----------|-------------|
| **Stream Container** | 16:9 aspect ratio canvas |
| **LIVE Badge** | Pulsing red indicator during verification |
| **Placeholder** | Lock emoji + instructions when idle |
| **Canvas** | 640×360 HTML5 canvas for screencast frames |

#### States

| State | Left Panel | Right Panel |
|-------|------------|-------------|
| **Idle (Disconnected)** | Red "Disconnected" badge, button disabled | Lock emoji, "Enter credentials..." |
| **Idle (Connected)** | Green "Connected" badge, button enabled when form filled | Lock emoji, "Enter credentials..." |
| **Verifying** | Button shows "Verifying...", logs updating | LIVE badge pulsing, canvas streaming |
| **Complete** | Success card with QR code, profile link, tx link | Green overlay, "Verification Complete" |
| **Error** | Error in status, logs show error | — |

#### Success State Components

```html
<div class="bg-green-900/20 border border-green-500/50 p-6 rounded-xl">
  <h2 class="text-xl font-bold text-green-400">✅ Identity Verified</h2>
  
  <!-- QR Code -->
  <div class="bg-white p-4 rounded-xl shadow-xl">
    <QRCodeSVG size={150} />
  </div>
  
  <!-- Profile link -->
  <a class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500">
    Open Profile Page ↗
  </a>
  
  <!-- Transaction link -->
  <a class="text-xs text-green-400 hover:underline">
    View Transaction: 0x...
  </a>
</div>
```

---

### 4. Verified Profile Page

**Route**: `/verify/[id]` (app/verify/[id]/page.tsx)

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌────────────────────┐                   │
│                    │ ████████████████   │ ← Green top border│
│                    │                    │                   │
│                    │    ┌─────────┐     │                   │
│                    │    │  ✓      │     │                   │
│                    │    └─────────┘     │                   │
│                    │                    │                   │
│                    │  Verified Student  │                   │
│                    │  NIT Warangal      │                   │
│                    │                    │                   │
│                    │  Candidate  841926 │                   │
│                    │  ──────────────────│                   │
│                    │  CGPA       8.5>6.0│                   │
│                    │  ──────────────────│                   │
│                    │  Date       1/3/26 │                   │
│                    │  ──────────────────│                   │
│                    │                    │                   │
│                    │ [View On-Chain ↗]  │                   │
│                    │  Tx: 0x1234...     │                   │
│                    │                    │                   │
│                    └────────────────────┘                   │
│                                                             │
│                    AstraVerify Security                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> **Note**: This page uses a **light theme** unlike the rest of the app.

#### Color Scheme (Light Mode)

| Element | Color |
|---------|-------|
| **Page Background** | `bg-slate-50` (#f8fafc) |
| **Card Background** | `bg-white` |
| **Primary Text** | `text-slate-900` |
| **Secondary Text** | `text-slate-500` |

#### Components

| Component | Description |
|-----------|-------------|
| **Card Container** | White card with top green border |
| **Success Badge** | Large checkmark in green circle |
| **Title** | "Verified Student" |
| **Subtitle** | Institution + year |
| **Data Rows** | Label-value pairs with bottom borders |
| **CTA Button** | Dark button linking to blockchain explorer |
| **Transaction Hash** | Truncated hash preview |
| **Footer** | "AstraVerify Security Layer" branding |

#### Card Styling

```html
<div class="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full 
            border-t-8 border-green-500">
```

#### Data Row Pattern

```html
<div class="flex justify-between border-b pb-2">
  <span class="text-slate-500">Label</span>
  <span class="font-mono font-bold">Value</span>
</div>
```

#### 404 State

```html
<div class="min-h-screen bg-slate-950 flex items-center justify-center">
  <div class="p-10 text-red-500 font-bold text-center text-xl">
    ❌ Record Not Found
  </div>
</div>
```

---

## Responsive Design Notes

The current implementation uses:

| Breakpoint | Class | Usage |
|------------|-------|-------|
| **Default** | — | Mobile-first base styles |
| **md** | `md:` | 2-column service grid |
| **lg** | `lg:` | 3-column service grid |

### Areas for Improvement

1. **Mobile Sidebar** - Dashboard sidebar is fixed 320px, needs responsive drawer
2. **Verification Page** - Two-column layout needs stacking on mobile
3. **Video Canvas** - Fixed 640×360 might need scaling

---

## Accessibility Considerations

### Current Implementation

| Feature | Status |
|---------|--------|
| **Color Contrast** | ⚠️ Some slate-500 text may not meet WCAG AA |
| **Focus States** | ✅ Input focus borders visible |
| **Disabled States** | ✅ Visual distinction with opacity + cursor |
| **Alt Text** | ✅ Profile image has alt text |
| **Interactive Elements** | ⚠️ No aria-labels on icon-only buttons |

### Recommendations

1. Add `aria-label` to all icon-only buttons
2. Improve color contrast for muted text
3. Add `role="status"` to status/log sections
4. Add keyboard navigation for service cards
5. Add `sr-only` labels for visual-only content

---

## File Structure

```
app/
├── globals.css          # CSS variables, animations, Tailwind import
├── layout.tsx           # Root layout with Geist fonts
├── page.tsx             # Login page
├── lib/
│   └── firebase.ts      # Auth configuration
├── dashboard/
│   └── page.tsx         # Dashboard with services
└── verify/
    ├── nitw/
    │   └── page.tsx     # NITW verification flow
    └── [id]/
        └── page.tsx     # Verified profile view
```

---

*Generated for CredSetu v0.1.0 • Last Updated: January 2026*
