import { test, expect } from "@playwright/test";
import type { CDPSession, Locator, Page } from "@playwright/test";

type Point = { x: number; y: number };

async function rowPoint(page: Page, fraction: number) {
  const row = page.locator(".exam-choices label").first();
  await row.scrollIntoViewIfNeeded();
  const box = (await row.boundingBox())!;
  return { x: box.x + box.width * fraction, y: box.y + box.height / 2 };
}

async function touchDrag(page: Page, session: CDPSession, start: Point, end: Point, options: { cancel?: boolean; second?: Point } = {}) {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...start, id: 1 }] });
  if (options.second) await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...start, id: 1 }, { ...options.second, id: 2 }] });
  for (let step = 1; step <= 8; step++) {
    const delta = { x: (end.x - start.x) * step / 8, y: (end.y - start.y) * step / 8 };
    const points = [{ x: start.x + delta.x, y: start.y + delta.y, id: 1 }];
    if (options.second) points.push({ x: options.second.x + delta.x, y: options.second.y + delta.y, id: 2 });
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: points });
    await page.waitForTimeout(20);
  }
  await session.send("Input.dispatchTouchEvent", { type: options.cancel ? "touchCancel" : "touchEnd", touchPoints: [] });
}

async function touchTap(page: Page, session: CDPSession, radio: Locator) {
  // Use the complete answer label as its native, finger-sized tap target.
  const label = radio.locator("..");
  await label.scrollIntoViewIfNeeded();
  const box = (await label.boundingBox())!;
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 }] });
  await page.waitForTimeout(80);
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

test.describe("touch navigation", () => {
  test.use({ hasTouch: true, isMobile: true });

  test("native touch swipes preserve answers, vertical scrolling and accessible question navigation", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const viewport = testInfo.project.name === "mobile" ? { width: 320, height: 568 } : { width: 932, height: 430 };
    await page.setViewportSize(viewport);
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
    await page.goto("/courses/starting-seo");
    const trigger = page.getByRole("button", { name: /^Course Overview.*exam/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Course Exam", exact: true });
    const current = page.locator('.exam-question-nav [aria-current="step"]');
    const checked = page.locator('.exam-choices input:checked');
    const submit = page.getByRole("button", { name: "Submit Exam", exact: true });
    const timer = page.locator(".exam-duration");
    expect(await dialog.boundingBox()).toEqual({ x: 0, y: 0, ...viewport });
    await expect(page.locator(".exam-question-nav button")).toHaveCount(5);
    await expect(page.getByRole("button", { name: /^(Previous|Next)$/ })).toHaveCount(0);
    await expect(page.locator(".exam-swipe-hint")).toHaveText("Swipe or drag left for next, right for previous, or choose a number above.");
    await expect(submit).toHaveCount(0);

    async function swipe(direction: "left" | "right", options: { cancel?: boolean; second?: Point } = {}) {
      const start = await rowPoint(page, direction === "left" ? 0.72 : 0.28);
      const end = await rowPoint(page, direction === "left" ? 0.28 : 0.72);
      await touchDrag(page, session, start, end, options);
    }

    // Start on an unselected answer row: a consumed drag must not become a radio click.
    await swipe("left");
    await expect(current).toHaveText("2");
    await expect(checked).toHaveCount(0);
    await swipe("right");
    await expect(current).toHaveText("1");
    await expect(checked).toHaveCount(0);
    const answer = page.getByRole("radio", { name: "Understanding the searcher’s intent", exact: true });
    // Chromium's raw touch recognizer also suppresses immediate post-flick clicks
    // on plain radio cards; allow it to settle before the next finger contact.
    await page.waitForTimeout(500);
    await touchTap(page, session, answer);
    await expect(answer).toBeChecked();

    // A vertical mouse drag can release outside the card without pointer capture.
    // Its selection guard must clear before a hybrid device's next tap.
    const mouse = await rowPoint(page, 0.6);
    await page.mouse.move(mouse.x, mouse.y);
    await page.mouse.down();
    await page.mouse.move(mouse.x, 5, { steps: 10 });
    await page.mouse.up();
    await expect(current).toHaveText("1");
    await expect(answer).toBeChecked();
    const alternate = page.getByRole("radio", { name: "Adding as many keywords as possible", exact: true });
    await touchTap(page, session, alternate);
    await expect(alternate).toBeChecked();
    await touchTap(page, session, answer);
    await expect(answer).toBeChecked();

    const start = await rowPoint(page, 0.6);
    await touchDrag(page, session, start, { x: start.x - 24, y: start.y });
    await expect(current).toHaveText("1");
    await expect(answer).toBeChecked();
    await touchDrag(page, session, start, { x: start.x - 5, y: start.y - 135 });
    await expect.poll(() => page.locator(".exam-shell").evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(current).toHaveText("1");
    await expect(answer).toBeChecked();
    await page.locator(".exam-shell").evaluate((element) => element.scrollTo({ top: 0, behavior: "instant" }));

    await swipe("left", { cancel: true });
    await expect(current).toHaveText("1");
    await expect(answer).toBeChecked();
    const second = await rowPoint(page, 0.72);
    await swipe("left", { second: { x: viewport.width - 2, y: second.y } });
    await expect(current).toHaveText("1");
    await expect(answer).toBeChecked();
    await swipe("right");
    await expect(current).toHaveText("1");
    await expect(answer).toBeChecked();

    for (const position of [2, 3, 4, 5]) {
      await swipe("left");
      await expect(current).toHaveText(String(position));
      await expect(checked).toHaveCount(0);
      if (position < 5) await expect(submit).toHaveCount(0);
    }
    await expect(submit).toBeVisible();
    await swipe("left");
    await expect(current).toHaveText("5");
    await expect(checked).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Exam complete", exact: true })).toHaveCount(0);

    const firstCircle = page.getByRole("button", { name: "Question 1, answered", exact: true });
    await firstCircle.focus();
    await page.keyboard.press("Enter");
    await expect(current).toHaveText("1");
    await expect(answer).toBeChecked();
    await page.getByRole("button", { name: "Question 3", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(current).toHaveText("3");
    await expect.poll(async () => Number(await timer.getAttribute("data-remaining-seconds"))).toBeLessThan(600);
    const remaining = Number(await timer.getAttribute("data-remaining-seconds"));
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThan(600);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(current).toHaveText("3");
    expect(Number(await timer.getAttribute("data-remaining-seconds"))).toBeLessThanOrEqual(remaining);
    await page.getByRole("button", { name: "Question 1, answered", exact: true }).click();
    await expect(answer).toBeChecked();

    const correctAnswers = ["A beginner’s guide to SEO", "To help readers find a related useful page", "Search traffic and meaningful visitor actions", "Check its accuracy and answer missing questions"];
    for (const [index, choice] of correctAnswers.entries()) {
      await page.getByRole("button", { name: `Question ${index + 2}`, exact: true }).click();
      const radio = page.getByRole("radio", { name: choice, exact: true });
      await touchTap(page, session, radio);
      await expect(radio).toBeChecked();
    }
    await submit.click();
    await expect(page.getByText("5 of 5", { exact: true })).toBeVisible();
    const result = (await page.locator(".exam-result").boundingBox())!;
    const heading = (await page.getByRole("heading", { name: "Exam complete", exact: true }).boundingBox())!;
    await touchDrag(page, session, { x: result.x + result.width * 0.72, y: heading.y + heading.height / 2 }, { x: result.x + result.width * 0.28, y: heading.y + heading.height / 2 });
    await expect(page.getByRole("heading", { name: "Exam complete", exact: true })).toBeVisible();
    await expect(page.locator(".exam-question-nav")).toHaveCount(0);
    expect(errors).toEqual([]);
    await session.detach();
  });
});

test("mouse drags outside the card navigate without choosing an answer; closing cancels an unfinished drag", async ({ page }) => {
  await page.goto("/courses/starting-seo");
  const trigger = page.getByRole("button", { name: /^Course Overview.*exam/ });
  await trigger.click();
  const current = page.locator('.exam-question-nav [aria-current="step"]');
  const checked = page.locator('.exam-choices input:checked');

  async function drag(start: Point, end: Point) {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 10 });
    await page.mouse.up();
  }

  const card = (await page.locator(".exam-card").boundingBox())!;
  // A boundary drag across the prompt must not select text and turn the next
  // answer-row drag into native dragstart/pointercancel instead of navigation.
  const legend = (await page.locator(".exam-card legend").boundingBox())!;
  const prompt = { x: legend.x + legend.width / 2, y: legend.y + legend.height / 2 };
  await drag(prompt, { x: prompt.x + 130, y: prompt.y });
  await expect(current).toHaveText("1");
  const answerRow = await rowPoint(page, 0.5);
  await drag(answerRow, { x: answerRow.x - 130, y: answerRow.y });
  await expect(current).toHaveText("2");
  await expect(checked).toHaveCount(0);
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("");
  await page.getByRole("button", { name: "Question 1", exact: true }).click();

  const leftStart = await rowPoint(page, 0.72);
  await drag(leftStart, { x: Math.max(5, card.x - 10), y: leftStart.y });
  await expect(current).toHaveText("2");
  await expect(checked).toHaveCount(0);
  const rightStart = await rowPoint(page, 0.28);
  await drag(rightStart, { x: Math.min(page.viewportSize()!.width - 5, card.x + card.width + 10), y: rightStart.y });
  await expect(current).toHaveText("1");
  await expect(checked).toHaveCount(0);

  const short = await rowPoint(page, 0.6);
  await drag(short, { x: short.x - 25, y: short.y });
  await expect(current).toHaveText("1");
  await expect(checked).toHaveCount(0);
  await page.getByRole("radio").first().focus();
  await page.keyboard.press("ArrowRight");
  const answer = page.getByRole("radio", { name: "Understanding the searcher’s intent", exact: true });
  await expect(answer).toBeChecked();
  const vertical = await rowPoint(page, 0.6);
  await drag(vertical, { x: vertical.x + 5, y: vertical.y + 100 });
  await expect(current).toHaveText("1");
  await expect(answer).toBeChecked();
  const unfinished = await rowPoint(page, 0.72);
  await page.mouse.move(unfinished.x, unfinished.y);
  await page.mouse.down();
  await page.mouse.move(unfinished.x - 130, unfinished.y, { steps: 10 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(current).toHaveText("1");
  await expect(answer).toBeChecked();
  await page.getByRole("radio", { name: "Buying links", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Buying links", exact: true })).toBeChecked();
});
