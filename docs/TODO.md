# IT Legend course platform implementation plan

Planning model: GPT-6 Astra, max reasoning. Implementation model: GPT-6.1 Sol, max reasoning.

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
- [ ] Obtain reliable full-resolution desktop/mobile images and inspect all supplied modal states.
- [ ] Record dimensions, typeface/weights, colors, spacing, widths, radii, borders, and image proportions.
- [ ] Record content order across breakpoints and each annotated interaction.
- [ ] Keep visual fidelity unverified until the reference can be compared reliably.

## 2. Next.js foundation

- [ ] Initialize Next.js App Router with TypeScript and commit a dependency lockfile.
- [ ] Add development, production build/start, lint, and typecheck scripts.
- [ ] Implement catalog at `/courses`, individual players at `/courses/[slug]`, and root entry.
- [ ] Handle invalid course URLs with a useful not-found page.
- [ ] Separate typed mock data, shared UI, catalog components, and player components.
- [ ] Use Server Components for routes/data and focused Client Components for interactive state.
- [ ] Establish reference-based CSS tokens and responsive layout primitives.

Suggested structure: `src/app`, `src/components/{ui,courses,player}`, `src/data`, `src/hooks`, `src/lib`, `src/types`, and `public/{images,videos,materials}`.

## 3. Mock content and state

- [ ] Create six complete courses with image, title, description/instructor, status, percentage, and Start/Continue action.
- [ ] Include not-started, in-progress, and completed examples with varied title lengths and curriculum sizes.
- [ ] Model sections, stable lesson IDs, lesson details, media, PDF materials, exams, comments, and leaderboard entries.
- [ ] Share one completion calculation between catalog and player; repeated completion must be idempotent.
- [ ] Keep resume lesson and completed lesson IDs per course.
- [ ] Keep question drafts outside the modal so closing/reopening preserves text.
- [ ] Keep exam answers/current question outside the modal so closing/reopening preserves progress.
- [ ] If browser persistence is used, validate stored data and recover from malformed/unavailable storage.

## 4. Faithful responsive player

- [ ] Match one reference course at the desktop frame size before generalizing.
- [ ] Reproduce header, video, lesson information, materials, progress, curriculum/current marker, comments, and toolbar.
- [ ] Match mobile section ordering, type scale, spacing, and proportions.
- [ ] Implement an intermediate tablet layout.
- [ ] Use fluid grid/flex layouts, stable media ratios, `min-width: 0`, and text wrapping.
- [ ] Split player, controls, curriculum, lesson rows, materials, progress, comments, and dialogs into small components.
- [ ] Compare reference and implementation screenshots and correct visible deviations.

## 5. Video and lesson navigation

- [ ] Use real playable video and an appropriate reference poster.
- [ ] Implement every visible media control and synchronize controls with actual media events.
- [ ] Switch active lesson, media, title/details/materials, and current marker together.
- [ ] Stop previous media when changing lessons; Start uses the first lesson and Continue uses saved progress.
- [ ] Implement completion/next/previous behavior where shown, including last-lesson boundaries.
- [ ] Keep the same video element sticky on mobile, preserving playback/time during scrolling.
- [ ] Implement desktop wide mode and restore normal layout when toggled off.
- [ ] Implement video fullscreen from a user action and respond to `fullscreenchange`/Escape.
- [ ] Feature-detect mobile orientation lock; handle unsupported/rejected requests gracefully.
- [ ] Handle playback failures, missing media, and unknown duration without broken controls.

## 6. Annotated interactions

- [ ] Toolbar curriculum/comments actions scroll to the relevant sections with sticky-video offsets.
- [ ] Ask-question popup opens, validates input, preserves its draft, and reports a mock submission.
- [ ] Leaderboard popup follows the supplied reference, including its motivational Arabic copy where legible.
- [ ] PDF opens actual material in a closable viewport-filling viewer with a usable fallback.
- [ ] Exam opens in a closable viewport-filling view; answers and position survive close/reopen.
- [ ] Exam supports the demonstrated question choices, navigation, submission, and result state.
- [ ] Add-comment form appends a visible comment and rejects whitespace-only input.
- [ ] Animate mobile course progress when it enters view and honor reduced-motion preferences.
- [ ] Ensure all visible interactive controls have meaningful behavior.

## 7. Course catalog

- [ ] Use player-consistent typography, colors, spacing, borders, and radii.
- [ ] Render at least six courses with required data and working Start/Continue links.
- [ ] Keep progress synchronized with the player.
- [ ] Support desktop/tablet/mobile card layouts and long content.
- [ ] Provide a clear return path from the player to the catalog.

Search, filters, accounts, enrollment, and remote APIs are not required. Prioritize the scored requirements.

## 8. Accessibility and performance

- [ ] Use semantic landmarks/headings/forms/lists and correctly named icon controls.
- [ ] Provide visible focus, keyboard-operable controls, labels, and progress semantics.
- [ ] Dialogs receive/trap focus, close with Escape, and restore focus to their trigger.
- [ ] Verify mobile tap targets and overlay use with a software keyboard.
- [ ] Check color contrast, alternative text, and reduced-motion behavior.
- [ ] Compress and size local assets; provide responsive image dimensions/sizes and avoid layout shifts.
- [ ] Use suitable fonts, preload only necessary media, and avoid unnecessary client dependencies.
- [ ] Inspect the actual production bundle and mobile/desktop performance.

## 9. Production acceptance

- [ ] Run lint, typecheck, and production build.
- [ ] Serve the production output and test real routes/assets.
- [ ] Capture and inspect desktop/mobile screenshots matching the reference and additional 320/768/1024 widths.
- [ ] Verify no horizontal scroll, overlap, clipped content, or unreachable overlay controls.
- [ ] Test long titles/comments and varying lesson counts.
- [ ] Test catalog → Continue → lesson switch → playback → completion → PDF → exam close/reopen → question draft close/reopen → comment → catalog progress.
- [ ] Test keyboard focus, Escape dismissal, sticky video, section jumps, wide mode, and supported fullscreen.
- [ ] Test invalid routes, video failure, and malformed saved state.
- [ ] Run production mobile/desktop accessibility and performance audits; record actual results.
- [ ] Keep automated tests focused on state retention, completion correctness, and the core journey.

## 10. Documentation and delivery

- [ ] Write README setup/scripts/routes/folder structure and mock-data design.
- [ ] Explain Server/Client boundaries, image strategy, performance, accessibility, persistence/reset behavior, and limitations.
- [ ] Record asset attribution and actual validation evidence.
- [ ] Create logical commits throughout implementation.
- [ ] Create the public GitHub repository and push complete source.
- [ ] Publish a production demo without login and verify its successful deployment.
- [ ] Add repository/demo links to README and provide the user both links.
- [ ] Prepare a submission checklist. User identity fields and final competition submission remain for the user.

Suggested commits: requirements/setup; typed content/assets; catalog/responsive player; media/navigation/progress; dialogs/materials/exams/comments; visual/accessibility fixes; documentation/deployment.

## Decisions and browser constraints

- PDF/exam fullscreen means a viewport-filling accessible overlay; video uses browser fullscreen where supported.
- Fullscreen needs a user gesture and can reject. `<dialog>` cannot itself be passed to `requestFullscreen()`.
- Orientation lock is a progressive enhancement; browser support cannot be guaranteed.
- Completion requires working behavior, an honest reference comparison, passed production checks, and both public submission links.

Primary technical references: [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [images](https://nextjs.org/docs/app/getting-started/images), [fullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen), [orientation](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock), [accessible dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
