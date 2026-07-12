import React, { useState } from 'react';
import type { PodcastFeed, PodcastEpisode } from '../types';
import type { EpisodeState } from '../store';

interface FeedViewProps {
  feed: PodcastFeed;
  episodes?: PodcastEpisode[];
  onPlayEpisode: (episode: PodcastEpisode) => void;
  onSelectEpisode: (episode: PodcastEpisode) => void;
  onAddToQueue: (episode: PodcastEpisode) => void;
  onDownload: (episode: PodcastEpisode) => void;
  onToggleListened: (guid: string) => void;
  episodeStates: Record<string, EpisodeState>;
  podrollFeeds?: { feedGuid: string; feedUrl: string; title?: string }[];
  onLoadFeed: (url: string) => void;
  onShowSocial: (episode: PodcastEpisode) => void;
}

export function FeedView({
  feed,
  episodes,
  onPlayEpisode,
  onSelectEpisode,
  onAddToQueue,
  onDownload,
  onToggleListened,
  episodeStates,
  podrollFeeds,
  onLoadFeed,
  onShowSocial,
}: FeedViewProps) {
  const [showAllPersons, setShowAllPersons] = useState(false);
  const displayEpisodes = episodes || feed.episodes;

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
            <p className="feed-description">{feed.description.substring(0, 300)}...</p>
          )}
          <div className="feed-meta">
            {feed.language && <span>{feed.language}</span>}
            {feed.medium && <span>{feed.medium}</span>}
            {feed.updateFrequency && <span>📅 {feed.updateFrequency}</span>}
          </div>
          {feed.persons.length > 0 && (
            <div className="feed-persons">
              <span className="feed-persons-label">People:</span>
              {feed.persons.slice(0, showAllPersons ? undefined : 3).map((p, j) => (
                <span key={j} className="person-chip">
                  {p.img && <img src={p.img} alt="" className="person-chip-img" />}
                  {p.name}
                  {p.role && <span className="person-chip-role">{p.role}</span>}
                </span>
              ))}
              {feed.persons.length > 3 && (
                <button className="show-more-btn" onClick={() => setShowAllPersons(!showAllPersons)}>
                  {showAllPersons ? 'Show less' : `+${feed.persons.length - 3} more`}
                </button>
              )}
            </div>
          )}
          {feed.funding && feed.funding.length > 0 && (
            <div className="feed-funding">
              {feed.funding.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="funding-link">
                  💰 {f.text || 'Support'}
                </a>
              ))}
            </div>
          )}
          {feed.value && (
            <div className="feed-value-badge">
              ⚡ {feed.value.type} - {feed.value.recipients.length} recipients
            </div>
          )}
          {feed.chat && feed.chat.length > 0 && (
            <div className="feed-chat-links">
              {feed.chat.map((c, i) => (
                <span key={i} className="chat-badge">💬 {c.protocol} - {c.space || c.server}</span>
              ))}
            </div>
          )}
          {feed.location && (
            <div className="feed-location">📍 {feed.location.text}</div>
          )}
        </div>
      </header>

      {podrollFeeds && podrollFeeds.length > 0 && (
        <div className="podroll-section">
          <h3>🔗 Recommended Shows</h3>
          <div className="podroll-list">
            {podrollFeeds.map((pr, i) => (
              <button key={i} className="podroll-item" onClick={() => onLoadFeed(pr.feedUrl)}>
                <span className="podroll-title">{pr.title || pr.feedGuid}</span>
                <span className="podroll-url">{pr.feedUrl}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="episode-list">
        <h2 className="episode-list-title">Episodes ({displayEpisodes.length})</h2>
        {displayEpisodes.map((episode, i) => {
          const state = episodeStates[episode.guid || ''];
          const isListened = state?.listened;
          const progress = state?.duration ? (state.progress / state.duration) * 100 : 0;

          return (
            <div key={episode.guid || i} className={`episode-card ${isListened ? 'listened' : ''}`}>
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
                    {episode.liveItem && (
                      <span className={`live-badge ${episode.liveItem.status}`}>
                        🔴 {episode.liveItem.status}
                      </span>
                    )}
                    <h3 className="episode-card-title">{episode.title}</h3>
                  </div>
                  <div className="episode-card-meta">
                    {episode.pubDate && <span>{formatDate(episode.pubDate)}</span>}
                    {episode.duration && <span>{formatDuration(episode.duration)}</span>}
                    {episode.explicit && <span className="explicit-badge">E</span>}
                    {episode.chapters && <span>📑</span>}
                    {episode.transcripts.length > 0 && <span>📝</span>}
                    {episode.value && <span>⚡</span>}
                    {episode.socialInteracts.length > 0 && <span>🔗</span>}
                    {episode.soundbites.length > 0 && <span>🎵</span>}
                  </div>
                  {progress > 0 && (
                    <div className="episode-progress-bar">
                      <div className="episode-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  )}
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
                        <button key={j} className="soundbite-chip" onClick={(e) => { e.stopPropagation(); onPlayEpisode(episode); }}>
                          🎵 {formatDuration(sb.duration)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="episode-card-actions">
                <button
                  className={`episode-listen-btn ${isListened ? 'listened' : ''}`}
                  onClick={() => onToggleListened(episode.guid || '')}
                  title={isListened ? 'Mark unread' : 'Mark as listened'}
                >
                  {isListened ? '✓' : '○'}
                </button>
                <button
                  className="episode-play-btn"
                  onClick={() => onPlayEpisode(episode)}
                  disabled={!episode.enclosure}
                >
                  ▶
                </button>
                <button className="episode-detail-btn" onClick={() => onSelectEpisode(episode)}>
                  Details
                </button>
                {episode.socialInteracts.length > 0 && (
                  <button className="episode-social-btn" onClick={() => onShowSocial(episode)}>
                    🔗
                  </button>
                )}
                {episode.enclosure && (
                  <button className="episode-download-btn" onClick={() => onDownload(episode)}>
                    ⬇
                  </button>
                )}
                <button className="episode-queue-btn" onClick={() => onAddToQueue(episode)}>
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
