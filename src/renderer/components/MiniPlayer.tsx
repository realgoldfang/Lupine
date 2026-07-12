import React from 'react';
import type { PodcastEpisode } from '../types';

interface MiniPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentEpisode: PodcastEpisode | null;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onExpand: () => void;
}

export function MiniPlayer({
  isPlaying,
  currentTime,
  duration,
  currentEpisode,
  onTogglePlay,
  onSeek,
  onExpand,
}: MiniPlayerProps) {
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mini-player" onClick={onExpand}>
      {currentEpisode?.image && (
        <img src={currentEpisode.image} alt="" className="mini-player-image" />
      )}
      <div className="mini-player-info">
        <span className="mini-player-title">{currentEpisode?.title || 'No episode'}</span>
        <div className="mini-player-progress">
          <div className="mini-player-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <button
        className="mini-player-btn"
        onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
}
