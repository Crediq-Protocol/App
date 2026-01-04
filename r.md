

Crediq Dashboard — Verification Cards UI Redesign

Scope: Aesthetic + copy only (NO backend changes)

Objective

Replace the current list-style “Available verifications” UI with a card-based system that:
	•	Clearly communicates what claim is being proven
	•	Feels modern, confident, and intentional (not demo-ish)
	•	Shows Crediq’s long-term vision, even with limited live features
	•	Keeps only 3 live flows, with others visually marked as Coming soon
	•	Requires zero backend changes

This is a pure frontend redesign.

⸻

High-Level Layout Changes

Current
	•	Single container
	•	Vertical list rows
	•	Low visual hierarchy
	•	“Coming soon” looks like disabled clutter

New
	•	Grid of verification cards
	•	Cards grouped visually (Live vs Coming Soon)
	•	Each card communicates:
	1.	The exact claim
	2.	What is not revealed
	3.	Status (Live / Coming soon)
	4.	Clear action

⸻

Page Structure (Top to Bottom)

1. Page Header (minimal change)

Title (keep):
Available verifications

Subtitle (rewrite):

Select a claim to prove — without exposing underlying data.

Tone: calm, confident, non-marketing.

⸻

2. Card Grid Layout
	•	Grid: 3 columns on desktop, 2 on tablet, 1 on mobile
	•	Gap: generous (cards should breathe)
	•	Max width: align with current content container

[ Academic Threshold ]   [ Problem-Solving Activity ]   [ Account Ownership ]
[ Income Threshold ]     [ Work Experience ]            [ Age Eligibility ]


⸻

Card Design System (Global)

Card Container
	•	Background: soft off-white (slightly elevated from page)
	•	Border: very subtle (light neutral)
	•	Border-radius: medium–large (rounded but not bubbly)
	•	Shadow:
	•	Default: extremely subtle ambient shadow
	•	Hover: slightly deeper shadow + tiny lift (2–4px translateY)

Goal: cards feel tactile, not flat.

⸻

Card Sections (Top → Bottom)

A. Status Badge (Top-right corner)
	•	LIVE
	•	Small pill
	•	Dark text on light neutral background
	•	COMING SOON
	•	Muted pill
	•	Lower contrast
	•	No hover emphasis

This badge is the only loud status indicator.

⸻

B. Card Title
Short, human-readable category name.

Examples:
	•	Academic Threshold
	•	Problem-Solving Activity
	•	Account Ownership
	•	Income Threshold
	•	Work Experience
	•	Age Eligibility

Typography:
	•	Slightly heavier than body
	•	Not headline-large

⸻

C. Primary Claim (Most Important Line)
This replaces all vague “verify credentials” language.

Large, readable sentence.

Examples (exact copy to use):
	•	Prove you have a CGPA greater than 6.0
	•	Prove you’ve solved 5+ problems on LeetCode
	•	Prove that this X account belongs to you
	•	Prove your annual income exceeds a required amount
	•	Prove you’ve worked for more than a required number of years
	•	Prove you are above a required age

This line should visually dominate the card.

⸻

D. Secondary Explanation (Quiet)
One calm sentence explaining what is not exposed.

Examples:
	•	“Only the condition is proven — not your grades or transcript.”
	•	“Activity is verified without revealing submissions or history.”
	•	“Ownership is verified without OAuth permissions or screenshots.”
	•	“The threshold is proven without sharing documents or exact numbers.”

Tone: factual, reassuring, non-salesy.

⸻

E. Subtle Source / Context (Optional, small)
Used only where relevant, very understated.

Example (Academic Threshold card only):
	•	“Verified against the NIT Warangal academic portal.”

Style:
	•	Small text
	•	Muted color
	•	No logo, no icon

⸻

F. Tags (Visual Anchors)
3 small tags per card.

Style:
	•	Rounded pills
	•	Light background
	•	Neutral text
	•	Not clickable (purely informational)

Examples:
	•	Education · Eligibility · Zero-Knowledge
	•	Developer · Activity · Privacy
	•	Identity · Ownership · Security

These help reviewers quickly scan Crediq’s scope.

⸻

G. Action Area (Bottom)
LIVE cards
	•	Primary button
	•	Label:
	•	Start verification
	•	Full width
	•	Strong contrast

COMING SOON cards
	•	Secondary / ghost button
	•	Label:
	•	View demo
	•	Disabled click → opens a static modal or does nothing (frontend only)
	•	Visually lower emphasis

Important:
	•	NITW card must keep existing redirect behavior exactly as-is
	•	All other cards must NOT trigger real flows

⸻

Visual Hierarchy Rules
	•	Claim text > Title > Description > Tags
	•	Buttons are visible but not aggressive
	•	Coming soon cards are complete, not greyed-out skeletons

The user should feel:

“This system already exists. Some parts just aren’t unlocked yet.”

⸻

Hover & Interaction States

Live Cards
	•	Slight lift
	•	Shadow increases subtly
	•	Button becomes slightly darker

Coming Soon Cards
	•	No lift
	•	Cursor remains default
	•	Button looks inactive but intentional

No animations beyond micro-interactions.

⸻

Sidebar (Minor Cleanup Only)
	•	Keep layout as-is
	•	Ensure branding reads Crediq everywhere (remove “Crediq Protocol” wording)
	•	No new nav items

⸻

Copy Changes Summary (Important)

REMOVE everywhere:
	•	“Verify credentials”
	•	“Upload documents”
	•	“Select a procedure”
	•	“Education claim”

USE instead:
	•	“Prove you have…”
	•	“Only the condition is proven”
	•	“Without exposing…”

This is critical to positioning.

⸻

What NOT to Change
	•	No backend logic
	•	No API changes
	•	No verification logic
	•	No routing changes (except existing NITW flow remains)
	•	No auth changes

⸻

Success Criteria (How we know this worked)
	•	A reviewer can understand Crediq in 10 seconds
	•	Cards feel like final product, not placeholders
	•	The system communicates proof > data
	•	The UI feels intentional even with limited live features

⸻

