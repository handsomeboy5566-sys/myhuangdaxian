---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Apache 2.0. Based on Anthropic's frontend-design skill.
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Direction

Commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc.
- **Differentiation**: What makes this UNFORGETTABLE?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision.

## Frontend Aesthetics Guidelines

### Typography
- **DO**: Use a modular type scale with fluid sizing (clamp)
- **DO**: Vary font weights and sizes to create clear visual hierarchy
- **DON'T**: Use overused fonts—Inter, Roboto, Arial, Open Sans, system defaults
- **DON'T**: Put large icons with rounded corners above every heading

### Color & Theme
- **DO**: Use modern CSS color functions (oklch, color-mix, light-dark)
- **DO**: Tint your neutrals toward your brand hue
- **DON'T**: Use gray text on colored backgrounds
- **DON'T**: Use pure black (#000) or pure white (#fff)
- **DON'T**: Use the AI color palette: cyan-on-dark, purple-to-blue gradients
- **DON'T**: Use gradient text for "impact"
- **DON'T**: Default to dark mode with glowing accents

### Layout & Space
- **DO**: Create visual rhythm through varied spacing
- **DO**: Use fluid spacing with clamp()
- **DO**: Use asymmetry and unexpected compositions
- **DON'T**: Wrap everything in cards
- **DON'T**: Nest cards inside cards
- **DON'T**: Use identical card grids
- **DON'T**: Center everything

### Visual Details
- **DON'T**: Use glassmorphism everywhere
- **DON'T**: Use rounded rectangles with generic drop shadows
- **DON'T**: Use modals unless there's truly no better alternative

### Motion
- **DO**: Use motion to convey state changes
- **DO**: Use exponential easing (ease-out-quart/quint/expo)
- **DON'T**: Animate layout properties (width, height, padding, margin)
- **DON'T**: Use bounce or elastic easing

### Interaction
- **DO**: Use progressive disclosure
- **DO**: Design empty states that teach the interface
- **DON'T**: Repeat the same information
- **DON'T**: Make every button primary

## The AI Slop Test

**Critical quality check**: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem.

A distinctive interface should make someone ask "how was this made?" not "which AI made this?"
