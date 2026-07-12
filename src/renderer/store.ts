import type { PodcastFeed } from './types';

export interface AppState {
  feeds: PodcastFeed[];
  queue: string[];
  history: PlaybackHistoryEntry[];
  episodes: Record<string, EpisodeState>;
  currentFeedGuid: string | null;
  currentEpisodeGuid: string | null;
  currentTime: number;
  volume: number;
  playbackRate: number;
  theme: 'dark' | 'light';
  miniPlayer: boolean;
}

export interface EpisodeState {
  guid: string;
  listened: boolean;
  progress: number;
  duration: number;
  lastPlayed: number;
  playbackRate?: number;
}

export interface PlaybackHistoryEntry {
  episodeGuid: string;
  feedGuid: string;
  timestamp: number;
  duration: number;
}

const STORAGE_KEY = 'lupine-state';

const defaultState: AppState = {
  feeds: [],
  queue: [],
  history: [],
  episodes: {},
  currentFeedGuid: null,
  currentEpisodeGuid: null,
  currentTime: 0,
  volume: 1,
  playbackRate: 1,
  theme: 'dark',
  miniPlayer: false,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaultState, ...JSON.parse(raw) };
    }
  } catch {}
  return defaultState;
}

export function saveState(state: Partial<AppState>): void {
  try {
    const current = loadState();
    const merged = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}
}

export function addFeed(state: AppState, feed: PodcastFeed): AppState {
  const exists = state.feeds.some((f) => f.guid === feed.guid);
  if (exists) return state;
  return { ...state, feeds: [...state.feeds, feed] };
}

export function removeFeed(state: AppState, guid: string): AppState {
  return {
    ...state,
    feeds: state.feeds.filter((f) => f.guid !== guid),
  };
}

export function markListened(state: AppState, episodeGuid: string): AppState {
  return {
    ...state,
    episodes: {
      ...state.episodes,
      [episodeGuid]: {
        ...state.episodes[episodeGuid],
        guid: episodeGuid,
        listened: true,
        lastPlayed: Date.now(),
      },
    },
  };
}

export function updateEpisodeProgress(
  state: AppState,
  episodeGuid: string,
  progress: number,
  duration: number
): AppState {
  return {
    ...state,
    episodes: {
      ...state.episodes,
      [episodeGuid]: {
        ...state.episodes[episodeGuid],
        guid: episodeGuid,
        progress,
        duration,
        lastPlayed: Date.now(),
      },
    },
  };
}

export function addToHistory(
  state: AppState,
  entry: PlaybackHistoryEntry
): AppState {
  return {
    ...state,
    history: [entry, ...state.history].slice(0, 500),
  };
}

export function addToQueue(state: AppState, episodeGuid: string): AppState {
  if (state.queue.includes(episodeGuid)) return state;
  return { ...state, queue: [...state.queue, episodeGuid] };
}

export function removeFromQueue(state: AppState, index: number): AppState {
  return {
    ...state,
    queue: state.queue.filter((_, i) => i !== index),
  };
}

export function getEpisodeState(
  state: AppState,
  episodeGuid: string
): EpisodeState {
  return (
    state.episodes[episodeGuid] || {
      guid: episodeGuid,
      listened: false,
      progress: 0,
      duration: 0,
      lastPlayed: 0,
    }
  );
}

export function isListened(state: AppState, episodeGuid: string): boolean {
  return state.episodes[episodeGuid]?.listened || false;
}

export function savePlaybackSpeed(
  state: AppState,
  episodeGuid: string,
  rate: number
): AppState {
  return {
    ...state,
    episodes: {
      ...state.episodes,
      [episodeGuid]: {
        ...state.episodes[episodeGuid],
        guid: episodeGuid,
        playbackRate: rate,
      },
    },
  };
}

export function exportOPML(feeds: PodcastFeed[]): string {
  const items = feeds
    .map(
      (f) => `    <outline text="${escapeXml(f.title)}" title="${escapeXml(f.title)}" type="rss" xmlUrl="${escapeXml(f.link || '')}" htmlUrl="${escapeXml(f.link || '')}"/>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Lupine Subscriptions</title>
  </head>
  <body>
${items}
  </body>
</opml>`;
}

export function parseOPML(xml: string): string[] {
  const urls: string[] = [];
  const regex = /xmlUrl=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
