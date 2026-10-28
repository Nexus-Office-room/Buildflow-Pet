# Root layout integration

The production app mounts `PatchCompanion` from `apps/web/src/app/layout.tsx` inside the root `<body>`. The floating companion is off by default. Its enabled state, detached-window state, selected companion, and normalized position are stored in browser local storage. The `/pet-window` route supplies a lightweight same-origin popup that can be moved as a browser window and returned to Buildflow.

The original stylesheet rules are in `apps/web/src/app/globals.css`; the companion-only CSS excerpt is kept in `patch-companion.css` for review. The current root layout integration is recorded below as context (the full layout also mounts the shared page background and ambient background).

```tsx
{children}
<PatchCompanion />
<BuildflowBackdrop />
<AmbientVideoBackground />
```
