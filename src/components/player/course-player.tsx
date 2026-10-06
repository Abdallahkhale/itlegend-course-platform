"use client";

import { useState } from "react";
import { PageHeading } from "@/components/ui/page-heading";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { useCourseTools } from "@/hooks/use-course-tools";
import { getLessons } from "@/data/courses";
import { progressPercentage } from "@/lib/progress-state";
import type { Course, Lesson } from "@/types/course";
import { VideoPlayer } from "./video-player";
import { PlayerToolbar } from "./player-toolbar";
import { LessonDetails } from "./lesson-details";
import { CourseMaterials } from "./course-materials";
import { CourseProgress } from "./course-progress";
import { Curriculum } from "./curriculum";
import { Comments } from "./comments";
import { QuestionDialog } from "./question-dialog";
import { LeaderboardDialog } from "./leaderboard-dialog";
import { MaterialDialog } from "./material-dialog";
import { ExamDialog } from "./exam-dialog";

type Popup = "question" | "leaderboard" | "pdf" | "exam" | null;

export function CoursePlayer({ course }: { course: Course }) {
  const { progress, selectLesson, markComplete, setQuestionDraft, updateExam, addComment } = useCourseProgress(course);
  const lessons = getLessons(course);
  const activeLesson = lessons.find((lesson) => lesson.id === progress.lessonId) ?? lessons[0];
  const activeIndex = lessons.findIndex((lesson) => lesson.id === activeLesson.id);
  const [lastVideoId, setLastVideoId] = useState(lessons.find((lesson) => lesson.kind === "video")!.id);
  const mediaLesson = activeLesson.kind === "video" ? activeLesson : lessons.find((lesson) => lesson.id === lastVideoId)!;
  const [wide, setWide] = useState(false);
  const [popup, setPopup] = useState<Popup>(null);
  const percentage = progressPercentage(course, progress);
  const completed = progress.completedIds.includes(activeLesson.id);

  function chooseLesson(lesson: Lesson) {
    if (activeLesson.kind === "video") setLastVideoId(activeLesson.id);
    if (lesson.kind === "video") setLastVideoId(lesson.id);
    selectLesson(lesson.id);
    if (lesson.kind === "pdf" || lesson.kind === "exam") setPopup(lesson.kind);
  }

  useCourseTools(course, progress, chooseLesson);

  function scrollTo(id: "curriculum" | "comments") {
    if (id === "curriculum") setWide(false);
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      const sticky = window.matchMedia("(max-width: 767px)").matches ? document.querySelector(".video-stage")?.getBoundingClientRect().height ?? 0 : 0;
      const offset = window.scrollY + target.getBoundingClientRect().top - sticky - 20;
      window.scrollTo({ top: Math.max(0, offset), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      target.focus({ preventScroll: true });
    });
  }

  return (
    <>
      <PageHeading title={course.title} details />
      <main id="main-content" className={`container player-layout ${wide ? "is-wide" : ""}`}>
        <div className="player-primary">
          <div className="sticky-video"><VideoPlayer lesson={mediaLesson} wide={wide} pauseSignal={`${activeLesson.id}:${popup ?? ""}`} onWideChange={() => setWide((value) => !value)} onEnded={() => markComplete(mediaLesson.id)} /></div>
          <PlayerToolbar onCurriculum={() => scrollTo("curriculum")} onComments={() => scrollTo("comments")} onQuestion={() => setPopup("question")} onLeaderboard={() => setPopup("leaderboard")} />
          <LessonDetails lesson={activeLesson} completed={completed} previous={activeIndex > 0} next={activeIndex < lessons.length - 1} onComplete={() => markComplete(activeLesson.id)} onPrevious={() => chooseLesson(lessons[activeIndex - 1])} onNext={() => chooseLesson(lessons[activeIndex + 1])} onOpen={() => setPopup(activeLesson.kind === "pdf" ? "pdf" : "exam")} />
          <CourseMaterials course={course} />
        </div>
        <aside className="player-sidebar" aria-label="Course progress and curriculum"><CourseProgress percentage={percentage} completed={progress.completedIds.length} total={lessons.length} /><Curriculum course={course} activeId={activeLesson.id} completedIds={progress.completedIds} onSelect={chooseLesson} /></aside>
        <div className="player-comments"><Comments comments={[...course.comments, ...progress.comments]} onAdd={addComment} /></div>
      </main>
      <QuestionDialog open={popup === "question"} onClose={() => setPopup(null)} lessonTitle={activeLesson.title} draft={progress.questionDraft} onDraftChange={setQuestionDraft} />
      <LeaderboardDialog open={popup === "leaderboard"} onClose={() => setPopup(null)} percentage={percentage} />
      <MaterialDialog open={popup === "pdf"} onClose={() => setPopup(null)} lesson={activeLesson} completed={completed} onComplete={() => markComplete(activeLesson.id)} />
      <ExamDialog open={popup === "exam"} onClose={() => setPopup(null)} lesson={activeLesson} attempt={progress.exams[activeLesson.id]} onUpdate={(attempt) => updateExam(activeLesson.id, attempt)} onComplete={() => markComplete(activeLesson.id)} />
    </>
  );
}
