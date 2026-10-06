"use client";

import Image from "next/image";
import { BookOpen, Clock3 } from "lucide-react";
import { getLessons } from "@/data/courses";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { courseStatus, progressPercentage } from "@/lib/progress-state";
import type { Course } from "@/types/course";

export function CourseCard({ course }: { course: Course }) {
  const { progress, selectLesson } = useCourseProgress(course);
  const percentage = progressPercentage(course, progress);
  const status = courseStatus(percentage);
  return (
    <article className="course-card" data-course={course.slug}>
      <a className="course-image-link" href={`/courses/${course.slug}/`} tabIndex={-1} aria-hidden="true"><Image src={course.image} alt="" width={640} height={426} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 380px" priority={course.slug === "starting-seo"} fetchPriority={course.slug === "starting-seo" ? "high" : "auto"} /></a>
      <div className="course-card-body">
        <div className="course-card-top"><span className="course-category">{course.category}</span><span className={`course-status ${percentage === 100 ? "is-complete" : ""}`}>{status}</span></div>
        <h2><a href={`/courses/${course.slug}/`}>{course.title}</a></h2>
        <p className="course-description">{course.description}</p>
        <p className="course-instructor">by <strong>{course.instructor}</strong></p>
        <div className="course-card-meta"><span><BookOpen size={15} aria-hidden="true" />{getLessons(course).length} lessons</span><span><Clock3 size={15} aria-hidden="true" />{course.duration}</span></div>
        <div className="card-progress-label"><span>Course progress</span><strong>{percentage}%</strong></div>
        <div className="progress-track" role="progressbar" aria-label={`${course.title} progress`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percentage}%` }} /></div>
        <a href={`/courses/${course.slug}/`} onClick={() => { if (percentage === 0) selectLesson(getLessons(course)[0].id); }} className="button button-primary course-start">{percentage === 0 ? "Start Course" : "Continue Course"}</a>
      </div>
    </article>
  );
}
