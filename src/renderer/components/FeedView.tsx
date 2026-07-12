import React from 'react';
import type { PodcastFeed, PodcastEpisode } from '../types';

interface FeedViewProps {
  feed: PodcastFeed;
  onPlayEpisode: (episode: PodcastEpisode) => void;
  onSelectEpisode: (episode: PodcastEpisode) => void;
  onAddToQueue: (episode: PodcastEpisode) => void;
}

export function FeedView({ feed, onPlayEpisode, onSelectEpisode, onAddToQueue }: FeedViewProps) {
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="feed-view">
      <header className="feed-header">
        {feed.image && <img src={feed.image} alt="" className="feed-image" />}
        <div className="feed-info">
          <h1 className="feed-title">{feed.title}</h1>
          {feed.author && <p className="feed-author">{feed.author}</p>}
          {feed.description && (
            <p className="feed-description">{feed.description.substring(0, 200)}...</p>
          )}
          <div className="feed-meta">
            {feed.language && <span>{feed.language}</span>}
            {feed.medium && <span>{feed.medium}</span>}
            {feed.persons.length > 0 && (
              <span>{feed.persons.map((p) => p.name).join(', ')}</span>
            )}
          </div>
          {feed.funding && feed.funding.length > 0 && (
            <div className="feed-funding">
              {feed.funding.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="funding-link">
                  {f.text || 'Support'}
                </a>
              ))}
            </div>
          )}
          {feed.value && (
            <div className="feed-value-badge">
              ⚡ {feed.value.type} - {feed.value.recipients.length} recipients
            </div>
          )}
        </div>
      </header>

      <div className="episode-list">
        <h2 className="episode-list-title">Episodes ({feed.episodes.length})</h2>
        {feed.episodes.map((episode, i) => (
          <div key={episode.guid || i} className="episode-card">
            <div className="episode-card-main">
              {episode.image && <img src={episode.image} alt="" className="episode-card-image" />}
              <div className="episode-card-content">
                <div className="episode-card-header">
                  {episode.season && (
                    <span className="episode-badge">S{episode.season.number}</span>
                  )}
                  {episode.episode && (
                    <span className="episode-badge">E{episode.episode}</span>
                  )}
                  <h3 className="episode-card-title">{episode.title}</h3>
                </div>
                <div className="episode-card-meta">
                  {episode.pubDate && <span>{formatDate(episode.pubDate)}</span>}
                  {episode.duration && <span>{formatDuration(episode.duration)}</span>}
                  {episode.explicit && <span className="explicit-badge">E</span>}
                  {episode.chapters && <span>📑 Chapters</span>}
                  {episode.transcripts.length > 0 && <span>📝 Transcript</span>}
                  {episode.value && <span>⚡ V4V</span>}
                </div>
                {episode.description && (
                  <p className="episode-card-description">
                    {episode.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                )}
                <div className="episode-card-people">
                  {episode.persons.slice(0, 3).map((p, j) => (
                    <span key={j} className="person-chip">
                      {p.img && <img src={p.img} alt="" className="person-chip-img" />}
                      {p.name}
                      {p.role && <span className="person-chip-role">{p.role}</span>}
                    </span>
                  ))}
                </div>
                {episode.soundbites.length > 0 && (
                  <div className="episode-soundbites">
                    {episode.soundbites.map((sb, j) => (
                      <button
                        key={j}
                        className="soundbite-chip"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayEpisode(episode);
                        }}
                      >
                        🎵 Soundbite {formatDuration(sb.duration)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="episode-card-actions">
              <button
                className="episode-play-btn"
                onClick={() => onPlayEpisode(episode)}
                disabled={!episode.enclosure}
              >
                ▶ Play
              </button>
              <button
                className="episode-detail-btn"
                onClick={() => onSelectEpisode(episode)}
              >
                Details
              </button>
              <button
                className="episode-queue-btn"
                onClick={() => onAddToQueue(episode)}
              >
                + Queue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
