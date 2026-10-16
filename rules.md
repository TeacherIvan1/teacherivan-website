# AI FRONTEND TASTE & ANTI-SLOP RULES

1. **NO AI Clichés:** Strictly forbid generic purple, magenta, or neon cyan gradients. Stick 100% to the hex codes defined in `DESIGN.md` (`#1A3153`, `#E09B30`, `#A7C7E7`, `#4A5568`, `#FAFAFA`).
2. **Intentional Contrast:** Alternate cleanly between light sections (`#FAFAFA` background with `#1A3153` headings) and high-focus dark institutional sections (`#1A3153` background with `#FAFAFA` text and `#E09B30` accents for the Gemini Voice Tutor interface).
3. **Structured Spacing:** Use a strict 4px/8px Tailwind spacing scale (`gap-4`, `p-6`, `py-12`, `my-8`). Avoid arbitrary pixel values.
4. **Card & Border Discipline:** Exercise cards and UI panels must use `#FAFAFA` backgrounds with thin, crisp `1px` borders in `#A7C7E7` (`border-[#A7C7E7]`). Avoid exaggerated drop shadows or 3D bevel effects.
5. **Micro-interactions:** Use subtle transitions (`transition-all duration-200`) on buttons and voice tutor controls. Primary CTAs in `#E09B30` should slightly darken or lift on hover.