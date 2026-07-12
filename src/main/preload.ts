import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  fetchFeed: (url: string) => ipcRenderer.invoke('fetch-feed', url),
  fetchChapters: (url: string) => ipcRenderer.invoke('fetch-chapters', url),
  fetchTranscript: (url: string) => ipcRenderer.invoke('fetch-transcript', url),
  searchPodcasts: (query: string) => ipcRenderer.invoke('search-podcasts', query),
});
