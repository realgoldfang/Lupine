import React, { useState } from 'react';

interface DiscoverViewProps {
  onLoadFeed: (url: string) => void;
}

const SAMPLE_FEEDS = [
  { name: 'The Podcast Index', url: 'https://feeds.podcastindex.org/pc20.xml' },
  { name: 'Podcasting 2.0 Example', url: 'https://example.com/feed.xml' },
  { name: 'This Week in Tech', url: 'https://feeds.twit.com/technewsweekly/video' },
  { name: 'The Daily', url: 'https://rss.art19.com/the-daily' },
  { name: 'Huberman Lab', url: 'https://www.rss.com/feeds/huberman-lab.xml' },
];

export function DiscoverView({ onLoadFeed }: DiscoverViewProps) {
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
    } catch (err) {
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
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
        <button type="submit" className="discover-btn" disabled={loading || !url.trim()}>
          {loading ? 'Loading...' : 'Load Feed'}
        </button>
      </form>

      {error && <div className="discover-error">{error}</div>}

      <div className="discover-samples">
        <h3>Sample Feeds</h3>
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

      <div className="discover-features">
        <h3>Podcast 2.0 Features</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">📑</span>
            <h4>Chapters</h4>
            <p>Navigate episodes with rich chapter markers</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📝</span>
            <h4>Transcripts</h4>
            <p>Read along with synchronized transcripts</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h4>Value for Value</h4>
            <p>Support creators with Lightning payments</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎵</span>
            <h4>Soundbites</h4>
            <p>Discover highlight clips from episodes</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👥</span>
            <h4>People</h4>
            <p>See hosts, guests, and contributors</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🌍</span>
            <h4>Location</h4>
            <p>Discover podcasts by geographic location</p>
          </div>
        </div>
      </div>
    </div>
  );
}
