# Root layout integration

The production app mounts `PatchCompanion` from `apps/web/src/app/layout.tsx` inside the root `<body>`. The original stylesheet rules are in `apps/web/src/app/globals.css`; the companion-only CSS excerpt is kept in `patch-companion.css` in this repository for easy review. The current root layout integration is recorded below as context (the full layout also mounts the shared page background and metadata).

```tsx
{children}
<PatchCompanion />
<BuildflowBackdrop />
<AmbientVideoBackground />
```
