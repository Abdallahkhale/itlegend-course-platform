import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHeading({ title, details = false }: { title: string; details?: boolean }) {
  return (
    <header className="page-heading">
      <div className="container">
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          <Link href="/">Home</Link><ChevronRight aria-hidden="true" size={16} />
          {details ? <><Link href="/courses">Courses</Link><ChevronRight aria-hidden="true" size={16} /><span aria-current="page">Course Details</span></> : <span aria-current="page">Courses</span>}
        </nav>
        <h1>{title}</h1>
      </div>
    </header>
  );
}
