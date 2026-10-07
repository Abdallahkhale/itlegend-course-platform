# IT Legend Course Platform

A responsive course catalog and player built for the [IT Legend frontend challenge](https://challenges.itlegend.net/frontend-hiring). The player follows the supplied desktop/mobile design: a compact course header, a 3:2 video stage, course materials, progress, curriculum, comments, and focused dialogs.

[Live demo](https://abdallahkhale.github.io/itlegend-course-platform/) · [Public repository](https://github.com/Abdallahkhale/itlegend-course-platform)

The stack is Next.js App Router, React, TypeScript, plain CSS, and Lucide icons. This is a responsive website that runs in desktop and mobile browsers; it is not a native Android or iOS application.

## Run locally

Use Node.js 24 or later and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Production uses a real Next.js App Router static export:

```sh
npm run build
npm run start
```

`npm run start` serves `out/` with Brotli/gzip negotiation for text, correct asset types, uncompressed video byte ranges, and a useful 404 page. The same `out/` directory can be hosted by any static host supporting directory routes and `404.html`.

## Open on a phone

Open the public demo in the phone's browser. To test local changes, connect the phone and computer to the same Wi-Fi network, then run:

```sh
npm run dev -- --hostname 0.0.0.0
```

Find the computer's local IPv4 address with `ipconfig` on Windows. On the phone, open `http://<computer-IP>:3000`, for example `http://192.168.1.20:3000`. The address is the computer's IP, rather than `localhost` on the phone.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` installs Node.js 24 dependencies, builds the static export, and deploys `out/` to GitHub Pages on a push to `main` or a manual workflow run. It uses the official Pages actions and the `github-pages` deployment environment.

`NEXT_PUBLIC_BASE_PATH` is empty for ordinary local builds. Pages builds set it to `/itlegend-course-platform`; Next.js applies that prefix to generated scripts/styles/fonts, and `withBasePath` applies it to raw anchors and public images/media/PDFs. This setting is embedded at build time, so changing it requires a rebuild. Internal links remain ordinary anchors for reliable static navigation.

Verify the Pages build locally in PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = "/itlegend-course-platform"
npm run build
npm run test:basepath
npm run start
```

Open `http://localhost:3000/itlegend-course-platform/`. To return to a root-path build, clear the variable with `Remove-Item Env:NEXT_PUBLIC_BASE_PATH` and run `npm run build` again.

## Routes and behavior

- `/` and `/courses` show six complete mock courses, including not-started, in-progress, and completed examples.
- `/courses/[slug]` resumes that course’s saved lesson. Start opens the first lesson of a not-started course.
- Video lessons use an actual local MP4. Play/pause, seeking, volume/mute, playback speed, wide mode, and fullscreen use the real media/browser APIs. Finishing a video or choosing **Mark complete** updates the same progress calculation used by the catalog.
- PDF lessons open a viewport-filling viewer with close, download, new-tab fallback, and completion controls.
- Exam lessons open a viewport-filling quiz. Answers and question position survive closing, reopening, and reloading. Submission validates unanswered questions, displays a scored result and explanations, and completes the lesson.
- The question dialog preserves the draft and reports a local demo submission. Comments append immediately and persist for that course. The leaderboard uses sample learners and original Arabic encouragement based on progress.
- Curriculum/comments toolbar buttons scroll and focus their target. Mobile keeps the same video element sticky while scrolling; desktop wide mode expands it and hides the sidebar.

## Structure and decisions

```text
src/app/                    Server routes, metadata, static parameters, global design tokens
src/components/courses/     Catalog and client progress cards
src/components/player/      Media, lesson navigation, materials, curriculum, comments, dialogs
src/components/ui/          Shared header, icon controls, native dialog primitive
src/data/                   Typed mock courses and leaderboard
src/hooks/                  Device-local external store and optional browser tools
src/lib/                    Completion, saved-state validation, and deployment paths
src/types/                  Course, lesson, quiz, comment, and progress types
public/                     Compressed photos, fonts/licenses, MP4, captions, PDF
tests/                      State correctness and production browser journeys
scripts/serve.mjs           Small static production server for local verification
```

Routes and course lookup remain Server Components. The player is a focused Client Component because its media, dialogs, and progress are interactive. Catalog cards are individual Client Components so the rest of the catalog can be prerendered. Every course route is generated at build time with `generateStaticParams`; no runtime API or backend is required. Internal route links use ordinary anchors: this avoids Next.js segment-prefetch URLs that do not match the nested files emitted by its Windows static exporter, and works consistently on a static host. Course state is retained across document navigation.

Course progress is an external store consumed through `useSyncExternalStore`, with a stable server snapshot for hydration. Stable lesson IDs make completion idempotent. The catalog/player share one calculation rather than maintaining separate percentages. Saved IDs, comments, quiz choices, and positions are validated; malformed or unavailable storage safely falls back to mock defaults. The storage event also synchronizes open tabs.

The initial SEO course retains the reference’s mixed curriculum labels for fidelity. Other courses have varied titles and curriculum lengths. The mobile accordion groups and desktop weekly panels refer to the same underlying lessons. A compact **Current lesson** disclosure exposes lesson content, completion, and previous/next navigation without crowding the reference layout.

Native `<dialog>` supplies background inertness and Escape handling. An explicit Tab boundary guard prevents focus escaping into browser controls; it excludes hidden/disabled controls and leaves textarea input alone. The dialog primitive restores focus to the opener and locks background scrolling. Controls have labels, keyboard focus styles, semantic progress values, and disabled boundary states. Lesson buttons retain their full visible label, including quiz badges and the current-lesson marker. Reduced-motion preferences disable progress transitions. The pale reference surfaces and teal/coral palette are retained; darker action/text variants provide readable contrast.

The sticky player stays in one DOM node. On mobile, `display: contents` allows its sticky containing block to span the full course page, including comments. Changing lessons or opening a dialog pauses existing playback. Fullscreen requires a user gesture; mobile orientation locking and Safari fullscreen are feature-detected enhancements. Closing fullscreen restores the normal player. PDF/exam fullscreen means an accessible viewport-filling overlay.

## Data and media scope

Everything is a frontend demonstration. Questions, comments, quiz attempts, resume position, and completions stay on the current browser/device under `itlegend:course:v1:<slug>`. Storage is scoped to the website origin, so changing the hostname starts with the seeded examples rather than transferring old progress automatically. No question is sent to an instructor and no account, enrollment, or network data service is implied. Clear this site's browser storage to restore the seeded examples.

The bundled video is MDN’s short silent flower sample, reused to demonstrate actual playback reliably without a remote media dependency. It is not presented as a recorded SEO class. Lesson titles, descriptions, curricula, exams, and learner records are mock content; the PDF is an original practice workbook. See [asset attribution](docs/ASSETS.md).

Images are local WebP files with reserved dimensions. The poster preserves the supplied 3:2 crop. Next Image is unoptimized because the output is static; its inputs are already compressed. The first catalog image and player poster receive high fetch priority. Fonts are self-hosted with `next/font/local`, and only the heading font is preloaded. Video preloads metadata rather than the complete file. The application adds no UI framework, remote font requests, analytics, or runtime backend.

Optional `read_course` and `select_course_lesson` WebMCP tools use the same state/actions when the browser exposes `document.modelContext`; unsupported browsers keep the normal interface. They do not complete lessons automatically. Native browser-tool validation is reported separately from ordinary browser tests.

## Validation

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run audit:performance
```

Browser tests run against the production export, using an installed Windows Chrome when available. Otherwise install Playwright’s Chromium with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to your browser path. Tests cover the complete desktop/mobile journey, retained drafts/quiz answers, completion correctness, malformed persistence, actual playback, sticky/wide/fullscreen behavior, missing media, 404s, compressed delivery, and accessibility of the catalog, player, question dialog, and selected quiz answers. For the performance command, keep the production server running and set `CHROME_PATH` if Chrome cannot be found automatically.

The separate `test:basepath` suite checks the repository prefix on desktop/mobile: all six deep routes, native anchor navigation, playable video, caption and byte-range delivery, PDF links/bytes/preview, catalog photos, avatars, favicon, and the prefixed 404 return link. It uses port 3001 and requires the prefixed production build shown above.

Validation repeated on 7 October 2026: lint, typecheck, both root and repository-prefixed production builds, all three state tests, and all fourteen production browser checks passed (ten root-path journeys and four project-prefix checks). The interface measurements from 6 October remain unchanged: Lighthouse performance is 97/98 on mobile catalog/player and 100 on desktop; accessibility, best practices, and SEO are 100 in all four runs. These are local production lab measurements, not field performance guarantees. Conditions, responsive review, and reference limits are recorded in [validation evidence](docs/VALIDATION.md). The delivery checklist is in [the implementation plan](docs/TODO.md).

## Submission

Use the [submission checklist](docs/SUBMISSION.md) for the public repository and live demo. Personal identity fields, optional CV/LinkedIn post, and the final submission are left to the participant. No organizer message or form submission is performed by the app.
