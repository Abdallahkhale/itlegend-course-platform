"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "./icon-button";

interface DialogProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; fullscreen?: boolean; className?: string; actions?: React.ReactNode; }

export function Dialog({ open, onClose, title, children, fullscreen = false, className = "", actions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open]);

  function trapTab(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')).filter((element) => !element.matches(':disabled, [hidden], [aria-hidden="true"]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) { event.preventDefault(); event.currentTarget.focus(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return (
    <dialog ref={ref} className={`dialog ${fullscreen ? "dialog-fullscreen" : ""} ${className}`} aria-labelledby={`${titleId}-dialog-title`} onKeyDown={trapTab} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (!fullscreen && event.target === event.currentTarget) onClose(); }}>
      <header className="dialog-header"><h2 id={`${titleId}-dialog-title`}>{title}</h2><div className="dialog-header-actions">{actions}<IconButton label={`Close ${title.toLowerCase()}`} onClick={onClose}><X size={23} /></IconButton></div></header>
      {children}
    </dialog>
  );
}
