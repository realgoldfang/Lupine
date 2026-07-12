import React, { useState } from 'react';

interface DiscoverViewProps {
  onLoadFeed: (url: string) => void;
  onImportOPML: () => void;
}

const SAMPLE_FEEDS = [
  { name: 'The Podcast Index', url: 'https://feeds.podcastindex.org/pc20.xml' },
  { name: 'This Week in Tech', url: 'https://feeds.twit.com/technewsweekly/video' },
  { name: 'The Daily', url: 'https://rss.art19.com/the-daily' },
  { name: 'Huberman Lab', url: 'https://www.rss.com/feeds/huberman-lab.xml' },
  { name: 'Lex Fridman Podcast', url: 'https://lexfridman.com/feed/podcast/' },
];

export function DiscoverView({ onLoadFeed, onImportOPML }: DiscoverViewProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onLoadFeed(url.trim());
      setUrl('');
    } catch {
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const match = text.match(/https?:\/\/[^\s]+/);
      if (match) setUrl(match[0]);
    } catch {}
  };

  return (
    <div className="discover-view">
      <div className="discover-header">
        <h1>Discover Podcasts</h1>
        <p>Enter a podcast RSS feed URL to get started</p>
      </div>

      <form className="discover-form" onSubmit={handleSubmit}>
        <input
          type="url"
          className="discover-input"
          placeholder="https://example.com/podcast/feed.xml"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button type="button" className="discover-paste-btn" onClick={handlePaste}>
          📋
        </button>
        <button type="submit" className="discover-btn" disabled={loading || !url.trim()}>
          {loading ? 'Loading...' : 'Load Feed'}
        </button>
      </form>

      <div className="discover-actions">
        <button className="discover-import-btn" onClick={onImportOPML}>
          📥 Import OPML
        </button>
      </div>

      {error && <div className="discover-error">{error}</div>}

      <div className="discover-samples">
        <h3>Popular Feeds</h3>
        <div className="discover-sample-grid">
          {SAMPLE_FEEDS.map((feed, i) => (
            <button
              key={i}
              className="discover-sample-card"
              onClick={() => {
                setUrl(feed.url);
                onLoadFeed(feed.url);
              }}
            >
              <span className="sample-name">{feed.name}</span>
              <span className="sample-url">{feed.url}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="discover-keyboard-hints">
        <h3>Keyboard Shortcuts</h3>
        <div className="hints-grid">
          <div className="hint"><kbd>Space</kbd> Play/Pause</div>
          <div className="hint"><kbd>←</kbd><kbd>→</kbd> Seek 10s</div>
          <div className="hint"><kbd>Shift</kbd>+<kbd>←</kbd><kbd>→</kbd> Seek 30s</div>
          <div className="hint"><kbd>↑</kbd><kbd>↓</kbd> Volume</div>
          <div className="hint"><kbd>&lt;</kbd><kbd>&gt;</kbd> Speed</div>
          <div className="hint"><kbd>N</kbd> Next episode</div>
          <div className="hint"><kbd>M</kbd> Mini player</div>
          <div className="hint"><kbd>/</kbd> Search</div>
          <div className="hint"><kbd>Esc</kbd> Close panel</div>
        </div>
      </div>

      <div className="discover-features">
        <h3>Podcast 2.0 Features</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">📑</span>
            <h4>Chapters</h4>
            <p>Navigate with rich chapter markers</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📝</span>
            <h4>Transcripts</h4>
            <p>Read along with synced transcripts</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h4>Value for Value</h4>
            <p>Lightning payments to creators</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎵</span>
            <h4>Soundbites</h4>
            <p>Highlight clips from episodes</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👥</span>
            <h4>People</h4>
            <p>See hosts, guests, credits</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🌍</span>
            <h4>Location</h4>
            <p>Discover by geography</p>
          </div>
        </div>
      </div>
    </div>
  );
}
