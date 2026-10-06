import type { Course } from "@/types/course";
import { PageHeading } from "@/components/ui/page-heading";
import { CourseCard } from "./course-card";

export function CourseCatalog({ courses }: { courses: Course[] }) {
  return (
    <>
      <PageHeading title="Explore Our Courses" />
      <main id="main-content" className="container catalog-main">
        <div className="catalog-intro"><h2>Keep learning, at your own pace.</h2><p>Choose a course and pick up where you left off.</p></div>
        <div className="course-grid">{courses.map((course) => <CourseCard key={course.slug} course={course} />)}</div>
      </main>
      <footer className="site-footer container">IT Legend · Learning starts here.</footer>
    </>
  );
}
