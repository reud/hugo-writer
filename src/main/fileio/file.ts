import * as fs from 'fs';
import yaml from 'yaml';
import fm from 'front-matter';

import { dialog } from 'electron';
import path from 'path';
import { FrontMatter, WritingData } from '../../renderer/structure';
import { articleTemple, diaryTemplate } from '../../renderer/template/template';
import { openProjectConfigFile } from './projectConfig';

export const setupFileGenFunction = (
  isContinue: boolean,
  folderPath: string,
  statement: string
) => {
  if (!isContinue) {
    console.log('checking path: ', folderPath);
    if (fs.existsSync(folderPath)) {
      throw new Error('すでにファイルかフォルダが存在しています');
    }
    console.log(folderPath);
    fs.mkdirSync(folderPath);
  }
  fs.writeFileSync(path.join(folderPath, 'index.md'), statement);
  return {
    save: (s: string) => {
      fs.writeFileSync(path.join(folderPath, 'index.md'), s);
    },
  };
};

export const frontMatterSeparate = (frontMatterMarkdown: string) => {
  const frontMatterParsed = fm<Partial<FrontMatter>>(frontMatterMarkdown);
  console.log('separate result', frontMatterParsed);
  return frontMatterParsed;
};

export const frontMatterMerge = (
  attributes: FrontMatter,
  body: string,
  customString: string[],
  customParam: Record<string, any>
) => {
  const mdTemplate = `---
<FRONT_MATTER><CUSTOM_STRING>
---
<BODY>
`;
  const merged = { ...attributes, ...customParam };
  const frontMatter = yaml.stringify(merged);
  let result = mdTemplate.replace('<FRONT_MATTER>', frontMatter);
  result = result.replace('<CUSTOM_STRING>', customString.join('\n'));
  result = result.replace('<BODY>', body);
  return result;
};

export const readFile = (p: string) => {
  return `${fs.readFileSync(p, 'utf-8')}`;
};

export const readFileAndParse = (
  projectPath: string,
  projectRelativePath: string
): WritingData => {
  const mdStr = readFile(projectPath + projectRelativePath);
  const { attributes, body } = frontMatterSeparate(mdStr);

  // remove content base
  // `${contentBasePath}${obj.path}${obj.folderName}/index.md`
  const splitted = projectRelativePath.split(path.sep).filter((v) => v);
  console.log(projectRelativePath);
  console.log(splitted);
  const folderName = splitted[splitted.length - 2]; // 最後の一個前がfolderName
  const contentSelectionPath = path.join(
    ...splitted.slice(0, splitted.length - 2)
  );
  console.log(
    'contentSelectionPath',
    contentSelectionPath,
    'sliced',
    splitted.slice(0, splitted.length - 2)
  );

  const ret = {
    title: attributes.title || '',
    datetime: attributes.date || '',
    author: attributes.author || '',
    category: attributes.categories || ['something'],
    contentStr: body,
    path: contentSelectionPath,
    folderName,
    isContinue: true,
    draft: attributes.draft || false,
  };

  console.log('readFileAndParse: ', ret);
  return ret;
};

export const checkAndInitializeDirectory = (projectPath: string) => {
  // ディレクトリがあるかどうか
  const isExist = fs.existsSync(path.join(projectPath, '.hugo-text-writer'));
  if (!isExist) {
    fs.mkdirSync(path.join(projectPath, '.hugo-text-writer'));
  }

  if (!fs.statSync(path.join(projectPath, '.hugo-text-writer')).isDirectory()) {
    fs.mkdirSync(path.join(projectPath, '.hugo-text-writer'));
  }
  // テンプレートファイルの初期化
  // ディレクトリがあるかどうか
  if (!fs.existsSync(path.join(projectPath, '.hugo-text-writer'))) {
    fs.mkdirSync(path.join(projectPath, '.hugo-text-writer'));
  }

  if (
    !fs.existsSync(path.join(projectPath, '.hugo-text-writer', 'template')) ||
    !fs
      .statSync(path.join(projectPath, '.hugo-text-writer', 'template'))
      .isDirectory()
  ) {
    fs.mkdirSync(path.join(projectPath, '.hugo-text-writer', 'template'));
  }

  if (
    !fs.existsSync(
      path.join(projectPath, '.hugo-text-writer', 'template', 'article.md')
    )
  ) {
    fs.writeFileSync(
      path.join(projectPath, '.hugo-text-writer', 'template', 'article.md'),
      articleTemple
    );
  }

  if (
    !fs.existsSync(
      path.join(projectPath, '.hugo-text-writer', 'template', 'diary.md')
    )
  ) {
    fs.writeFileSync(
      path.join(projectPath, '.hugo-text-writer', 'template', 'diary.md'),
      diaryTemplate
    );
  }

  // 設定ファイルの初期化
  openProjectConfigFile(projectPath);
};

export const openProject = (): string => {
  const homedir =
    process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
  const ret = dialog.showOpenDialogSync({
    title: 'hugoプロジェクトのルートフォルダの選択',
    defaultPath: homedir,
    properties: ['openDirectory'],
  });
  const v = ret === undefined ? '' : ret[0];
  if (v === '') return '';

  checkAndInitializeDirectory(v);
  return v;
};

export const openFolder = (defaultPath: string): string => {
  console.log('defaultPath: ', defaultPath);
  const ret = dialog.showOpenDialogSync({
    title: '編集する記事の存在するディレクトリの選択',
    defaultPath,
    properties: ['openDirectory'],
  });
  return ret === undefined ? '' : ret[0];
};

export const openDiaryFolder = (defaultPath: string): string => {
  console.log('defaultPath: ', defaultPath);
  const ret = dialog.showOpenDialogSync({
    title: '日記の存在するディレクトリの選択',
    defaultPath,
    properties: ['openDirectory'],
  });
  return ret === undefined ? '' : ret[0];
};

export const openArticleFolder = (defaultPath: string): string => {
  console.log('defaultPath: ', defaultPath);
  const ret = dialog.showOpenDialogSync({
    title: '記事の存在するディレクトリの選択',
    defaultPath,
    properties: ['openDirectory'],
  });
  return ret === undefined ? '' : ret[0];
};

export const openDiaryTemplateFile = (defaultPath: string): string => {
  console.log('defaultPath: ', defaultPath);
  const ret = dialog.showOpenDialogSync({
    title: '日記のテンプレートファイルの選択',
    defaultPath,
    properties: ['openFile'],
    filters: [{ name: 'MarkdownFile', extensions: ['md'] }],
  });
  return ret === undefined ? '' : ret[0];
};

export const openArticleTemplateFile = (defaultPath: string): string => {
  console.log('defaultPath: ', defaultPath);
  const ret = dialog.showOpenDialogSync({
    title: '記事のテンプレートファイルの選択',
    defaultPath,
    properties: ['openFile'],
    filters: [{ name: 'MarkdownFile', extensions: ['md'] }],
  });
  const v = ret === undefined ? '' : ret[0];
  console.log(v);
  return v;
};
