import type { Metadata } from "next";
import { CourseCatalog } from "@/components/courses/course-catalog";
import { courses } from "@/data/courses";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return <CourseCatalog courses={courses} />;
}
