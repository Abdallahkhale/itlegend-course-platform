import { Check, ChevronLeft, ChevronRight, FileText, ClipboardList } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import type { Lesson } from "@/types/course";

export function LessonDetails({ lesson, completed, previous, next, onComplete, onPrevious, onNext, onOpen }: { lesson: Lesson; completed: boolean; previous: boolean; next: boolean; onComplete: () => void; onPrevious: () => void; onNext: () => void; onOpen: () => void }) {
  return (
    <details className="lesson-details">
      <summary><span>Current lesson: <strong>{lesson.title}</strong></span><ChevronRight size={17} aria-hidden="true" /></summary>
      <div className="lesson-details-body"><p>{lesson.description}</p><div className="lesson-actions"><button type="button" className="button button-outline compact-button" onClick={lesson.kind === "video" ? onComplete : onOpen}>{lesson.kind === "video" ? <><Check size={16} aria-hidden="true" />{completed ? "Completed" : "Mark complete"}</> : lesson.kind === "pdf" ? <><FileText size={16} />Open PDF</> : <><ClipboardList size={16} />Open Exam</>}</button><div className="lesson-navigation"><IconButton label="Previous lesson" disabled={!previous} onClick={onPrevious}><ChevronLeft size={20} /></IconButton><IconButton label="Next lesson" disabled={!next} onClick={onNext}><ChevronRight size={20} /></IconButton></div></div></div>
    </details>
  );
}
