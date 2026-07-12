import React from 'react';
import type { Chapter } from '../types';

interface ChapterPanelProps {
  chapters: Chapter[];
  currentTime: number;
  onSeek: (time: number) => void;
  onClose: () => void;
}

export function ChapterPanel({ chapters, currentTime, onSeek, onClose }: ChapterPanelProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const sortedChapters = [...chapters].sort((a, b) => a.startTime - b.startTime);
  const activeIndex = sortedChapters.findIndex((ch, i) => {
    const next = sortedChapters[i + 1];
    return currentTime >= ch.startTime && (!next || currentTime < next.startTime);
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>📑 Chapters</h3>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      <div className="panel-content">
        {chapters.length === 0 ? (
          <p className="panel-empty">No chapters available</p>
        ) : (
          <ul className="chapter-list">
            {sortedChapters.map((chapter, i) => (
              <li
                key={i}
                className={`chapter-item ${i === activeIndex ? 'active' : ''}`}
                onClick={() => onSeek(chapter.startTime)}
              >
                {chapter.img && <img src={chapter.img} alt="" className="chapter-img" />}
                <div className="chapter-info">
                  <span className="chapter-time">{formatTime(chapter.startTime)}</span>
                  <span className="chapter-title">{chapter.title}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
