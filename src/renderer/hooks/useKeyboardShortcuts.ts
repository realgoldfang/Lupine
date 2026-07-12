import { useEffect, useCallback } from 'react';

interface KeyboardActions {
  onPlayPause: () => void;
  onSeekForward: (seconds: number) => void;
  onSeekBackward: (seconds: number) => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  onToggleMiniPlayer?: () => void;
  onToggleSearch?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(actions: KeyboardActions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          actions.onPlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            actions.onSeekForward(30);
          } else {
            actions.onSeekForward(10);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            actions.onSeekBackward(30);
          } else {
            actions.onSeekBackward(10);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          actions.onVolumeUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          actions.onVolumeDown();
          break;
        case 'n':
          if (!e.ctrlKey && !e.metaKey) {
            actions.onNextTrack();
          }
          break;
        case 'p':
          if (!e.ctrlKey && !e.metaKey) {
            actions.onPrevTrack();
          }
          break;
        case '>':
          actions.onSpeedUp();
          break;
        case '<':
          actions.onSpeedDown();
          break;
        case 'm':
          if (actions.onToggleMiniPlayer) {
            actions.onToggleMiniPlayer();
          }
          break;
        case '/':
          if (actions.onToggleSearch) {
            e.preventDefault();
            actions.onToggleSearch();
          }
          break;
        case 'Escape':
          if (actions.onEscape) {
            actions.onEscape();
          }
          break;
      }
    },
    [actions]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
