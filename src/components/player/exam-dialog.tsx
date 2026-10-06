"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock3, RotateCcw } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import type { ExamAttempt, Lesson } from "@/types/course";

const emptyAttempt: ExamAttempt = { answers: {}, position: 0, submitted: false };

export function ExamDialog({ open, onClose, lesson, attempt = emptyAttempt, onUpdate, onComplete }: { open: boolean; onClose: () => void; lesson: Lesson | null; attempt?: ExamAttempt; onUpdate: (attempt: ExamAttempt) => void; onComplete: () => void }) {
  const [error, setError] = useState("");
  const questions = lesson?.questions ?? [];
  const question = questions[attempt.position];
  const score = questions.filter((item) => attempt.answers[item.id] === item.answer).length;
  const answered = questions.filter((item) => attempt.answers[item.id] !== undefined).length;
  function navigate(position: number) { setError(""); onUpdate({ ...attempt, position }); }
  function submit() {
    if (answered < questions.length) { setError("Answer every question before submitting."); return; }
    setError(""); onUpdate({ ...attempt, submitted: true }); onComplete();
  }
  return (
    <Dialog open={open} onClose={onClose} title="Course Exam" fullscreen className="exam-dialog">
      <div className="exam-shell">
        <div className="exam-top"><span className="exam-duration"><Clock3 size={17} aria-hidden="true" />{lesson?.duration.toLowerCase()}</span><p>{lesson?.title}</p></div>
        {attempt.submitted ? <div className="exam-result"><div className="exam-result-icon"><Check size={42} aria-hidden="true" /></div><h3>Exam complete</h3><p>You answered <strong>{score} of {questions.length}</strong> questions correctly.</p><div className="exam-answer-review">{questions.map((item, index) => <div key={item.id}><h4>{index + 1}. {item.prompt}</h4><p className={attempt.answers[item.id] === item.answer ? "answer-correct" : "answer-incorrect"}>{attempt.answers[item.id] === item.answer ? "Correct" : `Correct answer: ${item.choices[item.answer]}`}</p><p>{item.explanation}</p></div>)}</div><button className="button button-primary" type="button" onClick={() => { setError(""); onUpdate({ answers: {}, position: 0, submitted: false }); }}><RotateCcw size={17} aria-hidden="true" />Try again</button></div> : <>
          <nav className="exam-question-nav" aria-label="Exam questions">{questions.map((item, index) => <button key={item.id} type="button" className={`${index === attempt.position ? "is-active" : ""} ${attempt.answers[item.id] !== undefined ? "is-answered" : ""}`} aria-label={`Question ${index + 1}${attempt.answers[item.id] !== undefined ? ", answered" : ""}`} aria-current={index === attempt.position ? "step" : undefined} onClick={() => navigate(index)}>{index + 1}</button>)}</nav>
          {question && <div className="exam-card"><span className="exam-position">Question {attempt.position + 1} of {questions.length}</span><fieldset><legend>{question.prompt}</legend><div className="exam-choices">{question.choices.map((choice, index) => <label key={choice} className={attempt.answers[question.id] === index ? "is-selected" : ""}><input type="radio" name={`exam-${question.id}`} value={index} checked={attempt.answers[question.id] === index} onChange={() => { setError(""); onUpdate({ ...attempt, answers: { ...attempt.answers, [question.id]: index } }); }} /><span>{choice}</span></label>)}</div></fieldset><div className="exam-bottom"><button className="button button-outline" type="button" disabled={attempt.position === 0} onClick={() => navigate(attempt.position - 1)}><ChevronLeft size={17} />Previous</button>{attempt.position === questions.length - 1 ? <button className="button exam-primary" type="button" onClick={submit}>Submit Exam</button> : <button className="button exam-primary" type="button" onClick={() => navigate(attempt.position + 1)}>Next<ChevronRight size={17} /></button>}</div>{error && <p className="form-error" role="alert">{error}</p>}<p className="exam-saved">Your answers are saved. You can close this exam and return later.</p></div>}
        </>}
      </div>
    </Dialog>
  );
}
