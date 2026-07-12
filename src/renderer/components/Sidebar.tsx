import React from 'react';
import type { PodcastFeed } from '../types';

interface SidebarProps {
  feeds: PodcastFeed[];
  selectedFeed: PodcastFeed | null;
  onSelectFeed: (feed: PodcastFeed) => void;
  onDiscover: () => void;
}

export function Sidebar({ feeds, selectedFeed, onSelectFeed, onDiscover }: SidebarProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Podcast 2.0</h1>
      </div>
      <button className="sidebar-discover-btn" onClick={onDiscover}>
        Discover
      </button>
      <div className="sidebar-feeds">
        <h3 className="sidebar-section-title">Your Podcasts</h3>
        {feeds.length === 0 && (
          <p className="sidebar-empty">No feeds loaded. Add one in Discover.</p>
        )}
        {feeds.map((feed, i) => (
          <button
            key={feed.guid || i}
            className={`sidebar-feed-item ${selectedFeed?.guid === feed.guid ? 'active' : ''}`}
            onClick={() => onSelectFeed(feed)}
          >
            {feed.image ? (
              <img src={feed.image} alt="" className="sidebar-feed-image" />
            ) : (
              <div className="sidebar-feed-placeholder" />
            )}
            <div className="sidebar-feed-info">
              <span className="sidebar-feed-title">{feed.title}</span>
              <span className="sidebar-feed-episodes">{feed.episodes.length} episodes</span>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}
