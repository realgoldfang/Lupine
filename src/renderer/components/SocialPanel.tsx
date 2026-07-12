import React from 'react';
import type { PodcastSocialInteract } from '../types';

interface SocialPanelProps {
  socialInteracts: PodcastSocialInteract[];
  onClose: () => void;
}

const protocolIcons: Record<string, string> = {
  twitter: '🐦',
  mastodon: '🐘',
  activitypub: '🔗',
  nostr: '🟂',
  bluesky: '🦋',
};

export function SocialPanel({ socialInteracts, onClose }: SocialPanelProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>🔗 Social</h3>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      <div className="panel-content">
        {socialInteracts.length === 0 ? (
          <p className="panel-empty">No social links available</p>
        ) : (
          <div className="social-list">
            {socialInteracts.map((social, i) => (
              <a
                key={i}
                href={social.accountUrl || social.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="social-item"
              >
                <span className="social-icon">
                  {protocolIcons[social.protocol.toLowerCase()] || '🔗'}
                </span>
                <div className="social-info">
                  <span className="social-protocol">{social.protocol}</span>
                  <span className="social-account">{social.accountId || social.uri}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
