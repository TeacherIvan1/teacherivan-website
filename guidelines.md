# UI & ACCESSIBILITY AUDIT GUIDELINES

Before finalizing any component or page update, audit the code against this checklist:
- [ ] **Color Contrast:** Is body text (`#4A5568`) only placed on light backgrounds (`#FAFAFA`)? On `#1A3153` backgrounds, text must be `#FAFAFA` or `#A7C7E7`.
- [ ] **Badge Formatting:** Are all CEFR level tags (A1-B2, IELTS) and descriptors using `uppercase` and wide letter-spacing (`tracking-[0.15em]`)?
- [ ] **Logo & Mascot Safety:** Does the logo have a minimum width of `160px` (`min-w-[160px]`) and proper padding around it? Never distort or stretch the character image.
- [ ] **Interactive States:** Do all buttons, scenario selectors, and audio controls have clear `:hover`, `:focus-visible`, and `:active` states?
- [ ] **Responsive Layout:** Does the layout stack cleanly on mobile (`375px`) without horizontal overflow?