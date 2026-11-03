# 🐛 Bug Fixes

A record of notable issues found and resolved during development, kept for context if similar problems resurface.

| # | Issue | Type | Severity | File |
|---|---|---|---|---|
| 1 | [Radix `Select.Item` empty value](#1-radix-selectitem-empty-value-error) | Runtime error | High (crashes the form) | `TaskDialog.tsx` |
| 2 | [Missing `DialogDescription`](#2-missing-dialogdescription) | Accessibility warning | Medium | `TaskDialog.tsx` |
| 3 | [Ref warnings on function components](#3-ref-warnings-on-function-components) | Console warning | Low | `button.tsx`, `dialog.tsx` |

---

## 1. Radix `Select.Item` empty-value error

**Symptom:** the task dialog threw when opened.
```
A <Select.Item /> must have a value prop that is not an empty string
```

**Root cause:** Radix reserves the empty string to mean "no selection" (it shows the placeholder). The "No category" option used `""` as its value, which collides with that meaning.

**Fix**
- Changed the "No category" value from `""` to a sentinel, `"none"`
- Defaulted the form state to `"none"`
- Converted `"none"` back to `null` in `handleSubmit` before saving

```tsx
const NO_CATEGORY = 'none'

<Select value={categoryId ?? NO_CATEGORY} onValueChange={setCategoryId}>
  <SelectItem value={NO_CATEGORY}>No category</SelectItem>
  {/* …categories */}
</Select>

// in handleSubmit
categoryId: categoryId === NO_CATEGORY ? null : categoryId,
```

**Watch out for:** any place that reads `categoryId` directly (filters, stats, `TaskCard`) must treat `null` as "no category", never `"none"`. Keep the conversion at the form boundary only.

**Prevention:** define the sentinel as a named constant, never an inline string, so the form and the submit handler can't drift apart.

---

## 2. Missing `DialogDescription`

**Symptom:** a console warning, and screen readers announced the dialog without context.
```
Missing Description or aria-describedby={undefined} for {DialogContent}
```

**Root cause:** Radix `Dialog` expects every dialog to describe itself via `DialogDescription` or `aria-describedby`.

**Fix:** imported `DialogDescription` and added text for both modes.

```tsx
<DialogHeader>
  <DialogTitle>{task ? 'Edit task' : 'New task'}</DialogTitle>
  <DialogDescription>
    {task ? 'Update the details of this task.' : 'Add a task with optional subtasks, tags and dates.'}
  </DialogDescription>
</DialogHeader>
```

**Prevention:** every dialog, alert dialog and sheet needs a title and a description. If you don't want the text visible, wrap it in Radix's `VisuallyHidden` rather than deleting it.

---

## 3. Ref warnings on function components

**Symptom:** a console warning whenever Radix tried to attach a ref.
```
Function components cannot be given refs
```

**Root cause:** Radix's `asChild` and `Slot` pass refs to their child. On React 18, a plain function component can't receive a ref unless it's wrapped in `React.forwardRef`.

**Fix:** wrapped `Button` and `DialogOverlay` in `React.forwardRef`, added ref types, and set `displayName`.

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = 'Button'
```

**Prevention:** any component used as the child of `asChild`, `TooltipTrigger`, `DialogTrigger` and similar needs to forward its ref. Note that React 19 makes `ref` a normal prop and `forwardRef` unnecessary, but this project is on React 18.

---

## Regression tests

These bugs are cheap to lock down once Vitest and React Testing Library are set up (see [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#testing)).

```tsx
it('saves "No category" as null', async () => {
  const onSave = vi.fn()
  render(<TaskDialog open onSave={onSave} categories={[]} /* …props */ />)
  await userEvent.type(screen.getByLabelText(/title/i), 'Test')
  await userEvent.click(screen.getByRole('button', { name: /create task/i }))
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ categoryId: null }))
})

it('has an accessible description', () => {
  render(<TaskDialog open /* …props */ />)
  expect(screen.getByRole('dialog')).toHaveAccessibleDescription()
})
```

---

## Suggestions for the future

- [ ] **Forward refs by default** in shared `ui/` components that wrap a DOM element
- [ ] **Error boundaries** around each major view, so one crash doesn't blank the app
- [ ] **React Hook Form + Zod** for the task form. A schema with `categoryId: z.string().nullable()` would have made bug 1 impossible
- [ ] **Unit and component tests** around form behaviour
- [ ] **Treat console warnings as failures** in tests, so issues like 2 and 3 are caught in CI:
  ```ts
  // vitest.setup.ts
  vi.spyOn(console, 'error').mockImplementation((msg) => { throw new Error(msg) })
  ```
- [ ] **Lint accessibility** with `eslint-plugin-jsx-a11y`

---

## Template for new entries

```markdown
## N. Short title

**Symptom:** what the user or console showed (include the exact message)
**Root cause:** why it happened
**Fix:** what changed
**Prevention:** how to avoid the same class of bug
**File(s):** paths
```
