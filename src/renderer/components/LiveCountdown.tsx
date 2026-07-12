import React, { useState, useEffect } from 'react';

interface LiveCountdownProps {
  start: string;
  end?: string;
  status: string;
}

export function LiveCountdown({ start, end, status }: LiveCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isLive, setIsLive] = useState(status === 'live');

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const startDate = new Date(start).getTime();
      const endDate = end ? new Date(end).getTime() : null;

      if (endDate && now >= endDate) {
        setIsLive(false);
        setTimeLeft('Ended');
      } else if (now >= startDate) {
        setIsLive(true);
        if (endDate) {
          const diff = Math.ceil((endDate - now) / 1000);
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          const s = diff % 60;
          setTimeLeft(`${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} left`);
        } else {
          setTimeLeft('LIVE NOW');
        }
      } else {
        setIsLive(false);
        const diff = Math.ceil((startDate - now) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        setTimeLeft(`Starts in ${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [start, end, status]);

  return (
    <div className={`live-countdown ${isLive ? 'is-live' : 'is-upcoming'}`}>
      {isLive ? '🔴' : '🟡'} {timeLeft}
    </div>
  );
}
