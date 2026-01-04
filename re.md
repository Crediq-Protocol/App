
Crediq App UI Rework — Engineering Implementation Note

Scope: Visual + structural UI changes only
No functional changes. No logic changes. No API changes.
Audience: Internal demo reviewer
Product name: Crediq (this is the only valid name)

⸻

0. Objective (what we are changing and why)

The current UI visually resembles:
	•	a Web3 demo tool
	•	a live hacking interface
	•	a SaaS dashboard

This is misaligned with the purpose of the product.

Crediq is verification infrastructure.
The UI must communicate:
	•	finality
	•	correctness
	•	procedural certainty
	•	low drama

The goal of this rework is to make the application feel like a verification instrument, not a product pitch.

⸻

1. Global UI principles (apply everywhere)

These rules override all existing styling unless explicitly preserved.

⸻

1.1 Color mode
	•	Use light mode only
	•	No dark mode
	•	No automatic theme switching

Global background
	•	Off-white / warm light gray
	•	Avoid pure white
	•	Avoid high contrast black backgrounds

⸻

1.2 Color usage rules

Allowed
	•	Black / near-black for primary text
	•	Neutral grays for secondary text
	•	One restrained accent color (used sparingly)
	•	Thin borders and dividers

Disallowed
	•	❌ Gradients (except logo, optional)
	•	❌ Neon or saturated colors
	•	❌ Glow effects
	•	❌ Blur effects
	•	❌ Backdrop blur / glassmorphism
	•	❌ Animated color changes
	•	❌ Pulsing indicators

If a color draws attention → remove or neutralize it.

⸻

1.3 Typography rules

Keep the existing font family, but adjust usage.

Hierarchy
	•	Page titles: calm, single line
	•	Section headers: understated
	•	Labels: small, uppercase, spaced
	•	Data: monospace where appropriate

Remove
	•	Oversized hero-style typography
	•	Marketing-style emphasis
	•	Strong visual contrast between headings and body

Typography should feel document-like, not promotional.

⸻

1.4 Layout rules
	•	Prefer sections + dividers over cards
	•	Use cards only when content must be grouped
	•	Reduce rounded corners
	•	Remove drop shadows where possible

Layouts should resemble:
	•	forms
	•	reports
	•	certificates
	•	logs

Avoid:
	•	dashboard tiles
	•	feature grids
	•	widget-like components

⸻

1.5 Interaction & animation rules
	•	Remove decorative animations
	•	Keep only:
	•	subtle opacity transitions
	•	simple height transitions (expand/collapse)

No motion that implies excitement or urgency.

⸻

2. Naming and terminology (mandatory)
	•	Replace all instances of:
	•	CredSetu
	•	any other placeholder or legacy name
→ with Crediq

This applies to:
	•	UI text
	•	headers
	•	footers
	•	loading states
	•	error messages
	•	metadata

There is no sub-brand.

⸻

3. Global component changes

⸻

3.1 Buttons

Current issues
	•	Gradient buttons
	•	High visual dominance
	•	CTA-heavy styling

Required changes
	•	Flat buttons
	•	Neutral background
	•	Clear but quiet hierarchy

Primary buttons should look procedural, not promotional.

⸻

3.2 Status indicators

Current issues
	•	Colored pills
	•	“LIVE” labels
	•	Pulsing dots

Required changes
	•	Plain text status
	•	Optional small static dot
	•	No animation

Example:

Status: In progress
Status: Verified
Status: Idle


⸻

3.3 Cards & containers

Current issues
	•	Heavy shadows
	•	Rounded corners
	•	Hover lift effects

Required changes
	•	Flat sections
	•	Thin borders or dividers
	•	Minimal or no border radius
	•	No hover lift

⸻

4. Page-by-page UI changes

⸻

4.1 Login page (/)

Problems
	•	Glassmorphic container
	•	Decorative background blobs
	•	Branding-heavy presentation

Required changes

Layout
	•	Remove glassmorphism
	•	Remove background blobs
	•	Flat, centered layout

Visual tone
	•	Light background
	•	Black logo
	•	No glow or gradients

Intent
This page should feel like a system access screen, not a marketing entry point.

⸻

4.2 Dashboard (/dashboard)

Problems
	•	SaaS-style card grid
	•	Feature tile emphasis

Required changes

Sidebar
	•	Keep existing sidebar structure
	•	Visually de-emphasize
	•	Reduce visual weight

Main content
	•	Replace card-grid feel with a sectioned list
	•	Each verification option reads like a selectable procedure

Example structure:

Available verifications
——————————————
Education claim (NITW)
Salary threshold — Coming soon
Employment history — Coming soon

No card shadows.
No hover animations.
No promotional descriptions.

⸻

4.3 Verification page (/verify/nitw)

This is the most sensitive screen.

Problems
	•	“LIVE SERVER VIEW”
	•	Strong visual dominance of streaming
	•	High drama / hacker aesthetic

Required changes (visual only)

Overall
	•	Keep existing layout structure
	•	Reduce visual intensity

Left column
	•	Form-first
	•	Clear, linear structure
	•	Reads like a controlled procedure

Right column
	•	De-emphasize canvas
	•	Remove “LIVE” language
	•	No pulsing indicators
	•	Canvas hidden until verification starts
	•	Use neutral placeholder text when idle

Logs
	•	Plain text
	•	Monospace timestamps
	•	No decorative icons

Tone should communicate:

“A verification process is executing.”

Not:

“Watch something risky happen.”

⸻

4.4 Verified profile page (/verify/[id])

This page is structurally good but needs cleanup.

Required changes
	•	Remove any legacy branding text
	•	Maintain light theme
	•	Reduce CTA emphasis
	•	Make layout resemble a certificate / record

The page should feel printable and final.

⸻

5. What must NOT change
	•	❌ No backend logic
	•	❌ No verification flow changes
	•	❌ No permission changes
	•	❌ No API changes
	•	❌ No streaming logic changes

Only visual hierarchy, spacing, color, and emphasis.

⸻

6. Success criteria (how we judge this)

The UI update is successful if:
	•	The app feels calm and authoritative
	•	Nothing feels flashy or “crypto”
	•	An internal reviewer feels:
“This looks like infrastructure, not a product demo.”

If something looks exciting → tone it down.

⸻

7. Engineering decision rule

When unsure:
	•	Remove styling
	•	Reduce emphasis
	•	Prefer text over effects
	•	Prefer structure over decoration

Crediq should earn trust by restraint, not visuals.

