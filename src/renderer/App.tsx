import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { PodcastFeed, PodcastEpisode, Chapter, TranscriptCue } from './types';
import { Sidebar } from './components/Sidebar';
import { FeedView } from './components/FeedView';
import { Player } from './components/Player';
import { ChapterPanel } from './components/ChapterPanel';
import { TranscriptPanel } from './components/TranscriptPanel';
import { DiscoverView } from './components/DiscoverView';
import { ValuePanel } from './components/ValuePanel';
import { SocialPanel } from './components/SocialPanel';
import { MiniPlayer } from './components/MiniPlayer';
import { AboutDialog } from './components/AboutDialog';
import { SleepTimer } from './components/SleepTimer';
import { usePlayer } from './hooks/usePlayer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSleepTimer } from './hooks/useSleepTimer';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import {
  loadState, saveState, addFeed, markListened,
  addToHistory, addToQueue,
  removeFromQueue, exportOPML, parseOPML
} from './store';
import './styles/app.css';

type View = 'discover' | 'feed' | 'episode';

function AppInner() {
  const player = usePlayer();
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<View>('discover');
  const [feeds, setFeeds] = useState<PodcastFeed[]>(() => loadState().feeds);
  const [selectedFeed, setSelectedFeed] = useState<PodcastFeed | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [showChapters, setShowChapters] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterListened, setFilterListened] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [transcript, setTranscript] = useState<TranscriptCue[]>([]);
  const [queue, setQueue] = useState<string[]>(() => loadState().queue);
  const [history, setHistory] = useState(loadState().history);
  const [episodeStates, setEpisodeStates] = useState(loadState().episodes);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const episodeListRef = useRef<HTMLDivElement>(null);

  const sleepTimer = useSleepTimer(() => {
    player.togglePlay();
  });

  // Persist state
  useEffect(() => {
    saveState({ feeds, queue, history, episodes: episodeStates });
  }, [feeds, queue, history, episodeStates]);

  // Media key listeners
  useEffect(() => {
    window.electronAPI?.onMediaPlayPause(() => player.togglePlay());
    window.electronAPI?.onMediaNext(() => player.playNext());
    window.electronAPI?.onMediaPrevious(() => {});
    window.electronAPI?.onUpdateAvailable(() => setUpdateAvailable(true));
    window.electronAPI?.onUpdateDownloaded(() => { setUpdateAvailable(false); setUpdateDownloaded(true); });
  }, [player]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: player.togglePlay,
    onSeekForward: (s) => player.seek(player.currentTime + s),
    onSeekBackward: (s) => player.seek(Math.max(0, player.currentTime - s)),
    onVolumeUp: () => player.setVolume(Math.min(1, player.volume + 0.1)),
    onVolumeDown: () => player.setVolume(Math.max(0, player.volume - 0.1)),
    onNextTrack: player.playNext,
    onPrevTrack: () => {},
    onSpeedUp: () => {
      const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
      const idx = rates.indexOf(player.playbackRate);
      if (idx < rates.length - 1) player.setPlaybackRate(rates[idx + 1]);
    },
    onSpeedDown: () => {
      const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
      const idx = rates.indexOf(player.playbackRate);
      if (idx > 0) player.setPlaybackRate(rates[idx - 1]);
    },
    onToggleMiniPlayer: () => {
      setShowMiniPlayer(!showMiniPlayer);
      window.electronAPI?.setMiniPlayer(!showMiniPlayer);
    },
    onToggleSearch: () => setShowSearch(!showSearch),
    onEscape: () => {
      setShowSearch(false);
      setShowChapters(false);
      setShowTranscript(false);
      setShowValue(false);
      setShowSocial(false);
    },
  });

  // Track progress
  useEffect(() => {
    if (selectedEpisode && player.currentTime > 0) {
      setEpisodeStates((prev) => ({
        ...prev,
        [selectedEpisode.guid || '']: {
          ...prev[selectedEpisode.guid || ''],
          guid: selectedEpisode.guid || '',
          progress: player.currentTime,
          duration: player.duration,
          lastPlayed: Date.now(),
        },
      }));
    }
  }, [player.currentTime]);

  const loadFeed = useCallback(async (url: string) => {
    const result = await window.electronAPI.fetchFeed(url);
    if (result.success && result.data) {
      setFeeds((prev) => addFeed({ feeds: prev } as any, result.data!).feeds);
      setSelectedFeed(result.data!);
      setView('feed');
    }
  }, []);

  const playEpisode = useCallback((episode: PodcastEpisode, feed?: PodcastFeed) => {
    player.playEpisode(episode, feed || selectedFeed || undefined);
    setSelectedEpisode(episode);
    if (episode.chapters) loadChapters(episode.chapters.url);
    if (episode.transcripts.length > 0) loadTranscript(episode.transcripts[0].url);

    setHistory((prev) => addToHistory({ history: prev } as any, {
      episodeGuid: episode.guid || '',
      feedGuid: feed?.guid || selectedFeed?.guid || '',
      timestamp: Date.now(),
      duration: episode.duration || 0,
    }).history);
  }, [player, selectedFeed]);

  const loadChapters = useCallback(async (url: string) => {
    const result = await window.electronAPI.fetchChapters(url);
    if (result.success && result.data) {
      setChapters(result.data.chapters || []);
    }
  }, []);

  const loadTranscript = useCallback(async (url: string) => {
    const result = await window.electronAPI.fetchTranscript(url);
    if (result.success && result.data) {
      setTranscript(parseTranscriptData(result.data));
    }
  }, []);

  const parseTranscriptData = (data: string): TranscriptCue[] => {
    try {
      const json = JSON.parse(data);
      if (json.transcript) {
        return json.transcript.map((c: any) => ({
          startTime: c.startTime || 0,
          endTime: c.endTime || c.startTime + 1,
          text: c.text || '',
        }));
      }
    } catch {
      const lines = data.split('\n');
      const cues: TranscriptCue[] = [];
      let i = 0;
      while (i < lines.length) {
        if (lines[i].includes('-->')) {
          const times = lines[i].split('-->').map((t) => t.trim());
          const startTime = parseVTTTime(times[0]);
          const endTime = parseVTTTime(times[1]);
          let text = '';
          i++;
          while (i < lines.length && lines[i].trim() !== '') {
            text += lines[i] + ' ';
            i++;
          }
          cues.push({ startTime, endTime, text: text.trim() });
        }
        i++;
      }
      return cues;
    }
    return [];
  };

  const parseVTTTime = (time: string): number => {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const handleExportOPML = async () => {
    const xml = exportOPML(feeds);
    const result = await window.electronAPI.showSaveDialog({
      defaultPath: 'lupine-subscriptions.opml',
      filters: [{ name: 'OPML', extensions: ['opml', 'xml'] }],
    });
    if (!result.canceled && result.filePath) {
      await window.electronAPI.writeFile(result.filePath, xml);
    }
  };

  const handleImportOPML = async () => {
    const result = await window.electronAPI.showOpenDialog({
      filters: [{ name: 'OPML', extensions: ['opml', 'xml'] }],
      properties: ['openFile'],
    });
    if (!result.canceled && result.filePaths[0]) {
      const content = await window.electronAPI.readFile(result.filePaths[0]);
      const urls = parseOPML(content);
      for (const url of urls) {
        await loadFeed(url);
      }
    }
  };

  const handleDownloadEpisode = async (episode: PodcastEpisode) => {
    if (!episode.enclosure) return;
    const filename = `${episode.title || 'episode'}.${episode.enclosure.type.split('/')[1] || 'mp3'}`;
    await window.electronAPI.downloadEpisode(episode.enclosure.url, filename);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const text = e.dataTransfer.getData('text/plain');
    const url = text.match(/https?:\/\/[^\s]+/)?.[0];
    if (url) loadFeed(url);
  };

  const toggleListened = (guid: string) => {
    setEpisodeStates((prev) => ({
      ...prev,
      [guid]: {
        ...prev[guid],
        guid,
        listened: !prev[guid]?.listened,
        lastPlayed: Date.now(),
      },
    }));
  };

  const filteredEpisodes = selectedFeed?.episodes.filter((ep) => {
    if (filterListened && episodeStates[ep.guid || '']?.listened) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ep.title.toLowerCase().includes(q) ||
      ep.description?.toLowerCase().includes(q) ||
      ep.persons.some((p) => p.name.toLowerCase().includes(q))
    );
  }) || [];

  if (showMiniPlayer) {
    return (
      <MiniPlayer
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        currentEpisode={selectedEpisode}
        onTogglePlay={player.togglePlay}
        onSeek={player.seek}
        onExpand={() => {
          setShowMiniPlayer(false);
          window.electronAPI?.setMiniPlayer(false);
        }}
      />
    );
  }

  return (
    <div
      className={`app ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Sidebar
        feeds={feeds}
        selectedFeed={selectedFeed}
        onSelectFeed={(feed) => {
          setSelectedFeed(feed);
          setView('feed');
        }}
        onDiscover={() => setView('discover')}
        onRemoveFeed={(guid) => setFeeds((prev) => prev.filter((f) => f.guid !== guid))}
        onExportOPML={handleExportOPML}
        onImportOPML={handleImportOPML}
        theme={theme}
        onToggleTheme={toggleTheme}
        episodeStates={episodeStates}
      />
      <main className="main-content">
        {showSearch && selectedFeed && (
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search episodes... (press / to toggle)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}>×</button>
          </div>
        )}
        {view === 'discover' && (
          <DiscoverView onLoadFeed={loadFeed} onImportOPML={handleImportOPML} />
        )}
        {view === 'feed' && selectedFeed && (
          <FeedView
            feed={selectedFeed}
            episodes={searchQuery || filterListened ? filteredEpisodes : undefined}
            onPlayEpisode={(ep) => playEpisode(ep)}
            onSelectEpisode={(ep) => {
              setSelectedEpisode(ep);
              setShowChapters(!!ep.chapters);
              setShowTranscript(ep.transcripts.length > 0);
              setShowValue(!!ep.value || !!selectedFeed.value);
            }}
            onAddToQueue={(ep) => setQueue((prev) => addToQueue({ queue: prev } as any, ep.guid || '').queue)}
            onDownload={handleDownloadEpisode}
            onToggleListened={toggleListened}
            episodeStates={episodeStates}
            podrollFeeds={selectedFeed.podroll}
            onLoadFeed={loadFeed}
            onShowSocial={(ep) => { setSelectedEpisode(ep); setShowSocial(true); }}
            filterListened={filterListened}
            onToggleFilter={() => setFilterListened(!filterListened)}
          />
        )}
      </main>
      {(showChapters || showTranscript || showValue || showSocial) && selectedEpisode && (
        <aside className="side-panel">
          {showChapters && (
            <ChapterPanel
              chapters={chapters}
              currentTime={player.currentTime}
              onSeek={player.seek}
              onClose={() => setShowChapters(false)}
            />
          )}
          {showTranscript && (
            <TranscriptPanel
              cues={transcript}
              currentTime={player.currentTime}
              onSeek={player.seek}
              onClose={() => setShowTranscript(false)}
            />
          )}
          {showValue && (
            <ValuePanel
              value={selectedEpisode.value || selectedFeed?.value}
              onClose={() => setShowValue(false)}
            />
          )}
          {showSocial && (
            <SocialPanel
              socialInteracts={selectedEpisode.socialInteracts}
              onClose={() => setShowSocial(false)}
            />
          )}
        </aside>
      )}
      <Player
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        playbackRate={player.playbackRate}
        currentEpisode={selectedEpisode}
        currentFeed={selectedFeed}
        onTogglePlay={player.togglePlay}
        onSeek={player.seek}
        onSetVolume={player.setVolume}
        onSetPlaybackRate={player.setPlaybackRate}
        onNext={player.playNext}
        onShowChapters={() => setShowChapters(!showChapters)}
        onShowTranscript={() => setShowTranscript(!showTranscript)}
        onShowValue={() => setShowValue(!showValue)}
        updateAvailable={updateAvailable}
        updateDownloaded={updateDownloaded}
        onInstallUpdate={() => window.electronAPI?.installUpdate()}
        sleepTimer={sleepTimer}
        onShowAbout={() => setShowAbout(true)}
      />
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
