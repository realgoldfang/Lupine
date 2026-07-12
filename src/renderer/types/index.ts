export interface PodcastPerson {
  name: string;
  role?: string;
  group?: string;
  img?: string;
  href?: string;
}

export interface PodcastLocation {
  text: string;
  rel?: string;
  geo?: string;
  osm?: string;
  country?: string;
}

export interface PodcastTranscript {
  url: string;
  type: string;
  language?: string;
  rel?: string;
}

export interface PodcastChapters {
  url: string;
  type: string;
}

export interface PodcastSoundbite {
  startTime: number;
  duration: number;
  title?: string;
}

export interface PodcastValueRecipient {
  name?: string;
  type?: string;
  address: string;
  split: number;
  fee?: boolean;
}

export interface PodcastValue {
  type: string;
  method: string;
  suggested?: string;
  recipients: PodcastValueRecipient[];
}

export interface PodcastAlternateEnclosure {
  type: string;
  length?: number;
  bitrate?: number;
  height?: number;
  lang?: string;
  title?: string;
  rel?: string;
  codecs?: string;
  default?: boolean;
  sources: { uri: string; contentType?: string }[];
  integrity?: { type: string; value: string };
}

export interface PodcastSocialInteract {
  uri: string;
  protocol: string;
  accountId?: string;
  accountUrl?: string;
  priority?: number;
}

export interface PodcastEpisode {
  title: string;
  description?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  author?: string;
  duration?: number;
  enclosure?: { url: string; length: number; type: string };
  image?: string;
  season?: { number: number; name?: string };
  episode?: number;
  explicit?: boolean;
  transcripts: PodcastTranscript[];
  chapters?: PodcastChapters;
  soundbites: PodcastSoundbite[];
  persons: PodcastPerson[];
  locations: PodcastLocation[];
  value?: PodcastValue;
  alternateEnclosures: PodcastAlternateEnclosure[];
  socialInteracts: PodcastSocialInteract[];
  trailer?: {
    pubDate: string;
    url: string;
    length: number;
    type: string;
    text?: string;
  };
  liveItem?: {
    status: string;
    start?: string;
    end?: string;
    title?: string;
    description?: string;
    link?: string;
    guid?: string;
  };
  contentLinks?: { href: string; text?: string }[];
  txt?: { purpose?: string; content: string }[];
}

export interface PodcastFeed {
  title: string;
  description?: string;
  link?: string;
  language?: string;
  copyright?: string;
  author?: string;
  image?: string;
  lastBuildDate?: string;
  guid?: string;
  locked?: { owner: string; locked: boolean };
  funding?: { url: string; text: string }[];
  location?: PodcastLocation;
  medium?: string;
  persons: PodcastPerson[];
  value?: PodcastValue;
  trailer?: PodcastEpisode['trailer'];
  block?: { platform?: string; blocked: boolean }[];
  podroll?: { feedGuid: string; feedUrl: string; title?: string }[];
  updateFrequency?: string;
  podping?: boolean;
  chat?: { server: string; protocol: string; accountId?: string; space?: string }[];
  publisher?: { feedGuid: string; feedUrl: string }[];
  images?: { href: string; purpose?: string }[];
  episodes: PodcastEpisode[];
}

export interface Chapter {
  startTime: number;
  endTime?: number;
  title: string;
  img?: string;
  url?: string;
  toc?: boolean;
}

export interface TranscriptCue {
  startTime: number;
  endTime: number;
  text: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  currentEpisode: PodcastEpisode | null;
  currentFeed: PodcastFeed | null;
  queue: PodcastEpisode[];
}

declare global {
  interface Window {
    electronAPI: {
      fetchFeed: (url: string) => Promise<{ success: boolean; data?: PodcastFeed; error?: string }>;
      fetchChapters: (url: string) => Promise<{ success: boolean; data?: { chapters: Chapter[] }; error?: string }>;
      fetchTranscript: (url: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      downloadEpisode: (url: string, filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      showSaveDialog: (options: any) => Promise<{ canceled: boolean; filePath?: string }>;
      showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
      writeFile: (path: string, content: string) => Promise<void>;
      readFile: (path: string) => Promise<string>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      setMiniPlayer: (mini: boolean) => Promise<void>;
      installUpdate: () => Promise<void>;
      onMediaPlayPause: (callback: () => void) => void;
      onMediaNext: (callback: () => void) => void;
      onMediaPrevious: (callback: () => void) => void;
      onUpdateAvailable: (callback: () => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
    };
  }
}
