"use client";

import { ChevronDown } from "lucide-react";
import type { Course, Lesson } from "@/types/course";
import { LessonRow } from "./lesson-row";

export function Curriculum({ course, activeId, completedIds, onSelect }: { course: Course; activeId: string; completedIds: string[]; onSelect: (lesson: Lesson) => void }) {
  const allLessons = course.sections.flatMap((section) => section.lessons);
  const boundaries = [0, Math.ceil(allLessons.length / 2), Math.ceil(allLessons.length * 0.75), allLessons.length];
  const mobileTitles = course.slug === "starting-seo" ? ["Course Introduction", "JavaScript Language Basics", "Components & Databinding"] : ["Course Introduction", `${course.category} Basics`, "Practice & Knowledge Check"];
  function rows(lessons: Lesson[]) {
    return <ul className="lesson-list">{lessons.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} active={lesson.id === activeId} completed={completedIds.includes(lesson.id)} onSelect={() => onSelect(lesson)} />)}</ul>;
  }
  return (
    <section id="curriculum" className="curriculum" aria-labelledby="curriculum-title" tabIndex={-1}>
      <h2 id="curriculum-title" className="mobile-curriculum-heading">Course Content</h2>
      <div className="desktop-curriculum">{course.sections.map((section) => <section key={section.id} className="curriculum-section"><h3>{section.title}</h3><p>{section.description}</p>{rows(section.lessons)}</section>)}</div>
      <div className="mobile-curriculum">{mobileTitles.map((title, index) => <details key={title} open={index === 0 || allLessons.slice(boundaries[index], boundaries[index + 1]).some((lesson) => lesson.id === activeId)} className="curriculum-accordion"><summary><span>{title}</span><ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" /></summary>{rows(allLessons.slice(boundaries[index], boundaries[index + 1]))}</details>)}</div>
    </section>
  );
}
