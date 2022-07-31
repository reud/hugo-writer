/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  openArticleFolder,
  openArticleTemplateFile,
  openDiaryFolder,
  openDiaryTemplateFile,
  openFolder,
  openProject,
} from './fileio/file';
import { expressStartApp, FileServerConfig } from './server/server';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// https://issuehunt.io/r/sindresorhus/electron-store/issues/212
Store.initRenderer();

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-ignore
const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 600,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      devTools: true,
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  mainWindow.webContents.on('did-frame-finish-load', async () => {
    if (isDebug) {
      mainWindow!.webContents.openDevTools();
      // await installExtensions();
    }
  });

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * ipcMain Events
 */

// dialog open系はipc経由じゃないと動かない
ipcMain.handle('openFolder', async (_ev, arg) => {
  return openFolder(arg[0]);
});
// dialog open系はipc経由じゃないと動かない
ipcMain.handle('openProject', async () => {
  return openProject();
});

ipcMain.handle('openDiaryFolder', async (_ev, arg) => {
  return openDiaryFolder(arg[0]);
});

ipcMain.handle('openArticleFolder', async (_ev, arg) => {
  return openArticleFolder(arg[0]);
});

ipcMain.handle('openDiaryTemplateFile', async (_ev, arg) => {
  return openDiaryTemplateFile(arg[0]);
});

ipcMain.handle('openArticleTemplateFile', async (_ev, arg) => {
  return openArticleTemplateFile(arg[0]);
});

ipcMain.handle('FileServerConfig', async () => {
  return FileServerConfig.getInstance();
});

ipcMain.handle('FileServerConfigsSetCwd', async (_ev, arg) => {
  // eslint-disable-next-line prefer-destructuring
  FileServerConfig.getInstance().cwd = arg;
});

expressStartApp();

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', async () => {
      // On macOS, it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
