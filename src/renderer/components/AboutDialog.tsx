import React from 'react';

interface AboutDialogProps {
  onClose: () => void;
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>About Lupine</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div className="about-logo">
            <img src="icon.png" alt="Lupine" className="about-icon" />
          </div>
          <h3 className="about-name">Lupine</h3>
          <p className="about-version">Version 1.0.0</p>
          <p className="about-tagline">Podcast 2.0 Desktop Player</p>

          <div className="about-section">
            <h4>Built with</h4>
            <div className="about-tech">
              <span>Electron</span>
              <span>React</span>
              <span>TypeScript</span>
              <span>Vite</span>
            </div>
          </div>

          <div className="about-section">
            <h4>Podcast 2.0 Support</h4>
            <p>Full namespace support including chapters, transcripts, soundbites, V4V, live items, people, locations, and more.</p>
          </div>

          <div className="about-section">
            <h4>Keyboard Shortcuts</h4>
            <div className="about-shortcuts">
              <div><kbd>Space</kbd> Play/Pause</div>
              <div><kbd>←</kbd><kbd>→</kbd> Seek 10s</div>
              <div><kbd>Shift</kbd>+<kbd>←</kbd><kbd>→</kbd> Seek 30s</div>
              <div><kbd>↑</kbd><kbd>↓</kbd> Volume</div>
              <div><kbd>&lt;</kbd><kbd>&gt;</kbd> Speed</div>
              <div><kbd>N</kbd> Next</div>
              <div><kbd>M</kbd> Mini player</div>
              <div><kbd>/</kbd> Search</div>
            </div>
          </div>

          <div className="about-section">
            <p className="about-copyright">© 2026 Nathan Stallings</p>
            <a href="https://www.cybernate.dev/products/lupine" target="_blank" rel="noopener noreferrer" className="about-link">
              cybernate.dev/products/lupine
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
