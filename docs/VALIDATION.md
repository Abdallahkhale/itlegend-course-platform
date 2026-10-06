# Production validation

Checks completed on 6 October 2026 against the real Next.js 16.3.8 static production export. Local browser tests used Chrome 154 on Windows and Node.js 24.11.1. These are lab results; actual visitor performance depends on the host, network, and device.

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

## Lighthouse

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

The question/leaderboard body reference does not contain a fully legible exact design, so their compact pale-surface treatment follows the established palette. Arabic encouragement is original demonstration copy rather than a quote attributed to a real person.

Questions, comments, quiz attempts, resume, and completions are device-local mock data. The short silent sample MP4 verifies working media behavior and is not an instructional recording. Real recordings would replace the typed media URLs.

## Publication

The public GitHub repository includes the complete implementation and logical commits. The registered public Site is being published from the verified export; successful native deployment verification will be recorded here after completion.
