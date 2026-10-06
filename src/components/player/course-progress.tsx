"use client";

import { useEffect, useRef, useState } from "react";

export function CourseProgress({ percentage, completed, total }: { percentage: number; completed: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.2 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="course-progress-block">
      <h2>Topics For This Course</h2>
      <div className="course-progress-label"><span>You</span><strong>{percentage}%</strong></div>
      <div className={`progress-track ${visible ? "is-visible" : ""}`} role="progressbar" aria-label="Course completion" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${completed} of ${total} lessons complete`}><span style={{ width: visible ? `${percentage}%` : "0%" }} /></div>
      <p>{completed} of {total} lessons completed</p>
    </div>
  );
}
