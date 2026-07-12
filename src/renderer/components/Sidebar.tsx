import React, { useState } from 'react';
import type { PodcastFeed } from '../types';
import type { EpisodeState } from '../store';

interface SidebarProps {
  feeds: PodcastFeed[];
  selectedFeed: PodcastFeed | null;
  onSelectFeed: (feed: PodcastFeed) => void;
  onDiscover: () => void;
  onRemoveFeed: (guid: string) => void;
  onExportOPML: () => void;
  onImportOPML: () => void;
  theme: string;
  onToggleTheme: () => void;
  episodeStates: Record<string, EpisodeState>;
}

export function Sidebar({
  feeds,
  selectedFeed,
  onSelectFeed,
  onDiscover,
  onRemoveFeed,
  onExportOPML,
  onImportOPML,
  theme,
  onToggleTheme,
  episodeStates,
}: SidebarProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; feed: PodcastFeed } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, feed: PodcastFeed) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, feed });
  };

  const getUnlistenedCount = (feed: PodcastFeed) => {
    return feed.episodes.filter((ep) => !episodeStates[ep.guid || '']?.listened).length;
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Lupine</h1>
        <div className="sidebar-header-actions">
          <button className="sidebar-icon-btn" onClick={onToggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      <button className="sidebar-discover-btn" onClick={onDiscover}>
        + Discover
      </button>
      <div className="sidebar-actions">
        <button className="sidebar-action-btn" onClick={onImportOPML} title="Import OPML">
          📥 Import
        </button>
        <button className="sidebar-action-btn" onClick={onExportOPML} title="Export OPML">
          📤 Export
        </button>
      </div>
      <div className="sidebar-feeds">
        <h3 className="sidebar-section-title">Your Podcasts ({feeds.length})</h3>
        {feeds.length === 0 && (
          <p className="sidebar-empty">No feeds yet. Click Discover to add one.</p>
        )}
        {feeds.map((feed) => {
          const unlistened = getUnlistenedCount(feed);
          return (
            <button
              key={feed.guid}
              className={`sidebar-feed-item ${selectedFeed?.guid === feed.guid ? 'active' : ''}`}
              onClick={() => onSelectFeed(feed)}
              onContextMenu={(e) => handleContextMenu(e, feed)}
            >
              {feed.image ? (
                <img src={feed.image} alt="" className="sidebar-feed-image" />
              ) : (
                <div className="sidebar-feed-placeholder" />
              )}
              <div className="sidebar-feed-info">
                <span className="sidebar-feed-title">{feed.title}</span>
                <span className="sidebar-feed-episodes">
                  {feed.episodes.length} episodes
                  {unlistened > 0 && <span className="unlistened-badge">{unlistened}</span>}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <button onClick={() => { onRemoveFeed(contextMenu.feed.guid!); setContextMenu(null); }}>
            Remove
          </button>
        </div>
      )}
    </nav>
  );
}
