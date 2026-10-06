"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";

export function QuestionDialog({ open, onClose, lessonTitle, draft, onDraftChange }: { open: boolean; onClose: () => void; lessonTitle: string; draft: string; onDraftChange: (value: string) => void }) {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title="Ask a Question" className="question-dialog">
      <form className="dialog-body" noValidate onSubmit={(event) => { event.preventDefault(); if (!draft.trim()) { setError("Write your question before submitting."); return; } setError(""); setSent(true); }}>
        <p className="dialog-context">About: <strong>{lessonTitle}</strong></p>
        <label htmlFor="question-draft">Your question</label>
        <textarea id="question-draft" value={draft} maxLength={2000} placeholder="What would you like to ask?" onChange={(event) => { onDraftChange(event.target.value); setError(""); setSent(false); }} aria-invalid={!!error} aria-describedby={error ? "question-error" : "question-note"} />
        <p id="question-note" className="dialog-note">Your draft is saved on this device, so you can come back to it.</p>
        {error && <p id="question-error" className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit">Submit Question</button>
        {sent && <p className="form-status" role="status">Question saved. This demo keeps your question on this device.</p>}
      </form>
    </Dialog>
  );
}
