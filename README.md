# AQAC AI — local Figma Make project

This is a runnable local reconstruction of the current Figma Make preview.

## Provenance

- Figma file key: `v9WbSErhJ4qhJgmvMY2q3c`
- Cached-preview commit: `68e5694d93f0a34ea04af507b03618c0624051db`
- Original application source was recovered from the preview bundle's inline source map.
- The generated CSS and original built preview artifacts are preserved under `.figma-export/`.
- No temporary preview token or authentication cookie is stored in this project.

## Run locally

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:5173>.

## Checks

```bash
npm run typecheck
npm run build
```

The current project is a frontend prototype. Assessment drafts and guide snapshots use browser `localStorage`; no production backend is connected.
