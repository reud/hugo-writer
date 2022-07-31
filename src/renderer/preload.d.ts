import { Channels } from 'main/preload';
import { ProjectConfigInterface, SaveInterface } from '../common/interfaces';
import { FrontMatter, RecentDataset, WritingData } from './structure';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
        invoke(channel: string, ...args: unknown[]): Promise<any>;
      };
      checkFolderExist: (p: string) => boolean;
      checkFileExist: (p: string) => boolean;
      openProjectConfigFile: (projectPath: string) => ProjectConfigInterface;
      genRecentlyDataset: (projectPath: string) => RecentDataset[];
      readFileAndParse: (
        projectPath: string,
        projectRelativePath: string
      ) => WritingData;
      exec: (cmd: string, cwd: string) => string;
      newFileGenerator: (
        isContinue: boolean,
        folderPath: string,
        statement: string
      ) => SaveInterface;
      pushRecentlyData: (projectPath: string, p: string) => void;
      frontMatterMerge: (
        attributes: FrontMatter,
        body: string,
        customString: string[],
        customParam: Record<string, any>
      ) => string;
      storeSet: (
        projectPath: string,
        kv: Partial<ProjectConfigInterface>
      ) => void;
      storeGet: <Key extends keyof ProjectConfigInterface>(
        projectPath: string,
        key: Key
      ) => ProjectConfigInterface[Key];
      getFileServerPort: () => Promise<number>;
      setCwd: (cwd: string) => Promise<void>;
      pushRecentlyOpenProject: (projectPath: string) => void;
      pullRecentlyOpenProject: () => Array<string>;
      openDiaryTemplate: (projectPath: string) => string;
      openArticleTemplate: (projectPath: string) => string;
      pathSplitBySep: (p: string) => string[];
      pathJoin: (...params: string[]) => string;
    };
  }
}

export {};
