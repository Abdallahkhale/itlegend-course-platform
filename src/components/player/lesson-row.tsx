import { Check, FileText, LockKeyhole } from "lucide-react";
import type { Lesson } from "@/types/course";

export function LessonRow({ lesson, active, completed, onSelect }: { lesson: Lesson; active: boolean; completed: boolean; onSelect: () => void }) {
  return (
    <li className={`lesson-row ${active ? "is-current" : ""}`}>
      <button type="button" onClick={onSelect} aria-current={active ? "step" : undefined} aria-label={`${lesson.title}${lesson.kind === "pdf" ? ", PDF material" : lesson.kind === "exam" ? ", exam" : ""}${active ? ", current lesson" : ""}${completed ? ", completed" : ""}`}>
        <FileText className="lesson-kind-icon" size={15} strokeWidth={1.3} aria-hidden="true" />
        <span className="lesson-title">{lesson.title}{active && <span className="current-lesson-label">Current lesson</span>}</span>
        {lesson.kind === "exam" ? <span className="exam-tags"><span>{lesson.questions?.length} QUESTIONS</span><span>{lesson.duration}</span></span> : completed ? <Check className="lesson-end-icon completed-icon" size={17} aria-hidden="true" /> : <LockKeyhole className="lesson-end-icon" size={15} strokeWidth={1.3} aria-hidden="true" />}
      </button>
    </li>
  );
}
