# Buildflow Pet

Private source workspace for the Buildflow companion pet feature. This repo collects the pet catalogue and selection persistence, floating companion UI, companion picker page, sprite artwork, and the companion-specific CSS.

## Contents

- `apps/web/src/lib/pets.ts` — pet definitions, opt-in preference, selection, detached-window state, and saved position
- `apps/web/src/components/brand/PatchCompanion.tsx` — persistent floating sidekick widget
- `apps/web/src/app/companions/page.tsx` — companion selection screen and on/off control
- `apps/web/src/app/pet-window/page.tsx` — same-origin popup window for moving the companion outside the main Buildflow page
- `apps/web/public/patch/patch-v2.png` — Patch sprite atlas
- `apps/web/src/app/patch-companion.css` — companion-only stylesheet excerpt from the main app
- `apps/web/src/app/companion-layout-integration.md` — root layout and popup integration notes
- `apps/web/src/app/companion-layout-integration.md` — where the widget is mounted

## Production relationship

The live application currently builds from the private [`Buildflow`](https://github.com/Nexus-Office-room/Buildflow) monorepo. This repository is a private focused source copy for review and pet-specific work; it is not a separate deployment and changes here do not automatically alter the live app. The shared CSS excerpt is copied for visibility; the app's complete stylesheet remains in the main repository.

The feature uses Next.js, React, the app's `@/` alias, and the shared Buildflow root layout. Keep credentials and environment files out of this repository.

## Asset and license boundary

The companion implementation uses the existing Buildflow Patch sprite and Buildflow-authored UI code. No Little Butler character artwork, pet component, or source files from the Butler archive are included; that archive reserves its character and component for Butler and does not grant reuse in Buildflow.
