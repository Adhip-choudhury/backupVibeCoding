# Code Review — Adhip Choudhury Portfolio

**Date:** May 20, 2026
**Tech Stack:** Next.js 14.2, React 18.3, TypeScript 5.4, Tailwind CSS 3.4, Framer Motion 11
**Pages:** 4 (Profile, Services, Certifications, Contact)

---

## 1. Architecture & Structure

### What's Good
- Clean separation: `components/` for shared UI, `app/` for pages
- Consistent use of `use client` directive on all interactive components
- Proper TypeScript typing on the certifications data structure
- Canvas-based animated background is performant (requestAnimationFrame with cleanup)
- `useInView` for scroll-triggered animations is the right pattern

### Issues

**[HIGH] `SectionWrapper` duplicated across 4 files**
The exact same `SectionWrapper` component is copy-pasted in `page.tsx`, `services/page.tsx`, `certifications/page.tsx`, and `contact/page.tsx`. This is a maintenance burden — any change requires editing 4 files.

**Fix:** Extract it to `components/SectionWrapper.tsx` and import it.

**[MEDIUM] `containerVariants` and `itemVariants` duplicated**
Same animation variants are defined in every page file. Extract to `lib/animations.ts` or a shared constants file.

**[LOW] No `.env` or config abstraction**
The contact form has a hardcoded placeholder email (`adhip@example.com`). This should be in an env variable or config file so it's easy to change without touching component code.

---

## 2. Bugs & Potential Issues

### [HIGH] Contact form does nothing

```tsx
// app/contact/page.tsx:50-54
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitted(true)
  setTimeout(() => setSubmitted(false), 3000)
}
```

The form prevents default, sets a "submitted" state, and resets after 3 seconds. **No data is sent anywhere.** The user will see "Message sent!" but nothing actually happens.

**Fix options:**
- Connect to a backend API route (`/api/contact`) that sends emails via Resend/SendGrid
- Use a service like Formspree, EmailJS, or Netlify Forms
- At minimum, open a `mailto:` link as a fallback

### [HIGH] `Math.random()` inside React render

```tsx
// components/ScrollAnimations.tsx:189
animate={isInView ? { width: [0, 80 + Math.random() * 100] } : {}}

// components/ScrollAnimations.tsx:227
transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
```

`Math.random()` is called during render. This means on every re-render, the values change unpredictably. This can cause animation glitches and hydration mismatches between server and client.

**Fix:** Move the random values to a `useMemo` or `useState` so they're stable:
```tsx
const randomWidths = useRef([80 + Math.random() * 100, ...])
```

### [MEDIUM] Canvas animation runs continuously even when tab is inactive

The `AnimatedBackground` canvas uses `requestAnimationFrame` without checking `document.hidden`. This wastes CPU/battery when the tab is in the background.

**Fix:** Add visibility check:
```tsx
const drawGrid = () => {
  if (document.hidden) {
    animationId = requestAnimationFrame(drawGrid)
    return
  }
  // ... draw logic
}
```

### [MEDIUM] Loading screen timeout is hardcoded at 1200ms

```tsx
// app/layout.tsx:57
const timer = setTimeout(() => setLoading(false), 1200)
```

If the page loads faster, users still wait 1.2 seconds. If it's slower, the loading screen disappears while content is still rendering.

**Fix:** Use a minimum display time approach:
```tsx
useEffect(() => {
  const minTime = setTimeout(() => setMinTimeElapsed(true), 800)
  return () => clearTimeout(minTime)
}, [])

useEffect(() => {
  if (minTimeElapsed && !loading) setLoading(false)
}, [minTimeElapsed])
```

### [LOW] No `alt` text fallback for certificate images

If a certificate image fails to load, the `CertImage` component returns `null` silently. The user sees a blank card with no indication of what certificate it was.

**Fix:** Show a fallback placeholder with the cert title.

---

## 3. Performance

### [MEDIUM] All pages are `'use client'`

Every single page and component is a client component. This means the entire site is client-side rendered with no server-side benefits. For a static portfolio, this is unnecessary overhead.

**Impact:**
- First Load JS: ~125-133 KB per page
- Slower initial page load
- No SEO benefit from server rendering

**Fix:** Convert pages that don't need interactivity to server components. Only the parts that need animations should be client components. For example:
- Page shell can be a server component
- Wrap animated sections in client components

### [LOW] Certificate images have no optimization

The `CertImage` component uses `next/image` with `fill`, which is good, but the images are large PNGs (116KB–408KB). They should be converted to WebP format for smaller file sizes.

---

## 4. Code Quality & Style

### [MEDIUM] Inconsistent import ordering

Some files import React hooks first, then framer-motion, then local components. Others mix the order. Establish a consistent pattern:
```tsx
import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ScrollRobot } from '@/components/ScrollAnimations'
```

### [LOW] No ESLint or Prettier config

The project has no `.eslintrc` or `.prettierrc`. This means there's no automated code style enforcement.

### [LOW] Missing `next.config.js` optimization

```js
// next.config.js
const nextConfig = {}
```

Should include image domains, react strict mode toggle, and compression:
```js
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
}
```

---

## 5. Theme & Style Improvement Suggestions

### Current State
The orange theme (`#ff6b35` / `#ffa726` / `#ff8c00`) on a warm beige background (`#fff8f0`) is cohesive and boyish. The glass-morphism cards and gradient borders work well.

### Suggested Improvements

**1. Add a subtle noise/grain texture overlay**
A very subtle noise texture (2-3% opacity) on the background gives a premium, tactile feel that's common in modern portfolio sites.

```css
.bg-noise {
  background-image: url("data:image/svg+xml,...");
  opacity: 0.03;
  pointer-events: none;
}
```

**2. Improve contrast on secondary text**
`text-dark-300` (`#b89070`) on `#fff8f0` has a contrast ratio of ~3.5:1, which is below the WCAG AA threshold of 4.5:1 for body text. Consider using `text-dark-400` (`#8a6a5a`) or darker for all readable text.

**3. Add a subtle hover glow on cards**
Currently cards lift on hover (`y: -5`) but lack a glow effect. Adding a subtle orange box-shadow on hover would reinforce the theme:

```css
.glass:hover {
  box-shadow: 0 8px 30px rgba(255, 107, 53, 0.08);
}
```

**4. Add a footer**
The site has no footer. A minimal footer with copyright, social links, and a "back to top" button would complete the design.

**5. Certificate mapping needs verification**
The screenshots are mapped to certifications by filename order (`cert_01.png` → AI Coder, `cert_02.png` → AI Builder, etc.). These mappings may be incorrect. Verify each image matches the right certification title.

**6. Add a favicon**
No favicon is configured. Add a simple "AC" or robot icon as `public/favicon.ico`.

**7. Consider adding a subtle parallax effect**
The hero glow elements could have a subtle parallax movement based on scroll position or mouse position for a more immersive feel.

**8. The robot SVG could use a shadow beneath it**
Adding a subtle ground shadow beneath the robot would make it feel grounded rather than floating in space:

```tsx
<ellipse cx="100" cy="238" rx="35" ry="4" fill="#ff6b35" opacity="0.1" />
```

---

## 6. Accessibility

### [MEDIUM] No keyboard navigation for certificate modal

The certificate image modal can only be closed by clicking the overlay or the X button. There's no Escape key handler.

**Fix:** Add a `useEffect` with a keydown listener for Escape.

### [LOW] No `aria-label` on navigation links

The navbar links use icon characters (`◈`, `◇`, `◆`, `◎`) without aria labels. Screen readers will read these as unknown characters.

### [LOW] Color contrast on gradient text

The gradient text (`#ff6b35` → `#ffa726` → `#ff8c00`) on `#fff8f0` may not meet WCAG AA contrast requirements for smaller text sizes. The current implementation uses it only for large headings, which is acceptable (3:1 threshold for large text).

---

## 7. Security

### [LOW] No input sanitization on contact form

The form accepts user input but has no sanitization. If you connect this to a backend, ensure you sanitize inputs to prevent XSS or injection attacks.

### [LOW] `target="_blank"` on PDF links

The PDF links use `target="_blank"` without `rel="noopener noreferrer"`. Actually, this is already included (`rel="noopener noreferrer"`), so this is fine.

---

## 8. Summary Priority List

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| HIGH | Contact form doesn't send data | Medium | Critical — form is useless |
| HIGH | `Math.random()` in render | Low | Causes hydration bugs |
| MEDIUM | `SectionWrapper` duplicated 4x | Low | Maintenance burden |
| MEDIUM | All pages are client components | Medium | Performance impact |
| MEDIUM | Canvas runs when tab inactive | Low | Battery/CPU waste |
| MEDIUM | Certificate image-to-cert mapping | Low | May show wrong certs |
| MEDIUM | No keyboard nav for modal | Low | Accessibility |
| LOW | Add footer | Medium | Completes the site |
| LOW | Add favicon | Low | Professional polish |
| LOW | Convert images to WebP | Low | Page load speed |
| LOW | Add ESLint/Prettier | Low | Code quality |
| LOW | Add noise texture, card glow | Low | Visual polish |

---

## 9. Overall Assessment

**Rating: 7/10 — Good foundation, needs polish**

The portfolio is visually impressive with smooth animations, a cohesive orange theme, and well-structured pages. The animated robot and laptop SVGs are creative and add personality. However, the contact form being non-functional is a critical issue for a portfolio site, and the code duplication (SectionWrapper, animation variants) needs to be addressed for maintainability.

The biggest wins would be:
1. Making the contact form actually work
2. Extracting shared components
3. Adding a footer
4. Verifying certificate image mappings
5. Fixing the `Math.random()` render issue
