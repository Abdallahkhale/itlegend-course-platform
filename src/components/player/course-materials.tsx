import { BookOpen, Clock3, Globe2, GraduationCap, UserRound, UsersRound } from "lucide-react";
import { getLessons } from "@/data/courses";
import type { Course } from "@/types/course";

export function CourseMaterials({ course }: { course: Course }) {
  const rows = [
    { icon: UserRound, label: "Instructor", value: course.instructor },
    { icon: Clock3, label: "Duration", value: course.duration },
    { icon: BookOpen, label: "Lessons", value: String(getLessons(course).length) },
    { icon: UsersRound, label: "Enrolled", value: `${course.students} students` },
    { icon: Globe2, label: "Language", value: course.language },
    { icon: GraduationCap, label: "Level", value: course.level },
  ];
  return (
    <section className="course-materials" aria-labelledby="materials-title">
      <h2 id="materials-title">Course Materials</h2>
      <dl className="materials-grid">{rows.map(({ icon: Icon, label, value }) => <div className="material-row" key={label}><dt><Icon size={17} strokeWidth={1.4} aria-hidden="true" />{label}:</dt><dd>{value}</dd></div>)}</dl>
    </section>
  );
}
