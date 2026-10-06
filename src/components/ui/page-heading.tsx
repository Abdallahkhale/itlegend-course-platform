import { ChevronRight } from "lucide-react";

export function PageHeading({ title, details = false }: { title: string; details?: boolean }) {
  return (
    <header className="page-heading">
      <div className="container">
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          <a href="/">Home</a><ChevronRight aria-hidden="true" size={16} />
          {details ? <><a href="/courses/">Courses</a><ChevronRight aria-hidden="true" size={16} /><span aria-current="page">Course Details</span></> : <span aria-current="page">Courses</span>}
        </nav>
        <h1>{title}</h1>
      </div>
    </header>
  );
}
