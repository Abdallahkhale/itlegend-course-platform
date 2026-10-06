import { CourseCatalog } from "@/components/courses/course-catalog";
import { courses } from "@/data/courses";

export default function HomePage() {
  return <CourseCatalog courses={courses} />;
}
