"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, UserRound } from "lucide-react";
import type { CourseComment } from "@/types/course";

export function Comments({ comments, onAdd }: { comments: CourseComment[]; onAdd: (comment: CourseComment) => void }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) { setError("Write a comment before submitting."); setMessage(""); return; }
    onAdd({ id: `comment-${crypto.randomUUID()}`, name: "You", date: new Date().toISOString().slice(0, 10), text: text.trim() });
    setText(""); setError(""); setMessage("Your comment has been added.");
  }
  return (
    <section id="comments" className="comments-section" aria-labelledby="comments-title" tabIndex={-1}>
      <h2 id="comments-title">Comments</h2>
      <ol className="comment-list">{comments.map((comment) => <li key={comment.id} className="comment">
        {comment.avatar ? <Image className="comment-avatar" src={comment.avatar} alt="" width={54} height={54} /> : <span className="comment-avatar generated-avatar"><UserRound size={24} aria-hidden="true" /></span>}
        <div className="comment-content"><h3>{comment.name}</h3><time dateTime={comment.date}>{new Date(`${comment.date}T12:00:00`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</time><p>{comment.text}</p></div>
      </li>)}</ol>
      <form className="comment-form" onSubmit={submit} noValidate>
        <label htmlFor="comment-text">Write a Comment</label>
        <textarea id="comment-text" placeholder="Write your comment" maxLength={2000} value={text} onChange={(event) => { setText(event.target.value); setError(""); setMessage(""); }} aria-describedby={error ? "comment-error" : undefined} aria-invalid={!!error} />
        {error && <p className="form-error" id="comment-error" role="alert">{error}</p>}
        <button type="submit" className="button button-primary">Submit Review <ArrowRight size={17} aria-hidden="true" /></button>
        <p className="form-status" role="status">{message}</p>
      </form>
    </section>
  );
}
