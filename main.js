const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, shell, nativeImage, protocol, net, globalShortcut, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

// Register custom protocol scheme before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

let mainWindow;
let appTray;
let isMiniMode = false;
let normalBounds = null;
const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
}

const isPackaged = app.isPackaged;
const EXE_DIR = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.flac']);
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function getSoundsDir() {
  const possiblePaths = [
    path.join(__dirname, 'PrimeMixSound'),
    path.join(__dirname, 'PrimeMix_Data'),
    path.resolve(EXE_DIR, '..', 'PrimeMixSound'),
    path.resolve(EXE_DIR, '..', 'PrimeMix_Data'),
    path.resolve(__dirname, '..', 'PrimeMixSound'),
    path.resolve(__dirname, '..', 'PrimeMix_Data'),
    path.join(EXE_DIR, 'PrimeMix_Data'),
    path.join(EXE_DIR, 'PrimeMixSound')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const files = fs.readdirSync(p);
        if (files.some(f => AUDIO_EXTENSIONS.has(path.extname(f).toLowerCase()))) {
          return p;
        }
      } catch (e) {}
    }
  }
  return isPackaged
    ? path.join(EXE_DIR, 'PrimeMix_Data')
    : path.join(__dirname, 'PrimeMixSound');
}

const SOUNDS_DIR = getSoundsDir();

const METADATA_PATH = path.join(SOUNDS_DIR, 'metadata.json');
const COVERS_DIR = path.join(SOUNDS_DIR, 'covers');
let metadataWriteQueue = Promise.resolve();

function isTrustedSender(event) {
  return Boolean(mainWindow && !mainWindow.isDestroyed() && event.sender === mainWindow.webContents);
}

function resolveInside(baseDir, candidate) {
  if (typeof candidate !== 'string' || candidate.includes('\0')) return null;
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, candidate);
  const relative = path.relative(base, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return resolved;
}

function validateSoundFilename(filename) {
  return typeof filename === 'string'
    && path.basename(filename) === filename
    && AUDIO_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

async function readMetadataFile() {
  try {
    const content = await fs.promises.readFile(METADATA_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Metadata could not be read:', error);
    return {};
  }
}

async function readMetadata() {
  await metadataWriteQueue.catch(() => {});
  return readMetadataFile();
}

function updateMetadataAtomic(mutator) {
  metadataWriteQueue = metadataWriteQueue.catch(() => {}).then(async () => {
    const metadata = await readMetadataFile();
    await mutator(metadata);
    const tempPath = `${METADATA_PATH}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(metadata, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, METADATA_PATH);
  });
  return metadataWriteQueue;
}

function sanitizeMetadataUpdate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const sanitized = {};
  if (typeof data.title === 'string') sanitized.title = data.title.trim().slice(0, 120);
  if (typeof data.category === 'string') sanitized.category = data.category.trim().slice(0, 50);
  if (Number.isFinite(data.volume)) sanitized.volume = Math.min(1, Math.max(0, data.volume));
  if (typeof data.color === 'string' && data.color.length <= 200) sanitized.color = data.color;
  return sanitized;
}

function sanitizeMixes(data) {
  if (!Array.isArray(data) || data.length > 500) return null;
  const sanitized = [];
  for (const mix of data) {
    if (!mix || typeof mix !== 'object' || Array.isArray(mix)) return null;
    const name = typeof mix.name === 'string' ? mix.name.trim().slice(0, 80) : '';
    if (!name || !Array.isArray(mix.sounds) || mix.sounds.length > 3) return null;
    const mixSounds = [];
    for (const sound of mix.sounds) {
      if (!sound || !validateSoundFilename(sound.filename)) return null;
      const volume = Number(sound.volume);
      if (!Number.isFinite(volume)) return null;
      mixSounds.push({ filename: sound.filename, volume: Math.min(1, Math.max(0, volume)) });
    }
    sanitized.push({
      id: typeof mix.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(mix.id)
        ? mix.id
        : `mix_${Date.now()}_${sanitized.length}`,
      name,
      sounds: mixSounds
    });
  }
  return sanitized;
}

// Ensure directories exist
if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}
if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1160,
    height: 840,
    minWidth: 340,
    minHeight: 220,
    frame: false,
    transparent: false,
    backgroundColor: '#0b0c10',
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true
    },
    show: true
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());

  mainWindow.on('maximize', () => {
    if (!isMiniMode) mainWindow.webContents.send('window-state-changed', 'maximized');
  });

  mainWindow.on('unmaximize', () => {
    if (!isMiniMode) mainWindow.webContents.send('window-state-changed', 'restored');
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function updateTrayMenu(lang) {
  if (!appTray) return;

  const isTr = lang === 'tr';
  const showHideLabel = isTr ? 'Göster / Gizle' : 'Show / Hide';
  const stopAllLabel = isTr ? 'Tüm Sesleri Durdur' : 'Stop All Sounds';
  const exitLabel = isTr ? 'Çıkış' : 'Exit';

  const contextMenu = Menu.buildFromTemplate([
    { label: 'PrimeMix', enabled: false },
    { type: 'separator' },
    { label: showHideLabel, click: () => toggleWindow() },
    { label: stopAllLabel, click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('stop-all-sounds');
        }
      }
    },
    { type: 'separator' },
    { label: exitLabel, click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  appTray.setContextMenu(contextMenu);
}

function createTray() {
  const iconPath = path.join(__dirname, 'app_icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  appTray = new Tray(icon);
  
  updateTrayMenu('en');
  appTray.setToolTip('PrimeMix');

  appTray.on('click', () => {
    toggleWindow();
  });
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

// App lifecycle
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  protocol.handle('media', (request) => {
    try {
      let urlPath = request.url.replace(/^media:\/\//, '');
      if (/^[a-zA-Z]\//.test(urlPath)) {
        urlPath = urlPath[0] + ':' + urlPath.slice(1);
      }
      const decodedPath = decodeURIComponent(urlPath);
      const mediaPath = resolveInside(SOUNDS_DIR, decodedPath);
      if (!mediaPath) return new Response('Forbidden', { status: 403 });
      const extension = path.extname(mediaPath).toLowerCase();
      if (!AUDIO_EXTENSIONS.has(extension) && !IMAGE_EXTENSIONS.has(extension)) {
        return new Response('Unsupported media type', { status: 415 });
      }
      return net.fetch(pathToFileURL(mediaPath).toString());
    } catch (error) {
      console.error('Media request rejected:', error);
      return new Response('Bad request', { status: 400 });
    }
  });

  createWindow();
  createTray();
  startWatcher();

  // Global Shortcuts for Media Play/Pause
  try {
    globalShortcut.register('MediaPlayPause', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('toggle-global-play');
      }
    });
    globalShortcut.register('CommandOrControl+Alt+P', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('toggle-global-play');
      }
    });
  } catch (err) {
    console.error('Global shortcut registration failed:', err);
  }
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

app.on('before-quit', () => {
  app.isQuiting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Directory Watcher
let watchTimeout = null;
function startWatcher() {
  try {
    fs.watch(SOUNDS_DIR, (eventType, filename) => {
      if (!filename) return;
      const ext = path.extname(filename).toLowerCase();
      if (AUDIO_EXTENSIONS.has(ext)) {
        if (watchTimeout) clearTimeout(watchTimeout);
        watchTimeout = setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('sounds-changed');
          }
        }, 500);
      }
    });
  } catch (err) {
    console.error('Directory watcher error:', err);
  }
}

// IPC Handlers
ipcMain.handle('get-sounds', async (event) => {
  try {
    if (!isTrustedSender(event)) return { success: false, error: 'Invalid request.' };
    if (!fs.existsSync(SOUNDS_DIR)) {
      await fs.promises.mkdir(SOUNDS_DIR, { recursive: true });
    }
    if (!fs.existsSync(COVERS_DIR)) {
      await fs.promises.mkdir(COVERS_DIR, { recursive: true });
    }
    const files = await fs.promises.readdir(SOUNDS_DIR);
    const metadata = await readMetadata();

    const soundList = [];
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (AUDIO_EXTENSIONS.has(ext)) {
        const fileMetadata = metadata[file] || {};
        let autoTitle = path.basename(file, ext).replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        soundList.push({
          filename: file,
          filePath: path.join(SOUNDS_DIR, file),
          title: fileMetadata.title || autoTitle,
          cover: fileMetadata.cover || null,
          category: fileMetadata.category || 'Genel',
          volume: Number.isFinite(fileMetadata.volume) ? Math.min(1, Math.max(0, fileMetadata.volume)) : 1.0,
          color: fileMetadata.color || getRandomGradient()
        });
      }
    });

    return { success: true, sounds: soundList };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-sound-metadata', async (event, filename, data) => {
  try {
    if (!isTrustedSender(event) || !validateSoundFilename(filename)) {
      return { success: false, error: 'Invalid request.' };
    }
    const sanitized = sanitizeMetadataUpdate(data);
    if (!sanitized) return { success: false, error: 'Invalid metadata.' };
    await updateMetadataAtomic(metadata => {
      metadata[filename] = { ...(metadata[filename] || {}), ...sanitized };
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-sound', async (event, filename) => {
  try {
    if (!isTrustedSender(event) || !validateSoundFilename(filename)) {
      return { success: false, error: 'Invalid request.' };
    }
    const filePath = resolveInside(SOUNDS_DIR, filename);
    if (!filePath) return { success: false, error: 'Invalid file path.' };
    await fs.promises.rm(filePath, { force: true });

    await updateMetadataAtomic(async metadata => {
      if (metadata[filename] && metadata[filename].cover) {
        const coverPath = resolveInside(COVERS_DIR, path.basename(metadata[filename].cover));
        if (coverPath) await fs.promises.rm(coverPath, { force: true });
      }
      delete metadata[filename];
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-sound-dialog', async (event) => {
  try {
    if (!isTrustedSender(event)) return { success: false, error: 'Invalid request.' };
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Ses Dosyaları', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac'] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const srcPath = result.filePaths[0];
    const filename = path.basename(srcPath);
    if (!validateSoundFilename(filename)) return { success: false, error: 'Unsupported audio file.' };
    const destPath = resolveInside(SOUNDS_DIR, filename);
    await fs.promises.copyFile(srcPath, destPath, fs.constants.COPYFILE_EXCL);

    return { success: true, filename: filename };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-cover-dialog', async (event, soundFilename) => {
  try {
    if (!isTrustedSender(event) || !validateSoundFilename(soundFilename)) {
      return { success: false, error: 'Invalid request.' };
    }
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Resim Dosyaları', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const srcPath = result.filePaths[0];
    const ext = path.extname(srcPath).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) return { success: false, error: 'Unsupported image file.' };
    const coverFilename = `${path.basename(soundFilename, path.extname(soundFilename))}_cover${ext}`;
    const destPath = resolveInside(COVERS_DIR, coverFilename);

    await fs.promises.copyFile(srcPath, destPath);

    await updateMetadataAtomic(metadata => {
      metadata[soundFilename] = { ...(metadata[soundFilename] || {}), cover: `covers/${coverFilename}` };
    });

    return { success: true, coverPath: `covers/${coverFilename}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Import/Export Mixes Dialogs
ipcMain.handle('export-mixes-dialog', async (event, mixesData) => {
  try {
    if (!isTrustedSender(event)) return { success: false, error: 'Invalid request.' };
    const sanitizedMixes = sanitizeMixes(mixesData);
    if (!sanitizedMixes) return { success: false, error: 'Invalid mix data.' };
    const result = await dialog.showSaveDialog({
      title: 'Karışımları Dışa Aktar',
      defaultPath: 'PrimeMix_Karisimlar.json',
      filters: [{ name: 'JSON Dosyaları', extensions: ['json'] }]
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    await fs.promises.writeFile(result.filePath, JSON.stringify(sanitizedMixes, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-mixes-dialog', async (event) => {
  try {
    if (!isTrustedSender(event)) return { success: false, error: 'Invalid request.' };
    const result = await dialog.showOpenDialog({
      title: 'Karışımları İçe Aktar',
      properties: ['openFile'],
      filters: [{ name: 'JSON Dosyaları', extensions: ['json'] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const content = await fs.promises.readFile(result.filePaths[0], 'utf-8');
    if (Buffer.byteLength(content, 'utf8') > 1024 * 1024) {
      return { success: false, error: 'Import file is too large.' };
    }
    const importedData = sanitizeMixes(JSON.parse(content));
    if (!importedData) return { success: false, error: 'Invalid mix file.' };
    return { success: true, data: importedData };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Mini Mode Toggle IPC
ipcMain.handle('toggle-mini-mode', async (event) => {
  if (!isTrustedSender(event)) return { success: false };
  if (!mainWindow) return { success: false };

  isMiniMode = !isMiniMode;

  if (isMiniMode) {
    normalBounds = mainWindow.getBounds();
    mainWindow.setAlwaysOnTop(true, 'floating');
    mainWindow.setBounds({ width: 340, height: 270 });
    mainWindow.setResizable(false);
  } else {
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setResizable(true);
    if (normalBounds) {
      mainWindow.setBounds(normalBounds);
    } else {
      mainWindow.setBounds({ width: 1160, height: 840 });
    }
  }

  mainWindow.webContents.send('mini-mode-changed', isMiniMode);
  return { success: true, isMiniMode: isMiniMode };
});

// Window controls
ipcMain.on('window-minimize', (event) => { if (isTrustedSender(event)) mainWindow.minimize(); });
ipcMain.on('window-maximize', (event) => {
  if (!isTrustedSender(event) || isMiniMode) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window-close', (event) => { if (isTrustedSender(event)) mainWindow.hide(); });
ipcMain.on('open-folder', (event) => { if (isTrustedSender(event)) shell.openPath(SOUNDS_DIR); });
ipcMain.on('open-external', (event, url) => {
  if (!isTrustedSender(event) || typeof url !== 'string') return;
  try {
    const parsed = new URL(url);
    const allowedHttps = parsed.protocol === 'https:' && parsed.hostname === 'github.com';
    const allowedEmail = parsed.protocol === 'mailto:' && parsed.pathname === 'b.maximus.prime@gmail.com';
    if (allowedHttps || allowedEmail) shell.openExternal(url);
  } catch (error) {
    console.error('External URL rejected:', error);
  }
});
ipcMain.on('set-language', (event, lang) => {
  if (isTrustedSender(event) && (lang === 'tr' || lang === 'en')) updateTrayMenu(lang);
});

ipcMain.handle('get-startup-settings', (event) => {
  if (!isTrustedSender(event)) return false;
  return app.getLoginItemSettings().openAtLogin;
});
ipcMain.handle('set-startup-settings', (event, openAtLogin) => {
  if (!isTrustedSender(event) || typeof openAtLogin !== 'boolean') {
    return { success: false, error: 'Invalid request.' };
  }
  app.setLoginItemSettings({ openAtLogin, path: app.getPath('exe') });
  return { success: true };
});

const gradients = [
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
  'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)'
];

function getRandomGradient() {
  return gradients[Math.floor(Math.random() * gradients.length)];
}
