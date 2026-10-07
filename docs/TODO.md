# IT Legend course platform implementation plan

## Sources and submission requirements

- [Challenge](https://challenges.itlegend.net/frontend-hiring#submit), public challenge API, and the supplied Task Requirements DOCX, inspected 6 October 2026.
- [Figma reference](https://www.figma.com/design/M6RfSjHqm6glEN1BQR1WFl/ITLegend-Course-Player-Page-Test?node-id=0-1&p=f).
- Required stack: **Next.js App Router and TypeScript**.
- Required deliverables: **public GitHub repository and a live demo without sign-in**. CV and LinkedIn post are optional.
- Reported deadline: **31 October 2026, 21:59 Cairo time**. Recheck the challenge before submitting.
- Grading: UI fidelity 25%, responsive behavior 25%, code quality 25%, functionality 15%, performance/accessibility 10%.
- The catalog permits original styling consistent with the player. The player must reproduce the reference, not redesign it.

## 1. Research and reference inspection

- [x] Read the complete DOCX and challenge requirements.
- [x] Inspect submission fields and grading criteria.
- [x] Locate the original Figma file and inspect supplied overview annotations.
- [x] Verify local tooling and the existing GitHub account.
- [ ] Obtain a full-resolution assembled board and fully legible exact popup references. Original-resolution component fragments and the supplied overview were recovered and inspected; complete-page pixel equality is not claimed.
- [x] Record dimensions, typeface/weights, colors, spacing, widths, radii, borders, and image proportions.
- [x] Record content order across breakpoints and each annotated interaction.
- [x] Compare against the available original-resolution fragments and overview; retain the assembled-board limit explicitly in validation.

## 2. Next.js foundation

- [x] Initialize Next.js App Router with TypeScript and commit a dependency lockfile.
- [x] Add development, production build/start, lint, and typecheck scripts.
- [x] Implement catalog at `/courses`, individual players at `/courses/[slug]`, and root entry.
- [x] Handle invalid course URLs with a useful not-found page.
- [x] Separate typed mock data, shared UI, catalog components, and player components.
- [x] Use Server Components for routes/data and focused Client Components for interactive state.
- [x] Establish reference-based CSS tokens and responsive layout primitives.

Suggested structure: `src/app`, `src/components/{ui,courses,player}`, `src/data`, `src/hooks`, `src/lib`, `src/types`, and `public/{images,videos,materials}`.

## 3. Mock content and state

- [x] Create six complete courses with image, title, description/instructor, status, percentage, and Start/Continue action.
- [x] Include not-started, in-progress, and completed examples with varied title lengths and curriculum sizes.
- [x] Model sections, stable lesson IDs, lesson details, media, PDF materials, exams, comments, and leaderboard entries.
- [x] Share one completion calculation between catalog and player; repeated completion must be idempotent.
- [x] Keep resume lesson and completed lesson IDs per course.
- [x] Keep question drafts outside the modal so closing/reopening preserves text.
- [x] Keep exam answers/current question outside the modal so closing/reopening preserves progress.
- [x] If browser persistence is used, validate stored data and recover from malformed/unavailable storage.

## 4. Faithful responsive player

- [x] Match one reference course at the desktop frame size before generalizing.
- [x] Reproduce header, video, lesson information, materials, progress, curriculum/current marker, comments, and toolbar.
- [x] Match mobile section ordering, type scale, spacing, and proportions.
- [x] Implement an intermediate tablet layout.
- [x] Use fluid grid/flex layouts, stable media ratios, `min-width: 0`, and text wrapping.
- [x] Split player, controls, curriculum, lesson rows, materials, progress, comments, and dialogs into small components.
- [x] Compare reference and implementation screenshots and correct visible deviations.

## 5. Video and lesson navigation

- [x] Use real playable video and an appropriate reference poster.
- [x] Implement every visible media control and synchronize controls with actual media events.
- [x] Switch active lesson, media, title/details/materials, and current marker together.
- [x] Stop previous media when changing lessons; Start uses the first lesson and Continue uses saved progress.
- [x] Implement completion/next/previous behavior where shown, including last-lesson boundaries.
- [x] Keep the same video element sticky on mobile, preserving playback/time during scrolling.
- [x] Implement desktop wide mode and restore normal layout when toggled off.
- [x] Implement video fullscreen from a user action and respond to `fullscreenchange`/Escape.
- [x] Feature-detect mobile orientation lock; handle unsupported/rejected requests gracefully.
- [x] Handle playback failures, missing media, and unknown duration without broken controls.

## 6. Annotated interactions

- [x] Toolbar curriculum/comments actions scroll to the relevant sections with sticky-video offsets.
- [x] Ask-question popup opens, validates input, preserves its draft, and reports a mock submission.
- [x] Leaderboard popup follows the supplied reference, including its motivational Arabic copy where legible.
- [x] PDF opens actual material in a closable viewport-filling viewer with a usable fallback.
- [x] Exam opens in a closable viewport-filling view; answers and position survive close/reopen.
- [x] Exam supports the demonstrated question choices, navigation, submission, and result state.
- [x] Add-comment form appends a visible comment and rejects whitespace-only input.
- [x] Animate mobile course progress when it enters view and honor reduced-motion preferences.
- [x] Ensure all visible interactive controls have meaningful behavior.

## 7. Course catalog

- [x] Use player-consistent typography, colors, spacing, borders, and radii.
- [x] Render at least six courses with required data and working Start/Continue links.
- [x] Keep progress synchronized with the player.
- [x] Support desktop/tablet/mobile card layouts and long content.
- [x] Provide a clear return path from the player to the catalog.

Search, filters, accounts, enrollment, and remote APIs are not required. Prioritize the scored requirements.

## 8. Accessibility and performance

- [x] Use semantic landmarks/headings/forms/lists and correctly named icon controls.
- [x] Provide visible focus, keyboard-operable controls, labels, and progress semantics.
- [x] Dialogs receive/trap focus, close with Escape, and restore focus to their trigger.
- [x] Verify mobile controls and overlays at 320 pixels and landscape emulation.
- [ ] Verify software-keyboard behavior and orientation locking on physical phones. Emulation checks passed; actual device support remains a manual check.
- [x] Check color contrast, alternative text, and reduced-motion behavior.
- [x] Compress and size local assets; provide responsive image dimensions/sizes and avoid layout shifts.
- [x] Use suitable fonts, preload only necessary media, and avoid unnecessary client dependencies.
- [x] Inspect the actual production bundle and mobile/desktop performance.

## 9. Production acceptance

- [x] Run lint, typecheck, and production build.
- [x] Serve the production output and test real routes/assets.
- [x] Verify root-path and repository-prefixed production builds, ten existing desktop/mobile journeys, and four project-prefix checks. Revalidated 7 October 2026.
- [x] Capture and inspect desktop/mobile screenshots matching the reference and additional 320/768/1024 widths.
- [x] Verify no horizontal scroll, overlap, clipped content, or unreachable overlay controls.
- [x] Test long titles/comments and varying lesson counts.
- [x] Test catalog → Continue → lesson switch → playback → completion → PDF → exam close/reopen → question draft close/reopen → comment → catalog progress.
- [x] Test keyboard focus, Escape dismissal, sticky video, section jumps, wide mode, and supported fullscreen.
- [x] Test invalid routes, video failure, and malformed saved state.
- [x] Run production mobile/desktop accessibility and performance audits; record actual results.
- [x] Keep automated tests focused on state retention, completion correctness, and the core journey.

## 10. Documentation and delivery

- [x] Write README setup/scripts/routes/folder structure and mock-data design.
- [x] Explain Server/Client boundaries, image strategy, performance, accessibility, persistence/reset behavior, and limitations.
- [x] Record asset attribution and actual validation evidence.
- [x] Create logical commits throughout implementation.
- [x] Create the public GitHub repository and push complete source.
- [x] Configure GitHub Pages with a public URL, official Actions workflow, and project-prefix support. See README for deployment and phone testing.
- [x] Confirm successful GitHub Pages migration after the workflow deploys and the public catalog/player/assets are checked. Deployment and live desktop/mobile review passed on 7 October 2026; see docs/VALIDATION.md.
- [x] Add verified repository/demo links to README and deliver both links. See README and docs/SUBMISSION.md.
- [x] Prepare a submission checklist. User identity fields and final competition submission remain for the user.

Suggested commits: requirements/setup; typed content/assets; catalog/responsive player; media/navigation/progress; dialogs/materials/exams/comments; visual/accessibility fixes; documentation/deployment.

## Decisions and browser constraints

- PDF/exam fullscreen means a viewport-filling accessible overlay; video uses browser fullscreen where supported.
- Fullscreen needs a user gesture and can reject. `<dialog>` cannot itself be passed to `requestFullscreen()`.
- Orientation lock is a progressive enhancement; browser support cannot be guaranteed.
- Completion requires working behavior, an honest reference comparison, passed production checks, and both public submission links.

Primary technical references: [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [images](https://nextjs.org/docs/app/getting-started/images), [fullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen), [orientation](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock), [accessible dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
