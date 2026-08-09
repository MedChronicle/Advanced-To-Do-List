# Bug Fixes

A record of notable issues found and resolved during development. Kept for context if similar issues resurface.

## 1. Radix `Select.Item` empty-value error

**Problem:** Radix UI's `Select.Item` doesn't accept an empty string as its `value` — the "No category" option was using `""`.
**Error:** `A <Select.Item /> must have a value prop that is not an empty string`

**Fix:**
- Changed the "No category" option's value from `""` to `"none"`
- Updated form initialization to default to `"none"`
- Added conversion logic in `handleSubmit` to map `"none"` back to `null` before saving

**File:** `src/app/components/TaskDialog.tsx`

## 2. Missing `DialogDescription`

**Problem:** Radix's `Dialog` warns when no description/`aria-describedby` is provided, which also hurts screen-reader UX.
**Warning:** `Missing Description or aria-describedby={undefined} for {DialogContent}`

**Fix:** Imported `DialogDescription` and added descriptive text for both create and edit modes.

**File:** `src/app/components/TaskDialog.tsx`

## 3. Ref warnings on function components

**Problem:** Function components were receiving refs without being wrapped in `React.forwardRef`.
**Warning:** `Function components cannot be given refs`

**Fix:** Wrapped `Button` and `DialogOverlay` in `React.forwardRef`, added proper TypeScript ref types, and set `displayName` on both for clearer debugging.

**Files:** `src/app/components/ui/button.tsx`, `src/app/components/ui/dialog.tsx`

## Suggestions for the future

- Custom `forwardRef` wrappers for other frequently-reused components, to catch this class of issue earlier
- Error boundaries around major views
- A schema-based form library (e.g. React Hook Form + Zod) for the task form, in place of manual state
- Unit tests around form behavior so regressions like these are caught automatically
