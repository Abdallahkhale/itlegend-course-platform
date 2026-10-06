export type LessonKind = "video" | "pdf" | "exam";

export interface ExamQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  duration: string;
  description: string;
  video?: string;
  poster?: string;
  material?: string;
  materialPreview?: string;
  questions?: ExamQuestion[];
}

export interface CourseSection {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface CourseComment {
  id: string;
  name: string;
  date: string;
  text: string;
  avatar?: string;
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  image: string;
  duration: string;
  language: string;
  students: number;
  level: string;
  sections: CourseSection[];
  initialCompleted: string[];
  initialLessonId: string;
  comments: CourseComment[];
}

export interface ExamAttempt {
  answers: Record<string, number>;
  position: number;
  submitted: boolean;
}

export interface CourseProgress {
  completedIds: string[];
  lessonId: string;
  questionDraft: string;
  exams: Record<string, ExamAttempt>;
  comments: CourseComment[];
}

export type CourseStatus = "Not started" | "In progress" | "Completed";
