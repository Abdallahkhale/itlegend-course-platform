import { expect, test } from "@playwright/test";

test("legacy exam resumes five questions with a paused retained practice timer, zero-time finishing, and retry reset", async ({ page }) => {
  await page.clock.install();
  await page.goto("/courses/starting-seo/");
  await page.evaluate(() => localStorage.setItem("itlegend:course:v1:starting-seo", JSON.stringify({
    completedIds: ["introduction", "overview", "overview-exam", "reference-files", "editor", "embedding", "functions"],
    lessonId: "overview-exam", questionDraft: "", comments: [],
    exams: { "overview-exam": { answers: { intent: 1, title: 2, links: 0 }, position: 2, submitted: true } },
  })));
  await page.reload();
  await expect(page.getByRole("progressbar", { name: "Course completion" })).toHaveAttribute("aria-valuenow", "58");
  const trigger = page.getByRole("button", { name: /^Course Overview.*exam/ });
  await trigger.click();
  const timer = page.getByRole("timer", { name: "Practice time remaining" });
  await expect(timer).toHaveText("10:00");
  await expect(page.locator('.exam-question-nav [aria-current="step"]')).toHaveText("3");
  await expect(page.getByLabel("To help readers find a related useful page", { exact: true })).toBeChecked();
  await expect(page.getByRole("heading", { name: "Exam complete" })).toBeHidden();
  await page.getByRole("button", { name: "Question 4", exact: true }).click();
  await page.getByLabel("Search traffic and meaningful visitor actions", { exact: true }).check();
  await page.clock.fastForward(5000);
  expect(Number(await timer.getAttribute("data-remaining-seconds"))).toBeLessThanOrEqual(595);
  await expect(page.getByLabel("Search traffic and meaningful visitor actions", { exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Close course exam", exact: true }).click();
  await expect(trigger).toBeFocused();
  const pausedTime = await page.evaluate(() => JSON.parse(localStorage.getItem("itlegend:course:v1:starting-seo")!).exams["overview-exam"].remainingSeconds);
  await page.clock.fastForward(30000);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("itlegend:course:v1:starting-seo")!).exams["overview-exam"].remainingSeconds)).toBe(pausedTime);
  await page.reload();
  await trigger.click();
  await expect(timer).toHaveAttribute("data-remaining-seconds", String(pausedTime));
  await expect(page.locator('.exam-question-nav [aria-current="step"]')).toHaveText("4");
  await expect(page.getByLabel("Search traffic and meaningful visitor actions", { exact: true })).toBeChecked();
  await page.clock.fastForward((pausedTime + 1) * 1000);
  await expect(timer).toHaveText("00:00");
  await expect(page.getByRole("status").filter({ hasText: "Practice time is up." })).toBeVisible();
  await expect(page.getByLabel("Search traffic and meaningful visitor actions", { exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Question 5", exact: true }).click();
  await page.getByRole("button", { name: "Submit Exam", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Course Exam", exact: true }).getByRole("alert")).toHaveText("Answer every question before submitting.");
  await page.getByLabel("Check its accuracy and answer missing questions", { exact: true }).check();
  await page.getByRole("button", { name: "Submit Exam", exact: true }).click();
  await expect(page.getByText("5 of 5", { exact: true })).toBeVisible();
  await page.clock.fastForward(5000);
  await expect(timer).toHaveText("00:00");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(timer).toHaveText("10:00");
  await expect(page.locator('.exam-question-nav [aria-current="step"]')).toHaveText("1");
  await expect(page.getByRole("radio").first()).not.toBeChecked();
  await page.clock.fastForward(2000);
  expect(Number(await timer.getAttribute("data-remaining-seconds"))).toBeLessThanOrEqual(598);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("progressbar", { name: "Course completion" })).toHaveAttribute("aria-valuenow", "58");
});

test("question drafts and quiz answers survive closing when browser storage is blocked", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { configurable: true, get: () => { throw new DOMException("Storage blocked", "SecurityError"); } }));
  await page.goto("/courses/starting-seo/");
  const ask = page.getByRole("button", { name: "Ask a question", exact: true });
  await ask.click();
  await expect(page.locator(".question-dialog form")).toHaveClass(/comment-form/);
  await page.getByRole("button", { name: "Submit Question", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Ask a Question", exact: true }).getByRole("alert")).toHaveText("Write your question before submitting.");
  await page.getByLabel("Your question", { exact: true }).fill("Can I keep this draft while choosing a lesson?");
  await page.keyboard.press("Escape");
  await expect(ask).toBeFocused();
  await ask.click();
  await expect(page.getByLabel("Your question", { exact: true })).toHaveValue("Can I keep this draft while choosing a lesson?");
  await page.keyboard.press("Escape");
  const exam = page.getByRole("button", { name: /^Course Overview.*exam/ });
  await exam.click();
  await page.getByLabel("Understanding the searcher’s intent", { exact: true }).check();
  await page.keyboard.press("Escape");
  await exam.click();
  await expect(page.getByLabel("Understanding the searcher’s intent", { exact: true })).toBeChecked();
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});

test("leaderboard shows course context, progress-specific Egyptian Arabic, native medals, and accurate six-person ranks", async ({ page }) => {
  for (const item of [
    { slug: "web-development", progress: 0, copy: "يلا نبدأ", emoji: "💪", youRank: 6 },
    { slug: "starting-seo", progress: 58, copy: "عدّيت نص الطريق", emoji: "👏", youRank: 6 },
    { slug: "content-writing", progress: 100, copy: "عاش يا بطل", emoji: "🎉", youRank: 2 },
  ]) {
    await page.goto(`/courses/${item.slug}/`);
    const title = await page.getByRole("heading", { level: 1 }).textContent();
    await page.getByRole("button", { name: "Open leaderboard", exact: true }).click();
    await expect(page.locator(".leaderboard-dialog .dialog-header-context")).toHaveText(title!);
    const encouragement = page.locator('.leaderboard-motivation [lang="ar"]');
    await expect(encouragement).toHaveAttribute("dir", "rtl");
    await expect(encouragement).toContainText(item.copy);
    await expect(encouragement).toContainText(item.emoji);
    const rows = page.locator(".leaderboard-list li");
    await expect(rows).toHaveCount(6);
    await expect(rows.nth(item.youRank - 1).locator("strong")).toHaveText("You");
    const points = await rows.locator(":scope > span:last-child").allTextContents();
    const values = points.map((value) => Number.parseInt(value, 10));
    expect(values).toEqual([...values].sort((a, b) => b - a));
    await expect(page.locator(".leaderboard-list .is-you > span:last-child")).toHaveText(`${item.progress * 12} pts`);
    await expect(page.getByRole("img", { name: "Rank 1", exact: true })).toHaveText("🥇");
    await page.keyboard.press("Escape");
  }
});
