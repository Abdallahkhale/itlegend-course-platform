import { expect, test } from "@playwright/test";

const prefix = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") || "/itlegend-course-platform";
const slugs = ["starting-seo", "web-development", "ui-design", "digital-marketing", "javascript", "content-writing"];

test("project-path export supports catalog, deep routes, swipe quiz and real media/material assets", async ({ page, request, baseURL }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (!response.url().startsWith(`${baseURL}/`)) return;
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    if (!new URL(response.url()).pathname.startsWith(`${prefix}/`)) errors.push(`Unprefixed request: ${response.url()}`);
  });
  await page.goto(`${prefix}/`);
  await expect(page.locator(".course-card")).toHaveCount(6);
  const images = await page.locator(".course-image-link img").evaluateAll((items) => items.map((item) => item.getAttribute("src")!));
  for (const image of images) {
    expect(image.startsWith(`${prefix}/images/`)).toBe(true);
    expect((await request.get(image)).ok()).toBe(true);
  }
  expect(await page.locator('link[rel="icon"]').getAttribute("href")).toBe(`${prefix}/favicon.svg`);
  expect((await request.get(`${prefix}/favicon.svg`)).ok()).toBe(true);
  await page.locator('[data-course="starting-seo"] .course-start').click();
  await expect(page).toHaveURL(`${baseURL}${prefix}/courses/starting-seo/`);
  const video = page.locator("video");
  await expect(video).toHaveAttribute("src", `${prefix}/videos/lesson-demo.mp4`);
  await expect(video).toHaveAttribute("poster", `${prefix}/images/course-player.webp`);
  await expect(page.locator('link[rel="preload"][as="image"]').first()).toHaveAttribute("href", `${prefix}/images/course-player.webp`);
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).duration)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Play Function Parameters", exact: true }).click();
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0.1);
  await page.getByRole("button", { name: "Pause video" }).click();
  await expect(page.locator("track")).toHaveAttribute("src", `${prefix}/videos/demo-captions.vtt`);
  for (const image of await page.locator("img.comment-avatar").evaluateAll((items) => items.map((item) => item.getAttribute("src")!))) {
    expect(image.startsWith(`${prefix}/images/`)).toBe(true);
    expect((await request.get(image)).ok()).toBe(true);
  }
  const captions = await request.get(`${prefix}/videos/demo-captions.vtt`);
  expect(await captions.text()).toContain("WEBVTT");
  const range = await request.get(`${prefix}/videos/lesson-demo.mp4`, { headers: { Range: "bytes=0-31" } });
  expect(range.status()).toBe(206);
  expect((await range.body()).length).toBe(32);

  await page.getByRole("button", { name: /^Course Overview.*exam/ }).click();
  const exam = page.getByRole("dialog", { name: "Course Exam", exact: true });
  await expect(exam.locator(".exam-question-nav button")).toHaveCount(5);
  await expect(exam.getByRole("button", { name: /^(Previous|Next)$/ })).toHaveCount(0);
  const option = (await exam.locator(".exam-choices label").first().boundingBox())!;
  await page.mouse.move(option.x + option.width * 0.75, option.y + option.height / 2);
  await page.mouse.down();
  await page.mouse.move(option.x + option.width * 0.25, option.y + option.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(exam.locator('[aria-current="step"]')).toHaveText("2");
  await expect(exam.locator("input:checked")).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /^Course Exercise \/ Reference Files.*PDF material/ }).click();
  expect(await page.getByRole("dialog", { name: "Course Material", exact: true }).boundingBox()).toEqual({ x: 0, y: 0, ...page.viewportSize() });
  await expect(page.locator(".pdf-frame")).toHaveAttribute("src", `${prefix}/materials/seo-workbook.pdf#view=FitH`);
  await expect(page.getByRole("link", { name: "Open PDF in a new tab", exact: true })).toHaveAttribute("href", `${prefix}/materials/seo-workbook.pdf`);
  const pdf = await request.get(`${prefix}/materials/seo-workbook.pdf`);
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /^Course Exercise \/ Reference Files.*PDF material/ })).toBeFocused();
  await page.getByRole("button", { name: "Open leaderboard" }).click();
  for (const image of await page.locator(".leaderboard-list img").evaluateAll((items) => items.map((item) => item.getAttribute("src")!))) expect((await request.get(image)).ok()).toBe(true);
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(page).toHaveURL(`${baseURL}${prefix}/courses/`);
  for (const slug of slugs) {
    const response = await page.goto(`${prefix}/courses/${slug}/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(".player-layout")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("project-path PDF fallback and useful 404 keep links inside the repository", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "pdfViewerEnabled", { value: false, configurable: true }));
  await page.goto(`${prefix}/courses/starting-seo/`);
  await page.getByRole("button", { name: /^Course Exercise \/ Reference Files.*PDF material/ }).click();
  await expect(page.locator(".pdf-page-preview img")).toHaveAttribute("src", `${prefix}/images/seo-workbook-preview.webp`);
  await expect.poll(() => page.locator(".pdf-page-preview img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  const response = await page.goto(`${prefix}/courses/unknown-course/`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Browse courses" })).toHaveAttribute("href", `${prefix}/courses/`);
  await page.getByRole("link", { name: "Browse courses" }).click();
  await expect(page.locator(".course-card")).toHaveCount(6);
});
