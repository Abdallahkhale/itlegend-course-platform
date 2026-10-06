"use client";

import { useCallback, useSyncExternalStore } from "react";
import { completeLesson, initialProgress, restoreProgress, STORAGE_PREFIX } from "@/lib/progress-state";
import type { Course, CourseComment, CourseProgress, ExamAttempt } from "@/types/course";

interface Snapshot { progress: CourseProgress; hydrated: boolean; }
interface Store { snapshot: Snapshot; serverSnapshot: Snapshot; initialized: boolean; listeners: Set<() => void>; }

const stores = new Map<string, Store>();

function getStore(course: Course): Store {
  let store = stores.get(course.slug);
  if (!store) {
    const snapshot = { progress: initialProgress(course), hydrated: false };
    store = { snapshot, serverSnapshot: snapshot, initialized: false, listeners: new Set() };
    stores.set(course.slug, store);
  }
  return store;
}

function notify(store: Store) { store.listeners.forEach((listener) => listener()); }

function subscribeCourse(course: Course, listener: () => void) {
  const store = getStore(course);
  store.listeners.add(listener);
  if (!store.initialized) {
    let raw: string | null = null;
    try { raw = localStorage.getItem(`${STORAGE_PREFIX}${course.slug}`); } catch { /* Use mock defaults. */ }
    store.snapshot = { progress: restoreProgress(course, raw), hydrated: true };
    store.initialized = true;
  }
  const sync = (event: StorageEvent) => {
    if (event.key === `${STORAGE_PREFIX}${course.slug}` || event.key === null) {
      store.snapshot = { progress: restoreProgress(course, event.newValue), hydrated: true };
      notify(store);
    }
  };
  window.addEventListener("storage", sync);
  return () => { store.listeners.delete(listener); window.removeEventListener("storage", sync); };
}

function update(course: Course, updater: (previous: CourseProgress) => CourseProgress) {
  const store = getStore(course);
  const progress = updater(store.snapshot.progress);
  if (progress === store.snapshot.progress) return;
  store.snapshot = { progress, hydrated: true };
  try { localStorage.setItem(`${STORAGE_PREFIX}${course.slug}`, JSON.stringify(progress)); } catch { /* The current session still works when browser storage is unavailable. */ }
  notify(store);
}

export function useCourseProgress(course: Course) {
  const subscribe = useCallback((listener: () => void) => subscribeCourse(course, listener), [course]);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => getStore(course).snapshot,
    () => getStore(course).serverSnapshot,
  );

  return {
    ...snapshot,
    selectLesson: (lessonId: string) => update(course, (previous) => ({ ...previous, lessonId })),
    markComplete: (id: string) => update(course, (previous) => completeLesson(course, previous, id)),
    setQuestionDraft: (questionDraft: string) => update(course, (previous) => ({ ...previous, questionDraft })),
    updateExam: (id: string, attempt: ExamAttempt) => update(course, (previous) => ({ ...previous, exams: { ...previous.exams, [id]: attempt } })),
    addComment: (comment: CourseComment) => update(course, (previous) => ({ ...previous, comments: [...previous.comments, comment] })),
  };
}
