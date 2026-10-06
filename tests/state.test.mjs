import assert from "node:assert/strict";
import test from "node:test";
import { completeLesson, courseStatus, initialProgress, progressPercentage, restoreProgress } from "../src/lib/progress-state.ts";

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
  assert.deepEqual(restored.exams.exam, { answers: { q2: 1 }, position: 1, submitted: true });
});
