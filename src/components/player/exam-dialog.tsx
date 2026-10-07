"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock3, RotateCcw } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { advanceExamTimer, examDurationSeconds } from "@/lib/progress-state";
import type { ExamAttempt, ExamAttemptUpdate, Lesson } from "@/types/course";

const emptyAttempt: ExamAttempt = { answers: {}, position: 0, submitted: false };

function timeLabel(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ExamDialog({ open, onClose, lesson, attempt = emptyAttempt, onUpdate, onComplete }: { open: boolean; onClose: () => void; lesson: Lesson | null; attempt?: ExamAttempt; onUpdate: (change: ExamAttemptUpdate) => void; onComplete: () => void }) {
  const [error, setError] = useState("");
  const questions = lesson?.questions ?? [];
  const question = questions[attempt.position];
  const durationSeconds = examDurationSeconds(lesson?.duration);
  const remainingSeconds = attempt.remainingSeconds ?? durationSeconds;
  const expired = remainingSeconds === 0;
  const score = questions.filter((item) => attempt.answers[item.id] === item.answer).length;
  const answered = questions.filter((item) => attempt.answers[item.id] !== undefined).length;

  useEffect(() => {
    if (!open || !lesson?.questions || attempt.submitted || expired) return;
    onUpdate((previous) => advanceExamTimer(previous, 0, durationSeconds));
    let lastTick = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastTick) / 1000);
      if (!elapsed) return;
      lastTick += elapsed * 1000;
      // Read the store's latest attempt so a timer tick cannot overwrite new answers.
      onUpdate((previous) => advanceExamTimer(previous, elapsed, durationSeconds));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [open, lesson?.id, lesson?.questions, attempt.submitted, expired, durationSeconds, onUpdate]);

  function navigate(position: number) {
    setError("");
    onUpdate((previous) => ({ ...(previous ?? emptyAttempt), position }));
  }
  function submit() {
    if (answered < questions.length) { setError("Answer every question before submitting."); return; }
    setError("");
    onUpdate((previous) => ({ ...(previous ?? emptyAttempt), submitted: true }));
    onComplete();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Course Exam" fullscreen className="exam-dialog" headerVariant="back" actions={<span className="exam-duration" role="timer" aria-live="off" aria-label="Practice time remaining" data-remaining-seconds={remainingSeconds}><Clock3 size={17} aria-hidden="true" />{timeLabel(remainingSeconds)}</span>}>
      <div className="exam-shell">
        {attempt.submitted ? <div className="exam-result"><div className="exam-result-icon"><Check size={42} aria-hidden="true" /></div><h3>Exam complete</h3><p>You answered <strong>{score} of {questions.length}</strong> questions correctly.</p><div className="exam-answer-review">{questions.map((item, index) => <div key={item.id}><h4>{index + 1}. {item.prompt}</h4><p className={attempt.answers[item.id] === item.answer ? "answer-correct" : "answer-incorrect"}>{attempt.answers[item.id] === item.answer ? "Correct" : `Correct answer: ${item.choices[item.answer]}`}</p><p>{item.explanation}</p></div>)}</div><button className="button button-primary" type="button" onClick={() => { setError(""); onUpdate({ answers: {}, position: 0, submitted: false, remainingSeconds: durationSeconds }); }}><RotateCcw size={17} aria-hidden="true" />Try again</button></div> : <>
          <nav className="exam-question-nav" aria-label="Exam questions">{questions.map((item, index) => <button key={item.id} type="button" className={`${index === attempt.position ? "is-active" : ""} ${attempt.answers[item.id] !== undefined ? "is-answered" : ""}`} aria-label={`Question ${index + 1}${attempt.answers[item.id] !== undefined ? ", answered" : ""}`} aria-current={index === attempt.position ? "step" : undefined} onClick={() => navigate(index)}>{index + 1}</button>)}</nav>
          {question && <div className="exam-card"><span className="sr-only">Question {attempt.position + 1} of {questions.length}</span><fieldset><legend><span className="exam-number">{attempt.position + 1}.</span>{question.prompt}</legend><div className="exam-choices">{question.choices.map((choice, index) => <label key={choice} className={attempt.answers[question.id] === index ? "is-selected" : ""}><input type="radio" name={`exam-${question.id}`} value={index} checked={attempt.answers[question.id] === index} onChange={() => { setError(""); onUpdate((previous) => { const current = previous ?? emptyAttempt; return { ...current, answers: { ...current.answers, [question.id]: index } }; }); }} /><span>{choice}</span></label>)}</div></fieldset><div className="exam-bottom"><button className="button button-outline" type="button" disabled={attempt.position === 0} onClick={() => navigate(attempt.position - 1)}><ChevronLeft size={17} aria-hidden="true" />Previous</button>{attempt.position === questions.length - 1 ? <button className="button exam-primary" type="button" onClick={submit}>Submit Exam</button> : <button className="button exam-primary" type="button" onClick={() => navigate(attempt.position + 1)}>Next<ChevronRight size={17} aria-hidden="true" /></button>}</div>{error && <p className="form-error" role="alert">{error}</p>}{expired && <p className="exam-time-note" role="status">Practice time is up. You can still finish and submit your answers.</p>}<p className="exam-saved">Your answers and practice timer are kept when you close this exam. The timer pauses while it is closed.</p></div>}
        </>}
      </div>
    </Dialog>
  );
}
