# Production validation

Initial checks completed on 6 October 2026 against the real Next.js 16.3.8 static production export. The 7 October migration and popup refinement checks are recorded below. Local browser tests used Chrome 154 on Windows and Node.js 24.11.1. These are lab results; actual visitor performance depends on the host, network, and device.

## Build and acceptance

- Lint, TypeScript, and production build passed. Ten routes/pages were prerendered, including all six course slugs and the not-found page.
- Three focused state tests passed: idempotent completion/shared percentages; retained draft, quiz, and comment restoration; malformed/foreign saved-data recovery.
- All ten production Playwright tests passed in 18.4 seconds: five scenarios on desktop and mobile. The core journey covers catalog navigation, real media playback, completion, retained question draft, Tab boundaries/focus restoration, retained quiz position/answers across reload, submission/results, actual PDF bytes, leaderboard, comments, and synchronized catalog progress.
- Additional scenarios verify missing media recovery, useful 404s, malformed persistence, the same sticky video node/time, desktop wide/fullscreen restoration, and the readable PDF fallback when native PDF viewing is disabled.
- The journey verifies gzip HTML and a 32-byte uncompressed video range response. No failed first-party requests or JavaScript runtime errors occur in that journey. Internal anchors avoid the dotted segment-prefetch URLs that differ from the nested Windows static-export files.
- Axe scans of the catalog, player, question dialog, and quiz with selected answers returned zero WCAG 2 A/AA and 2.1 AA violations. Lesson button names include every visible badge/current marker; the earlier Lighthouse visible-name mismatch was removed.
- Separate keyboard checks passed: dialog initial focus, forward/backward boundary wrapping, opener focus restoration, section focus, reduced-motion transition disabling, and emulated mobile fullscreen restoration.

## Responsive and visual review

Screenshots were inspected at widths **1252, 1024, 768, 430, and 320 pixels**. At every width, document scroll width equals viewport width, no overflowing elements or runtime errors were found, Poppins/Spartan loaded correctly, and the video ratio is 3:2. Catalog desktop/mobile layouts were also inspected.

The final desktop pale header is 219 pixels high. Its title proportions, two-line wrap, and spacing were compared against the original-resolution heading fragment; mobile at 430 pixels matches the reference title wrap and vertical placement. Material rows, video crop, typography, palette, curriculum structure, comment form, and progress placement were compared with the supplied fragments and overview.

Eight additional overlay cases were inspected: question, leaderboard, PDF, and exam at **320 × 568** and **932 × 430**. All controls remain within the viewport; close controls are reachable and Escape dismisses the overlay. The native-PDF-disabled workbook preview was inspected at 320 × 568, with a 296-pixel image width, legible content, and no horizontal overflow. The original PDF itself was rendered and visually verified as one clean page without clipping.

The software keyboard and orientation lock on physical phones remain manual device checks. Headless mobile emulation cannot establish actual device/browser orientation support.

## Lighthouse: historical measurements from 6 October

These measurements predate the popup refinements. Lighthouse was not rerun after those changes, so the scores below do not establish the refined popups' current performance.

Lighthouse **13.5.0**, production server at `http://127.0.0.1:3000`, Brotli/gzip text compression enabled, cold page loads. Audits ran sequentially with simulated throttling. Mobile used 412 × 823, DPR 1.75, 150 ms RTT, 1638.4 Kbps throughput, and 4× CPU slowdown. Desktop used 1252 × 900, DPR 1, the Lighthouse desktop preset (40 ms RTT, 10240 Kbps, 1× CPU).

| Page | Device | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Catalog | Mobile | 97 | 100 | 100 | 100 | 2.55 s | 9 ms | 0 |
| Player | Mobile | 98 | 100 | 100 | 100 | 2.47 s | 16 ms | 0.000077 |
| Catalog | Desktop | 100 | 100 | 100 | 100 | 0.56 s | 0 ms | 0 |
| Player | Desktop | 100 | 100 | 100 | 100 | 0.54 s | 0 ms | 0 |

All four console-error audits pass. The initial uncompressed local server produced mobile performance scores of 82–83; compression, discoverable high-priority images, and static-safe navigation resolved the concrete findings. Framework legacy-JavaScript and render-blocking suggestions remain normal optimization opportunities; these scores do not imply every Lighthouse manual check has been completed.

Reproduce with `npm run build`, `npm run start`, then `npm run audit:performance` in another terminal. JSON reports are written to ignored `test-results/audits/`. `CHROME_PATH` selects Chrome when automatic discovery is unavailable.

## Dependency and optional-tool limits

`npm audit --omit=dev` reports **zero production vulnerabilities**. The full development audit reports five high advisories in Next's lint-only glob/braces dependency chain; no patched `braces` release was available at validation time. That tooling is not shipped in the static site. Sharp was updated to the patched 0.35.5 release.

The installed browser does not expose `document.modelContext`, so native WebMCP tool invocation could not be tested. The optional tools are feature-detected and ordinary browser operation is verified.

## Reference and demo scope

The supplied overview board and original-resolution component fragments were inspected. They establish the exact poster, 3:2 stage ratio, typography, palette, title treatment, material rows, weekly desktop curriculum, mobile accordion structure, comment form, and quiz style. A full-resolution assembled Figma board could not be exported from the public viewer; exact pixel equality of the complete page is not claimed. The implementation is visually compared with the available original fragments and overview.

The original exam fragment is a 153 × 306 image showing the blue backdrop, compact back control, yellow time badge, five question circles, numbered white card, raised answer rows, and square markers. The implementation follows that composition with readable colors and native radio semantics; lesson questions remain mock practice content. The leaderboard overview establishes course context, a compact pale encouragement strip, and separate white row cards within a pale rounded list. Ask a Question follows the comment form's visual style. Arabic encouragement is original Egyptian demonstration copy rather than a quotation attributed to a real person. The PDF reference establishes a closable full-viewport viewer; a separate exact PDF skin is not available.

Questions, comments, quiz attempts, resume, and completions are device-local mock data. The short silent sample MP4 verifies working media behavior and is not an instructional recording. Real recordings would replace the typed media URLs.

## GitHub Pages migration

The [public repository](https://github.com/Abdallahkhale/itlegend-course-platform) uses an official GitHub Pages Actions workflow. Pages is configured as public, HTTPS enforced, and workflow-driven at [the demo URL](https://abdallahkhale.github.io/itlegend-course-platform/). The build sets `NEXT_PUBLIC_BASE_PATH=/itlegend-course-platform`; ordinary local builds keep an empty prefix.

Migration checks completed on **7 October 2026**, using Node.js 24.11.1 and the installed Windows Chrome 154:

- Lint and TypeScript passed; all three saved-state tests passed.
- Clean installation with npm 11.19.0 passed on Windows (462 packages) without modifying the lock file. Linux x64/glibc lock validation and both production builds passed too. The lock includes the optional `@emnapi/core` and `@emnapi/runtime` 1.11.3 records; existing package versions, resolved URLs, and integrity hashes were preserved.
- The repository-prefixed production export built successfully and prerendered all ten pages. Both prefix scenarios passed on desktop and mobile: **four checks in 11.8 seconds**. They verify all six deep course routes, native anchor navigation, actual video playback, poster/image preload, captions, a 32-byte media range, PDF links and bytes, the PDF preview fallback, course photos, comment/leaderboard avatars, favicon, and the prefixed 404 return link. The main prefix journey reported no failed first-party requests or JavaScript runtime errors.
- A fresh root-path production export also built successfully with all ten pages. All **ten existing desktop/mobile browser journeys passed in 32.4 seconds**, including retained state, media controls, dialogs, completion, accessibility scans, sticky/wide/fullscreen behavior, compressed delivery, missing-media recovery, and 404/PDF fallback behavior.
- The current tracked source and documentation contain no former demo-hosting or model-attribution markers. Local hosting metadata is ignored and excluded from the repository.

GitHub Pages successfully built and deployed [source commit f43ea3c](https://github.com/Abdallahkhale/itlegend-course-platform/commit/f43ea3c3dcf1b0224b26efb4ad5b477fca4c682d) in [workflow run 37613203675](https://github.com/Abdallahkhale/itlegend-course-platform/actions/runs/37613203675) on **7 October 2026**. Dependency installation, the Linux production export, artifact upload, and deployment all succeeded.

Independent browser checks of the public catalog and Starting SEO player passed at **1252 × 900** and **430 × 932**. Both views loaded six course cards and photos, navigated to the deep course URL, played the bundled video, and opened the workbook PDF (HTTP 200, `application/pdf`). Fonts loaded, document width matched viewport width, and no first-party HTTP failures or JavaScript runtime errors occurred. Both live screenshots were visually inspected. The repository's About homepage and published README/submission links point to the verified Pages URL.

The existing screenshot/Lighthouse results above remain the measurements from 6 October; performance audits were not rerun for this migration.

Mobile checks use a responsive website in browser emulation; they do not establish native Android/iOS application support. Browser storage is origin-specific and is not automatically transferred to a new hostname.

## Popup refinements

The five-question exam, retained informational countdown, comment-style question popup, and progress-based six-person leaderboard were refined on 7 October 2026. Earlier three-answer submissions retain valid answers and earned course completion, then resume for the unanswered questions. Practice time pauses while the popup is closed; zero does not remove answers or trigger an automatic submission/failure. Drafts and quiz state remain usable in the current page when browser storage is blocked.

Local acceptance completed on **7 October 2026**:

- Lint and TypeScript passed. Both root-path and repository-prefixed production exports built successfully with all ten pages prerendered.
- All **seven state tests** passed, covering completion, restoration, malformed data, retained legacy three-answer attempts without revoking earned completion, validated remaining time, answer-preserving timer updates, and the six encouragement bands.
- All **sixteen root-path production browser checks passed in 24.0 seconds** on desktop/mobile. The full journey answers all five questions and reports **5 of 5**. Additional checks verify native radio arrow-key selection, unanswered last-question validation, retained positions/answers, countdown pause across close/reload, zero-time finishing, stopped submitted timers, retry reset, blocked-storage drafts/answers, and accurate six-person ranks at 0%, 58%, and 100% progress. Existing playback, completion, persistence, 404, compressed/range delivery, sticky/wide/fullscreen, and section-focus behavior also passed.
- Axe scans of the catalog, player, question popup, selected-answer quiz, and leaderboard returned zero WCAG 2 A/AA and 2.1 AA violations.
- All **four repository-prefix checks passed in 6.8 seconds**, including all six deep routes and working media, material, image, caption, favicon, and 404 links.
- Ten popup captures were inspected at **320 × 568** and **932 × 430**: question, leaderboard, quiz, native PDF, and PDF fallback at both sizes. Quiz/PDF overlays occupy the exact viewport from x/y = 0; close controls remain reachable, Escape restores opener focus, and there is no horizontal overflow. Longer question/list/quiz content scrolls inside the dialog. The fallback workbook scrolls internally, and the native viewer paints the actual workbook with its browser toolbar. Actual PDF bytes, open links, internal fallback scrolling, and focus restoration passed automated checks; the viewer also exposes workbook download links.
- At 320 pixels, the quiz card begins at y = 144 with a 12.8-pixel gutter, closely following the compact reference composition. The displayed question circle agrees with the active question; square markers preserve native single-choice behavior and visible keyboard focus. No first-party request failures or JavaScript runtime errors occurred in the core journey or popup review.

Public deployment and live verification of these refinements remain pending. Physical-phone software keyboard/orientation checks and complete-board pixel equality retain the limits described above.
