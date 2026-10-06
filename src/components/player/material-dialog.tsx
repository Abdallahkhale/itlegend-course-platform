"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { Check, ExternalLink } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import type { Lesson } from "@/types/course";

const noSubscription = () => () => {};

export function MaterialDialog({ open, onClose, lesson, completed, onComplete }: { open: boolean; onClose: () => void; lesson: Lesson | null; completed: boolean; onComplete: () => void }) {
  const supportsNativeViewer = useSyncExternalStore(noSubscription, () => navigator.pdfViewerEnabled ?? false, () => true);
  return (
    <Dialog open={open} onClose={onClose} title="Course Material" fullscreen className="material-dialog" actions={<><button className="button button-outline compact-button" type="button" onClick={onComplete} disabled={completed}>{completed ? <><Check size={16} />Completed</> : "Mark complete"}</button><a className="button button-outline compact-button" href={lesson?.material} target="_blank" rel="noreferrer" aria-label="Open PDF in a new tab"><ExternalLink size={17} /><span>Open PDF</span></a></>}>
      <p className="material-viewer-title">{lesson?.title}</p>
      {open && lesson?.material && (supportsNativeViewer || !lesson.materialPreview ? <iframe className="pdf-frame" src={`${lesson.material}#view=FitH`} title={`${lesson.title} PDF workbook`} /> : <div className="pdf-page-preview"><Image src={lesson.materialPreview} width={794} height={1123} alt="SEO Practice Workbook: a one-page guide for planning a useful page, checking search intent, and reviewing its content." sizes="(max-width: 794px) 100vw, 794px" /></div>)}
      <p className="pdf-fallback">Preview unavailable? <a href={lesson?.material} target="_blank" rel="noreferrer">Open the PDF in a new tab</a> or <a href={lesson?.material} download>download the workbook</a>.</p>
    </Dialog>
  );
}
