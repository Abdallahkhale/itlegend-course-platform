import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursePlayer } from "@/components/player/course-player";
import { courses, getLessons } from "@/data/courses";
import { withBasePath } from "@/lib/paths";

export const dynamicParams = false;

export function generateStaticParams() {
  return courses.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  return { title: course?.title ?? "Course not found", description: course?.description };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  if (!course) notFound();
  const poster = getLessons(course).find((lesson) => lesson.kind === "video")?.poster;
  return <>{poster && <link rel="preload" as="image" href={withBasePath(poster)} fetchPriority="high" />}<CoursePlayer course={course} /></>;
}
