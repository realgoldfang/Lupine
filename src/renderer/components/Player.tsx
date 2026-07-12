import React from 'react';
import type { PodcastEpisode, PodcastFeed } from '../types';
import { SleepTimer } from './SleepTimer';

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
  updateDownloaded?: boolean;
  onInstallUpdate?: () => void;
  sleepTimer: {
    remaining: number;
    formatRemaining: () => string;
    setMinutes: (min: number | null) => void;
    cancel: () => void;
  };
  onShowAbout: () => void;
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
  updateDownloaded,
  onInstallUpdate,
  sleepTimer,
  onShowAbout,
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
          <button className="player-about-btn" onClick={onShowAbout}>About</button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="player">
      {updateAvailable && !updateDownloaded && (
        <div className="update-banner">
          <span>🔄 Update downloading...</span>
        </div>
      )}
      {updateDownloaded && (
        <div className="update-banner">
          <span>✅ Update ready to install</span>
          <button onClick={onInstallUpdate}>Restart & Install</button>
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
        <SleepTimer
          remaining={sleepTimer.remaining}
          formatRemaining={sleepTimer.formatRemaining}
          onSetMinutes={sleepTimer.setMinutes}
          onCancel={sleepTimer.cancel}
        />
        <div className="player-feature-btns">
          {currentEpisode.chapters && (
            <button className="player-feature-btn" onClick={onShowChapters} title="Chapters">
              📑
            </button>
          )}
          {currentEpisode.transcripts.length > 0 && (
            <button className="player-feature-btn" onClick={onShowTranscript} title="Transcript">
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
        <button className="player-about-btn" onClick={onShowAbout} title="About Lupine">
          ℹ
        </button>
      </div>
    </footer>
  );
}
