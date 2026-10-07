import { withBasePath } from "@/lib/paths";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <p className="eyebrow">404</p>
      <h1>Course not found</h1>
      <p>This course isn’t available. Choose another course and keep learning.</p>
      <a className="button button-primary" href={withBasePath("/courses/")}>Browse courses</a>
    </main>
  );
}
