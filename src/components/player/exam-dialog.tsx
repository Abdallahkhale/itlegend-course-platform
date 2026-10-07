"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { Check, Clock3, RotateCcw } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { advanceExamTimer, examDurationSeconds } from "@/lib/progress-state";
import type { ExamAttempt, ExamAttemptUpdate, Lesson } from "@/types/course";

const emptyAttempt: ExamAttempt = { answers: {}, position: 0, submitted: false };

type SwipeGesture = {
  card: HTMLDivElement;
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  position: number;
  width: number;
  intent: "pending" | "horizontal" | "vertical";
};

function clearGesture(gesture: { current: SwipeGesture | null }) {
  gesture.current = null;
}

function timeLabel(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ExamDialog({ open, onClose, lesson, attempt = emptyAttempt, onUpdate, onComplete }: { open: boolean; onClose: () => void; lesson: Lesson | null; attempt?: ExamAttempt; onUpdate: (change: ExamAttemptUpdate) => void; onComplete: () => void }) {
  const [error, setError] = useState("");
  const gesture = useRef<SwipeGesture | null>(null);
  const touchPointers = useRef(new Set<number>());
  const blockedTouch = useRef(false);
  const suppressDragClick = useRef(false);
  const questions = lesson?.questions ?? [];
  const question = questions[attempt.position];
  const durationSeconds = examDurationSeconds(lesson?.duration);
  const remainingSeconds = attempt.remainingSeconds ?? durationSeconds;
  const expired = remainingSeconds === 0;
  const score = questions.filter((item) => attempt.answers[item.id] === item.answer).length;
  const answered = questions.filter((item) => attempt.answers[item.id] !== undefined).length;

  useEffect(() => {
    const pointers = touchPointers.current;
    clearGesture(gesture);
    pointers.clear();
    blockedTouch.current = false;
    suppressDragClick.current = false;
    if (!open || attempt.submitted) return;

    // Watch the whole dialog/document: a second finger can land outside the card.
    function trackTouch(event: PointerEvent) {
      if (event.pointerType !== "touch") return;
      if (gesture.current?.pointerType === "mouse") clearGesture(gesture);
      pointers.add(event.pointerId);
      if (pointers.size > 1) {
        blockedTouch.current = true;
        clearGesture(gesture);
        suppressDragClick.current = true;
      }
    }
    function releasePointer(event: PointerEvent) {
      const current = gesture.current;
      // Pending/vertical mouse drags have no capture and can end outside the card.
      if (current?.pointerId === event.pointerId && (event.type === "pointercancel"
        || !(event.target instanceof Node) || !current.card.contains(event.target))) clearGesture(gesture);
      if (event.pointerType !== "touch") return;
      pointers.delete(event.pointerId);
      if (!pointers.size) blockedTouch.current = false;
    }
    function resetGesture() {
      clearGesture(gesture);
      pointers.clear();
      blockedTouch.current = false;
      suppressDragClick.current = false;
    }
    function preventMouseSelection(event: Event) {
      const current = gesture.current;
      // Cancelling selectstart avoids native text dragging without changing touch selection.
      if (current?.pointerType === "mouse" && event.target instanceof Node && current.card.contains(event.target)) event.preventDefault();
    }
    document.addEventListener("pointerdown", trackTouch, true);
    document.addEventListener("pointerup", releasePointer, true);
    document.addEventListener("pointercancel", releasePointer, true);
    document.addEventListener("selectstart", preventMouseSelection, true);
    window.addEventListener("blur", resetGesture);
    return () => {
      document.removeEventListener("pointerdown", trackTouch, true);
      document.removeEventListener("pointerup", releasePointer, true);
      document.removeEventListener("pointercancel", releasePointer, true);
      document.removeEventListener("selectstart", preventMouseSelection, true);
      window.removeEventListener("blur", resetGesture);
      resetGesture();
    };
  }, [open, lesson?.id, attempt.submitted]);

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
    clearGesture(gesture);
    setError("");
    onUpdate((previous) => ({ ...(previous ?? emptyAttempt), position }));
  }

  function startSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || blockedTouch.current) return;
    if (gesture.current && gesture.current.pointerId !== event.pointerId) {
      clearGesture(gesture);
      suppressDragClick.current = true;
      return;
    }
    suppressDragClick.current = false;
    gesture.current = {
      card: event.currentTarget,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      position: attempt.position,
      width: event.currentTarget.clientWidth,
      intent: "pending",
    };
  }

  function moveSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (event.pointerType !== "touch" && !(event.buttons & 1)) {
      clearGesture(gesture);
      return;
    }
    const horizontal = Math.abs(event.clientX - current.startX);
    const vertical = Math.abs(event.clientY - current.startY);
    if (current.intent === "pending" && Math.max(horizontal, vertical) >= 12) {
      if (horizontal > vertical * 1.5) {
        current.intent = "horizontal";
        suppressDragClick.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      } else if (vertical >= horizontal) {
        current.intent = "vertical";
      }
    }
    if (current.intent === "horizontal") event.preventDefault();
  }

  function finishSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    clearGesture(gesture);
    if (current.intent !== "horizontal") return;
    suppressDragClick.current = true;
    const distance = event.clientX - current.startX;
    const vertical = Math.abs(event.clientY - current.startY);
    if (!open || attempt.submitted || current.position !== attempt.position
      || Math.abs(distance) < Math.max(48, current.width * 0.15)
      || Math.abs(distance) <= vertical * 1.5) return;
    const position = Math.max(0, Math.min(questions.length - 1, current.position + (distance < 0 ? 1 : -1)));
    if (position !== current.position) navigate(position);
  }

  function cancelSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    if (gesture.current?.pointerId === event.pointerId) clearGesture(gesture);
    suppressDragClick.current = false;
  }

  function suppressSwipeClick(event: MouseEvent<HTMLDivElement>) {
    if (!suppressDragClick.current || event.detail === 0) return;
    // Pointer capture/default cancellation alone does not suppress the final click.
    suppressDragClick.current = false;
    event.preventDefault();
    event.stopPropagation();
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
          {/* Indexed keys keep the four controlled answer slots mounted across question changes. */}
          {question && <div className="exam-card" onPointerDown={startSwipe} onPointerMove={moveSwipe} onPointerUp={finishSwipe} onPointerCancel={cancelSwipe} onLostPointerCapture={(event) => { if (event.target === event.currentTarget && gesture.current?.pointerId === event.pointerId) clearGesture(gesture); }} onClickCapture={suppressSwipeClick}><span className="sr-only">Question {attempt.position + 1} of {questions.length}</span><fieldset><legend><span className="exam-number">{attempt.position + 1}.</span>{question.prompt}</legend><div className="exam-choices">{question.choices.map((choice, index) => <label key={index} className={attempt.answers[question.id] === index ? "is-selected" : ""}><input type="radio" name={`exam-${question.id}`} value={index} checked={attempt.answers[question.id] === index} onChange={() => { setError(""); onUpdate((previous) => { const current = previous ?? emptyAttempt; return { ...current, answers: { ...current.answers, [question.id]: index } }; }); }} /><span>{choice}</span></label>)}</div></fieldset><p className="exam-swipe-hint">Swipe or drag left for next, right for previous, or choose a number above.</p>{attempt.position === questions.length - 1 && <div className="exam-bottom"><button className="button exam-primary" type="button" onClick={submit}>Submit Exam</button></div>}{error && <p className="form-error" role="alert">{error}</p>}{expired && <p className="exam-time-note" role="status">Practice time is up. You can still finish and submit your answers.</p>}<p className="exam-saved">Your answers and practice timer are kept when you close this exam. The timer pauses while it is closed.</p></div>}
        </>}
      </div>
    </Dialog>
  );
}
