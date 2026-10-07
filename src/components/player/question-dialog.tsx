"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

export function QuestionDialog({ open, onClose, lessonTitle, draft, onDraftChange }: { open: boolean; onClose: () => void; lessonTitle: string; draft: string; onDraftChange: (value: string) => void }) {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title="Ask a Question" className="question-dialog">
      <form className="dialog-body comment-form" noValidate onSubmit={(event) => { event.preventDefault(); if (!draft.trim()) { setError("Write your question before submitting."); return; } setError(""); setSent(true); }}>
        <p className="dialog-context">About: <strong>{lessonTitle}</strong></p>
        <label htmlFor="question-draft">Your question</label>
        <textarea id="question-draft" value={draft} maxLength={2000} placeholder="What would you like to ask?" onChange={(event) => { onDraftChange(event.target.value); setError(""); setSent(false); }} aria-invalid={!!error} aria-describedby={error ? "question-error" : "question-note"} />
        {error && <p id="question-error" className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Submit Question <ArrowRight size={17} aria-hidden="true" /></button>
        <p id="question-note" className="dialog-note">Your draft stays here when you close and reopen this question.</p>
        {sent && <p className="form-status" role="status">Question saved. This demo keeps your question on this device.</p>}
      </form>
    </Dialog>
  );
}
