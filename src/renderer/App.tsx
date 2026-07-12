import React, { useState, useCallback, useEffect } from 'react';
import type { PodcastFeed, PodcastEpisode, Chapter, TranscriptCue } from './types';
import { Sidebar } from './components/Sidebar';
import { FeedView } from './components/FeedView';
import { Player } from './components/Player';
import { ChapterPanel } from './components/ChapterPanel';
import { TranscriptPanel } from './components/TranscriptPanel';
import { DiscoverView } from './components/DiscoverView';
import { ValuePanel } from './components/ValuePanel';
import { usePlayer } from './hooks/usePlayer';
import './styles/app.css';

type View = 'discover' | 'feed' | 'episode';

export default function App() {
  const player = usePlayer();
  const [view, setView] = useState<View>('discover');
  const [feeds, setFeeds] = useState<PodcastFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<PodcastFeed | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [showChapters, setShowChapters] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [transcript, setTranscript] = useState<TranscriptCue[]>([]);
  const [feedUrl, setFeedUrl] = useState('');

  const loadFeed = useCallback(async (url: string) => {
    setFeedUrl(url);
    const result = await window.electronAPI.fetchFeed(url);
    if (result.success && result.data) {
      setFeeds((prev) => {
        const exists = prev.some((f) => f.guid === result.data!.guid);
        if (exists) return prev;
        return [...prev, result.data!];
      });
      setSelectedFeed(result.data!);
      setView('feed');
    }
  }, []);

  const playEpisode = useCallback((episode: PodcastEpisode, feed?: PodcastFeed) => {
    player.playEpisode(episode, feed || selectedFeed || undefined);
    setSelectedEpisode(episode);
    if (episode.chapters) loadChapters(episode.chapters.url);
    if (episode.transcripts.length > 0) loadTranscript(episode.transcripts[0].url);
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
      const cues = parseTranscript(result.data);
      setTranscript(cues);
    }
  }, []);

  const parseTranscript = (data: string): TranscriptCue[] => {
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
      // Try WebVTT format
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

  return (
    <div className="app">
      <Sidebar
        feeds={feeds}
        selectedFeed={selectedFeed}
        onSelectFeed={(feed) => {
          setSelectedFeed(feed);
          setView('feed');
        }}
        onDiscover={() => setView('discover')}
      />
      <main className="main-content">
        {view === 'discover' && (
          <DiscoverView onLoadFeed={loadFeed} />
        )}
        {view === 'feed' && selectedFeed && (
          <FeedView
            feed={selectedFeed}
            onPlayEpisode={(ep) => playEpisode(ep)}
            onSelectEpisode={(ep) => {
              setSelectedEpisode(ep);
              setShowChapters(!!ep.chapters);
              setShowTranscript(ep.transcripts.length > 0);
              setShowValue(!!ep.value || !!selectedFeed.value);
            }}
            onAddToQueue={player.addToQueue}
          />
        )}
      </main>
      {(showChapters || showTranscript || showValue) && selectedEpisode && (
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
      />
    </div>
  );
}
