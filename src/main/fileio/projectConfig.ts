import Store, { Schema } from 'electron-store';
import {
  GenreInterface,
  ProjectConfigInterface,
} from '../../common/interfaces';

// 形式
// <DATETIME>: 2021-01-08T22:00:00+09:00
// <DATE>: 2021/01/08
// <DATE8D>: 20210108
// <TODAY_**>: returns today <**>
// <RANDOM_STR>: 16 digits random string

const articleSchema: Schema<GenreInterface> = {
  folderPath: {
    type: 'string',
    default: '/content/article/',
  },
  title: {
    type: 'string',
    default: '<TODAY_DATE>の記事',
  },
  datetime: {
    type: 'string',
    default: '<TODAY_DATETIME>',
  },
  author: {
    type: 'string',
    default: 'Anonymous',
  },
  category: {
    type: 'array',
    default: ['article'],
  },
  folderName: {
    type: 'string',
    default: '<RANDOM_STR>',
  },
};

const diarySchema: Schema<GenreInterface> = {
  folderPath: {
    type: 'string',
    default: '/content/diary/',
  },
  title: {
    type: 'string',
    default: '<TODAY_DATE>の日記',
  },
  datetime: {
    type: 'string',
    default: '<TODAY_DATETIME>',
  },
  author: {
    type: 'string',
    default: 'Anonymous',
  },
  category: {
    type: 'array',
    default: ['diary'],
  },
  folderName: {
    type: 'string',
    default: '<TODAY_DATE8D>',
  },
};

const schema: Schema<ProjectConfigInterface> = {
  article: {
    type: ['object', 'null'],
    properties: articleSchema,
    default: {
      folderPath: articleSchema.folderPath.default,
      title: articleSchema.title.default,
      datetime: articleSchema.datetime.default,
      author: articleSchema.author.default,
      category: articleSchema.category.default,
      folderName: articleSchema.folderName.default,
    },
  },
  diary: {
    type: ['object', 'null'],
    properties: diarySchema,
    default: {
      folderPath: diarySchema.folderPath.default,
      title: diarySchema.title.default,
      datetime: diarySchema.datetime.default,
      author: diarySchema.author.default,
      category: diarySchema.category.default,
      folderName: diarySchema.folderName.default,
    },
  },
  tags: {
    type: 'array',
    default: ['general'],
  },
  authors: {
    type: 'array',
    default: ['Anonymous'],
  },
  recentlyOpenFiles: {
    type: 'array',
    default: [],
  },
  categories: {
    type: 'array',
    default: [articleSchema.category.default, diarySchema.category.default],
  },
  customSchema: {
    type: 'array',
    default: [],
  },
  customFrontMatterValues: {
    type: 'array',
    default: [],
  },
};

export const openProjectConfigFile = (
  projectPath: string
): Store<ProjectConfigInterface> => {
  const workPath = `${projectPath}/.hugo-text-writer`;

  return new Store<ProjectConfigInterface>({
    name: 'project-config',
    cwd: workPath,
    schema,
  });
};
