---
name: teach-impeccable
description: One-time setup that gathers design context for your project and saves it to your AI config file.
---

Gather essential design context for the project and save to `.impeccable.md`.

**Required Context to Gather:**

1. **Target Audience**
   - Who uses this product?
   - What is their technical proficiency?
   - What context do they use it in?

2. **Use Cases**
   - What jobs are users trying to get done?
   - What are the primary user flows?
   - What are the edge cases?

3. **Brand Personality/Tone**
   - How should the interface feel? (playful, serious, luxurious, minimal, etc.)
   - What emotions should it evoke?
   - Any existing brand guidelines?

4. **Technical Constraints**
   - Framework being used
   - Performance requirements
   - Accessibility requirements
   - Browser support needs

**Output:**
Create `.impeccable.md` in project root with all gathered context. This file will be automatically loaded for all future design work.

**Note:** Run this once at the beginning of a project. If context changes, run again to update.
