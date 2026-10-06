"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, RectangleHorizontal, Volume2, VolumeX } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import type { Lesson } from "@/types/course";

function timeLabel(value: number) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

type SafariVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
type LockableOrientation = ScreenOrientation & { lock?: (orientation: "landscape") => Promise<void> };

export function VideoPlayer({ lesson, wide, pauseSignal, onWideChange, onEnded }: { lesson: Lesson; wide: boolean; pauseSignal: string; onWideChange: () => void; onEnded: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { const video = videoRef.current; video?.pause(); video?.load(); }, [lesson.id]);
  useEffect(() => { videoRef.current?.pause(); }, [pauseSignal]);
  useEffect(() => {
    const change = () => {
      const active = document.fullscreenElement === stageRef.current;
      setFullscreen(active);
      if (!active) screen.orientation?.unlock?.();
    };
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) { video.pause(); return; }
    try { await video.play(); setError(""); } catch { setError("Playback could not start. Please try again."); }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); return; }
      if (stageRef.current?.requestFullscreen) {
        await stageRef.current.requestFullscreen();
        if (window.matchMedia("(max-width: 767px)").matches) {
          try { await (screen.orientation as LockableOrientation)?.lock?.("landscape"); } catch { /* Orientation is optional and may be unavailable in this browser. */ }
        }
      } else if ((videoRef.current as SafariVideo)?.webkitEnterFullscreen) {
        (videoRef.current as SafariVideo).webkitEnterFullscreen?.();
      } else { setError("Fullscreen is not available in this browser."); }
    } catch { setError("Fullscreen could not open. You can continue watching here."); }
  }

  return (
    <div ref={stageRef} className={`video-stage ${started ? "has-started" : ""} ${fullscreen ? "is-fullscreen" : ""}`} data-testid="video-stage">
      <video ref={videoRef} src={lesson.video} poster={lesson.poster} playsInline preload="metadata" aria-label={`${lesson.title} lesson video`} onLoadStart={() => { setStarted(false); setDuration(0); setCurrentTime(0); setError(""); }} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onPlay={() => { setPlaying(true); setStarted(true); }} onPause={() => setPlaying(false)} onEnded={onEnded} onError={() => setError("This video could not load. Check your connection and try again.")} onVolumeChange={(event) => { setVolume(event.currentTarget.volume); setMuted(event.currentTarget.muted); }} onRateChange={(event) => setRate(event.currentTarget.playbackRate)}>
        <track kind="captions" src="/videos/demo-captions.vtt" srcLang="en" label="English" />
      </video>
      {!started && <button className="video-play-button" type="button" onClick={togglePlay} aria-label={`Play ${lesson.title}`}><Play fill="currentColor" size={26} strokeWidth={0} aria-hidden="true" /></button>}
      <div className="video-controls">
        <label className="video-seek-label"><span className="sr-only">Seek video</span><input type="range" min={0} max={Number.isFinite(duration) ? duration : 0} step="0.1" value={Math.min(currentTime, duration || 0)} disabled={!duration} onChange={(event) => { if (videoRef.current) videoRef.current.currentTime = Number(event.target.value); }} aria-valuetext={`${timeLabel(currentTime)} of ${timeLabel(duration)}`} /></label>
        <div className="video-control-row">
          <IconButton label={playing ? "Pause video" : "Play video"} onClick={togglePlay}>{playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</IconButton>
          <span className="video-time">{timeLabel(currentTime)} / {timeLabel(duration)}</span>
          <div className="video-volume"><IconButton label={muted || volume === 0 ? "Unmute video" : "Mute video"} onClick={() => { if (videoRef.current) { videoRef.current.muted = !videoRef.current.muted; if (videoRef.current.volume === 0) videoRef.current.volume = 1; } }}>{muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}</IconButton><label><span className="sr-only">Volume</span><input type="range" min={0} max={1} step="0.05" value={muted ? 0 : volume} onChange={(event) => { if (videoRef.current) { videoRef.current.volume = Number(event.target.value); videoRef.current.muted = false; } }} /></label></div>
          <button className="playback-rate" aria-label={`Playback speed ${rate}×. Change speed`} title="Change playback speed" type="button" onClick={() => { if (videoRef.current) { const rates = [1, 1.25, 1.5, 2]; videoRef.current.playbackRate = rates[(rates.indexOf(rate) + 1) % rates.length]; } }}>{rate}×</button>
          <IconButton className="wide-control" label={wide ? "Exit wide video mode" : "Enter wide video mode"} aria-pressed={wide} onClick={onWideChange}><RectangleHorizontal size={19} /></IconButton>
          <IconButton label={fullscreen ? "Exit fullscreen video" : "Fullscreen video"} onClick={toggleFullscreen}>{fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}</IconButton>
        </div>
      </div>
      {error && <div className="video-error" role="alert"><p>{error}</p><button type="button" onClick={() => { videoRef.current?.load(); setError(""); }}>Try again</button></div>}
    </div>
  );
}
