import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import Encoding from 'encoding-japanese';
import { FrontMatter, RecentDataset, WritingData } from '../renderer/structure';
import { openProjectConfigFile } from './fileio/projectConfig';
import {
  checkAndInitializeDirectory,
  frontMatterMerge,
  frontMatterSeparate,
  readFile,
  readFileAndParse,
  setupFileGenFunction,
} from './fileio/file';
import { getGlobalStore } from './fileio/globalStore';
import { FileServerConfig } from './server/server';
import { ProjectConfigInterface, SaveInterface } from '../common/interfaces';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: string, ...args: any[]): Promise<any> {
      return ipcRenderer.invoke(channel, args);
    },
  },
  checkFolderExist: (p: string) => {
    if (!fs.existsSync(p)) return false;
    return fs.lstatSync(p).isDirectory();
  },
  checkFileExist: (p: string) => {
    if (!fs.existsSync(p)) return false;
    return fs.lstatSync(p).isFile();
  },
  openProjectConfigFile: (projectPath: string): ProjectConfigInterface => {
    // フォルダが存在するか

    return openProjectConfigFile(projectPath).store;
  },
  genRecentlyDataset: (projectPath: string): RecentDataset[] => {
    const store = openProjectConfigFile(projectPath);
    const recentlyOpenFiles = store.get('recentlyOpenFiles') || [];
    console.log('recentlyOpenFiles: ', recentlyOpenFiles);
    const paths = recentlyOpenFiles.filter((p) => fs.existsSync(p));
    console.log('paths: ', paths);
    return paths.map((p) => {
      const dataStr = readFile(p);
      const { attributes } = frontMatterSeparate(dataStr);
      console.log('attributes', attributes);
      return {
        title: attributes.title || '',
        place: p,
      };
    });
  },
  readFileAndParse: (
    projectPath: string,
    projectRelativePath: string
  ): WritingData => {
    return readFileAndParse(projectPath, projectRelativePath);
  },
  exec: (cmd: string, cwd: string) => {
    const isWin = process.platform === 'win32';
    const result = execSync(`${cmd} 2>&1`, {
      cwd,
    });
    if (isWin)
      return Encoding.convert(result, {
        from: 'SJIS',
        to: 'UNICODE',
        type: 'string',
      });
    return result.toString();
  },
  newFileGenerator: (
    isContinue: boolean,
    folderPath: string,
    statement: string
  ): SaveInterface => {
    return setupFileGenFunction(isContinue, folderPath, statement);
  },
  pushRecentlyData: (projectPath: string, p: string) => {
    const store = openProjectConfigFile(projectPath);
    let recentlyOpenFiles = store.get('recentlyOpenFiles') || [];

    if (recentlyOpenFiles.indexOf(p) > -1) {
      const idx = recentlyOpenFiles.indexOf(p);
      recentlyOpenFiles.splice(idx, 1);
    }
    recentlyOpenFiles.push(p);
    // size fix
    recentlyOpenFiles = recentlyOpenFiles.slice(-10);
    store.set({ recentlyOpenFiles });
  },
  frontMatterMerge: (attributes: FrontMatter, body: string) => {
    return frontMatterMerge(attributes, body);
  },
  storeSet: (projectPath: string, kv: Partial<ProjectConfigInterface>) => {
    const store = openProjectConfigFile(projectPath);
    store.set(kv);
  },
  storeGet: <Key extends keyof ProjectConfigInterface>(
    projectPath: string,
    key: Key
  ): ProjectConfigInterface[Key] => {
    const store = openProjectConfigFile(projectPath);
    return store.get(key);
  },
  getFileServerPort: async () => {
    const fsc = (await ipcRenderer.invoke(
      'FileServerConfig'
    )) as FileServerConfig;

    return fsc.port;
  },
  setCwd: async (cwd: string) => {
    await ipcRenderer.invoke('FileServerConfigsSetCwd', cwd);
  },
  pushRecentlyOpenProject: (projectPath: string) => {
    const store = getGlobalStore();
    let recentlyOpenProjects = store.get('recentlyOpenProjects');
    if (recentlyOpenProjects) {
      const alreadyIndex = recentlyOpenProjects.indexOf(projectPath);
      if (alreadyIndex > -1) {
        recentlyOpenProjects.splice(alreadyIndex, 1);
      }
      recentlyOpenProjects.push(projectPath);
      recentlyOpenProjects = recentlyOpenProjects.slice(-10);
      store.set({ recentlyOpenProjects });
    } else store.set('recentlyOpenProjects', [projectPath]);
  },
  pullRecentlyOpenProject: (): Array<string> => {
    const store = getGlobalStore();
    return store.get('recentlyOpenProjects');
  },
  openDiaryTemplate: (projectPath: string) => {
    checkAndInitializeDirectory(projectPath);
    return readFile(
      path.join(projectPath, '.hugo-text-writer', 'template', 'diary.md')
    );
  },
  openArticleTemplate: (projectPath: string) => {
    checkAndInitializeDirectory(projectPath);
    return readFile(
      path.join(projectPath, '.hugo-text-writer', 'template', 'article.md')
    );
  },
  pathSplitBySep: (p: string) => {
    return p.split(path.sep);
  },
  pathJoin: (...params: string[]) => {
    return path.join(...params);
  },
});
