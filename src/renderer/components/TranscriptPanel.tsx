import React, { useEffect, useRef } from 'react';
import type { TranscriptCue } from '../types';

interface TranscriptPanelProps {
  cues: TranscriptCue[];
  currentTime: number;
  onSeek: (time: number) => void;
  onClose: () => void;
}

export function TranscriptPanel({ cues, currentTime, onSeek, onClose }: TranscriptPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeIndex = cues.findIndex((cue, i) => {
    const next = cues[i + 1];
    return currentTime >= cue.startTime && (!next || currentTime < next.startTime);
  });

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.children[activeIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>📝 Transcript</h3>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      <div className="panel-content transcript-scroll" ref={listRef}>
        {cues.length === 0 ? (
          <p className="panel-empty">No transcript available</p>
        ) : (
          cues.map((cue, i) => (
            <div
              key={i}
              className={`transcript-cue ${i === activeIndex ? 'active' : ''}`}
              onClick={() => onSeek(cue.startTime)}
            >
              <span className="cue-time">{formatTime(cue.startTime)}</span>
              <span className="cue-text">{cue.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
