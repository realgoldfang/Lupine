import React from 'react';
import type { PodcastEpisode, PodcastFeed } from '../types';

interface PlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  currentEpisode: PodcastEpisode | null;
  currentFeed: PodcastFeed | null;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSetVolume: (vol: number) => void;
  onSetPlaybackRate: (rate: number) => void;
  onNext: () => void;
  onShowChapters: () => void;
  onShowTranscript: () => void;
  onShowValue: () => void;
  updateAvailable?: boolean;
  onInstallUpdate?: () => void;
}

export function Player({
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  currentEpisode,
  currentFeed,
  onTogglePlay,
  onSeek,
  onSetVolume,
  onSetPlaybackRate,
  onNext,
  onShowChapters,
  onShowTranscript,
  onShowValue,
  updateAvailable,
  onInstallUpdate,
}: PlayerProps) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(percent * duration);
  };

  if (!currentEpisode) {
    return (
      <footer className="player player-empty">
        <div className="player-content">
          <span className="player-no-episode">No episode selected</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="player">
      {updateAvailable && (
        <div className="update-banner">
          <span>🔄 Update available!</span>
          <button onClick={onInstallUpdate}>Install Now</button>
        </div>
      )}
      <div className="player-info">
        {currentEpisode.image && (
          <img src={currentEpisode.image} alt="" className="player-image" />
        )}
        <div className="player-text">
          <span className="player-episode-title">{currentEpisode.title}</span>
          {currentFeed && <span className="player-feed-title">{currentFeed.title}</span>}
        </div>
      </div>

      <div className="player-controls">
        <button className="player-btn player-btn-secondary" onClick={onNext}>
          ⏭
        </button>
        <button className="player-btn player-btn-play" onClick={onTogglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className="player-progress-container">
          <span className="player-time">{formatTime(currentTime)}</span>
          <div className="player-progress" onClick={handleProgressClick}>
            <div
              className="player-progress-fill"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-extra">
        <div className="player-feature-btns">
          {currentEpisode.chapters && (
            <button className="player-feature-btn" onClick={onShowChapters} title="Chapters (C)">
              📑
            </button>
          )}
          {currentEpisode.transcripts.length > 0 && (
            <button className="player-feature-btn" onClick={onShowTranscript} title="Transcript (T)">
              📝
            </button>
          )}
          {(currentEpisode.value || currentFeed?.value) && (
            <button className="player-feature-btn" onClick={onShowValue} title="Value for Value">
              ⚡
            </button>
          )}
        </div>
        <div className="player-volume">
          <span>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onSetVolume(parseFloat(e.target.value))}
          />
        </div>
        <select
          className="player-speed"
          value={playbackRate}
          onChange={(e) => onSetPlaybackRate(parseFloat(e.target.value))}
        >
          <option value="0.5">0.5x</option>
          <option value="0.75">0.75x</option>
          <option value="1">1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>
    </footer>
  );
}
