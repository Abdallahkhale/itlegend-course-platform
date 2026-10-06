import type { Course, CourseSection, ExamQuestion, Lesson } from "@/types/course";

const video = "/videos/lesson-demo.mp4";
const poster = "/images/course-player.webp";

const seoQuestions: ExamQuestion[] = [
  { id: "intent", prompt: "What is the best starting point for a useful SEO page?", choices: ["Adding as many keywords as possible", "Understanding the searcher’s intent", "Buying links", "Hiding text from readers"], answer: 1, explanation: "A helpful page answers the question its audience is trying to solve." },
  { id: "title", prompt: "Which title is most useful for a page about beginner SEO?", choices: ["Home", "Click here", "A beginner’s guide to SEO", "SEO SEO SEO"], answer: 2, explanation: "A clear, descriptive title tells readers what they can expect." },
  { id: "links", prompt: "What is a good reason to add an internal link?", choices: ["To help readers find a related useful page", "To repeat every keyword", "To replace the page’s content", "To hide the navigation"], answer: 0, explanation: "Internal links connect related resources and help people explore a website." },
  { id: "measure", prompt: "What should you measure to understand whether a page is helpful?", choices: ["Only the length of its title", "The number of colors used", "Search traffic and meaningful visitor actions", "How often the logo appears"], answer: 2, explanation: "Measure relevant traffic and whether visitors can complete their intended task." },
  { id: "improve", prompt: "How should you improve an existing article?", choices: ["Remove its useful examples", "Make every heading identical", "Add unrelated trending topics", "Check its accuracy and answer missing questions"], answer: 3, explanation: "Keep information accurate and add details that help the reader." },
];

function lesson(id: string, title: string, description: string, duration = "08:24"): Lesson {
  return { id, title, kind: "video", duration, description, video, poster, material: "/materials/seo-workbook.pdf" };
}

const seoSections: CourseSection[] = [
  {
    id: "week-1", title: "Week 1-4", description: "Advanced story telling techniques for writers: Personas, Characters & Plots",
    lessons: [
      lesson("introduction", "Introduction", "Meet your instructor and discover how this course will help you build a practical foundation in search engine optimization."),
      lesson("overview", "Course Overview", "Explore the course structure, learning goals, and the simple tools you will use to get started with SEO.", "10:18"),
      { id: "overview-exam", title: "Course Overview", kind: "exam", duration: "10 MINUTES", description: "Check your understanding before moving on to the next lessons.", questions: seoQuestions.slice(0, 3) },
      { id: "reference-files", title: "Course Exercise / Reference Files", kind: "pdf", duration: "PDF", description: "Use this workbook to plan your first useful page and record your keyword research.", material: "/materials/seo-workbook.pdf", materialPreview: "/images/seo-workbook-preview.webp" },
      lesson("editor", "Code Editor Installation (Optional if you have one)", "Set up a comfortable workspace, install an editor, and organize the files for your practice website.", "06:45"),
      lesson("embedding", "Embedding PHP in HTML", "Understand how a document is structured and how search engines read the content of a page.", "12:36"),
    ],
  },
  {
    id: "week-2", title: "Week 5-8", description: "Advanced story telling techniques for writers: Personas, Characters & Plots",
    lessons: [
      lesson("functions", "Defining Functions", "Break a repeatable task into clear steps and connect those steps to a useful workflow.", "09:12"),
      lesson("parameters", "Function Parameters", "Learn how specific inputs help you create more useful, relevant content for your audience.", "07:56"),
      { id: "functions-exam", title: "Return Values From Functions", kind: "exam", duration: "15 MINUTES", description: "Put the ideas from this section into practice with a short knowledge check.", questions: seoQuestions },
      lesson("scope", "Global Variable and Scope", "Organize information so that each page has a clear purpose and is easy to understand.", "11:20"),
      lesson("constant", "Newer Way of creating a Constant", "Create a consistent system for page titles, descriptions, and links across your website.", "08:40"),
      lesson("constants", "Constants", "Review what you have learned and plan the next improvements to your website.", "05:32"),
    ],
  },
];

const comments = [
  { id: "comment-1", name: "Edward Norton", date: "2026-09-12", text: "Thanks for explaining the basics so clearly. The practical examples made it much easier to get started.", avatar: "/images/comment-01.webp" },
  { id: "comment-2", name: "David Owens", date: "2026-09-14", text: "A really helpful introduction. I’m looking forward to putting these ideas into practice on my own website.", avatar: "/images/comment-02.webp" },
  { id: "comment-3", name: "Sarah Taylor", date: "2026-09-17", text: "The course materials are great to keep beside you while following the lessons. Thank you!", avatar: "/images/comment-03.webp" },
];

interface CourseSeed { slug: string; title: string; description: string; instructor: string; category: string; image: string; topics: string[]; completed: number; }

function makeCourse(seed: CourseSeed): Course {
  const items = seed.topics.map((title, index) => lesson(`${seed.slug}-${index + 1}`, title, `In this lesson, ${seed.instructor} walks you through ${title.toLowerCase()} with a practical example you can try yourself.`, `${String(7 + index).padStart(2, "0")}:${index % 2 ? "35" : "12"}`));
  items.splice(items.length - 1, 0, { id: `${seed.slug}-workbook`, title: "Course Exercise / Reference Files", kind: "pdf", duration: "PDF", description: "Download the practice workbook and apply the ideas from the lessons.", material: "/materials/seo-workbook.pdf", materialPreview: "/images/seo-workbook-preview.webp" });
  items.push({ id: `${seed.slug}-exam`, title: "Final Knowledge Check", kind: "exam", duration: "10 MINUTES", description: "Review the key ideas and check your understanding.", questions: seoQuestions });
  const split = Math.ceil(items.length / 2);
  const completed = items.slice(0, seed.completed).map((item) => item.id);
  return {
    ...seed, duration: "3 weeks", language: "English", students: 65, level: "All levels",
    sections: [
      { id: "foundations", title: "Week 1-2", description: "Build a strong foundation with practical lessons and examples.", lessons: items.slice(0, split) },
      { id: "practice", title: "Week 3-4", description: "Put your new skills into practice and check your understanding.", lessons: items.slice(split) },
    ],
    initialCompleted: completed, initialLessonId: items[Math.min(seed.completed, items.length - 1)].id, comments,
  };
}

export const courses: Course[] = [
  {
    slug: "starting-seo", title: "Starting SEO as your Home Based Business", description: "Learn the foundations of search engine optimization and take the first steps toward building your own business.", instructor: "Edward Norton", category: "Digital marketing", image: "/images/seo-course.webp", duration: "3 weeks", language: "English", students: 65, level: "Beginner", sections: seoSections,
    initialCompleted: ["introduction", "overview", "overview-exam", "reference-files", "editor", "embedding", "functions"], initialLessonId: "parameters", comments,
  },
  makeCourse({ slug: "web-development", title: "The Complete Web Development Journey", description: "Build responsive websites with HTML, CSS, and modern JavaScript.", instructor: "Sarah Taylor", category: "Development", image: "/images/web-course.webp", topics: ["Welcome to the Web", "Your First HTML Page", "Styling with CSS", "Responsive Layouts", "JavaScript Essentials", "Building Your First Website"], completed: 0 }),
  makeCourse({ slug: "ui-design", title: "User Interface Design Essentials", description: "Create thoughtful interfaces with strong typography, layout, and accessible colors.", instructor: "David Owens", category: "Design", image: "/images/design-course.webp", topics: ["Introduction to Interface Design", "Layout and Visual Hierarchy", "Working with Typography", "Color and Accessibility", "Designing Reusable Components", "From Wireframe to Prototype"], completed: 3 }),
  makeCourse({ slug: "digital-marketing", title: "Digital Marketing for Small Businesses", description: "Find your audience and build a practical marketing plan for your business.", instructor: "Edward Norton", category: "Marketing", image: "/images/marketing-course.webp", topics: ["Meet Your Audience", "A Clear Marketing Message", "Choosing Your Channels", "Content that Helps", "Measuring Your Results"], completed: 0 }),
  makeCourse({ slug: "javascript", title: "JavaScript: From Fundamentals to Confident Problem Solving", description: "Understand the language, work with data, and bring your ideas to life in the browser.", instructor: "Sarah Taylor", category: "Development", image: "/images/javascript-course.webp", topics: ["Getting Started with JavaScript", "Variables and Data Types", "Functions and Scope", "Working with Arrays", "Objects and the DOM", "Asynchronous JavaScript", "Putting It All Together"], completed: 5 }),
  makeCourse({ slug: "content-writing", title: "Content Writing that Connects", description: "Turn your ideas into clear, useful stories that your audience wants to read.", instructor: "David Owens", category: "Writing", image: "/images/writing-course.webp", topics: ["Writing for Your Reader", "Finding a Strong Idea", "Structuring Your Story", "Editing for Clarity"], completed: 6 }),
];

export function getLessons(course: Course) {
  return course.sections.flatMap((section) => section.lessons);
}

export const leaderboard = [
  { name: "Ahmed Hassan", points: 1250, avatar: "/images/comment-01.webp" },
  { name: "Sara Ahmed", points: 1180, avatar: "/images/comment-02.webp" },
  { name: "Mohamed Ali", points: 1090, avatar: "/images/comment-03.webp" },
  { name: "You", points: 840 },
];
