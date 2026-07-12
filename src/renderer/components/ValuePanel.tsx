import React from 'react';
import type { PodcastValue } from '../types';

interface ValuePanelProps {
  value: PodcastValue | undefined;
  onClose: () => void;
}

export function ValuePanel({ value, onClose }: ValuePanelProps) {
  if (!value) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h3>⚡ Value for Value</h3>
          <button className="panel-close" onClick={onClose}>×</button>
        </div>
        <div className="panel-content">
          <p className="panel-empty">No V4V data available</p>
        </div>
      </div>
    );
  }

  const totalSplit = value.recipients.reduce((sum, r) => sum + r.split, 0);

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>⚡ Value for Value</h3>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      <div className="panel-content">
        <div className="value-info">
          <div className="value-meta">
            <span className="value-type">{value.type}</span>
            <span className="value-method">{value.method}</span>
          </div>
          {value.suggested && (
            <div className="value-suggested">
              Suggested: {value.suggested} {value.type}
            </div>
          )}
        </div>

        <h4 className="value-recipients-title">
          Recipients ({value.recipients.length})
        </h4>
        <div className="value-recipients">
          {value.recipients.map((recipient, i) => (
            <div key={i} className="value-recipient">
              <div className="recipient-info">
                <span className="recipient-name">{recipient.name || 'Anonymous'}</span>
                <span className="recipient-type">{recipient.type}</span>
                {recipient.fee && <span className="recipient-fee-badge">Fee</span>}
              </div>
              <div className="recipient-split">
                <div className="split-bar">
                  <div
                    className="split-fill"
                    style={{ width: `${totalSplit > 0 ? (recipient.split / totalSplit) * 100 : 0}%` }}
                  />
                </div>
                <span className="split-value">{recipient.split}%</span>
              </div>
              <div className="recipient-address" title={recipient.address}>
                {recipient.address.substring(0, 20)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
