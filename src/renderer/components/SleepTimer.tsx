import React from 'react';

interface SleepTimerProps {
  remaining: number;
  formatRemaining: () => string;
  onSetMinutes: (min: number | null) => void;
  onCancel: () => void;
}

const PRESETS = [5, 10, 15, 30, 45, 60, 90];

export function SleepTimer({ remaining, formatRemaining, onSetMinutes, onCancel }: SleepTimerProps) {
  if (remaining > 0) {
    return (
      <div className="sleep-timer-active">
        <span className="sleep-timer-icon">😴</span>
        <span className="sleep-timer-countdown">{formatRemaining()}</span>
        <button className="sleep-timer-cancel" onClick={onCancel}>×</button>
      </div>
    );
  }

  return (
    <div className="sleep-timer-menu">
      <span className="sleep-timer-label">Sleep timer</span>
      <div className="sleep-timer-presets">
        {PRESETS.map((min) => (
          <button key={min} className="sleep-timer-preset" onClick={() => onSetMinutes(min)}>
            {min}m
          </button>
        ))}
      </div>
    </div>
  );
}
