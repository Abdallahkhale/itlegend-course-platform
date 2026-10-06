"use client";

import { useEffect, useEffectEvent } from "react";
import { progressPercentage } from "@/lib/progress-state";
import type { Course, CourseProgress, Lesson } from "@/types/course";

interface ModelContext {
  registerTool(tool: { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown | Promise<unknown> }, options: { signal: AbortSignal }): void | Promise<void>;
}

export function useCourseTools(course: Course, progress: CourseProgress, onSelect: (lesson: Lesson) => void) {
  const readCourse = useEffectEvent(() => ({
    slug: course.slug, title: course.title, currentLessonId: progress.lessonId, percentage: progressPercentage(course, progress),
    lessons: course.sections.flatMap((section) => section.lessons).map((lesson) => ({ id: lesson.id, title: lesson.title, kind: lesson.kind, completed: progress.completedIds.includes(lesson.id) })),
  }));
  const select = useEffectEvent((input: unknown) => {
    if (typeof input !== "object" || input === null || !("lessonId" in input) || typeof input.lessonId !== "string") throw new Error("A valid lessonId is required.");
    const lesson = course.sections.flatMap((section) => section.lessons).find((item) => item.id === input.lessonId);
    if (!lesson) throw new Error("This lesson does not belong to the current course.");
    onSelect(lesson);
  });

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools = [
      { name: "read_course", title: "Read course", description: "Read the current course, lesson list, and device-local completion progress without changing anything.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: () => readCourse() },
      { name: "select_course_lesson", title: "Select course lesson", description: "Select a lesson in this course. A PDF lesson opens its viewer; an exam opens its retained attempt. This does not mark the lesson complete.", inputSchema: { type: "object", properties: { lessonId: { type: "string" } }, required: ["lessonId"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: async (input: unknown) => { select(input); await new Promise<void>((resolve) => requestAnimationFrame(() => resolve())); return readCourse(); } },
    ];
    for (const tool of tools) {
      try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => { /* Browser tools are optional; the visible course remains available. */ }); } catch { /* Unsupported browser registration must not disrupt the course. */ }
    }
    return () => lifecycle.abort();
  }, [course.slug]);
}
