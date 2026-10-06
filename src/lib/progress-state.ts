import type { Course, CourseComment, CourseProgress, CourseStatus, ExamAttempt } from "@/types/course";

export const STORAGE_PREFIX = "itlegend:course:v1:";

export function initialProgress(course: Course): CourseProgress {
  return { completedIds: [...course.initialCompleted], lessonId: course.initialLessonId, questionDraft: "", exams: {}, comments: [] };
}

export function progressPercentage(course: Course, state: CourseProgress): number {
  const lessons = course.sections.flatMap((section) => section.lessons);
  const validIds = new Set(lessons.map((item) => item.id));
  const completed = new Set(state.completedIds.filter((id) => validIds.has(id)));
  return lessons.length ? Math.round((completed.size / lessons.length) * 100) : 0;
}

export function courseStatus(percentage: number): CourseStatus {
  return percentage === 100 ? "Completed" : percentage === 0 ? "Not started" : "In progress";
}

export function completeLesson(course: Course, state: CourseProgress, id: string): CourseProgress {
  if (state.completedIds.includes(id) || !course.sections.some((section) => section.lessons.some((item) => item.id === id))) return state;
  return { ...state, completedIds: [...state.completedIds, id] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function restoreProgress(course: Course, raw: string | null): CourseProgress {
  const fallback = initialProgress(course);
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.completedIds) || typeof parsed.lessonId !== "string") return fallback;
    const lessons = course.sections.flatMap((section) => section.lessons);
    const ids = new Set(lessons.map((item) => item.id));
    const completedIds = [...new Set(parsed.completedIds.filter((id): id is string => typeof id === "string" && ids.has(id)))];
    const exams: Record<string, ExamAttempt> = {};
    if (isRecord(parsed.exams)) {
      for (const item of lessons) {
        const attempt = parsed.exams[item.id];
        if (!item.questions || !isRecord(attempt) || !isRecord(attempt.answers)) continue;
        const answers: Record<string, number> = {};
        for (const question of item.questions) {
          const answer = attempt.answers[question.id];
          if (typeof answer === "number" && Number.isInteger(answer) && answer >= 0 && answer < question.choices.length) answers[question.id] = answer;
        }
        exams[item.id] = { answers, position: typeof attempt.position === "number" ? Math.max(0, Math.min(Math.trunc(attempt.position), item.questions.length - 1)) : 0, submitted: attempt.submitted === true };
      }
    }
    const comments: CourseComment[] = Array.isArray(parsed.comments) ? parsed.comments.filter((comment): comment is CourseComment => isRecord(comment) && typeof comment.id === "string" && typeof comment.name === "string" && typeof comment.date === "string" && typeof comment.text === "string" && comment.text.trim().length > 0).slice(-100).map((comment) => ({ id: comment.id.slice(0, 100), name: comment.name.slice(0, 80), date: comment.date, text: comment.text.slice(0, 2000) })) : [];
    return { completedIds, lessonId: ids.has(parsed.lessonId) ? parsed.lessonId : fallback.lessonId, questionDraft: typeof parsed.questionDraft === "string" ? parsed.questionDraft.slice(0, 2000) : "", exams, comments };
  } catch {
    return fallback;
  }
}
