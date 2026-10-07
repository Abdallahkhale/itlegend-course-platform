import assert from "node:assert/strict";
import test from "node:test";
import { advanceExamTimer, completeLesson, courseStatus, examDurationSeconds, initialProgress, progressPercentage, restoreProgress } from "../src/lib/progress-state.ts";
import { courses, getLessons } from "../src/data/courses.ts";
import { progressEncouragement } from "../src/lib/encouragement.ts";

const course = {
  initialCompleted: ["one"], initialLessonId: "two",
  sections: [{ lessons: [{ id: "one" }, { id: "two" }, { id: "exam", questions: [{ id: "q1", choices: ["A", "B"] }, { id: "q2", choices: ["A", "B"] }] }] }],
};

test("completion is idempotent and catalog/player share the percentage", () => {
  const initial = initialProgress(course);
  assert.equal(progressPercentage(course, initial), 33);
  const next = completeLesson(course, initial, "two");
  assert.equal(progressPercentage(course, next), 67);
  assert.equal(completeLesson(course, next, "two"), next);
  assert.equal(completeLesson(course, next, "missing"), next);
  assert.equal(courseStatus(progressPercentage(course, completeLesson(course, next, "exam"))), "Completed");
});

test("exam answers, question position, drafts and comments survive a reload", () => {
  const state = { ...initialProgress(course), questionDraft: "How do I choose a keyword?", exams: { exam: { answers: { q1: 1 }, position: 1, submitted: false } }, comments: [{ id: "comment", name: "You", date: "2026-10-06", text: "This helped." }] };
  assert.deepEqual(restoreProgress(course, JSON.stringify(state)), state);
});

test("corrupt, unavailable and foreign saved data recover safely", () => {
  assert.deepEqual(restoreProgress(course, "invalid json"), initialProgress(course));
  assert.deepEqual(restoreProgress(course, null), initialProgress(course));
  const restored = restoreProgress(course, JSON.stringify({ completedIds: ["one", "one", "foreign", 2], lessonId: "foreign", exams: { exam: { answers: { q1: 8, q2: 1 }, position: 100, submitted: true } } }));
  assert.deepEqual(restored.completedIds, ["one"]);
  assert.equal(restored.lessonId, "two");
  assert.deepEqual(restored.exams.exam, { answers: { q2: 1 }, position: 1, submitted: false });
});

test("a submitted legacy three-answer exam keeps earned completion and resumes the five-question attempt", () => {
  const seo = courses[0];
  const exam = getLessons(seo).find((lesson) => lesson.id === "overview-exam");
  assert.equal(exam.questions.length, 5);
  const before = { ...initialProgress(seo), lessonId: exam.id, exams: { [exam.id]: { answers: { intent: 1, title: 2, links: 0 }, position: 2, submitted: true } } };
  const after = restoreProgress(seo, JSON.stringify(before));
  assert.deepEqual(after.completedIds, before.completedIds);
  assert.equal(progressPercentage(seo, after), progressPercentage(seo, before));
  assert.deepEqual(after.exams[exam.id], { answers: before.exams[exam.id].answers, position: 2, submitted: false });
  after.exams[exam.id].answers = { ...after.exams[exam.id].answers, measure: 2, improve: 3 };
  after.exams[exam.id].submitted = true;
  assert.equal(restoreProgress(seo, JSON.stringify(after)).exams[exam.id].submitted, true);
});

test("only valid remaining practice time is restored, including zero and attempts without a timer", () => {
  const state = { ...initialProgress(course), exams: { exam: { answers: { q1: 1 }, position: 1, submitted: false, remainingSeconds: 123 } } };
  assert.equal(restoreProgress(course, JSON.stringify(state)).exams.exam.remainingSeconds, 123);
  state.exams.exam.remainingSeconds = 0;
  assert.equal(restoreProgress(course, JSON.stringify(state)).exams.exam.remainingSeconds, 0);
  for (const invalid of [-1, 601, 1.5, "200", null]) {
    state.exams.exam.remainingSeconds = invalid;
    assert.equal(restoreProgress(course, JSON.stringify(state)).exams.exam.remainingSeconds, undefined);
  }
  delete state.exams.exam.remainingSeconds;
  assert.deepEqual(restoreProgress(course, JSON.stringify(state)), state);
});

test("practice countdown uses the lesson duration, retains current answers, and stops at zero or submission", () => {
  assert.equal(examDurationSeconds("10 MINUTES"), 600);
  assert.equal(examDurationSeconds("15 MINUTES"), 900);
  const first = advanceExamTimer(undefined, 0, 600);
  assert.equal(first.remainingSeconds, 600);
  const answered = { ...first, answers: { q1: 1, q2: 0 }, position: 1 };
  const next = advanceExamTimer(answered, 7, 600);
  assert.deepEqual(next, { ...answered, remainingSeconds: 593 });
  const expired = advanceExamTimer(next, 1000, 600);
  assert.equal(expired.remainingSeconds, 0);
  assert.deepEqual(expired.answers, answered.answers);
  assert.equal(advanceExamTimer(expired, 20, 600), expired);
  const submitted = { ...next, submitted: true };
  assert.equal(advanceExamTimer(submitted, 20, 600), submitted);
});

test("encouragement responds to the six progress bands with original native-emoji copy", () => {
  assert.match(progressEncouragement(0), /يلا نبدأ.*💪/);
  assert.match(progressEncouragement(58), /عدّيت نص الطريق.*👏/);
  assert.match(progressEncouragement(100), /عاش يا بطل.*🎉/);
  assert.equal(new Set([0, 1, 25, 50, 75, 100].map(progressEncouragement)).size, 6);
  for (const [start, end] of [[1, 24], [25, 49], [50, 74], [75, 99]]) assert.equal(progressEncouragement(start), progressEncouragement(end));
});
