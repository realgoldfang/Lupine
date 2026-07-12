import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import path from 'path';
import { parsePodcastFeed } from './parser';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  protocol.registerFileProtocol('atom', (request, callback) => {
    const filePath = request.url.replace('atom://', '');
    callback({ path: path.join(__dirname, '../public', filePath) });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('fetch-feed', async (_event, url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Podcast2Desktop/1.0 (https://github.com/podcast2)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const feed = parsePodcastFeed(xml);
    return { success: true, data: feed };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('fetch-chapters', async (_event, url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return { success: true, data: json };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('fetch-transcript', async (_event, url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    return { success: true, data: text };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('search-podcasts', async (_event, query: string) => {
  try {
    const response = await fetch(
      `https://podcastindex.org/podcast/${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': 'Podcast2Desktop/1.0' } }
    );
    const text = await response.text();
    return { success: true, data: text };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});
