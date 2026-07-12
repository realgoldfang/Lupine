import { app, BrowserWindow, ipcMain, protocol, globalShortcut, Tray, Menu, nativeImage, session } from 'electron';
import path from 'path';
import { parsePodcastFeed } from './parser';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

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

  mainWindow.on('close', (e) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  createTray();
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Play/Pause', click: () => mainWindow?.webContents.send('media-play-pause') },
    { label: 'Next', click: () => mainWindow?.webContents.send('media-next') },
    { label: 'Previous', click: () => mainWindow?.webContents.send('media-previous') },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit(); } },
  ]);

  tray.setToolTip('Lupine');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow?.show());
}

function registerMediaKeys() {
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow?.webContents.send('media-play-pause');
  });
  globalShortcut.register('MediaNextTrack', () => {
    mainWindow?.webContents.send('media-next');
  });
  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow?.webContents.send('media-previous');
  });
}

function setupAutoUpdate() {
  if (process.env.NODE_ENV === 'production') {
    try {
      const { autoUpdater } = require('electron-updater');
      autoUpdater.checkForUpdatesAndNotify();
      autoUpdater.on('update-available', () => {
        mainWindow?.webContents.send('update-available');
      });
      autoUpdater.on('update-downloaded', () => {
        mainWindow?.webContents.send('update-downloaded');
      });
    } catch {}
  }
}

app.whenReady().then(() => {
  createWindow();
  registerMediaKeys();
  setupAutoUpdate();

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('fetch-feed', async (_event, url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Lupine/1.0 (https://www.cybernate.dev/products/lupine)',
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

ipcMain.handle('download-episode', async (_event, url: string, filename: string) => {
  try {
    const { dialog } = require('electron');
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: filename,
      filters: [{ name: 'Audio', extensions: ['mp3', 'm4a', 'ogg', 'opus', 'wav'] }],
    });
    if (result.canceled) return { success: false, error: 'Cancelled' };

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const fs = require('fs');
    fs.writeFileSync(result.filePath, buffer);
    return { success: true, path: result.filePath };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('show-save-dialog', async (_event, options: any) => {
  const { dialog } = require('electron');
  return dialog.showSaveDialog(mainWindow!, options);
});

ipcMain.handle('show-open-dialog', async (_event, options: any) => {
  const { dialog } = require('electron');
  return dialog.showOpenDialog(mainWindow!, options);
});

ipcMain.handle('write-file', async (_event, path: string, content: string) => {
  const fs = require('fs');
  fs.writeFileSync(path, content);
});

ipcMain.handle('read-file', async (_event, path: string) => {
  const fs = require('fs');
  return fs.readFileSync(path, 'utf-8');
});

ipcMain.handle('minimize-window', () => mainWindow?.minimize());
ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle('close-window', () => mainWindow?.hide());
ipcMain.handle('set-mini-player', (_event, mini: boolean) => {
  if (mini) {
    mainWindow?.setSize(350, 100);
    mainWindow?.setAlwaysOnTop(true);
  } else {
    mainWindow?.setSize(1400, 900);
    mainWindow?.setAlwaysOnTop(false);
  }
});

ipcMain.handle('install-update', () => {
  const { autoUpdater } = require('electron-updater');
  autoUpdater.quitAndInstall();
});
