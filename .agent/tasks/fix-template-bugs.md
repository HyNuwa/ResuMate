# Task: Fix Two Template Rendering Bugs

## Context
The template system was recently migrated from broken Tailwind arbitrary classes to inline styles. The templates now render correctly, but two bugs remain in the shared rendering infrastructure.

---

## Bug 1: SectionRenderer hidden logic is wrong

**File:** `app/src/templates/shared/SectionRenderer.tsx` line 22

**Current (broken):**
```tsx
if (section.hidden && section.items.length === 0) {
  return null;
}
```

**Problem:** This uses `&&` (AND), so a section with `hidden: true` but items > 0 will **still render** instead of being hidden. The `hidden` flag should always hide the section regardless of items count.

**Fix:** Change `&&` to `||`:
```tsx
if (section.hidden || section.items.length === 0) {
  return null;
}
```

---

## Bug 2: Missing React `key` prop in SectionRenderer items

**File:** `app/src/templates/shared/SectionRenderer.tsx` line 35

**Current (causes React warning):**
```tsx
{items.map((item, index) => renderItem(item, index))}
```

**Problem:** Each rendered item lacks a `key` prop. All section items have an `id` field that should be used.

**Fix:** Wrap with a keyed Fragment:
```tsx
{items.map((item, index) => (
  <React.Fragment key={(item as any).id ?? index}>
    {renderItem(item, index)}
  </React.Fragment>
))}
```

Make sure to import `React` or destructure `Fragment` at the top of the file if not already imported.

---

## Verification
After fixing, verify:
1. Sections with `hidden: true` do NOT appear in the preview even if they have items
2. No "Each child in a list should have a unique key prop" warnings in the browser console
3. The preview still renders all non-hidden sections correctly
