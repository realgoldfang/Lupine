import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  fetchFeed: (url: string) => ipcRenderer.invoke('fetch-feed', url),
  fetchChapters: (url: string) => ipcRenderer.invoke('fetch-chapters', url),
  fetchTranscript: (url: string) => ipcRenderer.invoke('fetch-transcript', url),
  downloadEpisode: (url: string, filename: string) => ipcRenderer.invoke('download-episode', url, filename),
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('write-file', path, content),
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  setMiniPlayer: (mini: boolean) => ipcRenderer.invoke('set-mini-player', mini),
  installUpdate: () => ipcRenderer.invoke('install-update'),

  onMediaPlayPause: (callback: () => void) => ipcRenderer.on('media-play-pause', callback),
  onMediaNext: (callback: () => void) => ipcRenderer.on('media-next', callback),
  onMediaPrevious: (callback: () => void) => ipcRenderer.on('media-previous', callback),
  onUpdateAvailable: (callback: (info: any) => void) => ipcRenderer.on('update-available', (_event, info) => callback(info)),
  onUpdateDownloaded: (callback: () => void) => ipcRenderer.on('update-downloaded', callback),
});
