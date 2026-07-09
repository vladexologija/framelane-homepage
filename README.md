This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Projects console (embedded editor)

The console follows FrameLane's closed loop: create a project, apply targeted edits,
validate and preview for free, and pay only for the final render once it is valid
(projects, then preview, then render). The one-shot `POST /v1/renders` (a whole
timeline in one call) stays available as a documented fast path.

- `/projects` is the list: create, open, and delete projects, backed by the deployed
  `/v1/projects` API.
- `/projects/[id]` is the project editor (formerly the playground): the **FrameTake
  editor** (canvas + timeline + inspector) with a right-side tabbed panel of "Render
  body" and "Renders" alongside the editor's native element inspector.
- `/projects/sample` is a reserved route that opens the editor with the default scene.
  It is non-persisted and renders via `POST /v1/renders`.

Real projects persist their edits with a `replace_request` op
(`POST /v1/projects/{id}/ops`) and render via `POST /v1/projects/{id}/renders`.

The editor lives in the sibling repo `../frametake-frontend` and ships as a prebuilt
ES-module bundle (Turbopack can't consume its raw Vite source across the repo
boundary). It's vendored into `./vendor` (gitignored):

```bash
# Requires ../frametake-frontend and ../frametake-api checked out as siblings.
./scripts/sync-editor.sh   # builds the editor lib + scene schema, copies into vendor/
```

Run this after pulling editor changes. Eventually this is replaced by an
`@frametake/editor` npm dependency. Key pieces:

- `src/components/frametake-editor-client.tsx` — client-only dynamic mount of the bundle.
- `src/lib/sceneToRenderRequest.ts` — maps the editor `Scene` → the render request body.
- `src/app/(console)/projects/` — the list page plus `[id]` (the project editor: render-JSON panel + Renders) and server actions (upload/ops/render).
- `src/lib/editor-types.ts` — the host's view of the editor's props (the bundle ships no `.d.ts`).

Run `npm test` for the projects console unit/component tests.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
