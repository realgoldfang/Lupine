import { useState, useRef, useCallback, useEffect } from 'react';
import type { PodcastEpisode, PodcastFeed } from '../types';

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [currentFeed, setCurrentFeed] = useState<PodcastFeed | null>(null);
  const [queue, setQueue] = useState<PodcastEpisode[]>([]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    }
  }, []);

  const playEpisode = useCallback((episode: PodcastEpisode, feed?: PodcastFeed) => {
    if (!audioRef.current || !episode.enclosure) return;
    audioRef.current.src = episode.enclosure.url;
    audioRef.current.load();
    audioRef.current.play();
    setCurrentEpisode(episode);
    if (feed) setCurrentFeed(feed);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolumeState(vol);
    }
  }, []);

  const setPlaybackRateState = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const addToQueue = useCallback((episode: PodcastEpisode) => {
    setQueue((prev) => [...prev, episode]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      setQueue((prev) => prev.slice(1));
      playEpisode(next);
    }
  }, [queue, playEpisode]);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    currentEpisode,
    currentFeed,
    queue,
    playEpisode,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate: setPlaybackRateState,
    addToQueue,
    removeFromQueue,
    playNext,
  };
}
